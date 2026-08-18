# ADR-012: Kubernetes Resource Sizing and Scaling

| | |
| --- | --- |
| **Status** | Accepted as proposed defaults (M5) — **staging validation pending** (values re-checked at target concurrency before launch review) |
| **Resolves** | OQ-3 (doc 0010 §20); EW-K8S-005 |
| **Gate** | Phase 5 (M5) |
| **Owner** | DevOps |
| **Date** | 2026-07-03 |

## Context

The worker is stateless and horizontally scalable; doc 0010 §18 recommends starting points
and leaves HPA-vs-manual scaling To Be Confirmed (OQ-3).

## Decision

1. **Replicas:** 2 initially (`infra/k8s/export-worker-deployment.yaml`).
2. **Resources per replica at `WORKER_CONCURRENCY=4`:** requests 250m CPU / 256 Mi,
   limits 1 CPU / 1 Gi (doc 0010 §18 starting point). The M5 local load run (60-deployment
   backlog, P95 job 95 ms) shows ample headroom, but local numbers do not size production —
   re-profile in staging.
3. **Scaling: manual for MVP.** Operators scale `replicas` on the
   `ExportWorkerQueueBacklog` alert. **HPA on the queue-lag metric
   (`anvilkit_export_worker_queue_pending` via an external-metrics adapter) is evaluated
   after staging profiling** — not enabled at MVP: at-least-once + idempotency make
   scale-down safe (SIGTERM drain, pending reclaim), but autoscaling thresholds without
   real traffic data would be guesswork.
4. **Drain budget:** `terminationGracePeriodSeconds: 90` ≥ max job duration + margin
   (lock TTL 135 s bounds a job; the render+upload budgets bound the common case well
   under 90 s — revisit alongside the timeout config if budgets grow).

## Consequences

- Rolling updates and scale-downs rely on the AC-014-verified drain; no coordination
  needed beyond the grace period.
- Staging validation (EW-K8S-005 DoD) records final values back into this ADR.

## References

- PLAN-0001 §6 WS14 (EW-K8S-005), §13 (ADR-012); doc 0010 §16, §18, §20 (OQ-3)
