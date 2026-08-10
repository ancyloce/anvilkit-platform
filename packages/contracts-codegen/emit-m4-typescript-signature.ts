#!/usr/bin/env bun
import { createHash, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { ConformanceCase, ConformanceResult } from "./conformance-result.ts";
import { dssePreAuthEncoding, signEd25519, verifyEd25519 } from "./native-signature.ts";

type VectorCase = {
  id: string;
  profile: "dsse" | "jws";
  operation: "sign-and-verify" | "verify";
  mutation: "none" | "message-last-byte" | "signature-first-byte";
  expectedVerified: boolean;
};
type Corpus = {
  corpusVersion: number;
  key: { publicKeyBase64Url: string; privateSeedBase64Url: string };
  dsse: { payloadType: string; payloadBase64Url: string; signatureBase64Url: string };
  jws: { protectedBase64Url: string; payloadBase64Url: string; signatureBase64Url: string };
  cases: VectorCase[];
};

function digest(raw: Uint8Array): string {
  return `sha256:${createHash("sha256").update(raw).digest("hex")}`;
}

function mutate(raw: Buffer, enabled: boolean): Buffer {
  const result = Buffer.from(raw);
  if (enabled) result[result.length - 1] ^= 1;
  return result;
}

export function generateSignatureResult(repositoryRoot: string): ConformanceResult {
  if (Bun.version !== "1.3.11") throw new Error(`expected Bun 1.3.11, got ${Bun.version}`);
  const corpusPath = join(repositoryRoot, "contracts/governance/m3/signature-cases.json");
  const corpusBytes = readFileSync(corpusPath);
  const corpus = JSON.parse(corpusBytes.toString("utf8")) as Corpus;
  if (corpus.corpusVersion !== 1 || corpus.cases.length !== 6) throw new Error("invalid signature corpus");
  const cases: ConformanceCase[] = corpus.cases.map((item) => {
    const baseMessage = item.profile === "dsse"
      ? dssePreAuthEncoding(corpus.dsse.payloadType, Buffer.from(corpus.dsse.payloadBase64Url, "base64url"))
      : Buffer.from(`${corpus.jws.protectedBase64Url}.${corpus.jws.payloadBase64Url}`, "ascii");
    const message = mutate(baseMessage, item.mutation === "message-last-byte");
    const expectedSignature = Buffer.from(
      item.profile === "dsse" ? corpus.dsse.signatureBase64Url : corpus.jws.signatureBase64Url,
      "base64url",
    );
    const candidateSignature = item.operation === "sign-and-verify"
      ? signEd25519(corpus.key.publicKeyBase64Url, corpus.key.privateSeedBase64Url, message)
      : Buffer.from(expectedSignature);
    if (item.operation === "sign-and-verify" &&
        (!timingSafeEqual(candidateSignature, expectedSignature))) {
      throw new Error(`${item.id}: deterministic signature differs from corpus`);
    }
    if (item.mutation === "signature-first-byte") candidateSignature[0] ^= 1;
    const verified = verifyEd25519(corpus.key.publicKeyBase64Url, message, candidateSignature);
    if (verified !== item.expectedVerified) throw new Error(`${item.id}: verification differs from corpus`);
    return {
      caseId: item.id,
      inputDigest: digest(message),
      inputBytes: message.length,
      parseOutcome: "accepted",
      valid: verified,
      findings: verified ? [] : [{ code: "SIGNATURE_INVALID", instancePath: "/signature", schemaPath: "/profile/ed25519" }],
      canonicalization: { status: "not-applicable" },
      componentDigest: null,
      rootBomDigest: null,
      signature: verified ? { status: "verified" } : { status: "rejected", code: "SIGNATURE_INVALID" },
    };
  });
  const adapterBytes = Buffer.concat([
    readFileSync(join(import.meta.dir, "native-signature.ts")),
    readFileSync(import.meta.path),
  ]);
  return {
    resultVersion: 1,
    fixtureManifestDigest: digest(corpusBytes),
    language: "typescript",
    implementation: {
      adapterId: "anvilkit-typescript-signature-native",
      adapterVersion: "0.1.0",
      runtime: "bun",
      runtimeVersion: "1.3.11",
      adapterDigest: digest(adapterBytes),
    },
    cases,
  };
}

if (import.meta.main) {
  const rootIndex = process.argv.indexOf("--repository-root");
  const iterationIndex = process.argv.indexOf("--iterations");
  const root = rootIndex >= 0 && process.argv[rootIndex + 1]
    ? resolve(process.argv[rootIndex + 1])
    : join(import.meta.dir, "..", "..");
  const iterations = iterationIndex >= 0 ? Number(process.argv[iterationIndex + 1]) : 1;
  if (!Number.isSafeInteger(iterations) || iterations < 1) throw new Error("--iterations must be a positive integer");
  let result: ConformanceResult | undefined;
  for (let index = 0; index < iterations; index += 1) result = generateSignatureResult(root);
  console.log(JSON.stringify(result, null, 2));
}
