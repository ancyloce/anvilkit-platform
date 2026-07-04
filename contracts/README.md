# AnvilKit Platform Contracts

Language-neutral, versioned integration contracts for `anvilkit-platform` services (FR-002).
Cross-repo and cross-service integration happens **only** through these files — never through
source imports (CLAUDE.md hard boundaries; PRD 0009).

## Layout

```
contracts/
├── events/v1/                  # JSON Schema (draft 2020-12) event contracts
│   ├── deployment.export.requested.schema.json   # inbound  (PRD 0008 §8.1)
│   ├── deployment.artifact.ready.schema.json     # outbound (PRD 0010 §10.3.2, ADR-001)
│   ├── deployment.export.failed.schema.json      # outbound (PRD 0010 §10.3.2, ADR-001)
│   └── fixtures/               # valid example payloads + fixtures/invalid/ counterexamples
├── artifact/v1/                # artifact-manifest.json schema (PRD 0008 §9.2) + fixtures
├── openapi/v1/                 # OpenAPI 3.1 documents for consumed internal APIs
│   ├── deployment-service.internal.json          # record GET, CAS PATCH, artifact POST (PRD 0010 §8.2)
│   ├── asset-service.internal.json               # resolve-batch (PRD 0010 §8.4)
│   └── fixtures/               # request/response examples, byte-matching PRD 0010 §8
└── contracts.lock.json         # freeze lock: sha256 of every frozen contract file
```

## Versioning policy

- **Directory version (`v1`, `v2`, …) is the schema version.** Outbound events additionally
  carry a `schemaVersion` field (`const` per version).
- **Additive-only evolution within a version.** New *optional* fields may be added; consumers
  must tolerate unknown fields (`additionalProperties: true` everywhere). Removing or renaming
  a field, changing a type, or adding a *required* field is a **breaking change** and requires
  a new version directory plus contract-test updates (FR-002, ADR-001).
- **Frozen files are immutable.** `contracts.lock.json` records the sha256 of every frozen
  file; CI fails if a frozen file changes (`packages/contracts-codegen/check-freeze.ts`).
  Even additive changes re-lock deliberately via `bun packages/contracts-codegen/generate.ts --update-lock`
  so they are visible in review.
- **New error codes** require a contracts version note (PRD 0010 §13): the
  `deployment.export.failed` `errorCode` enum is part of the frozen contract.
- **At-least-once emission.** Consumers of outbound events must be duplicate-tolerant, keyed
  by `deploymentId` (ADR-005 default).

## The `routes[]` decision (BD-001 / ADR-001, AC-029)

`deployment.artifact.ready` does **not** include `routes[]`. `cdn-service` reads route data
from `artifact-manifest.json`, where `routes[]` remains present and always an array (FR-012).
`routes[]` may be added to the event later only as an additive optimization field. Note the
*artifact pointer submission* (`POST …/artifact`) **does** carry `routes[]`, matching
PRD 0008 §8.2 / PRD 0010 §8.2 exactly.

## Generated code

`packages/contracts-codegen` (Bun/TypeScript — tooling only, per the Node/TS confinement rule)
generates Go types and thin HTTP clients from these files into
`services/export-worker/contracts/`. Generated code is committed in the worker repo;
platform CI regenerates and fails on drift. Regenerate with:

```bash
bun packages/contracts-codegen/generate.ts
```

## Consumers

| Contract | Producer | Consumers |
| --- | --- | --- |
| `deployment.export.requested` | `publish-service` (external) | `anvilkit-export-worker` |
| `deployment.artifact.ready` | `anvilkit-export-worker` | `cdn-service` (external), audit |
| `deployment.export.failed` | `anvilkit-export-worker` | `deployment-service` (external), status UI, audit |
| `artifact-manifest` | `anvilkit-export-worker` | `cdn-service` (external — reads route data + per-file cache-control from it, PRD 0008 §9.4) |
| `deployment-service.internal` | `deployment-service` (external; mocked here) | `anvilkit-export-worker` |
| `asset-service.internal` | `asset-service` (external; mocked here) | `anvilkit-export-worker` (post-render verifier only) |
