#!/usr/bin/env bash
# Install the pinned Go generators for canonical Agent package generation
# (ADR-018; pins mirror agent-generators.lock.json). The TypeScript generators
# are workspace devDependencies and need no installation.
#
# Usage: prepare-agent-generators.sh [env-file]
# Appends OAPI_CODEGEN and GO_JSONSCHEMA assignments to env-file (for CI,
# pass "$GITHUB_ENV"); prints them to stdout when no file is given.
set -euo pipefail

TOOLS_DIR="${AGENT_TOOLS_DIR:-/tmp/anvilkit-agent-generator-tools}"
mkdir -p "${TOOLS_DIR}/bin"

GOBIN="${TOOLS_DIR}/bin" go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.8.0
GOBIN="${TOOLS_DIR}/bin" go install github.com/atombender/go-jsonschema@v0.24.1

{
  echo "OAPI_CODEGEN=${TOOLS_DIR}/bin/oapi-codegen"
  echo "GO_JSONSCHEMA=${TOOLS_DIR}/bin/go-jsonschema"
} >> "${1:-/dev/stdout}"
