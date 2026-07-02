# ADR-015: Service Naming Alignment — `render-worker` → `export-worker`

| | |
| --- | --- |
| **Status** | Accepted |
| **Resolves** | Platform worker naming convention application (PLAN-0001 canonical naming note; AC-001) |
| **Gate** | Phase 1 (M1) |
| **Owner** | Backend lead |
| **Date** | 2026-07-01 |

## Context

The source documents (0008/0010) name the service `anvilkit-render-worker`. The platform worker naming convention (CLAUDE.md) names workers after the **pipeline stage they own** — never a render mode, output format, technology, or delivery target. The stage this worker owns is **export** (consume `deployment.export.requested`, produce the artifact, emit `deployment.artifact.ready` — the `deployment.export.*` vocabulary already used by the contracts). "Render" describes one internal step, and the render modes (`fetch_route`, deferred `react_ssr`/`html_export`) are drivers inside the stage, not stages.

## Decision

Canonical name **`anvilkit-export-worker`** on every surface:

| Surface | Canonical name | Source-document name (superseded) |
| --- | --- | --- |
| Service repository | `anvilkit-export-worker` | `anvilkit-render-worker` |
| Platform path (submodule) | `services/export-worker` | `services/render-worker` |
| Container image | `export-worker` (`ghcr.io/ancyloce/anvilkit-export-worker`) | `render-worker` |
| Kubernetes Deployment | `export-worker` | `render-worker` |
| Queue consumer group | `export-worker` | `render-worker` (doc 0010 §10.3.1 recommended name) |
| Metrics namespace | `anvilkit_export_worker_*` (e.g. `anvilkit_export_worker_jobs_total`) | `render_worker_*` (e.g. `render_worker_jobs_total`) |
| `WORKER_NAME` default | `anvilkit-export-worker` | `anvilkit-render-worker` |
| OTel service name / log `workerId` prefix | `anvilkit-export-worker` | `anvilkit-render-worker` |

**Legacy repo:** the pre-existing service repository `anvilkit-static-publisher` (at `services/static-publisher`) is this same service and predates both names; it is renamed to `anvilkit-export-worker` / re-pinned at `services/export-worker` during Phase 1 bootstrap (EW-REPO-002). The old name additionally violates the convention by encoding an output format ("static") and a delivery mode ("publisher").

**The rename is naming-only.** Every behavioral requirement, gate, priority, and acceptance criterion of doc 0010 is preserved unchanged. Redis key names (`anvilkit:deployment.export.*`) already use the stage vocabulary and are unaffected.

## Consequences

- All Phase 1+ artifacts (scaffold, CI, manifests, dashboards, alerts) use the canonical names from day one; no migration later.
- Documents 0008/0010 remain unmodified (AC-019); this mapping table is the bridge when reading them.

## References

- PLAN-0001 canonical naming note, §13 (ADR-015), Appendix A.1
- CLAUDE.md "Worker naming convention"
