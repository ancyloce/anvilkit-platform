# ADR-001: Outbound Event Schemas and the `routes[]` Decision

| | |
| --- | --- |
| **Status** | Accepted — schemas frozen at v1 (M1 exit, 2026-07-01); `cdn-service` owner sign-off pending at M1 review (silence = confirmed, per the ADR-008 convention) |
| **Resolves** | BD-001 (PLAN-0001 §4; doc 0010 §4, §10.3.2) |
| **Gate** | Phase 1 **exit** (contracts frozen) — does not block Phase 1 start |
| **Owner** | Backend + `cdn-service` owner |
| **Date** | 2026-07-01 |

## Context

The contracts package (FR-002), the worker's emitter (FR-013), and `cdn-service` consumption all depend on frozen outbound event fields; late changes ripple across repos. Doc 0010 §10.3.2 supplies minimum schemas and a default recommended decision on `routes[]`.

## Decision (frozen at M1 exit)

1. **`deployment.artifact.ready` does not include `routes[]`.** `cdn-service` reads route data from `artifact-manifest.json`, where `routes[]` remains present and always an array (FR-012). `routes[]` may be added to the event later only as an additive optimization field if `cdn-service` requires route hints before reading the manifest.
2. **Minimum schemas per doc 0010 §10.3.2** for both `deployment.artifact.ready` and `deployment.export.failed`: `schemaVersion: 1`, ids (`eventId`, `deploymentId`, `teamId`, `siteId`, `pageId`), `slug`/`version`/`environment`/`renderMode`, plus per-event fields — ready: `artifactBasePath`, `manifestStorageKey`, `manifestDigest`, `entry`, `filesCount`, `totalBytes`; failed: `errorCode`, `errorClassification` (`RETRYABLE | NON_RETRYABLE`), `failedStage` (trace-span vocabulary), `attempt` (0..3 counting rule), `retryExhausted`; both: `traceId`, `createdAt`.
3. **Additive-only evolution.** Removing or renaming a field requires a schema version bump plus contract-test updates (FR-002). Consumers must tolerate duplicate events (at-least-once emission).

## Freeze record (EW-CONTRACT-006, AC-029)

Frozen **2026-07-01** at Phase 1 exit. The `routes[]` decision is confirmed as recorded above:
omitted from `deployment.artifact.ready`; present and always an array in
`artifact-manifest.json` and in the artifact-pointer submission (`POST …/artifact`).

Frozen files — sha256 pinned in `contracts/contracts.lock.json`, immutability enforced in CI
by `packages/contracts-codegen/check-freeze.ts` (additive changes re-lock deliberately via
`generate.ts --update-lock`; breaking changes require a new version directory):

- `contracts/events/v1/deployment.export.requested.schema.json`
- `contracts/events/v1/deployment.artifact.ready.schema.json`
- `contracts/events/v1/deployment.export.failed.schema.json`
- `contracts/openapi/v1/deployment-service.internal.json`
- `contracts/openapi/v1/asset-service.internal.json`
- the fixture corpus under both `fixtures/` directories (valid + invalid counterexamples)

Contract tests: generated Go bindings round-trip every fixture
(`services/export-worker/contracts/*/…_test.go`); `TestArtifactReadyOmitsRoutes`
pins the `routes[]` omission. Sign-off: `cdn-service` owner review requested at the M1
milestone review — any objection reopens BD-001 with an additive-only path forward.

## Consequences

- EW-CONTRACT-002 authored the schema files in `contracts/events/v1` to this shape; EW-CONTRACT-006 recorded the freeze above — with `cdn-service` owner sign-off it satisfies AC-029.
- Keeping route data in the manifest keeps the event mode-neutral (no static-HTML assumption baked into the event contract — see CLAUDE.md scope-evolution rules).

## References

- PLAN-0001 §4 (BD-001), §6 WS2, §13 (ADR-001)
- doc 0010 §10.3.2; PRD 0008 §8.2, §9.4
