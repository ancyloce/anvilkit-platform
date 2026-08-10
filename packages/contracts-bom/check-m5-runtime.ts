// Synthetic, offline PLAN-0003 M5-T02..T07 conformance gate.

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { canonicalizeJcs } from "../contracts-codegen/identity.ts";
import type { JsonValue } from "../contracts-codegen/strict-json.ts";
import {
  BomRuntimeError, ContentAddressedCache, composeContractBom, createOciArtifactManifest,
  projectContractBom, verifyFetchedBom,
} from "./bom-runtime.ts";
import type { ContractBomReference } from "./bom-graph.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const failures: string[] = [];
const hex = (character: string) => `sha256:${character.repeat(64)}`;
const sha256 = (bytes: Uint8Array) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
function expectCode(id: string, code: string, run: () => unknown): void {
  try { run(); failures.push(`${id}: expected ${code}`); }
  catch (error) {
    if (!(error instanceof BomRuntimeError)) failures.push(`${id}: non-portable ${String(error)}`);
    else if (error.code !== code) failures.push(`${id}: expected ${code}, got ${error.code}`);
  }
}

const schemaPath = join(REPO_ROOT, "contracts", "schemas", "v1", "contract-signature-statement.schema.json");
const schemaBytes = readFileSync(schemaPath);
const input = {
  name: "anvilkit-contracts", version: "1.0.0", createdAt: "2026-08-09T12:00:00.000Z", issuer: "urn:anvilkit:issuer:contracts-release",
  compatibility: { minimumConsumerGeneration: 1, maximumConsumerGeneration: 1 },
  components: [{ kind: "json-schema", name: "anvilkit.contract.schema.contract-signature-statement.v1", version: "1.0.0", mediaType: "application/schema+json", purpose: "schema", bytes: schemaBytes, dependencies: [], issuer: "urn:anvilkit:issuer:contracts-release", provenanceDigest: hex("c") }],
  generatorSetDigest: hex("d"), fixtureManifestDigest: hex("e"), registrySetDigest: hex("f"), releaseEvidenceDigest: hex("a"),
  allowedPurposes: new Set(["schema"]),
};
const first = composeContractBom(input);
const second = composeContractBom(input);
if (JSON.stringify(first) !== JSON.stringify(second)) failures.push("composition is not deterministic");
const projection = projectContractBom(first, [first.components[0]]);
if (projection.rootBomDigest !== first.digest || JSON.stringify(projection.components) !== JSON.stringify(first.components)) failures.push("projection does not bind root or preserve exact component");
expectCode("projection-outside-root", "BOM_DEPENDENCY_MISSING", () => projectContractBom(first, [{ ...first.components[0], digest: hex("9") }]));

const bomBytes = Buffer.from(canonicalizeJcs(first as unknown as JsonValue));
const manifestBytes = createOciArtifactManifest(bomBytes, first.digest);
const manifestDigest = sha256(manifestBytes);
const descriptorDigest = sha256(bomBytes);
const reference: ContractBomReference = { repository: "registry.example.invalid/anvilkit/contracts", bomDigest: first.digest, ociManifestDigest: manifestDigest, evidenceManifestDigest: hex("8") };
const blobs = new Map([[descriptorDigest, bomBytes as Uint8Array]]);
const resolved = verifyFetchedBom(reference, manifestBytes, blobs, new Set([reference.repository]));
if (resolved.bom.digest !== first.digest || resolved.manifestDigest !== manifestDigest) failures.push("clean resolution differs");
expectCode("repository-denial", "BOM_REPOSITORY_DENIED", () => verifyFetchedBom(reference, manifestBytes, blobs, new Set()));
const corruptManifest = Buffer.from(manifestBytes); corruptManifest[corruptManifest.length - 2] ^= 1;
expectCode("manifest-digest", "OCI_MANIFEST_DIGEST_MISMATCH", () => verifyFetchedBom(reference, corruptManifest, blobs, new Set([reference.repository])));
expectCode("missing-blob", "OCI_BOM_BLOB_INVALID", () => verifyFetchedBom(reference, manifestBytes, new Map(), new Set([reference.repository])));
const changedReference = { ...reference, bomDigest: hex("7") };
expectCode("semantic-annotation", "OCI_MANIFEST_PROFILE_INVALID", () => verifyFetchedBom(changedReference, manifestBytes, blobs, new Set([reference.repository])));

const cacheRoot = mkdtempSync(join(tmpdir(), "anvilkit-bom-cache-"));
try {
  const cache = new ContentAddressedCache(cacheRoot, 2_000_000);
  cache.put(manifestDigest, manifestBytes);
  cache.put(descriptorDigest, bomBytes);
  if (sha256(cache.get(manifestDigest)) !== manifestDigest || sha256(cache.get(descriptorDigest)) !== descriptorDigest) failures.push("offline cache read differs");
  expectCode("cache-input-corrupt", "CACHE_DIGEST_MISMATCH", () => cache.put(manifestDigest, Buffer.from("corrupt")));
  expectCode("cache-miss", "CACHE_MISS", () => cache.get(hex("0")));
  const corruptPath = join(cacheRoot, descriptorDigest.slice(7, 9), descriptorDigest.slice(9));
  writeFileSync(corruptPath, Buffer.from("corrupt"));
  expectCode("cache-corrupt", "CACHE_CORRUPT", () => cache.get(descriptorDigest));
} finally { rmSync(cacheRoot, { recursive: true, force: true }); }

if (failures.length) { console.error("M5 runtime FAILED:"); failures.sort().forEach((failure) => console.error(`  ${failure}`)); process.exit(1); }
console.log("M5-T02..T07 offline runtime valid: deterministic composition/projection, dual-digest OCI verification, allowlist, and content-addressed offline cache recovery gates");
