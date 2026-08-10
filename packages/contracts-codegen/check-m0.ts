// PLAN-0003 M0 governance baseline verification.
//
// This command validates inventory completeness, the 19-family catalog, the
// DP-008 evidence matrix, and pending-owner gates without selecting tools or
// changing any frozen contract bytes.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const M0_DIR = join(REPO_ROOT, "contracts", "governance", "m0");
const failures: string[] = [];

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error(`cannot parse ${relative(REPO_ROOT, path)}: ${error}`);
  }
}

function walk(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(relative(REPO_ROOT, full));
  }
}

function unique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) failures.push(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
}

type Inventory = {
  classificationValues: string[];
  legacyFiles: Array<{
    path: string;
    kind: string;
    classification: string;
    frozenSha256: string | null;
  }>;
  generatedPackages: Array<{ path: string; sources: string[] }>;
  validators: Array<{ path: string }>;
  consumers: Array<{ path: string }>;
  frozenSemanticRules: Array<{ id: string; source: string; rule: string }>;
};

type Catalog = {
  contracts: Array<{
    logicalId: string;
    semanticVersion: string;
    owner: string;
    identityFields: string[];
    maximumSerializedBytes: number;
    p0FreezeStatus: string;
    descriptions: string[];
    bomComponentName: string;
    ownerAcknowledgement: string;
    ownerAcknowledgementEvidence?: string;
  }>;
};

type Candidates = {
  records: Array<{
    id: string;
    capability: string;
    language: string;
    candidate: string;
    exactVersion: string;
    owner: string;
    status: string;
    decision: string;
    plan: string;
    evidence?: string;
  }>;
};

const inventory = readJson<Inventory>(join(M0_DIR, "inventory.json"));
const lock = readJson<{ files: Record<string, string> }>(
  join(REPO_ROOT, "contracts", "contracts.lock.json"),
);
const catalog = readJson<Catalog>(join(M0_DIR, "catalog.json"));
const candidates = readJson<Candidates>(join(M0_DIR, "dp008", "candidates.json"));
const benchmark = readJson<{
  requiredMeasurements: string[];
  requiredAssessments: string[];
  adapterProtocol: object;
}>(join(M0_DIR, "dp008", "benchmark-plan.json"));
const datasets = readJson<{
  representativeSchema: string;
  cases: Array<{ id: string; category: string }>;
}>(
  join(M0_DIR, "dp008", "dataset-plan.json"),
);
const decisions = readJson<{ items: Array<{ id: string; status: string }> }>(
  join(M0_DIR, "decision-backlog.json"),
);
const evidence = readJson<{
  manifestLayers: unknown[];
  retentionClasses: unknown[];
  raci: unknown[];
  workflow: unknown[];
  acknowledgements: Array<{ role: string; status: string; evidence?: string }>;
}>(join(M0_DIR, "evidence-governance.json"));

// M0-T01: every current legacy authority file and every lock entry is present.
unique(inventory.legacyFiles.map((item) => item.path), "inventory.legacyFiles");
unique(inventory.frozenSemanticRules.map((item) => item.id), "frozenSemanticRules");
const inventoryByPath = new Map(inventory.legacyFiles.map((item) => [item.path, item]));
const currentLegacyFiles: string[] = [];
walk(join(REPO_ROOT, "contracts", "artifact"), currentLegacyFiles);
walk(join(REPO_ROOT, "contracts", "events"), currentLegacyFiles);
walk(join(REPO_ROOT, "contracts", "openapi", "v1", "fixtures"), currentLegacyFiles);
currentLegacyFiles.push(
  "contracts/README.md",
  "contracts/contracts.lock.json",
  "contracts/openapi/v1/asset-service.internal.json",
  "contracts/openapi/v1/deployment-service.internal.json",
);
for (const rel of currentLegacyFiles.sort()) {
  if (!inventoryByPath.has(rel)) failures.push(`legacy file missing from inventory: ${rel}`);
}
for (const item of inventory.legacyFiles) {
  if (!existsSync(join(REPO_ROOT, item.path))) failures.push(`inventoried path does not exist: ${item.path}`);
  if (!inventory.classificationValues.includes(item.classification)) {
    failures.push(`invalid classification for ${item.path}: ${item.classification}`);
  }
}
const frozenInventory = new Map(
  inventory.legacyFiles
    .filter((item) => item.frozenSha256 !== null)
    .map((item) => [item.path, item.frozenSha256 as string]),
);
for (const [rel, expected] of Object.entries(lock.files)) {
  const inventoried = frozenInventory.get(rel);
  if (inventoried !== expected) failures.push(`lock/inventory digest mismatch: ${rel}`);
  if (existsSync(join(REPO_ROOT, rel))) {
    const actual = createHash("sha256").update(readFileSync(join(REPO_ROOT, rel))).digest("hex");
    if (actual !== expected) failures.push(`frozen legacy bytes changed: ${rel}`);
  }
}
for (const rel of frozenInventory.keys()) {
  if (!(rel in lock.files)) failures.push(`inventory marks unlocked file frozen: ${rel}`);
}
for (const entry of [
  ...inventory.generatedPackages,
  ...inventory.validators,
  ...inventory.consumers,
]) {
  if (!existsSync(join(REPO_ROOT, entry.path))) failures.push(`inventory target missing: ${entry.path}`);
}
for (const pkg of inventory.generatedPackages) {
  for (const source of pkg.sources) {
    if (!inventoryByPath.has(source)) failures.push(`generated package source not inventoried: ${source}`);
  }
}
if (inventory.validators.length < 2) failures.push("expected both Bun and Go legacy validators");
if (inventory.consumers.length < 8) failures.push("legacy consumer inventory is incomplete");
if (inventory.frozenSemanticRules.length < 9) failures.push("frozen semantic-rule inventory is incomplete");

// M0-T02: exact PRD catalog, proposed bounds, owners, and P0 subset.
const REQUIRED_CONTRACTS = [
  "AgentDefinitionV1", "AgentRunV1", "ToolDefinitionV1", "AgentTaskV1",
  "WorkerLeaseV1", "AgentArtifactV1", "ApprovalRequestV1", "ProviderContinuationV1",
  "CompiledContextV1", "WorkerResultV1", "UsageObservationV1", "AgentBudgetV1",
  "AgentEventV1", "InputRequestV1", "TargetSnapshotV1", "ApplyAuthorizationV1",
  "ProblemDetailsV1", "ImageOperationPlanV1", "ComponentPackageSpecV1",
].sort();
const actualContracts = catalog.contracts.map((item) => item.logicalId).sort();
if (JSON.stringify(actualContracts) !== JSON.stringify(REQUIRED_CONTRACTS)) {
  failures.push("catalog does not exactly match the 19 PRD 0012 contract families");
}
unique(catalog.contracts.map((item) => item.logicalId), "catalog logicalId");
unique(catalog.contracts.map((item) => item.bomComponentName), "catalog bomComponentName");
for (const item of catalog.contracts) {
  if (item.semanticVersion !== "1.0.0") failures.push(`${item.logicalId} must plan semantic version 1.0.0`);
  if (!item.owner.trim()) failures.push(`${item.logicalId} has no owner`);
  if (item.identityFields.length === 0) failures.push(`${item.logicalId} has no planned identity fields`);
  if (!Number.isInteger(item.maximumSerializedBytes) || item.maximumSerializedBytes <= 0) {
    failures.push(`${item.logicalId} has no positive serialized-size bound`);
  }
  if (!new Set(["pending", "approved"]).has(item.ownerAcknowledgement)) {
    failures.push(`${item.logicalId} has invalid acknowledgement state`);
  }
  if (item.ownerAcknowledgement === "approved" && !item.ownerAcknowledgementEvidence) {
    failures.push(`${item.logicalId} approval has no reviewer evidence`);
  }
}
const requiredFreeze = catalog.contracts.filter((item) => item.p0FreezeStatus === "required");
const shapeOnly = catalog.contracts.filter((item) => item.p0FreezeStatus === "shape-only");
if (requiredFreeze.length !== 17) failures.push(`expected 17 P0 freeze candidates, found ${requiredFreeze.length}`);
if (
  shapeOnly.length !== 2 ||
  !shapeOnly.some((item) => item.logicalId === "ImageOperationPlanV1") ||
  !shapeOnly.some((item) => item.logicalId === "ComponentPackageSpecV1")
) failures.push("P0 shape-only subset must be ImageOperationPlanV1 and ComponentPackageSpecV1");

// M0-T04/T05: every planned capability/language has a reproducible record and no guessed pin.
unique(candidates.records.map((record) => record.id), "candidate record ID");
const requiredLanguageCapabilities = ["rfc8785-canonicalization", "dsse-ed25519-sign-and-verify", "compact-jws-eddsa-verify"];
for (const language of ["go", "typescript", "python", "java"]) {
  for (const capability of requiredLanguageCapabilities) {
    if (!candidates.records.some((record) => record.language === language && record.capability === capability)) {
      failures.push(`missing DP-008 record for ${language}/${capability}`);
    }
  }
  if (!candidates.records.some((record) => record.language === language && record.capability === "json-schema-validation")) {
    failures.push(`missing DP-008 validator record for ${language}`);
  }
}
for (const capability of ["oci-1.1-publish-resolve-referrers", "json-schema-semantic-compatibility", "openapi-3.1.2-lint-normalize", "asyncapi-3.1.0-lint-normalize", "closed-bom-resolution"]) {
  if (!candidates.records.some((record) => record.capability === capability)) {
    failures.push(`missing tooling DP-008 record for ${capability}`);
  }
}
for (const record of candidates.records) {
  if (!record.candidate.trim() || !record.owner.trim() || record.plan !== "benchmark-plan.json") {
    failures.push(`incomplete DP-008 record: ${record.id}`);
  }
  if (!new Set(["pending-evidence", "pending-candidate", "accepted", "rejected"]).has(record.decision)) {
    failures.push(`invalid DP-008 decision state: ${record.id}/${record.decision}`);
  }
  if (record.decision.startsWith("pending-") && record.exactVersion !== "TBD") {
    failures.push(`exact version pinned before evidence approval: ${record.id}`);
  }
  if ((record.decision === "accepted" || record.decision === "rejected") && !record.evidence) {
    failures.push(`reviewed DP-008 decision has no evidence: ${record.id}`);
  }
  if (record.decision === "accepted" && record.exactVersion === "TBD") {
    failures.push(`accepted DP-008 candidate has no exact version: ${record.id}`);
  }
}
for (const field of ["p50LatencyNanoseconds", "p95LatencyNanoseconds", "throughputPerSecond", "cpuUserNanoseconds", "peakResidentBytes", "coldStartNanoseconds", "artifactDeltaBytes", "directDependencyCount", "transitiveDependencyCount"]) {
  if (!benchmark.requiredMeasurements.includes(field)) failures.push(`benchmark plan missing ${field}`);
}
if (benchmark.requiredAssessments.length < 15 || !benchmark.adapterProtocol) failures.push("benchmark assessment/protocol coverage is incomplete");
unique(datasets.cases.map((item) => item.id), "dataset case ID");
const representativeSchemaPath = join(M0_DIR, "dp008", datasets.representativeSchema);
if (!existsSync(representativeSchemaPath)) failures.push("DP-008 representative schema missing");
else readJson<Record<string, unknown>>(representativeSchemaPath);
for (const category of ["valid", "invalid", "adversarial", "maximum-bound"]) {
  if (!datasets.cases.some((item) => item.category === category)) failures.push(`dataset plan missing ${category}`);
}

// M0-T06/T07: decision and evidence governance remain explicit and unsigned.
for (const id of ["ADR-agent-contract-key-custody-trust-revocation-rollover", "DECISION-oci-registry-product", "ADR-custom-or-deviating-contract-technology"]) {
  if (!decisions.items.some((item) => item.id === id)) failures.push(`decision backlog missing ${id}`);
}
if (evidence.manifestLayers.length !== 2 || evidence.retentionClasses.length < 3 || evidence.raci.length < 5 || evidence.workflow.length < 6) {
  failures.push("evidence governance is incomplete");
}
const requiredRoles = ["Platform Contracts owner", "Security", "SRE", "Release owner", "Go owner", "TypeScript owner", "Python owner", "Java owner"];
for (const role of requiredRoles) {
  const acknowledgement = evidence.acknowledgements.find((item) => item.role === role);
  if (!acknowledgement) failures.push(`missing evidence acknowledgement role: ${role}`);
  else if (!new Set(["pending", "approved"]).has(acknowledgement.status)) {
    failures.push(`invalid acknowledgement state for ${role}`);
  } else if (acknowledgement.status === "approved" && !acknowledgement.evidence) {
    failures.push(`approved acknowledgement has no evidence for ${role}`);
  }
}
if (!existsSync(join(M0_DIR, "layout.md"))) failures.push("layout decision note missing");

if (failures.length > 0) {
  console.error("M0 governance baseline FAILED:");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `M0 governance baseline valid: ${inventory.legacyFiles.length} legacy files, ` +
  `${catalog.contracts.length} contract families (${requiredFreeze.length} P0 freeze candidates), ` +
  `${candidates.records.length} DP-008 records, ${datasets.cases.length} representative cases; ` +
  `${evidence.acknowledgements.filter((item) => item.status === "pending").length} ` +
  `owner acknowledgements remain pending`,
);
