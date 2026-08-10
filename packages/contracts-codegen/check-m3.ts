// PLAN-0003 M3 candidate gate. Covers M3-T01 and unapproved reference
// candidates/vectors for M3-T02 and M3-T03; later M3 tasks remain pending.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalBomBytesWithoutDigest,
  canonicalizeJcs,
  componentIdentity,
  contractBomIdentity,
  IdentityProfileError,
  verifyContractBomIdentity,
} from "./identity.ts";
import {
  admitStrictJson,
  StrictJsonError,
  type AdmissionReason,
  type JsonValue,
  type StrictJsonLimits,
  type ValidationFinding,
} from "./strict-json.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const CORPUS_PATH = join(REPO_ROOT, "contracts", "governance", "m3", "strict-admission-cases.json");
const IDENTITY_CORPUS_PATH = join(REPO_ROOT, "contracts", "governance", "m3", "identity-cases.json");
const REGISTRY_PATH = join(REPO_ROOT, "contracts", "registries", "v1", "registry-set.json");
const failures: string[] = [];

type Expected = {
  outcome: "accepted" | "rejected";
  code?: "PARSE_REJECTED" | "VALIDATION_FAILED";
  reason?: AdmissionReason;
  instancePath?: string;
  schemaPath?: string;
  rootKeys?: string[];
};

type CorpusCase = {
  id: string;
  input: { encoding: "utf8" | "hex"; data: string };
  limits?: Partial<StrictJsonLimits>;
  clockTicksMilliseconds?: number[];
  validator?: "closed-root-a";
  expected: Expected;
};

type Corpus = {
  corpusVersion: number;
  status: string;
  profile: string;
  description: string;
  applicableLanguages: string[];
  cases: CorpusCase[];
};

type JcsCase = {
  id: string;
  value: JsonValue;
  expectedCanonical?: string;
  expectedCode?: string;
};

type ComponentCase = {
  id: string;
  value: JsonValue;
  purpose: string;
  mediaType: string;
  contextBomDigest?: string;
  expectedDigest?: string;
  expectedCode?: string;
};

type BomCase = {
  id: string;
  value?: JsonValue;
  copyOf?: string;
  declaredDigest?: string;
  expectedCanonicalWithoutDigest?: string;
  expectedDigest?: string;
  expectedVerification?: boolean;
  expectedCode?: string;
};

type IdentityCorpus = {
  corpusVersion: number;
  status: string;
  profiles: string[];
  description: string;
  applicableLanguages: string[];
  jcsCases: JcsCase[];
  componentCases: ComponentCase[];
  bomCases: BomCase[];
};

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function closedRootA(value: JsonValue): ValidationFinding[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [{ code: "VALIDATION_FAILED", instancePath: "/", schemaPath: "/type" }];
  }
  return Object.keys(value)
    .filter((key) => key !== "a")
    .sort(compareUtf8)
    .map((key) => ({
      code: "VALIDATION_FAILED",
      instancePath: `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
      schemaPath: "/additionalProperties",
    }));
}

function bytesFor(testCase: CorpusCase): Buffer {
  if (testCase.input.encoding === "utf8") return Buffer.from(testCase.input.data, "utf8");
  if (!/^(?:[0-9a-f]{2})+$/.test(testCase.input.data)) {
    throw new Error("hex input must be non-empty lowercase whole bytes");
  }
  return Buffer.from(testCase.input.data, "hex");
}

const corpus = JSON.parse(readFileSync(CORPUS_PATH, "utf8")) as Corpus;
if (corpus.corpusVersion !== 1) failures.push("unsupported M3 strict-admission corpus version");
if (corpus.status !== "m3-t01-candidate-unapproved") failures.push("M3 corpus must remain explicitly unapproved");
if (corpus.profile !== "AnvilKitStrictJsonAdmissionV1") failures.push("unexpected strict-admission profile");
if (corpus.description.length === 0) failures.push("M3 corpus description is required");
if (JSON.stringify(corpus.applicableLanguages) !== JSON.stringify(["go", "typescript", "python", "java"])) {
  failures.push("M3 corpus must target the four required languages in governed order");
}

const ids = new Set<string>();
const coveredReasons = new Set<AdmissionReason>();
let accepted = 0;
let rejected = 0;

for (const testCase of corpus.cases) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(testCase.id)) failures.push(`${testCase.id}: invalid case ID`);
  if (ids.has(testCase.id)) failures.push(`${testCase.id}: duplicate case ID`);
  ids.add(testCase.id);

  let bytes: Buffer;
  try {
    bytes = bytesFor(testCase);
  } catch (error) {
    failures.push(`${testCase.id}: ${String(error)}`);
    continue;
  }
  if (bytes.length === 0) failures.push(`${testCase.id}: input must contain at least one byte`);

  let tick = 0;
  const clock = testCase.clockTicksMilliseconds
    ? () => testCase.clockTicksMilliseconds![Math.min(tick++, testCase.clockTicksMilliseconds!.length - 1)]
    : undefined;
  const validate = testCase.validator === "closed-root-a" ? closedRootA : undefined;

  try {
    const admitted = admitStrictJson(bytes, { limits: testCase.limits, now: clock, validate });
    accepted += 1;
    if (testCase.expected.outcome !== "accepted") {
      failures.push(`${testCase.id}: expected rejection but admission succeeded`);
    }
    if (!Buffer.from(admitted.bytes).equals(bytes)) {
      failures.push(`${testCase.id}: adapter did not preserve exact admitted bytes`);
    }
    if (testCase.expected.rootKeys) {
      const rootKeys = admitted.value !== null && typeof admitted.value === "object" && !Array.isArray(admitted.value)
        ? Object.keys(admitted.value).sort(compareUtf8)
        : [];
      if (JSON.stringify(rootKeys) !== JSON.stringify(testCase.expected.rootKeys)) {
        failures.push(`${testCase.id}: expected root keys were not preserved as JSON data`);
      }
    }
  } catch (error) {
    rejected += 1;
    if (testCase.expected.outcome !== "rejected") {
      failures.push(`${testCase.id}: expected admission but got ${String(error)}`);
      continue;
    }
    if (!(error instanceof StrictJsonError)) {
      failures.push(`${testCase.id}: rejection is not a stable StrictJsonError: ${String(error)}`);
      continue;
    }
    coveredReasons.add(error.reason);
    for (const [field, expected, actual] of [
      ["code", testCase.expected.code, error.code],
      ["reason", testCase.expected.reason, error.reason],
      ["instancePath", testCase.expected.instancePath, error.instancePath],
      ["schemaPath", testCase.expected.schemaPath, error.schemaPath],
    ] as const) {
      if (expected !== undefined && expected !== actual) {
        failures.push(`${testCase.id}: expected ${field}=${expected}, got ${actual}`);
      }
    }
  }
}

for (const reason of [
  "byte-limit", "depth-limit", "duplicate-key", "invalid-bom", "invalid-json",
  "invalid-unicode", "item-limit", "negative-zero", "number-range", "schema-invalid",
  "time-limit", "unsafe-integer",
] as AdmissionReason[]) {
  if (!coveredReasons.has(reason)) failures.push(`strict-admission corpus lacks ${reason} rejection coverage`);
}

const identityCorpus = JSON.parse(readFileSync(IDENTITY_CORPUS_PATH, "utf8")) as IdentityCorpus;
if (identityCorpus.corpusVersion !== 1) failures.push("unsupported M3 identity corpus version");
if (identityCorpus.status !== "m3-t02-t03-candidate-unapproved") {
  failures.push("M3 identity corpus must remain explicitly unapproved");
}
if (JSON.stringify(identityCorpus.profiles) !== JSON.stringify(["RFC8785", "ComponentIdentityV1", "ContractBomIdentityV1"])) {
  failures.push("M3 identity corpus profiles are incomplete or out of order");
}
if (identityCorpus.description.length === 0) failures.push("M3 identity corpus description is required");
if (JSON.stringify(identityCorpus.applicableLanguages) !== JSON.stringify(["go", "typescript", "python", "java"])) {
  failures.push("M3 identity corpus must target the four required languages in governed order");
}

const registrySet = JSON.parse(readFileSync(REGISTRY_PATH, "utf8")) as {
  registries: Array<{ registryId: string; entries: Array<{ wireValue: string }> }>;
};
const purposeRegistry = registrySet.registries.find((registry) => registry.registryId === "identity-purpose");
if (!purposeRegistry) failures.push("identity-purpose registry is missing");
const allowedPurposes = new Set((purposeRegistry?.entries ?? []).map((entry) => entry.wireValue));

let canonicalCases = 0;
let componentCases = 0;
let bomCases = 0;
const identityIds = new Set<string>();
const recordIdentityId = (id: string): void => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) failures.push(`${id}: invalid identity case ID`);
  if (identityIds.has(id)) failures.push(`${id}: duplicate identity case ID`);
  identityIds.add(id);
};

for (const testCase of identityCorpus.jcsCases) {
  recordIdentityId(testCase.id);
  try {
    const first = Buffer.from(canonicalizeJcs(testCase.value)).toString("utf8");
    const second = Buffer.from(canonicalizeJcs(testCase.value)).toString("utf8");
    if (testCase.expectedCode) failures.push(`${testCase.id}: expected ${testCase.expectedCode} but canonicalization succeeded`);
    if (first !== testCase.expectedCanonical) failures.push(`${testCase.id}: canonical bytes differ from the vector`);
    if (first !== second) failures.push(`${testCase.id}: repeated canonicalization was not deterministic`);
    canonicalCases += 1;
  } catch (error) {
    if (!(error instanceof IdentityProfileError)) {
      failures.push(`${testCase.id}: non-portable canonicalization error: ${String(error)}`);
    } else if (error.code !== testCase.expectedCode) {
      failures.push(`${testCase.id}: expected ${testCase.expectedCode ?? "success"}, got ${error.code}`);
    }
  }
}

const componentDigests = new Map<string, string>();
for (const testCase of identityCorpus.componentCases) {
  recordIdentityId(testCase.id);
  try {
    const first = componentIdentity(testCase.value, testCase.purpose, testCase.mediaType, allowedPurposes);
    const second = componentIdentity(testCase.value, testCase.purpose, testCase.mediaType, allowedPurposes);
    if (testCase.expectedCode) failures.push(`${testCase.id}: expected ${testCase.expectedCode} but identity calculation succeeded`);
    if (first !== testCase.expectedDigest) failures.push(`${testCase.id}: component digest differs from the vector`);
    if (first !== second) failures.push(`${testCase.id}: repeated component identity was not deterministic`);
    componentDigests.set(testCase.id, first);
    componentCases += 1;
  } catch (error) {
    if (!(error instanceof IdentityProfileError)) {
      failures.push(`${testCase.id}: non-portable component identity error: ${String(error)}`);
    } else if (error.code !== testCase.expectedCode) {
      failures.push(`${testCase.id}: expected ${testCase.expectedCode ?? "success"}, got ${error.code}`);
    }
  }
}
if (componentDigests.get("schema-component-in-bom-a") !== componentDigests.get("same-schema-component-in-bom-b")) {
  failures.push("component identity changed with enclosing BOM context or source property order");
}
if (componentDigests.get("schema-component-in-bom-a") === componentDigests.get("cross-purpose-domain-separation")) {
  failures.push("component identity lacks purpose domain separation");
}
if (componentDigests.get("schema-component-in-bom-a") === componentDigests.get("cross-media-type-domain-separation")) {
  failures.push("component identity lacks media-type domain separation");
}

const rawBomCases = new Map(identityCorpus.bomCases.map((testCase) => [testCase.id, testCase]));
const resolvedBomValues = new Map<string, JsonValue>();
const resolveBomValue = (testCase: BomCase): JsonValue => {
  if (testCase.value !== undefined) return structuredClone(testCase.value);
  const source = testCase.copyOf ? rawBomCases.get(testCase.copyOf) : undefined;
  if (!source) throw new Error(`${testCase.id}: copyOf does not identify a BOM case`);
  const value = resolveBomValue(source);
  if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
  if (testCase.declaredDigest !== undefined) value.digest = testCase.declaredDigest;
  return value;
};

for (const testCase of identityCorpus.bomCases) {
  recordIdentityId(testCase.id);
  try {
    const value = resolveBomValue(testCase);
    resolvedBomValues.set(testCase.id, value);
    const canonical = Buffer.from(canonicalBomBytesWithoutDigest(value)).toString("utf8");
    const digest = contractBomIdentity(value);
    const verified = verifyContractBomIdentity(value);
    if (testCase.expectedCode) failures.push(`${testCase.id}: expected ${testCase.expectedCode} but BOM identity succeeded`);
    if (testCase.expectedCanonicalWithoutDigest !== undefined && canonical !== testCase.expectedCanonicalWithoutDigest) {
      failures.push(`${testCase.id}: canonical BOM bytes differ from the vector`);
    }
    if (digest !== testCase.expectedDigest) failures.push(`${testCase.id}: root BOM digest differs from the vector`);
    if (verified !== testCase.expectedVerification) failures.push(`${testCase.id}: declared BOM digest verification differs from the vector`);
    if (digest !== contractBomIdentity(value)) failures.push(`${testCase.id}: repeated root BOM identity was not deterministic`);
    bomCases += 1;
  } catch (error) {
    if (!(error instanceof IdentityProfileError)) {
      failures.push(`${testCase.id}: non-portable BOM identity error: ${String(error)}`);
    } else if (error.code !== testCase.expectedCode) {
      failures.push(`${testCase.id}: expected ${testCase.expectedCode ?? "success"}, got ${error.code}`);
    }
  }
}
const canonicalRoot = resolvedBomValues.get("root-digest-omits-exactly-digest");
const mismatchedRoot = resolvedBomValues.get("declared-digest-mismatch");
if (!canonicalRoot || !mismatchedRoot) {
  failures.push("root BOM digest omission comparison vectors are incomplete");
} else if (contractBomIdentity(canonicalRoot) !== contractBomIdentity(mismatchedRoot)) {
  failures.push("root BOM identity includes its declared digest field");
}

if (accepted === 0 || rejected === 0) failures.push("M3 corpus requires both accepted and rejected cases");
if (failures.length > 0) {
  console.error("M3 admission/identity candidate FAILED:");
  failures.sort(compareUtf8).forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  `M3-T01..T03 candidate valid: ${corpus.cases.length} strict byte cases ` +
  `(${accepted} accepted, ${rejected} rejected, ${coveredReasons.size} rejection reasons), ` +
  `${canonicalCases} canonical vectors, ${componentCases} component identities, and ${bomCases} root BOM identities; ` +
  "repository security profiles are checked separately; four-language JCS and component/root identity parity are tracked by M4, while native crypto parity remains pending",
);
