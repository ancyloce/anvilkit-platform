import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import canonicalize from "canonicalize";
import { compareConformanceResults, type ConformanceLanguage, type ConformanceResult } from "./conformance-result.ts";

const digest = (character: string): string => `sha256:${character.repeat(64)}`;

function result(language: ConformanceLanguage): ConformanceResult {
  return {
    resultVersion: 1,
    fixtureManifestDigest: digest("1"),
    language,
    implementation: {
      adapterId: `anvilkit-${language}-adapter`,
      adapterVersion: "0.1.0",
      runtime: language,
      runtimeVersion: "1.0.0",
      adapterDigest: digest("2"),
    },
    cases: [
      {
        caseId: "valid-canonical",
        inputDigest: digest("3"),
        inputBytes: 13,
        parseOutcome: "accepted",
        valid: true,
        findings: [],
        canonicalization: {
          status: "produced",
          bytesBase64: "eyJhIjoxLCJiIjoyfQ==",
          digest: digest("4"),
        },
        componentDigest: null,
        rootBomDigest: null,
        signature: { status: "not-applicable" },
      },
    ],
  };
}

const values = (["go", "typescript", "python", "java"] as const).map(result);
const summary = compareConformanceResults(values);
if (summary.caseCount !== 1 || summary.divergenceCount !== 0) throw new Error("unexpected parity summary");

const divergent = structuredClone(values);
divergent[3].cases[0].canonicalization = { status: "rejected", code: "JCS_REJECTED" };
try {
  compareConformanceResults(divergent);
  throw new Error("divergent canonical result was accepted");
} catch (error) {
  if (!String(error).includes("semantic conformance result diverges")) throw error;
}

const unsorted = structuredClone(values);
unsorted[0].cases[0].findings = [
  { code: "VALIDATION_FAILED", instancePath: "/z", schemaPath: "/z" },
  { code: "PARSE_REJECTED", instancePath: "/", schemaPath: "/profile/strictAdmission" },
];
try {
  compareConformanceResults(unsorted);
  throw new Error("unsorted findings were accepted");
} catch (error) {
  if (!String(error).includes("findings are not in deterministic order")) throw error;
}

const incomplete = structuredClone(values) as unknown[];
const canonicalization = (incomplete[0] as ConformanceResult).cases[0].canonicalization as Record<string, unknown>;
delete canonicalization.digest;
try {
  compareConformanceResults(incomplete);
  throw new Error("incomplete canonical bytes were accepted");
} catch (error) {
  if (!String(error).includes("invalid conformance result")) throw error;
}

console.log("M4 conformance result contract valid: closed schema, deterministic ordering, four required languages, and zero-tolerance case comparison");

type RawNative = {
  parseOutcome: "accepted" | "rejected";
  canonicalSha256: string | null;
  canonicalBytesBase64: string | null;
};
type RawCase = {
  caseId: string;
  coldResult: RawNative;
  repetitions: Array<{ native: RawNative }>;
};
type RawEvidence = { candidateId: string; operation: string; cases: RawCase[] };

function rawSemantic(value: RawNative): string {
  return JSON.stringify({
    parseOutcome: value.parseOutcome,
    canonicalSha256: value.canonicalSha256,
    canonicalBytesBase64: value.canonicalBytesBase64,
  });
}

const evidenceDirectory = join(import.meta.dir, "..", "..", "contracts", "governance", "m0", "dp008", "evidence");
const rawFiles: Record<ConformanceLanguage, string> = {
  go: "go-jcs-canonicalizer.raw.json",
  typescript: "typescript-jcs-canonicalizer.raw.json",
  python: "python-jcs-canonicalizer.raw.json",
  java: "java-jcs-canonicalizer.raw.json",
};
const rawResults = new Map<ConformanceLanguage, RawEvidence>();
for (const language of ["go", "typescript", "python", "java"] as const) {
  const evidence = JSON.parse(readFileSync(join(evidenceDirectory, rawFiles[language]), "utf8")) as RawEvidence;
  if (evidence.candidateId !== `${language}-jcs-canonicalizer` || evidence.operation !== "canonicalize") {
    throw new Error(`${language}: raw JCS evidence identity is inconsistent`);
  }
  if (evidence.cases.length !== 9) throw new Error(`${language}: expected nine representative JCS cases`);
  for (const item of evidence.cases) {
    const expected = rawSemantic(item.coldResult);
    for (const repetition of item.repetitions) {
      if (rawSemantic(repetition.native) !== expected) {
        throw new Error(`${language}/${item.caseId}: canonical result changed between repetitions`);
      }
    }
    if (item.coldResult.parseOutcome === "accepted") {
      const encoded = item.coldResult.canonicalBytesBase64;
      if (!encoded || !item.coldResult.canonicalSha256) throw new Error(`${language}/${item.caseId}: accepted result lacks canonical bytes`);
      const actualDigest = `sha256:${createHash("sha256").update(Buffer.from(encoded, "base64")).digest("hex")}`;
      if (actualDigest !== item.coldResult.canonicalSha256) throw new Error(`${language}/${item.caseId}: canonical byte digest mismatch`);
    } else if (item.coldResult.canonicalBytesBase64 !== null || item.coldResult.canonicalSha256 !== null) {
      throw new Error(`${language}/${item.caseId}: rejected result retained canonical output`);
    }
  }
  rawResults.set(language, evidence);
}

const reference = rawResults.get("go")!;
for (const language of ["typescript", "python", "java"] as const) {
  const candidate = rawResults.get(language)!;
  for (let index = 0; index < reference.cases.length; index += 1) {
    const expected = reference.cases[index];
    const actual = candidate.cases[index];
    if (actual.caseId !== expected.caseId || rawSemantic(actual.coldResult) !== rawSemantic(expected.coldResult)) {
      throw new Error(`${language}/${actual.caseId}: representative JCS bytes diverge from Go`);
    }
  }
}

console.log("M4 representative JCS evidence valid: four languages, nine cases, deterministic repetitions, and byte-identical accepted outputs");

const identityCorpus = JSON.parse(readFileSync(
  join(import.meta.dir, "..", "..", "contracts", "governance", "m3", "identity-cases.json"),
  "utf8",
)) as { jcsCases: Array<{ id: string; value: unknown; expectedCanonical?: string }> };
for (const item of identityCorpus.jcsCases.filter((candidate) => candidate.expectedCanonical !== undefined)) {
  const actual = canonicalize(item.value);
  if (actual !== item.expectedCanonical) throw new Error(`typescript/${item.id}: RFC 8785 vector mismatch`);
}
console.log("M4 TypeScript JCS standard vectors valid: RFC numeric rendering, UTF-16 ordering, nested ordering, and Unicode preservation");
