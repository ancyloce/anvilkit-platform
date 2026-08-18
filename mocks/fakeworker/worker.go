// Package fakeworker is deterministic PLAN-0003 M6 test infrastructure. It
// models worker fencing, all-attempt usage, artifact lifecycle, idempotency,
// event sequencing, and trace propagation; it is not a production worker.
package fakeworker

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math"
	"reflect"
	"sync"
	"time"
)

var (
	ErrStaleFence          = errors.New("fakeworker: stale fence")
	ErrCapabilityDenied    = errors.New("fakeworker: undeclared capability")
	ErrCancelled           = errors.New("fakeworker: cancelled")
	ErrDraining            = errors.New("fakeworker: draining")
	ErrLeaseExpired        = errors.New("fakeworker: lease expired")
	ErrUsageDuplicate      = errors.New("fakeworker: usage duplicate")
	ErrIdempotencyConflict = errors.New("fakeworker: idempotency conflict")
	ErrSequenceGap         = errors.New("fakeworker: sequence gap requires resnapshot")
	ErrArtifactDenied      = errors.New("fakeworker: artifact access denied")
	ErrUsageInvalid        = errors.New("fakeworker: invalid usage")
)

type Fence struct {
	RecoveryEpoch       int64
	ExecutionGeneration int64
	PhysicalAttemptID   string
	LeaseEpoch          int64
	ExpiresAt           time.Time
}

func (f Fence) Equal(other Fence) bool {
	return f.RecoveryEpoch == other.RecoveryEpoch && f.ExecutionGeneration == other.ExecutionGeneration && f.PhysicalAttemptID == other.PhysicalAttemptID && f.LeaseEpoch == other.LeaseEpoch && f.ExpiresAt.Equal(other.ExpiresAt)
}

type Usage struct {
	ProviderRequestID string
	ObservationID     string
	PhysicalAttemptID string
	Units             int64
	Final             bool
}

type ArtifactState string

const (
	ArtifactPending     ArtifactState = "pending"
	ArtifactScanning    ArtifactState = "scanning"
	ArtifactAvailable   ArtifactState = "available"
	ArtifactQuarantined ArtifactState = "quarantined"
	ArtifactRevoked     ArtifactState = "revoked"
	ArtifactDeleted     ArtifactState = "deleted"
)

type Artifact struct {
	Digest            string
	State             ArtifactState
	Producer          Fence
	ContractBomDigest string
	ParentDigests     []string
}

type Event struct {
	ID          string
	Sequence    int64
	Bytes       []byte
	TraceParent string
}

type Worker struct {
	mu          sync.Mutex
	active      Fence
	cancelled   bool
	committed   bool
	usage       map[string]Usage
	usageTotal  int64
	highWater   map[string]int64
	draining    bool
	artifacts   map[string]Artifact
	idempotency map[string]struct {
		digest  string
		outcome string
	}
	events       map[string]Event
	lastSequence int64
}

func New(active Fence) *Worker {
	return &Worker{active: active, usage: make(map[string]Usage), highWater: make(map[string]int64), artifacts: make(map[string]Artifact), idempotency: make(map[string]struct {
		digest  string
		outcome string
	}), events: make(map[string]Event)}
}

func (w *Worker) Restore(nextRecoveryEpoch int64) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.active.RecoveryEpoch = nextRecoveryEpoch
	w.active.ExecutionGeneration++
	w.active.LeaseEpoch = 1
	w.committed = false
}

func (w *Worker) Cancel() { w.mu.Lock(); w.cancelled = true; w.mu.Unlock() }
func (w *Worker) Drain()  { w.mu.Lock(); w.draining = true; w.mu.Unlock() }

type ExecuteRequest struct {
	Capability, InputDigest string
	Input                   []byte
	Fence                   Fence
}
type ExecuteResult struct {
	InputDigest, OutputDigest string
	Fence                     Fence
}

func (w *Worker) Execute(request ExecuteRequest) (ExecuteResult, error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	if w.cancelled {
		return ExecuteResult{}, ErrCancelled
	}
	if w.draining {
		return ExecuteResult{}, ErrDraining
	}
	if request.Capability != Descriptor().ExecutionCapabilities[0] {
		return ExecuteResult{}, ErrCapabilityDenied
	}
	if !request.Fence.Equal(w.active) {
		return ExecuteResult{}, ErrStaleFence
	}
	sum := sha256.Sum256(request.Input)
	digest := "sha256:" + hex.EncodeToString(sum[:])
	if digest != request.InputDigest {
		return ExecuteResult{}, ErrArtifactDenied
	}
	output := sha256.Sum256(append([]byte("fake.execute:"), request.Input...))
	return ExecuteResult{digest, "sha256:" + hex.EncodeToString(output[:]), request.Fence}, nil
}

func (w *Worker) AcceptResult(fence Fence, now time.Time) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if w.cancelled {
		return ErrCancelled
	}
	if !now.Before(fence.ExpiresAt) {
		return ErrLeaseExpired
	}
	if !fence.Equal(w.active) {
		return ErrStaleFence
	}
	if w.committed {
		return nil
	}
	w.committed = true
	return nil
}

func usageKey(usage Usage) string {
	if usage.ProviderRequestID != "" {
		return "provider\x00" + usage.ProviderRequestID
	}
	return "attempt\x00" + usage.PhysicalAttemptID + "\x00" + usage.ObservationID
}

// ObserveUsage accepts all attempts independently of the current state fence.
func (w *Worker) ObserveUsage(usage Usage) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if usage.ObservationID == "" || usage.PhysicalAttemptID == "" || usage.Units < 0 || w.usageTotal > math.MaxInt64-usage.Units {
		return ErrUsageInvalid
	}
	key := usageKey(usage)
	if _, ok := w.usage[key]; ok {
		return ErrUsageDuplicate
	}
	w.usage[key] = usage
	w.usageTotal += usage.Units
	if usage.Units > w.highWater[usage.PhysicalAttemptID] {
		w.highWater[usage.PhysicalAttemptID] = usage.Units
	}
	return nil
}
func (w *Worker) ObserveCumulativeUsage(usage Usage) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if usage.ObservationID == "" || usage.PhysicalAttemptID == "" || usage.Units < 0 {
		return ErrUsageInvalid
	}
	key := usageKey(usage)
	if _, ok := w.usage[key]; ok {
		return ErrUsageDuplicate
	}
	previous := w.highWater[usage.PhysicalAttemptID]
	if usage.Units < previous {
		return errors.New("fakeworker: cumulative usage regressed")
	}
	w.usage[key] = usage
	delta := usage.Units - previous
	if w.usageTotal > math.MaxInt64-delta {
		return ErrUsageInvalid
	}
	w.usageTotal += delta
	w.highWater[usage.PhysicalAttemptID] = usage.Units
	return nil
}

func (w *Worker) UsageTotal() int64 { w.mu.Lock(); defer w.mu.Unlock(); return w.usageTotal }

func (w *Worker) PutArtifact(artifact Artifact) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if existing, ok := w.artifacts[artifact.Digest]; ok {
		if !reflect.DeepEqual(existing, artifact) {
			return ErrIdempotencyConflict
		}
		return nil
	}
	if artifact.Digest == "" || artifact.State != ArtifactPending {
		return fmt.Errorf("%w: initial state", ErrArtifactDenied)
	}
	w.artifacts[artifact.Digest] = artifact
	return nil
}

func (w *Worker) TransitionArtifact(digest string, fence Fence, next ArtifactState) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	artifact, ok := w.artifacts[digest]
	if !ok {
		return ErrArtifactDenied
	}
	if (next == ArtifactAvailable || next == ArtifactDeleted) && !fence.Equal(w.active) {
		return ErrStaleFence
	}
	allowed := map[ArtifactState]map[ArtifactState]bool{
		ArtifactPending:     {ArtifactScanning: true, ArtifactQuarantined: true},
		ArtifactScanning:    {ArtifactAvailable: true, ArtifactQuarantined: true},
		ArtifactAvailable:   {ArtifactRevoked: true, ArtifactDeleted: true},
		ArtifactQuarantined: {ArtifactDeleted: true}, ArtifactRevoked: {ArtifactDeleted: true},
	}
	if !allowed[artifact.State][next] {
		return ErrArtifactDenied
	}
	artifact.State = next
	w.artifacts[digest] = artifact
	return nil
}

func (w *Worker) ReadArtifact(digest string) (Artifact, error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	artifact, ok := w.artifacts[digest]
	if !ok || artifact.State != ArtifactAvailable {
		return Artifact{}, ErrArtifactDenied
	}
	return artifact, nil
}

func (w *Worker) RecordRequest(operation, key string, bytes []byte, outcome string) (string, error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	digestBytes := sha256.Sum256(bytes)
	digest := "sha256:" + hex.EncodeToString(digestBytes[:])
	scoped := operation + "\x00" + key
	if previous, ok := w.idempotency[scoped]; ok {
		if previous.digest != digest {
			return "", ErrIdempotencyConflict
		}
		return previous.outcome, nil
	}
	w.idempotency[scoped] = struct {
		digest  string
		outcome string
	}{digest, outcome}
	return outcome, nil
}

func (w *Worker) DeliverEvent(event Event) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	if previous, ok := w.events[event.ID]; ok {
		if string(previous.Bytes) != string(event.Bytes) || previous.Sequence != event.Sequence {
			return ErrIdempotencyConflict
		}
		return nil
	}
	if event.Sequence != w.lastSequence+1 {
		return ErrSequenceGap
	}
	if event.TraceParent == "" {
		return errors.New("fakeworker: trace context missing")
	}
	w.events[event.ID] = event
	w.lastSequence = event.Sequence
	return nil
}

type CapabilityDescriptor struct {
	Name                       string   `json:"name"`
	TestInfrastructureOnly     bool     `json:"testInfrastructureOnly"`
	ProductionPromotionAllowed bool     `json:"productionPromotionAllowed"`
	Capabilities               []string `json:"capabilities"`
	ExecutionCapabilities      []string `json:"executionCapabilities"`
}

func Descriptor() CapabilityDescriptor {
	return CapabilityDescriptor{Name: "anvilkit-fake-worker", TestInfrastructureOnly: true, ProductionPromotionAllowed: false, Capabilities: []string{"lease", "heartbeat", "result", "artifact", "usage", "cancellation", "retry", "trace"}, ExecutionCapabilities: []string{"fake.execute"}}
}
