import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";

export const CONFORMANCE_LANGUAGES = ["go", "typescript"] as const;
export type ConformanceLanguage = typeof CONFORMANCE_LANGUAGES[number];

export type Finding = {
  code: string;
  instancePath: string;
  schemaPath: string;
};

export type ConformanceCase = {
  caseId: string;
  inputDigest: string;
  inputBytes: number;
  parseOutcome: "accepted" | "rejected";
  valid: boolean | null;
  findings: Finding[];
  canonicalization:
    | { status: "produced"; bytesBase64: string; digest: string }
    | { status: "rejected"; code: string }
    | { status: "not-applicable" };
  componentDigest: string | null;
  rootBomDigest: string | null;
  signature:
    | { status: "verified" }
    | { status: "rejected"; code: string }
    | { status: "not-applicable" };
};

export type ConformanceResult = {
  resultVersion: 1;
  fixtureManifestDigest: string;
  language: ConformanceLanguage;
  implementation: {
    adapterId: string;
    adapterVersion: string;
    runtime: string;
    runtimeVersion: string;
    adapterDigest: string;
    packageDigest?: string;
    sourceDigest?: string;
    generatorDigest?: string;
    contractBomDigest?: string;
    projectionDigest?: string;
  };
  cases: ConformanceCase[];
};

export type ConformanceSummary = {
  fixtureManifestDigest: string;
  languages: ConformanceLanguage[];
  caseCount: number;
  divergenceCount: 0;
};

function compareText(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? [])
    .map((error) => `${error.instancePath || "/"}: ${error.message ?? error.keyword}`)
    .sort(compareText)
    .join("; ");
}

let schemaValidator: ValidateFunction | undefined;

function validator(): ValidateFunction {
  if (schemaValidator) return schemaValidator;
  const schemaPath = join(import.meta.dir, "conformance-result.schema.json");
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  schemaValidator = new Ajv2020({ allErrors: true, strict: true, strictRequired: false }).compile(schema);
  return schemaValidator;
}

export function assertConformanceResult(value: unknown): asserts value is ConformanceResult {
  const validate = validator();
  if (!validate(value)) throw new Error(`invalid conformance result: ${formatErrors(validate.errors)}`);
  const result = value as ConformanceResult;
  const caseIds = result.cases.map((item) => item.caseId);
  if (new Set(caseIds).size !== caseIds.length) throw new Error(`${result.language}: duplicate case ID`);
  const sortedCaseIds = [...caseIds].sort(compareText);
  if (JSON.stringify(caseIds) !== JSON.stringify(sortedCaseIds)) {
    throw new Error(`${result.language}: cases are not in UTF-8 case-ID order`);
  }
  for (const item of result.cases) {
    const findings = item.findings.map((finding) => `${finding.code}\0${finding.instancePath}\0${finding.schemaPath}`);
    if (JSON.stringify(findings) !== JSON.stringify([...findings].sort(compareText))) {
      throw new Error(`${result.language}/${item.caseId}: findings are not in deterministic order`);
    }
    if (item.parseOutcome === "rejected" && item.valid !== null) {
      throw new Error(`${result.language}/${item.caseId}: rejected parse must have null validity`);
    }
  }
}

function comparableCase(item: ConformanceCase): string {
  return JSON.stringify(item);
}

export function compareConformanceResults(values: unknown[]): ConformanceSummary {
  if (values.length !== CONFORMANCE_LANGUAGES.length) {
    throw new Error(`expected ${CONFORMANCE_LANGUAGES.length} language results, got ${values.length}`);
  }
  values.forEach(assertConformanceResult);
  const results = values as ConformanceResult[];
  const byLanguage = new Map(results.map((result) => [result.language, result]));
  if (byLanguage.size !== CONFORMANCE_LANGUAGES.length) throw new Error("duplicate conformance language result");
  for (const language of CONFORMANCE_LANGUAGES) {
    if (!byLanguage.has(language)) throw new Error(`missing ${language} conformance result`);
  }

  const first = byLanguage.get(CONFORMANCE_LANGUAGES[0])!;
  for (const language of CONFORMANCE_LANGUAGES.slice(1)) {
    const candidate = byLanguage.get(language)!;
    if (candidate.fixtureManifestDigest !== first.fixtureManifestDigest) {
      throw new Error(`${language}: fixture manifest digest diverges from ${first.language}`);
    }
    if (candidate.cases.length !== first.cases.length) {
      throw new Error(`${language}: case count diverges from ${first.language}`);
    }
    for (let index = 0; index < first.cases.length; index += 1) {
      const expected = first.cases[index];
      const actual = candidate.cases[index];
      if (actual.caseId !== expected.caseId) {
        throw new Error(`${language}: expected case ${expected.caseId} at index ${index}, got ${actual.caseId}`);
      }
      if (comparableCase(actual) !== comparableCase(expected)) {
        throw new Error(`${language}/${actual.caseId}: semantic conformance result diverges from ${first.language}`);
      }
    }
  }

  return {
    fixtureManifestDigest: first.fixtureManifestDigest,
    languages: [...CONFORMANCE_LANGUAGES],
    caseCount: first.cases.length,
    divergenceCount: 0,
  };
}
