#!/usr/bin/env bash
# Artifact self-containment verification (PLAN-0001 §11 step 8; AC-009
# groundwork): reads artifact-manifest.json from storage and checks that
# every manifest file exists with the recorded size — touching ONLY artifact
# storage, so it passes with render-origin stopped.
#
# Usage: ./infra/scripts/verify-artifact.sh [deploymentId] [siteId]
set -euo pipefail
cd "$(dirname "$0")/.."

DEP="${1:-dep_local_001}"
SITE="${2:-site_local}"
BASE="local/anvilkit-artifacts/sites/$SITE/deployments/$DEP"

docker compose exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin >/dev/null

MANIFEST="$(docker compose exec -T minio mc cat "$BASE/artifact-manifest.json")"

echo "$MANIFEST" | python3 -c '
import json, subprocess, sys

manifest = json.load(sys.stdin)
base = sys.argv[1]
ok = True
for f in manifest["files"]:
    res = subprocess.run(
        ["docker", "compose", "exec", "-T", "minio", "mc", "stat", "--json",
         "local/anvilkit-artifacts/" + f["storageKey"]],
        capture_output=True, text=True)
    if res.returncode != 0:
        print("MISSING:", f["storageKey"])
        ok = False
        continue
    size = json.loads(res.stdout)["size"]
    if size != f["sizeBytes"]:
        print("SIZE MISMATCH:", f["storageKey"], size, "!=", f["sizeBytes"])
        ok = False
print("manifest: entry=%s files=%d routes=%d" % (manifest["entry"], len(manifest["files"]), len(manifest["routes"])))
sys.exit(0 if ok else 1)
' "$BASE"

echo "artifact self-containment verified for $DEP"
