# ADR-004: Repeated Artifact Submission Semantics

| | |
| --- | --- |
| **Status** | To Be Confirmed — interim planning assumption recorded below |
| **Resolves** | BD-004 (PLAN-0001 §4; doc 0010 §4) |
| **Gate** | Phase 3 exit (M3) — before FR-012 (artifact submission) exits the milestone |
| **Owner** | `deployment-service` owner (mock owner interim) |
| **Date** | 2026-07-01 |

## Context

Idempotent redelivery (FR-015) needs deterministic semantics for an identical artifact-pointer re-POST to `POST /internal/deployments/{deploymentId}/artifact`. The source lists two options — **idempotent accept** (200/201, same result) vs **benign conflict** (409 that the worker treats as success for an identical pointer) — and deliberately supplies no default. `deployment-service` does not exist yet; the mock is the interim authority.

## Interim planning assumption (per PLAN-0001 Appendix A.4)

**Idempotent accept**: an identical pointer re-POST (same `deploymentId`, same `manifestStorageKey`, same `manifestDigest`) returns success without side effects. A *different* pointer for a `deploymentId` that already has one is a hard conflict (the one-manifest-per-deployment invariant).

The mock (EW-LOCAL-002) encodes this assumption; EW-DEPLOY-004 codes against it. If the real `deployment-service` decision differs, the mock and the worker's submission module are the only touch points.

## Resolution required

- `deployment-service` owner confirms accept-vs-benign-conflict before M3 exit.
- On confirmation: update this ADR to Accepted, update the mock, and record the semantics in the OpenAPI document (EW-CONTRACT-003) — the required output artifacts of BD-004.

## References

- PLAN-0001 §4 (BD-004), §6 WS4 (EW-DEPLOY-004), WS13 (EW-LOCAL-002), Appendix A.4
- doc 0010 §4 (BD-004), §8 (artifact POST), FR-012, FR-015
