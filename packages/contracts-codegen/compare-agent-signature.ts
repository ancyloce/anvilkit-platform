#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { assertConformanceResult, compareConformanceResults, type ConformanceResult } from "./conformance-result.ts";
import { dssePreAuthEncoding } from "./native-signature.ts";

type VectorCase = {
  id: string;
  profile: "dsse" | "jws";
  operation: "sign-and-verify" | "verify";
  mutation: "none" | "message-last-byte" | "signature-first-byte";
  expectedVerified: boolean;
};
type Corpus = {
  corpusVersion: number;
  dsse: { payloadType: string; payloadBase64Url: string };
  jws: { protectedBase64Url: string; payloadBase64Url: string };
  cases: VectorCase[];
};

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

function expectedMessage(corpus: Corpus, vector: VectorCase): Buffer {
  const message = vector.profile === "dsse"
    ? dssePreAuthEncoding(corpus.dsse.payloadType, Buffer.from(corpus.dsse.payloadBase64Url, "base64url"))
    : Buffer.from(`${corpus.jws.protectedBase64Url}.${corpus.jws.payloadBase64Url}`, "ascii");
  if (vector.mutation === "message-last-byte") message[message.length - 1] ^= 1;
  return message;
}

export function compareAgentSignature(repositoryRoot: string, paths: string[]): object {
  if (paths.length !== 2) throw new Error(`expected two --result paths, got ${paths.length}`);
  const corpusBytes = readFileSync(join(repositoryRoot, "contracts/agent/fixtures/signing/signature-cases.json"));
  const corpus = JSON.parse(corpusBytes.toString("utf8")) as Corpus;
  if (corpus.corpusVersion !== 1 || corpus.cases.length !== 6) throw new Error("invalid signature corpus");
  const corpusDigest = digest(corpusBytes);
  const vectors = new Map(corpus.cases.map((item) => [item.id, item]));
  const rawResults = paths.map((path) => readFileSync(path));
  const results = rawResults.map((raw) => JSON.parse(raw.toString("utf8")) as ConformanceResult);
  for (const result of results) {
    assertConformanceResult(result);
    if (result.fixtureManifestDigest !== corpusDigest || result.cases.length !== corpus.cases.length) {
      throw new Error(`${result.language}: signature corpus binding or case count differs`);
    }
    for (const item of result.cases) {
      const vector = vectors.get(item.caseId);
      if (!vector) throw new Error(`${result.language}/${item.caseId}: unknown signature case`);
      const message = expectedMessage(corpus, vector);
      if (item.inputDigest !== digest(message) || item.inputBytes !== message.length || item.parseOutcome !== "accepted") {
        throw new Error(`${result.language}/${item.caseId}: signed input binding differs`);
      }
      if (item.canonicalization.status !== "not-applicable" || item.componentDigest !== null || item.rootBomDigest !== null) {
        throw new Error(`${result.language}/${item.caseId}: non-signature fields differ`);
      }
      if (vector.expectedVerified) {
        if (!item.valid || item.findings.length !== 0 || item.signature.status !== "verified") {
          throw new Error(`${result.language}/${item.caseId}: accepted signature result differs`);
        }
      } else if (item.valid || item.findings.length !== 1 || item.findings[0].code !== "SIGNATURE_INVALID" ||
          item.findings[0].instancePath !== "/signature" || item.findings[0].schemaPath !== "/profile/ed25519" ||
          item.signature.status !== "rejected" || item.signature.code !== "SIGNATURE_INVALID") {
        throw new Error(`${result.language}/${item.caseId}: rejected signature result differs`);
      }
    }
  }
  const parity = compareConformanceResults(results);
  return {
    summaryVersion: 1,
    profile: "AnvilKitSignaturePrimitiveV1",
    ...parity,
    dsseCaseCount: corpus.cases.filter((item) => item.profile === "dsse").length,
    jwsCaseCount: corpus.cases.filter((item) => item.profile === "jws").length,
    mandatoryCaseExecutions: corpus.cases.length * results.length,
    resultDigests: Object.fromEntries(results.map((result, index) => [result.language, digest(rawResults[index])])),
  };
}

if (import.meta.main) {
  const rootIndex = process.argv.indexOf("--repository-root");
  const root = rootIndex >= 0 && process.argv[rootIndex + 1]
    ? resolve(process.argv[rootIndex + 1])
    : join(import.meta.dir, "..", "..");
  console.log(JSON.stringify(compareAgentSignature(root, resultPaths()), null, 2));
}
