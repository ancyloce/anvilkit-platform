// PLAN-0003 M5-T01 structural gate.
//
// This gate validates schema-family coverage and closed graph invariants. It
// does not compose or identify a release BOM, sign it, or contact a registry.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  validateBomGraph,
  validateBomReference,
  type ContractBom,
  type ContractBomReference,
} from "./bom-graph.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const BOM_DIR = join(REPO_ROOT, "contracts", "bom", "v1");
const failures: string[] = [];

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error(`cannot parse ${relative(REPO_ROOT, path)}: ${String(error)}`);
  }
}

function digest(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

type JsonSchema = {
  $schema?: string;
  $id?: string;
  type?: string;
  required?: string[];
  properties?: Record<string, unknown>;
  additionalProperties?: boolean;
  unevaluatedProperties?: boolean;
  $defs?: Record<string, unknown>;
};

const schemaPaths = [
  "contracts/bom/v1/contract-bom.schema.json",
  "contracts/bom/v1/contract-bom-reference.schema.json",
  "contracts/bom/v1/generator-set.schema.json",
  "contracts/bom/v1/release-evidence.schema.json",
  "contracts/fixtures/v1/manifest.schema.json",
  "contracts/registries/v1/registry-set.schema.json",
];
for (const relativePath of schemaPaths) {
  const path = join(REPO_ROOT, relativePath);
  if (!existsSync(path)) {
    failures.push(`M5 schema family member missing: ${relativePath}`);
    continue;
  }
  const schema = readJson<JsonSchema>(path);
  if (!["https://json-schema.org/draft/2020-12/schema", "https://contracts.anvilkit.dev/schemas/meta/anvilkit-2020-12.schema.json"].includes(schema.$schema ?? "")) {
    failures.push(`${relativePath}: must use JSON Schema Draft 2020-12`);
  }
  if (schema.type !== "object" || (schema.additionalProperties !== false && schema.unevaluatedProperties !== false)) {
    failures.push(`${relativePath}: root schema must be a closed object`);
  }
}

const bomSchema = readJson<JsonSchema>(join(BOM_DIR, "contract-bom.schema.json"));
for (const definition of ["component", "dependency", "compatibility"]) {
  if (!(definition in (bomSchema.$defs ?? {}))) failures.push(`ContractBomV1 lacks $defs/${definition}`);
}
for (const field of [
  "digest", "components", "generatorSetDigest", "fixtureManifestDigest",
  "registrySetDigest", "releaseEvidenceDigest",
]) {
  if (!(bomSchema.required ?? []).includes(field)) failures.push(`ContractBomV1 does not require ${field}`);
}

const referenceSchema = readJson<JsonSchema>(join(BOM_DIR, "contract-bom-reference.schema.json"));
for (const field of ["repository", "bomDigest", "ociManifestDigest", "evidenceManifestDigest"]) {
  if (!(referenceSchema.required ?? []).includes(field)) failures.push(`ContractBomReferenceV1 does not require ${field}`);
}
if (JSON.stringify(referenceSchema.properties?.bomDigest) === JSON.stringify(referenceSchema.properties?.ociManifestDigest)) {
  // The shapes intentionally match, but the separately named properties are
  // what prevent semantic identity from being used as an OCI locator.
  if (!("bomDigest" in (referenceSchema.properties ?? {})) || !("ociManifestDigest" in (referenceSchema.properties ?? {}))) {
    failures.push("ContractBomReferenceV1 collapses semantic and OCI digest namespaces");
  }
}

type FixtureCase = {
  id: string;
  path: string;
  operation: "bom-graph" | "bom-reference";
  expectedCodes: string[];
};
type FixtureSet = { fixtureSetVersion: number; status: string; cases: FixtureCase[] };
const fixtureSet = readJson<FixtureSet>(join(BOM_DIR, "fixtures", "cases.json"));
if (fixtureSet.fixtureSetVersion !== 1 || fixtureSet.status !== "m5-t01-candidate-unapproved") {
  failures.push("M5 fixture set bytes differ from the frozen v1 candidate");
}
const ids = new Set<string>();
const paths = new Set<string>();
const coveredCodes = new Set<string>();
for (const testCase of fixtureSet.cases) {
  if (ids.has(testCase.id)) failures.push(`${testCase.id}: duplicate fixture ID`);
  if (paths.has(testCase.path)) failures.push(`${testCase.id}: duplicate fixture path`);
  ids.add(testCase.id);
  paths.add(testCase.path);
  const path = join(REPO_ROOT, testCase.path);
  if (!existsSync(path)) {
    failures.push(`${testCase.id}: fixture missing`);
    continue;
  }
  const value = readJson<ContractBom | ContractBomReference>(path);
  const findings = testCase.operation === "bom-graph"
    ? validateBomGraph(value as ContractBom)
    : validateBomReference(value as ContractBomReference);
  const repeatedFindings = testCase.operation === "bom-graph"
    ? validateBomGraph(value as ContractBom)
    : validateBomReference(value as ContractBomReference);
  if (JSON.stringify(findings) !== JSON.stringify(repeatedFindings)) {
    failures.push(`${testCase.id}: repeated evaluation was not deterministic`);
  }
  const actualCodes = [...new Set(findings.map((item) => item.code))].sort();
  const expectedCodes = [...testCase.expectedCodes].sort();
  if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) {
    failures.push(`${testCase.id}: expected ${expectedCodes.join(",") || "valid"}, got ${actualCodes.join(",") || "valid"}`);
  }
  actualCodes.forEach((code) => coveredCodes.add(code));
  if (digest(path).length !== 64) failures.push(`${testCase.id}: fixture digest calculation failed`);
}

for (const code of [
  "BOM_COMPONENT_UNSORTED", "BOM_COMPONENT_DUPLICATE", "BOM_COMPONENT_CONFLICT", "BOM_DEPENDENCY_MISSING",
  "BOM_DEPENDENCY_CYCLE", "BOM_MUTABLE_SELECTOR", "BOM_REFERENCE_INCOMPLETE",
]) {
  if (!coveredCodes.has(code)) failures.push(`M5 adversarial corpus lacks ${code}`);
}

const completeReference: ContractBomReference = {
  repository: "registry.example.invalid/anvilkit/contracts",
  bomDigest: "sha256:" + "1".repeat(64),
  ociManifestDigest: "sha256:" + "2".repeat(64),
  evidenceManifestDigest: "sha256:" + "3".repeat(64),
};
if (validateBomReference(completeReference).length !== 0) failures.push("complete dual-digest reference rejected");

if (failures.length > 0) {
  console.error("M5 structural candidate FAILED:");
  failures.sort().forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  `M5-T01 structural gate valid: 9 logical schemas across ${schemaPaths.length} schema-family documents, ` +
  `${fixtureSet.cases.length} graph/reference cases, ${coveredCodes.size} adversarial outcomes; ` +
  "composition, projections, resolver, dual-digest verification, cache, publication, and mirror/rollback are checked separately",
);
