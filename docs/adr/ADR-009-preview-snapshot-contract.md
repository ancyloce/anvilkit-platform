# ADR-009: Immutable Preview Snapshot Contract

| | |
| --- | --- |
| **Status** | Blocked (external) — tracking entry; preview E2E acceptance stays deferred (AC-030) |
| **Resolves** | BD-009 (PLAN-0001 §4; doc 0010 §4) |
| **Gate** | Phase 3 preview E2E acceptance only (deferred with FR-024) — blocks nothing else |
| **Owner** | Backend + Frontend Architecture + `deployment-service` owner |
| **Date** | 2026-07-01 |

## Context

End-to-end preview rendering cannot be accepted unless `publish-service`/`deployment-service` can create and expose **immutable preview snapshots** identified by `pageId` + `version` (PRD 0008 §19, D-6). Neither service exists yet; this is an external blocker no work in this repo can clear.

## Position while blocked

1. **The worker always sends the full version-pinning headers** — for `environment=preview` exactly as for production — so preview flows through the same version-pinned path the moment upstream snapshots exist (EW-RENDER-004, FR-024). No preview-specific code path is added or skipped.
2. **Preview E2E acceptance is formally deferred** (AC-030). Outside local development, preview would risk rendering mutable drafts; that risk is accepted only in local dev.
3. This ADR is re-visited when a snapshot contract lands upstream; the required output artifacts are the snapshot contract update and the AC-030 tracking closure.

## References

- PLAN-0001 §4 (BD-009), §6 WS6 (EW-RENDER-004), WS15 (EW-XREPO-005), §12 (R-09)
- doc 0010 §4 (BD-009), FR-024; PRD 0008 §19, D-6
