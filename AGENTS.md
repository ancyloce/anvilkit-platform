# Repository Guidelines

## Project Structure & Module Organization

This is a Go-first backend monorepo. Platform-owned production code lives in the pinned `services/agent-service/` and `services/export-worker/` Git submodules. Each service keeps its entry point and business packages in its own checkout. Repository-level contracts, schemas, registries, profiles, and fixtures live in `contracts/`; generated service bindings are changed only through the owning generator flow. `mocks/` is a separate Go module for contract-conformant service doubles. Bun tooling lives in `packages/contracts-codegen/`, local Docker/Kubernetes/observability assets in `infra/`, automation in `scripts/`, and architecture, plans, and runbooks in `docs/`. Per ADR-023, only `docs/adr/` is Git-tracked; all other documentation under `docs/` is local-only and anchored by SHA-256 freeze manifests. Treat `docs/prd/` as read-only product authority; accepted ADRs govern the architectural means used to satisfy those requirements.

## Build, Test, and Development Commands

- `git submodule update --init --recursive` initializes both service checkouts.
- `bun install` installs the pinned Bun workspace dependencies.
- `make -C services/agent-service all` checks formatting, vet, boundaries, contract drift, race tests, and the Agent Service build.
- `make -C services/export-worker all` vets, race-tests, and builds the worker.
- `(cd mocks && go test -race -count=1 ./...)` runs mock conformance tests.
- `bun packages/contracts-codegen/generate.ts` validates fixtures and regenerates the legacy export Go bindings; `generate-agent-packages.ts` (after `prepare-agent-generators.sh`) regenerates the canonical Go/TypeScript Agent packages and the agent-service intake.
- `bun packages/contracts-codegen/check-freeze.ts` verifies the legacy export freeze; `check-agent-contracts.ts` and `check-agent-profile.ts` verify the canonical Agent contract set, P0-Kernel Profile, and lock.
- `bun scripts/dependency-audit.ts` enforces language and dependency boundaries; `bun scripts/naming-governance.ts` enforces capability-based naming across the tracked source surface.
- `bash scripts/release-precheck.sh` runs the Agent Service release-evidence and resource-regression audits. They read the retained local evidence ADR-023 keeps out of Git, so they are local/release prechecks rather than hosted CI steps; hosted CI runs only from tracked content.
- `docker compose -f infra/docker-compose.yml up -d --build` starts Redis, MinIO, mocks, and the worker; `./scripts/acceptance.sh` exercises the running stack.

## Coding Style & Naming Conventions

Use `gofmt`; code must also pass `go vet` and `golangci-lint` (`make -C services/export-worker lint`). Keep packages short, lowercase, and non-stuttering (`queue.Consumer`, not `queue.QueueConsumer`). Put new worker implementation packages under `internal/`; define small interfaces beside their consumers. Wrap errors with `%w`, pass `context.Context` first for I/O, and avoid package-level mutable state. Production services are Go; TypeScript is tooling-only. Worker names follow `anvilkit-<stage>-worker`.

## Testing Guidelines

Use Go's `testing` package and name files `*_test.go`; integration suites use `*_integration_test.go`. Run tests with `-race -count=1`. Add valid and invalid fixtures for contract changes and test reliability branches such as retries, conflicts, and idempotency. Integration tests may require `REDIS_TEST_URL` and `S3_TEST_ENDPOINT`; CI supplies both.

## Contracts, Security & Boundaries

Never edit generated service bindings directly; change the repository-owned contract source and regenerate. Agent contracts follow ADR-018: one canonical non-versioned first-party contract set, atomic pre-release refactors, no release-generation suffixes or compatibility adapters, and a reviewed lock/Profile update in the same change. Legacy export-worker contracts governed by ADR-001 remain frozen under their existing rules until a separate ADR changes that scope. Do not add frontend dependencies, cross-repository source imports, non-Platform external service implementations, databases, or secrets. New submodules require team confirmation.

Accepted governance authority is ADR-016 and ADR-018 through ADR-022, followed by `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-0808.md`. ADR-017 is superseded. Reconciled designs `0002` through `0010` are lower-order implementation authority within their assigned boundaries and cannot override an ADR or design 0001. Plans, runbooks, acceptance reports, and prior machine-readable governance evidence remain subordinate. Existing Agent evidence remains historical until regenerated against the canonical profile.

## Commit & Pull Request Guidelines

History uses emoji-prefixed Conventional Commit subjects, for example `✨ feat: add contract codegen` and `🔧 chore: update Go version`. Keep commits scoped. PRs should explain intent and risk, link the relevant issue/AC/ADR, list commands run, and call out contract, generated-code, configuration, or operational changes. All GitHub Actions checks must pass; document any check that could not be run.
