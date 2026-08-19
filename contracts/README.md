# AnvilKit Platform Contracts

Language-neutral integration contracts for `anvilkit-platform` services (FR-002).
Cross-repo and cross-service integration happens **only** through these files — never through
source imports (CLAUDE.md hard boundaries; PRD 0009).

Two separately governed contract sets live here:

1. **Canonical Agent contracts** under `contracts/agent/` — one non-versioned first-party
   set governed by ADR-018 (with ADR-016/020/021/022). Contract identity is the canonical
   schema path, content digest, the P0-Kernel Profile, the canonical lock, and the
   repository commit — never a release-generation suffix or version directory.
2. **Legacy export-worker contracts** (`events/`, `artifact/`, `openapi/`) — frozen under
   ADR-001 and `contracts.lock.json`; they keep their existing versioned layout and rules
   until a separate governance decision changes that scope.

## Layout

```
contracts/
├── agent/                      # canonical Agent contract set (ADR-018)
│   ├── schemas/                # 33 canonical JSON Schemas (Draft 2020-12, AnvilKit profile)
│   │   └── meta/               # AnvilKit source meta-schema + linter self-test corpus
│   ├── openapi/                # agent-service + pagix-agent-integration (ADR-021 command envelopes)
│   ├── asyncapi/               # public AgentEvent channel + worker/usage transport (ADR-020)
│   ├── registries/             # governed registry set (six public event types, run states, …)
│   ├── fixtures/
│   │   ├── valid|invalid|adversarial/   # byte-pinned corpus incl. separation + command cases
│   │   ├── canonical/          # JCS, strict-admission, and domain-separated identity vectors
│   │   ├── signing/            # synthetic DSSE + compact-JWS vectors (ADR-016; never production keys)
│   │   └── manifest.json       # deterministic corpus manifest (+ manifest.schema.json)
│   ├── profile/p0-kernel-profile.json   # machine-readable P0-Kernel contract scope (ADR-018 §5)
│   └── lock/contracts.lock.json         # canonical lock: profile + sources + registry + generators + outputs
├── events/v1/                  # legacy export event contracts (ADR-001 freeze)
├── artifact/v1/                # legacy artifact-manifest schema + fixtures (ADR-001 freeze)
├── openapi/v1/                 # legacy internal API descriptions + fixtures (ADR-001 freeze)
├── governance/                 # local-only historical PLAN-0003 evidence (not tracked; superseded)
└── contracts.lock.json         # legacy export-contract freeze lock
```

## Canonical Agent contracts (ADR-018)

- **One canonical tree.** No first-party version directory, no release-generation suffix in
  any logical name, schema identifier, media type, registry value, or generated type.
  `tenantId` does not exist; `workspaceId` is the Pagix Team boundary and every
  `TargetReference` requires `projectId`.
- **References are digest-pinned:** `anvilkit://schema/<name>?digest=sha256:<hex>` resolves
  only inside the closed repository graph.
- **Events, Evidence, and deltas are separated (ADR-020).** Exactly six public AgentEvent
  types exist; AgentEvidence is internal with an independent sequence; AgentStreamDelta is
  provisional transport and carries no public sequence.
- **Writes are intent-only commands (ADR-021)** — `CreateAgentRunRequest`,
  `IssueApplyAuthorizationRequest`, `SubmitInputResponseRequest`,
  `SubmitApprovalDecisionRequest` — with If-Match concurrency, Idempotency-Key replay, and
  ProblemDetails errors.
- **Change rule:** until the first external release, contract changes are coordinated atomic
  refactors — sources, registries, fixtures, generated packages, consumers, profile, and
  lock move in the same change set. No compatibility adapters, dual paths, or migrations.

### Checks and generation

```bash
bun packages/contracts-codegen/check-agent-contracts.ts    # sources, refs, registries, fixtures, separation, corpora
bun packages/contracts-codegen/check-agent-specs.ts        # Redocly + AsyncAPI parser lint of the projections
bash packages/contracts-codegen/prepare-agent-generators.sh # install pinned Go generators
bun packages/contracts-codegen/generate-agent-packages.ts  # regenerate Go + TypeScript + agent-service intake
bun packages/contracts-codegen/check-agent-profile.ts      # P0-Kernel Profile + canonical lock + intake identity
```

Regeneration modes (deliberate, review-visible):

```bash
bun packages/contracts-codegen/check-agent-contracts.ts --update-manifest  # rebuild fixtures/manifest.json
bun packages/contracts-codegen/check-agent-profile.ts --update             # rebuild profile + lock
```

### Generated consumers

Go and TypeScript are the only active Agent contract consumers (Java is non-blocking;
Python requires a real consumer first — ADR-018 §5):

- `packages/contracts-go/generated/` — Go schema bindings + `agentclient`/`pagixclient`
  (oapi-codegen v2.8.0, go-jsonschema v0.24.1), hardened and traced.
- `packages/contracts-typescript/src/generated/` — TypeScript schema types + typed API
  surfaces (json-schema-to-typescript 15.0.4, openapi-typescript 7.13.0).
- `services/agent-service/contracts/` — byte-identical intake of the canonical schemas,
  generated bindings, and validator, verified by `scripts/check-contract-drift.sh`.

Go↔TypeScript parity (fixture outcomes, canonical bytes, domain-separated identities, and
signature vectors) is proven in CI by the `emit-typescript-*` / `cmd/*conformance` /
`compare-agent-*` harness with zero tolerated divergence.

## Legacy export contracts (ADR-001)

### Versioning policy

- **Directory version (`v1`, `v2`, …) is the schema version.** Outbound events additionally
  carry a `schemaVersion` field (`const` per version).
- **Additive-only evolution within a version.** New *optional* fields may be added; consumers
  must tolerate unknown fields (`additionalProperties: true` everywhere). Removing or renaming
  a field, changing a type, or adding a *required* field is a **breaking change** and requires
  a new version directory plus contract-test updates (FR-002, ADR-001).
- **Frozen files are immutable.** `contracts.lock.json` records the sha256 of every frozen
  export-worker schema, description, and fixture; CI fails if one changes
  (`packages/contracts-codegen/check-freeze.ts`). Even additive changes re-lock deliberately
  via `bun packages/contracts-codegen/generate.ts --update-lock` so they are visible in review.
- **New error codes** require a contracts version note (PRD 0010 §13): the
  `deployment.export.failed` `errorCode` enum is part of the frozen contract.
- **At-least-once emission.** Consumers of outbound events must be duplicate-tolerant, keyed
  by `deploymentId` (ADR-005 default).

### The `routes[]` decision (BD-001 / ADR-001, AC-029)

`deployment.artifact.ready` does **not** include `routes[]`. `cdn-service` reads route data
from `artifact-manifest.json`, where `routes[]` remains present and always an array (FR-012).
`routes[]` may be added to the event later only as an additive optimization field. Note the
*artifact pointer submission* (`POST …/artifact`) **does** carry `routes[]`, matching
PRD 0008 §8.2 / PRD 0010 §8.2 exactly.

### Generated code

`packages/contracts-codegen` (Bun/TypeScript — tooling only, per the Node/TS confinement rule)
generates Go types and thin HTTP clients from these files into
`services/export-worker/contracts/`. Generated code is committed in the worker repo;
platform CI regenerates and fails on drift. Regenerate with:

```bash
bun packages/contracts-codegen/generate.ts
```

### Consumers

| Contract | Producer | Consumers |
| --- | --- | --- |
| `deployment.export.requested` | `publish-service` (external) | `anvilkit-export-worker` |
| `deployment.artifact.ready` | `anvilkit-export-worker` | `cdn-service` (external), audit |
| `deployment.export.failed` | `anvilkit-export-worker` | `deployment-service` (external), status UI, audit |
| `artifact-manifest` | `anvilkit-export-worker` | `cdn-service` (external — reads route data + per-file cache-control from it, PRD 0008 §9.4) |
| `deployment-service.internal` | `deployment-service` (external; mocked here) | `anvilkit-export-worker` |
| `asset-service.internal` | `asset-service` (external; mocked here) | `anvilkit-export-worker` (post-render verifier only) |
