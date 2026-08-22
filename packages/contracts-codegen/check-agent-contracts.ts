// Canonical Agent contract validation gate (ADR-018/020/021/022, design 0003).
//
// Validates the one canonical non-versioned Agent contract tree:
// source lint, closed digest-pinned references, registry governance,
// OpenAPI/AsyncAPI structural semantics, the byte-pinned fixture corpus,
// cross-contract invariants, Event/Evidence/Delta separation, and the
// canonical identity and signing corpora.
//
// --update-manifest deterministically regenerates
// contracts/agent/fixtures/manifest.json from the corpus; without the flag the
// on-disk manifest must be byte-identical to the regeneration.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import {
  lintSchema,
  resolveClosedReferences,
  validateRegistrySet,
  type Json,
  type JsonObject,
  type ReferenceDocument,
  type RegistrySet,
} from "./source-lint.ts";
import { NativeTypeScriptValidator } from "./native-validator.ts";
import { StrictJsonError, admitStrictJson, type JsonValue, type ValidationFinding } from "./strict-json.ts";
import { IdentityProfileError, canonicalizeJcs } from "./identity.ts";
import {
  NativeIdentityError,
  nativeCanonicalize,
  nativeComponentIdentity,
  nativeContractBomIdentity,
} from "./native-identity.ts";
import { generateSignatureResult } from "./emit-typescript-signature.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const AGENT_ROOT = join(REPO_ROOT, "contracts", "agent");
const SCHEMA_DIR = join(AGENT_ROOT, "schemas");
const FIXTURE_DIR = join(AGENT_ROOT, "fixtures");
const UPDATE_MANIFEST = process.argv.includes("--update-manifest");
const failures: string[] = [];

const PUBLIC_EVENT_TYPES = [
  "run.created",
  "run.state-changed",
  "run.input-requested",
  "run.approval-requested",
  "run.artifact-available",
  "run.problem-recorded",
];

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

function walkJson(directory: string, output: string[]): void {
  if (!existsSync(directory)) return;
  for (const name of readdirSync(directory).sort(compareUtf8)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walkJson(path, output);
    else if (name.endsWith(".json")) output.push(relative(REPO_ROOT, path));
  }
}

function logicalUri(path: string, bytes: Uint8Array): string {
  return "anvilkit://schema/" + basename(path).replace(/\.schema\.json$/, "") + "?digest=sha256:" + digest(bytes);
}

// ---- 1. Canonical schema sources ----

const schemaPaths = readdirSync(SCHEMA_DIR)
  .filter((name) => name.endsWith(".schema.json"))
  .sort(compareUtf8)
  .map((name) => join(SCHEMA_DIR, name));

type SourceEntry = {
  slug: string;
  path: string;
  bytes: Buffer;
  schema: JsonObject;
  metadata: {
    logicalId: string;
    componentName: string;
    owner: string;
    stability: string;
    identityFields: string[];
    maximumSerializedBytes: number;
    descriptions: string[];
  };
  uri: string;
};

const documents: ReferenceDocument[] = [];
const bySlug = new Map<string, SourceEntry>();
const byLogicalId = new Map<string, SourceEntry>();
const byBaseUri = new Map<string, SourceEntry>();
for (const path of schemaPaths) {
  const bytes = readFileSync(path);
  const schema = readJson<JsonObject>(path);
  const metadata = schema["x-anvilkit-contract"] as SourceEntry["metadata"] | undefined;
  if (!metadata) {
    failures.push("AK-SRC-002 schema metadata missing: " + relative(REPO_ROOT, path));
    continue;
  }
  for (const finding of lintSchema(schema)) {
    failures.push(relative(REPO_ROOT, path) + " " + finding.code + " " + finding.instancePath + ": " + finding.message);
  }
  const uri = logicalUri(path, bytes);
  const entry: SourceEntry = { slug: basename(path).replace(/\.schema\.json$/, ""), path: relative(REPO_ROOT, path), bytes, schema, metadata, uri };
  documents.push({ logicalUri: uri, bytes, schema });
  bySlug.set(entry.slug, entry);
  if (byLogicalId.has(metadata.logicalId)) failures.push("AK-SRC-002 duplicate logicalId " + metadata.logicalId);
  byLogicalId.set(metadata.logicalId, entry);
  byBaseUri.set(uri, entry);
}
for (const finding of resolveClosedReferences(documents)) {
  failures.push(finding.code + " " + finding.instancePath + ": " + finding.message);
}

// release-generation residue sweep over canonical bytes
for (const entry of bySlug.values()) {
  const text = entry.bytes.toString("utf8");
  for (const needle of ["tenantId", "TenantId", "\"apiVersion\"", "semanticVersion", "compatibilityPolicy"]) {
    if (text.includes(needle)) failures.push("AK-SRC-002 " + entry.path + " retains superseded token " + needle);
  }
}

// ---- 2. Registry set ----

const registryPath = join(AGENT_ROOT, "registries", "registry-set.json");
const registryBytes = readFileSync(registryPath);
const registrySet = readJson<RegistrySet>(registryPath);
{
  const registrySchema = readJson<Record<string, unknown>>(join(AGENT_ROOT, "registries", "registry-set.schema.json"));
  const projected = structuredClone(registrySchema);
  delete (projected as Record<string, unknown>)["x-anvilkit-contract"];
  (projected as Record<string, unknown>).$schema = "https://json-schema.org/draft/2020-12/schema";
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(projected);
  if (!validate(registrySet)) {
    for (const error of validate.errors ?? []) failures.push("AK-REG-001 registry-set " + (error.instancePath || "/") + " " + (error.message ?? error.keyword));
  }
}
for (const finding of validateRegistrySet(registrySet)) {
  failures.push(finding.code + " " + finding.instancePath + ": " + finding.message);
}
function registryValues(registryId: string): string[] {
  return registrySet.registries.find((item) => item.registryId === registryId)?.entries.map((entry) => entry.wireValue) ?? [];
}
const problemValues = new Set(registryValues("problem-code"));
for (const code of [
  "AK-CAT-001", "AK-CAT-002", "AK-SPEC-001", "AK-SPEC-002",
  "AK-SPEC-003", "AK-FIX-001", "AK-FIX-002", "AK-INV-001", "AK-PROFILE-001",
]) {
  if (!problemValues.has(code)) failures.push("AK-CAT-002 problem registry missing " + code);
}
const componentValues = new Set(registryValues("logical-component-name"));
for (const entry of bySlug.values()) {
  if (!componentValues.has(entry.metadata.componentName)) {
    failures.push("AK-CAT-002 logical component registry missing " + entry.metadata.componentName);
  }
}

// ---- 3. OpenAPI / AsyncAPI structural checks ----

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
    if (!byBaseUri.has(base)) failures.push("AK-SPEC-002 " + label + " reference is absent or digest-mismatched: " + ref);
  }
  return bases;
}

const specRefs = new Map<string, Set<string>>();
const operationIds = new Set<string>();
for (const path of [
  "contracts/agent/openapi/agent-service.openapi.json",
  "contracts/agent/openapi/pagix-agent-integration.openapi.json",
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
    if (/V[0-9]+$/.test(name)) failures.push("AK-SPEC-001 " + path + " component " + name + " carries a release-generation suffix");
  }
  const paths = isObject(api.paths) ? api.paths : {};
  for (const [apiPath, pathItem] of Object.entries(paths)) {
    if (/\/v[0-9]+(\/|$)/.test(apiPath)) failures.push("AK-SPEC-001 " + path + " path " + apiPath + " carries a release-generation segment");
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
      const responses = isObject(operation.responses) ? operation.responses : {};
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
        if (!("409" in responses)) failures.push("AK-SPEC-003 write lacks conflict response: " + operation.operationId);
        if (parameterRefs.has("#/components/parameters/IfMatch")) {
          for (const code of ["412", "428"]) {
            if (!(code in responses)) failures.push("AK-SPEC-003 If-Match write lacks " + code + " response: " + operation.operationId);
          }
        }
        if (!operation.requestBody && !isObject(operation["x-anvilkit-bodyless"])) {
          failures.push("AK-SPEC-003 bodyless write lacks canonical empty-object declaration: " + operation.operationId);
        }
      }
      for (const code of ["401", "403", "404"]) {
        if (!(code in responses)) failures.push("AK-SPEC-003 operation lacks " + code + " response: " + operation.operationId);
      }
    }
  }
}

for (const path of [
  "contracts/agent/asyncapi/agent-events.asyncapi.json",
  "contracts/agent/asyncapi/pagix-domain-events.asyncapi.json",
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
    if (typeof channel.address === "string" && /\.v[0-9]+$/.test(channel.address)) {
      failures.push("AK-SPEC-001 " + path + " channel address " + channel.address + " carries a release-generation suffix");
    }
  }
  if (!hasDlq) failures.push("AK-SPEC-003 " + path + " lacks a DLQ channel");
  if (!isObject(api["x-anvilkit-ordering"])) failures.push("AK-SPEC-003 " + path + " lacks ordering/duplicate/size semantics");
  const operations = isObject(api.operations) ? api.operations : {};
  for (const [name, operation] of Object.entries(operations)) {
    if (!isObject(operation) || !["send", "receive"].includes(String(operation.action))) {
      failures.push("AK-SPEC-001 " + path + " operation " + name + " lacks send/receive action");
    }
  }
  // ADR-020: the public event channel carries only AgentEvent
  if (path.endsWith("agent-events.asyncapi.json")) {
    const publicChannel = channels.publicEvents;
    if (!isObject(publicChannel) || !isObject(publicChannel.messages) || JSON.stringify(Object.keys(publicChannel.messages)) !== JSON.stringify(["AgentEvent"])) {
      failures.push("AK-SPEC-002 " + path + " publicEvents must carry only AgentEvent (ADR-020)");
    }
  }
}

for (const entry of bySlug.values()) {
  for (const description of entry.metadata.descriptions) {
    const refs = specRefs.get(description);
    if (!refs || !refs.has(entry.uri)) failures.push("AK-CAT-002 " + entry.metadata.logicalId + " missing from " + description);
  }
}

// ---- 4. Fixture corpus and deterministic manifest ----

const adapter = new NativeTypeScriptValidator(REPO_ROOT);

const PROFILE_CASES: Record<string, { instancePath: string; schemaPath: string }> = {
  "invalid-agent-event.both-payload-and-artifact": { instancePath: "/", schemaPath: "/profile/eventPayloadExclusivity" },
  "invalid-apply-authorization.cross-workspace": { instancePath: "/target/workspaceId", schemaPath: "/profile/workspaceIsolation" },
  "adversarial-worker-result.stale-fence": { instancePath: "/leaseEpoch", schemaPath: "/profile/workerFence" },
  "adversarial-agent-event.duplicate-reordered": { instancePath: "/eventId", schemaPath: "/profile/byteStableEvent" },
};

// Cross-shape separation cases are validated against the OTHER contract's schema.
const CROSS_SCHEMA: Record<string, string> = {
  "invalid-agent-event.evidence-shape": "agent-event",
  "invalid-agent-evidence.event-shape": "agent-evidence",
};

const EXPECTED_LANGUAGES = ["tooling", "go", "typescript"];

type ManifestCase = {
  id: string;
  path: string;
  bytesSha256: string;
  bytesLength: number;
  schema: { logicalId: string; path: string; logicalUri: string; digest: string };
  category: string;
  tags: string[];
  expected: {
    parse: "accepted" | "rejected";
    valid: boolean;
    findings: Array<{ code: string; instancePath: string; schemaPath: string }>;
    canonicalization: string;
    signature: string;
  };
  applicableLanguages: string[];
  synthetic: boolean;
};

function schemaForFixture(fileName: string, caseId: string): SourceEntry | undefined {
  if (caseId in CROSS_SCHEMA) return bySlug.get(CROSS_SCHEMA[caseId]);
  const slugCandidates = [...bySlug.keys()].sort((a, b) => b.length - a.length);
  for (const slug of slugCandidates) {
    if (fileName === slug + ".json" || fileName.startsWith(slug + ".")) return bySlug.get(slug);
  }
  return undefined;
}

function buildManifest(): { manifest: JsonObject; text: string } {
  const cases: ManifestCase[] = [];
  for (const category of ["valid", "invalid", "adversarial"]) {
    const directory = join(FIXTURE_DIR, category);
    for (const name of readdirSync(directory).sort(compareUtf8)) {
      if (!name.endsWith(".json")) continue;
      const path = join(directory, name);
      const bytes = readFileSync(path);
      const caseId = category + "-" + name.replace(/\.json$/, "");
      const suffix = name.replace(/\.json$/, "").split(".").at(-1) ?? "";
      const fixtureCategory = category !== "valid"
        ? category
        : (suffix === "minimum" || suffix === "maximum-bound" ? suffix : "full");
      let entry: ManifestCase;
      if (name === "registry-values.full.json") {
        entry = {
          id: caseId,
          path: relative(REPO_ROOT, path),
          bytesSha256: "sha256:" + digest(bytes),
          bytesLength: bytes.length,
          schema: {
            logicalId: "RegistrySetValues",
            path: relative(REPO_ROOT, registryPath),
            logicalUri: "anvilkit://registry/registry-set?digest=sha256:" + digest(registryBytes),
            digest: "sha256:" + digest(registryBytes),
          },
          category: fixtureCategory,
          tags: ["every-registry-value"],
          expected: { parse: "accepted", valid: true, findings: [], canonicalization: "jcs", signature: "not-applicable" },
          applicableLanguages: EXPECTED_LANGUAGES,
          synthetic: true,
        };
      } else {
        const source = schemaForFixture(name, caseId);
        if (!source) {
          failures.push("AK-FIX-001 fixture has no canonical schema: " + relative(REPO_ROOT, path));
          continue;
        }
        let findings = adapter.validate(source.uri, bytes).map((finding) => ({ ...finding }));
        const profileCase = PROFILE_CASES[caseId];
        if (profileCase) {
          if (findings.length > 0) failures.push("AK-FIX-002 profile case must be schema-valid: " + caseId);
          findings = [{ code: "AK-INV-001", ...profileCase }];
        }
        const valid = findings.length === 0;
        if (category === "valid" && !valid) {
          failures.push("AK-FIX-002 valid fixture fails canonical schema: " + caseId + " " + JSON.stringify(findings[0]));
        }
        if (category !== "valid" && valid) {
          failures.push("AK-FIX-002 " + category + " fixture passes canonical schema: " + caseId);
        }
        entry = {
          id: caseId,
          path: relative(REPO_ROOT, path),
          bytesSha256: "sha256:" + digest(bytes),
          bytesLength: bytes.length,
          schema: { logicalId: source.metadata.logicalId, path: source.path, logicalUri: source.uri, digest: "sha256:" + digest(source.bytes) },
          category: fixtureCategory,
          tags: [fixtureCategory],
          expected: { parse: "accepted", valid, findings, canonicalization: "jcs", signature: "not-applicable" },
          applicableLanguages: EXPECTED_LANGUAGES,
          synthetic: true,
        };
        if (bytes.length > source.metadata.maximumSerializedBytes) {
          failures.push("AK-FIX-002 fixture exceeds contract byte bound " + caseId);
        }
        if (/-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}/.test(bytes.toString("utf8"))) {
          failures.push("AK-FIX-001 fixture resembles a credential " + caseId);
        }
      }
      cases.push(entry);
    }
  }
  cases.sort((left, right) => compareUtf8(left.id, right.id));
  const relationships = [
    { id: "idempotency-replay", rule: "same-operation-key-and-digest-replays-recorded-outcome", fixtures: ["valid-agent-run.minimum", "valid-agent-run.minimum"], expected: "replay" },
    { id: "idempotency-conflict", rule: "same-operation-key-with-different-bytes-conflicts", fixtures: ["valid-agent-run.minimum", "valid-agent-run.full"], expected: "conflict" },
    { id: "event-byte-stability", rule: "duplicate-event-id-requires-byte-identical-content", fixtures: ["valid-agent-event.minimum", "adversarial-agent-event.duplicate-reordered"], expected: "reject" },
    { id: "event-sequence-gap", rule: "unexplained-public-sequence-gap-requires-resnapshot", fixtures: ["valid-agent-event.minimum", "valid-agent-event.sequence-gap"], expected: "resnapshot" },
    { id: "event-evidence-separation", rule: "public-event-and-internal-evidence-cannot-deserialize-as-each-other", fixtures: ["invalid-agent-event.evidence-shape", "invalid-agent-evidence.event-shape"], expected: "reject" },
    { id: "delta-not-durable", rule: "provisional-stream-delta-carries-no-public-sequence-and-cannot-advance-the-durable-cursor", fixtures: ["invalid-agent-stream-delta.with-public-sequence", "invalid-agent-stream-delta.not-provisional"], expected: "reject" },
    { id: "command-server-fields", rule: "intent-only-commands-reject-caller-owned-server-fields", fixtures: ["invalid-create-agent-run-request.caller-owned-run-id", "invalid-create-agent-run-request.caller-owned-status", "invalid-create-agent-run-request.caller-owned-workspace", "invalid-issue-apply-authorization-request.caller-owned-issuer", "invalid-issue-apply-authorization-request.caller-owned-expiry", "invalid-decide-artifact-custody-request.caller-owned-custodian", "invalid-decide-artifact-custody-request.caller-owned-workspace"], expected: "reject" },
    { id: "worker-current-fence", rule: "only-the-current-fence-may-commit-a-state-changing-result", fixtures: ["valid-worker-result.minimum", "valid-worker-lease.minimum"], expected: "accept" },
    { id: "worker-stale-fence", rule: "stale-lease-epoch-results-cannot-commit-state", fixtures: ["adversarial-worker-result.stale-fence"], expected: "reject" },
    { id: "all-attempt-usage", rule: "every-physical-attempt-records-additive-usage", fixtures: ["valid-usage-observation.minimum", "valid-usage-observation.losing-attempt"], expected: "accept" },
    { id: "authorization-workspace-binding", rule: "authorization-workspace-must-match-target-workspace", fixtures: ["invalid-apply-authorization.cross-workspace"], expected: "reject" },
    { id: "authorization-single-use", rule: "issuer-and-authorization-id-redeem-exactly-once", fixtures: ["valid-apply-authorization.minimum"], expected: "single-use" },
    { id: "parent-child-run", rule: "child-runs-bind-root-and-parent-identity", fixtures: ["valid-agent-run.full"], expected: "accept" },
    { id: "artifact-lifecycle", rule: "artifact-lifecycle-transitions-are-guarded", fixtures: ["valid-agent-artifact.full"], expected: "accept" },
  ];
  const knownIds = new Set(cases.map((item) => item.id));
  for (const relationship of relationships) {
    for (const fixture of relationship.fixtures) {
      if (!knownIds.has(fixture)) failures.push("AK-INV-001 relationship " + relationship.id + " names unknown fixture " + fixture);
    }
  }
  const manifest: JsonObject = {
    manifestVersion: 1,
    status: "canonical",
    description: "Byte-exact canonical Agent fixture corpus. Regenerate with check-agent-contracts.ts --update-manifest.",
    cases: cases as unknown as Json,
    relationships: relationships as unknown as Json,
  };
  return { manifest, text: JSON.stringify(manifest, null, 2) + "\n" };
}

const { text: manifestText } = buildManifest();
const manifestPath = join(FIXTURE_DIR, "manifest.json");
if (UPDATE_MANIFEST) {
  writeFileSync(manifestPath, manifestText);
  console.log("wrote " + relative(REPO_ROOT, manifestPath));
} else if (!existsSync(manifestPath)) {
  failures.push("AK-FIX-001 fixture manifest missing: run --update-manifest");
} else if (readFileSync(manifestPath, "utf8") !== manifestText) {
  failures.push("AK-FIX-001 fixture manifest differs from deterministic regeneration");
}

// every fixture file is in the manifest by construction; assert no stray files
if (existsSync(manifestPath)) {
  const fixtureFiles: string[] = [];
  for (const category of ["valid", "invalid", "adversarial"]) walkJson(join(FIXTURE_DIR, category), fixtureFiles);
  const manifest = readJson<{ cases: ManifestCase[] }>(manifestPath);
  const manifestPaths = new Set(manifest.cases.map((item) => item.path));
  for (const path of fixtureFiles) {
    if (!manifestPaths.has(path)) failures.push("AK-FIX-001 fixture missing from manifest " + path);
  }
}

// registry projection fixture must mirror the governed registry set exactly
{
  const projection = readJson<{ registrySetVersion: number; registries: Record<string, string[]> }>(
    join(FIXTURE_DIR, "valid", "registry-values.full.json"),
  );
  const expected = Object.fromEntries(registrySet.registries.map((registry) => [registry.registryId, registry.entries.map((entry) => entry.wireValue)]));
  if (projection.registrySetVersion !== registrySet.registrySetVersion || JSON.stringify(projection.registries) !== JSON.stringify(expected)) {
    failures.push("AK-FIX-002 registry-value fixture does not cover the exact governed set");
  }
}

// ---- 5. Cross-contract invariants (ADR-018/020/021) ----

function rootEnum(logicalId: string, property: string): unknown {
  const schema = byLogicalId.get(logicalId)?.schema;
  if (!isObject(schema?.properties) || !isObject(schema.properties[property])) return undefined;
  return (schema.properties[property] as JsonObject).enum;
}

if (JSON.stringify(rootEnum("AgentEvent", "eventType")) !== JSON.stringify(PUBLIC_EVENT_TYPES)) {
  failures.push("AK-INV-001 AgentEvent eventType enum must be exactly the six public lifecycle projections");
}
if (JSON.stringify(registryValues("event-type")) !== JSON.stringify(PUBLIC_EVENT_TYPES)) {
  failures.push("AK-INV-001 event-type registry must contain exactly the six public lifecycle projections");
}
const expectedRunStates = [
  "created", "preparing", "planning", "awaiting_input", "executing", "validating",
  "awaiting_review", "awaiting_approval", "committing", "awaiting_domain_confirmation",
  "conflict", "cancelling", "failed", "completed", "cancelled", "refused", "discarded",
];
if (JSON.stringify(registryValues("run-status")) !== JSON.stringify(expectedRunStates) ||
    JSON.stringify(rootEnum("AgentRun", "status")) !== JSON.stringify(expectedRunStates)) {
  failures.push("AK-INV-001 run-state registry and AgentRun must match the authoritative state set");
}
const requiredFence = ["taskId", "recoveryEpoch", "executionGeneration", "physicalAttemptId", "leaseEpoch"];
for (const logicalId of ["WorkerLease", "WorkerResult"]) {
  const required = new Set((byLogicalId.get(logicalId)?.schema.required as string[] | undefined) ?? []);
  for (const field of requiredFence) if (!required.has(field)) failures.push("AK-INV-001 " + logicalId + " lacks distinct fence field " + field);
}
const usageRequired = new Set((byLogicalId.get("UsageObservation")?.schema.required as string[] | undefined) ?? []);
for (const field of ["rootRunId", "runId", "taskId", "recoveryEpoch", "executionGeneration", "physicalAttemptId", "meter", "meterSequence"]) {
  if (!usageRequired.has(field)) failures.push("AK-INV-001 UsageObservation lacks all-attempt identity " + field);
}
const authRequired = new Set((byLogicalId.get("ApplyAuthorization")?.schema.required as string[] | undefined) ?? []);
for (const field of ["authorizationId", "issuer", "audience", "runId", "actionDigest", "artifactDigest", "workspaceId", "contractBomDigest", "policyDigest", "definitionDigest"]) {
  if (!authRequired.has(field)) failures.push("AK-INV-001 ApplyAuthorization lacks binding " + field);
}
const expectedLifecycle = ["pending", "scanning", "valid", "finalized", "committed", "quarantined", "expired", "deleted"];
if (JSON.stringify(registryValues("artifact-lifecycle")) !== JSON.stringify(expectedLifecycle)) failures.push("AK-INV-001 artifact lifecycle registry differs");

// ADR-018: TargetReference requires projectId; run/definition bindings exist
{
  const shared = bySlug.get("shared-primitives")?.schema;
  const defs = isObject(shared?.$defs) ? shared.$defs as JsonObject : {};
  const target = isObject(defs.TargetReference) ? defs.TargetReference as JsonObject : undefined;
  const targetRequired = new Set((target?.required as string[] | undefined) ?? []);
  for (const field of ["targetType", "targetId", "workspaceId", "projectId"]) {
    if (!targetRequired.has(field)) failures.push("AK-INV-001 TargetReference lacks required " + field);
  }
  if ("TenantId" in defs) failures.push("AK-INV-001 shared primitives retain TenantId");
  const runRequired = new Set((byLogicalId.get("AgentRun")?.schema.required as string[] | undefined) ?? []);
  for (const field of ["definition", "resourceRevision", "workspaceId"]) {
    if (!runRequired.has(field)) failures.push("AK-INV-001 AgentRun lacks required " + field);
  }
  const definitionRequired = new Set((byLogicalId.get("AgentDefinition")?.schema.required as string[] | undefined) ?? []);
  for (const field of ["role", "owner", "inputSchema", "outputSchema", "allowedDelegates", "maximumDelegationDepth", "maximumFanOut", "repairPolicy", "definitionId", "definitionDigest"]) {
    if (!definitionRequired.has(field)) failures.push("AK-INV-001 AgentDefinition lacks required " + field);
  }
}

// ADR-020: Event/Evidence/Delta separation
{
  const evidence = byLogicalId.get("AgentEvidence");
  const delta = byLogicalId.get("AgentStreamDelta");
  const event = byLogicalId.get("AgentEvent");
  if (!evidence || !delta || !event) {
    failures.push("AK-INV-001 AgentEvent, AgentEvidence, and AgentStreamDelta must all exist");
  } else {
    const evidenceProperties = isObject(evidence.schema.properties) ? evidence.schema.properties as JsonObject : {};
    const pattern = isObject(evidenceProperties.evidenceType) ? String((evidenceProperties.evidenceType as JsonObject).pattern ?? "") : "";
    for (const eventType of PUBLIC_EVENT_TYPES) {
      if (pattern && new RegExp(pattern).test(eventType)) {
        failures.push("AK-INV-001 AgentEvidence evidenceType pattern must reject public event type " + eventType);
      }
    }
    const deltaProperties = isObject(delta.schema.properties) ? delta.schema.properties as JsonObject : {};
    if ("sequence" in deltaProperties) failures.push("AK-INV-001 AgentStreamDelta must not carry a public sequence");
    if (!isObject(deltaProperties.provisional) || (deltaProperties.provisional as JsonObject).const !== true) {
      failures.push("AK-INV-001 AgentStreamDelta must declare provisional const true");
    }
    const eventFixture = readFileSync(join(FIXTURE_DIR, "valid", "agent-event.minimum.json"));
    const evidenceFixture = readFileSync(join(FIXTURE_DIR, "valid", "agent-evidence.minimum.json"));
    if (adapter.validate(evidence.uri, eventFixture).length === 0) failures.push("AK-INV-001 AgentEvidence accepts an AgentEvent document");
    if (adapter.validate(event.uri, evidenceFixture).length === 0) failures.push("AK-INV-001 AgentEvent accepts an AgentEvidence document");
    if (adapter.validate(event.uri, eventFixture).length !== 0) failures.push("AK-INV-001 AgentEvent rejects its own canonical fixture");
    if (adapter.validate(evidence.uri, evidenceFixture).length !== 0) failures.push("AK-INV-001 AgentEvidence rejects its own canonical fixture");
  }
}

// ADR-021: command schemas structurally exclude server-owned fields
{
  const serverOwned: Record<string, string[]> = {
    CreateAgentRunRequest: ["runId", "workspaceId", "actorId", "status", "resourceRevision", "createdAt", "updatedAt", "contractBomReference", "policy", "idempotency"],
    IssueApplyAuthorizationRequest: ["authorizationId", "issuer", "audience", "keyId", "issuedAt", "notBefore", "expiresAt", "policyDigest", "contractBomDigest", "definitionDigest"],
  };
  for (const [logicalId, fields] of Object.entries(serverOwned)) {
    const schema = byLogicalId.get(logicalId)?.schema;
    const properties = isObject(schema?.properties) ? schema.properties as JsonObject : {};
    if (schema?.additionalProperties !== false) failures.push("AK-INV-001 " + logicalId + " must be a closed command envelope");
    for (const field of fields) {
      if (field in properties) failures.push("AK-INV-001 " + logicalId + " must not accept server-owned field " + field);
    }
  }
}

// ---- 6. Canonical identity and strict-admission corpora ----

{
  const corpusPath = join(FIXTURE_DIR, "canonical", "identity-cases.json");
  const corpus = readJson<{
    corpusVersion: number;
    jcsCases: Array<{ id: string; value: JsonValue; expectedCanonical?: string; expectedCode?: string }>;
    componentCases: Array<{ id: string; value: JsonValue; purpose: string; mediaType: string; expectedDigest?: string; expectedCode?: string }>;
    bomCases: Array<{ id: string; value?: JsonValue; copyOf?: string; declaredDigest?: string; expectedDigest?: string; expectedVerification?: boolean; expectedCode?: string; expectedCanonicalWithoutDigest?: string }>;
  }>(corpusPath);
  const purposes = new Set(registryValues("identity-purpose"));
  for (const testCase of corpus.jcsCases) {
    try {
      const canonical = Buffer.from(canonicalizeJcs(testCase.value)).toString("utf8");
      if (testCase.expectedCode) failures.push("AK-INV-001 identity case expected rejection: " + testCase.id);
      else if (canonical !== testCase.expectedCanonical) failures.push("AK-INV-001 canonical bytes differ: " + testCase.id);
    } catch (error) {
      const code = error instanceof IdentityProfileError ? error.code : String(error);
      if (code !== testCase.expectedCode) failures.push("AK-INV-001 identity case code differs: " + testCase.id + " " + code);
    }
  }
  for (const testCase of corpus.componentCases) {
    try {
      const actual = nativeComponentIdentity(testCase.value, testCase.purpose, testCase.mediaType, purposes);
      if (testCase.expectedCode || actual.digest !== testCase.expectedDigest) failures.push("AK-INV-001 component identity differs: " + testCase.id);
    } catch (error) {
      const code = error instanceof NativeIdentityError ? error.code : String(error);
      if (code !== testCase.expectedCode) failures.push("AK-INV-001 component identity code differs: " + testCase.id + " " + code);
    }
  }
  const rawBomCases = new Map(corpus.bomCases.map((item) => [item.id, item]));
  const resolveBom = (testCase: (typeof corpus.bomCases)[number]): JsonValue => {
    if (testCase.value !== undefined) return structuredClone(testCase.value);
    const source = testCase.copyOf ? rawBomCases.get(testCase.copyOf) : undefined;
    if (!source) throw new Error(testCase.id + ": invalid copyOf");
    const value = resolveBom(source);
    if (value !== null && typeof value === "object" && !Array.isArray(value) && testCase.declaredDigest !== undefined) {
      (value as Record<string, JsonValue>).digest = testCase.declaredDigest;
    }
    return value;
  };
  for (const testCase of corpus.bomCases) {
    try {
      const actual = nativeContractBomIdentity(resolveBom(testCase));
      if (testCase.expectedCode || actual.digest !== testCase.expectedDigest || actual.verified !== testCase.expectedVerification) {
        failures.push("AK-INV-001 BOM identity differs: " + testCase.id);
      }
    } catch (error) {
      const code = error instanceof NativeIdentityError ? error.code : String(error);
      if (code !== testCase.expectedCode) failures.push("AK-INV-001 BOM identity code differs: " + testCase.id + " " + code);
    }
  }
}

{
  type AdmissionCase = {
    id: string;
    input: { encoding: string; data: string };
    limits?: Record<string, number>;
    clockTicksMilliseconds?: number[];
    validator?: "closed-root-a";
    expected: { outcome: string; code?: string; reason?: string; instancePath?: string; schemaPath?: string; rootKeys?: string[] };
  };
  const corpusPath = join(FIXTURE_DIR, "canonical", "strict-admission-cases.json");
  const corpus = readJson<{ corpusVersion: number; profile: string; cases: AdmissionCase[] }>(corpusPath);
  if (corpus.corpusVersion !== 1 || corpus.profile !== "AnvilKitStrictJsonAdmissionV1") {
    failures.push("AK-INV-001 strict-admission corpus profile is not canonical");
  }
  const closedRootA = (value: JsonValue): ValidationFinding[] => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return [{ code: "VALIDATION_FAILED", instancePath: "/", schemaPath: "/type" }];
    }
    return Object.keys(value)
      .filter((key) => key !== "a")
      .sort(compareUtf8)
      .map((key) => ({
        code: "VALIDATION_FAILED",
        instancePath: "/" + key.replaceAll("~", "~0").replaceAll("/", "~1"),
        schemaPath: "/additionalProperties",
      }));
  };
  for (const testCase of corpus.cases) {
    const bytes = testCase.input.encoding === "utf8"
      ? Buffer.from(testCase.input.data, "utf8")
      : Buffer.from(testCase.input.data, "hex");
    let tick = 0;
    const clock = testCase.clockTicksMilliseconds
      ? () => testCase.clockTicksMilliseconds![Math.min(tick++, testCase.clockTicksMilliseconds!.length - 1)]
      : undefined;
    const validate = testCase.validator === "closed-root-a" ? closedRootA : undefined;
    try {
      const admitted = admitStrictJson(bytes, { limits: testCase.limits, now: clock, validate });
      if (testCase.expected.outcome !== "accepted") failures.push("AK-INV-001 strict admission differs: " + testCase.id);
      else if (testCase.expected.rootKeys) {
        const rootKeys = admitted.value !== null && typeof admitted.value === "object" && !Array.isArray(admitted.value)
          ? Object.keys(admitted.value).sort(compareUtf8)
          : [];
        if (JSON.stringify(rootKeys) !== JSON.stringify(testCase.expected.rootKeys)) {
          failures.push("AK-INV-001 strict admission root keys differ: " + testCase.id);
        }
      }
    } catch (error) {
      if (testCase.expected.outcome !== "rejected" || !(error instanceof StrictJsonError)) {
        failures.push("AK-INV-001 strict admission differs: " + testCase.id);
        continue;
      }
      for (const [expected, actual] of [
        [testCase.expected.code, error.code],
        [testCase.expected.reason, error.reason],
        [testCase.expected.instancePath, error.instancePath],
        [testCase.expected.schemaPath, error.schemaPath],
      ] as const) {
        if (expected !== undefined && expected !== actual) failures.push("AK-INV-001 strict admission detail differs: " + testCase.id);
      }
    }
  }
}

// ---- 7. Source-lint self-test corpus ----

{
  type LintMutation = { op: "set" | "delete"; path: string; value?: Json };
  type LintCase = { id: string; mutations: LintMutation[]; expectedCodes: string[] };
  const corpusPath = join(SCHEMA_DIR, "meta", "source-lint-cases.json");
  const corpus = readJson<{ caseVersion: number; base: JsonObject; cases: LintCase[] }>(corpusPath);
  const applyPointer = (root: JsonObject, mutation: LintMutation): void => {
    const parts = mutation.path.slice(1).split("/").map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
    let node: JsonObject = root;
    for (const part of parts.slice(0, -1)) {
      if (!isObject(node[part])) node[part] = {};
      node = node[part] as JsonObject;
    }
    const leaf = parts.at(-1)!;
    if (mutation.op === "delete") delete node[leaf];
    else node[leaf] = mutation.value as Json;
  };
  for (const testCase of corpus.cases) {
    const candidate = structuredClone(corpus.base);
    for (const mutation of testCase.mutations) applyPointer(candidate, mutation);
    const codes = [...new Set(lintSchema(candidate).map((finding) => finding.code))].sort(compareUtf8);
    const expected = [...testCase.expectedCodes].sort(compareUtf8);
    if (JSON.stringify(codes) !== JSON.stringify(expected)) {
      failures.push("AK-SRC-003 lint self-test differs: " + testCase.id + " expected [" + expected.join(",") + "] got [" + codes.join(",") + "]");
    }
  }
}

// ---- 8. Signing corpus (synthetic ADR-016 vectors) ----

try {
  generateSignatureResult(REPO_ROOT);
} catch (error) {
  failures.push("AK-INV-001 signing corpus failed: " + String(error));
}

if (failures.length > 0) {
  console.error("canonical Agent contract check FAILED:");
  [...new Set(failures)].sort(compareUtf8).forEach((failure) => console.error("  " + failure));
  process.exit(1);
}

console.log(
  "canonical Agent contracts valid: " + schemaPaths.length + " schemas, " +
  registrySet.registries.length + " registries, 2 OpenAPI documents, 2 AsyncAPI documents, " +
  "deterministic fixture manifest, six-event vocabulary, Event/Evidence/Delta separation, identity and signing corpora",
);
