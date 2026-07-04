// Package deploymentmock is the contract-conformant in-memory mock of the
// external deployment-service internal API (FR-022, EW-LOCAL-002 — see
// contracts/openapi/v1/deployment-service.internal.json). It encodes the
// BD-004 interim semantics (ADR-004): idempotent accept of an identical
// artifact-pointer re-POST, benign 409 conflict otherwise.
package deploymentmock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ancyloce/anvilkit-export-worker/contracts/deploymentservice"
)

// Failure modes drivable via POST /__mock/control (EW-LOCAL-002 DoD).
const (
	FailNone    = "none"
	FailTimeout = "timeout"
	Fail500     = "http500"
	Fail401     = "http401"
	Fail403     = "http403"
)

var validStatuses = map[deploymentservice.DeploymentStatus]bool{
	deploymentservice.DeploymentStatusPending:       true,
	deploymentservice.DeploymentStatusExportQueued:  true,
	deploymentservice.DeploymentStatusExporting:     true,
	deploymentservice.DeploymentStatusArtifactReady: true,
	deploymentservice.DeploymentStatusCdnUploading:  true,
	deploymentservice.DeploymentStatusCdnPurging:    true,
	deploymentservice.DeploymentStatusVerifying:     true,
	deploymentservice.DeploymentStatusActive:        true,
	deploymentservice.DeploymentStatusExportFailed:  true,
	deploymentservice.DeploymentStatusCancelled:     true,
}

// Server is one mock deployment-service instance.
type Server struct {
	mu        sync.Mutex
	records   map[string]*deploymentservice.DeploymentRecord
	artifacts map[string]json.RawMessage // canonical pointer JSON per deploymentId
	events    []deploymentservice.StatusUpdateRequest
	tokens    map[string]bool // accepted bearer tokens (dual-token window, ADR-002)
	failMode  string
	latency   time.Duration
}

// New builds a mock accepting the given bearer tokens.
func New(tokens ...string) *Server {
	accepted := map[string]bool{}
	for _, t := range tokens {
		if t != "" {
			accepted[t] = true
		}
	}
	return &Server{
		records:   map[string]*deploymentservice.DeploymentRecord{},
		artifacts: map[string]json.RawMessage{},
		tokens:    accepted,
		failMode:  FailNone,
	}
}

// Seed inserts or replaces a deployment record.
func (s *Server) Seed(rec deploymentservice.DeploymentRecord) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cp := rec
	s.records[rec.DeploymentID] = &cp
}

// Record returns a copy of the stored record, for test assertions.
func (s *Server) Record(deploymentID string) (deploymentservice.DeploymentRecord, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	rec, ok := s.records[deploymentID]
	if !ok {
		return deploymentservice.DeploymentRecord{}, false
	}
	return *rec, true
}

// Transitions returns every CAS applied, in order (audit stand-in for the
// real service's deployment_events).
func (s *Server) Transitions() []deploymentservice.StatusUpdateRequest {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]deploymentservice.StatusUpdateRequest(nil), s.events...)
}

// Handler serves the contract routes plus the /__mock/* control surface.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /__mock/control", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			FailMode  string `json:"failMode"`
			LatencyMs int    `json:"latencyMs"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		s.mu.Lock()
		if body.FailMode != "" {
			s.failMode = body.FailMode
		}
		s.latency = time.Duration(body.LatencyMs) * time.Millisecond
		s.mu.Unlock()
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("POST /__mock/seed", func(w http.ResponseWriter, r *http.Request) {
		var rec deploymentservice.DeploymentRecord
		if err := json.NewDecoder(r.Body).Decode(&rec); err != nil || rec.DeploymentID == "" {
			http.Error(w, "invalid deployment record", http.StatusBadRequest)
			return
		}
		s.Seed(rec)
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("POST /__mock/reset", func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		s.records = map[string]*deploymentservice.DeploymentRecord{}
		s.artifacts = map[string]json.RawMessage{}
		s.events = nil
		s.failMode = FailNone
		s.latency = 0
		s.mu.Unlock()
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("GET /internal/deployments/{deploymentId}", s.guard(func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		defer s.mu.Unlock()
		rec, ok := s.records[r.PathValue("deploymentId")]
		if !ok {
			http.NotFound(w, r)
			return
		}
		writeJSON(w, http.StatusOK, rec)
	}))

	mux.HandleFunc("PATCH /internal/deployments/{deploymentId}/status", s.guard(func(w http.ResponseWriter, r *http.Request) {
		var body deploymentservice.StatusUpdateRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, "invalid CAS body", http.StatusBadRequest)
			return
		}
		if !validStatuses[body.From] || !validStatuses[body.To] || body.Reason == "" || body.TraceID == "" {
			http.Error(w, "invalid CAS body: from/to/reason/traceId required", http.StatusBadRequest)
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		rec, ok := s.records[r.PathValue("deploymentId")]
		if !ok {
			http.NotFound(w, r)
			return
		}
		if rec.Status != body.From {
			writeJSON(w, http.StatusConflict, deploymentservice.StatusConflictError{
				ErrorCode: "STATUS_CONFLICT", CurrentStatus: rec.Status,
			})
			return
		}
		rec.Status = body.To
		s.events = append(s.events, body)
		w.WriteHeader(http.StatusNoContent)
	}))

	mux.HandleFunc("POST /internal/deployments/{deploymentId}/artifact", s.guard(func(w http.ResponseWriter, r *http.Request) {
		var raw json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
			http.Error(w, "invalid artifact pointer", http.StatusBadRequest)
			return
		}
		// Contract validation: required fields incl. the routes[]
		// always-an-array invariant (FR-012).
		var probe map[string]json.RawMessage
		if err := json.Unmarshal(raw, &probe); err != nil {
			http.Error(w, "invalid artifact pointer", http.StatusBadRequest)
			return
		}
		for _, field := range []string{"manifestStorageKey", "artifactBasePath", "manifestDigest", "entry", "filesCount", "totalBytes", "routes"} {
			if _, ok := probe[field]; !ok {
				http.Error(w, fmt.Sprintf("artifact pointer missing required field %s", field), http.StatusBadRequest)
				return
			}
		}
		var routes []json.RawMessage
		if err := json.Unmarshal(probe["routes"], &routes); err != nil {
			http.Error(w, "routes must be an array (FR-012 invariant)", http.StatusBadRequest)
			return
		}

		id := r.PathValue("deploymentId")
		s.mu.Lock()
		defer s.mu.Unlock()
		if _, ok := s.records[id]; !ok {
			http.NotFound(w, r)
			return
		}
		existing, has := s.artifacts[id]
		switch {
		case !has:
			s.artifacts[id] = raw
			w.WriteHeader(http.StatusNoContent)
		case jsonEqual(existing, raw):
			// BD-004 interim decision (ADR-004): idempotent accept.
			w.WriteHeader(http.StatusNoContent)
		default:
			// One deploymentId → at most one artifact manifest: a DIFFERENT
			// pointer re-POST is a conflict (shape To Be Confirmed, BD-004).
			writeJSON(w, http.StatusConflict, map[string]string{
				"error":   "ARTIFACT_CONFLICT",
				"message": "a different artifact pointer is already registered for this deployment",
			})
		}
	}))

	return mux
}

// guard enforces bearer auth (dual-token) and applies scripted failures.
func (s *Server) guard(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		mode, latency := s.failMode, s.latency
		s.mu.Unlock()
		if latency > 0 {
			time.Sleep(latency)
		}
		switch mode {
		case FailTimeout:
			// Hold the request well past any sane client timeout.
			time.Sleep(65 * time.Second)
			http.Error(w, "timed out", http.StatusGatewayTimeout)
			return
		case Fail500:
			http.Error(w, "injected internal error", http.StatusInternalServerError)
			return
		case Fail401:
			http.Error(w, "injected identity rejection", http.StatusUnauthorized)
			return
		case Fail403:
			http.Error(w, "injected refusal", http.StatusForbidden)
			return
		}
		token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		if !ok || !s.tokens[token] {
			http.Error(w, "missing or invalid service token", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func jsonEqual(a, b json.RawMessage) bool {
	var av, bv any
	if err := json.Unmarshal(a, &av); err != nil {
		return false
	}
	if err := json.Unmarshal(b, &bv); err != nil {
		return false
	}
	ab, _ := json.Marshal(av)
	bb, _ := json.Marshal(bv)
	return string(ab) == string(bb)
}
