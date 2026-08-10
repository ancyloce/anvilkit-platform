// PLAN-0003 M3 candidate gate. M3-T01 only; later M3 tasks remain pending.

import { readFileSync } from "node:fs";
import { join } from "node:path";
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

if (accepted === 0 || rejected === 0) failures.push("M3 corpus requires both accepted and rejected cases");
if (failures.length > 0) {
  console.error("M3 strict-admission candidate FAILED:");
  failures.sort(compareUtf8).forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  `M3-T01 strict-admission candidate valid: ${corpus.cases.length} byte cases, ` +
  `${accepted} accepted, ${rejected} rejected, ${coveredReasons.size} stable rejection reasons; ` +
  "DP-008, four-language parity, canonicalization, signatures, trust, and approvals remain pending",
);
