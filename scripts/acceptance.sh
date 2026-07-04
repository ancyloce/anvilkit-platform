#!/usr/bin/env bash
# Full acceptance/regression suite (EW-TEST-009; PLAN-0001 §10 "Acceptance
# suite" — runs on main and release tags, and locally before a release).
#
# Prerequisite: the compose stack is UP —
#   docker compose -f infra/docker-compose.yml up -d --build
#
# Covered T-tests:
#   T-render-worker-happy-path        live E2E (AC-003)
#   T-version-pinned-render           worker integration suite (AC-004)
#   T-asset-unresolved-ref            live E2E (AC-005)
#   T-next-image-guard                live E2E (AC-005)
#   T-object-hash-metadata-idempotency  worker integration suite (AC-006)
#   T-redis-lock-conflict-recovery    worker integration suite (AC-007)
#   T-redelivery-idempotency          worker integration suite (AC-008)
#   T-origin-stopped-verification     live release gate (AC-009)
#   T-cross-repo-contract-compatibility  contract half: freeze + drift +
#       import audit. The E2E half against the REAL anvilkit-studio
#       render-origin activates once BD-007/ADR-007 is confirmed — swap the
#       compose render-origin-mock service for the pinned studio image; this
#       script is origin-agnostic and runs unchanged (AC-010).
#   T-demo-guard                      worker unit suite (AC-011)
#
# cdn-service integration tests remain gated on BD-005 resolution (AC-034)
# and are NOT run here.
set -euo pipefail
cd "$(dirname "$0")/.."

REDIS_TEST_URL="${REDIS_TEST_URL:-redis://localhost:6379}"   # tests use DBs 1–5; the live worker uses DB 0
S3_TEST_ENDPOINT="${S3_TEST_ENDPOINT:-http://localhost:9000}" # tests use bucket anvilkit-artifacts-test
export REDIS_TEST_URL S3_TEST_ENDPOINT

step() { printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

step "1/7 Contracts: fixture validation, codegen drift, freeze (AC-023, AC-029)"
bun packages/contracts-codegen/generate.ts >/dev/null
bun packages/contracts-codegen/check-freeze.ts
git diff --exit-code -- contracts packages
git -C services/export-worker diff --exit-code -- contracts

step "2/7 Cross-repo contract gate: dependency + import audit (AC-002, AC-010 contract half, AC-018)"
bun ./scripts/dependency-audit.ts

step "3/7 Worker suite: unit + integration, race detector (AC-004..008, AC-011..015, AC-021..033)"
(cd services/export-worker && go test -race -count=1 ./...)

step "4/7 Mock conformance suite (FR-022)"
(cd mocks && go test -race -count=1 ./...)

step "5/7 Live E2E: happy path, guards, multipart (AC-003, AC-005, AC-006)"
curl -fsS -X POST http://localhost:8080/__mock/reset -o /dev/null
./infra/scripts/seed-fixtures.sh >/dev/null
for f in export-requested.json export-requested.broken-asset.json export-requested.next-image.json export-requested.huge.json; do
  ./infra/scripts/publish-event.sh "fixtures/$f" >/dev/null
done
python3 - <<'PYEOF'
import json, time, urllib.request

WANT = {
    "dep_local_001": "ARTIFACT_READY",
    "dep_local_002": "EXPORT_FAILED",
    "dep_local_003": "EXPORT_FAILED",
    "dep_local_004": "ARTIFACT_READY",
}
deadline = time.time() + 120
pending = dict(WANT)
while pending:
    if time.time() > deadline:
        raise SystemExit(f"E2E timed out; still pending: {pending}")
    for dep, want in list(pending.items()):
        req = urllib.request.Request(
            f"http://localhost:8080/internal/deployments/{dep}",
            headers={"Authorization": "Bearer local-dev-token"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = json.load(resp)["status"]
        if status == want:
            del pending[dep]
        elif status in ("ARTIFACT_READY", "EXPORT_FAILED"):
            raise SystemExit(f"{dep}: terminal {status}, want {want}")
    time.sleep(0.5)
print("all four scenarios reached their expected terminal states")
PYEOF
docker compose -f infra/docker-compose.yml exec -T redis \
  redis-cli XRANGE anvilkit:deployment.export.failed - + | grep -q 'UNRESOLVED_ASSET_REF'
docker compose -f infra/docker-compose.yml exec -T redis \
  redis-cli XRANGE anvilkit:deployment.export.failed - + | grep -q 'UNSUPPORTED_DYNAMIC_IMAGE_OPTIMIZER'
./infra/scripts/verify-artifact.sh dep_local_001 site_local >/dev/null
./infra/scripts/verify-artifact.sh dep_local_004 site_local >/dev/null
echo "guards emitted the exact codes; artifacts verified (incl. the >16MB multipart bundle)"

step "6/7 T-origin-stopped-verification — release gate (AC-009)"
docker compose -f infra/docker-compose.yml stop render-origin-mock >/dev/null
./infra/scripts/verify-artifact.sh dep_local_001 site_local
docker compose -f infra/docker-compose.yml start render-origin-mock >/dev/null

step "7/7 Container image builds (AC-002)"
docker build -q --build-arg VERSION=acceptance -t anvilkit-export-worker:acceptance services/export-worker >/dev/null
echo "worker image builds"

printf '\n\033[1;32mACCEPTANCE SUITE PASSED\033[0m\n'
echo "Externally gated (not runnable here): AC-010 E2E vs the real studio origin (BD-007),"
echo "AC-016 staging re-run, AC-030 preview E2E (BD-009), AC-034 cdn-service tests (BD-005)."
