# Architecture Decision Records

ADR IDs follow the backlog in `docs/plans/0001-export-worker-implementation-roadmap-0701-1707.md` §13. Statuses here are the live Phase 0 decision-gate tracker (PLAN-0001 §4); AC-020 requires every BD documented and either resolved or explicitly To Be Confirmed with an owner — re-check this table at every milestone review.

## Phase 0 blocking decisions (BD-001..BD-009)

| BD | ADR | Decision | Status (2026-07-01) | Gate it clears |
| --- | --- | --- | --- | --- |
| BD-008 | [ADR-008](ADR-008-cicd-platform-and-deployment-target.md) | CI/CD: GitHub Actions + GHCR; target: Kubernetes (cluster/provider deferred to first deploy) | **Accepted** (assumption-based; DevOps confirm at M1 review) | **Phase 1 start — unblocked** |
| BD-001 | [ADR-001](ADR-001-outbound-event-schemas.md) | Minimum outbound schemas; omit `routes[]` from `deployment.artifact.ready` | Default adopted (Proposed) — freeze + `cdn-service` sign-off at M1 exit | Phase 1 exit (contracts frozen) |
| BD-002 | [ADR-002](ADR-002-internal-service-authentication-contract.md) | Bearer `INTERNAL_SERVICE_TOKEN`; dual-token rotation; per-service 401/403 codes | **Accepted as ADR-backed default** | Phase 2 start — unblocked |
| BD-003 | [ADR-003](ADR-003-redis-retry-and-dlq-mechanics.md) | Five-mechanism model; Hash + ZSET delayed retry; `retryEnvelopeId` idempotency; write-then-ack | **Accepted as ADR-backed default** | Phase 2 start — unblocked |
| BD-004 | [ADR-004](ADR-004-repeated-artifact-submission-semantics.md) | Identical pointer re-POST semantics; interim assumption: idempotent accept | To Be Confirmed (owner: `deployment-service` owner; mock owner interim) | Phase 3 exit |
| BD-005 | [ADR-005](ADR-005-outbox-vs-duplicate-ready-events.md) | CAS-then-emit, no outbox; duplicate-tolerant consumers keyed by `deploymentId` | Default accepted for worker build; full resolution gates `cdn-service` tests (AC-034) | Before `cdn-service` integration tests |
| BD-006 | [ADR-006](ADR-006-secret-management-and-token-rotation.md) | K8s Secrets + GitHub Actions secrets; dual-token rotation drill | Proposed — confirm before first deployed environment | Phase 2 first deployed environment |
| BD-007 | [ADR-007](ADR-007-local-render-origin-integration-mode.md) | Compose service for render-origin; published image pinned by tag; seeding contract | Proposed — confirm with studio owners before Phase 3 | Phase 3 (render fetch) |
| BD-009 | [ADR-009](ADR-009-preview-snapshot-contract.md) | Immutable preview snapshots (upstream capability) | **Blocked (external)** — tracked; preview E2E acceptance deferred (AC-030) | Preview E2E acceptance only |

## Other decisions

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-015](ADR-015-service-naming-alignment.md) | Service naming: `anvilkit-render-worker` → `anvilkit-export-worker` on every surface | **Accepted** |
| ADR-010 (demo guard mechanism), ADR-011 (retention/replay), ADR-012 (K8s sizing/scaling), ADR-013 (rate-limit guardrails), ADR-014 (load-test driver) | Backlog — see PLAN-0001 §13 | Not yet drafted (due M2–M5) |

## Preserved hard gates (source conditional baseline — PLAN-0001 §4)

1. Phase 1 starts only after BD-008 — **satisfied** (ADR-008).
2. Contracts must not exit Phase 1 until BD-001 is resolved (incl. `routes[]`) — default adopted; freeze due at M1 exit.
3. Phase 2 runtime work starts only with BD-002 and BD-003 resolved or ADR-backed — **satisfied** (ADR-002, ADR-003).
4. `cdn-service` integration tests start only after BD-005 fully resolved (AC-034).
5. Preview E2E acceptance remains blocked by BD-009 (AC-030).
6. Broad rollout additionally requires the FR-023 guardrail revisit (OQ-4/ADR-013) and the manual artifact cleanup runbook (AC-032).
