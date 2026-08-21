// Validates the pre-entry release evidence map and release classification.
// This checker deliberately rejects premature readiness claims while entry gates are open.
//
// Its inputs are the retained local evidence ADR-023 keeps out of Git, so it is
// a local and release precheck (scripts/release-precheck.sh) rather than a step
// in ordinary hosted CI, which runs from a clean checkout of tracked content
// alone. A missing input is reported as exactly that -- never silently skipped,
// and never a reason to commit the evidence to make a hosted job pass.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const readJSON = (path: string): any => {
  const absolute = join(root, path);
  if (!existsSync(absolute)) {
    console.error(`release evidence audit FAILED: ${path} is missing.`);
    console.error("  This audit reads the retained local evidence ADR-023 keeps out of Git.");
    console.error("  Run it from a checkout that has that evidence: bash scripts/release-precheck.sh");
    process.exit(1);
  }
  return JSON.parse(readFileSync(absolute, "utf8"));
};
const failures: string[] = [];

const evidencePath = "docs/acceptance/agent-service/release-entry/evidence-index.json";
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
  failures.push("the evidence index makes an invalid pre-entry classification");
}
const seen = new Set<string>();
for (const requirement of evidence.requirements ?? []) {
  if (!requiredEvidence.has(requirement.id) || seen.has(requirement.id)) {
    failures.push(`unknown or duplicate evidence requirement: ${requirement.id}`);
    continue;
  }
  seen.add(requirement.id);
  if (!new Set(["blocked", "local-proof-only"]).has(requirement.status)) {
    failures.push(`requirement ${requirement.id} makes a release claim`);
  }
  if (!Array.isArray(requirement.localEvidence) || requirement.localEvidence.length === 0) {
    failures.push(`requirement ${requirement.id} has no retained local evidence`);
  }
  for (const artifact of requirement.localEvidence ?? []) {
    if (typeof artifact !== "string" || artifact.startsWith("/") || artifact.includes("..") || !existsSync(join(root, artifact))) {
      failures.push(`requirement ${requirement.id} references missing or unsafe artifact ${artifact}`);
    }
  }
  if (!Array.isArray(requirement.blockers) || requirement.blockers.length === 0) {
    failures.push(`requirement ${requirement.id} omits its final-evidence blocker`);
  }
}
for (const id of requiredEvidence) {
  if (!seen.has(id)) failures.push(`the evidence index omits ${id}`);
}
for (const supplemental of evidence.supplementalArtifacts ?? []) {
  if (supplemental.status !== "local-proof-only" || !Array.isArray(supplemental.blockers) || supplemental.blockers.length === 0) failures.push(`supplemental artifact ${supplemental.task} makes an invalid claim`);
  for (const artifact of supplemental.artifacts ?? []) {
    if (typeof artifact !== "string" || artifact.startsWith("/") || artifact.includes("..") || !existsSync(join(root, artifact))) failures.push(`supplemental artifact ${supplemental.task} references missing or unsafe artifact ${artifact}`);
  }
}

const classification = readJSON("docs/acceptance/agent-service/release-entry/release-classification.json");
if (classification.releaseCandidate !== false || classification.productionProviderClaim !== false) {
  failures.push("the pre-entry classification makes a release or production-provider claim");
}
for (const name of ["kernel", "controlPlaneDeployment", "productionProvider"]) {
  if (classification.readiness?.[name]?.ready !== false) {
    failures.push(`readiness class ${name} is prematurely ready`);
  }
}
if (!Array.isArray(classification.mechanicalExclusions) || classification.mechanicalExclusions.length !== 5 || classification.mechanicalExclusions.some((value: any) => value.status !== "passed-local-inventory")) {
  failures.push("the release classification does not retain all five mechanical exclusion checks");
}

const gateRegister = readJSON("docs/acceptance/agent-service/governance-baseline/gate-register.json");
const entryBlockers = new Set(["AS-TBC-001", "AS-TBC-003", "AS-TBC-005", "AS-TBC-006", "AS-TBC-007", "AS-TBC-009", "AS-TBC-010", "AS-TBC-015", "AS-TBC-017", "AS-TBC-020", "AS-TBC-021"]);
const gates = new Map((gateRegister.entries ?? []).map((entry: any) => [entry.id, entry.status]));
for (const id of entryBlockers) {
  if (gates.get(id) !== "open") failures.push(`blocker posture changed for ${id}; refresh the live release-entry records`);
}

// The kernel matrix is the production restart matrix: a real composed process
// killed at each durable checkpoint, with the vertical slice proving the same
// pipeline end to end. It replaced the release-candidate matrix machinery that
// ADR-023 and Work Package 1 retired.
const matrixSource = "services/agent-service/cmd/agent-service/restart_integration_test.go";
const matrixCases = 6;
for (const proof of [matrixSource, "services/agent-service/cmd/agent-service/controlled_agent_vertical_slice_test.go"]) {
  if (!existsSync(join(root, proof))) failures.push(`the pinned kernel matrix proof is missing: ${proof}`);
}

const trace = readJSON("docs/acceptance/agent-service/release-entry/trace-continuity-local.json");
const traceBoundaries = new Set(["studio-stand-in", "platform-agent-service", "fake-pagix", "contract-runtime", "fake-worker", "simulated-domain-confirmation"]);
if (trace.releaseEvidence !== false || trace.traceCount !== 100 || trace.continuousTraceCount !== 100 || trace.continuityRatio !== 1 || trace.requiredMinimumRatio !== 0.99 || !Array.isArray(trace.boundaries) || trace.boundaries.length !== traceBoundaries.size || new Set(trace.boundaries).size !== traceBoundaries.size || trace.boundaries.some((value: string) => !traceBoundaries.has(value))) {
  failures.push("the local trace result drifted from the deterministic six-boundary proof");
}

const matrixResult = readJSON("docs/acceptance/agent-service/release-entry/matrix-local-results.json");
if (matrixResult.candidateIdentity !== "uncommitted-worktree" || matrixResult.caseCount !== matrixCases || matrixResult.localCasesPassed !== matrixCases || matrixResult.releaseCasesPassed !== 0 || matrixResult.releaseEligible !== false || matrixResult.matrixSource !== matrixSource || !Array.isArray(matrixResult.cases) || matrixResult.cases.length !== matrixCases || new Set(matrixResult.cases).size !== matrixCases || matrixResult.assertions?.repeatedExternalEffects !== 0 || matrixResult.assertions?.lostAcknowledgedFacts !== 0 || matrixResult.assertions?.staleResultsAccepted !== 0 || matrixResult.databaseProof?.foundationsPassed !== true || matrixResult.databaseProof?.dbosDurableWaitPassed !== true || matrixResult.databaseProof?.dbosMultiReplicaPassed !== true) {
  failures.push("the local matrix result makes an unsupported claim or omits a database-backed proof");
}
// Every recorded case is checked against the source that defines it. Evidence
// citing a case the code no longer runs is exactly how this index went stale,
// so the audit now refuses to accept a claim it cannot see in the tree.
if (existsSync(join(root, matrixSource))) {
  const source = readFileSync(join(root, matrixSource), "utf8");
  for (const name of matrixResult.cases ?? []) {
    if (typeof name !== "string" || !source.includes(`"${name}"`)) {
      failures.push(`recorded matrix case ${name} is not defined in ${matrixSource}`);
    }
  }
}

const budgetPolicy = readJSON("docs/acceptance/agent-service/release-entry/budget-policy.json");
const budgetResult = readJSON("docs/acceptance/agent-service/release-entry/budget-local-results.json");
if (budgetResult.policyVersion !== budgetPolicy.policyVersion || budgetResult.candidateIdentity !== "uncommitted-worktree" || budgetResult.finalCandidate !== false || budgetResult.passed !== true) {
  failures.push("the local resource budget result makes an invalid candidate claim");
}
for (const name of ["createP95Milliseconds", "startupMilliseconds", "peakRSSKiB", "releaseBinaryBytes", "dependencyComponents"]) {
  if (budgetResult.measurements?.[name] > budgetPolicy.limits?.[name]) failures.push(`the retained local resource budget exceeds ${name}`);
}
if (budgetResult.measurements?.baselineArrivalThroughputPerSecond < budgetPolicy.limits?.minimumBaselineArrivalThroughputPerSecond) failures.push("the retained local throughput is below policy");

if (failures.length > 0) {
  console.error("release evidence audit FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(`release evidence audit passed: ${seen.size} evidence mappings, three blocked readiness classes, five mechanical exclusions`);
