// PLAN-0003 M1 source-profile, registry, reference, and compatibility checks.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  compareRegistrySets,
  compareSchemas,
  isPortableRegex,
  lintSchema,
  resolveClosedReferences,
  stableFindings,
  validateRegistrySet,
  type Json,
  type JsonObject,
  type ReferenceDocument,
  type RegistryEntry,
  type RegistrySet,
} from "./m1-lib.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const failures: string[] = [];

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error(`cannot parse ${relative(REPO_ROOT, path)}: ${error}`);
  }
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function pointerParts(path: string): string[] {
  if (!path.startsWith("/")) throw new Error(`mutation path is not a JSON Pointer: ${path}`);
  return path.slice(1).split("/").map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
}

type Mutation = { op: "set" | "delete"; path: string; value?: Json };

function mutate(root: JsonObject, mutation: Mutation): void {
  const parts = pointerParts(mutation.path);
  let parent: JsonObject = root;
  for (const part of parts.slice(0, -1)) {
    if (parent[part] === undefined) parent[part] = {};
    const child = parent[part];
    if (child === null || typeof child !== "object" || Array.isArray(child)) {
      throw new Error(`mutation path crosses non-object at ${mutation.path}`);
    }
    parent = child as JsonObject;
  }
  const key = parts.at(-1)!;
  if (mutation.op === "delete") delete parent[key];
  else parent[key] = clone(mutation.value as Json);
}

function codeSet(findings: Array<{ code: string }>): Set<string> {
  return new Set(findings.map((finding) => finding.code));
}

function expectCodes(caseId: string, actual: Set<string>, expected: string[]): void {
  const actualCodes = [...actual].sort();
  const expectedCodes = [...new Set(expected)].sort();
  if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) {
    failures.push(
      `${caseId}: expected findings ${expectedCodes.join(", ") || "none"}, ` +
      `got ${actualCodes.join(", ") || "none"}`,
    );
  }
}

// M1-T01/T02: meta-schema vocabulary and every source-profile adversarial case.
const metaPath = join(REPO_ROOT, "contracts", "schemas", "meta", "anvilkit-2020-12.schema.json");
const meta = readJson<JsonObject>(metaPath);
if (meta.$schema !== "https://json-schema.org/draft/2020-12/schema") {
  failures.push("meta-schema must use JSON Schema Draft 2020-12");
}
const requiredVocabularies = [
  "https://json-schema.org/draft/2020-12/vocab/core",
  "https://json-schema.org/draft/2020-12/vocab/applicator",
  "https://json-schema.org/draft/2020-12/vocab/validation",
  "https://json-schema.org/draft/2020-12/vocab/unevaluated",
  "https://json-schema.org/draft/2020-12/vocab/format-annotation",
  "https://json-schema.org/draft/2020-12/vocab/format-assertion",
];
const vocabulary = meta.$vocabulary as JsonObject | undefined;
for (const uri of requiredVocabularies) {
  if (vocabulary?.[uri] !== true) failures.push(`meta-schema vocabulary missing or optional: ${uri}`);
}
const checkMetaPatterns = (value: Json, path: string): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkMetaPatterns(item, `${path}/${index}`));
    return;
  }
  if (value === null || typeof value !== "object") return;
  const object = value as JsonObject;
  if (typeof object.pattern === "string" && !isPortableRegex(object.pattern)) {
    failures.push(`meta-schema contains nonportable pattern at ${path}/pattern`);
  }
  for (const [key, child] of Object.entries(object)) checkMetaPatterns(child, `${path}/${key}`);
};
checkMetaPatterns(meta, "");
const sourceCases = readJson<{
  base: JsonObject;
  cases: Array<{ id: string; mutations: Mutation[]; expectedCodes: string[] }>;
}>(join(REPO_ROOT, "contracts", "schemas", "meta", "source-lint-cases.json"));
for (const testCase of sourceCases.cases) {
  const schema = clone(sourceCases.base);
  testCase.mutations.forEach((item) => mutate(schema, item));
  const first = lintSchema(schema);
  const second = lintSchema(schema);
  expectCodes(`source/${testCase.id}`, codeSet(first), testCase.expectedCodes);
  if (JSON.stringify(first) !== JSON.stringify(second)) {
    failures.push(`source/${testCase.id}: repeated findings or source paths are not deterministic`);
  }
}

const sourceSchemaPaths = [
  join(REPO_ROOT, "contracts", "registries", "v1", "registry-set.schema.json"),
  join(REPO_ROOT, "contracts", "compatibility", "v1", "compatibility-report.schema.json"),
];
const v1SchemaDir = join(REPO_ROOT, "contracts", "schemas", "v1");
if (existsSync(v1SchemaDir)) {
  for (const name of readdirSync(v1SchemaDir).sort()) {
    const path = join(v1SchemaDir, name);
    if (statSync(path).isFile() && name.endsWith(".schema.json")) sourceSchemaPaths.push(path);
  }
}
for (const path of sourceSchemaPaths) {
  const findings = lintSchema(readJson<JsonObject>(path));
  for (const item of findings) failures.push(`${relative(REPO_ROOT, path)} ${item.code} ${item.instancePath}: ${item.message}`);
}

// M1-T03: closed reference resolution, digest, cycle, and depth behavior.
function logicalUri(name: string, bytes: Uint8Array): string {
  const digest = createHash("sha256").update(bytes).digest("hex");
  return `anvilkit://schema/${name}.v1@1.0.0?digest=sha256:${digest}`;
}
const bytesA = Buffer.from("document-a", "utf8");
const bytesB = Buffer.from("document-b", "utf8");
const bytesC = Buffer.from("document-c", "utf8");
const uriA = logicalUri("self-test-a", bytesA);
const uriB = logicalUri("self-test-b", bytesB);
const uriC = logicalUri("self-test-c", bytesC);
const validGraph: ReferenceDocument[] = [
  { logicalUri: uriA, bytes: bytesA, schema: { $ref: uriB } },
  { logicalUri: uriB, bytes: bytesB, schema: { type: "string" } },
];
expectCodes("reference/valid", codeSet(resolveClosedReferences(validGraph)), []);
expectCodes(
  "reference/not-found",
  codeSet(resolveClosedReferences([{ logicalUri: uriA, bytes: bytesA, schema: { $ref: uriC } }])),
  ["AK-REF-005"],
);
const mismatchUri = "anvilkit://schema/self-test-b.v1@1.0.0?digest=sha256:" + "0".repeat(64);
expectCodes(
  "reference/digest-mismatch",
  codeSet(resolveClosedReferences([
    { logicalUri: uriA, bytes: bytesA, schema: { $ref: mismatchUri } },
    { logicalUri: mismatchUri, bytes: bytesB, schema: { type: "string" } },
  ])),
  ["AK-REF-004"],
);
expectCodes(
  "reference/cycle",
  codeSet(resolveClosedReferences([
    { logicalUri: uriA, bytes: bytesA, schema: { $ref: uriB } },
    { logicalUri: uriB, bytes: bytesB, schema: { $ref: uriA } },
  ])),
  ["AK-REF-007"],
);
expectCodes(
  "reference/depth",
  codeSet(resolveClosedReferences([
    { logicalUri: uriA, bytes: bytesA, schema: { $ref: uriB } },
    { logicalUri: uriB, bytes: bytesB, schema: { $ref: uriC } },
    { logicalUri: uriC, bytes: bytesC, schema: { type: "string" } },
  ], 1)),
  ["AK-REF-006"],
);

// M1-T04/T05: registry validity, coverage, and append-only mutation corpus.
const registrySetPath = join(REPO_ROOT, "contracts", "registries", "v1", "registry-set.json");
const registrySet = readJson<RegistrySet>(registrySetPath);
const registryFindings = validateRegistrySet(registrySet);
for (const item of registryFindings) failures.push(`registry-set ${item.code} ${item.instancePath}: ${item.message}`);
const requiredRegistries = [
  "artifact-kind", "artifact-lifecycle", "problem-code", "retryability", "run-status", "event-type",
  "domain", "operation", "tool-capability", "tool-version", "risk-class", "side-effect-class",
  "data-class", "usage-meter", "usage-unit", "logical-component-name", "identity-purpose",
  "digest-algorithm", "signature-algorithm", "issuer", "audience", "key-status",
];
for (const registryId of requiredRegistries) {
  if (!registrySet.registries.some((registry) => registry.registryId === registryId)) {
    failures.push(`registry set missing ${registryId}`);
  }
}
const m0Catalog = readJson<{ contracts: Array<{ bomComponentName: string }> }>(
  join(REPO_ROOT, "contracts", "governance", "m0", "catalog.json"),
);
const componentValues = new Set(
  registrySet.registries.find((registry) => registry.registryId === "logical-component-name")
    ?.entries.map((entry) => entry.wireValue) ?? [],
);
for (const contract of m0Catalog.contracts) {
  if (!componentValues.has(contract.bomComponentName)) failures.push(`logical component registry missing ${contract.bomComponentName}`);
}
const governedProblemCodes = new Set(
  registrySet.registries.find((registry) => registry.registryId === "problem-code")
    ?.entries.map((entry) => entry.wireValue) ?? [],
);
const emittedProblemCodes = [
  ...Array.from({ length: 15 }, (_, index) => `AK-SRC-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 8 }, (_, index) => `AK-REF-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 6 }, (_, index) => `AK-REG-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 3 }, (_, index) => `AK-COMPAT-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 4 }, (_, index) => `AK-FREEZE-${String(index + 1).padStart(3, "0")}`),
];
for (const code of emittedProblemCodes) {
  if (!governedProblemCodes.has(code)) failures.push(`problem-code registry missing emitted code ${code}`);
}

type RegistryMutation =
  | { op: "append-entry"; value: RegistryEntry }
  | { op: "delete-entry"; wireValue: string }
  | { op: "set-entry"; wireValue: string; field: keyof RegistryEntry; value: Json };
const registryCases = readJson<{
  baseRegistry: string;
  cases: Array<{ id: string; mutations: RegistryMutation[]; expectedCodes: string[] }>;
}>(join(REPO_ROOT, "contracts", "registries", "v1", "registry-diff-cases.json"));
for (const testCase of registryCases.cases) {
  const candidate = clone(registrySet);
  const registry = candidate.registries.find((item) => item.registryId === registryCases.baseRegistry)!;
  for (const mutation of testCase.mutations) {
    if (mutation.op === "append-entry") registry.entries.push(clone(mutation.value));
    if (mutation.op === "delete-entry") registry.entries = registry.entries.filter((entry) => entry.wireValue !== mutation.wireValue);
    if (mutation.op === "set-entry") {
      const entry = registry.entries.find((item) => item.wireValue === mutation.wireValue)!;
      (entry as unknown as Record<string, Json>)[mutation.field] = clone(mutation.value);
    }
  }
  expectCodes(
    `registry/${testCase.id}`,
    codeSet(compareRegistrySets(registrySet, candidate)),
    testCase.expectedCodes,
  );
}

// M1-T06: deterministic structural classifications and escalation gates.
const compatibilityCases = readJson<{
  cases: Array<{
    id: string;
    mutations: Mutation[];
    expectedClassification: string;
    compareFromFirstMutation?: boolean;
  }>;
}>(join(REPO_ROOT, "contracts", "compatibility", "v1", "compatibility-cases.json"));
for (const testCase of compatibilityCases.cases) {
  let previous = clone(sourceCases.base);
  let candidate = clone(sourceCases.base);
  if (testCase.compareFromFirstMutation) {
    mutate(previous, testCase.mutations[0]);
    candidate = clone(previous);
    testCase.mutations.slice(1).forEach((item) => mutate(candidate, item));
  } else {
    testCase.mutations.forEach((item) => mutate(candidate, item));
  }
  const first = compareSchemas(previous, candidate);
  const second = compareSchemas(previous, candidate);
  if (first.classification !== testCase.expectedClassification) {
    failures.push(`compatibility/${testCase.id}: expected ${testCase.expectedClassification}, got ${first.classification}`);
  }
  if (JSON.stringify(first) !== JSON.stringify(second)) {
    failures.push(`compatibility/${testCase.id}: repeated analysis is not byte-deterministic`);
  }
}

const comparison = readJson<{ fields: string[]; severityOrder: string[]; stringOrder: string }>(
  join(REPO_ROOT, "contracts", "registries", "v1", "finding-comparison.json"),
);
if (JSON.stringify(comparison.fields) !== JSON.stringify(["severity", "code", "instancePath", "schemaPath", "message"])) {
  failures.push("finding comparison fields changed");
}
if (JSON.stringify(comparison.severityOrder) !== JSON.stringify(["error", "warning", "info"])) {
  failures.push("finding severity order changed");
}
const orderingProbe = stableFindings([
  { code: "B", severity: "error", instancePath: "/z", schemaPath: "", message: "b", retryability: "never" },
  { code: "A", severity: "error", instancePath: "/z", schemaPath: "", message: "a", retryability: "never" },
  { code: "A", severity: "warning", instancePath: "/a", schemaPath: "", message: "a", retryability: "never" },
]);
if (orderingProbe.map((item) => `${item.severity}:${item.code}`).join(",") !== "error:A,error:B,warning:A") {
  failures.push("stable finding ordering implementation diverges from comparison contract");
}

if (failures.length > 0) {
  console.error("M1 source authority FAILED:");
  failures.forEach((item) => console.error(`  ${item}`));
  process.exit(1);
}

console.log(
  `M1 source authority valid: ${sourceSchemaPaths.length} profiled schemas, ` +
  `${sourceCases.cases.length} lint cases, ${requiredRegistries.length} registries, ` +
  `${registrySet.registries.reduce((count, registry) => count + registry.entries.length, 0)} entries, ` +
  `${registryCases.cases.length} registry-diff cases, ${compatibilityCases.cases.length} compatibility cases`,
);
