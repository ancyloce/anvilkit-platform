# @anvilkit/contracts-codegen

Codegen pipeline for the versioned platform contracts (FR-002, EW-CONTRACT-004).
Dependency-free Bun/TypeScript — permitted as tooling under the Node/TS confinement rule
(PRD 0009; never a production service).

## What it does

`bun packages/contracts-codegen/generate.ts` (run from the repo root):

1. **Validates** every fixture under `contracts/events/v1/fixtures/` against its JSON Schema
   (draft 2020-12 subset validator) — valid fixtures must pass, `fixtures/invalid/` must fail.
2. **Validates** every fixture under `contracts/openapi/v1/fixtures/` against the referenced
   OpenAPI component schema.
3. **Generates Go** into the worker submodule (committed there; platform CI regenerates and
   fails on drift):
   - `services/export-worker/contracts/events/` — event structs, enum types
     (`RenderMode`, `Environment`, `ErrorClassification`, `FailedStage`, `ErrorCode`),
     embedded schema sources, fixture testdata
   - `services/export-worker/contracts/deploymentservice/` — record/CAS/artifact
     types + thin HTTP client (bearer auth, typed 409 `STATUS_CONFLICT` error)
   - `services/export-worker/contracts/assetservice/` — resolve-batch types + client
4. **gofmt**s the generated files.

PLAN-0003 M0 adds two build-only governance commands without changing the legacy generator
or frozen contract bytes:

```bash
bun packages/contracts-codegen/check-m0.ts
bun packages/contracts-codegen/benchmark-m0.ts --validate
```

`check-m0.ts` verifies the legacy inventory, 19-family Agent catalog, P0 freeze subset,
DP-008 candidate records, and reviewer gates. The benchmark command validates or
materializes the representative evidence corpus and can invoke an already-installed
candidate adapter; it never downloads or selects a dependency.

PLAN-0003 M1 adds dependency-free source-authority tooling:

```bash
bun packages/contracts-codegen/check-m1.ts
bun packages/contracts-codegen/check-agent-freeze.ts
bun packages/contracts-codegen/lint-source.ts --schema <schema.json>
bun packages/contracts-codegen/compatibility.ts --previous <old.schema.json> --candidate <new.schema.json>
bun packages/contracts-codegen/registry-diff.ts --previous <old.registry-set.json> --candidate <new.registry-set.json>
```

These commands enforce the AnvilKit Draft 2020-12 profile, closed digest-pinned
references, append-only registries, stable findings, semantic classification, and the
generation-aware Agent candidate lock. They do not replace native runtime validators or
their DP-008 approval gates.
PLAN-0003 M2 adds the catalog/description/corpus gate:

```bash
bun packages/contracts-codegen/check-m2.ts
```

It verifies catalog-to-schema metadata, the closed 20-component schema graph, OpenAPI
3.1.2 and AsyncAPI 3.1.0 structure, immutable payload references, write idempotency,
Kafka delivery/ordering/DLQ metadata, 97 exact fixture hashes, category coverage, and
the P0 run/event/artifact/fence/usage/authorization invariants. Its dependency-free
instance evaluation is bootstrap evidence only; M3/M4 still require DP-008-approved
native validators and four-language parity.

PLAN-0003 M3 supplies admission, identity, and security gates:

```bash
bun packages/contracts-codegen/check-m3.ts
bun packages/contracts-codegen/check-m3-security.ts
```

These commands run byte-exact strict-admission, RFC 8785 canonical-byte,
component-identity, non-recursive root-BOM identity, DSSE/JWS, trust/revocation,
and authorization-redemption vectors. Four-language JCS candidates are now
accepted on the representative DP-008 corpus. The complete 97-case payload
validation/JCS parity gate also passes. The eight DSSE/JWS selections are now
accepted and their six-case native primitive matrix has zero divergences.

PLAN-0003 M4 includes the modular-generation foundation and native validator gates:

```bash
bun packages/contracts-codegen/check-m4.ts
bun packages/contracts-codegen/check-m4-typescript.ts
bun packages/contracts-codegen/check-m4-conformance.ts
bun packages/contracts-codegen/check-m4-generated-packages.ts
bun packages/contracts-codegen/check-m4-consumers.ts
```

The retained export generator is an orchestrator over explicit source-validation,
fixture-execution, normalized-model, and Go-generation stages. Its legacy JSON Schema
vocabulary is closed. Native strict validators exist in Go, TypeScript, Python, and Java
using accepted exact DP-008 versions. Each native package exposes a 97-case
conformance-result v1 emitter. `compare-m4-conformance.ts` requires exactly four
outputs, checks every result against the byte-pinned manifest, and rejects any
case or canonical-byte divergence. `compare-m4-identity.ts` applies the same
zero-tolerance boundary to the 12 ComponentIdentityV1 and ContractBomIdentityV1
vectors, while `compare-m4-signature.ts` does the same for the six fixed DSSE/JWS
primitive cases. Pinned generators produce versioned Go, TypeScript, Python, and Java
schema/API packages for all 23 logical contracts and 117 governed wire values. Each trace
binds the source projections, exact generators, generated tree, and the same 29-component
candidate BOM. The supported-consumer matrix verifies that all four repository-local
packages accept generation 1 and reject adjacent generations with `CONTRACT_UNSUPPORTED`.

`--update-lock` additionally rewrites the legacy `contracts/contracts.lock.json` (sha256 of
the export-worker schemas, descriptions, and fixtures in its explicit scope).
`bun packages/contracts-codegen/check-freeze.ts` verifies that lock. The new Agent authority
will use the separate generation-aware lock planned by PLAN-0003 M1.

## Determinism

Output depends only on the contract files: no timestamps, no environment probing. The same
inputs always produce byte-identical Go, so `git diff --exit-code` after regeneration is a
sound CI drift gate.
