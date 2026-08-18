# ADR-013: Rate Limiting and Team/Site Guardrails

| | |
| --- | --- |
| **Status** | Proposed — recommended approach drafted; **Backend + Product confirmation pending**. Implementation follows confirmation (P1-Hardening). This decision is a **broad-rollout gate** (OQ-4; controlled MVP rollout is NOT blocked). |
| **Resolves** | OQ-4 (doc 0010 §20); FR-023 broad-rollout revisit |
| **Gate** | Broad rollout |
| **Owner** | Backend + Product |
| **Date** | 2026-07-03 |

## Context

FR-023 tiers processing guardrails: tier 1 — global concurrency (`WORKER_CONCURRENCY`)
plus queue-backlog alerting — is **shipped** and is the accepted guardrail for the first
controlled MVP rollout. Broad rollout must either add basic per-team/per-site guardrails
or record an ADR justifying global-only. Advanced quota-based or provider-aware limiting
is P2-Future by definition.

The failure mode guardrails exist for is **tenant fairness, not worker protection**: the
worker itself is protected by global concurrency and horizontal scaling, but the main
stream is FIFO — one site publishing en masse (bulk import, integration misfire, publish
storm) can monopolize all worker slots and starve every other tenant's publish latency.

## Decision (recommended — confirm before broad rollout)

Adopt a **basic per-site in-flight cap** at broad rollout; do not justify global-only:

1. **Mechanism:** a bounded per-site concurrency gate in the worker, enforced at job
   admission (after validation, before the per-deployment lock): a Redis counter
   `guard:site:{siteId}:inflight` incremented with a TTL safety net and decremented on
   job completion. A job over the cap is **delayed, never failed and never acked** — the
   message is left pending exactly like a lock conflict (the ADR-003 ack rule already
   covers this branch), so reclaim naturally retries it when slots free up.
2. **Default cap:** `SITE_CONCURRENCY_LIMIT=2` concurrent exports per site per
   deployment of the fleet (config, §14-style; `0` disables the gate and is the
   controlled-MVP default). Rationale: a single-page publish uses one slot; a site-wide
   re-publish queues politely at 2 while other tenants keep the remaining slots.
3. **Per-team caps deferred:** siteId is the natural fairness unit today (deployments are
   site-scoped); add a team cap only if multi-site teams demonstrably game the site cap.
4. **Observability:** a `anvilkit_export_worker_site_throttled_total` counter plus a
   sustained-throttle alert accompany the implementation, so the cap's tuning is
   data-driven, not guessed.
5. **Out of scope (P2-Future):** quota-based, billing-aware, or provider-aware rate
   limiting; priority lanes (the MVP queue remains FIFO per stream — doc 0010 §6.3).

## Why not global-only?

Global concurrency cannot express fairness: it bounds aggregate throughput while letting
a single tenant consume 100% of it. The backlog alert detects the symptom but the only
manual remedy (scaling up) also serves the noisy tenant first. The per-site cap is small
(one Redis counter + one admission branch reusing existing pending semantics), so the
justify-global-only escape hatch buys little.

## Consequences

- Controlled MVP rollout proceeds unchanged (tier 1 shipped; gate disabled by default).
- Broad rollout requires: this ADR confirmed by Product, the cap implemented behind the
  existing admission path (delay-not-fail; never ack), tests mirroring the
  lock-conflict-never-acks suite, and the throttle metric + alert.
- The remaining broad-rollout gates stay independent: AC-032 ops review (cleanup runbook
  approval owner) and AC-031 retention sign-off.

## References

- PLAN-0001 §13 (ADR-013), §15 launch checklist; doc 0010 §4 (OQ-4), FR-023, §15.4
- ADR-003 (ack rule the delay branch reuses)
