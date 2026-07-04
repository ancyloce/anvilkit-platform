// Package assetmock is the contract-conformant in-memory mock of the
// external asset-service internal API (FR-022, EW-LOCAL-003 — see
// contracts/openapi/v1/asset-service.internal.json): a deterministic
// resolve-batch resolver with auth-rejection modes.
package assetmock

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/ancyloce/anvilkit-export-worker/contracts/assetservice"
)

// Failure modes drivable via POST /__mock/control.
const (
	FailNone    = "none"
	FailTimeout = "timeout"
	Fail500     = "http500"
	Fail401     = "http401"
	Fail403     = "http403"
)

// Server is one mock asset-service instance.
type Server struct {
	mu       sync.Mutex
	tokens   map[string]bool
	failMode string
	latency  time.Duration
}

// New builds a mock accepting the given bearer tokens (dual-token window).
func New(tokens ...string) *Server {
	accepted := map[string]bool{}
	for _, t := range tokens {
		if t != "" {
			accepted[t] = true
		}
	}
	return &Server{tokens: accepted, failMode: FailNone}
}

// Handler serves the contract route plus the /__mock/* control surface.
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
	mux.HandleFunc("POST /__mock/reset", func(w http.ResponseWriter, r *http.Request) {
		s.mu.Lock()
		s.failMode = FailNone
		s.latency = 0
		s.mu.Unlock()
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("POST /internal/assets/resolve-batch", s.guard(func(w http.ResponseWriter, r *http.Request) {
		var req assetservice.ResolveBatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid resolve-batch request", http.StatusBadRequest)
			return
		}
		if req.TeamID == "" || req.SiteID == "" {
			http.Error(w, "teamId and siteId are required", http.StatusBadRequest)
			return
		}
		resp := assetservice.ResolveBatchResponse{Assets: []assetservice.ResolvedAsset{}}
		for _, ref := range req.Refs {
			if !strings.HasPrefix(ref, "asset://") {
				http.Error(w, "refs must be asset:// references", http.StatusBadRequest)
				return
			}
			resp.Assets = append(resp.Assets, resolve(ref))
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}))

	return mux
}

// resolve maps one asset:// ref to a deterministic fake asset: same input,
// same output, across restarts — so harvest/idempotency tests are stable.
func resolve(ref string) assetservice.ResolvedAsset {
	sum := sha256.Sum256([]byte(ref))
	name := strings.TrimPrefix(ref, "asset://")
	return assetservice.ResolvedAsset{
		Ref:         ref,
		URL:         "https://assets.mock.anvilkit.dev/" + name + ".bin",
		MimeType:    "application/octet-stream",
		SizeBytes:   int64(len(ref)) * 1000,
		ContentHash: "sha256-" + hex.EncodeToString(sum[:]),
	}
}

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
