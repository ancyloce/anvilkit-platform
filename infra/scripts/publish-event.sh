#!/usr/bin/env bash
# Publish a deployment.export.requested event to the local compose stack
# (EW-LOCAL-004). Usage: ./infra/scripts/publish-event.sh [event-file.json]
set -euo pipefail
cd "$(dirname "$0")/.."

EVENT_FILE="${1:-fixtures/export-requested.json}"
if [ ! -f "$EVENT_FILE" ]; then
  echo "event file not found: $EVENT_FILE" >&2
  exit 1
fi

PAYLOAD="$(cat "$EVENT_FILE")"
docker compose exec -T redis redis-cli XADD anvilkit:deployment.export.requested '*' payload "$PAYLOAD" attempt 0
echo "published $(basename "$EVENT_FILE") to anvilkit:deployment.export.requested"
