# ADR-005: Outbox vs Duplicate `deployment.artifact.ready` Events

| | |
| --- | --- |
| **Status** | Default accepted for worker build (CAS-then-emit); full resolution required before any `cdn-service` integration tests (AC-034) |
| **Resolves** | BD-005 (PLAN-0001 §4; doc 0010 §4, §12) |
| **Gate** | Before `cdn-service` integration tests start (M5 gate); worker-side emitter (FR-013) may proceed now on this default |
| **Owner** | Backend architecture |
| **Date** | 2026-07-01 |

## Context

The choice determines emitter ordering and every consumer's idempotency obligation. The outbox branch would move event emission from the worker to `deployment-service`, conflicting with PRD 0008 FR-012 (the worker emits `deployment.artifact.ready`) unless that PRD is amended.

## Decision (default accepted for build)

**CAS-then-emit, no outbox in MVP:**

1. The worker CAS-transitions status to `ARTIFACT_READY`, **then** emits `deployment.artifact.ready`. Emission is at-least-once.
2. A crash between CAS and emit yields a redelivered message that hits the idempotency rule "`ARTIFACT_READY` + manifest exists → success, ack without re-render", and the emit is repeated.
3. Therefore **all consumers of `deployment.artifact.ready` must be duplicate-tolerant, keyed by `deploymentId`** — `cdn-service` foremost. This consumption contract must be documented and shared with the `cdn-service` owner (EW-XREPO-006) before its integration tests start.

This default avoids the PRD 0008 FR-012 conflict and keeps the worker stateless (no outbox table — the worker owns no database).

## Consequences

- EW-EVENT-001 builds the emitter on this ordering now; risk R-07 (duplicate ready events) is accepted by design and mitigated consumer-side.
- Full resolution (this ADR → Accepted, or a reversal to outbox with a PRD 0008 amendment) is a hard gate for AC-034; EW-XREPO-006 is the gatekeeper task.

## References

- PLAN-0001 §4 (BD-005), §6 WS9 (EW-EVENT-001), WS15 (EW-XREPO-006), §12 (R-07)
- doc 0010 §4 (BD-005), §12 (transactions and consistency); PRD 0008 FR-012
