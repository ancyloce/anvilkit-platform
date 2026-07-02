# ADR-007: Local Development Integration Mode for `anvilkit-studio` Render-Origin

| | |
| --- | --- |
| **Status** | Proposed — must be confirmed with `anvilkit-studio` owners before Phase 3 render-fetch E2E loops (M3) |
| **Resolves** | BD-007 (PLAN-0001 §4; doc 0010 §4) |
| **Gate** | Phase 3 (render fetch) |
| **Owner** | Backend + Frontend Architecture |
| **Date** | 2026-07-01 |

## Context

Local compose and every Phase 3+ E2E loop depend on a reproducible way to run `anvilkit-render-origin` (which lives in `anvilkit-studio`) next to the worker, without violating the contracts-only boundary. Sub-decisions: source run vs published image, and the page-data seeding contract.

## Decision (proposed)

1. **Compose service for render-origin** (pattern per PRD 0008 §24.3), wired into `infra/docker-compose.yml` (EW-LOCAL-001).
2. **Published image, pinned by tag, as the default mode.** `anvilkit-studio` publishes a render-origin container image; the platform compose file references an explicit version tag (never `latest`). Rationale: reproducible CI and worker-developer loops with no cross-repo source checkout — running studio sources here would put frontend toolchain requirements (Node, Next.js build) inside the platform dev loop and erode the repo boundary. A source-run override (compose profile pointing at a local studio checkout) remains available for studio developers debugging both sides.
3. **Seeding contract:** render-origin must ship a seed mechanism (fixture import or seed endpoint, decided with studio owners) that loads the fixture set of PLAN-0001 §11 — at minimum `pageId=page_home`, `slug=home`, `version=v1` with assets covering every harvest form, plus the negative fixtures (`/_next/image` page, residual `asset://` page, > 16 MB asset).
4. **Fallback (risk R-10):** if image publishing is not available when M3 starts, pin a studio git SHA and build the image locally from that checkout — still tag-pinned, still no source imports.

## Consequences

- EW-XREPO-001 finalizes this with studio owners; the compose entry and seeding fixtures are the required output artifacts.
- CI integration harnesses (EW-TEST-002) consume the same pinned image, keeping local and CI behavior identical.

## References

- PLAN-0001 §4 (BD-007), §6 WS13 (EW-LOCAL-001/004), WS15 (EW-XREPO-001), §11, §12 (R-10)
- doc 0010 §4 (BD-007); PRD 0008 §24.3
