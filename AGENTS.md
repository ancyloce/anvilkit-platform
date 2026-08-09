# Repository Guidelines

## Project Structure & Module Organization

This is a Go-first backend monorepo. Production code lives in `services/export-worker/` (a pinned Git submodule); its entry point is `cmd/export-worker`, business packages are under `internal/`, and generated bindings are under `contracts/`. Repository-level integration schemas and fixtures live in `contracts/`. `mocks/` is a separate Go module for contract-conformant service doubles. Bun tooling lives in `packages/contracts-codegen/`, local Docker/Kubernetes/observability assets in `infra/`, automation in `scripts/`, and architecture, plans, and runbooks in `docs/`. Treat `docs/prd/` as read-only authority.

## Build, Test, and Development Commands

- `git submodule update --init --recursive` initializes the worker checkout.
- `bun install` installs the pinned Bun workspace dependencies.
- `make -C services/export-worker all` vets, race-tests, and builds the worker.
- `(cd mocks && go test -race -count=1 ./...)` runs mock conformance tests.
- `bun packages/contracts-codegen/generate.ts` validates fixtures and regenerates Go bindings.
- `bun packages/contracts-codegen/check-freeze.ts` verifies frozen contract hashes.
- `bun scripts/dependency-audit.ts` enforces language and dependency boundaries.
- `docker compose -f infra/docker-compose.yml up -d --build` starts Redis, MinIO, mocks, and the worker; `./scripts/acceptance.sh` exercises the running stack.

## Coding Style & Naming Conventions

Use `gofmt`; code must also pass `go vet` and `golangci-lint` (`make -C services/export-worker lint`). Keep packages short, lowercase, and non-stuttering (`queue.Consumer`, not `queue.QueueConsumer`). Put new worker implementation packages under `internal/`; define small interfaces beside their consumers. Wrap errors with `%w`, pass `context.Context` first for I/O, and avoid package-level mutable state. Production services are Go; TypeScript is tooling-only. Worker names follow `anvilkit-<stage>-worker`.

## Testing Guidelines

Use Go's `testing` package and name files `*_test.go`; integration suites use `*_integration_test.go`. Run tests with `-race -count=1`. Add valid and invalid fixtures for contract changes and test reliability branches such as retries, conflicts, and idempotency. Integration tests may require `REDIS_TEST_URL` and `S3_TEST_ENDPOINT`; CI supplies both.

## Contracts, Security & Boundaries

Never edit `services/export-worker/contracts/` directly; change `contracts/` and regenerate. Frozen `v1` changes require an intentional `--update-lock`; breaking changes require a new version. Do not add frontend dependencies, cross-repository source imports, external service implementations, databases, or secrets. New submodules require team confirmation.

## Commit & Pull Request Guidelines

History uses emoji-prefixed Conventional Commit subjects, for example `✨ feat: add contract codegen` and `🔧 chore: update Go version`. Keep commits scoped. PRs should explain intent and risk, link the relevant issue/AC/ADR, list commands run, and call out contract, generated-code, configuration, or operational changes. All GitHub Actions checks must pass; document any check that could not be run.
