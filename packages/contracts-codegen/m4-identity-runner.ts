import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ConformanceCase, ConformanceResult } from "./conformance-result.ts";
import {
  NativeIdentityError,
  nativeCanonicalize,
  nativeComponentIdentity,
  nativeContractBomIdentity,
} from "./native-identity.ts";
import type { JsonValue } from "./strict-json.ts";

type ComponentCase = {
  id: string;
  value: JsonValue;
  purpose: string;
  mediaType: string;
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
type Corpus = { corpusVersion: number; componentCases: ComponentCase[]; bomCases: BomCase[] };

function digest(raw: Uint8Array): string {
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

function produced(canonical: Uint8Array): ConformanceCase["canonicalization"] {
  return { status: "produced", bytesBase64: Buffer.from(canonical).toString("base64"), digest: digest(canonical) };
}

function baseCase(id: string, corpusDigest: string, corpusBytes: number): Omit<ConformanceCase, "valid" | "findings" | "canonicalization" | "componentDigest" | "rootBomDigest" | "signature"> {
  return {
    caseId: id,
    inputDigest: corpusDigest,
    inputBytes: corpusBytes,
    parseOutcome: "accepted",
  };
}

function allowedPurposes(repositoryRoot: string): Set<string> {
  const registry = JSON.parse(readFileSync(join(repositoryRoot, "contracts/registries/v1/registry-set.json"), "utf8")) as {
    registries: Array<{ registryId: string; entries: Array<{ wireValue: string }> }>;
  };
  const values = registry.registries.find((item) => item.registryId === "identity-purpose")?.entries ?? [];
  return new Set(values.map((entry) => entry.wireValue));
}

export function buildTypeScriptIdentityResult(repositoryRoot: string): ConformanceResult {
  if (Bun.version !== "1.3.11") throw new Error(`expected Bun 1.3.11, got ${Bun.version}`);
  const corpusPath = join(repositoryRoot, "contracts/governance/m3/identity-cases.json");
  const corpusBytes = readFileSync(corpusPath);
  const corpus = JSON.parse(corpusBytes.toString("utf8")) as Corpus;
  if (corpus.corpusVersion !== 1 || corpus.componentCases.length !== 9 || corpus.bomCases.length !== 3) {
    throw new Error("expected identity corpus v1 with nine component and three BOM cases");
  }
  const corpusDigest = digest(corpusBytes);
  const purposes = allowedPurposes(repositoryRoot);
  const cases: ConformanceCase[] = [];
  for (const testCase of corpus.componentCases) {
    const base = baseCase(testCase.id, corpusDigest, corpusBytes.length);
    try {
      const actual = nativeComponentIdentity(testCase.value, testCase.purpose, testCase.mediaType, purposes);
      if (testCase.expectedCode || actual.digest !== testCase.expectedDigest) throw new Error(`${testCase.id}: component expectation differs`);
      cases.push({ ...base, valid: true, findings: [], canonicalization: produced(actual.canonical), componentDigest: actual.digest, rootBomDigest: null, signature: { status: "not-applicable" } });
    } catch (error) {
      if (!(error instanceof NativeIdentityError) || error.code !== testCase.expectedCode) throw error;
      const canonical = nativeCanonicalize(testCase.value);
      cases.push({
        ...base,
        valid: false,
        findings: [{ code: error.code, instancePath: "/", schemaPath: "/profile/componentIdentity" }],
        canonicalization: produced(canonical),
        componentDigest: null,
        rootBomDigest: null,
        signature: { status: "not-applicable" },
      });
    }
  }
  const rawBomCases = new Map(corpus.bomCases.map((item) => [item.id, item]));
  const resolve = (testCase: BomCase): JsonValue => {
    if (testCase.value !== undefined) return structuredClone(testCase.value);
    const source = testCase.copyOf ? rawBomCases.get(testCase.copyOf) : undefined;
    if (!source) throw new Error(`${testCase.id}: invalid copyOf`);
    const value = resolve(source);
    if (value !== null && typeof value === "object" && !Array.isArray(value) && testCase.declaredDigest !== undefined) {
      value.digest = testCase.declaredDigest;
    }
    return value;
  };
  for (const testCase of corpus.bomCases) {
    const base = baseCase(testCase.id, corpusDigest, corpusBytes.length);
    try {
      const actual = nativeContractBomIdentity(resolve(testCase));
      if (testCase.expectedCode || actual.digest !== testCase.expectedDigest || actual.verified !== testCase.expectedVerification) {
        throw new Error(`${testCase.id}: BOM expectation differs`);
      }
      if (testCase.expectedCanonicalWithoutDigest !== undefined
          && Buffer.from(actual.canonical).toString("utf8") !== testCase.expectedCanonicalWithoutDigest) {
        throw new Error(`${testCase.id}: canonical BOM differs`);
      }
      cases.push({
        ...base,
        valid: actual.verified,
        findings: actual.verified ? [] : [{ code: "BOM_DIGEST_MISMATCH", instancePath: "/digest", schemaPath: "/profile/contractBomIdentity" }],
        canonicalization: produced(actual.canonical),
        componentDigest: null,
        rootBomDigest: actual.digest,
        signature: { status: "not-applicable" },
      });
    } catch (error) {
      if (!(error instanceof NativeIdentityError) || error.code !== testCase.expectedCode) throw error;
      cases.push({
        ...base,
        valid: false,
        findings: [{ code: error.code, instancePath: "/digest", schemaPath: "/profile/contractBomIdentity" }],
        canonicalization: { status: "rejected", code: error.code },
        componentDigest: null,
        rootBomDigest: null,
        signature: { status: "not-applicable" },
      });
    }
  }
  cases.sort((left, right) => Buffer.compare(Buffer.from(left.caseId), Buffer.from(right.caseId)));
  const adapterSources = ["native-identity.ts", "strict-json.ts", "dp008-typescript-jcs-adapter.ts"]
    .map((name) => readFileSync(join(import.meta.dir, name)));
  return {
    resultVersion: 1,
    fixtureManifestDigest: corpusDigest,
    language: "typescript",
    implementation: {
      adapterId: "anvilkit-typescript-identity",
      adapterVersion: "0.1.0",
      runtime: "bun",
      runtimeVersion: "1.3.11",
      adapterDigest: digest(Buffer.concat(adapterSources)),
    },
    cases,
  };
}
