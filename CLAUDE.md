# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`anvilkit-platform` is the backend platform monorepo for AnvilKit, deliberately separate from `anvilkit-studio` (the frontend/editor monorepo). It is at the bootstrap stage: workspace scaffolding exists, but the `apps/`, `packages/`, and root-level service code are still mostly empty. The architecture is fully specified in `docs/prd/` — read the relevant PRD before implementing anything:

- `docs/prd/0008-render-worker-service-*.md` — **behavioral authority** for the render worker: events, deployment state machine, artifact contract, reliability semantics. Where documents overlap, 0008 wins on pipeline behavior.
- `docs/prd/0009-render-worker-platform-monorepo-split-*.md` — repository boundary and technical direction: this repo is **Go-first**. Supersedes 0008's Node.js stack recommendation (Node/TS is allowed only for tooling, mocks, and contract generation — never production services).
- `docs/prd/0010-render-worker-platform-backend-requirements-*.md` — implementation-level requirements: FR-xxx functional requirements with execution priorities, BD-xxx Phase 0 blocking decisions, error-code classification, config, and the MVP test matrix.

## Workspace and commands

Bun is the package manager (pinned to 1.3.11 via `devEngines`) with Turborepo for task orchestration. Workspaces: `apps/*`, `services/*`, `packages/*`.

- `bun install` — install dependencies
- `bunx turbo run build` — build (task graph: `build` depends on `prebuild` and upstream `^build`; outputs `dist/**`)
- `bunx turbo run lint` / `bunx turbo run check-types` — lint / typecheck
- `bunx turbo run build --filter=<package>` — run a task for a single workspace package

These turbo tasks orchestrate JS/TS workspace packages (tooling, contracts, mocks). Production services are Go and build with the standard Go toolchain inside their own directories (the root `.gitignore` already covers Go artifacts: `go.work`, `*.test`, coverage files).

## Services are git submodules

`services/static-publisher` is a git submodule pointing at <https://github.com/ancyloce/anvilkit-static-publisher.git>. After cloning the platform repo, run `git submodule update --init --recursive`. Changes to service code are committed and pushed in the service's own repository; the platform repo only pins the submodule SHA.

Naming note: `anvilkit-static-publisher` is the service the PRDs call `anvilkit-render-worker` — the stateless Go worker that converts deployment events into versioned static artifacts for CDN delivery. When the PRDs say `services/render-worker`, the actual path is `services/static-publisher`.

## Architecture (big picture)

The worker pipeline (PRD 0008 §5, 0010 §5.1): consume `deployment.export.requested` from the queue (Redis Streams at MVP, Kafka at GA, behind a driver abstraction) → load the authoritative deployment record from `deployment-service` → acquire a per-`deploymentId` distributed lock → CAS status `EXPORT_QUEUED → EXPORTING` → fetch version-pinned HTML from `anvilkit-render-origin` over internal HTTP (service token + `X-AnvilKit-Page-Id`/`X-AnvilKit-Version` headers) → harvest dependencies deterministically → upload hashed artifacts + `artifact-manifest.json` to S3-compatible storage → submit the manifest pointer → CAS `EXPORTING → ARTIFACT_READY` → emit `deployment.artifact.ready`. CDN upload/purge/verify/activation happens downstream in `cdn-service`.

### Hard boundaries

- **No cross-repo source imports** between `anvilkit-platform` and `anvilkit-studio`, in either direction. Integration is only through versioned, language-neutral contracts (JSON Schema for events, OpenAPI for internal APIs, versioned in this repo's `contracts/` area). Render output is consumed over HTTP, never via render code.
- The worker must never depend on React, Next.js, Puck, `@anvilkit/render-runtime`, or any `@anvilkit/*` frontend package.
- External services (`deployment-service`, `asset-service`, `cdn-service`, `publish-service`, `page-service`, etc.) are **contracts and mocks only** — never implemented here and never given directories under `services/`.
- The worker is stateless and never accesses external services' databases; all state changes go through internal APIs.
- `apps/demo` (in `anvilkit-studio`) must never be a render target outside local development — a startup config guard rejects it.

### Reliability invariants

- `deploymentId` is the canonical idempotency key: one `deploymentId` → at most one artifact manifest. Redelivery after `ARTIFACT_READY` acks without re-rendering.
- All deployment status writes are compare-and-set; the worker owns only `EXPORT_QUEUED → EXPORTING → ARTIFACT_READY | EXPORT_FAILED`. A `409 STATUS_CONFLICT` stops the worker safely.
- Storage idempotency compares the `x-amz-meta-content-sha256` object metadata; **never use S3 ETag as a content hash** (multipart ETags are not stable).
- A lock conflict alone must never ack an active deployment — delay, nack, or leave pending. Pending messages from crashed workers are recovered via `XPENDING`/`XAUTOCLAIM`.
- Every failure is classified retryable (backoff + jitter, max 3, then DLQ `deployment.export.dlq`) vs non-retryable (immediate `EXPORT_FAILED` with a classified error code).
