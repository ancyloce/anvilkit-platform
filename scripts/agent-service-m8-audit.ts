// Validates the pre-entry M8 evidence map and release classification.
// This checker deliberately rejects premature readiness claims while entry gates are open.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const readJSON = (path: string): any => JSON.parse(readFileSync(join(root, path), "utf8"));
const failures: string[] = [];

const evidencePath = "docs/acceptance/agent-service/m8/evidence-index.json";
const evidence = readJSON(evidencePath);
const requiredEvidence = new Set([
  "governing-29.2-contract-freeze",
  "governing-29.2-kernel-e2e",
  "governing-29.2-preexecution-authority",
  "governing-29.2-pagix-integration",
  "governing-29.2-usage-accounting",
  "governing-29.2-restore",
  "governing-29.2-trace-continuity",
  "governing-29.2-interaction-parity",
  "design-0005-14.5-contracts",
  "design-0005-14.5-kernel",
  "design-0005-14.5-boundaries",
  "design-0005-14.5-accounting",
  "design-0005-14.5-recovery",
  "design-0005-14.5-traces",
  "design-0005-14.5-scope-exclusions",
]);

if (evidence.schemaVersion !== 1 || evidence.classification !== "pre-entry-evidence-map" || evidence.releaseEvidence !== false) {
  failures.push("M8 evidence index makes an invalid pre-entry classification");
}
const seen = new Set<string>();
for (const requirement of evidence.requirements ?? []) {
  if (!requiredEvidence.has(requirement.id) || seen.has(requirement.id)) {
    failures.push(`unknown or duplicate M8 evidence requirement: ${requirement.id}`);
    continue;
  }
  seen.add(requirement.id);
  if (!new Set(["blocked", "local-proof-only"]).has(requirement.status)) {
    failures.push(`M8 requirement ${requirement.id} makes a release claim`);
  }
  if (!Array.isArray(requirement.localEvidence) || requirement.localEvidence.length === 0) {
    failures.push(`M8 requirement ${requirement.id} has no retained local evidence`);
  }
  for (const artifact of requirement.localEvidence ?? []) {
    if (typeof artifact !== "string" || artifact.startsWith("/") || artifact.includes("..") || !existsSync(join(root, artifact))) {
      failures.push(`M8 requirement ${requirement.id} references missing or unsafe artifact ${artifact}`);
    }
  }
  if (!Array.isArray(requirement.blockers) || requirement.blockers.length === 0) {
    failures.push(`M8 requirement ${requirement.id} omits its final-evidence blocker`);
  }
}
for (const id of requiredEvidence) {
  if (!seen.has(id)) failures.push(`M8 evidence index omits ${id}`);
}
for (const supplemental of evidence.supplementalArtifacts ?? []) {
  if (supplemental.status !== "local-proof-only" || !Array.isArray(supplemental.blockers) || supplemental.blockers.length === 0) failures.push(`M8 supplemental artifact ${supplemental.task} makes an invalid claim`);
  for (const artifact of supplemental.artifacts ?? []) {
    if (typeof artifact !== "string" || artifact.startsWith("/") || artifact.includes("..") || !existsSync(join(root, artifact))) failures.push(`M8 supplemental artifact ${supplemental.task} references missing or unsafe artifact ${artifact}`);
  }
}

const classification = readJSON("docs/acceptance/agent-service/m8/release-classification.json");
if (classification.releaseCandidate !== false || classification.productionProviderClaim !== false) {
  failures.push("M8 pre-entry classification makes a release or production-provider claim");
}
for (const name of ["kernel", "controlPlaneDeployment", "productionProvider"]) {
  if (classification.readiness?.[name]?.ready !== false) {
    failures.push(`M8 readiness class ${name} is prematurely ready`);
  }
}
if (!Array.isArray(classification.mechanicalExclusions) || classification.mechanicalExclusions.length !== 5 || classification.mechanicalExclusions.some((value: any) => value.status !== "passed-local-inventory")) {
  failures.push("M8 release classification does not retain all five mechanical exclusion checks");
}

const gateRegister = readJSON("docs/acceptance/agent-service/m0/gate-register.json");
const entryBlockers = new Set(["AS-TBC-001", "AS-TBC-003", "AS-TBC-005", "AS-TBC-006", "AS-TBC-007", "AS-TBC-009", "AS-TBC-010", "AS-TBC-015", "AS-TBC-017", "AS-TBC-020", "AS-TBC-021"]);
const gates = new Map((gateRegister.entries ?? []).map((entry: any) => [entry.id, entry.status]));
for (const id of entryBlockers) {
  if (gates.get(id) !== "open") failures.push(`M8 blocker posture changed for ${id}; refresh the live M8 records`);
}

if (!existsSync(join(root, "services/agent-service/internal/releasecandidate/testdata/release-candidate-matrix.v1.json"))) {
  failures.push("pinned M8 release-candidate matrix is missing");
}

const trace = readJSON("docs/acceptance/agent-service/m8/trace-continuity-local.json");
const traceBoundaries = new Set(["studio-stand-in", "platform-agent-service", "fake-pagix", "contract-runtime", "fake-worker", "simulated-domain-confirmation"]);
if (trace.releaseEvidence !== false || trace.traceCount !== 100 || trace.continuousTraceCount !== 100 || trace.continuityRatio !== 1 || trace.requiredMinimumRatio !== 0.99 || !Array.isArray(trace.boundaries) || trace.boundaries.length !== traceBoundaries.size || new Set(trace.boundaries).size !== traceBoundaries.size || trace.boundaries.some((value: string) => !traceBoundaries.has(value))) {
  failures.push("local M8 trace result drifted from the deterministic six-boundary proof");
}

const matrixResult = readJSON("docs/acceptance/agent-service/m8/matrix-local-results.json");
if (matrixResult.candidateIdentity !== "uncommitted-worktree" || matrixResult.caseCount !== 15 || matrixResult.localCasesPassed !== 15 || matrixResult.releaseCasesPassed !== 0 || matrixResult.releaseEligible !== false || matrixResult.assertions?.repeatedExternalEffects !== 0 || matrixResult.assertions?.lostAcknowledgedFacts !== 0 || matrixResult.assertions?.staleResultsAccepted !== 0 || matrixResult.databaseProof?.foundationsPassed !== true || matrixResult.databaseProof?.dbosDurableWaitPassed !== true || matrixResult.databaseProof?.dbosMultiReplicaPassed !== true) {
  failures.push("local M8 matrix result makes an unsupported claim or omits a database-backed proof");
}

const budgetPolicy = readJSON("docs/acceptance/agent-service/m8/budget-policy.json");
const budgetResult = readJSON("docs/acceptance/agent-service/m8/budget-local-results.json");
if (budgetResult.policyVersion !== budgetPolicy.policyVersion || budgetResult.candidateIdentity !== "uncommitted-worktree" || budgetResult.finalCandidate !== false || budgetResult.passed !== true) {
  failures.push("local M8 budget result makes an invalid candidate claim");
}
for (const name of ["createP95Milliseconds", "startupMilliseconds", "peakRSSKiB", "releaseBinaryBytes", "dependencyComponents"]) {
  if (budgetResult.measurements?.[name] > budgetPolicy.limits?.[name]) failures.push(`retained local M8 budget exceeds ${name}`);
}
if (budgetResult.measurements?.phase0ThroughputPerSecond < budgetPolicy.limits?.minimumPhase0ThroughputPerSecond) failures.push("retained local M8 throughput is below policy");

if (failures.length > 0) {
  console.error("M8 pre-entry audit FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(`M8 pre-entry audit passed: ${seen.size} evidence mappings, three blocked readiness classes, five mechanical exclusions`);
