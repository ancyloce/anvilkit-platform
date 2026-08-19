#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { assertConformanceResult, compareConformanceResults, type ConformanceResult } from "./conformance-result.ts";

type ComponentCase = { id: string; expectedDigest?: string; expectedCode?: string };
type BomCase = {
  id: string;
  expectedDigest?: string;
  expectedVerification?: boolean;
  expectedCanonicalWithoutDigest?: string;
  expectedCode?: string;
};
type Corpus = { corpusVersion: number; componentCases: ComponentCase[]; bomCases: BomCase[] };

function digest(raw: Uint8Array): string {
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

function resultPaths(): string[] {
  const paths: string[] = [];
  for (let index = 0; index + 1 < process.argv.length; index += 1) {
    if (process.argv[index] === "--result") paths.push(resolve(process.argv[index + 1]));
  }
  return paths;
}

export function compareAgentIdentity(repositoryRoot: string, paths: string[]): object {
  if (paths.length !== 2) throw new Error(`expected two --result paths, got ${paths.length}`);
  const corpusBytes = readFileSync(join(repositoryRoot, "contracts/agent/fixtures/canonical/identity-cases.json"));
  const corpus = JSON.parse(corpusBytes.toString("utf8")) as Corpus;
  if (corpus.corpusVersion !== 1 || corpus.componentCases.length !== 9 || corpus.bomCases.length !== 3) {
    throw new Error("expected identity corpus v1 with nine component and three BOM cases");
  }
  const corpusDigest = digest(corpusBytes);
  const componentByID = new Map(corpus.componentCases.map((item) => [item.id, item]));
  const bomByID = new Map(corpus.bomCases.map((item) => [item.id, item]));
  const rawResults = paths.map((path) => readFileSync(path));
  const results = rawResults.map((raw) => JSON.parse(raw.toString("utf8")) as ConformanceResult);
  for (const result of results) {
    assertConformanceResult(result);
    if (result.fixtureManifestDigest !== corpusDigest || result.cases.length !== 12) {
      throw new Error(`${result.language}: identity corpus binding or case count differs`);
    }
    for (const item of result.cases) {
      if (item.inputDigest !== corpusDigest || item.inputBytes !== corpusBytes.length || item.parseOutcome !== "accepted") {
        throw new Error(`${result.language}/${item.caseId}: identity input binding differs`);
      }
      if (item.signature.status !== "not-applicable") {
        throw new Error(`${result.language}/${item.caseId}: identity vector unexpectedly carries a signature result`);
      }
      const component = componentByID.get(item.caseId);
      const bom = bomByID.get(item.caseId);
      if (!component && !bom) throw new Error(`${result.language}/${item.caseId}: unknown identity case`);
      if (item.canonicalization.status === "produced") {
        const canonical = Buffer.from(item.canonicalization.bytesBase64, "base64");
        if (canonical.length === 0 || digest(canonical) !== item.canonicalization.digest) {
          throw new Error(`${result.language}/${item.caseId}: canonical identity bytes differ from digest`);
        }
        if (bom?.expectedCanonicalWithoutDigest !== undefined
            && canonical.toString("utf8") !== bom.expectedCanonicalWithoutDigest) {
          throw new Error(`${result.language}/${item.caseId}: canonical BOM bytes differ from corpus`);
        }
      }
      if (component) {
        if (item.rootBomDigest !== null) throw new Error(`${result.language}/${item.caseId}: component carries a root digest`);
        if (component.expectedCode) {
          if (item.valid || item.componentDigest !== null || item.canonicalization.status !== "produced"
              || item.findings[0]?.code !== component.expectedCode) {
            throw new Error(`${result.language}/${item.caseId}: rejected component result differs from corpus`);
          }
        } else if (!item.valid || item.findings.length !== 0 || item.componentDigest !== component.expectedDigest
            || item.canonicalization.status !== "produced") {
          throw new Error(`${result.language}/${item.caseId}: component digest differs from corpus`);
        }
      }
      if (bom) {
        if (item.componentDigest !== null) throw new Error(`${result.language}/${item.caseId}: BOM carries a component digest`);
        if (bom.expectedCode) {
          if (item.valid || item.rootBomDigest !== null || item.canonicalization.status !== "rejected"
              || item.canonicalization.code !== bom.expectedCode || item.findings[0]?.code !== bom.expectedCode) {
            throw new Error(`${result.language}/${item.caseId}: rejected BOM result differs from corpus`);
          }
        } else {
          const expectedValid = bom.expectedVerification === true;
          const expectedCode = expectedValid ? undefined : "BOM_DIGEST_MISMATCH";
          if (item.valid !== expectedValid || item.rootBomDigest !== bom.expectedDigest
              || item.canonicalization.status !== "produced" || item.findings[0]?.code !== expectedCode
              || (expectedValid && item.findings.length !== 0)) {
            throw new Error(`${result.language}/${item.caseId}: root BOM result differs from corpus`);
          }
        }
      }
    }
  }
  const parity = compareConformanceResults(results);
  return {
    summaryVersion: 1,
    profile: "AnvilKitIdentityV1",
    ...parity,
    componentCaseCount: corpus.componentCases.length,
    rootBomCaseCount: corpus.bomCases.length,
    mandatoryCaseExecutions: 12 * results.length,
    resultDigests: Object.fromEntries(results.map((result, index) => [result.language, digest(rawResults[index])])),
  };
}

if (import.meta.main) {
  const rootIndex = process.argv.indexOf("--repository-root");
  const root = rootIndex >= 0 && process.argv[rootIndex + 1]
    ? resolve(process.argv[rootIndex + 1])
    : join(import.meta.dir, "..", "..");
  console.log(JSON.stringify(compareAgentIdentity(root, resultPaths()), null, 2));
}
