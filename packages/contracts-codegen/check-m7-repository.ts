// PLAN-0003 M7 repository-readiness gate. This gate never substitutes local
// fixtures for operated production evidence.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const readText = (path: string) => readFileSync(join(ROOT, path), "utf8");
const read = (path: string) => JSON.parse(readText(path));
const failures: string[] = [];
const requiredFiles = [
  ".github/workflows/contracts-release-candidate.yml",
  "contracts/governance/m7/status.json",
  "contracts/governance/m7/deployment-inventory.json",
  "contracts/governance/m7/github-environment-evidence.json",
  "contracts/governance/m7/telemetry-contract.json",
  "contracts/governance/m7/quarterly-drill-plan.json",
  "contracts/governance/m7/production-evidence.template.json",
  "docs/runbooks/agent-contract-runbooks.md",
  "docs/runbooks/agent-contract-release.md",
  "docs/runbooks/agent-contract-consumer-upgrade.md",
  "docs/runbooks/agent-contract-signing-and-trust.md",
  "docs/runbooks/agent-contract-publication-and-recovery.md",
  "docs/runbooks/agent-contract-operations.md",
];
for (const path of requiredFiles) if (!existsSync(join(ROOT, path))) failures.push(`missing M7 repository evidence: ${path}`);

for (const phase of ["m0", "m1", "m2", "m3", "m4", "m5", "m6"]) {
  const statusPath = `contracts/governance/${phase}/status.json`;
  if (existsSync(join(ROOT, statusPath)) && !String(read(statusPath).status).includes("complete")) failures.push(`${phase.toUpperCase()} is not complete`);
}

const workflow = readText(".github/workflows/contracts-release-candidate.yml");
for (const gate of [
  "check-m1.ts", "check-m2.ts", "check-specs.ts", "check-agent-freeze.ts", "generate-m4-packages.ts",
  "check-m4-conformance.ts", "check-m4-consumers.ts", "check-m5", "check-m6.ts", "dependency-audit.ts",
  "bun audit", "check-m7-repository.ts", "check-m7-production.ts", "contracts-production-release",
]) if (!workflow.includes(gate)) failures.push(`release workflow lacks gate: ${gate}`);
if (!workflow.includes("upload-artifact@v4") || !workflow.includes("retention-days:")) failures.push("release workflow does not retain immutable candidate evidence");
if (/\b(?:publish|push)\b.*(?:oras|zot|oci)/i.test(workflow)) failures.push("repository workflow contains an unauthorized publication command");

const inventory = read("contracts/governance/m7/deployment-inventory.json");
if (inventory.standaloneContractServices.length || inventory.productionPhase0Workers.length) failures.push("deployment inventory contains a forbidden production boundary");
if (inventory.productionDeployables.some((item: any) => item.phase0AgentWorker)) failures.push("deployment inventory marks a production Phase 0 worker");
if (inventory.claims.contractRuntimeBoundaryUnchanged !== true || inventory.claims.standaloneContractServiceAdded !== false || inventory.claims.productionPhase0WorkerAdded !== false) failures.push("deployment inventory claims are not fail-closed");
for (const source of inventory.sources) if (!existsSync(join(ROOT, source))) failures.push(`deployment inventory source missing: ${source}`);
const deployment = readText("infra/k8s/export-worker-deployment.yaml");
if (!deployment.includes("name: export-worker") || /name:\s*(?:agent|contract)-(?:service|worker|runtime)/.test(deployment)) failures.push("production manifest inventory differs from the declared boundary");

const githubEnvironments = read("contracts/governance/m7/github-environment-evidence.json");
for (const name of ["contracts-release-candidate", "contracts-production-release"]) {
  const environment = githubEnvironments.environments.find((item: any) => item.name === name);
  if (!environment || environment.allowedBranch !== "main" || !environment.requiredReviewer || !environment.customBranchPolicies) failures.push(`GitHub environment evidence is incomplete for ${name}`);
}
if (githubEnvironments.productionCredentialsConfigured !== false) failures.push("GitHub environment evidence claims unverified production credentials");

const telemetry = read("contracts/governance/m7/telemetry-contract.json");
const expectedSignals = ["contract.generation", "contract.validation", "contract.identity", "contract.signature", "contract.resolver", "contract.cache", "contract.publication", "contract.compatibility", "contract.retained_version"];
if (JSON.stringify(telemetry.signals.map((item: any) => item.name)) !== JSON.stringify(expectedSignals)) failures.push("telemetry contract does not cover all M7 signal families");
if (new Set(telemetry.requiredAttributes).size !== telemetry.requiredAttributes.length || new Set(telemetry.forbiddenAttributes).size !== telemetry.forbiddenAttributes.length) failures.push("telemetry attribute policy contains duplicates");
for (const forbidden of ["contract.payload", "authorization", "signature.bytes", "private_key", "access_token"]) if (!telemetry.forbiddenAttributes.includes(forbidden)) failures.push(`telemetry leakage policy omits ${forbidden}`);
if (!telemetry.operatedBackendEvidenceRequired) failures.push("telemetry contract permits repository evidence to replace operated evidence");

const drills = read("contracts/governance/m7/quarterly-drill-plan.json");
const expectedDrills = ["atomic-publication-failure", "clean-resolution", "offline-resolution", "corrupt-cache", "mirror-restore", "old-bom-replay", "rollback", "revocation", "overlap-rotation", "disaster-recovery"];
if (drills.cadence !== "quarterly" || JSON.stringify(drills.scenarios) !== JSON.stringify(expectedDrills)) failures.push("quarterly drill plan is incomplete");
if (Object.values(drills.absoluteGates).some((value) => value !== 0) || !drills.productionLikeTargetsRequired) failures.push("quarterly drill absolute gates are not fail-closed");

const template = read("contracts/governance/m7/production-evidence.template.json");
const tasks = Object.keys(template.tasks);
if (template.status !== "pending" || tasks.length !== 7 || tasks.some((task, index) => task !== `M7-T0${index + 1}`)) failures.push("production evidence template does not declare seven pending M7 tasks");
if (template.publication.authorized || template.publication.discoverable) failures.push("production evidence template authorizes publication");

const status = read("contracts/governance/m7/status.json");
if (status.repositoryReadiness !== "complete" || JSON.stringify(status.completedTasks) !== JSON.stringify(["M7-T03"]) || status.blockedTasks.length !== 6 || status.claims.operatedProductionEvidencePresent !== false || status.claims.releasePublished !== false) failures.push("M7 status does not separate completed M7-T03 from six operated task gates");
for (const path of status.repositoryEvidence) if (!existsSync(join(ROOT, path))) failures.push(`M7 status evidence missing: ${path}`);

const runbookIndex = readText("docs/runbooks/agent-contract-runbooks.md");
for (const topic of ["Authoring", "semantic classification", "fixtures", "freeze", "generation", "Consumer upgrade", "Signing", "Publication", "resolution", "Cache recovery", "rollback", "mirror restore", "rollover", "revocation", "incident diagnosis"]) if (!runbookIndex.toLowerCase().includes(topic.toLowerCase())) failures.push(`runbook index omits ${topic}`);

if (failures.length) {
  console.error("M7 repository readiness FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(`M7 repository ready: ${requiredFiles.length} controlled files, ${expectedSignals.length} telemetry families, ${expectedDrills.length} quarterly drills; production evidence still required`);
