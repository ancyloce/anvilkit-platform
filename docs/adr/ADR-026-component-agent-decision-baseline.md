# ADR-026: Component Agent Decision Baseline (D1–D17) and Suite Governance

| Item | Decision |
| --- | --- |
| Status | **Accepted** — approved 2026-09-01 by **Rhett**, who holds every accountable role in §6 (OI-01 complete; `docs/acceptance/component-agent/m0/m0-07-08-owner-signoff-packet.md` §3). **D1–D10 and D11–D17 are frozen as of 2026-09-01.** Any deviation from a frozen decision requires an approved superseding record before the affected milestone continues (PRD-CA-0001 §25; plan 0008 §10). Conditions carried as amendments (M0-02 §5, K-1…K-7): D3/D15 and D4/D16 accepted jointly; D6 accepted as a commitment discharged by OI-03 (2026-10-02) and OI-11 (2026-12-11); D9 frozen with the M0-06 readings (load-model mapping, row budget); D13 accepted with the exact audience string fixed by OI-02 and the `client_credentials` service principal delivered by plan 0010 AS-M0-04 before the M1 freeze; D17 accepted with the plan 0006 §2.2/§18 amendment applied in the same act (2026-09-01); D11's team confirmation for the `anvilkit-component-build-worker` submodule remains a separate act (K-6, plan 0013 WM0-02). Acceptance packet: `docs/acceptance/component-agent/m0/m0-02-decision-freeze-packet.md`. |
| Date | Drafted 2026-08-29; accepted 2026-09-01 |
| Scope | Component Agent product (PRD-CA-0001 and child PRDs); Phases 0–3 |
| Relates to | ADR-018 (canonical contracts), ADR-019 (DBOS), ADR-022 (Contract Runtime topology), ADR-023 (local-only docs), ADR-025 (page generation dispositions, runtimes, preview worker); PRD 0009, 0012, 0013, 0015, 0016; plan 0006 §2.2, §8.2, §18 |
| Supersedes | None. Where a decision below conflicts with an accepted ADR, §4 records the conflict and the proposed resolution; acceptance of this ADR requires the amendment named there. |

## 1. Context

The Component Agent PRD suite (v1.0, authored 2026-08-29) froze ten decisions ("CA-DECISION-2026-08-30, Option A for D1–D10") and cited `ADR-CA-0001…0008` and a decision register that did not exist. Report 0003 found five of the frozen choices contradict governance that CI enforces today, and report 0004 found seven further decisions the seven-step workflow depends on that no document had made. This ADR records all seventeen in one place so the suite has an anchor, and states which are consistent with accepted governance, which require an amendment, and which are still open.

Nothing here changes the shape of the platform: three repositories integrating only through canonical contracts, Agent Service as the sole run authority, Pagix as the business-state owner, Studio as the human surface, Components CI as the only npm publisher.

## 2. Decisions D1–D10 (as frozen by the suite)

**Frozen 2026-09-01** by the acceptance of this ADR, subject to the conditions in the Status row. The "status against accepted governance" column records consistency with governance, not the decision's own state; each row's decision state is `Frozen 2026-09-01` and is mirrored in the register §1.

| # | Decision | Frozen choice (suite v1.0) | Status against accepted governance |
|---|---|---|---|
| D1 | Catalog index | PostgreSQL `tsvector` + GIN + `pg_trgm`; bounded process-local cache non-authoritative; no vector store in P0/P1 | Consistent. Not implemented (no catalog module exists). |
| D2 | Brand aggregation | Pagix Brand Context aggregation API composing existing Library and Colors without merging authority | Consistent with PRD 0013's authority model. Requires Pagix build (PRD-PX-CA-0001 §13 inventory). |
| D3 | Artifact storage and promotion | S3-compatible content-addressed store; PostgreSQL compare-and-set metadata promotion | **Promotion: consistent and implemented.** **Storage: conflicts with the qualified implementation** (objects in PostgreSQL behind the `ObjectStore` port; no S3 SDK). Proposed resolution in §4 (D15). |
| D4 | Scheduler readiness | PostgreSQL queue authority; `LISTEN/NOTIFY` hint; bounded polling; `FOR UPDATE SKIP LOCKED` + CAS leases | **Authority and fencing: consistent and implemented** (versioned CAS leases, epochs, fence tokens, DLQ). `SKIP LOCKED`/`NOTIFY` are not implemented. Proposed resolution in §4 (D16). |
| D5 | Distribution targets | Public npmjs for eligible components; private signed Pagix Runtime Capsule; no private registry in P0/P1 | Consistent. Nothing implemented; Studio CI publishes `@anvilkit/*` today. |
| D6 | GitHub release gate | Protected PR mandatory for public publication; Components CI sole npm publisher | Consistent with reality (isolated `NPM_TOKEN` in the Components repository CI). Requires the single-publisher choice between the two existing workflows (register D-15). |
| D7 | Provider continuation | Encrypted 24-hour optional cache with strict invalidation; replay always available | Consistent; implemented except the 24 h ceiling, which is caller-supplied today (PRD-AS-0001 AS-FR-030, PRD-MEM-0001 MEM-FR-002 now require the store to enforce it). |
| D8 | Memory | Off in P0/P1; opt-in Controlled Beta in P2; gated GA in P3; new Teams default off | Consistent and proven (empty `agent_memory`, `policy.memory.none`). |
| D9 | Load, SLO, budget, size limits | Frozen in PRD-CA-0001 §16 | Consistent as targets; only the durable-create proof exists as evidence. The ×1.25 reservation and ×2 ceiling are not implemented (budget uses headroom micros and basis points). |
| D10 | Decision governance | Named owner, date, and record per decision; role placeholders replaced before implementation | Consistent and satisfied. The register exists and every role now names Rhett (OI-01 complete 2026-09-01); no role placeholder remains. |

## 3. Additional decisions D11–D17 (decided by this ADR)

**Frozen 2026-09-01** by the acceptance of this ADR. Each was verified against the working tree on 2026-08-30 (M0-02 §2) before signature; the conditions attached to D11, D13, D15, and D17 are carried in the Status row and tracked as K-1…K-7.

| # | Decision | Proposed choice | Rationale |
|---|---|---|---|
| D11 | Catalog authority; build-worker repository and language | **Catalog authority = Pagix Component Registry.** Components CI exports `catalog.json` and exemplar source bundles with provenance; Pagix ingests, merges scoped private components, signs the `ComponentCatalogArtifact` with a `catalog-release` key registered in the platform trust root. **Build worker = new repository `anvilkit-component-build-worker`, pinned submodule after team confirmation; implementation language Go (PRD 0009 default) with the sandboxed Node toolchain as a subprocess**, unless the owner records a language-only exemption in the ADR-025 §17 form. | ADR-025 CD-5 says "not Studio"; Pagix already owns `component_registry_entries` and the marketplace read model, and the snapshot must bind to the revision Apply Authorization commits against. Go keeps `dependency-audit.ts` and PRD 0009 intact; the frontend-dependency ban applies to the worker either way. |
| D12 | Studio access architecture | **Studio BFF** (Next.js route handlers, plan 0006 WP4) is the only browser-facing caller of Agent Service; it forwards the end-user token and proxies SSE; artifact and preview bytes are fetched by the browser from Platform origins through short-lived content grants; Pagix does not proxy Agent Service. | Resolves PRD-STUDIO "Pagix Gateway only" vs PRD-AS Run API; keeps credentials out of the browser; matches plan 0006 WP4. |
| D13 | Identity and tenancy | `workspaceId` = Pagix Team id; `projectId` = Pagix Project id; no other tenant identifier. Pagix Auth issues end-user tokens with a workspace claim (audience `anvilkit-agent-service`). Agent Service → Pagix uses the OAuth2 `client_credentials` service principal plus originating-actor context. Pagix, Components CI, and the Studio BFF reach Agent Service with workload identities from the platform trust root. | Removes `tenant_id`; names the mechanism Pagix already has; gives Pagix a claim it lacks today (report 0002 G-32). |
| D14 | Preview serving owner | The Platform owns a **preview origin** (`https://preview.{env}.anvilkit.dev`) served initially by the Agent Service artifact delivery handler on a separate hostname, serving only `preview-bundle` artifacts through purpose-`preview` grants with sandbox headers; extraction to a dedicated deployment is evidence-driven. | Three PRDs referenced the preview and none owned the origin (report 0004 I-10). |
| D15 | Object store implementation status | The **PostgreSQL object store is the qualified implementation** for Phase 0. The S3-compatible implementation (key `cas/sha256/{prefix}/{digest}`, conditional put, MinIO locally) is adopted behind the same port when the first artifact size class exceeds the PostgreSQL row budget (preview bundles, package candidates) or when measured storage cost requires it, with a migration and restore rehearsal. | D3's storage choice is right for the target and wrong as a description of today; this makes the migration a decision with a trigger instead of a contradiction. |
| D16 | Scheduler mechanism status | The **versioned compare-and-set lease model is the qualified implementation** of D4's authority and fencing requirements. `FOR UPDATE SKIP LOCKED` and `LISTEN/NOTIFY` are optimizations adopted when ready-to-lease P95 under the frozen load model exceeds 1 s. | Same reasoning as D15. |
| D17 | Plan 0006 §18 answer | **Component generation means generating new React/TypeScript packages (Option A)**, executed only inside the fenced build worker under the plan 0006 §8.2/WP8 supply-chain entry gate; the design-spec composition path (`ComponentDesignSpec`) remains the first executable slice and the fallback if the WP8 gate is not funded. Acceptance of this ADR amends plan 0006 §2.2 (the "execute generated JavaScript/TypeScript" and "publish generated packages to npm" non-goals are lifted for the build worker and Components CI respectively, not for Agent Service or the Platform root) and closes §18. | The suite is written for Option A; plan 0006 recommended the opposite default. This records the choice the suite makes and the amendment it needs, so a reviewer can accept or reverse it explicitly. |

## 4. Conflicts with accepted governance and their resolution

| Conflict (report 0003 id) | Accepted rule | Resolution proposed |
|---|---|---|
| X-03 `V1`-suffixed contract names | ADR-018; `docs/prd/README.md` | Withdrawn in suite v1.1; all contracts canonical and non-versioned |
| X-04 Node/TypeScript services in `anvilkit-platform` | PRD 0009 §7.1; `scripts/dependency-audit.ts`; ADR-025 §17 | Withdrawn in v1.1; D11 decides the worker's language, Go by default |
| X-05 "no Git submodules" rule | `CLAUDE.md` Hard Rules; ADR-025 §3/§18 | Withdrawn in v1.1; services are pinned submodules, new ones need team confirmation |
| X-06 Contract Runtime topology pre-selected | PRD 0015; ADR-022 | Withdrawn in v1.1; PRD-CAT-0001 adds operations to the boundary only |
| X-07 DBOS fallback journal | ADR-019 | AS-FR-010 rewritten in v1.1 |
| X-08 S3 CAS vs PostgreSQL objects | (none — undecided) | D15 |
| X-09 `SKIP LOCKED`/`NOTIFY` vs CAS leases | (none — undecided) | D16 |
| X-10 package generation vs plan 0006 §18 default | plan 0006 §2.2, §8.2, §18 | D17 with the plan amendment |
| X-01/X-02 unregistered suite, missing ADR baseline | `docs/prd/README.md` authority model | This ADR; README registration in v1.1 |

## 5. Consequences

- The suite can be reviewed against one record. Each child PRD's "Related decision" field points here.
- Accepting D17 is the single largest commitment: it funds a new repository, a supply-chain boundary, and a preview origin. Rejecting it keeps Phase 0 on the design-spec path, which is buildable now against existing contracts (report 0002 §6.3).
- D15 and D16 turn two contradictions into evidence-gated migrations; neither blocks Phase 0.
- D11–D14 are mostly naming and ownership; each unblocks contract work that is otherwise unowned.

## 6. Approval

Every accountable role below is held by **Rhett**, recorded as the OI-01 named individual for all fourteen roles in `docs/acceptance/component-agent/m0/m0-07-08-owner-signoff-packet.md` §3. One person holding several roles satisfies D10 — D10 requires a *named individual* per decision, not a distinct individual per role — and the role column is retained because it is the unit the register, the PRDs, and the plans address.

| Role | Decision(s) | Name | Decision | Date |
|---|---|---|---|---|
| Architecture Owner | all; D11, D12, D13, D17 | Rhett | **Approved** | 2026-09-01 |
| Product Owner | D17 (co-sign) | Rhett | **Approved** | 2026-09-01 |
| Platform Contracts Owner | D1, D11 (catalog key) | Rhett | **Approved** | 2026-09-01 |
| Agent Service Technical Owner | D7, D12, D13 | Rhett | **Approved** | 2026-09-01 |
| Pagix Domain Owner | D2, D11, D13 | Rhett | **Approved** | 2026-09-01 |
| Platform Execution Owner | D3, D4, D11 (worker), D14, D15, D16 | Rhett | **Approved** | 2026-09-01 |
| Components Release Owner | D5, D6 | Rhett | **Approved** | 2026-09-01 |
| Studio Product and Engineering Owner | D12 (co-sign) | Rhett | **Approved** | 2026-09-01 |
| Product and Platform Policy Owner | D8 | Rhett | **Approved** | 2026-09-01 |
| Evaluation Owner | D9 | Rhett | **Approved** | 2026-09-01 |
| Security Owner | D13, D14 | Rhett | **Approved** | 2026-09-01 |

### 6.1 Conditions carried by this approval

Signature does not discharge these; each is tracked in `m0-02-decision-freeze-packet.md` §5 and remains open at the stated date.

| # | Condition | Discharged by | Due |
|---|---|---|---|
| K-1 | D3+D15 and D4+D16 accepted jointly | this signature | discharged 2026-09-01 |
| K-2 | D6: single publishing workflow + GitHub App; Components branch protection and required checks | OI-11; OI-03 | 2026-12-11; 2026-10-02 |
| K-3 | D9: M0-06 §1.2 (two load models) and §4 (row budget) readings confirmed | M0-06 §11 signature | 2026-09-04 |
| K-4 | D13: exact audience string; `client_credentials` service principal and actor context; workspace claim issued by Pagix Auth | OI-02; plan 0010 AS-M0-04 | 2026-10-02 |
| K-5 | D17: plan 0006 §2.2 non-goals lifted for the build worker and Components CI; §18 closed | applied 2026-09-01 in the same act | discharged 2026-09-01 |
| K-6 | D11: team confirmation for the `anvilkit-component-build-worker` submodule — **not** conferred by this signature | plan 0013 WM0-02 | end W2 (2026-09-11) |
| K-7 | D7: 24 h continuation ceiling enforced by the store | plan 0010 AS-M2-12 | M2 |

Not covered by this approval: PRD-CA-0001 §26 suite approval (plan 0008 M0-08), which is a separate signature and the last remaining M0 exit criterion.

## 7. References

- `docs/prd/components/` v1.1 and `docs/prd/components/component-agent-decision-register.md`
- `docs/reports/0003-component-prd-alignment-review-0829-2111.md`, `docs/reports/0004-component-prd-workflow-coverage-audit-0829-2144.md`, `docs/reports/0002-arch-gap-analysis-0828-1259.md`
- `scripts/dependency-audit.ts`; `services/agent-service/internal/artifacts`, `internal/scheduler`, `internal/modelgateway/continuation.go`
