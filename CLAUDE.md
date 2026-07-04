# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Hard Rules

- **Git is read-only for Claude. Automatic commits are disabled.** Never stage, commit, amend, rebase, merge, reset, clean, tag, push, switch branches, or open PRs on your own initiative — finishing a task is never a reason to commit. Details in Git Rules.
- **Never edit** `docs/prd/` (AC-019) or generated code (`services/export-worker/contracts/`) — edit the contract source and regenerate.
- **Never break the contract freeze silently** — re-locks happen only via `generate.ts --update-lock` so the diff is reviewed; breaking changes need a new version directory.
- **Never add** React, Next.js, Puck, `@anvilkit/*` frontend packages, cross-repo imports of `anvilkit-studio`, or any dep that bumps the Go directive past 1.24 (downgrade the dep instead). CI enforces this via the dependency audits.
- **Never weaken** tests, lints, gates, auth, or validation to get green. Never log or commit secrets.
- New git submodules require team confirmation first. External services are contracts + mocks only — never implemented here, never given directories under `services/`.

## Project Overview

- `anvilkit-platform` is the **backend platform monorepo** for AnvilKit, deliberately separate from `anvilkit-studio` (the frontend/editor monorepo). The two integrate **only** through the versioned contracts in `contracts/` — never source imports, in either direction.
- The repo is **Go-first** (PRD 0009): production services are Go. Node/TypeScript (Bun) is confined to tooling and contract generation — never production services.
- The first production service is **`anvilkit-export-worker`** (`services/export-worker`, a git submodule): a stateless, queue-driven worker that consumes `deployment.export.requested`, converts the published page into a static artifact bundle, uploads it for CDN delivery, and emits `deployment.artifact.ready`. All five MVP milestones (M1–M5) of `docs/plans/0001-export-worker-implementation-roadmap-*.md` are implemented; remaining work is tracked there and in the acceptance report.
- Requirements authority is `docs/prd/` — read the relevant PRD before changing pipeline behavior:
  - `0008-render-worker-service-*.md` — **behavioral authority**: events, deployment state machine, artifact contract, reliability semantics. Where documents overlap, 0008 wins on pipeline behavior.
  - `0009-render-worker-platform-monorepo-split-*.md` — repository boundary; Go-first direction (supersedes 0008's Node.js recommendation).
  - `0010-render-worker-platform-backend-requirements-*.md` — FR-xxx requirements, BD-xxx blocking decisions, §13 error-code registry, §14 config, test matrix.
  - The PRDs keep the old `anvilkit-render-worker` name; ADR-015 is the naming bridge.

## Repository Structure

```
contracts/       FROZEN v1 contracts + contracts.lock.json (events/v1, openapi/v1, artifact/v1,
                 each with valid + invalid fixture corpora)
packages/contracts-codegen/  Bun/TS codegen: validates fixtures, generates Go bindings, enforces freeze
services/export-worker/      the worker (git submodule → github.com/ancyloce/anvilkit-export-worker)
mocks/           standalone Go module: contract-conformant mocks (cmd/deployment-service-mock,
                 cmd/asset-service-mock, cmd/render-origin-mock) + the ADR-014 load driver
infra/           docker-compose.yml, fixtures, scripts (publish-event/seed-fixtures/verify-artifact),
                 Prometheus alerts/, k8s/, otel-collector.yaml
scripts/         dependency-audit.ts (boundary gate) · acceptance.sh (full T-* suite)
docs/            prd/ (read-only authority) · plans/ · adr/ · runbooks/ · acceptance/
.github/         workflows: ci.yml · acceptance.yml · deploy.yml
```

Live status documents — keep them updated when the state they track changes:

- `docs/adr/README.md` — BD-001..BD-009 decision tracker + ADR index (ADR-001..ADR-015).
- `docs/acceptance/0001-mvp-acceptance-report.md` — AC-001..AC-034 evidence and externally-gated items (BD-004/BD-005/BD-006/BD-007/BD-009, ops sign-offs AC-031/AC-032, ADR-013 before broad rollout).
- `docs/plans/0001-…` §4/§13 — gate and ADR status columns.

## Architecture

The worker pipeline (PRD 0008 §5, 0010 §5.1): consume `deployment.export.requested` from the queue (Redis Streams at MVP, Kafka at GA, behind the driver seam in `internal/queue`) → load the authoritative deployment record (`internal/deployment`) → acquire a per-`deploymentId` lock (`internal/lock`) → CAS `EXPORT_QUEUED → EXPORTING` → fetch version-pinned HTML from `anvilkit-render-origin` over internal HTTP (`internal/render`; bearer token per ADR-002 + all seven `X-AnvilKit-*` pinning headers) → harvest dependencies deterministically (`internal/harvest`) → upload hashed artifacts + `artifact-manifest.json` (`internal/storage`) → submit the manifest pointer → CAS `EXPORTING → ARTIFACT_READY` → emit `deployment.artifact.ready` (`internal/emit`). The processor (`internal/worker`) owns every ack decision; the pipeline (`internal/export`) sits behind its `Exporter` seam. CDN upload/purge/verify/activation happens downstream in `cdn-service` — no such code paths exist in the worker (AC-017).

The compose stack's render-origin is a **contract stand-in** (`mocks/renderoriginmock`, §8.3 contract, immutable slug+version snapshots) until BD-007/ADR-007 confirms the real origin — swap the compose service; nothing else changes.

### Boundaries and naming

- The worker is stateless, owns no data, and never touches external services' databases — all state changes go through internal APIs. It exposes no public API of its own.
- Suffix semantics: `*-service` = synchronous API authority that owns data (all external to this repo); `*-worker` = stateless queue-driven executor. Workers are named `anvilkit-<stage>-worker` after the pipeline stage — never after a render mode, format, technology, or delivery target. A new mode of an existing stage is a new driver inside that worker; a new worker needs a new stage with its own event, scaling profile, and failure domain. The stage name propagates identically to repo, path, image, K8s Deployment, consumer group, and metrics namespace (`anvilkit_<stage>_worker`).
- `apps/demo` (in `anvilkit-studio`) must never be a render target outside local development — the startup demo guard rejects it (ADR-010: `ENVIRONMENT` strictness + hostname/loopback denylist).
- Don't hard-code "static": PRD 0008 defers `react_ssr`/`html_export` modes and the product direction includes deploy-to-server targets. Pipeline stages are pluggable strategies (mirroring the queue-driver and `Exporter` seams); new modes land as new drivers, not rewrites. Keep contract schemas and manifest semantics mode-neutral — `renderMode` and `targetId` already exist; extend those. A deploy-to-server mode revisits the `cdn-service` boundary and needs its own PRD first (PRD 0009).
- Events are validated against the embedded schemas inbound **and before emission**; `deployment.artifact.ready` carries **no `routes[]`** (ADR-001/AC-029 — route data lives in `artifact-manifest.json`).
- Persistence is Redis + object storage only — no SQL, no migrations. Redis key/stream/envelope shapes are contractual (ADR-003/ADR-011; runbooks depend on them) — treat changes to them as contract changes.
- Mocks in `mocks/` stay contract-conformant; a contract version change updates mocks and their conformance tests together.

### Reliability invariants

- `deploymentId` is the canonical idempotency key: one `deploymentId` → at most one artifact manifest. Redelivery after `ARTIFACT_READY` acks **without re-rendering** and re-emits the ready event from the stored manifest (FR-015).
- All deployment status writes are compare-and-set; the worker owns only `EXPORT_QUEUED → EXPORTING → ARTIFACT_READY | EXPORT_FAILED`. A `409 STATUS_CONFLICT` stops the worker safely. Track transitions on the local record copy — a stale `from` caused a real stuck-EXPORTING bug once.
- Storage idempotency compares the `x-amz-meta-content-sha256` object metadata; **never use S3 ETag as a content hash** (multipart ETags are not stable).
- A lock conflict alone must never ack an active deployment — leave it pending; `XPENDING`/`XAUTOCLAIM` reclaim recovers it without incrementing the business `attempt`.
- Five queue mechanisms are distinct and must never be conflated (ADR-003): delivery, pending recovery, business retry (attempt 0..3 = four executions max), delayed retry (Hash + ZSET, backoff base 10s / max 5m / jitter, envelopes idempotent by `retryEnvelopeId`), DLQ. Handoffs are write-then-ack — never ack first.
- Every failure carries a §13 registry error code + failed stage (the §15.3 span vocabulary); retryable exhaustion = DLQ + `EXPORT_FAILED` + failed event with `attempt: 3, retryExhausted: true`.

## Go Standards

- **Toolchain**: Go 1.24 is pinned in both modules — `gofmt`-clean, `go vet`-clean (enforced by `make all`), `golangci-lint` via `make lint`. Tests always run with `-race`.
- **Layering**: the processor (`internal/worker`) owns ack/retry/DLQ decisions; the pipeline (`internal/export`) sits behind the `Exporter` seam; each stage package (`queue`, `deployment`, `lock`, `render`, `harvest`, `storage`, `emit`) owns exactly its concern. Business logic never lives in transport code or `main`.
- **Interfaces**: define them next to the consumer and keep them minimal — the `Exporter` and queue-driver seams are the template. Accept interfaces, return concrete types. No new abstraction until a second implementation is real or planned (Kafka, new render modes).
- **Errors**: wrap with `fmt.Errorf("...: %w", err)` adding context at each hop; preserve sentinel and typed errors callers branch on; never discard an error silently. Classify via `internal/errclass` into §13 registry codes — **classification drives ack/retry/DLQ, so a misclassified error is a reliability bug**. Error payloads in events/statuses carry the registry code + failed stage, never internal diagnostics (stack traces, credentials, raw upstream bodies).
- **No panics** in application flow — return errors and let the processor decide. `panic` is acceptable only for truly unrecoverable programmer errors at startup.
- **Context**: `context.Context` is the first parameter of every I/O or request-scoped function; honor cancellation across queue, HTTP, Redis, and S3 calls; never store a context in a struct; take timeouts from config, not literals.
- **Concurrency**: every goroutine has an owner and a shutdown path — the worker drains on SIGTERM (deploys rely on it), so new goroutines must tie into that lifecycle via context. No fire-and-forget goroutines.
- **State & DI**: no package-level mutable state. Dependencies are constructed in `cmd/export-worker` and passed explicitly.
- **Naming**: short, lowercase, meaningful package names; no stutter (`queue.Consumer`, not `queue.QueueConsumer`). Exported symbols in public packages (the worker's `contracts/`, mock packages) are cross-module contracts — document them and treat signature changes as breaking.
- **Logging & telemetry**: only the structured logging/telemetry in `internal/obs` — no ad-hoc `fmt.Println`/`log`. Include `deploymentId` and stage context where available. Metrics live under `anvilkit_export_worker`; alert rules in `infra/alerts/`, collector config in `infra/otel-collector.yaml`.
- **Schemas**: the generator and the worker's `internal/jsonschema` implement the same subset (object/string/integer/boolean/array, required, enum, const, pattern, minLength, minimum/maximum) — stay inside it when authoring schemas.

## Modules, Packages, Dependencies

- Bun 1.3.11 (pinned via `devEngines`) + Turborepo manage the JS/TS workspaces (`apps/*`, `services/*`, `packages/*`); Go builds with the standard toolchain per module directory (`services/export-worker`, `mocks`) — there is no `go.work`.
- `mocks/go.mod` imports the worker's generated bindings via a local `replace` directive — keep it intact.
- New worker packages go under `internal/` — except the generated `contracts/` package, which is **public on purpose** (mocks and future Go consumers import it; never move it to `internal/`).
- Shared cross-service code goes under `packages/`, and only once a second consumer actually exists — otherwise keep code local to the service.
- Dependencies: clear reason required; prefer stdlib; scope to the module that needs them; run `go mod tidy` only in the affected module; keep `bun.lock` consistent with `package.json`. Check every new Go dep against the 1.24 directive rule (Hard Rules). Don't remove a dep unless confirmed unused across the workspace/module.
- Changing anything under `contracts/` or the generated bindings means checking **all** importers: the worker, `mocks/`, and the fixture corpora.

## Contracts and Codegen

- `contracts/` is the cross-repo contract of record: JSON Schema events (`events/v1`), OpenAPI internal APIs (`openapi/v1`), the artifact manifest (`artifact/v1`). **v1 is frozen** (`contracts.lock.json`, ADR-001; CI enforces via `check-freeze.ts`); evolution is additive-only within a version.
- Generated Go bindings live at `services/export-worker/contracts/` and are committed; platform CI regenerates and fails on drift. To change them: edit the contract source, rerun `bun packages/contracts-codegen/generate.ts`.

## Configuration, Secrets, Observability

- Worker config is defined by PRD 0010 §14 and implemented in `services/export-worker/internal/config` — env-driven, parsed into typed config at startup. Extend that package; no scattered `os.Getenv`.
- `ENVIRONMENT` gates demo-guard strictness (ADR-010). Internal-service auth (ADR-002) and the demo guard are high-risk — never loosen them for tests or the local stack.
- Secrets: never hardcoded, never committed, never logged — the logger redacts configured secrets and a leak-grep test enforces it; register new secrets with the redactor so both stay true. Secret management/rotation is ADR-006.
- Local stack config: `infra/docker-compose.yml` (see `infra/README.md`); K8s manifests in `infra/k8s/`.

## Testing

- Unit tests run bare (`go test -race ./...`, wired into `make all`). Prefer table-driven tests; keep them deterministic and order-independent (packages run in parallel).
- Integration tests **skip** unless `REDIS_TEST_URL` / `S3_TEST_ENDPOINT` are set, and then they **FLUSH their Redis DB** — point them only at disposable containers:
  ```
  REDIS_TEST_URL=redis://localhost:16379  S3_TEST_ENDPOINT=http://localhost:19000
  ```
  Test bucket: `anvilkit-artifacts-test`. Packages use fixed separate Redis DBs (queue=1, lock=2, worker=3, drain subprocess=5) — pick an unused DB for any new integration-test package.
- Keep fakes as strict as the contracts they imitate — the processor test fake enforces real CAS semantics; never loosen a fake to make a test pass.
- Every schema has valid + invalid fixture corpora under `contracts/`; new schema features need fixtures on both sides.
- `scripts/acceptance.sh` (against a running compose stack) is the full T-* release suite; CI runs it on main and release tags.

## Commands

```bash
bun install                                     # workspace deps
bun packages/contracts-codegen/generate.ts      # validate contracts + regenerate Go bindings
bun packages/contracts-codegen/check-freeze.ts  # verify the contract freeze (ADR-001)
bun ./scripts/dependency-audit.ts               # boundary/dependency gate (AC-002/AC-018)

make -C services/export-worker all              # worker: vet + test + build
make -C services/export-worker lint             # golangci-lint (must be installed locally)
(cd mocks && go test -race ./...)               # mock conformance suite

docker compose -f infra/docker-compose.yml up -d --build   # full local stack (infra/README.md)
./scripts/acceptance.sh                         # full T-* acceptance suite vs the running stack
(cd mocks && go run ./cmd/load-driver -n 60 -metrics http://localhost:19091)  # AC-016 load run
```

- Helper scripts against the running stack: `infra/scripts/publish-event.sh`, `seed-fixtures.sh`, `verify-artifact.sh`.
- After cloning: `git submodule update --init --recursive`.
- JS/TS lint/format: no repo-wide command exists (`turbo.json` declares `lint`/`check-types` but no package implements them) — don't invent one.

## Working Rules

- Before editing, read the relevant files and the governing PRD/ADR sections; follow existing patterns. Minimal, focused diffs — one logical concern per change; no renames, large rewrites, or formatting-only sweeps unless requested. Never fabricate commands, architecture, or requirements.
- **Definition of done**: run the relevant checks from this file (codegen + freeze for contract work, `make -C services/export-worker all` for worker work, mocks tests for mock work, dependency audit for dep changes) and confirm they pass green **before** reporting complete. If a check can't run, say why instead of skipping silently.
- Worker changes happen in the submodule's own repo history; the platform repo pins the SHA. Never move the pinned SHA as a side effect — pointer bumps are the user's deliberate action.
- Update the live status docs (`docs/adr/README.md`, acceptance report, plan §4/§13) in the same change that alters the state they track; update READMEs/runbooks when behavior they document changes; new architectural decisions get a new ADR.
- Shell: portable only (interactive shell is zsh — no bash-only constructs); scope `find`/`grep` to the repo, never filesystem-wide.
- Line endings: this environment is WSL and git may rewrite line endings — check diffs for CRLF pollution, especially in contracts and generated bindings where it surfaces as codegen drift.

## Git Rules

**Automatic commits are disabled.** Claude never creates commits on its own initiative — not to "finish" a task, not after checks pass, not because a skill or workflow normally would. All commits are made by the user after manual review.

- Never run state-changing git/gh commands: `git add`/staging, `git commit` (including `--amend`), `git rebase`, `git merge`, `git cherry-pick`, `git reset`, `git clean`, `git checkout`/`switch` (branch changes), `git tag`, `git push`, `gh pr create`. The only exception is an explicit user request in the current conversation naming the action — and even then, never force-push and never push to main.
- Read-only inspection is always fine: `git status`, `git diff`, `git log`, `git show`, `git branch`, `git submodule status`.
- Never commit inside `services/export-worker` or move its pinned SHA; the submodule's history belongs to the service repo.
- After making changes: leave everything unstaged, summarize the modified files, the root cause/reasoning, and the checks you ran — then stop.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.

- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Failing CI gates, red checks, drift (codegen/freeze/snapshot), "make checks pass" → invoke fixgates
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
