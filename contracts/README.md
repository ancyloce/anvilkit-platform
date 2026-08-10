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
├── schemas/meta/               # AnvilKit Draft 2020-12 source profile
├── schemas/v1/                 # M2 shared primitives + 19 Agent contract schemas
├── asyncapi/v1/                # Agent/Pagix AsyncAPI 3.1.0 candidate descriptions
├── fixtures/v1/                # byte-exact M2 corpus, manifest, and invariant relationships
├── registries/v1/              # append-only governed Agent registries
├── compatibility/v1/           # deterministic compatibility report contract/corpus
├── bom/v1/                     # M5 structural root-BOM schema and adversarial candidate corpus
├── freeze/v1/                  # generation-aware Agent candidate lock
├── governance/{m0,m1,m2,m3,m4,m5,m6}/ # PLAN-0003 execution evidence and pending gates
└── contracts.lock.json         # legacy export-contract freeze lock
```

PLAN-0003 introduces the Agent contract authority alongside this legacy tree. Its M0
baseline is in `governance/m0/`; approved source paths will use `schemas/`, `asyncapi/`,
`registries/`, `fixtures/`, `bom/`, `freeze/`, and `evidence/`. The two existing OpenAPI
descriptions and fixtures remain legacy/bootstrap artifacts. Future Agent OpenAPI files may
coexist in `openapi/v1/` but enter the separate generation-aware Agent lock planned for M1.

## Versioning policy

- **Directory version (`v1`, `v2`, …) is the schema version.** Outbound events additionally
  carry a `schemaVersion` field (`const` per version).
- **Legacy additive-only evolution within a version.** New *optional* fields may be added; consumers
  must tolerate unknown fields (`additionalProperties: true` everywhere). Removing or renaming
  a field, changing a type, or adding a *required* field is a **breaking change** and requires
  a new version directory plus contract-test updates (FR-002, ADR-001).
- **New Agent contracts are closed by default.** M2 schemas reject unknown fields unless they
  explicitly declare a bounded extension map and follow the M1 compatibility classification.
- **Frozen legacy files are immutable.** `contracts.lock.json` records the sha256 of every
  frozen export-worker schema, description, and fixture; CI fails if one changes
  (`packages/contracts-codegen/check-freeze.ts`). M0 governance is not a frozen Agent release.
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

## Agent contract M0 checks

```bash
bun packages/contracts-codegen/check-m0.ts
bun packages/contracts-codegen/benchmark-m0.ts --validate
```

These checks prove baseline completeness, recorded owner acknowledgement, and
benchmark-method reproducibility. Twenty-eight evidence-backed DP-008 candidates are
accepted; the tooling OCI candidate remains open for its later publication milestone.

## Agent contract M1 checks

```bash
bun packages/contracts-codegen/check-m1.ts
bun packages/contracts-codegen/check-agent-freeze.ts
bun packages/contracts-codegen/lint-source.ts --schema <schema.json>
bun packages/contracts-codegen/compatibility.ts --previous <old.schema.json> --candidate <new.schema.json>
bun packages/contracts-codegen/registry-diff.ts --previous <old.registry-set.json> --candidate <new.registry-set.json>
```

The M1 lock is reviewer-approved as a repository candidate and is separate from the
legacy export-worker lock. Production promotion still requires the downstream consumer,
signature, OCI, and release evidence defined by the plan.

## Agent contract M2 checks

```bash
bun packages/contracts-codegen/check-m2.ts
```

M2 supplies all 19 catalog schemas, shared primitives, the Agent/Pagix OpenAPI and
AsyncAPI descriptions, and a 97-case byte-pinned corpus. The checker proves source,
reference, catalog, description, fixture, and cross-contract invariant coverage. It is
an authoring gate; exact native validators/spec linters, Kafka binding acknowledgement,
canonical identities, signatures, and freeze approval remain pending.

## Agent contract M3/M4 candidate checks

```bash
bun packages/contracts-codegen/check-m3.ts
bun packages/contracts-codegen/check-m4.ts
bun packages/contracts-codegen/check-m4-generated-packages.ts
bun packages/contracts-codegen/check-m4-consumers.ts
```

M3 covers strict JSON admission, RFC 8785 identity vectors, DSSE/JWS
verification, trust/revocation checks, and authorization redemption. M4 includes
native strict validators in Go, TypeScript, Python, and Java plus the modular
legacy-generation foundation. The four generated packages expose the same 23 contracts
and 117 governed values, carry the same candidate BOM identity, reproduce from pinned
tool closures, and pass the repository-local generation-1 consumer matrix.

## Agent contract M5 candidate check

```bash
bun packages/contracts-bom/check-m5.ts
```

M5 supplies structural schemas, deterministic BOM composition, projections,
dual semantic/OCI digest verification, allowlisted resolution, and a bounded
content-addressed cache. Real staging publication with signatures/referrers and
the environment-backed mirror/rollback drills remain open.

## Agent contract M6 candidate harness

```bash
(cd mocks && GOCACHE=/tmp/anvilkit-m6-go-cache go test -race -count=1 ./fakeprovider ./fakeworker)
```

The M6 repository harness contains deterministic fake-provider scenarios and a
contract-conformant fake worker covering fencing, usage, artifact, idempotency,
event, and AI-boundary matrices. The provider report remains synthetic and
gate-ineligible until the owning Agent Service runs the pinned evaluation;
cross-repository traces and the full release-candidate matrix also remain open.
