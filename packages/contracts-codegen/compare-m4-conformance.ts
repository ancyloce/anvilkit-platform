#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertConformanceResult,
  compareConformanceResults,
  type ConformanceResult,
  type Finding,
} from "./conformance-result.ts";

type ManifestCase = {
  id: string;
  bytesSha256: string;
  bytesLength: number;
  expected: {
    parse: "accepted" | "rejected";
    valid: boolean;
    findings: Finding[];
    signature: string;
  };
  applicableLanguages: string[];
};

function digest(raw: Uint8Array): string {
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

function argumentValues(name: string): string[] {
  const values: string[] = [];
  for (let index = 0; index < process.argv.length - 1; index += 1) {
    if (process.argv[index] === name) values.push(resolve(process.argv[index + 1]));
  }
  return values;
}

export function compareM4Conformance(repositoryRoot: string, resultPaths: string[]): object {
  if (resultPaths.length !== 4) throw new Error(`expected four --result paths, got ${resultPaths.length}`);
  const manifestBytes = readFileSync(join(repositoryRoot, "contracts/fixtures/v1/manifest.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as { manifestVersion: number; cases: ManifestCase[] };
  if (manifest.manifestVersion !== 1 || manifest.cases.length !== 97) {
    throw new Error(`expected fixture manifest v1 with 97 cases, got ${manifest.cases.length}`);
  }
  const manifestDigest = digest(manifestBytes);
  const expectedByID = new Map(manifest.cases.map((item) => [item.id, item]));
  const resultBytes = resultPaths.map((path) => readFileSync(path));
  const results = resultBytes.map((raw) => JSON.parse(raw.toString("utf8")) as ConformanceResult);
  for (const result of results) {
    assertConformanceResult(result);
    if (result.fixtureManifestDigest !== manifestDigest) {
      throw new Error(`${result.language}: result is not bound to the current fixture manifest`);
    }
    if (result.cases.length !== manifest.cases.length) {
      throw new Error(`${result.language}: expected 97 mandatory cases, got ${result.cases.length}`);
    }
    for (const item of result.cases) {
      const expected = expectedByID.get(item.caseId);
      if (!expected) throw new Error(`${result.language}/${item.caseId}: case is absent from manifest`);
      if (!expected.applicableLanguages.includes(result.language)) {
        throw new Error(`${result.language}/${item.caseId}: language is not applicable`);
      }
      if (item.inputDigest !== expected.bytesSha256 || item.inputBytes !== expected.bytesLength) {
        throw new Error(`${result.language}/${item.caseId}: input identity differs from manifest`);
      }
      if (item.parseOutcome !== expected.expected.parse || item.valid !== expected.expected.valid) {
        throw new Error(`${result.language}/${item.caseId}: parse/validity differs from manifest`);
      }
      if (JSON.stringify(item.findings) !== JSON.stringify(expected.expected.findings)) {
        throw new Error(`${result.language}/${item.caseId}: portable findings differ from manifest`);
      }
      if (item.canonicalization.status !== "produced") {
        throw new Error(`${result.language}/${item.caseId}: mandatory canonicalization was skipped or rejected`);
      }
      const canonical = Buffer.from(item.canonicalization.bytesBase64, "base64");
      if (canonical.length === 0 || digest(canonical) !== item.canonicalization.digest) {
        throw new Error(`${result.language}/${item.caseId}: canonical bytes do not match their digest`);
      }
      if (item.componentDigest !== null || item.rootBomDigest !== null) {
        throw new Error(`${result.language}/${item.caseId}: payload fixture unexpectedly carries BOM identity`);
      }
      if (expected.expected.signature !== "not-applicable-m2" || item.signature.status !== "not-applicable") {
        throw new Error(`${result.language}/${item.caseId}: signature applicability differs from manifest`);
      }
    }
  }
  const parity = compareConformanceResults(results);
  return {
    summaryVersion: 1,
    ...parity,
    manifestCaseCount: manifest.cases.length,
    mandatoryCaseExecutions: manifest.cases.length * results.length,
    resultDigests: Object.fromEntries(results.map((result, index) => [result.language, digest(resultBytes[index])])),
  };
}

if (import.meta.main) {
  const rootIndex = process.argv.indexOf("--repository-root");
  const repositoryRoot = rootIndex >= 0 && process.argv[rootIndex + 1]
    ? resolve(process.argv[rootIndex + 1])
    : join(import.meta.dir, "..", "..");
  console.log(JSON.stringify(compareM4Conformance(repositoryRoot, argumentValues("--result")), null, 2));
}
