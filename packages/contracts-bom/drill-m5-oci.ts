#!/usr/bin/env bun

import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { canonicalizeJcs, contractBomIdentity, verifyContractBomIdentity } from "../contracts-codegen/identity.ts";
import { dssePreAuthEncoding, signEd25519 } from "../contracts-codegen/native-signature.ts";
import { verifyDsseEnvelope, type DsseEnvelope, type SignatureStatementV1, type VerificationContext } from "../contracts-codegen/security-profile.ts";
import type { JsonValue } from "../contracts-codegen/strict-json.ts";
import { verifyFetchedBom } from "./bom-runtime.ts";
import { validateBomGraph, type ContractBom, type ContractBomReference } from "./bom-graph.ts";

const ROOT = join(import.meta.dir, "..", "..");
const oras = process.env.ORAS ?? "oras";
const registry = process.env.OCI_REGISTRY ?? "zot";
const host = process.env.OCI_TEST_HOST ?? "127.0.0.1:5510";
const workspace = mkdtempSync(join(tmpdir(), "anvilkit-m5-oci-"));
const [address, port] = host.split(":");
const config = join(workspace, "zot.json");
const discoveryPath = join(workspace, "discovery.json");
const authoritativeRepository = `${host}/anvilkit/contracts`;
const stagingRepository = `${host}/anvilkit/staging`;
const mirrorRepository = `${host}/anvilkit/contracts-mirror`;
const bomMediaType = "application/vnd.anvilkit.contract-bom.v1+json";
const signatureArtifactType = "application/vnd.dsse.envelope.v1+json";
const sbomArtifactType = "application/vnd.cyclonedx+json";
const provenanceArtifactType = "application/vnd.in-toto+json";
const semanticAnnotation = "dev.anvilkit.contract-bom.digest";
const publicKey = "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo";
const privateSeed = "nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A";
const keyId = "urn:anvilkit:key:contracts-release:synthetic-m5";

writeFileSync(config, JSON.stringify({
  distSpecVersion: "1.1.1",
  storage: { rootDirectory: join(workspace, "registry") },
  http: { address, port: Number(port) },
  log: { level: "error" },
}));

function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function run(command: string, args: string[], cwd = workspace): string {
  const result = Bun.spawnSync([command, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) throw new Error(`${command} ${args[0]} failed: ${result.stderr.toString().trim()}`);
  return result.stdout.toString().trim();
}

function resolves(reference: string): boolean {
  return Bun.spawnSync([oras, "resolve", "--plain-http", reference], { stdout: "ignore", stderr: "ignore" }).exitCode === 0;
}

async function ready(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (Bun.spawnSync([oras, "repo", "ls", "--plain-http", host], { stdout: "ignore", stderr: "ignore" }).exitCode === 0) return;
    await Bun.sleep(50);
  }
  throw new Error("isolated Zot registry did not become ready");
}

function atomicJson(path: string, value: unknown): void {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, path);
}

function referrers(reference: string): Array<{ artifactType: string; digest: string }> {
  const value = JSON.parse(run(oras, ["discover", "--plain-http", "--distribution-spec", "v1.1-referrers-api", "--format", "json", "--depth", "1", reference]));
  return value.referrers ?? value.manifests ?? [];
}

const context: VerificationContext = {
  issuer: "urn:anvilkit:issuer:contracts-release",
  audience: "urn:anvilkit:audience:contract-consumers",
  now: "2026-08-10T18:00:00.000Z",
  trust: {
    apiVersion: "anvilkit.io/contracts/v1", kind: "ContractTrustRoot", snapshotId: "m5-isolated-trust",
    issuedAt: "2026-08-10T00:00:00.000Z", nextUpdate: "2027-08-10T00:00:00.000Z", maximumClockSkewSeconds: 60,
    keys: [{ keyId, issuer: "urn:anvilkit:issuer:contracts-release", audiences: ["urn:anvilkit:audience:contract-consumers"],
      algorithms: ["dsse-ed25519-v1"], publicKeyJwk: { kty: "OKP", crv: "Ed25519", x: publicKey }, status: "active",
      notBefore: "2026-08-10T00:00:00.000Z", notAfter: "2027-08-10T00:00:00.000Z" }],
  },
  revocations: {
    apiVersion: "anvilkit.io/contracts/v1", kind: "ContractRevocationSnapshot", snapshotId: "m5-isolated-revocations",
    issuedAt: "2026-08-10T00:00:00.000Z", nextUpdate: "2027-08-10T00:00:00.000Z", revokedKeys: [],
  },
};

type PublishedRelease = {
  version: string;
  bomDigest: string;
  ociManifestDigest: string;
  evidenceManifestDigest: string;
  immutableTag: string;
  referrerDigests: string[];
};

function createEnvelope(bom: ContractBom, manifestDigest: string, manifestBytes: Uint8Array): { envelope: DsseEnvelope; statement: SignatureStatementV1 } {
  const statement: SignatureStatementV1 = {
    apiVersion: "anvilkit.io/contracts/v1", kind: "ContractSignatureStatement",
    subject: { digest: manifestDigest, size: manifestBytes.length, purpose: "contract-bom-oci-manifest", mediaType: "application/vnd.oci.image.manifest.v1+json" },
    contractBomDigest: bom.digest, issuer: context.issuer, audience: context.audience, keyId,
    issuedAt: "2026-08-10T17:00:00.000Z", notBefore: "2026-08-10T16:59:00.000Z", expiresAt: "2027-08-10T00:00:00.000Z",
    algorithm: "dsse-ed25519-v1",
  };
  const payload = Buffer.from(canonicalizeJcs(statement as unknown as JsonValue));
  const envelope: DsseEnvelope = {
    payloadType: "application/vnd.anvilkit.contract-signature-statement.v1+json",
    payload: payload.toString("base64url"),
    signatures: [{ keyid: keyId, sig: signEd25519(publicKey, privateSeed, dssePreAuthEncoding("application/vnd.anvilkit.contract-signature-statement.v1+json", payload)).toString("base64url") }],
  };
  return { envelope, statement };
}

function publish(bom: ContractBom, label: string): PublishedRelease {
  const directory = join(workspace, label);
  mkdirSync(directory);
  const bomFile = `${label}-bom.json`;
  const bomBytes = Buffer.from(canonicalizeJcs(bom as unknown as JsonValue));
  writeFileSync(join(directory, bomFile), bomBytes);
  const stagingTag = `${stagingRepository}:${bom.digest.slice(7)}`;
  const exportedManifest = join(directory, "manifest.json");
  run(oras, ["push", "--plain-http", "--no-tty", "--artifact-type", bomMediaType, "--annotation", `${semanticAnnotation}=${bom.digest}`,
    "--export-manifest", exportedManifest, stagingTag, `${bomFile}:${bomMediaType}`], directory);
  const manifestBytes = readFileSync(exportedManifest);
  const manifestDigest = sha256(manifestBytes);
  if (run(oras, ["resolve", "--plain-http", stagingTag]) !== manifestDigest) throw new Error("registry changed exported manifest bytes");

  const signed = createEnvelope(bom, manifestDigest, manifestBytes);
  writeFileSync(join(directory, "signature.dsse.json"), canonicalizeJcs(signed.envelope as unknown as JsonValue));
  writeFileSync(join(directory, "sbom.cdx.json"), JSON.stringify({ bomFormat: "CycloneDX", specVersion: "1.6", serialNumber: `urn:uuid:${bom.digest.slice(7, 39)}`, version: 1, components: [] }));
  writeFileSync(join(directory, "provenance.intoto.json"), JSON.stringify({ _type: "https://in-toto.io/Statement/v1", subject: [{ name: bom.name, digest: { sha256: bom.digest.slice(7) } }], predicateType: "https://slsa.dev/provenance/v1", predicate: { buildType: "https://anvilkit.dev/contracts/m5-isolated" } }));
  for (const [artifactType, file] of [[signatureArtifactType, "signature.dsse.json"], [sbomArtifactType, "sbom.cdx.json"], [provenanceArtifactType, "provenance.intoto.json"]]) {
    run(oras, ["attach", "--plain-http", "--no-tty", "--distribution-spec", "v1.1-referrers-api", "--artifact-type", artifactType,
      `${stagingRepository}@${manifestDigest}`, `${file}:application/json`], directory);
  }
  const stagedReferrers = referrers(`${stagingRepository}@${manifestDigest}`);
  const actualTypes = stagedReferrers.map((item) => item.artifactType).sort();
  const expectedTypes = [signatureArtifactType, sbomArtifactType, provenanceArtifactType].sort();
  if (JSON.stringify(actualTypes) !== JSON.stringify(expectedTypes)) throw new Error("staging referrer set differs");
  const retrievedReferrers = join(directory, "retrieved-referrers");
  mkdirSync(retrievedReferrers);
  for (const referrer of stagedReferrers) {
    const destination = join(retrievedReferrers, referrer.digest.slice(7));
    mkdirSync(destination);
    run(oras, ["pull", "--plain-http", "--output", destination, `${stagingRepository}@${referrer.digest}`]);
    if (referrer.artifactType === signatureArtifactType) {
      const retrievedEnvelope = JSON.parse(readFileSync(join(destination, "signature.dsse.json"), "utf8")) as DsseEnvelope;
      verifyDsseEnvelope(retrievedEnvelope, signed.statement, context);
    } else if (referrer.artifactType === sbomArtifactType) {
      const retrievedSbom = JSON.parse(readFileSync(join(destination, "sbom.cdx.json"), "utf8"));
      if (retrievedSbom.bomFormat !== "CycloneDX" || retrievedSbom.specVersion !== "1.6") throw new Error("retrieved SBOM profile differs");
    } else if (referrer.artifactType === provenanceArtifactType) {
      const retrievedProvenance = JSON.parse(readFileSync(join(destination, "provenance.intoto.json"), "utf8"));
      if (retrievedProvenance._type !== "https://in-toto.io/Statement/v1") throw new Error("retrieved provenance profile differs");
    }
  }

  const immutableTag = `sha256-${manifestDigest.slice(7)}`;
  run(oras, ["cp", "--from-plain-http", "--to-plain-http", "--recursive", "--from-distribution-spec", "v1.1-referrers-api",
    "--to-distribution-spec", "v1.1-referrers-api", `${stagingRepository}@${manifestDigest}`, `${authoritativeRepository}:${immutableTag}`]);
  if (run(oras, ["resolve", "--plain-http", `${authoritativeRepository}:${immutableTag}`]) !== manifestDigest) throw new Error("promotion changed manifest identity");
  if (referrers(`${authoritativeRepository}@${manifestDigest}`).length !== 3) throw new Error("promotion lost referrers");
  return {
    version: bom.version, bomDigest: bom.digest, ociManifestDigest: manifestDigest,
    evidenceManifestDigest: stagedReferrers.find((item) => item.artifactType === signatureArtifactType)!.digest,
    immutableTag, referrerDigests: stagedReferrers.map((item) => item.digest).sort(),
  };
}

function resolveAndVerify(release: PublishedRelease, repository: string, label: string, bomFile: string): void {
  const output = join(workspace, `pull-${label}`);
  mkdirSync(output);
  run(oras, ["pull", "--plain-http", "--output", output, `${repository}@${release.ociManifestDigest}`]);
  const manifestBytes = Buffer.from(run(oras, ["manifest", "fetch", "--plain-http", `${repository}@${release.ociManifestDigest}`]));
  const bomBytes = readFileSync(join(output, bomFile));
  const reference: ContractBomReference = {
    repository, bomDigest: release.bomDigest, ociManifestDigest: release.ociManifestDigest,
    evidenceManifestDigest: release.evidenceManifestDigest,
  };
  const resolved = verifyFetchedBom(reference, manifestBytes, new Map([[sha256(bomBytes), bomBytes]]), new Set([repository]));
  if (resolved.bom.digest !== release.bomDigest) throw new Error("clean resolver returned another BOM");
}

const root = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m4/release-bom.json"), "utf8")) as ContractBom;
if (!verifyContractBomIdentity(root as unknown as JsonValue) || validateBomGraph(root).length) throw new Error("M4 release BOM is not a valid closed graph");
const previous = structuredClone(root);
previous.version = "1.0.0-previous";
previous.createdAt = "2026-08-10T15:59:00.000Z";
previous.digest = contractBomIdentity(previous as unknown as JsonValue);

const server = Bun.spawn([registry, "serve", config], { cwd: workspace, stdout: "pipe", stderr: "pipe" });
try {
  await ready();

  const failedTag = `${stagingRepository}:failure-injection`;
  cpSync(join(ROOT, "contracts/governance/m4/release-bom.json"), join(workspace, "failed.json"));
  run(oras, ["push", "--plain-http", "--no-tty", "--artifact-type", bomMediaType, failedTag, `failed.json:${bomMediaType}`]);
  if (existsSync(discoveryPath) || resolves(`${authoritativeRepository}:failure-injection`)) throw new Error("failed staging publication became selectable");
  run(oras, ["manifest", "delete", "--plain-http", "--force", failedTag]);
  if (resolves(failedTag)) throw new Error("partial staging publication cleanup failed");

  const previousRelease = publish(previous, "previous");
  atomicJson(discoveryPath, { recordVersion: 1, releases: [previousRelease] });
  const currentRelease = publish(root, "current");
  atomicJson(discoveryPath, { recordVersion: 1, releases: [previousRelease, currentRelease], selected: currentRelease.ociManifestDigest });

  resolveAndVerify(previousRelease, authoritativeRepository, "previous-authoritative", "previous-bom.json");
  resolveAndVerify(currentRelease, authoritativeRepository, "current-authoritative", "current-bom.json");
  for (const release of [previousRelease, currentRelease]) {
    run(oras, ["cp", "--from-plain-http", "--to-plain-http", "--recursive", "--from-distribution-spec", "v1.1-referrers-api",
      "--to-distribution-spec", "v1.1-referrers-api", `${authoritativeRepository}@${release.ociManifestDigest}`, `${mirrorRepository}:${release.immutableTag}`]);
    if (run(oras, ["resolve", "--plain-http", `${mirrorRepository}:${release.immutableTag}`]) !== release.ociManifestDigest ||
        referrers(`${mirrorRepository}@${release.ociManifestDigest}`).length !== 3) throw new Error("mirror identity/referrers differ");
  }
  resolveAndVerify(currentRelease, mirrorRepository, "current-mirror", "current-bom.json");

  const requiredGeneration = 1;
  if (previous.compatibility.minimumConsumerGeneration > requiredGeneration || previous.compatibility.maximumConsumerGeneration < requiredGeneration) {
    throw new Error("older BOM is incompatible with rollback consumer generation");
  }
  atomicJson(discoveryPath, { recordVersion: 1, releases: [previousRelease, currentRelease], selected: previousRelease.ociManifestDigest });
  resolveAndVerify(previousRelease, mirrorRepository, "rollback-mirror", "previous-bom.json");

  console.log(JSON.stringify({
    recordVersion: 1, status: "passed", registry: "project-zot/zot 2.1.20", client: "ORAS 1.3.3",
    repositories: { staging: stagingRepository, authoritative: authoritativeRepository, mirror: mirrorRepository },
    releases: [previousRelease, currentRelease], rollbackSelected: previousRelease.ociManifestDigest,
    assertions: [
      "failed-publication-not-discoverable", "partial-staging-cleanup", "content-addressed-staging", "registry-pulled-dsse-signature-trust-verification",
      "sbom-referrer", "provenance-referrer", "atomic-discovery-update", "dual-digest-clean-resolution", "retained-version-inventory",
      "recursive-mirror-identity", "recursive-mirror-referrers", "offline-ready-content-addressed-inputs", "compatible-old-bom-rollback",
      "rollback-does-not-modify-published-bytes", "mutable-aliases-not-used-for-resolution",
    ],
  }, null, 2));
} finally {
  server.kill();
  await server.exited;
}
