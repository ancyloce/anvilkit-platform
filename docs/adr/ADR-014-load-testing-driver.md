# ADR-014: Load-Testing Driver

| | |
| --- | --- |
| **Status** | Accepted — implemented and exercised (M5) |
| **Resolves** | Load-test driver choice (doc 0010 §17; PLAN-0001 §13) |
| **Gate** | Phase 5 (M5) — EW-TEST-007 |
| **Owner** | QA + Backend |
| **Date** | 2026-07-03 |

## Context

AC-016 requires a sustained-backlog load test at `WORKER_CONCURRENCY` 4–8 validating the
§16 latency targets (P95 job ≤ 20 s, render ≤ 5 s, upload ≤ 10 s) and zero duplicate
artifacts under contention. The candidates were k6 or a custom Go driver.

## Decision

**Custom Go driver** (`mocks/cmd/load-driver`), not k6:

1. The workload is queue-driven, not HTTP-driven — k6's HTTP-centric model fits poorly;
   the driver must publish Redis Stream events, seed mock records, and poll status.
2. Go-first repo policy: the driver reuses the generated contract bindings and the exact
   event vocabulary, so load traffic is contract-conformant by construction.
3. It measures both views: end-to-end publish→`ARTIFACT_READY` percentiles
   (backlog-inclusive) and the worker's own per-job P95s computed from the
   `anvilkit_export_worker_*_duration_ms` Prometheus histograms (the §16 SLO view).
4. It enforces the duplicate gate: exactly one `artifact-manifest.json` per deployment
   prefix after the run.

## Consequences

- `go run ./cmd/load-driver -n 60 …` from `mocks/` against the compose stack; the same
  driver points at staging by URL flags when the first deployed environment exists (BD-006).
- The M5 local run and its results are recorded in
  `docs/acceptance/load-test-report.md`; the staging re-run before launch review re-uses
  the same driver and report format.

## References

- PLAN-0001 §6 WS12 (EW-TEST-007), §13 (ADR-014); doc 0010 §16, §17 (AC-016)
