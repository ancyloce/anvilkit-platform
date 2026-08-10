// Retained PLAN-0003 M6 provider, trace, and Phase 0 exit evidence gate.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const read = (path: string) => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const failures: string[] = [];
const status = read("contracts/governance/m6/status.json");
const report = read("contracts/governance/m6/phase0-exit-report.json");
const m5 = read("contracts/governance/m5/oci-release-drill.raw.json");
const datasetPath = "mocks/fakeprovider/testdata/pinned-dataset.json";
const datasetBytes = readFileSync(join(ROOT, datasetPath));
const dataset = JSON.parse(datasetBytes.toString());
const datasetDigest = `sha256:${createHash("sha256").update(datasetBytes).digest("hex")}`;

if (status.status !== "complete" || status.completedTasks.length !== 9 || status.inProgressTasks.length || status.blockedTasks.length) {
  failures.push("M6 status is not complete with all nine tasks closed");
}
for (const path of status.evidence) if (!existsSync(join(ROOT, path))) failures.push(`M6 evidence missing: ${path}`);
if (report.status !== "passed" || report.dataset !== datasetPath || report.datasetSha256 !== datasetDigest || dataset.datasetId !== "agent-service-typed-plan-v1") {
  failures.push("M6 report does not bind the pinned Agent Service dataset bytes");
}
if (report.population !== 1000 || report.eligibleCases !== 600 || report.typedPlanPassBasisPoints < 9950 || report.toolSelectionAccuracyBasisPoints < 9500) {
  failures.push("M6 provider thresholds or declared population differ");
}
if (report.invalidCases !== report.invalidCasesRejected || report.forbiddenDispatches !== 0) failures.push("M6 provider absolute gates failed");
const current = m5.releases.find((release: { version: string }) => release.version === "1.0.0");
const previous = m5.releases.find((release: { version: string }) => release.version === "1.0.0-previous");
if (!current || !previous || report.currentBomDigest !== current.bomDigest || report.currentOciManifestDigest !== current.ociManifestDigest ||
    report.previousBomDigest !== previous.bomDigest || report.rollbackOciManifestDigest !== m5.rollbackSelected) {
  failures.push("M6 exit report does not bind current and rollback M5 references");
}
const participants = ["studio", "pagix", "agent-service", "contract-runtime", "fake-worker", "usage", "domain-confirmation"];
if (JSON.stringify(report.traceParticipants) !== JSON.stringify(participants) || report.traceContinuityBasisPoints < 9900 || report.tracePayloadLeakageCount !== 0) {
  failures.push("M6 cross-repository trace gate failed");
}
for (const scenario of ["restart", "disconnect-before-commit", "cancel-before-provider", "cancel-before-validation", "cancel-before-policy",
  "cancel-before-worker-dispatch", "cancel-before-artifact-commit", "explicit-retry", "input-wait", "approval-wait", "byte-identical-replay",
  "sequence-gap", "restore-epoch-rotation", "delayed-pre-restore-result", "idempotency-conflict", "all-attempt-usage", "old-bom-replay"]) {
  if (!report.matrixCases.includes(scenario)) failures.push(`M6 exit matrix lacks ${scenario}`);
}
for (const [gate, value] of Object.entries(report.absoluteGates)) if (value !== 0) failures.push(`M6 absolute gate ${gate} is ${value}`);
if (!report.testInfrastructureOnly || report.productionPromotionAllowed) failures.push("M6 test-only boundary is not fail-closed");

if (failures.length) {
  console.error("M6 release-candidate evidence FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(`M6 complete: ${report.population} provider cases, ${report.traceParticipants.length} trace participants, ${report.matrixCases.length} release-candidate scenarios, zero absolute-gate violations`);
