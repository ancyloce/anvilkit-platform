# ADR-011: Queue Retention and Replay Policy

| | |
| --- | --- |
| **Status** | Proposed — floors documented and adopted for dev (M2, EW-QUEUE-009); **ops sign-off pending** (OQ-2, AC-031); required before broad rollout |
| **Resolves** | OQ-2 (doc 0010 §20); retention floors of §10.3.3 |
| **Gate** | Documented at M2; ops-confirmed before broad rollout (M5) |
| **Owner** | DevOps |
| **Date** | 2026-07-02 |

## Context

Redis Streams have no TTL; retention must be enforced operationally. Messages or DLQ
evidence lost during an outage are unrecoverable (R-05), so the floors must cover the
maximum expected outage window and the manual-inspection window.

## Decision (floors per doc 0010 §10.3.3)

| Structure | Floor | Enforcement |
| --- | --- | --- |
| `anvilkit:deployment.export.requested` | 24 h dev/staging · **72 h production** | worker-side retention loop (M5 hardening, PLAN-0002): exact `XTRIM MINID` via `STREAM_MAIN_RETENTION_MS` (default 72 h; 0 disables), guarded so delivered-but-unacked and undelivered entries are never trimmed |
| `anvilkit:deployment.export.retry:payloads` + `:zset` | 24 h | self-deleting on dispatch; orphan sweep still open (follow-up in PLAN-0002 §10) |
| `anvilkit:deployment.export.dlq` | **7 days** | worker-side retention loop: `STREAM_DLQ_RETENTION_MS` (default 7 d; 0 disables) |
| `anvilkit:deployment.artifact.ready` / `…export.failed` | 7 days (added, PLAN-0002) | worker-side retention loop: `STREAM_READY_RETENTION_MS` / `STREAM_FAILED_RETENTION_MS` (default 7 d; 0 disables) |

**Enforcement update (2026-07-07, PLAN-0002 H4).** The originally planned external
scheduled `XTRIM` job is superseded by in-worker trimming: a retention loop in every
worker trims the four streams each minute to the configured floors (exact `MINID` —
approximate `~` trimming enforces no floor at low write rates), observable via
`anvilkit_export_worker_stream_trimmed_total{stream}`. The floors above are the
defaults; the AC-031 ops sign-off confirms the deployed-environment values.

**Replay:** manual procedure for MVP — documented in `infra/README.md` (inspect entry, fix
root cause, re-enqueue original payload with `attempt 0`, optionally `XDEL`). Replay is safe
because processing is idempotent by `deploymentId`. **Replay tooling is required before
broad rollout** (per §10.3.3), planned alongside the ops sign-off.

## Consequences

- Local compose applies no trimming (retention effectively unbounded in dev — acceptable).
- AC-031 closes in two steps: documented (M2, this ADR + infra/README.md) → ops-confirmed
  values set in environment configs (M5 review).
- DLQ alerting (§15.4) is independent of retention: the alert fires on growth, retention
  only bounds evidence lifetime.

## References

- PLAN-0001 §6 WS3 (EW-QUEUE-009), §13 (ADR-011); doc 0010 §10.3.3, §20 (OQ-2)
- infra/README.md (retention + replay runbook section)
