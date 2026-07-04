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

`--update-lock` additionally rewrites `contracts/contracts.lock.json` (sha256 of every frozen
contract file). `bun packages/contracts-codegen/check-freeze.ts` verifies the lock — any change
to a frozen file fails CI (ADR-001 freeze enforcement; contracts are additive-only within a
version, breaking changes require a new `v2/` directory).

## Determinism

Output depends only on the contract files: no timestamps, no environment probing. The same
inputs always produce byte-identical Go, so `git diff --exit-code` after regeneration is a
sound CI drift gate.
