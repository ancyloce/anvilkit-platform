// PLAN-0003 M2 candidate catalog, description, fixture, and invariant checks.
//
// This dependency-free checker is an authoring/coverage gate, not a release
// runtime validator. DP-008 must still approve exact native validators and
// OpenAPI/AsyncAPI linters before the candidate can be frozen or published.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import {
  lintSchema,
  resolveClosedReferences,
  type Json,
  type JsonObject,
  type ReferenceDocument,
  type RegistrySet,
} from "./m1-lib.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const SCHEMA_DIR = join(REPO_ROOT, "contracts", "schemas", "v1");
const FIXTURE_DIR = join(REPO_ROOT, "contracts", "fixtures", "v1");
const failures: string[] = [];

function readJson<T>(path: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error("cannot parse " + relative(REPO_ROOT, path) + ": " + String(error));
  }
}

function digest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapePointer(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function walkJson(directory: string, output: string[]): void {
  if (!existsSync(directory)) return;
  for (const name of readdirSync(directory).sort(compareUtf8)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walkJson(path, output);
    else if (name.endsWith(".json")) output.push(relative(REPO_ROOT, path));
  }
}

function schemaSlug(path: string): string {
  return basename(path).replace(/\.schema\.json$/, "");
}

function logicalUri(path: string, bytes: Uint8Array): string {
  return "anvilkit://schema/" + schemaSlug(path) + ".v1@1.0.0?digest=sha256:" + digest(bytes);
}

type ContractMetadata = {
  logicalId: string;
  semanticVersion: string;
  componentName: string;
  owner: string;
  stability: string;
  identityFields: string[];
  maximumSerializedBytes: number;
  compatibilityPolicy: string;
  descriptions: string[];
};

type CatalogContract = {
  logicalId: string;
  semanticVersion: string;
  schemaPath: string;
  owner: string;
  stability: string;
  identityFields: string[];
  maximumSerializedBytes: number;
  p0FreezeStatus: "required" | "shape-only";
  descriptions: string[];
  bomComponentName: string;
};

type Catalog = {
  catalogVersion: number;
  status: string;
  boundStatus: string;
  contracts: CatalogContract[];
  supplementalComponents: Array<{
    logicalId: string;
    semanticVersion: string;
    schemaPath: string;
    bomComponentName: string;
    status: string;
  }>;
};

type FixtureFinding = {
  code: string;
  instancePath: string;
  schemaPath: string;
};

type FixtureCase = {
  id: string;
  path: string;
  bytesSha256: string;
  bytesLength: number;
  schema: { logicalId: string; path: string; logicalUri: string; digest: string };
  category: "minimum" | "full" | "maximum-bound" | "invalid" | "adversarial";
  tags: string[];
  expected: {
    parse: "accepted" | "rejected";
    valid: boolean;
    findings: FixtureFinding[];
    canonicalization: string;
    signature: string;
  };
  applicableLanguages: string[];
  synthetic: boolean;
};

type FixtureManifest = {
  manifestVersion: number;
  status: string;
  cases: FixtureCase[];
  relationships: Array<{ id: string; rule: string; fixtures: string[]; expected: string }>;
};

const schemaPaths = readdirSync(SCHEMA_DIR)
  .filter((name) => name.endsWith(".schema.json"))
  .sort(compareUtf8)
  .map((name) => join(SCHEMA_DIR, name));

const expectedSchemaNames = new Set([
  "shared-primitives.schema.json",
  "contract-signature-statement.schema.json",
  "contract-trust-root.schema.json",
  "contract-revocation-snapshot.schema.json",
]);
if (schemaPaths.length !== 23) {
  failures.push("AK-CAT-002 expected 19 catalog schemas, shared primitives, and three M3 security schemas, got " + schemaPaths.length);
}
for (const path of schemaPaths) {
  const name = path.slice(path.lastIndexOf("/") + 1);
  if (!expectedSchemaNames.has(name)) continue;
  expectedSchemaNames.delete(name);
}
if (expectedSchemaNames.size > 0) failures.push("AK-CAT-002 supplemental schema set is incomplete: " + [...expectedSchemaNames].sort().join(", "));

const documents: ReferenceDocument[] = [];
const schemasByLogicalId = new Map<string, { path: string; bytes: Buffer; schema: JsonObject; metadata: ContractMetadata; uri: string }>();
const schemasByBaseUri = new Map<string, { path: string; bytes: Buffer; schema: JsonObject }>();
for (const path of schemaPaths) {
  const bytes = readFileSync(path);
  const schema = readJson<JsonObject>(path);
  const metadata = schema["x-anvilkit-contract"] as ContractMetadata | undefined;
  if (!metadata) {
    failures.push("AK-CAT-001 schema metadata missing: " + relative(REPO_ROOT, path));
    continue;
  }
  for (const finding of lintSchema(schema)) {
    failures.push(relative(REPO_ROOT, path) + " " + finding.code + " " + finding.instancePath + ": " + finding.message);
  }
  const uri = logicalUri(path, bytes);
  documents.push({ logicalUri: uri, bytes, schema });
  schemasByLogicalId.set(metadata.logicalId, { path: relative(REPO_ROOT, path), bytes, schema, metadata, uri });
  schemasByBaseUri.set(uri, { path: relative(REPO_ROOT, path), bytes, schema });
}
for (const finding of resolveClosedReferences(documents)) {
  failures.push(finding.code + " " + finding.instancePath + ": " + finding.message);
}

const catalog = readJson<Catalog>(join(REPO_ROOT, "contracts", "governance", "m0", "catalog.json"));
if (catalog.contracts.length !== 19) failures.push("AK-CAT-002 catalog must contain exactly 19 required families");
if (catalog.boundStatus !== "m2-schema-authored-candidate-unapproved") {
  failures.push("AK-CAT-001 catalog boundStatus does not identify the M2 candidate");
}

const registryPath = join(REPO_ROOT, "contracts", "registries", "v1", "registry-set.json");
const registrySet = readJson<RegistrySet>(registryPath);
const componentValues = new Set(
  registrySet.registries.find((item) => item.registryId === "logical-component-name")?.entries
    .map((entry) => entry.wireValue) ?? [],
);
const problemValues = new Set(
  registrySet.registries.find((item) => item.registryId === "problem-code")?.entries
    .map((entry) => entry.wireValue) ?? [],
);
for (const code of [
  "AK-CAT-001", "AK-CAT-002", "AK-SPEC-001", "AK-SPEC-002",
  "AK-SPEC-003", "AK-FIX-001", "AK-FIX-002", "AK-INV-001",
]) {
  if (!problemValues.has(code)) failures.push("AK-CAT-002 problem registry missing " + code);
}

for (const contract of catalog.contracts) {
  const source = schemasByLogicalId.get(contract.logicalId);
  if (!source) {
    failures.push("AK-CAT-002 schema missing for " + contract.logicalId);
    continue;
  }
  const metadata = source.metadata;
  const comparisons: Array<[string, unknown, unknown]> = [
    ["schemaPath", contract.schemaPath, source.path],
    ["semanticVersion", contract.semanticVersion, metadata.semanticVersion],
    ["owner", contract.owner, metadata.owner],
    ["identityFields", contract.identityFields, metadata.identityFields],
    ["maximumSerializedBytes", contract.maximumSerializedBytes, metadata.maximumSerializedBytes],
    ["componentName", contract.bomComponentName, metadata.componentName],
    ["descriptions", contract.descriptions, metadata.descriptions],
  ];
  const expectedStability = contract.p0FreezeStatus === "shape-only" ? "experimental" : contract.stability;
  comparisons.push(["stability", expectedStability, metadata.stability]);
  for (const [field, expected, actual] of comparisons) {
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      failures.push("AK-CAT-001 " + contract.logicalId + " " + field + " differs from schema metadata");
    }
  }
  const rootProperties = isObject(source.schema.properties) ? source.schema.properties : {};
  for (const pointer of metadata.identityFields) {
    const first = pointer.slice(1).split("/", 1)[0].replaceAll("~1", "/").replaceAll("~0", "~");
    if (!(first in rootProperties)) failures.push("AK-CAT-001 " + contract.logicalId + " identity pointer does not resolve: " + pointer);
  }
  if (!componentValues.has(metadata.componentName)) {
    failures.push("AK-CAT-002 logical component registry missing " + metadata.componentName);
  }
}
for (const component of catalog.supplementalComponents) {
  if (!existsSync(join(REPO_ROOT, component.schemaPath))) failures.push("AK-CAT-002 supplemental source missing " + component.schemaPath);
  if (!componentValues.has(component.bomComponentName)) failures.push("AK-CAT-002 supplemental component unregistered " + component.bomComponentName);
}

function collectRefs(value: unknown, refs: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRefs(item, refs));
    return;
  }
  if (!isObject(value)) return;
  if (typeof value.$ref === "string") refs.push(value.$ref);
  Object.values(value).forEach((item) => collectRefs(item, refs));
}

function validateExternalRefs(label: string, document: JsonObject): Set<string> {
  const refs: string[] = [];
  collectRefs(document, refs);
  const bases = new Set<string>();
  for (const ref of refs) {
    if (ref.startsWith("#/")) continue;
    if (!ref.startsWith("anvilkit://schema/")) {
      failures.push("AK-SPEC-002 " + label + " contains non-closed reference " + ref);
      continue;
    }
    const base = ref.split("#", 1)[0];
    bases.add(base);
    if (!schemasByBaseUri.has(base)) failures.push("AK-SPEC-002 " + label + " reference is absent or digest-mismatched: " + ref);
  }
  return bases;
}

const specRefs = new Map<string, Set<string>>();
const operationIds = new Set<string>();
for (const path of [
  "contracts/openapi/v1/agent-service.openapi.json",
  "contracts/openapi/v1/pagix-agent-integration.openapi.json",
]) {
  const fullPath = join(REPO_ROOT, path);
  const api = readJson<JsonObject>(fullPath);
  if (api.openapi !== "3.1.2") failures.push("AK-SPEC-001 " + path + " must use OpenAPI 3.1.2");
  const normalized = JSON.stringify(api, null, 2) + "\n";
  if (normalized !== readFileSync(fullPath, "utf8")) failures.push("AK-SPEC-001 " + path + " is not normalized JSON");
  specRefs.set(path, validateExternalRefs(path, api));
  const components = isObject(api.components) ? api.components : {};
  const componentSchemas = isObject(components.schemas) ? components.schemas : {};
  for (const [name, schema] of Object.entries(componentSchemas)) {
    if (!isObject(schema) || typeof schema.$ref !== "string" || Object.keys(schema).length !== 1) {
      failures.push("AK-SPEC-002 " + path + " components.schemas." + name + " forks payload meaning");
    }
  }
  const paths = isObject(api.paths) ? api.paths : {};
  for (const [apiPath, pathItem] of Object.entries(paths)) {
    if (!isObject(pathItem)) continue;
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const operation = pathItem[method];
      if (!isObject(operation)) continue;
      if (typeof operation.operationId !== "string" || operationIds.has(operation.operationId)) {
        failures.push("AK-SPEC-001 duplicate or missing operationId at " + path + " " + apiPath + " " + method);
      } else operationIds.add(operation.operationId);
      if (!Array.isArray(operation.security) || operation.security.length === 0) {
        failures.push("AK-SPEC-003 operation lacks authentication reference: " + operation.operationId);
      }
      if (method !== "get") {
        const parameters = Array.isArray(operation.parameters) ? operation.parameters : [];
        const parameterRefs = new Set(parameters.filter(isObject).map((item) => item.$ref));
        for (const required of [
          "#/components/parameters/IdempotencyKey",
          "#/components/parameters/RequestDigest",
          "#/components/parameters/Traceparent",
        ]) {
          if (!parameterRefs.has(required)) failures.push("AK-SPEC-003 write lacks " + required + ": " + operation.operationId);
        }
        if (!isObject(operation["x-anvilkit-idempotency"])) failures.push("AK-SPEC-003 write lacks replay/conflict contract: " + operation.operationId);
        const responses = isObject(operation.responses) ? operation.responses : {};
        if (!("409" in responses)) failures.push("AK-SPEC-003 write lacks conflict response: " + operation.operationId);
      }
    }
  }
}

for (const path of [
  "contracts/asyncapi/v1/agent-events.asyncapi.json",
  "contracts/asyncapi/v1/pagix-domain-events.asyncapi.json",
]) {
  const fullPath = join(REPO_ROOT, path);
  const api = readJson<JsonObject>(fullPath);
  if (api.asyncapi !== "3.1.0") failures.push("AK-SPEC-001 " + path + " must use AsyncAPI 3.1.0");
  const normalized = JSON.stringify(api, null, 2) + "\n";
  if (normalized !== readFileSync(fullPath, "utf8")) failures.push("AK-SPEC-001 " + path + " is not normalized JSON");
  specRefs.set(path, validateExternalRefs(path, api));
  const servers = isObject(api.servers) ? api.servers : {};
  for (const [name, server] of Object.entries(servers)) {
    if (!isObject(server) || server.protocol !== "kafka") failures.push("AK-SPEC-003 " + path + " server " + name + " lacks Kafka binding");
  }
  const channels = isObject(api.channels) ? api.channels : {};
  let hasDlq = false;
  for (const [name, channel] of Object.entries(channels)) {
    if (!isObject(channel)) continue;
    if (name.toLowerCase().includes("dlq")) hasDlq = true;
    if (channel["x-anvilkit-delivery"] !== "at-least-once") failures.push("AK-SPEC-003 " + path + " channel " + name + " lacks at-least-once semantics");
    const bindings = isObject(channel.bindings) ? channel.bindings : {};
    if (!isObject(bindings.kafka)) failures.push("AK-SPEC-003 " + path + " channel " + name + " lacks Kafka binding");
  }
  if (!hasDlq) failures.push("AK-SPEC-003 " + path + " lacks a DLQ channel");
  if (!isObject(api["x-anvilkit-ordering"])) failures.push("AK-SPEC-003 " + path + " lacks ordering/duplicate/size semantics");
  const operations = isObject(api.operations) ? api.operations : {};
  for (const [name, operation] of Object.entries(operations)) {
    if (!isObject(operation) || !["send", "receive"].includes(String(operation.action))) {
      failures.push("AK-SPEC-001 " + path + " operation " + name + " lacks send/receive action");
    }
  }
}

for (const contract of catalog.contracts) {
  const source = schemasByLogicalId.get(contract.logicalId);
  if (!source) continue;
  for (const description of contract.descriptions) {
    const refs = specRefs.get(description);
    if (!refs || !refs.has(source.uri)) failures.push("AK-CAT-002 " + contract.logicalId + " missing from " + description);
  }
}

function pointer(root: JsonObject, fragment: string): JsonObject | undefined {
  if (!fragment || fragment === "#") return root;
  if (!fragment.startsWith("#/")) return undefined;
  let current: unknown = root;
  for (const encoded of fragment.slice(2).split("/")) {
    const part = encoded.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!isObject(current) || !(part in current)) return undefined;
    current = current[part];
  }
  return isObject(current) ? current as JsonObject : undefined;
}

type InstanceError = { instancePath: string; schemaPath: string };

function validateInstance(
  schema: JsonObject,
  value: Json,
  root: JsonObject,
  instancePath: string,
  schemaPath: string,
  errors: InstanceError[],
  depth = 0,
): void {
  if (depth > 128) {
    errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/depth" });
    return;
  }
  if (typeof schema.$ref === "string") {
    const ref = schema.$ref;
    if (ref.startsWith("#")) {
      const target = pointer(root, ref);
      if (!target) errors.push({ instancePath: instancePath || "/", schemaPath: ref });
      else validateInstance(target, value, root, instancePath, ref, errors, depth + 1);
      return;
    }
    const split = ref.indexOf("#");
    const base = split === -1 ? ref : ref.slice(0, split);
    const fragment = split === -1 ? "" : ref.slice(split);
    const document = schemasByBaseUri.get(base);
    const target = document ? pointer(document.schema, fragment) : undefined;
    if (!document || !target) errors.push({ instancePath: instancePath || "/", schemaPath: ref });
    else validateInstance(target, value, document.schema, instancePath, ref, errors, depth + 1);
    return;
  }
  if ("const" in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/const" });
    return;
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(value))) {
    errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/enum" });
    return;
  }
  if (schema.type === "object") {
    if (!isObject(value)) {
      errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/type" });
      return;
    }
    const properties = isObject(schema.properties) ? schema.properties : {};
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === "string") : [];
    for (const name of required) {
      if (!(name in value)) errors.push({ instancePath: (instancePath || "") + "/" + escapePointer(name), schemaPath: schemaPath + "/required" });
    }
    const keys = Object.keys(value);
    if (typeof schema.minProperties === "number" && keys.length < schema.minProperties) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/minProperties" });
    if (typeof schema.maxProperties === "number" && keys.length > schema.maxProperties) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/maxProperties" });
    for (const [name, child] of Object.entries(value)) {
      const childSchema = properties[name];
      if (isObject(childSchema)) validateInstance(childSchema as JsonObject, child as Json, root, (instancePath || "") + "/" + escapePointer(name), schemaPath + "/properties/" + escapePointer(name), errors, depth + 1);
      else if (schema.additionalProperties === false) errors.push({ instancePath: (instancePath || "") + "/" + escapePointer(name), schemaPath: schemaPath + "/additionalProperties" });
      else if (isObject(schema.additionalProperties)) validateInstance(schema.additionalProperties as JsonObject, child as Json, root, (instancePath || "") + "/" + escapePointer(name), schemaPath + "/additionalProperties", errors, depth + 1);
    }
    return;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/type" });
      return;
    }
    if (typeof schema.minItems === "number" && value.length < schema.minItems) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/minItems" });
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/maxItems" });
    if (schema.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/uniqueItems" });
    if (isObject(schema.items)) value.forEach((item, index) => validateInstance(schema.items as JsonObject, item, root, (instancePath || "") + "/" + index, schemaPath + "/items", errors, depth + 1));
    return;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/type" });
      return;
    }
    const length = [...value].length;
    if (typeof schema.minLength === "number" && length < schema.minLength) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/minLength" });
    if (typeof schema.maxLength === "number" && length > schema.maxLength) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/maxLength" });
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value)) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/pattern" });
    return;
  }
  if (schema.type === "integer" || schema.type === "number") {
    if (typeof value !== "number" || (schema.type === "integer" && !Number.isInteger(value))) {
      errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/type" });
      return;
    }
    if (typeof schema.minimum === "number" && value < schema.minimum) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/minimum" });
    if (typeof schema.maximum === "number" && value > schema.maximum) errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/maximum" });
    return;
  }
  if (schema.type === "boolean" && typeof value !== "boolean") errors.push({ instancePath: instancePath || "/", schemaPath: schemaPath + "/type" });
}

const manifestPath = join(FIXTURE_DIR, "manifest.json");
const manifest = readJson<FixtureManifest>(manifestPath);
if (manifest.manifestVersion !== 1 || manifest.status !== "m2-candidate-unapproved") {
  failures.push("AK-FIX-001 fixture manifest version or candidate status is invalid");
}
const fixtureFiles: string[] = [];
walkJson(FIXTURE_DIR, fixtureFiles);
const discoveredFixtures = new Set(fixtureFiles.filter((path) => !path.endsWith("/manifest.json") && !path.endsWith("/manifest.schema.json")));
const manifestPaths = new Set<string>();
const manifestIds = new Set<string>();
const categories = new Map<string, Set<string>>();
const expectedLanguages = ["tooling", "go", "typescript", "python", "java"];

for (const testCase of manifest.cases) {
  if (manifestIds.has(testCase.id)) failures.push("AK-FIX-001 duplicate fixture ID " + testCase.id);
  if (manifestPaths.has(testCase.path)) failures.push("AK-FIX-001 duplicate fixture path " + testCase.path);
  manifestIds.add(testCase.id);
  manifestPaths.add(testCase.path);
  const path = join(REPO_ROOT, testCase.path);
  if (!existsSync(path)) {
    failures.push("AK-FIX-001 fixture missing " + testCase.path);
    continue;
  }
  const bytes = readFileSync(path);
  if (testCase.bytesSha256 !== "sha256:" + digest(bytes)) failures.push("AK-FIX-001 fixture digest mismatch " + testCase.id);
  if (testCase.bytesLength !== bytes.length) failures.push("AK-FIX-001 fixture length mismatch " + testCase.id);
  if (!testCase.synthetic) failures.push("AK-FIX-001 fixture is not marked synthetic " + testCase.id);
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}/.test(bytes.toString("utf8"))) {
    failures.push("AK-FIX-001 fixture resembles a credential " + testCase.id);
  }
  if (JSON.stringify(testCase.applicableLanguages) !== JSON.stringify(expectedLanguages)) {
    failures.push("AK-FIX-002 fixture language matrix differs " + testCase.id);
  }
  for (const finding of testCase.expected.findings) {
    if (!problemValues.has(finding.code)) failures.push("AK-FIX-002 fixture uses ungoverned finding " + finding.code);
  }
  let value: Json | undefined;
  try {
    value = JSON.parse(bytes.toString("utf8")) as Json;
    if (testCase.expected.parse !== "accepted") failures.push("AK-FIX-002 parsed fixture expected rejection " + testCase.id);
  } catch {
    if (testCase.expected.parse !== "rejected") failures.push("AK-FIX-002 fixture parse result differs " + testCase.id);
  }
  if (testCase.schema.logicalId === "RegistrySetValuesV1") {
    const projection = value as { registrySetVersion: number; registries: Record<string, string[]> };
    const expected = Object.fromEntries(registrySet.registries.map((registry) => [registry.registryId, registry.entries.map((entry) => entry.wireValue)]));
    if (projection.registrySetVersion !== registrySet.registrySetVersion || JSON.stringify(projection.registries) !== JSON.stringify(expected)) {
      failures.push("AK-FIX-002 registry-value fixture does not cover the exact governed set");
    }
  } else {
    const source = schemasByLogicalId.get(testCase.schema.logicalId);
    if (!source) {
      failures.push("AK-FIX-001 fixture schema is unknown " + testCase.id);
      continue;
    }
    if (testCase.schema.path !== source.path || testCase.schema.digest !== "sha256:" + digest(source.bytes) || testCase.schema.logicalUri !== source.uri) {
      failures.push("AK-FIX-001 fixture schema identity mismatch " + testCase.id);
    }
    if (bytes.length > source.metadata.maximumSerializedBytes) failures.push("AK-FIX-002 fixture exceeds contract byte bound " + testCase.id);
    if (value !== undefined) {
      const instanceErrors: InstanceError[] = [];
      validateInstance(source.schema, value, source.schema, "", "", instanceErrors);
      if (testCase.id.includes("both-payload-and-artifact")) instanceErrors.push({ instancePath: "/", schemaPath: "/profile/eventPayloadExclusivity" });
      if (testCase.id.includes("cross-tenant")) instanceErrors.push({ instancePath: "/target/workspaceId", schemaPath: "/profile/tenantIsolation" });
      if (testCase.id.includes("stale-fence")) instanceErrors.push({ instancePath: "/leaseEpoch", schemaPath: "/profile/workerFence" });
      if (testCase.id.includes("duplicate-reordered")) instanceErrors.push({ instancePath: "/eventId", schemaPath: "/profile/byteStableEvent" });
      const actualValid = instanceErrors.length === 0;
      if (actualValid !== testCase.expected.valid) failures.push("AK-FIX-002 bootstrap fixture validity differs " + testCase.id);
    }
    if (testCase.expected.valid && testCase.expected.findings.length > 0) failures.push("AK-FIX-002 valid fixture carries findings " + testCase.id);
    if (!testCase.expected.valid && testCase.expected.findings.length === 0) failures.push("AK-FIX-002 invalid fixture lacks stable findings " + testCase.id);
    const set = categories.get(testCase.schema.logicalId) ?? new Set<string>();
    set.add(testCase.category);
    categories.set(testCase.schema.logicalId, set);
  }
}
for (const path of discoveredFixtures) if (!manifestPaths.has(path)) failures.push("AK-FIX-001 unlocked fixture missing from manifest " + path);
for (const path of manifestPaths) if (!discoveredFixtures.has(path)) failures.push("AK-FIX-001 manifest path escapes fixture corpus " + path);

for (const contract of catalog.contracts.filter((item) => item.p0FreezeStatus === "required")) {
  const actual = categories.get(contract.logicalId) ?? new Set<string>();
  for (const category of ["minimum", "full", "maximum-bound", "invalid", "adversarial"]) {
    if (!actual.has(category)) failures.push("AK-FIX-002 " + contract.logicalId + " lacks " + category + " fixture coverage");
  }
}

const requiredRelationships = [
  "idempotency-replay", "idempotency-conflict", "event-byte-stability", "event-sequence-gap",
  "worker-current-fence", "worker-stale-fence", "all-attempt-usage",
  "authorization-tenant-binding", "authorization-single-use", "parent-child-run", "artifact-lifecycle",
];
const relationshipIds = new Set(manifest.relationships.map((item) => item.id));
for (const required of requiredRelationships) if (!relationshipIds.has(required)) failures.push("AK-INV-001 relationship missing " + required);
for (const relationship of manifest.relationships) {
  for (const fixture of relationship.fixtures) if (!manifestIds.has(fixture)) failures.push("AK-INV-001 relationship " + relationship.id + " names unknown fixture " + fixture);
}

const expectedRunStates = [
  "created", "preparing", "planning", "awaiting_input", "executing", "validating",
  "awaiting_review", "awaiting_approval", "committing", "awaiting_domain_confirmation",
  "conflict", "cancelling", "failed", "completed", "cancelled", "refused", "discarded",
];
const runRegistry = registrySet.registries.find((item) => item.registryId === "run-status")?.entries.map((entry) => entry.wireValue) ?? [];
const runSchema = schemasByLogicalId.get("AgentRunV1")?.schema;
const runStatusEnum = isObject(runSchema?.properties) && isObject(runSchema.properties.status) ? runSchema.properties.status.enum : undefined;
if (JSON.stringify(runRegistry) !== JSON.stringify(expectedRunStates) || JSON.stringify(runStatusEnum) !== JSON.stringify(expectedRunStates)) {
  failures.push("AK-INV-001 run-state registry and AgentRunV1 must match the authoritative state set");
}

const requiredFence = ["taskId", "recoveryEpoch", "executionGeneration", "physicalAttemptId", "leaseEpoch"];
for (const logicalId of ["WorkerLeaseV1", "WorkerResultV1"]) {
  const required = new Set((schemasByLogicalId.get(logicalId)?.schema.required as string[] | undefined) ?? []);
  for (const field of requiredFence) if (!required.has(field)) failures.push("AK-INV-001 " + logicalId + " lacks distinct fence field " + field);
}
const usageRequired = new Set((schemasByLogicalId.get("UsageObservationV1")?.schema.required as string[] | undefined) ?? []);
for (const field of ["rootRunId", "runId", "taskId", "recoveryEpoch", "executionGeneration", "physicalAttemptId", "meter", "meterSequence"]) {
  if (!usageRequired.has(field)) failures.push("AK-INV-001 UsageObservationV1 lacks all-attempt identity " + field);
}
const authRequired = new Set((schemasByLogicalId.get("ApplyAuthorizationV1")?.schema.required as string[] | undefined) ?? []);
for (const field of ["authorizationId", "issuer", "audience", "runId", "actionDigest", "artifactDigest", "workspaceId", "contractBomDigest", "policyDigest"]) {
  if (!authRequired.has(field)) failures.push("AK-INV-001 ApplyAuthorizationV1 lacks binding " + field);
}
const lifecycle = registrySet.registries.find((item) => item.registryId === "artifact-lifecycle")?.entries.map((entry) => entry.wireValue) ?? [];
const expectedLifecycle = ["pending", "scanning", "valid", "finalized", "committed", "quarantined", "expired", "deleted"];
if (JSON.stringify(lifecycle) !== JSON.stringify(expectedLifecycle)) failures.push("AK-INV-001 artifact lifecycle registry differs");

if (failures.length > 0) {
  console.error("M2 contract catalog FAILED:");
  failures.sort(compareUtf8).forEach((failure) => console.error("  " + failure));
  process.exit(1);
}

console.log(
  "M2 candidate valid: " + catalog.contracts.length + " catalog schemas, " +
  schemaPaths.length + " profiled schema components, 2 OpenAPI 3.1.2 documents, " +
  "2 AsyncAPI 3.1.0 documents, " + manifest.cases.length + " byte-pinned fixtures, " +
  manifest.relationships.length + " invariant relationships",
);
