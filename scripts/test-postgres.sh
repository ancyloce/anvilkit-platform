#!/usr/bin/env bash
# Manage the disposable PostgreSQL the kernel test suites run against
# (infra/docker-compose.kernel-test.yml), and print the POSTGRES_TEST_URL
# that points at it.
#
# The Agent Service PostgreSQL proofs create and drop a database per run, so
# the database this prints must be disposable and must never be a development
# or production instance. Everything here is scoped to the compose project
# anvilkit-kernel-test; nothing else on the machine is touched.
#
# Usage:
#   scripts/test-postgres.sh up       start it, wait for readiness, print the URL
#   scripts/test-postgres.sh url      print the URL if it is already reachable
#   scripts/test-postgres.sh status   report reachability on stdout
#   scripts/test-postgres.sh down     stop and remove it (the data is a tmpfs)
#
# Typical use:
#   export POSTGRES_TEST_URL="$(scripts/test-postgres.sh up)"
#   scripts/kernel-verify.sh
#
# scripts/kernel-verify.sh calls `url` itself, so an already-running database
# needs no environment variable at all.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT/infra/docker-compose.kernel-test.yml"

HOST="${ANVILKIT_TEST_POSTGRES_HOST:-127.0.0.1}"
PORT="${ANVILKIT_TEST_POSTGRES_PORT:-15432}"
USER=anvilkit
PASSWORD=anvilkit-test
DATABASE=anvilkit_kernel_test
URL="postgres://$USER:$PASSWORD@$HOST:$PORT/$DATABASE?sslmode=disable"

# Reachability is proven by connecting, not by asking Docker what it thinks it
# is running: a container that is up but not yet accepting connections is not a
# usable test database, and a suite that starts against one fails confusingly.
reachable() {
  if command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -q
  else
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
      pg_isready -U "$USER" -d "$DATABASE" -q >/dev/null 2>&1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "test-postgres: docker is required to run the kernel test database" >&2
    echo "  install Docker, or point POSTGRES_TEST_URL at another disposable PostgreSQL" >&2
    exit 1
  fi
}

case "${1:-up}" in
  up)
    require_docker
    docker compose -f "$COMPOSE_FILE" up -d >&2
    waited=0
    until reachable; do
      if [ "$waited" -ge 60 ]; then
        echo "test-postgres: $HOST:$PORT did not become ready within 60s" >&2
        docker compose -f "$COMPOSE_FILE" logs --tail 20 postgres >&2 || true
        exit 1
      fi
      sleep 1
      waited=$((waited + 1))
    done
    echo "$URL"
    ;;
  url)
    reachable || {
      echo "test-postgres: no test database is reachable at $HOST:$PORT" >&2
      echo "  start one with: scripts/test-postgres.sh up" >&2
      exit 1
    }
    echo "$URL"
    ;;
  status)
    if reachable; then
      echo "test-postgres: ready at $URL"
    else
      echo "test-postgres: not running (start it with scripts/test-postgres.sh up)"
      exit 1
    fi
    ;;
  down)
    require_docker
    docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans >&2
    echo "test-postgres: removed"
    ;;
  *)
    echo "usage: scripts/test-postgres.sh [up|url|status|down]" >&2
    exit 2
    ;;
esac
