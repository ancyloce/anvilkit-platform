#!/bin/sh
# Local and release precheck for the Agent Service evidence gates.
#
# These two audits read the retained local evidence ADR-023 deliberately keeps
# out of Git: the release-entry evidence map, the release classification, the
# governance baseline, and the recorded benchmark results. Ordinary hosted CI
# runs from a clean checkout of tracked content alone, so it cannot read them --
# and committing them to make a hosted job pass would cross exactly the
# tracked-documentation boundary ADR-023 draws.
#
# So they run here instead, where their inputs exist: before a release
# candidate is cut, and whenever the evidence or the resource budgets change.
# Nothing is weakened by moving them: both audits still fail closed, both still
# reject premature release claims, and both now say plainly when an input is
# missing rather than dying on an unexplained file error.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"

echo "release precheck: Agent Service release evidence and release-claim audit"
bun scripts/agent-service-release-evidence-audit.ts

echo "release precheck: Agent Service approved resource-regression budgets"
bun scripts/agent-service-resource-budget.ts

echo "release precheck passed"
