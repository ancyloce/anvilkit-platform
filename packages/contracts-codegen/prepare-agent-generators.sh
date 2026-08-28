#!/usr/bin/env bash
# Install the pinned Go generators for canonical Agent package generation
# (ADR-018). The versions are read from agent-generators.lock.json, which is
# the governed pin and the identity recorded into every generated package —
# a second copy of a version here could drift from the identity the artefacts
# claim, so there is no second copy. The TypeScript generators are workspace
# devDependencies pinned to the same lock (check-agent-profile.ts holds them
# to it) and need no installation.
#
# Usage: prepare-agent-generators.sh [env-file]
# Appends OAPI_CODEGEN and GO_JSONSCHEMA assignments to env-file (for CI,
# pass "$GITHUB_ENV"); prints them to stdout when no file is given.
set -euo pipefail

LOCK="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/agent-generators.lock.json"
TOOLS_DIR="${AGENT_TOOLS_DIR:-/tmp/anvilkit-agent-generator-tools}"
mkdir -p "${TOOLS_DIR}/bin"

pin() { # generator-key field
  local value
  value="$(sed -n "s/.*\"$1\": *{[^}]*\"$2\": *\"\([^\"]*\)\".*/\1/p" "${LOCK}" | head -1)"
  if [ -z "${value}" ]; then
    echo "prepare-agent-generators: ${LOCK} declares no $2 for $1" >&2
    exit 1
  fi
  echo "${value}"
}

# The command path within a module is an installation detail, not a pin: the
# version and module identity come from the lock, the path is where each
# project keeps its main package.
install_pinned() { # generator-key command-path binary
  local module version
  module="$(pin "$1" name)"
  version="$(pin "$1" version)"
  GOBIN="${TOOLS_DIR}/bin" go install "${module}${2}@${version}"
  # Prove the pin took effect rather than assume it: a stale binary already on
  # GOBIN, or a module proxy that resolved something else, would otherwise
  # generate code the lock does not describe.
  local installed
  installed="$(go version -m "${TOOLS_DIR}/bin/$3" | awk '$1 == "mod" {print $3; exit}')"
  if [ "${installed}" != "${version}" ]; then
    echo "prepare-agent-generators: $3 is ${installed}, not the locked ${version}" >&2
    exit 1
  fi
}

install_pinned goOpenApi /cmd/oapi-codegen oapi-codegen
install_pinned goJsonSchema "" go-jsonschema

{
  echo "OAPI_CODEGEN=${TOOLS_DIR}/bin/oapi-codegen"
  echo "GO_JSONSCHEMA=${TOOLS_DIR}/bin/go-jsonschema"
} >> "${1:-/dev/stdout}"
