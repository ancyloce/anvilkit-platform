# ADR-010: Demo Guard Mechanism

| | |
| --- | --- |
| **Status** | Accepted — implemented and test-verified (M2) |
| **Resolves** | OQ-1 (doc 0010 §20); mechanism for FR-019 / AC-011 |
| **Gate** | Phase 2 (M2) — EW-CONFIG-002 depends on this mechanism |
| **Owner** | Backend |
| **Date** | 2026-07-02 |

## Context

`apps/demo` (in `anvilkit-studio`) must never be a render target outside local development
(hard boundary; R-14). FR-019 requires a **startup failure**, not a runtime warning. OQ-1
asked which mechanism decides "outside local development".

## Decision

Two-layer guard in the config loader (`internal/config`), following the doc 0010 proposed
default (`ENVIRONMENT` flag) plus a hostname denylist as defense in depth:

1. **`ENVIRONMENT` drives strictness.** `local` and `development` are *local dev*
   (relaxed); `staging` and `production` are *deployed* (strict). Any other value is itself
   a `CONFIG_MISSING` startup failure, so a typo'd environment can never soften a guard.
2. **`apps/demo` path check (every environment):** `RENDER_ORIGIN_URL` whose path contains
   the segment pair `apps/demo` is rejected in deployed environments and permitted only in
   local dev (AC-011's exact contract).
3. **Hostname denylist (deployed environments only), defense in depth:** hosts `demo`,
   `apps-demo`, `demo.local`, plus the loopback forms `localhost`, `127.0.0.1`, `::1` — a
   deployed worker pointing at a loopback render origin is always a misconfiguration.
4. **Invalid/relative URLs** are rejected in every environment (the guard cannot be dodged
   by an unparseable target).
5. The same strictness switch gates **`WORKER_DRY_RUN`** (the M2 scaffold mode that
   processes jobs without status writes): local dev only.

Violations aggregate into the fail-fast `CONFIG_MISSING` startup error (FR-019); readiness
never flips true; no job starts.

## Consequences

- T-demo-guard lives in `internal/config/config_test.go` (AC-011): rejected in
  production/staging, allowed in local/development, denylist + loopback + relative-URL
  cases — re-verified against staging config at M5 (EW-TEST-009).
- Local compose sets `ENVIRONMENT=local`, so developer loops are unaffected.
- Adding a new environment name is deliberately breaking: the loader rejects unknown values.

## References

- PLAN-0001 §6 WS10 (EW-CONFIG-002), §13 (ADR-010); doc 0010 §4 (OQ-1), §14 (FR-019)
- CLAUDE.md hard boundaries (`apps/demo` rule)
