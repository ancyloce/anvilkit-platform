#!/usr/bin/env bash
# kernel-evidence assembles the kernel evidence bundle: one directory that maps
# every kernel requirement to the code, tests, release material, image digests,
# and test results that satisfy it, reproducible from a checkout with one
# command.
#
# What it contains, and why each part is there:
#
#   gate-report.json        the aggregate verification (scripts/kernel-verify.sh):
#                           canonical profile and lock, Go/TypeScript parity and
#                           fixtures, naming and dependency governance, the Agent
#                           Service suite under the race detector, the PostgreSQL
#                           proofs, the runtime units, the preview worker
#   parity/                 the parity result sets the report summarises
#   revisions.json          repository and submodule SHAs, and whether each tree
#                           was dirty when the bundle was cut
#   toolchain.json          the toolchain the results were produced with
#   contracts.json          the canonical profile and lock identities
#   releases/               the approved runtime release catalog and every
#                           manifest it approves, byte for byte
#   releases.json           each release's unit, manifest digest, image digest,
#                           provenance and signature digests, and lifecycle
#   boundaries.log          the module boundary check, including the rules that
#                           keep the in-process runtime and the model gateway out
#                           of the run pipeline
#   closure.json            proof that the production binary links neither the
#                           in-process runtime stand-in nor the planning engine
#   recovery-matrix.jsonl   the cross-process recovery matrix over real processes
#                           (restart, duplicate delivery, late result, cancel,
#                           expiry, budget, artifact conflict, rollout, rollback)
#   security-corpus.jsonl   the security corpus at the fenced commit, the runtime
#                           boundary, the release registry, and the runtime
#                           units' own admission
#   requirements.json       the requirement-to-evidence map
#   manifest.json           the digest of every file above and the bundle status
#
# The PostgreSQL proofs and the recovery matrix need a disposable database:
# POSTGRES_TEST_URL is used when set, otherwise the repository's test database
# (scripts/test-postgres.sh up). Set ANVILKIT_KERNEL_GATE_REPORT to an existing
# gate report to reuse a verification already run on this tree instead of
# running it again.
#
# Usage: scripts/kernel-evidence.sh [bundle-dir]
#   bundle-dir defaults to docs/acceptance/kernel-evidence/<utc-timestamp>
#   (docs/ is local-only under ADR-023).

set -u -o pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUNDLE="${1:-$ROOT/docs/acceptance/kernel-evidence/$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$BUNDLE/releases" "$BUNDLE/parity"
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STATUS=passed
FAILURES=()

fail() { STATUS=failed; FAILURES+=("$1"); echo "kernel-evidence: $1" >&2; }

digest_of() { sha256sum "$1" | awk '{print "sha256:" $1}'; }

# -------------------------------------------------------------- gate report --
if [ -n "${ANVILKIT_KERNEL_GATE_REPORT:-}" ]; then
  if [ ! -f "$ANVILKIT_KERNEL_GATE_REPORT" ]; then
    fail "ANVILKIT_KERNEL_GATE_REPORT names no file: $ANVILKIT_KERNEL_GATE_REPORT"
  else
    cp "$ANVILKIT_KERNEL_GATE_REPORT" "$BUNDLE/gate-report.json"
    if [ -d "$(dirname "$ANVILKIT_KERNEL_GATE_REPORT")/parity" ]; then
      cp "$(dirname "$ANVILKIT_KERNEL_GATE_REPORT")"/parity/*.json "$BUNDLE/parity/" 2>/dev/null || true
    fi
  fi
else
  echo "== kernel-verify"
  if ! scripts/kernel-verify.sh "$BUNDLE/gate-report.json"; then
    fail "kernel-verify did not pass; see gate-report.json"
  fi
fi
if [ -f "$BUNDLE/gate-report.json" ] && ! grep -q '"status": "passed"' "$BUNDLE/gate-report.json"; then
  fail "the gate report does not record a passing verification"
fi

# --------------------------------------------------------------- revisions --
SUBMODULES=""
while read -r sha path; do
  [ -z "$path" ] && continue
  [ -n "$SUBMODULES" ] && SUBMODULES="$SUBMODULES,"
  SUBMODULES="$SUBMODULES
    {\"path\": \"$path\", \"sha\": \"$sha\", \"dirty\": $([ -z "$(git -C "$path" status --porcelain)" ] && echo false || echo true)}"
done <<< "$(git submodule status | sed 's/^[ +-]//' | awk '{print $1, $2}')"
printf '{\n  "repository": {"sha": "%s", "dirty": %s},\n  "submodules": [%s\n  ]\n}\n' \
  "$(git rev-parse HEAD)" "$([ -z "$(git status --porcelain)" ] && echo false || echo true)" "$SUBMODULES" > "$BUNDLE/revisions.json"

# --------------------------------------------------------------- toolchain --
BUN="${ANVILKIT_BUN:-bun}"
printf '{\n  "go": "%s",\n  "fleetGo": "go%s",\n  "bun": "%s",\n  "node": "%s",\n  "golangciLint": "%s"\n}\n' \
  "$(go version | awk '{print $3}')" \
  "$(awk '/^go /{print $2}' services/agent-service/go.mod)" \
  "$("$BUN" --version 2>/dev/null || echo unavailable)" \
  "$(node -v 2>/dev/null || echo unavailable)" \
  "$(PATH="$HOME/go/bin:$PATH" golangci-lint version --short 2>/dev/null || echo unavailable)" > "$BUNDLE/toolchain.json"

# --------------------------------------------------------------- contracts --
# The profile's path is read from the lock, which is the authority on what the
# canonical contract set is; a lock that names no profile is a failure here,
# never a guess.
PROFILE_PATH="$(sed -n 's/.*"path": *"\(contracts\/agent\/profile\/[^"]*\)".*/\1/p' contracts/agent/lock/contracts.lock.json | head -1)"
if [ -z "$PROFILE_PATH" ] || [ ! -f "$PROFILE_PATH" ]; then
  fail "the canonical lock names no readable profile"
  PROFILE_PATH=contracts/agent/lock/contracts.lock.json
fi
printf '{\n  "profile": {"path": "%s", "digest": "%s"},\n  "lock": {"path": "contracts/agent/lock/contracts.lock.json", "digest": "%s"}\n}\n' \
  "$PROFILE_PATH" "$(digest_of "$PROFILE_PATH")" "$(digest_of contracts/agent/lock/contracts.lock.json)" > "$BUNDLE/contracts.json"

# ---------------------------------------------------------------- releases --
RELEASES_DIR=services/agent-service/internal/runtimes/releases
cp "$RELEASES_DIR"/*.json "$BUNDLE/releases/"
RELEASES=""
for document in "$RELEASES_DIR"/release.*.json; do
  [ -n "$RELEASES" ] && RELEASES="$RELEASES,"
  field() { sed -n "s/.*\"$1\": *\"\([^\"]*\)\".*/\1/p" "$document" | head -1; }
  RELEASES="$RELEASES
    {\"document\": \"$(basename "$document")\", \"manifestDigest\": \"$(digest_of "$document")\", \"runtimeUnitId\": \"$(field runtimeUnitId)\", \"imageDigest\": \"$(field imageDigest)\", \"provenanceDigest\": \"$(field provenanceDigest)\", \"signatureDigest\": \"$(field signatureDigest)\", \"invocationProtocolDigest\": \"$(field invocationProtocolDigest)\", \"lifecycle\": \"$(field state)\"}"
done
printf '{\n  "catalogDigest": "%s",\n  "releases": [%s\n  ]\n}\n' "$(digest_of "$RELEASES_DIR/catalog.json")" "$RELEASES" > "$BUNDLE/releases.json"

# -------------------------------------------------------------- boundaries --
echo "== module boundaries"
if ! (cd services/agent-service && go run ./cmd/boundarycheck -root .) > "$BUNDLE/boundaries.log" 2>&1; then
  fail "the module boundary check did not pass; see boundaries.log"
fi
CLOSURE="$(cd services/agent-service && go list -deps ./cmd/agent-service 2>/dev/null)"
IN_PROCESS_LINKED="$(printf '%s\n' "$CLOSURE" | grep -c 'internal/runtimes/inprocess$' || true)"
PLANNING_LINKED="$(printf '%s\n' "$CLOSURE" | grep -c 'internal/planning$' || true)"
printf '{\n  "binary": "services/agent-service/cmd/agent-service",\n  "inProcessRuntimeLinked": %s,\n  "planningEngineLinked": %s,\n  "packages": %s\n}\n' \
  "$([ "$IN_PROCESS_LINKED" = "0" ] && echo false || echo true)" \
  "$([ "$PLANNING_LINKED" = "0" ] && echo false || echo true)" \
  "$(printf '%s\n' "$CLOSURE" | grep -c . || true)" > "$BUNDLE/closure.json"
if [ "$IN_PROCESS_LINKED" != "0" ] || [ "$PLANNING_LINKED" != "0" ]; then
  fail "the production binary links the in-process execution path; see closure.json"
fi

# ------------------------------------------------------------- test suites --
POSTGRES_URL="${POSTGRES_TEST_URL:-}"
if [ -z "$POSTGRES_URL" ]; then
  POSTGRES_URL="$(scripts/test-postgres.sh url 2>/dev/null || true)"
fi
FLEET_GO="go$(awk '/^go /{print $2}' services/agent-service/go.mod)"

run_json_suite() { # name directory go-test-arguments...
  local name="$1" directory="$2"; shift 2
  local out="$BUNDLE/$name.jsonl"
  echo "== $name"
  (cd "$directory" && GOTOOLCHAIN="$FLEET_GO" go test -json -race -count=1 "$@") > "$out" 2>"$BUNDLE/$name.stderr"
  local exit=$?
  local passed failed
  passed="$(grep -c '"Action":"pass".*"Test":' "$out" 2>/dev/null || true)"
  failed="$(grep -c '"Action":"fail".*"Test":' "$out" 2>/dev/null || true)"
  echo "   $name: passed=$passed failed=$failed exit=$exit"
  if [ "$exit" -ne 0 ]; then
    fail "$name did not pass (exit $exit); see $name.jsonl"
  fi
}

if [ -n "$POSTGRES_URL" ]; then
  POSTGRES_TEST_URL="$POSTGRES_URL" ANVILKIT_REQUIRE_POSTGRES_PROOFS=1 \
    run_json_suite recovery-matrix services/agent-service -run 'TestCrossProcess' ./cmd/agent-service
else
  fail "no disposable PostgreSQL is available for the recovery matrix: start scripts/test-postgres.sh up or set POSTGRES_TEST_URL"
fi
run_json_suite security-corpus services/agent-service -run 'Corpus|Security|Tamper|Refuse|Stale|Fence|Unattributable|Signature|Lifecycle|Withdrawn' \
  ./internal/execution ./internal/runtimes ./internal/runtimeboundary ./internal/agent/runner ./internal/dispatch
run_json_suite runtime-admission services/agent-runtimes -run 'Refused|Credential|Tamper|Admission|Replay|Redirect|InFlight|Drain|Bound' ./runtime ./agents/...

# ------------------------------------------------------------ requirements --
cat > "$BUNDLE/requirements.json" <<'JSON'
{
  "kind": "kernel-requirement-map",
  "requirements": [
    {"requirement": "canonical profile, lock, Go/TypeScript parity, signing fixtures, every runtime contract bound to a wire description",
     "evidence": ["gate-report.json (agent-contract-sources, agent-spec-lint, agent-profile-and-lock, parity-*)", "contracts.json", "parity/"]},
    {"requirement": "DBOS pinned with one AgentRunWorkflow",
     "evidence": ["gate-report.json (agent-service-dbos-proofs)", "services/agent-service/internal/workflow/dbos"]},
    {"requirement": "AgentRun pins definition, manifest, image, protocol, and workload identity",
     "evidence": ["services/agent-service/internal/runapp/app.go", "recovery-matrix.jsonl (TestCrossProcessRunPinsAreImmutable)"]},
    {"requirement": "AgentRunner does not execute model reasoning inside Agent Service",
     "evidence": ["closure.json", "boundaries.log", "services/agent-service/cmd/boundarycheck/main.go (reasonsWithModels, in-process rule)"]},
    {"requirement": "Manager and Specialist run as separate processes and workload identities",
     "evidence": ["recovery-matrix.jsonl", "services/agent-runtimes/agents/*/deploy/identity.yaml", "releases.json"]},
    {"requirement": "runtime admission enforces authentication, strict schema, expiry, and binding validation",
     "evidence": ["runtime-admission.jsonl", "recovery-matrix.jsonl (TestCrossProcessSecurityCorpusAtTheRealTaskBoundary)"]},
    {"requirement": "AgentRuntimeResult passes signature, manifest, generation, attempt, lease, and fence checks before commit",
     "evidence": ["security-corpus.jsonl", "recovery-matrix.jsonl (TestCrossProcessStaleFenceResultCannotMutateState)"]},
    {"requirement": "logical tasks and physical attempts are separate and replacements fence earlier executions",
     "evidence": ["security-corpus.jsonl (internal/dispatch)", "gate-report.json (agent-service-postgres-proofs)"]},
    {"requirement": "the successful path produces a real immutable PageCandidate artifact and per-attempt usage",
     "evidence": ["recovery-matrix.jsonl (TestCrossProcessNormalDelegationAndArtifact)"]},
    {"requirement": "restart, duplicate, late-result, cancellation, expiry, budget, rollout, and rollback tests pass",
     "evidence": ["recovery-matrix.jsonl"]},
    {"requirement": "public event and internal evidence boundaries do not leak sensitive values",
     "evidence": ["security-corpus.jsonl", "services/agent-service/internal/runtimeboundary/offer.go"]},
    {"requirement": "production configuration cannot enable a fake, unsigned runtime, mutable image, or in-process fallback",
     "evidence": ["closure.json", "services/agent-service/internal/config/config.go (ControlledProfile, Deployed)", "gate-report.json (agent-service: config and composition tests)", "releases.json (immutable digests)"]},
    {"requirement": "a clean checkout reproduces the evidence bundle",
     "evidence": ["scripts/kernel-evidence.sh", "scripts/clean-checkout.sh", "revisions.json", "toolchain.json"]}
  ]
}
JSON

# ---------------------------------------------------------------- manifest --
FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
FILES=""
while IFS= read -r file; do
  relative="${file#"$BUNDLE"/}"
  [ "$relative" = "manifest.json" ] && continue
  [ -n "$FILES" ] && FILES="$FILES,"
  FILES="$FILES
    {\"path\": \"$relative\", \"digest\": \"$(digest_of "$file")\"}"
done <<< "$(find "$BUNDLE" -type f | sort)"
FAILURE_LIST=""
for failure in "${FAILURES[@]:-}"; do
  [ -z "$failure" ] && continue
  [ -n "$FAILURE_LIST" ] && FAILURE_LIST="$FAILURE_LIST,"
  FAILURE_LIST="$FAILURE_LIST\"$(printf '%s' "$failure" | sed 's/"/\\"/g')\""
done
printf '{\n  "kind": "kernel-evidence-bundle",\n  "startedAt": "%s",\n  "finishedAt": "%s",\n  "status": "%s",\n  "failures": [%s],\n  "files": [%s\n  ]\n}\n' \
  "$STARTED_AT" "$FINISHED_AT" "$STATUS" "$FAILURE_LIST" "$FILES" > "$BUNDLE/manifest.json"

echo
echo "kernel evidence bundle $STATUS"
echo "bundle: $BUNDLE"
[ "$STATUS" = "passed" ]
