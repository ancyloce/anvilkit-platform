# ADR-001: Outbound Event Schemas and the `routes[]` Decision

| | |
| --- | --- |
| **Status** | Default adopted (Proposed) — formal freeze due at Phase 1 exit (M1) with `cdn-service` owner sign-off |
| **Resolves** | BD-001 (PLAN-0001 §4; doc 0010 §4, §10.3.2) |
| **Gate** | Phase 1 **exit** (contracts frozen) — does not block Phase 1 start |
| **Owner** | Backend + `cdn-service` owner |
| **Date** | 2026-07-01 |

## Context

The contracts package (FR-002), the worker's emitter (FR-013), and `cdn-service` consumption all depend on frozen outbound event fields; late changes ripple across repos. Doc 0010 §10.3.2 supplies minimum schemas and a default recommended decision on `routes[]`.

## Decision (default adopted; confirm at M1 exit)

1. **`deployment.artifact.ready` does not include `routes[]`.** `cdn-service` reads route data from `artifact-manifest.json`, where `routes[]` remains present and always an array (FR-012). `routes[]` may be added to the event later only as an additive optimization field if `cdn-service` requires route hints before reading the manifest.
2. **Minimum schemas per doc 0010 §10.3.2** for both `deployment.artifact.ready` and `deployment.export.failed`: `schemaVersion: 1`, ids (`eventId`, `deploymentId`, `teamId`, `siteId`, `pageId`), `slug`/`version`/`environment`/`renderMode`, plus per-event fields — ready: `artifactBasePath`, `manifestStorageKey`, `manifestDigest`, `entry`, `filesCount`, `totalBytes`; failed: `errorCode`, `errorClassification` (`RETRYABLE | NON_RETRYABLE`), `failedStage` (trace-span vocabulary), `attempt` (0..3 counting rule), `retryExhausted`; both: `traceId`, `createdAt`.
3. **Additive-only evolution.** Removing or renaming a field requires a schema version bump plus contract-test updates (FR-002). Consumers must tolerate duplicate events (at-least-once emission).

## Consequences

- EW-CONTRACT-002 authors the schema files in `contracts/` to this shape; EW-CONTRACT-006 records the freeze (this ADR moves to Accepted) at M1 exit — that freeze, with `cdn-service` owner sign-off, satisfies AC-029.
- Keeping route data in the manifest keeps the event mode-neutral (no static-HTML assumption baked into the event contract — see CLAUDE.md scope-evolution rules).

## References

- PLAN-0001 §4 (BD-001), §6 WS2, §13 (ADR-001)
- doc 0010 §10.3.2; PRD 0008 §8.2, §9.4
