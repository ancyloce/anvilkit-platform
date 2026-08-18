package fakepagix

import (
	"context"
	"testing"
)

func command() Command {
	return Command{WorkspaceID: "workspace", Operation: "page-persistence", IdempotencyKey: "key", RequestDigest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", OperationID: "operation", AuthorizationID: "authorization", AuthorizationBytes: "signed", ExpectedRevision: "revision-1", ActionDigest: "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", ArtifactDigest: "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"}
}
func TestCASIdempotencyRedemptionEffectAndOutboxAreAtomic(t *testing.T) {
	fake := New()
	fake.Seed("workspace", 1)
	first, err := fake.Persist(context.Background(), command())
	if err != nil || first.Outcome != Applied || first.Revision != "revision-2" {
		t.Fatalf("first=%#v err=%v", first, err)
	}
	replay, err := fake.Persist(context.Background(), command())
	if err != nil || replay != first || fake.CommandCount() != 1 {
		t.Fatalf("replay=%#v commands=%d err=%v", replay, fake.CommandCount(), err)
	}
	changed := command()
	changed.RequestDigest = "sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
	if _, err := fake.Persist(context.Background(), changed); err == nil {
		t.Fatal("idempotency conflict accepted")
	}
	reuse := command()
	reuse.IdempotencyKey = "other"
	reuse.RequestDigest = "sha256:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
	reuse.AuthorizationBytes = "different"
	if _, err := fake.Persist(context.Background(), reuse); err == nil {
		t.Fatal("redemption substitution accepted")
	}
	substitute := command()
	substitute.IdempotencyKey = "substitute"
	substitute.RequestDigest = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
	substitute.AuthorizationID = "authorization-other"
	if _, err := fake.Persist(context.Background(), substitute); err == nil {
		t.Fatal("byte-identical authorization accepted under substituted identity")
	}
	effect, ok := fake.Effect("workspace", "operation")
	events := fake.Events()
	if !ok || effect != first || len(events) != 1 || events[0].OperationID != "operation" {
		t.Fatalf("effect=%#v event=%#v", effect, events)
	}
}
func TestRevisionConflictConsumesAuthorization(t *testing.T) {
	fake := New()
	fake.Seed("workspace", 2)
	result, err := fake.Persist(context.Background(), command())
	if err != nil || result.Outcome != Conflict {
		t.Fatalf("result=%#v err=%v", result, err)
	}
	retry := command()
	retry.IdempotencyKey = "retry"
	retry.RequestDigest = "sha256:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
	retry.ExpectedRevision = "revision-2"
	if _, err := fake.Persist(context.Background(), retry); err == nil {
		t.Fatal("consumed authorization reused after conflict")
	}
	if fake.CommandCount() != 1 {
		t.Fatalf("duplicate commands=%d", fake.CommandCount())
	}
}

func TestAuthorizedSnapshotEntitlementAndFinancialLedger(t *testing.T) {
	fake := New()
	fake.SeedSnapshot(Snapshot{WorkspaceID: "workspace", TargetID: "page", BaseRevision: "revision-1", ArtifactID: "artifact", Digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"})
	if _, err := fake.Snapshot("workspace", "page", "", "actor"); err == nil {
		t.Fatal("snapshot without workload identity accepted")
	}
	if value, err := fake.Snapshot("workspace", "page", "spiffe://agent", "actor"); err != nil || value.BaseRevision != "revision-1" {
		t.Fatalf("snapshot=%#v err=%v", value, err)
	}
	fake.SetEntitlement("workspace", "actor", "agent.page.apply", true)
	if !fake.Entitled("workspace", "actor", "agent.page.apply", "spiffe://agent") {
		t.Fatal("entitlement missing")
	}
	reservation := Reservation{ID: "reservation", RootRunID: "root", Generation: 2, UpperBoundMicros: 100}
	reserved, err := fake.Reserve("workspace", "key", "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", reservation)
	if err != nil || reserved.ID != "reservation" {
		t.Fatalf("reserve=%#v err=%v", reserved, err)
	}
	if _, err := fake.Reserve("workspace", "key", "sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc", reservation); err == nil {
		t.Fatal("changed reservation replay accepted")
	}
	if err := fake.Observe(Usage{ID: "usage", ReservationID: "reservation", CostMicros: 40, Final: false}); err != nil {
		t.Fatal(err)
	}
	if _, err := fake.Reconcile("reservation", 2, 40, true); err == nil {
		t.Fatal("unfinalized reservation released")
	}
	if err := fake.Observe(Usage{ID: "usage-final", ReservationID: "reservation", CostMicros: 10, Final: true}); err != nil {
		t.Fatal(err)
	}
	if _, err := fake.Reconcile("reservation", 1, 50, true); err == nil {
		t.Fatal("stale generation reconciled")
	}
	settled, err := fake.Reconcile("reservation", 2, 50, true)
	if err != nil || !settled.Released || settled.UpperBoundMicros != 50 {
		t.Fatalf("settled=%#v err=%v", settled, err)
	}
}
