#!/usr/bin/env bash
# kernel-verify runs every non-release verification suite for the canonical
# contract surface and the Agent platform from one command, and emits a
# machine-readable report of what ran and what it found.
#
# Scope is the kernel surface: canonical contracts (sources, specs, profile,
# lock, vendored pins), Go/TypeScript canonical parity, naming and dependency
# governance, the Agent Service suite, the PostgreSQL-backed proofs, the Agent
# Runtime units, and the Page Preview Worker. The export-worker MVP keeps its
# own suite (scripts/acceptance.sh); regeneration commands remain change-time
# tools and are not verification.
#
# Toolchain mismatches fail here, before any suite runs, with remediation —
# never mid-run with a confusing error. A check whose prerequisite is absent
# is reported blocked and fails the run; nothing is skipped silently.
#
# The PostgreSQL proofs need a disposable database. POSTGRES_TEST_URL is used
# when set; otherwise the repository-managed test database is used if it is
# running (scripts/test-postgres.sh up starts it). Without one the proofs are
# reported blocked, never skipped — a required proof that skips silently is
# indistinguishable from one that passed.
#
# Two suites are deliberately out of scope because they are release-grade
# rather than per-change checks: the export-worker acceptance suite
# (scripts/acceptance.sh, against a running compose stack) and the DBOS
# upstream-SDK and benchmark proof (services/agent-service/scripts/dbos-proof.sh,
# run by CI). Regeneration commands are change-time tools, not verification.
#
# Usage: scripts/kernel-verify.sh [report-path]
#   report-path defaults to docs/acceptance/kernel-verify/gate-report.json
#   (docs/ is local-only under ADR-023). Suite logs land beside the report.

set -u -o pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPORT="${1:-$ROOT/docs/acceptance/kernel-verify/gate-report.json}"
REPORT_DIR="$(dirname "$REPORT")"
LOG_DIR="$REPORT_DIR/logs"
PARITY_DIR="$REPORT_DIR/parity"
mkdir -p "$LOG_DIR" "$PARITY_DIR"

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# ---------------------------------------------------------------- toolchain --
# The pins are read from where they are governed, never duplicated here: Bun
# from the devEngines block, the parity toolchain from the contracts module's
# own directive (its conformance emitters refuse any other toolchain), and the
# service fleet from each module's go.mod.

fail_preflight() {
  echo "kernel-verify: toolchain preflight FAILED" >&2
  for line in "${PREFLIGHT_FAILURES[@]}"; do echo "  $line" >&2; done
  printf '{\n  "reportVersion": 2,\n  "suite": "anvilkit kernel verification",\n  "startedAt": "%s",\n  "status": "failed",\n  "preflight": "toolchain mismatch; see stderr remediation",\n  "totals": {"gates": 0, "passed": 0, "failed": 0, "blocked": 0},\n  "gates": []\n}\n' "$STARTED_AT" > "$REPORT"
  echo "report: $REPORT" >&2
  exit 1
}

PREFLIGHT_FAILURES=()

BUN="${ANVILKIT_BUN:-bun}"
BUN_PIN="$(awk '/"devEngines"/,/}/' package.json | sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' | head -1)"
if ! command -v "$BUN" >/dev/null 2>&1; then
  PREFLIGHT_FAILURES+=("bun not found: install Bun $BUN_PIN (or set ANVILKIT_BUN to a pinned binary)")
elif [ "$("$BUN" --version 2>/dev/null)" != "$BUN_PIN" ]; then
  PREFLIGHT_FAILURES+=("bun $("$BUN" --version) does not match the devEngines pin $BUN_PIN: install the pinned Bun to a private prefix (curl -fsSL https://bun.sh/install | BUN_INSTALL=\$HOME/.bun-pin bash -s \"bun-v$BUN_PIN\") and set ANVILKIT_BUN=\$HOME/.bun-pin/bin/bun")
fi

if ! command -v go >/dev/null 2>&1; then
  PREFLIGHT_FAILURES+=("go not found: install the Go toolchain")
fi

PARITY_GO="go$(awk '/^go /{print $2}' packages/contracts-go/go.mod)"
if command -v go >/dev/null 2>&1; then
  if [ "$(GOTOOLCHAIN=$PARITY_GO go version 2>/dev/null | awk '{print $3}')" != "$PARITY_GO" ]; then
    PREFLIGHT_FAILURES+=("the canonical parity toolchain $PARITY_GO is unavailable: allow GOTOOLCHAIN downloads or install it (go install golang.org/dl/$PARITY_GO@latest && $PARITY_GO download)")
  fi
  FLEET_DIRECTIVES="$(grep -h '^go ' services/agent-service/go.mod services/agent-runtimes/go.mod services/export-worker/go.mod mocks/go.mod | sort -u | wc -l | tr -d ' ')"
  if [ "$FLEET_DIRECTIVES" != "1" ]; then
    PREFLIGHT_FAILURES+=("service go.mod directives disagree: align services/agent-service, services/agent-runtimes, services/export-worker, and mocks to one Go version")
  fi
  # Every module suite runs under the toolchain its go.mod declares, never
  # whatever happens to be on PATH: analyzer tooling built for one language
  # version panics on the next one's IR, and a suite that only passes on the
  # machine that installed it is not a verification.
  FLEET_GO="go$(awk '/^go /{print $2}' services/agent-service/go.mod)"
  if [ "$(GOTOOLCHAIN=$FLEET_GO go version 2>/dev/null | awk '{print $3}')" != "$FLEET_GO" ]; then
    PREFLIGHT_FAILURES+=("the service toolchain $FLEET_GO is unavailable: allow GOTOOLCHAIN downloads or install it (go install golang.org/dl/$FLEET_GO@latest && $FLEET_GO download)")
  fi
fi

if ! command -v golangci-lint >/dev/null 2>&1 && [ -x "$HOME/go/bin/golangci-lint" ]; then
  PATH="$HOME/go/bin:$PATH"
fi
if ! command -v golangci-lint >/dev/null 2>&1; then
  PREFLIGHT_FAILURES+=("golangci-lint not found: the Agent Service suite requires it (https://golangci-lint.run/welcome/install/)")
fi

# The Page Preview Worker declares its own floor; read it rather than restate
# it, and hold the run to it here so an old Node fails before any suite runs.
NODE_VERSION="$(command -v node >/dev/null 2>&1 && node -v || echo none)"
NODE_MAJOR="$(echo "$NODE_VERSION" | sed -n 's/^v\([0-9]*\).*/\1/p')"
NODE_FLOOR="$(sed -n 's/.*"node": *">=\([0-9]*\)".*/\1/p' services/preview-worker/package.json | head -1)"
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt "${NODE_FLOOR:-22}" ] 2>/dev/null; then
  PREFLIGHT_FAILURES+=("node $NODE_VERSION is below the preview-worker floor >=${NODE_FLOOR:-22}: install Node ${NODE_FLOOR:-22} or newer")
fi

if [ "${#PREFLIGHT_FAILURES[@]}" -gt 0 ]; then fail_preflight; fi

# ------------------------------------------------------- test dependencies --
# A disposable PostgreSQL is a prerequisite, not a suite: resolve it here so
# the run knows up front whether the proofs can execute, and from where.

POSTGRES_REMEDIATION="no disposable PostgreSQL is available: start the repository test database with scripts/test-postgres.sh up, or set POSTGRES_TEST_URL to a disposable instance"
POSTGRES_URL="${POSTGRES_TEST_URL:-}"
POSTGRES_SOURCE=environment
if [ -z "$POSTGRES_URL" ]; then
  if POSTGRES_URL="$(scripts/test-postgres.sh url 2>/dev/null)"; then
    POSTGRES_SOURCE=repository
  else
    POSTGRES_URL=""
    POSTGRES_SOURCE=none
  fi
fi
# The DBOS system database may be a separate instance; by default it is the
# same disposable one, which is what CI does.
DBOS_URL="${DBOS_TEST_URL:-$POSTGRES_URL}"

# -------------------------------------------------------------------- gates --

GATES_JSON=""
ANY_FAILED=0

record() { # id status seconds reason
  [ -n "$GATES_JSON" ] && GATES_JSON="$GATES_JSON,"
  GATES_JSON="$GATES_JSON
    {\"id\": \"$1\", \"status\": \"$2\", \"durationSeconds\": $3, \"reason\": \"$4\"}"
}

run_suite() { # id command...
  local id="$1"; shift
  local log="$LOG_DIR/$id.log"
  local start=$SECONDS
  echo "== $id"
  if "$@" >"$log" 2>&1; then
    record "$id" passed $((SECONDS - start)) ""
  else
    ANY_FAILED=1
    record "$id" failed $((SECONDS - start)) "see logs/$id.log"
    echo "-- $id FAILED; last lines of $log:" >&2
    tail -n 20 "$log" >&2
  fi
}

blocked() { # id reason
  ANY_FAILED=1
  record "$1" blocked 0 "$2"
  echo "== $1 BLOCKED: $2" >&2
}

run_suite workspace-install "$BUN" install --frozen-lockfile
run_suite legacy-export-freeze "$BUN" packages/contracts-codegen/check-freeze.ts
run_suite agent-contract-sources "$BUN" packages/contracts-codegen/check-agent-contracts.ts
run_suite agent-spec-lint "$BUN" packages/contracts-codegen/check-agent-specs.ts
run_suite agent-profile-and-lock "$BUN" packages/contracts-codegen/check-agent-profile.ts
run_suite typescript-package "$BUN" run --cwd packages/contracts-typescript check
run_suite go-package env GOTOOLCHAIN="$PARITY_GO" go test -C packages/contracts-go -race -count=1 ./...

parity() { # id emitter go-command comparer
  local id="$1" emitter="$2" command="$3" comparer="$4"
  local log="$LOG_DIR/$id.log"
  local start=$SECONDS
  echo "== $id"
  if "$BUN" "packages/contracts-codegen/$emitter" --repository-root . > "$PARITY_DIR/$id-typescript.json" 2>"$log" \
    && (cd packages/contracts-go && GOTOOLCHAIN="$PARITY_GO" go run "./cmd/$command" --repository-root ../..) > "$PARITY_DIR/$id-go.json" 2>>"$log" \
    && "$BUN" "packages/contracts-codegen/$comparer" --repository-root . --result "$PARITY_DIR/$id-go.json" --result "$PARITY_DIR/$id-typescript.json" > "$PARITY_DIR/$id-summary.json" 2>>"$log"; then
    record "$id" passed $((SECONDS - start)) ""
  else
    ANY_FAILED=1
    record "$id" failed $((SECONDS - start)) "see logs/$id.log and parity/$id-*.json"
    echo "-- $id FAILED; last lines of $log:" >&2
    tail -n 20 "$log" >&2
  fi
}

parity parity-fixtures emit-typescript-conformance.ts conformance compare-agent-conformance.ts
parity parity-identity emit-typescript-identity.ts identity-conformance compare-agent-identity.ts
parity parity-signature emit-typescript-signature.ts signature-conformance compare-agent-signature.ts

run_suite naming-regression "$BUN" test ./scripts/naming-governance.test.ts
run_suite naming-scan "$BUN" ./scripts/naming-governance.ts
run_suite dependency-audit "$BUN" ./scripts/dependency-audit.ts

run_suite agent-service env GOTOOLCHAIN="$FLEET_GO" make -C services/agent-service ci

# The persistence proofs and the restart matrix run as separate commands, as
# they do in CI: the persistence proof rolls migrations back and drops the
# database roles the restart matrix's durable schemas are owned by, so run
# together as one package set they race and whichever loses fails for reasons
# that have nothing to do with the change under test.
if [ -n "$POSTGRES_URL" ]; then
  run_suite agent-service-postgres-proofs env GOTOOLCHAIN="$FLEET_GO" ANVILKIT_REQUIRE_POSTGRES_PROOFS=1 POSTGRES_TEST_URL="$POSTGRES_URL" \
    go test -C services/agent-service -race -count=1 ./internal/persistence ./internal/journal/postgres
  run_suite agent-service-restart-matrix env GOTOOLCHAIN="$FLEET_GO" ANVILKIT_REQUIRE_POSTGRES_PROOFS=1 POSTGRES_TEST_URL="$POSTGRES_URL" \
    go test -C services/agent-service -race -count=1 ./cmd/agent-service
  run_suite agent-service-dbos-proofs env GOTOOLCHAIN="$FLEET_GO" ANVILKIT_REQUIRE_POSTGRES_PROOFS=1 DBOS_TEST_URL="$DBOS_URL" \
    go test -C services/agent-service -race -count=1 ./internal/workflow/dbos
else
  for postgres_gate in agent-service-postgres-proofs agent-service-restart-matrix agent-service-dbos-proofs; do
    blocked "$postgres_gate" "$POSTGRES_REMEDIATION"
  done
fi

run_suite agent-runtimes env GOTOOLCHAIN="$FLEET_GO" bash -c 'cd services/agent-runtimes && test -z "$(gofmt -l .)" && go vet ./... && go test -race -count=1 ./... && go build ./...'

run_suite preview-worker bash -c "\"$BUN\" run --cwd services/preview-worker typecheck && cd services/preview-worker && node --test 'test/**/*.test.ts'"

# ------------------------------------------------------------------- report --

FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STATUS=passed
[ "$ANY_FAILED" -ne 0 ] && STATUS=failed

# The report names what was verified as well as what passed: a gate result is
# only meaningful against the revisions and toolchain that produced it.
# A materialised clean checkout is deliberately not a repository, so every
# revision here degrades to "unknown" rather than failing the run.
SUBMODULES_JSON=""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  REPOSITORY_SHA="$(git rev-parse HEAD)"
  REPOSITORY_DIRTY="$([ -z "$(git status --porcelain)" ] && echo false || echo true)"
  while read -r sha path; do
    [ -z "$path" ] && continue
    [ -n "$SUBMODULES_JSON" ] && SUBMODULES_JSON="$SUBMODULES_JSON,"
    SUBMODULES_JSON="$SUBMODULES_JSON
      {\"path\": \"$path\", \"sha\": \"$sha\", \"dirty\": $([ -z "$(git -C "$path" status --porcelain)" ] && echo false || echo true)}"
  done <<< "$(git submodule status | sed 's/^[ +-]//' | awk '{print $1, $2}')"
else
  REPOSITORY_SHA=unknown
  REPOSITORY_DIRTY=false
fi

count_status() { echo "$GATES_JSON" | grep -c "\"status\": \"$1\"" || true; }

printf '{\n  "reportVersion": 2,\n  "suite": "anvilkit kernel verification",\n  "startedAt": "%s",\n  "finishedAt": "%s",\n  "repository": {\n    "sha": "%s",\n    "dirty": %s,\n    "submodules": [%s\n    ]\n  },\n  "toolchain": {\n    "bun": "%s",\n    "go": "%s",\n    "parityGo": "%s",\n    "fleetGo": "%s",\n    "node": "%s",\n    "golangciLint": "%s"\n  },\n  "testDependencies": {\n    "postgres": "%s"\n  },\n  "status": "%s",\n  "totals": {"gates": %s, "passed": %s, "failed": %s, "blocked": %s},\n  "gates": [%s\n  ]\n}\n' \
  "$STARTED_AT" "$FINISHED_AT" \
  "$REPOSITORY_SHA" "$REPOSITORY_DIRTY" "$SUBMODULES_JSON" \
  "$("$BUN" --version)" "$(go version | awk '{print $3}')" "$PARITY_GO" "$FLEET_GO" "$NODE_VERSION" \
  "$(golangci-lint version --short 2>/dev/null || golangci-lint version 2>/dev/null | head -1)" \
  "$POSTGRES_SOURCE" \
  "$STATUS" \
  "$(($(count_status passed) + $(count_status failed) + $(count_status blocked)))" \
  "$(count_status passed)" "$(count_status failed)" "$(count_status blocked)" \
  "$GATES_JSON" > "$REPORT"

echo
echo "kernel verification $STATUS"
echo "report: $REPORT"
[ "$STATUS" = "passed" ]
