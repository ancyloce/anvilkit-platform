# ADR-006: Secret Management and Token Rotation

| | |
| --- | --- |
| **Status** | Proposed — must be confirmed before the first deployed environment (M2) |
| **Resolves** | BD-006 (PLAN-0001 §4; doc 0010 §4, §11) |
| **Gate** | Phase 2 — first deployed environment (does not block local/compose development) |
| **Owner** | DevOps + Security |
| **Date** | 2026-07-01 |

## Context

The first deployed environment needs secret injection and rotation without downtime; the decision shapes deployment manifests and config loading. Secrets in scope: `INTERNAL_SERVICE_TOKEN`, `S3_ACCESS_KEY`/`S3_SECRET_KEY` (doc 0010 §14 marks these **secret**).

## Decision (proposed)

1. **Runtime injection: Kubernetes Secrets** mounted as environment variables into the worker Deployment (EW-K8S-003). No secret is ever baked into images, K8s manifests committed to the repo, logs, or repo files. A managed secret store (e.g. External Secrets Operator backed by a cloud secret manager) can replace raw K8s Secrets later without changing the worker — it reads env vars either way.
2. **CI secrets: GitHub Actions encrypted secrets** (aligned with ADR-008), scoped per environment via GitHub environments for the CD promotion flow.
3. **Rotation without downtime: dual-token window** (per ADR-002). Rotation procedure: add the new token to the accepting services → roll the worker to the new token → remove the old token. S3 credentials rotate by issuing a second key pair before revoking the first.
4. **Verification:** repo/image secret scan in CI; log-inspection test greps full test output for token material (EW-CONFIG-005, AC-022); rotation drill in staging before production launch (EW-K8S-003).

## Consequences

- Local compose keeps plaintext dev-only values (e.g. MinIO default credentials, a dev `INTERNAL_SERVICE_TOKEN`) — explicitly non-production.
- Deployment manifests reference Secret names only; the concrete secret store choice can be revisited when the cluster/provider is pinned (deferred half of ADR-008) without reopening this contract.

## References

- PLAN-0001 §4 (BD-006), §6 WS10 (EW-CONFIG-004), WS14 (EW-K8S-003), §13 (ADR-006)
- doc 0010 §11, §11.1, §14; ADR-002, ADR-008
