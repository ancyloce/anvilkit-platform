# Architecture Decision Records

ADR IDs follow the backlog in `docs/plans/0001-export-worker-implementation-roadmap-0701-1707.md` §13. Statuses here are the live Phase 0 decision-gate tracker (PLAN-0001 §4); AC-020 requires every BD documented and either resolved or explicitly To Be Confirmed with an owner — re-check this table at every milestone review.

## Agent platform governance precedence

For the controlled Agent platform, accepted ADR-016 and ADR-018 through ADR-024 have the highest architecture-governance priority. Within that set, ADR-023 governs which documentation is tracked and how the local-only corpus is anchored, and ADR-024 decides only the Agent Service's instance-state shape — its boundary with ADR-022's evidence-driven topology rule is recorded as an amendment in both ADRs, and neither reopens the other. ADR-018 supersedes ADR-017. Those accepted ADRs take precedence over design 0001; design 0001 takes precedence over reconciled implementation designs 0002 through 0010; plans, runbooks, status and acceptance reports, and prior machine-readable governance evidence remain lower. A lower-authority artifact cannot restore first-party release generations, compatibility paths, migrations, or fallbacks rejected by the accepted ADRs. Existing Agent completion evidence is historical until regenerated against the canonical profile.

This precedence is scoped to the Agent platform. ADR-001 remains the governing decision for the already-frozen export-worker outbound contracts until a separate decision changes that boundary.

## Phase 0 blocking decisions (BD-001..BD-009)

| BD | ADR | Decision | Status (2026-07-01) | Gate it clears |
| --- | --- | --- | --- | --- |
| BD-008 | [ADR-008](ADR-008-cicd-platform-and-deployment-target.md) | CI/CD: GitHub Actions + GHCR; target: Kubernetes (cluster/provider deferred to first deploy) | **Accepted** (assumption-based; DevOps confirm at M1 review) | **Phase 1 start — unblocked** |
| BD-001 | [ADR-001](ADR-001-outbound-event-schemas.md) | Minimum outbound schemas; omit `routes[]` from `deployment.artifact.ready` | **Accepted** — schemas frozen at v1 (contracts.lock.json); `cdn-service` sign-off pending at M1 review | **Phase 1 exit — satisfied** |
| BD-002 | [ADR-002](ADR-002-internal-service-authentication-contract.md) | Bearer `INTERNAL_SERVICE_TOKEN`; dual-token rotation; per-service 401/403 codes | **Accepted as ADR-backed default** | Phase 2 start — unblocked |
| BD-003 | [ADR-003](ADR-003-redis-retry-and-dlq-mechanics.md) | Five-mechanism model; Hash + ZSET delayed retry; `retryEnvelopeId` idempotency; write-then-ack | **Accepted as ADR-backed default** | Phase 2 start — unblocked |
| BD-004 | [ADR-004](ADR-004-repeated-artifact-submission-semantics.md) | Identical pointer re-POST semantics; interim assumption: idempotent accept | To Be Confirmed (owner: `deployment-service` owner; mock owner interim) | Phase 3 exit |
| BD-005 | [ADR-005](ADR-005-outbox-vs-duplicate-ready-events.md) | CAS-then-emit, no outbox; duplicate-tolerant consumers keyed by `deploymentId` | Default accepted for worker build; full resolution gates `cdn-service` tests (AC-034) | Before `cdn-service` integration tests |
| BD-006 | [ADR-006](ADR-006-secret-management-and-token-rotation.md) | K8s Secrets + GitHub Actions secrets; dual-token rotation drill | Proposed — confirm before first deployed environment | Phase 2 first deployed environment |
| BD-007 | [ADR-007](ADR-007-local-render-origin-integration-mode.md) | Compose service for render-origin; published image pinned by tag; seeding contract | Proposed — confirm with studio owners; the local loop runs a contract stand-in mock until then, the real origin joins at M5 E2E | Phase 3 (render fetch) |
| BD-009 | [ADR-009](ADR-009-preview-snapshot-contract.md) | Immutable preview snapshots (upstream capability) | **Blocked (external)** — tracked; preview E2E acceptance deferred (AC-030) | Preview E2E acceptance only |

## Other decisions

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-015](ADR-015-service-naming-alignment.md) | Service naming: `anvilkit-render-worker` → `anvilkit-export-worker` on every surface | **Accepted** |
| [ADR-016](ADR-016-agent-contract-signing-trust-and-revocation.md) | Agent contract signing, trust, revocation, and rollover profile | **Accepted design** — production integration evidence remains M7-T01 |
| [ADR-017](ADR-017-agent-contract-compatibility-engine.md) | Repository-owned four-class Agent contract compatibility engine | **Superseded by ADR-018** |
| [ADR-018](ADR-018-canonical-agent-contract-refactor-and-p0-kernel-profile.md) | Canonical greenfield Agent Contract refactor and P0-kernel profile | **Accepted** — implemented by the Work Package 1 canonical cutover (`contracts/agent/`, P0-Kernel Profile + lock, Go/TypeScript-only generation; 2026-08-18) |
| [ADR-019](ADR-019-dbos-go-pin-and-agentrunworkflow-runtime-boundary.md) | DBOS Go dependency pin and `AgentRunWorkflow` runtime boundary | **Accepted** |
| [ADR-020](ADR-020-public-agent-events-and-internal-evidence.md) | Separate stable public Agent Events from detailed internal Evidence | **Accepted** |
| [ADR-021](ADR-021-agent-api-command-envelopes-and-concurrency.md) | Intent-only command envelopes, authorization carrier, and concurrency rules | **Accepted** |
| [ADR-022](ADR-022-contract-runtime-boundary-and-topology-decision.md) | Contract Runtime security boundary and evidence-driven topology decision | **Accepted** — amended 2026-08-22 with the ADR-024 boundary; Contract Runtime topology selection remains evidence-driven at P0-Integration |
| [ADR-010](ADR-010-demo-guard-mechanism.md) | Demo guard: `ENVIRONMENT`-driven strictness + hostname/loopback denylist; also gates `WORKER_DRY_RUN` | **Accepted** — implemented + T-demo-guard (M2) |
| [ADR-011](ADR-011-queue-retention-and-replay.md) | Queue retention floors (24 h/72 h/7 d) + manual DLQ replay procedure | Proposed — ops sign-off pending (AC-031; before broad rollout) |
| [ADR-012](ADR-012-kubernetes-sizing-and-scaling.md) | K8s sizing: 2 replicas, §18 starting resources; manual scaling MVP, HPA evaluated after staging profiling | **Accepted as proposed defaults** — staging validation pending |
| [ADR-014](ADR-014-load-testing-driver.md) | Load driver: custom Go driver (`mocks/cmd/load-driver`) over k6 | **Accepted** — implemented + exercised (see docs/acceptance/load-test-report.md) |
| [ADR-013](ADR-013-rate-limiting-and-guardrails.md) | Broad-rollout guardrail: basic per-site in-flight cap (delay-not-fail, reuses the pending semantics); global-only rejected | Proposed — Product confirmation + implementation pending (**broad-rollout gate**) |
| [ADR-023](ADR-023-local-only-documentation-and-freeze-anchoring.md) | Local-only documentation policy: only `docs/adr/` is Git-tracked; other governance documents are local-only and anchored by SHA-256 freeze manifests | **Accepted** |
| [ADR-024](ADR-024-agent-service-instance-durable-stream-cursor-spool.md) | Agent Service deploys as a StatefulSet with a per-instance retained claim so a refused stream-disconnect cursor record survives restart and rescheduling | **Accepted** — amended 2026-08-22 with the ADR-022 boundary; decides the Agent Service's instance-state shape only, and replicas, sizing, storage class, and Contract Runtime topology remain evidence-driven |
| [ADR-025](ADR-025-page-generation-integration-dispositions-and-agent-runtime-topology.md) | Page-generation integration dispositions (CD-1..CD-7) and independently deployable Agent Runtime topology | **Accepted** (2026-08-24, amended 2026-08-25 and 2026-08-26) — all three approvals given: CD-1..CD-7 dispositions, Agent Runtimes repository, Page Preview Worker repository. Three later owner decisions are recorded as amendments: **§15** page-persistence request shape (Option A — the request carries the reviewed candidate and the domain owner verifies four bindings); **§16** apply-redemption authority (Studio redeems; the Agent Service page-persistence send was **removed 2026-08-25**, and reconciliation/escalation stay because the service still awaits an outcome it does not control); **§17** the page preview worker's Go-first exemption at `services/preview-worker` (language confinement only — `react`, `react-dom`, and `@measured/puck` remain forbidden there, so a renderer must consume a separately released Puck bundle). **§18** resolves the remote targets left open by approvals 2 and 3: both repositories are named, registered, and pinned as submodules (`services/agent-runtimes`, `services/preview-worker`), superseding the "local checkouts, no remote" passages in §3 and §14. CD-6/CD-7 external material (registration procedure, rotation owner, provider credentials, staging endpoint) remains outstanding and gates PR 4 dispatch, PR 6, PR 7, and Gate B |
| [ADR-026](ADR-026-component-agent-decision-baseline.md) | Component Agent decision baseline D1–D17 and suite governance (catalog authority, build-worker repository/language, Studio BFF access, identity/tenancy, preview origin, object-store and scheduler implementation status, plan 0006 §18 answer) | **Proposed** (2026-08-29) — drafted to anchor `docs/prd/components/` v1.1; nothing accepted until the register names owners and the Architecture Owner approves; D15/D16 are evidence-gated migrations, D17 requires a plan 0006 §2.2 amendment |

## Preserved hard gates (source conditional baseline — PLAN-0001 §4)

1. Phase 1 starts only after BD-008 — **satisfied** (ADR-008).
2. Contracts must not exit Phase 1 until BD-001 is resolved (incl. `routes[]`) — **satisfied** (ADR-001 Accepted, schemas frozen; `cdn-service` sign-off pending at M1 review).
3. Phase 2 runtime work starts only with BD-002 and BD-003 resolved or ADR-backed — **satisfied** (ADR-002, ADR-003).
4. `cdn-service` integration tests start only after BD-005 fully resolved (AC-034).
5. Preview E2E acceptance remains blocked by BD-009 (AC-030).
6. Broad rollout additionally requires the FR-023 guardrail revisit (OQ-4/ADR-013) and the manual artifact cleanup runbook (AC-032).
