# ADR-025: Page-Generation Integration Dispositions (CD-1..CD-7) and Independently Deployable Agent Runtime Topology

| Item | Decision |
| --- | --- |
| Status | **Accepted.** All three approvals given by the Platform owner 2026-08-24. Amended 2026-08-25 with two owner decisions — the page-persistence request shape (§15) and apply-redemption authority (§16). CD-6 and CD-7 remain gated on external material that approval cannot supply — see §14. |
| Date | 2026-08-24 |
| Scope | Page and component-design generation milestone; Studio/Platform integration contract; Agent execution-plane topology |
| Related ADR | ADR-016, ADR-018, ADR-019, ADR-021, ADR-022, ADR-023, ADR-024 |
| Governing design | `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-0808.md` §4.1, §4.2, §5.1–§5.4 |
| Governing plan | `docs/plans/0006-anvilkit-page-component-generation-detailed-development-design-and-plan.md` WP0, §14 PR 0 |
| Supersedes | Nothing. Adds Platform authority where none existed. |

## Context

AnvilKit Studio has been blocked on task P2-06 because no formal Platform
acknowledgement of the Studio/Platform integration contract exists. Seven
contract decisions — referred to in Studio's working material as CD-1 through
CD-7 of DOC-03 — have been carried in Studio-local state rather than in any
Platform-owned artifact.

Two facts make that intolerable for the page-generation milestone.

First, the referenced Studio document is not a durable Platform authority. A
re-audit at Platform `0caaf230` found zero occurrences of `DOC-03`, `CD-1`
through `CD-7`, or the Studio BFF integration anywhere in this repository, and
the surviving record lives in `anvilkit-studio/.claude/state/phase-run.json` —
local session state, not reviewable governance. Plan 0006 §1.3 item 7 forbids
using local or ignored documents as release evidence, and WP0 requires the
acknowledgement to survive a fresh clone. Under ADR-023, only `docs/adr/` is
tracked under `docs/`, so an ADR is the only Platform artifact that can carry
this. This ADR therefore **restates** the substance rather than citing Studio.

Second, several CDs have moved in Platform code since the last Studio audit.
Plan 0006 §1.3 item 2 is explicit that code inference is not acknowledgement:
a schema that happens to satisfy a request does not constitute an agreement
that it is the answer. Each disposition below is stated as an intended Platform
commitment, with the current code state recorded as evidence of feasibility
rather than as the decision itself.

Separately, design 0001 §4.1 requires that Manager and Specialist reasoning not
run in-process in the production Agent Service, and §5.2 requires each Manager
and Specialist to be a distinct, independently released Agent Runtime Unit. No
Agent Runtimes repository, runtime manifest, task/result protocol binding,
workload identity, or independent release path exists today. That topology is
an execution-plane split with significant ownership consequences, so it belongs
in the same owner decision as the CD dispositions.

### Verification basis

Every code claim below was verified directly against this repository at Platform
`0caaf230` and Agent Service `53ddd400` on 2026-08-24. Where the prior Studio
audit is contradicted, §12 records the correction.

## Decision

>
> **§1 (CD-1 through CD-7) is in force** as of 2026-08-24 under approval 1 in §14.
>
> **§3 (Agent Runtimes repository and submodule ownership) and §9 (Page Preview
> Worker repository boundary) are not in force.** They await approvals 2 and 3.
> No repository, remote, or submodule may be created, adopted, or pinned under
> either section until then.
>
> Sections 2 and 4 through 8 state boundaries that constrain the accepted
> dispositions and are in force with §1; they create no repository or external
> resource on their own.
>
> This document was drafted by an automated execution loop, which is not
> competent to accept it. §14 records who accepted what, and on what basis.

### 1. CD-1 through CD-7 dispositions

| CD | Question | Proposed disposition | Contract / operational target | Verified state at `0caaf230` / `53ddd400` | Acceptance evidence required |
| --- | --- | --- | --- | --- | --- |
| **CD-1** | Page/component operation mapping, server-assigned run identity, and non-interactive definition policy | **Accept with change.** Run identity stays server-assigned; clients never propose a run id. The `page-change` and component-design operations get first-class domain values and registered immutable definitions. No generic Manager fallback may serve a known page or component operation. | `contracts/agent/schemas/agent-definition.schema.json` `domain` enum; definition registry in `contracts/agent/registries/registry-set.json` | `domain` enum is `platform-agent \| pagix-page \| contract-runtime` (lines 46–51) — **no page/component-editor domain exists**. `stopConditions` (line 143) is a 1..16 enum that already carries interactive stops. | PR 1 + PR 2: enum extension, registered definitions, and a regression proving a page run cannot finalize a component artifact |
| **CD-2** | Input carrier for generation requests | **Accept as built.** Bounded inline user input plus artifact references is the carrier; this is materially DOC-03 option (a). Platform commits to these bounds as contract, not incidental implementation. | `contracts/agent/schemas/create-agent-run-request.schema.json` | `input.userInput` `maxLength` 16384 (lines 38–41); `input.artifactInputs` `maxItems` 32 (lines 43–46); each documented as omitted when the run starts from the other alone. | Acknowledgement only. No contract change required. Studio may depend on these bounds. |
| **CD-3** | Artifact-content contract | **Accept with change.** The governed-metadata route stands. A separate, explicitly governed content channel is added; artifact bytes are never returned from the metadata route, and the access-purpose header stays required. | `GET /v1/workspaces/{ws}/artifacts/{id}` and a new governed content grant | Route is present (`internal/api/api.go:101`, dispatched at `serveArtifact`, `internal/api/api.go:262`) and returns **governed metadata only**. `X-AnvilKit-Access-Purpose` is a required header (`contracts/agent/openapi/agent-service.openapi.json:2138`, carried in the generated client). A `POST .../custody` decision route exists. No byte or signed-URL retrieval exists. | PR 4: content-grant contract, composed route, and proof that Studio's BFF can retrieve content without exposing credentials |
| **CD-4** | Canonical idempotency error codes | **Accept with correction.** Two distinct codes are correct and intentional: `IDEMPOTENCY_CONFLICT` for a conflicting in-flight/settled run, `IDEMPOTENCY_KEY_REUSED` for a key replayed with a different request digest. Studio must handle both; DOC-03 §10 mapping only the latter is a Studio-side gap, not Platform drift. | `services/agent-service/internal/problem/problem.go` | Both codes exist and are distinct: `CodeIdempotencyConflict` (line 42) and `CodeIdempotencyKeyReused` (line 43). | Acknowledgement plus a Studio client-side mapping update in PR 7 |
| **CD-5** | Contract BOM and catalog-digest binding | **Decided 2026-08-24 (§13.1 recommendations adopted).** `contractBomReference` stays server-resolved. Envelope-level catalog carriage already exists (§12.3). **5a = option B:** a catalog authority — not Studio — produces `CatalogSnapshot`. **5b = option B:** `catalogDigest` becomes an explicit required field on `apply-authorization.schema.json` beside `contractBomDigest`/`policyDigest`/`definitionDigest`, added to `identityFields`, via one atomic ADR-018 pre-release refactor. | `TargetSnapshot` (exists), `CatalogSnapshot` (new, PR 1), `apply-authorization.schema.json` (decision), `PageCandidate` (new, PR 1) | `contractBomReference` is required on `agent-run.schema.json:19`, `agent-event.schema.json:20`, `agent-task.schema.json:23`, and is **absent from `CreateAgentRunRequest`** (required set is `kind, definition, operation, target`) — consistent with server resolution. `target-snapshot.schema.json` **already requires `catalogDigest`** and lists it in `identityFields`. `catalogDigest` appears in **no other canonical schema** — notably **not** in `apply-authorization.schema.json`, whose required set carries `contractBomDigest`, `policyDigest`, and `definitionDigest` but no catalog digest. No `catalog-snapshot.schema.json` exists. | PR 1: `CatalogSnapshot` schema + the `apply-authorization` field refactor as one atomic change series (registry, profile, lock, fixtures, generated Go/TS). PR 9: digest-preserving commit. |
| **CD-6** | Workload trust registration for the Studio BFF | **Decided 2026-08-24 (§13.2 option C adopted).** The Studio BFF workload is registered as a trust-snapshot entry under a dedicated audience, and the advertised-but-unimplemented OAuth `tokenUrl` is **withdrawn** from the canonical OpenAPI. The registration procedure, staging endpoint identity, and credential-rotation owner remain **owner-supplied operational inputs** and are still outstanding. | `ANVILKIT_AUTH_TRUST_SNAPSHOT`, `auth.SourceWorkload`, staging endpoint | `ANVILKIT_AUTH_TRUST_SNAPSHOT` is parsed (`internal/config/config.go:241`) and required. `auth.SourceWorkload` exists (`internal/auth/auth.go:92`) and browser-sourced claims are rejected (`:130`). The OpenAPI declares `clientCredentials` `tokenUrl` `https://auth.anvilkit.dev/oauth/token` (`:2023`) with **no Go implementation behind it**. | PR 1 may withdraw the `tokenUrl` declaration atomically. The registration procedure, endpoint identity, and rotation owner are owner-supplied and **still outstanding** — they gate PR 4, not PR 1. |
| **CD-7** | Production composition and real model path | **Decided 2026-08-24 (§13.3 option A adopted).** One concrete provider adapter is implemented behind the existing provider-neutral Model Gateway, and PR 4 is pointed at an approved staging environment. The composition gap is narrower than previously reported (§12.1); the unreachable model path is due to the absent adapter, not unwired packages. | `internal/modelgateway`, staging provider credentials | `internal/planning`, `internal/modelgateway`, `internal/agent/runner`, and `internal/scheduler` **are all in the production build closure** of `cmd/agent-service` (verified by `go list -deps`). `internal/modelgateway` contains `gateway.go`, `continuation.go`, and `fake.go` — **no concrete provider adapter**. | PR 4: real-provider smoke evidence against an approved staging environment. Which provider, whose credentials, and which staging endpoint are **still outstanding** owner inputs — they gate PR 4, not PR 1. |

All seven dispositions are accepted as of 2026-08-24. CD-2 and CD-4 required
acknowledgement only. CD-1, CD-3, and CD-5 are now actionable contract work and
are the substance of PR 1 and PR 2.

**CD-6 and CD-7 remain gated on owner-supplied external inputs** — a workload
registration procedure, endpoint identity, and rotation owner; and a provider
choice, credentials, and staging endpoint. Those gate PR 4. They do not gate
PR 1 or PR 2, and no local work produces them.

### 2. Agent Runtime topology

Manager and Specialist reasoning does not run in-process in the production
Agent Service. Each enabled Manager and Specialist is built and operated as a
distinct **Agent Runtime Unit** with exactly one of each of the following:

- accountable owner;
- immutable image digest;
- Deployment and workload identity;
- task channel and concurrency policy;
- CPU, memory, timeout, and scaling policy;
- telemetry namespace;
- release pipeline; and
- drain and rollback target.

Units may share source and the runtime SDK. They never share a production
process or a scaling boundary. This is an **execution-plane split only**; §8
governs what it does not move.

### 3. Agent Runtimes repository and submodule ownership

**Proposed, and blocked on team confirmation.** CLAUDE.md requires team
confirmation before any new Git submodule, and `agent-service` and
`export-worker` are currently the only approved Platform-owned service
submodules.

- Exactly **one** Agent Runtimes repository holds every Agent Runtime Unit, with
  independent per-Agent build and release targets.
- **One repository or submodule per Agent is prohibited** (design 0001 §4.1).
- It is added as one Platform submodule only after team confirmation, and the
  pointer is pinned only after the repository commit and its ownership are
  independently accepted.
- The shared Go runtime SDK lives in that repository and has a named owner.

**Unresolved and required from the owner:** the exact remote target, the
accountable repository owner, and confirmation that a submodule is wanted at
all. A checkout named `/root/Rhett/anvilkit-agents` exists on this machine but
is **not** this repository: it is not a Git repository, and it is a
Python/LiteLLM proxy project rather than the Go runtime monorepo the design
requires. It must not be adopted, initialised, or pinned.

### 4. Canonical AgentTask reuse

`contracts/agent/schemas/agent-task.schema.json` is the **single canonical
Agent-runtime invocation envelope**. It already exists, is governed by PRD 0012,
and is exactly bounded (`minProperties` 14 / `maxProperties` 14).

A parallel or per-Agent task family is prohibited. Agent Runtime work extends
the canonical envelope through the governed process or it does not happen.

### 5. AgentRuntimeManifest and AgentRuntimeResult boundary

Two contracts are missing and must be added canonically (PR 1). Neither exists
today — the repository contains zero references to either name.

**AgentRuntimeManifest** binds runtime-unit identity and supported definition
digest; image digest, source commit, provenance and signature references;
invocation-protocol and Contract BOM digests; workload identity, audience,
allowed control-plane endpoints, and network policy; queue, concurrency,
timeout, resource, and scaling profiles; telemetry namespace, health/readiness
behavior, and release owner; and rollout, compatibility, drain, and rollback
policy.

**AgentRuntimeResult** carries the selected definition/runtime/protocol digests,
task and physical-attempt identity, bounded usage, exactly one `TurnDecision`,
safe diagnostics, signature and provenance references, and trace/evidence
correlation.

`AgentRuntimeResult` **never carries authoritative workflow state.** It is a
bounded proposal that Agent Service validates and may reject.

### 6. Per-Agent identity, queue, scaling, release, drain, rollback, incident ownership

Each unit is released independently. A new runtime or definition digest deploys
alongside the previous accepted pair, is admitted through an explicit rollout
policy, and is routed **only to new runs**.

**In-flight AgentRuns remain pinned to their admitted definition/runtime pair
until terminal reconciliation.** A rollout never migrates an in-flight run.

Rollback restores the prior accepted pair for new admissions without rewriting
or migrating active workflow state.

Each unit carries one named incident owner. Changing one Agent must not
redeploy, rescale, or reroute any other Agent, Agent Service, Studio, or Pagix —
and that independence is an acceptance test, not an aspiration.

### 7. No direct Agent-to-Agent calls

An Agent Runtime Unit may call only the governed Model Gateway and explicitly
allowed read-only context or artifact endpoints, using task-scoped credentials.

It may not call another Agent Runtime Unit, select another Agent's endpoint, or
perform Agent-to-Agent networking of any kind. All delegation and every Child
AgentRun is dispatched by Agent Service and returns through Agent Service.

Absence of a direct Agent-to-Agent network path is a required acceptance check
(plan §15.1), not a code-review opinion.

### 8. No transfer of AgentRun or workflow authority

Runtime separation moves **physical execution only**. Agent Service remains the
sole authority for: AgentRun and durable workflow; AgentRegistry and runtime
selection; budgets and usage; delegation and Child AgentRun creation; Tool Guard
and Tool execution; Validators; artifacts and Evidence; and review, approval,
and authorization.

An Agent Runtime Unit must not own durable workflow state, call another Agent
directly, execute Tools, select endpoints or credentials, access Platform or
Pagix databases, bypass validation, receive provider keys, or migrate an
in-flight AgentRun during rollout.

Any proposal that achieves independent deployment by moving workflow or Tool
authority into an Agent runtime is rejected by this ADR.

### 9. Page Preview Worker repository boundary

The Page Preview Worker is a **separately governed repository and runtime**. It
is not an Agent Runtime Unit and does not live in the Agent Runtimes repository.

Export Worker must not be reused for interactive page preview. Its preview
semantics mean deployment export against a render origin, and its dependency
audit forbids the frontend runtime dependencies a Puck/Chromium preview
requires. Widening it would break AC-002/AC-018.

The Preview Worker owns isolated deterministic rendering, screenshot, render
diagnostics, and accessibility reporting. It owns no business-state commit,
approval, or publication authority.

**Unresolved and required from the owner:** repository ownership and exact
target. No such checkout exists.

The conditional Component Build/Certification Worker is likewise outside the
Agent Runtimes repository and outside this decision entirely.

### 10. Repository baselines

Recorded 2026-08-24. These are the exact commits every disposition above refers
to and the baseline for all acceptance evidence.

| Repository | Branch | Commit | Worktree at record time |
| --- | --- | --- | --- |
| `anvilkit-platform` | `main` | `0caaf230cd343105d01a012580421ec80f479a23` | clean |
| `services/agent-service` (submodule) | `heads/main` | `53ddd40066b9d2a54d5b413c62c71689c6faf9de` | pointer unchanged |
| `services/export-worker` (submodule) | `heads/main` | `f02db28dfb19c6b178c2a65f9512cf44923419f1` | pointer unchanged |
| `anvilkit-studio` | `main` | `dbc14557d4314933e9d39fb63f45bc76ab085bef` | one pre-existing change: `apps/studio/preview-verify.png` |
| `pagix-cloud` | `main` | `d1a1947a644472b9d0376ab00dfc2231d0d533ab` | clean |
| Agent Runtimes | — | — | **does not exist; unapproved** |
| Page Preview Worker | — | — | **does not exist; unapproved** |

### 11. Required acceptance evidence

Acceptance of a later work package requires all of the following, at exact
commits, kept separate from local worktree evidence:

1. canonical contract generation, fixture, profile, lock, parity, and drift
   checks green after any schema or registry change;
2. `make -C services/agent-service all` plus the current Agent Service CI target;
3. per-unit format, static-analysis, unit, protocol-conformance, image,
   provenance, deployment-policy, workload-identity, queue-isolation, scaling,
   drain, independent-release, rollback, and in-flight-pinning gates for **every**
   Agent Runtime Unit;
4. positive proof that no production in-process Agent fallback and no direct
   Agent-to-Agent network path exists;
5. Preview Worker typecheck, lint, unit, deterministic-render, accessibility,
   security-policy, and browser E2E gates with nonzero counts;
6. Studio scoped gates for component-editor, plugin-code-editor, and AI copilot,
   followed by the full phase gate for P2 acceptance;
7. Pagix affected-module, transaction-rollback, contract, and authorization
   tests, plus the required module-with-dependencies build;
8. cross-repository failure, retry, replay, restart, and lost-response scenarios;
   and
9. real staging provider conformance once an approved environment exists.

Mocks are never staging evidence. Missing external evidence is reported as
missing and never fabricated.

### 12. Corrections to the prior Studio audit

#### 12.1 CD-7 composition claim

The Studio re-audit recorded CD-7 as `internal/planning is NOT imported and only
modelgateway/postgres (persistence) is wired, so model calls remain unreachable`.
That conclusion was drawn from direct imports in `cmd/agent-service/main.go`.

**It is wrong on the composition point.** `go list -deps ./cmd/agent-service` at
`53ddd400` shows `internal/planning`, `internal/modelgateway`,
`internal/agent/runner`, `internal/scheduler`, and `internal/execution` all
present in the production build closure — reached transitively rather than by a
direct import in the composition root. `cmd/agent-service/closure_test.go`
asserts exactly this set as a required production closure.

**The conclusion nevertheless survives for a different reason.**
`internal/modelgateway` holds `gateway.go`, `continuation.go`, and `fake.go` and
contains no concrete provider adapter, so the production model path is
unreachable because no provider is implemented — not because the package is
unwired. CD-7 therefore remains open, and PR 4 must supply a real provider plus
staging smoke evidence.

#### 12.2 AgentRunner is in-process only

`internal/agent/runner` contains no HTTP or dial code, so today's AgentRunner is
**in-process only** and no remote runtime dispatch path exists at all.
Establishing that path is PR 4's substance, and removing the in-process
production reasoning path is a stop-condition-guarded part of it.

#### 12.3 Catalog-digest carriage already exists at the envelope level

The Studio audit recorded CD-5 as `no component-editor generation BOM/catalog-digest
carriage defined`. That is half right and materially misleading.

`contracts/agent/schemas/target-snapshot.schema.json` **already requires**
`catalogDigest` and lists it among `identityFields`, so a catalog digest is
already frozen into the canonical target envelope and already participates in
that envelope's identity. Plan §6.4's requirement that the digest be *bound into
TargetSnapshot* is therefore already satisfied.

What is genuinely missing is narrower and more specific:

1. the `CatalogSnapshot` **content** schema the digest refers to — no
   `catalog-snapshot.schema.json` exists; and
2. binding into **Apply Authorization** — `catalogDigest` appears in no schema
   other than `TargetSnapshot`, and `apply-authorization.schema.json` requires
   `contractBomDigest`, `policyDigest`, and `definitionDigest` but carries no
   catalog digest at all.

Stating CD-5 as "no carriage exists" would have led PR 1 to add a redundant
carriage field beside a required one that already works. §13.1 states the actual
choice.

### 13. Decision support: concrete options for the three open CDs

CD-5, CD-6, and CD-7 are the only dispositions in §1 that cannot be closed by
reading code. Each is stated below as a pick-one so acceptance is a choice
rather than a blank page. A recommendation is given, but the choice is the
owner's.

#### 13.1 CD-5 — catalog binding

Given §12.3, envelope carriage already works. Two decisions remain.

**Decision 5a — who produces `CatalogSnapshot`?** Plan §6.4 permits "Studio or
the catalog authority". The producer owns its immutability and digest stability.

- **A. Studio produces it** from the catalog it already renders with. Closest to
  the truth Studio uses; makes Studio an artifact producer.
- **B. A catalog authority produces it** (Pagix or a registry) and Studio
  consumes it. Keeps Studio a consumer; requires the authority to exist.

*Recommended: B* — the digest is bound into apply authorization and therefore
into a security decision, and a producer that also consumes its own snapshot is
a weaker guarantee.

> **SELECTED 2026-08-24: option B.**

**Decision 5b — how does `catalogDigest` bind into Apply Authorization?**

- **A. Action bytes only.** Include the catalog digest in the canonical bytes
  hashed into `actionDigest`; add no field. No kernel-contract change, and the
  binding is cryptographic — but invisible to any verifier that cannot recompute
  action bytes, and the digest must be obtained out of band to check it.
- **B. Explicit required field.** Add `catalogDigest` to
  `apply-authorization.schema.json` beside `contractBomDigest`, `policyDigest`,
  and `definitionDigest`, and include it in `identityFields`. Symmetric with the
  three digests already present, independently verifiable, and matches §6.4
  literally. Costs one atomic P0-kernel contract refactor across registry,
  profile, lock, fixtures, and generated Go/TypeScript — which ADR-018 permits
  before external release.
- **C. Both.**

*Recommended: B.* The three sibling digests are already explicit fields; making
the catalog digest the one implicit exception would be an inconsistency a
reviewer has to rediscover. ADR-018 makes the refactor cost a one-time,
pre-release cost.

> **SELECTED 2026-08-24: option B.**

#### 13.2 CD-6 — Studio BFF workload trust

- **A. Trust-snapshot entry.** Register the Studio BFF workload in
  `ANVILKIT_AUTH_TRUST_SNAPSHOT` under a dedicated audience. `auth.SourceWorkload`
  already accepts this source and already rejects browser-sourced claims.
  Rotation is re-issuing the snapshot. Uses mechanics that exist today; needs a
  documented procedure and a named rotation owner.
- **B. Implement the advertised OAuth flow.** Build the `clientCredentials`
  `tokenUrl` the OpenAPI already publishes. Matches the published spec, but no
  implementation exists behind it and this requires an auth service.
- **C. Trust-snapshot entry, and remove the advertised `tokenUrl`.**

*Recommended: C for staging.* A alone leaves a real defect in place: the
canonical OpenAPI advertises `clientCredentials` at
`https://auth.anvilkit.dev/oauth/token` with **zero** Go implementation behind
it. A published contract that promises an endpoint nobody implements is a
correctness problem independent of which trust mechanism wins — whichever option
is chosen, that declaration must be either implemented or withdrawn.

> **SELECTED 2026-08-24: option C.**

**Still required from the owner regardless of option, and still outstanding:**
the registration procedure, the staging endpoint identity, and the named
credential-rotation owner.

#### 13.3 CD-7 — real model path

The Model Gateway is genuinely provider-neutral: `internal/modelgateway` holds
`gateway.go`, `continuation.go`, and `fake.go` and no concrete provider adapter.

- **A. Implement one concrete provider adapter** behind the existing gateway and
  point PR 4 at an approved staging environment.
- **B. Defer the real provider.** PR 4 then cannot produce staging smoke
  evidence, and Gate B stays open by construction.

*Recommended: A.* B does not close the milestone's stated first
external-dependency criterion, so it defers the gate rather than passing it.

> **SELECTED 2026-08-24: option A.**

**Still required from the owner and not inferable from code, and still
outstanding:** which provider, whose credentials, and which staging endpoint.
No local work produces these.

### 14. Owner acceptance

This ADR was drafted by an automated execution loop, which is not permitted to
accept its own proposal. Three separate approvals are required. **One has been
given.**

| # | Approval required | Accountable owner | Status |
| --- | --- | --- | --- |
| 1 | CD-1 through CD-7 dispositions in §1, selecting one option per §13.1 (5a, 5b), §13.2, and §13.3 | Platform owner | ☑ **GIVEN 2026-08-24** |
| 2 | Agent Runtimes repository: accountable owner and confirmation that a Platform submodule is wanted (CLAUDE.md team-confirmation rule) | Platform owner + team | ☑ **GIVEN 2026-08-24** — exact remote target still to be named; see below |
| 3 | Page Preview Worker repository: accountable owner | Platform owner | ☑ **GIVEN 2026-08-24** — exact remote target still to be named; see below |

#### Record of approval 1

- **Decided by:** the Platform owner (repository owner `ancyloce`), by direct
  instruction on 2026-08-24.
- **Decision:** accept the §1 dispositions, adopting the §13 recommendations —
  §13.1 5a option B, §13.1 5b option B, §13.2 option C, §13.3 option A.
- **Transcribed by:** the execution loop, into this tracked ADR. The loop
  supplied the options and the recommendations; it did not make the choice.
- **Why this is a tracked record and not a chat acknowledgement:** plan 0006
  WP0 lists "the proposed acknowledgement exists only in chat, a local report,
  or an ignored document" as a stop condition. The decision is therefore
  recorded here, under ADR-023's tracked `docs/adr/` path, where it survives a
  fresh clone.

#### Record of approvals 2 and 3

- **Decided by:** the Platform owner, by direct instruction on 2026-08-24 ("approve all").
- **Scope:** ownership and the decision to proceed. Both repositories may be created and developed.
- **Not supplied by the approval:** the exact remote targets. The repositories are therefore created as **local checkouts with no remote**, at paths inferred from the existing sibling convention:
  - Agent Runtimes → `/root/Rhett/anvilkit-agent-runtimes`
  - Page Preview Worker → `/root/Rhett/anvilkit-page-preview-worker` (follows the `anvilkit-<stage>-worker` naming rule)
  Correct either path before a remote is attached; nothing downstream depends on the name except the eventual submodule entry.
- **The Platform submodule is still not pinned.** Per §3 and plan PR 3, the pointer is added only after the repository commit and its ownership are independently accepted. Creating the repository does not create the submodule.

#### What approval cannot supply

CD-6 and CD-7 remain gated regardless of approval, because what they need is material rather than permission:

- the staging workload-registration procedure, endpoint identity, and credential-rotation owner (CD-6);
- the provider choice, its credentials, and a reachable staging endpoint (CD-7).

Until those exist, PR 4's dispatch and staging half, PR 6, and PR 7 cannot be exercised, and Gate B cannot close.

#### What approval 1 unblocks, and what it does not

**Unblocked:** PR 1 (canonical product and Agent Runtime contracts) and PR 2
(definitions, runtime bindings, and compatibility). Both rest on CD-1, CD-3, and
CD-5 only.

**Still blocked:**

- **PR 3** — Agent Runtimes repository and Page Agent units. Requires approval 2.
  No repository may be created, adopted, or pinned before it.
- **PR 5** — Page Preview Worker. Requires approval 3.
- **PR 4** — Agent Service runtime dispatch and artifact content. Requires the
  CD-6 registration procedure, endpoint identity, and rotation owner, plus the
  CD-7 provider choice, credentials, and staging endpoint. None is obtainable
  from local work.

Gate B cannot close until those external inputs exist, regardless of how much
contract and control-plane code is written.

### 15. Amendment 2026-08-25 — page-persistence request shape

`PersistAuthorizedPageRequest` originally stated that `pageDocumentDigest` must
equal the authorization's `artifactDigest`, "for this operation the authorized
artifact IS the page document being applied". **That was false.** The finalized
artifact of a `page-change` run is the `page-candidate`
(plan §5.1, and the finalization rule in `artifacts.FinalizableBy`), the approval's
`actionDigest` is that same candidate digest (`executor.go:1458`), and
`page-candidate.pageData` is an `ArtifactReference` — so the page document is a
separate artifact one level below the candidate, and neither digest in the
authorization covered its bytes.

**Owner decision (Option A):** the request carries the reviewed `pageCandidate`
verbatim alongside `pageDocument`, and the domain owner verifies four bindings
from the request alone:

1. `candidateDigest` == the authorization's `artifactDigest`;
2. `candidateDigest` == SHA-256 of the `pageCandidate` bytes;
3. `pageDocumentDigest` == SHA-256 of the `pageDocument` bytes;
4. `pageDocumentDigest` == the `pageData.digest` inside `pageCandidate`.

`/pageData` is one of the candidate's identity fields, so the candidate's digest
already covers the document: document → candidate → authorization is closed, and
Pagix needs no second channel to check it.

Both payloads are carried as strings rather than embedded objects because their
digests are taken over exact bytes. The cost is recorded in the schema: the
governed 1 MiB ceiling for a canonical document is fixed, the candidate occupies
256 KiB of it, so `pageDocument` is bounded at 744 KiB rather than 768 KiB.

Rejected alternatives: adding a document digest to the authorization binding
(rotates `apply-authorization` a second time after CD-5b and cuts against
authorizations binding the artifact), and carrying only the `pageData` reference
(Pagix could not trust a reference it cannot recompute).

### 16. Amendment 2026-08-25 — apply-redemption authority

**Question:** who redeems the Apply Authorization and calls Pagix persist?

Design 0001 §2.2 (Integration Normative) says Agent Service "never writes a
page" and names Studio's Puck Apply Adapter the page-mutation dispatcher; plan
§7.5 has Studio materialize the Puck Data and the workflow *consume* the
receipt. But the implemented Agent Service sends a page-persistence command
itself: `executor.go:1654` → `domaincommit.Coordinator.resume` →
`pagixclient.Client.Persist`, which refuses any operation but `page-persistence`.
§2.2's word "***interactive*** page-mutation dispatcher" left room for a second
non-interactive path, which is what the implementation had built.

**Owner decision: Studio redeems.** Agent Service issues the authorization and
then reconciles the authoritative domain event. It does not send the page
document, does not construct `PersistAuthorizedPageRequest`, and needs no
in-process artifact byte read — of which it has none today
(`artifacts.ObjectStore` is `PutOnce | Delete | Exists`; `artifacts.Reader` is
`SignRead | Verify | Revoke`).

**Consequence, recorded as a PR 10 finding rather than applied here.** The
Agent Service page-persistence send and the uncertainty machinery built over it
must be removed: the write-ahead `Issued` marker, reconcile-first restart,
`ReconcileAttempts` / `FirstUncertainAt`, the bounded escalation window, and
operator resolution all exist *because* Agent Service sends a command whose
outcome can be uncertain. If Studio sends, that uncertainty is not Agent
Service's to carry. The change spans `internal/domaincommit/commit.go`,
`internal/domaincommit/postgres/store.go`, `internal/execution/executor.go`, and
`internal/workflow/workflow.go` — a durable-workflow lifecycle change across a
Postgres store and a state machine, with roughly thirty references to the
escalation machinery alone. It was not attempted during the implementation pass,
which forbids running the suites that would validate it.

## Consequences

Accepting this ADR unblocks Studio P2-06, which has been waiting on Platform
acknowledgement, and makes CD-2 and CD-4 dependable contract surface for the
Studio BFF. It also commits Platform to an execution-plane split whose real
cost is operational: every enabled Manager and Specialist becomes a separately
owned, separately released, separately paged deployment, and the number of
release pipelines grows with the number of Agents rather than staying constant.

Rejecting or deferring it leaves Studio blocked and leaves the page-generation
milestone without contract authority; no amount of Platform code changes that,
because the missing thing is a decision rather than an implementation.

Two consequences deserve to be named plainly. First, the independence
requirement is expensive to verify — proving that changing one Agent does not
redeploy, rescale, or reroute another is a real test matrix, not a design claim.
Second, three of the seven CDs cannot be closed inside this repository at all;
CD-6 and CD-7 need an environment and credentials that no amount of local work
will produce.

This ADR does not decide Contract Runtime topology (ADR-022), Agent Service
instance state (ADR-024), or anything about conditional component build,
certification, or publication, which remain a separate product decision,
security design, and acceptance series.
