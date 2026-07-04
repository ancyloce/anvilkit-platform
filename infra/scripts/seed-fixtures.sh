#!/usr/bin/env bash
# Re-seed the mock deployment-service at runtime (EW-LOCAL-004). The mock
# also auto-seeds every fixtures/deployment-record*.json at boot via
# SEED_DIR, so this script is only needed to reset state between runs.
set -euo pipefail
cd "$(dirname "$0")/.."

MOCK_URL="${DEPLOYMENT_MOCK_URL:-http://localhost:8080}"

curl -fsS -X POST "$MOCK_URL/__mock/reset" -o /dev/null
for record in fixtures/deployment-record*.json; do
  curl -fsS -X POST "$MOCK_URL/__mock/seed" \
    -H 'Content-Type: application/json' \
    --data-binary "@$record" -o /dev/null
  echo "seeded $(basename "$record")"
done
