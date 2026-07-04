# AnvilKit Platform Mocks

Contract-conformant, in-memory mocks of the **external** services the export worker consumes
(FR-022, EW-LOCAL-002/003). The real `deployment-service` and `asset-service` do not exist
yet — these mocks are the integration surface until they do, and they must be revalidated
against the real services before production cutover (R-08).

They are Go (the source document's Recommended Approach) so they exercise the worker's
**generated contract bindings** — the conformance tests drive each mock through the worker's
own generated client, keeping mock and worker pinned to the same frozen contracts.

| Mock | Contract | Notes |
| --- | --- | --- |
| `deploymentmock` / `cmd/deployment-service-mock` | `contracts/openapi/v1/deployment-service.internal.json` | Record GET, CAS PATCH with 409 `STATUS_CONFLICT`, artifact POST with the **BD-004 interim semantics** (ADR-004: idempotent accept of an identical pointer re-POST; `409 ARTIFACT_CONFLICT` for a different pointer) |
| `assetmock` / `cmd/asset-service-mock` | `contracts/openapi/v1/asset-service.internal.json` | Deterministic `resolve-batch` resolver |
| `renderoriginmock` / `cmd/render-origin-mock` | render-origin runtime HTTP contract (PRD 0010 §8.3) | Version-pinned seeded pages covering every harvest form + the PLAN-0001 §11 negative pages; stand-in until BD-007/ADR-007 confirms the real anvilkit-studio origin |

Auth (ADR-002): every `/internal/*` route requires `Authorization: Bearer <token>` against
the configured token set — **multiple tokens accepted** to model the dual-token rotation
window. Missing/invalid token → `401`.

## Scriptable failure modes (EW-LOCAL-002 DoD)

Unauthenticated control endpoints (test/tooling surface, never part of the contract):

```
POST /__mock/control {"failMode":"none|timeout|http500|http401|http403","latencyMs":0}
POST /__mock/seed    {<DeploymentRecord JSON>}     (deployment mock only)
POST /__mock/reset
```

## Running

```bash
go run ./cmd/deployment-service-mock   # PORT=8080, INTERNAL_SERVICE_TOKENS=local-dev-token, SEED_DIR optional
go run ./cmd/asset-service-mock
```

Or via `infra/docker-compose.yml`, which builds both from `mocks/Dockerfile` and seeds
`infra/fixtures/`.

Boundary note (CLAUDE.md): these are mocks of external services — the services themselves
are never implemented in this repo and never get directories under `services/`.
