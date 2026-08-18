package fakeworker_test

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/ancyloce/anvilkit-platform/mocks/fakeworker"
)

var now = time.Date(2026, 8, 9, 12, 0, 0, 0, time.UTC)

func fence(recovery, generation, lease int64, attempt string) fakeworker.Fence {
	return fakeworker.Fence{RecoveryEpoch: recovery, ExecutionGeneration: generation, PhysicalAttemptID: attempt, LeaseEpoch: lease, ExpiresAt: now.Add(time.Minute)}
}

func TestStateChangingFenceMatrix(t *testing.T) {
	active := fence(2, 3, 4, "attempt-winning")
	cases := []struct {
		name   string
		mutate func(fakeworker.Fence) fakeworker.Fence
		want   error
	}{
		{"winning", func(f fakeworker.Fence) fakeworker.Fence { return f }, nil},
		{"recovery", func(f fakeworker.Fence) fakeworker.Fence { f.RecoveryEpoch--; return f }, fakeworker.ErrStaleFence},
		{"generation", func(f fakeworker.Fence) fakeworker.Fence { f.ExecutionGeneration--; return f }, fakeworker.ErrStaleFence},
		{"physical-attempt", func(f fakeworker.Fence) fakeworker.Fence { f.PhysicalAttemptID = "attempt-losing"; return f }, fakeworker.ErrStaleFence},
		{"lease", func(f fakeworker.Fence) fakeworker.Fence { f.LeaseEpoch--; return f }, fakeworker.ErrStaleFence},
		{"expired", func(f fakeworker.Fence) fakeworker.Fence { f.ExpiresAt = now; return f }, fakeworker.ErrLeaseExpired},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := fakeworker.New(active).AcceptResult(tc.mutate(active), now)
			if !errors.Is(got, tc.want) {
				t.Fatalf("got %v want %v", got, tc.want)
			}
		})
	}
	w := fakeworker.New(active)
	w.Restore(3)
	if !errors.Is(w.AcceptResult(active, now), fakeworker.ErrStaleFence) {
		t.Fatal("pre-restore result accepted")
	}
	cancelled := fakeworker.New(active)
	cancelled.Cancel()
	if !errors.Is(cancelled.AcceptResult(active, now), fakeworker.ErrCancelled) {
		t.Fatal("cancelled result accepted")
	}
}

func TestAllAttemptUsageNoUndercountAndDeduplication(t *testing.T) {
	w := fakeworker.New(fence(2, 3, 4, "winning"))
	cases := []fakeworker.Usage{
		{ProviderRequestID: "p1", ObservationID: "o1", PhysicalAttemptID: "winning", Units: 10, Final: true},
		{ProviderRequestID: "p2", ObservationID: "o2", PhysicalAttemptID: "losing", Units: 7, Final: true},
		{ProviderRequestID: "p3", ObservationID: "o3", PhysicalAttemptID: "stale", Units: 5, Final: false},
		{ProviderRequestID: "p4", ObservationID: "o4", PhysicalAttemptID: "pre-restore", Units: 3, Final: true},
		{ProviderRequestID: "p5", ObservationID: "o5", PhysicalAttemptID: "fallback", Units: 11, Final: true},
	}
	for _, usage := range cases {
		if err := w.ObserveUsage(usage); err != nil {
			t.Fatal(err)
		}
	}
	if got := w.UsageTotal(); got != 36 {
		t.Fatalf("usage=%d", got)
	}
	if !errors.Is(w.ObserveUsage(cases[0]), fakeworker.ErrUsageDuplicate) {
		t.Fatal("duplicate usage accepted")
	}
	providerReplay := cases[1]
	providerReplay.ObservationID = "other-observation"
	if !errors.Is(w.ObserveUsage(providerReplay), fakeworker.ErrUsageDuplicate) {
		t.Fatal("provider billing identity did not deduplicate")
	}
	if got := w.UsageTotal(); got != 36 {
		t.Fatalf("duplicate changed usage=%d", got)
	}
}

func TestArtifactLifecycleAndWinningFencePromotion(t *testing.T) {
	active := fence(1, 1, 1, "winner")
	w := fakeworker.New(active)
	a := fakeworker.Artifact{Digest: "sha256:artifact", State: fakeworker.ArtifactPending, Producer: active, ContractBomDigest: "sha256:bom", ParentDigests: []string{"sha256:parent"}}
	if err := w.PutArtifact(a); err != nil {
		t.Fatal(err)
	}
	if _, err := w.ReadArtifact(a.Digest); !errors.Is(err, fakeworker.ErrArtifactDenied) {
		t.Fatal("pending readable")
	}
	if err := w.TransitionArtifact(a.Digest, active, fakeworker.ArtifactScanning); err != nil {
		t.Fatal(err)
	}
	loser := active
	loser.PhysicalAttemptID = "loser"
	if !errors.Is(w.TransitionArtifact(a.Digest, loser, fakeworker.ArtifactAvailable), fakeworker.ErrStaleFence) {
		t.Fatal("loser promoted")
	}
	if err := w.TransitionArtifact(a.Digest, active, fakeworker.ArtifactAvailable); err != nil {
		t.Fatal(err)
	}
	if _, err := w.ReadArtifact(a.Digest); err != nil {
		t.Fatal(err)
	}
	if err := w.TransitionArtifact(a.Digest, active, fakeworker.ArtifactRevoked); err != nil {
		t.Fatal(err)
	}
	if _, err := w.ReadArtifact(a.Digest); !errors.Is(err, fakeworker.ErrArtifactDenied) {
		t.Fatal("revoked readable")
	}
}

func TestAPIEventConcurrencyTraceAndResnapshot(t *testing.T) {
	w := fakeworker.New(fence(1, 1, 1, "winner"))
	body := []byte(`{"a":1}`)
	if out, err := w.RecordRequest("apply", "key", body, "accepted"); err != nil || out != "accepted" {
		t.Fatal(out, err)
	}
	if out, err := w.RecordRequest("apply", "key", body, "ignored"); err != nil || out != "accepted" {
		t.Fatal("replay differs")
	}
	if _, err := w.RecordRequest("apply", "key", []byte(`{"a":2}`), "accepted"); !errors.Is(err, fakeworker.ErrIdempotencyConflict) {
		t.Fatal("conflict not rejected")
	}
	e1 := fakeworker.Event{ID: "event-1", Sequence: 1, Bytes: []byte(`{"id":1}`), TraceParent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"}
	if err := w.DeliverEvent(e1); err != nil {
		t.Fatal(err)
	}
	if err := w.DeliverEvent(e1); err != nil {
		t.Fatal("byte-identical duplicate")
	}
	if err := w.DeliverEvent(fakeworker.Event{ID: "event-3", Sequence: 3, Bytes: []byte(`{}`), TraceParent: e1.TraceParent}); !errors.Is(err, fakeworker.ErrSequenceGap) {
		t.Fatal("gap did not resnapshot")
	}

	concurrent := fakeworker.New(fence(1, 1, 1, "winner"))
	var accepted int
	var conflicts int
	var mu sync.Mutex
	var wait sync.WaitGroup
	for i := 0; i < 32; i++ {
		wait.Add(1)
		go func(index int) {
			defer wait.Done()
			bytes := body
			if index%2 == 1 {
				bytes = []byte(`{"a":2}`)
			}
			_, err := concurrent.RecordRequest("redeem", "authorization-1", bytes, "accepted")
			mu.Lock()
			defer mu.Unlock()
			if err == nil {
				accepted++
			} else if errors.Is(err, fakeworker.ErrIdempotencyConflict) {
				conflicts++
			}
		}(i)
	}
	wait.Wait()
	if accepted != 16 || conflicts != 16 {
		t.Fatalf("accepted=%d conflicts=%d", accepted, conflicts)
	}
}

func TestDescriptorCannotBePromoted(t *testing.T) {
	d := fakeworker.Descriptor()
	if !d.TestInfrastructureOnly || d.ProductionPromotionAllowed || len(d.Capabilities) != 8 || len(d.ExecutionCapabilities) != 1 || d.ExecutionCapabilities[0] != "fake.execute" {
		t.Fatalf("descriptor=%+v", d)
	}
}

func TestDeclaredCapabilityImmutableInputCumulativeUsageCancelAndDrain(t *testing.T) {
	active := fence(1, 1, 1, "attempt")
	worker := fakeworker.New(active)
	input := []byte("immutable")
	sum := sha256.Sum256(input)
	digest := "sha256:" + hex.EncodeToString(sum[:])
	result, err := worker.Execute(fakeworker.ExecuteRequest{Capability: "fake.execute", InputDigest: digest, Input: input, Fence: active})
	if err != nil || result.InputDigest != digest || result.OutputDigest == "" {
		t.Fatalf("result=%#v err=%v", result, err)
	}
	changed := append([]byte(nil), input...)
	changed[0] = 'X'
	if _, err := worker.Execute(fakeworker.ExecuteRequest{Capability: "fake.execute", InputDigest: digest, Input: changed, Fence: active}); !errors.Is(err, fakeworker.ErrArtifactDenied) {
		t.Fatal("mutated input executed")
	}
	if _, err := worker.Execute(fakeworker.ExecuteRequest{Capability: "provider.invoke", InputDigest: digest, Input: input, Fence: active}); !errors.Is(err, fakeworker.ErrCapabilityDenied) {
		t.Fatal("undeclared capability executed")
	}
	if err := worker.ObserveCumulativeUsage(fakeworker.Usage{ObservationID: "1", PhysicalAttemptID: "attempt", Units: 10}); err != nil {
		t.Fatal(err)
	}
	if err := worker.ObserveCumulativeUsage(fakeworker.Usage{ObservationID: "2", PhysicalAttemptID: "attempt", Units: 15}); err != nil {
		t.Fatal(err)
	}
	if worker.UsageTotal() != 15 {
		t.Fatalf("cumulative total=%d", worker.UsageTotal())
	}
	worker.Drain()
	if _, err := worker.Execute(fakeworker.ExecuteRequest{Capability: "fake.execute", InputDigest: digest, Input: input, Fence: active}); err == nil {
		t.Fatal("draining worker accepted")
	}
	cancelled := fakeworker.New(active)
	cancelled.Cancel()
	if _, err := cancelled.Execute(fakeworker.ExecuteRequest{Capability: "fake.execute", InputDigest: digest, Input: input, Fence: active}); !errors.Is(err, fakeworker.ErrCancelled) {
		t.Fatal("cancelled worker accepted")
	}
}

func TestFenceExpiryUsageAndArtifactIdentityCannotBeForged(t *testing.T) {
	active := fence(1, 1, 1, "attempt")
	worker := fakeworker.New(active)
	extended := active
	extended.ExpiresAt = active.ExpiresAt.Add(time.Hour)
	if err := worker.AcceptResult(extended, active.ExpiresAt.Add(time.Second)); !errors.Is(err, fakeworker.ErrStaleFence) {
		t.Fatalf("extended lease result=%v", err)
	}
	if err := worker.ObserveUsage(fakeworker.Usage{ObservationID: "negative", PhysicalAttemptID: "attempt", Units: -1}); !errors.Is(err, fakeworker.ErrUsageInvalid) {
		t.Fatalf("negative usage=%v", err)
	}
	artifact := fakeworker.Artifact{Digest: "sha256:artifact", State: fakeworker.ArtifactPending, Producer: active, ParentDigests: []string{"one"}}
	if err := worker.PutArtifact(artifact); err != nil {
		t.Fatal(err)
	}
	changed := artifact
	changed.ParentDigests = []string{"two"}
	if err := worker.PutArtifact(changed); !errors.Is(err, fakeworker.ErrIdempotencyConflict) {
		t.Fatalf("changed artifact replay=%v", err)
	}
}
