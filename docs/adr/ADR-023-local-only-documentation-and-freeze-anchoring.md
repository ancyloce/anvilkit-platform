# ADR-023: Local-Only Documentation Policy and SHA-256 Freeze Anchoring

| Item | Decision |
| --- | --- |
| Status | Accepted |
| Date | 2026-08-18 |
| Scope | Repository documentation governance (`anvilkit-platform`) |
| Related ADRs | ADR-016, ADR-018 through ADR-022 |

## Context

The repository's governance corpus consists of ADRs, PRDs, designs, plans, runbooks, acceptance records, and machine-readable evidence. Storing all of it in Git would make superseded milestone evidence and draft documents look like current, Git-authoritative rules, and it conflicts with how the team maintains product documents. At the same time, Gate 0 of the P0-Kernel execution plan requires one authoritative governance baseline whose content can be proven later.

The team decided which artifacts Git must carry and how the rest are anchored.

## Decision

### 1. Only ADRs are stored in Git under `docs/`

- `docs/adr/` is the only Git-tracked documentation directory. `.gitignore` implements this as `/docs/*` with the single negation `!/docs/adr/`.
- PRDs, designs, plans, runbooks, acceptance reports, code-review records, backups (`docs/backs/`), diffs (`docs/diffs/`), and every other document under `docs/` are **local-only**: they exist in the working copy and are never committed.
- Repository rule files outside `docs/` (`AGENTS.md`, `CLAUDE.md`, `README`s) remain Git-tracked as before.

### 2. Git authority boundaries

- **Git-authoritative:** accepted ADRs, repository rule files, contracts, code, CI configuration, and lock manifests. A Git commit is the identity anchor for these artifacts, and the governance baseline commit identifier refers to their state.
- **Locally authoritative, hash-anchored:** the local-only governance documents. Their authority comes from the documented authority order (ADRs > design 0001 > designs 0002–0010 > plans/runbooks/evidence), not from Git visibility. Git tracking is **not** a precondition for a document to govern; freeze checklists and completion standards must not require PRDs, designs, plans, or runbooks to be tracked by Git.
- Prior machine-readable governance evidence (`contracts/governance/`) and superseded local mock machinery (`mocks/fakeprovider/`, `mocks/releasecandidate/`, `mocks/cmd/m6-report/`) are local-only historical artifacts until regenerated or removed under Work Package 1.

### 3. SHA-256 freeze anchoring for local governance documents

- When a governance baseline or architecture freeze is declared, a **SHA-256 manifest** is generated over the frozen local governance corpus (at minimum: `docs/prd/`, `docs/design/`, `docs/plans/`, `docs/runbooks/`, plus the tracked `docs/adr/`, `AGENTS.md`, and `CLAUDE.md` for completeness). The manifest lists one SHA-256 digest per file and a **root digest** computed over the sorted digest lines.
- The manifest file itself is local-only. To make the anchor tamper-evident, the **root digest is recorded in Git**: in the baseline/freeze commit message and in the corresponding approval record fields that are later committed or quoted.
- Any later dispute about what a frozen local document said is settled by recomputing digests and comparing them to the anchored manifest. A document whose digest does not match the manifest is not the frozen version.
- Regenerating the manifest (for a new baseline) is an explicit governance action recorded like any other freeze decision; manifests are dated and never overwritten in place.

### 4. Backup and recovery responsibility

- Because local-only documents have **no Git history**, the repository owner is responsible for their durability: maintaining copies of the `docs/` tree (and any other local-only artifacts) outside the working copy, for example in the team's existing backup or file-sync location.
- The in-repo conventions remain: before editing a local-only document, a pre-edit copy goes to `docs/backs/`, and review diffs go to `docs/diffs/`. These are working aids, not a durability guarantee — they live in the same working copy and are lost with it.
- Recovery after loss means restoring from the owner's backups and verifying the restored files against the most recent anchored SHA-256 manifest.

### 5. Limitation: hashes prove content, they cannot recover it

A SHA-256 manifest can prove, after the fact, that a presented document is or is not byte-identical to the frozen version. It **cannot reconstruct** a lost document. If the local corpus is lost and no backup exists, the anchored digests only prove that any rewritten replacement differs from (or matches) the frozen bytes. Durability therefore depends entirely on the §4 backup responsibility; the manifest is an integrity mechanism, not a storage mechanism.

## Acceptance evidence

- `.gitignore` tracks exactly `docs/adr/` under `docs/` and contains no blanket mock ignore — only the named obsolete directories.
- No governance document requires PRDs, designs, plans, or runbooks to be tracked by Git.
- A dated SHA-256 manifest with a root digest exists for the current governance corpus, and the baseline/freeze records reference it.
- The authority order in `docs/adr/README.md` and `docs/design/README.md` is unchanged by this ADR.

## Consequences

### Benefits

- Git history stays limited to artifacts whose identity Git actually governs; superseded local evidence cannot masquerade as current Git authority.
- The governance baseline remains provable: one commit identifier plus one root digest pin both the tracked and the local halves of the corpus.
- New ADRs are visible to Git again (the previous `!/docs/adr/*` negation could not re-include new files).

### Costs

- Local-only documents are invisible on the Git remote; collaborators must obtain them out of band.
- The owner carries a real backup obligation; losing the working copy without backups loses the documents (§5).
- Freeze operations gain one step: generating and anchoring the manifest.

## References

- `docs/adr/README.md` — authority order
- `docs/design/README.md` — freeze discipline and convergence register
- `docs/plans/0005-anvilkit-platform-p0-kernel-team-execution-plan.md` — Gate 0 (GOV-01..GOV-04)
- ADR-018: Canonical Agent Contract Refactor and P0-Kernel Profile
