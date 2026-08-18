# ADR-002: Internal Service-to-Service Authentication Contract

| | |
| --- | --- |
| **Status** | Accepted as ADR-backed default (per doc 0010 conditional gate: "resolved **or accepted as ADR-backed defaults**") |
| **Resolves** | BD-002 (PLAN-0001 §4; doc 0010 §4, §11.1) |
| **Gate** | Phase 2 start (M2) |
| **Owner** | Backend + Security |
| **Date** | 2026-07-01 |

## Context

Clients for `deployment-service`, `asset-service`, and render-origin (FR-004/FR-006/FR-007) bake the auth scheme into every call; rotation drives config and secret design. PRD 0008 §14 confirms bearer service-token auth as the floor; doc 0010 §11.1 recommends the full contract.

## Decision

Adopt doc 0010 §11.1 in full:

1. **MVP mechanism:** `Authorization: Bearer <INTERNAL_SERVICE_TOKEN>` on every internal call (render-origin, `deployment-service`, `asset-service`). No anonymous internal traffic.
2. **Token shape at MVP:** static shared secret (the confirmed floor). If/when a structured token is introduced, it carries: issuer, audience (target service), subject (`anvilkit-export-worker`), expiration, environment, and scopes — suggested scopes `deployment:read`, `deployment:status:update`, `deployment:artifact:write`, `render-origin:fetch`, `asset:resolve`.
3. **Rotation:** the worker (and every internal server) tolerates a dual-token window — at least one overlapping old/new token accepted — so rotation needs no downtime. Injection mechanics are BD-006/ADR-006.
4. **Never logged:** the token appears in no logs, traces, error messages, or crash dumps (enforced by the sanitization layer, EW-CONFIG-005; verified by log-inspection test, AC-022).
5. **Per-service 401/403 classification**, all non-retryable with ops alerts: `RENDER_ORIGIN_401/403`, `DEPLOYMENT_SERVICE_401/403`, `ASSET_SERVICE_401/403`.
6. **GA direction:** evaluate mTLS between internal services (confirmed direction, PRD 0008 §14).

## Consequences

- Phase 2 (M2) worker-runtime work is unblocked on the auth axis (BD-003/ADR-003 is the other half of the gate).
- Mocks must reject unauthenticated calls and expose 401/403 failure modes (EW-LOCAL-002/003, EW-TEST-008).
- An integration note must be shared with `anvilkit-studio` (render-origin) owners — render-origin must accept the bearer token and the dual-token rotation window (required output artifact of BD-002).

## References

- PLAN-0001 §4 (BD-002), §6 WS10 (EW-CONFIG-003), §13 (ADR-002)
- doc 0010 §11, §11.1, §13 (auth error codes); PRD 0008 §14
