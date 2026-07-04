# @anvilkit/platform

`anvilkit-platform` is the **Go-first backend platform monorepo** for AnvilKit.

It is deliberately separated from `anvilkit-studio`, which owns the frontend/editor system. `anvilkit-platform` is **not** a subdirectory, package, or Git submodule of `anvilkit-studio`, and it never will be.

This repository owns backend platform services, integration contracts, backend-facing mocks, local infrastructure, CI gates, and platform-level automation for the AnvilKit publishing/export pipeline.

## First Production Service

The first production service is:

```text
services/export-worker
```

Canonical service name:

```text
anvilkit-export-worker
```

`anvilkit-export-worker` is a **stateless, queue-driven Go worker** responsible for the export stage of the deployment pipeline.

It consumes:

```text
deployment.export.requested
```

Then it:

1. Fetches the published page through contract-defined APIs.
2. Converts the page into a static artifact bundle.
3. Uploads the artifact bundle for CDN delivery.
4. Emits:

```text
deployment.artifact.ready
```

## Repository Boundary Rules

These rules are hard constraints.

### 1. No Cross-Repo Source Imports

There must be **no source-level imports** between `anvilkit-platform` and `anvilkit-studio` in either direction.

Integration is allowed only through versioned, language-neutral contracts in:

```text
contracts/
```

Supported contract types:

* JSON Schema for events
* OpenAPI for internal APIs

Render output is consumed over HTTP. Render implementation code must never be imported.

### 2. No Frontend Runtime Dependencies

Production services must not depend on frontend packages or frontend runtimes.

Forbidden in any service dependency graph:

* React
* Next.js
* Puck
* `@anvilkit/render-runtime`
* Any `@anvilkit/*` frontend package

This is enforced by:

```text
scripts/dependency-audit.ts
```

Related acceptance criteria:

```text
AC-002
AC-018
```

### 3. External Services Are Contracts and Mocks Only

The following services are external to this repository and must not be implemented here:

* `deployment-service`
* `asset-service`
* `cdn-service`
* `publish-service`
* `page-service`

They may appear only as:

* contracts
* generated clients
* mocks
* fixtures
* references in tests or configuration

They must not get directories under:

```text
services/
```

### 4. Workers Are Stateless

Workers must not own durable application state.

Forbidden for workers:

* service-owned databases
* database migrations
* hidden local state
* long-lived mutable runtime state

All state changes must happen through internal APIs. Coordination must happen through:

* queue messages
* Redis locks
* artifact storage
* versioned contracts

### 5. Go-First Production Runtime

Production services are written in Go.

Node.js / TypeScript is allowed only for:

* tooling
* mocks
* contract generation
* repository-level scripts
* workspace packages under `packages/`

Rust is not allowed.

Related acceptance criteria:

```text
AC-018
```

### 6. Studio Demo Is Not a Production Render Target

`apps/demo` in `anvilkit-studio` is for local development only.

It must never be used as a render target outside local development.

## Naming Standard

Worker names follow ADR-015.

Workers are named after the pipeline stage they own:

```text
anvilkit-<stage>-worker
```

They must not be named after:

* render mode
* output format
* implementation technology
* delivery target

For the export stage, the canonical naming is:

| Surface                             | Canonical Name             | Superseded Names                                      |
| ----------------------------------- | -------------------------- | ----------------------------------------------------- |
| Service repo                        | `anvilkit-export-worker`   | `anvilkit-render-worker`, `anvilkit-static-publisher` |
| Platform path                       | `services/export-worker`   | `services/render-worker`, `services/static-publisher` |
| Image / Deployment / consumer group | `export-worker`            | `render-worker`                                       |
| Metrics namespace                   | `anvilkit_export_worker_*` | `render_worker_*`                                     |

Historical PRDs keep their original names and remain unmodified. ADR-015 is the bridge when reading older PRDs or legacy repository references.

Related acceptance criteria:

```text
AC-019
```

## Repository Layout

```text
anvilkit-platform/
├── contracts/    # Versioned integration contracts and contract freeze rules
├── services/     # Production Go services, each pinned as a Git submodule
├── packages/     # Shared JS/TS tooling workspace packages
├── mocks/        # Contract-conformant mocks for external services
├── infra/        # Local Compose stack, fixtures, retention, and replay support
├── scripts/      # Repository-level CI gates and automation scripts
├── apps/         # Reserved for future platform apps
├── .github/      # GitHub Actions workflows
├── bun.lock      # Bun lockfile
├── package.json  # Workspace package manifest
├── turbo.json    # Turborepo pipeline configuration
├── Makefile      # Repository-level make targets
└── README.md     # Project overview and contributor guide
```

## Directory Responsibilities

| Path         | Responsibility                                               |
| ------------ | ------------------------------------------------------------ |
| `contracts/` | Versioned integration contracts and contract freeze rules    |
| `services/`  | Production Go services, each pinned as a Git submodule       |
| `packages/`  | Shared JS/TS tooling workspace packages                      |
| `mocks/`     | Go module for contract-conformant external service mocks     |
| `infra/`     | Local Compose stack, fixtures, retention, and replay support |
| `scripts/`   | Repository-level CI gates and automation scripts             |
| `apps/`      | Reserved for future platform apps                            |
| `.github/`   | GitHub Actions workflows                                     |

## Services as Git Submodules

Each production worker lives in its own repository and is pinned under `services/` as a Git submodule.

After cloning this repository, initialize submodules with:

```bash
git submodule update --init --recursive
```

Service code is committed and pushed in the service repository itself.

The platform repository only pins the submodule SHA.

Creating a new submodule requires team confirmation first.

## Toolchain

This repository uses:

| Area                 | Tooling        |
| -------------------- | -------------- |
| JS/TS workspace      | Bun `1.3.11`   |
| Task orchestration   | Turborepo      |
| Production services  | Go             |
| Local infrastructure | Docker Compose |
| Images               | GHCR           |
| CI                   | GitHub Actions |
| Deployment target    | Kubernetes     |

Bun is pinned through `devEngines`.

Go services build with the standard Go toolchain inside their own service directories.

## Common Commands

Install workspace dependencies:

```bash
bun install
```

Validate contracts and regenerate Go bindings:

```bash
bun packages/contracts-codegen/generate.ts
```

Verify the contract freeze:

```bash
bun packages/contracts-codegen/check-freeze.ts
```

Run repository boundary and dependency audit:

```bash
bun scripts/dependency-audit.ts
```

Build, vet, and test the export worker:

```bash
make -C services/export-worker all
```

Run mock conformance tests:

```bash
cd mocks && go test ./...
```

Start the local stack:

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

Run the full acceptance suite against the running local stack:

```bash
./scripts/acceptance.sh
```

Run the AC-016 load test:

```bash
cd mocks && go run ./cmd/load-driver -n 60 -metrics http://localhost:19091
```

## Contract Workflow

Contracts are the only supported integration boundary between platform services and external systems.

Contract changes must be:

1. Versioned.
2. Validated against fixtures.
3. Checked for generated code drift.
4. Checked against the contract freeze lock.
5. Reviewed for downstream compatibility.

Do not silently change event or API contracts.

Do not update generated bindings manually unless the contract generation workflow explicitly requires it.

## CI

CI is defined with GitHub Actions.

Platform CI includes the following jobs:

| Job         | Purpose                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `contracts` | Fixture validation, codegen drift check, freeze check                              |
| `worker`    | `golangci-lint`, `go vet`, unit tests, Redis integration tests with `-race`, build |
| `mocks`     | Contract conformance through generated clients                                     |
| `images`    | Worker and mock container builds, Compose validation, build-only                   |
| `audit`     | Dependency boundary checks and `govulncheck`                                       |

The worker repository also runs its own CI on every pull request, including:

* lint
* vet
* tests
* integration tests
* image build
* audit checks

Image publishing and Kubernetes manifest validation are introduced with the first deployed environment.

Related references:

```text
ADR-008
BD-006
M4
M5
```

## Image and Deployment Rules

Images use GHCR and immutable tags.

The canonical image/deployment identity for the export worker is:

```text
export-worker
```

The canonical metrics namespace is:

```text
anvilkit_export_worker_*
```

Legacy names such as `render-worker` must not be introduced into new runtime, deployment, metrics, or CI surfaces.

## Security and Operational Rules

* Never commit secrets.
* Never log credentials, tokens, private keys, or sensitive payloads.
* Validate all external inputs.
* Treat queue consumers as untrusted input boundaries.
* Keep artifact upload behavior explicit and observable.
* Keep retry, DLQ, and replay behavior aligned with operational runbooks.
* Do not weaken contract validation, dependency audits, or CI checks to make a build pass.
* Destructive cleanup behavior must follow the approved cleanup process.

## Development Rules

When making changes in this repository:

1. Keep changes scoped to the relevant package, service, contract, or automation script.
2. Avoid unrelated formatting-only changes.
3. Do not introduce cross-repo imports.
4. Do not add frontend dependencies to backend services.
5. Do not create new service directories for external services.
6. Do not create new Git submodules without team confirmation.
7. Update relevant documentation when changing contracts, commands, architecture, CI, or operational behavior.
8. Run the most relevant checks before submitting changes.
9. If a check cannot be run, document why.
