// Package fakepagix is a deterministic PRD 0013 stage-2a contract double.
// It owns no production command and exposes no database.
package fakepagix

import (
	"bytes"
	"context"
	"fmt"
	"sync"
)

type Command struct{ WorkspaceID, Operation, IdempotencyKey, RequestDigest, OperationID, AuthorizationID, AuthorizationBytes, ExpectedRevision, ActionDigest, ArtifactDigest string }
type Outcome string

const (
	Applied  Outcome = "applied"
	Conflict Outcome = "conflict"
)

type Result struct {
	Outcome                                         Outcome
	OperationID, AuthorizationID, Revision, EventID string
}
type Event struct {
	ID, WorkspaceID, OperationID, AuthorizationID string
	Outcome                                       Outcome
	Revision                                      string
}
type record struct {
	digest string
	result Result
}
type redemption struct {
	bytes  []byte
	result Result
}
type Snapshot struct{ WorkspaceID, TargetID, BaseRevision, ArtifactID, Digest string }
type Reservation struct {
	ID, WorkspaceID, RootRunID       string
	Generation                       uint64
	UpperBoundMicros, ObservedMicros int64
	Final, Released                  bool
}
type Usage struct {
	ID, ReservationID string
	CostMicros        int64
	Final             bool
}
type Fake struct {
	lock               sync.Mutex
	revisions          map[string]uint64
	idempotency        map[string]record
	effects            map[string]Result
	redemptions        map[string]redemption
	authorizationBytes map[string]string
	outbox             []Event
	commands           int
	snapshots          map[string]Snapshot
	entitlements       map[string]bool
	reservations       map[string]Reservation
	reservationKeys    map[string]record
	usage              map[string]Usage
}

func New() *Fake {
	return &Fake{revisions: map[string]uint64{}, idempotency: map[string]record{}, effects: map[string]Result{}, redemptions: map[string]redemption{}, authorizationBytes: map[string]string{}, snapshots: map[string]Snapshot{}, entitlements: map[string]bool{}, reservations: map[string]Reservation{}, reservationKeys: map[string]record{}, usage: map[string]Usage{}}
}
func (f *Fake) Seed(workspace string, revision uint64) {
	f.lock.Lock()
	defer f.lock.Unlock()
	f.revisions[workspace] = revision
}
func (f *Fake) SeedSnapshot(value Snapshot) {
	f.lock.Lock()
	defer f.lock.Unlock()
	f.snapshots[value.WorkspaceID+"\x00"+value.TargetID] = value
}
func (f *Fake) Snapshot(workspace, target, workloadIdentity, actor string) (Snapshot, error) {
	if workloadIdentity == "" || actor == "" {
		return Snapshot{}, fmt.Errorf("fakepagix: unauthorized snapshot")
	}
	f.lock.Lock()
	defer f.lock.Unlock()
	value, ok := f.snapshots[workspace+"\x00"+target]
	if !ok {
		return Snapshot{}, fmt.Errorf("fakepagix: snapshot not found")
	}
	return value, nil
}
func (f *Fake) SetEntitlement(workspace, actor, capability string, allowed bool) {
	f.lock.Lock()
	defer f.lock.Unlock()
	f.entitlements[workspace+"\x00"+actor+"\x00"+capability] = allowed
}
func (f *Fake) Entitled(workspace, actor, capability, workloadIdentity string) bool {
	if workloadIdentity == "" {
		return false
	}
	f.lock.Lock()
	defer f.lock.Unlock()
	return f.entitlements[workspace+"\x00"+actor+"\x00"+capability]
}
func (f *Fake) Reserve(workspace, key, digest string, value Reservation) (Reservation, error) {
	if workspace == "" || key == "" || !validDigest(digest) || value.ID == "" || value.RootRunID == "" || value.Generation == 0 || value.UpperBoundMicros < 1 {
		return Reservation{}, fmt.Errorf("fakepagix: invalid reservation")
	}
	f.lock.Lock()
	defer f.lock.Unlock()
	identity := workspace + "\x00reserve\x00" + key
	if prior, ok := f.reservationKeys[identity]; ok {
		if prior.digest != digest {
			return Reservation{}, fmt.Errorf("fakepagix: idempotency conflict")
		}
		return f.reservations[prior.result.OperationID], nil
	}
	if _, ok := f.reservations[value.ID]; ok {
		return Reservation{}, fmt.Errorf("fakepagix: reservation conflict")
	}
	value.WorkspaceID = workspace
	f.reservations[value.ID] = value
	f.reservationKeys[identity] = record{digest: digest, result: Result{OperationID: value.ID}}
	return value, nil
}
func (f *Fake) Observe(value Usage) error {
	if value.ID == "" || value.ReservationID == "" || value.CostMicros < 0 {
		return fmt.Errorf("fakepagix: invalid usage")
	}
	f.lock.Lock()
	defer f.lock.Unlock()
	if prior, ok := f.usage[value.ID]; ok {
		if prior != value {
			return fmt.Errorf("fakepagix: usage idempotency conflict")
		}
		return nil
	}
	reservation, ok := f.reservations[value.ReservationID]
	if !ok {
		return fmt.Errorf("fakepagix: reservation not found")
	}
	if reservation.ObservedMicros > reservation.UpperBoundMicros-value.CostMicros {
		return fmt.Errorf("fakepagix: usage exceeds reservation")
	}
	reservation.ObservedMicros += value.CostMicros
	reservation.Final = reservation.Final || value.Final
	f.reservations[value.ReservationID] = reservation
	f.usage[value.ID] = value
	return nil
}
func (f *Fake) Reconcile(id string, generation uint64, finalCost int64, release bool) (Reservation, error) {
	f.lock.Lock()
	defer f.lock.Unlock()
	value, ok := f.reservations[id]
	if !ok || generation != value.Generation || !value.Final || finalCost < value.ObservedMicros || finalCost > value.UpperBoundMicros {
		return Reservation{}, fmt.Errorf("fakepagix: reconciliation fence failed")
	}
	value.ObservedMicros = finalCost
	value.UpperBoundMicros = finalCost
	value.Released = release
	f.reservations[id] = value
	return value, nil
}
func (f *Fake) Persist(ctx context.Context, command Command) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	if command.WorkspaceID == "" || command.Operation != "page-persistence" || command.IdempotencyKey == "" || !validDigest(command.RequestDigest) || command.OperationID == "" || command.AuthorizationID == "" || len(command.AuthorizationBytes) == 0 || command.ExpectedRevision == "" || !validDigest(command.ActionDigest) || !validDigest(command.ArtifactDigest) {
		return Result{}, fmt.Errorf("fakepagix: invalid command")
	}
	f.lock.Lock()
	defer f.lock.Unlock()
	key := command.WorkspaceID + "\x00" + command.Operation + "\x00" + command.IdempotencyKey
	if prior, ok := f.idempotency[key]; ok {
		if prior.digest != command.RequestDigest {
			return Result{}, fmt.Errorf("fakepagix: idempotency conflict")
		}
		return prior.result, nil
	}
	redemptionKey := "urn:anvilkit:issuer:agent-service\x00" + command.AuthorizationID
	if priorKey, ok := f.authorizationBytes[command.AuthorizationBytes]; ok && priorKey != redemptionKey {
		return Result{}, fmt.Errorf("fakepagix: authorization identity substitution")
	}
	if prior, ok := f.redemptions[redemptionKey]; ok {
		if !bytes.Equal(prior.bytes, []byte(command.AuthorizationBytes)) {
			return Result{}, fmt.Errorf("fakepagix: authorization redemption conflict")
		}
		return Result{}, fmt.Errorf("fakepagix: authorization already consumed by operation %s", prior.result.OperationID)
	}
	f.commands++
	current := f.revisions[command.WorkspaceID]
	expected := fmt.Sprintf("revision-%d", current)
	result := Result{OperationID: command.OperationID, AuthorizationID: command.AuthorizationID}
	if command.ExpectedRevision != expected {
		result.Outcome = Conflict
		result.Revision = expected
	} else {
		current++
		f.revisions[command.WorkspaceID] = current
		result.Outcome = Applied
		result.Revision = fmt.Sprintf("revision-%d", current)
	}
	result.EventID = "event-" + command.OperationID
	f.idempotency[key] = record{command.RequestDigest, result}
	f.effects[command.WorkspaceID+"\x00"+command.OperationID] = result
	f.redemptions[redemptionKey] = redemption{append([]byte(nil), command.AuthorizationBytes...), result}
	f.authorizationBytes[command.AuthorizationBytes] = redemptionKey
	f.outbox = append(f.outbox, Event{result.EventID, command.WorkspaceID, command.OperationID, command.AuthorizationID, result.Outcome, result.Revision})
	return result, nil
}
func (f *Fake) Effect(workspace, operation string) (Result, bool) {
	f.lock.Lock()
	defer f.lock.Unlock()
	value, ok := f.effects[workspace+"\x00"+operation]
	return value, ok
}
func (f *Fake) Events() []Event {
	f.lock.Lock()
	defer f.lock.Unlock()
	return append([]Event(nil), f.outbox...)
}
func (f *Fake) CommandCount() int { f.lock.Lock(); defer f.lock.Unlock(); return f.commands }
func validDigest(value string) bool {
	if len(value) != 71 || value[:7] != "sha256:" {
		return false
	}
	for _, character := range value[7:] {
		if (character < '0' || character > '9') && (character < 'a' || character > 'f') {
			return false
		}
	}
	return true
}
