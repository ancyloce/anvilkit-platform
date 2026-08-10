// PLAN-0003 M5-T02..T07 deterministic composition, projection, and offline
// verification primitives. Network and registry credentials are deliberately
// caller-owned; the resolver accepts exact fetched bytes only.

import { createHash, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { componentIdentity, contractBomIdentity, verifyContractBomIdentity } from "../contracts-codegen/identity.ts";
import { admitStrictJson, type JsonValue } from "../contracts-codegen/strict-json.ts";
import { compareComponents, validateBomGraph, validateBomReference, type BomComponent, type BomDependency, type ContractBom, type ContractBomReference } from "./bom-graph.ts";

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const OCI_MEDIA_TYPE = "application/vnd.oci.image.manifest.v1+json";
const BOM_MEDIA_TYPE = "application/vnd.anvilkit.contract-bom.v1+json";
const SEMANTIC_ANNOTATION = "dev.anvilkit.contract-bom.digest";

export class BomRuntimeError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "BomRuntimeError";
  }
}

export type ComponentInput = {
  kind: string;
  name: string;
  version: string;
  mediaType: string;
  purpose: string;
  bytes: Uint8Array;
  dependencies: BomDependency[];
  issuer: string;
  provenanceDigest: string;
};

export type ComposeInput = {
  name: string;
  version: string;
  createdAt: string;
  issuer: string;
  compatibility: ContractBom["compatibility"];
  components: ComponentInput[];
  generatorSetDigest: string;
  fixtureManifestDigest: string;
  registrySetDigest: string;
  releaseEvidenceDigest: string;
  allowedPurposes: ReadonlySet<string>;
};

function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function parseJson(bytes: Uint8Array): JsonValue {
  return admitStrictJson(bytes).value;
}

export function composeContractBom(input: ComposeInput): ContractBom {
  const components: BomComponent[] = input.components.map((component) => ({
    kind: component.kind,
    name: component.name,
    version: component.version,
    mediaType: component.mediaType,
    digest: componentIdentity(parseJson(component.bytes), component.purpose, component.mediaType, input.allowedPurposes),
    size: component.bytes.length,
    dependencies: [...component.dependencies].sort(compareComponents),
    issuer: component.issuer,
    provenanceDigest: component.provenanceDigest,
  })).sort(compareComponents);
  const bom: ContractBom = {
    apiVersion: "anvilkit.io/contracts/v1", kind: "ContractBom", name: input.name, version: input.version,
    digest: `sha256:${"0".repeat(64)}`, createdAt: input.createdAt, issuer: input.issuer,
    compatibility: input.compatibility, components, generatorSetDigest: input.generatorSetDigest,
    fixtureManifestDigest: input.fixtureManifestDigest, registrySetDigest: input.registrySetDigest,
    releaseEvidenceDigest: input.releaseEvidenceDigest,
  };
  const findings = validateBomGraph(bom);
  if (findings.length) throw new BomRuntimeError(findings[0].code, `${findings[0].path}: ${findings[0].message}`);
  bom.digest = contractBomIdentity(bom as unknown as JsonValue);
  if (!verifyContractBomIdentity(bom as unknown as JsonValue)) throw new BomRuntimeError("BOM_IDENTITY_INVALID", "composed BOM identity does not verify");
  return bom;
}

function componentKey(component: BomDependency): string {
  return `${component.kind}\0${component.name}\0${component.version}\0${component.digest}`;
}

export type BomProjection = { rootBomDigest: string; components: BomComponent[] };

export function projectContractBom(bom: ContractBom, requested: readonly BomDependency[]): BomProjection {
  if (!verifyContractBomIdentity(bom as unknown as JsonValue) || validateBomGraph(bom).length) throw new BomRuntimeError("BOM_IDENTITY_INVALID", "source BOM is invalid");
  const byKey = new Map(bom.components.map((component) => [componentKey(component), component]));
  const selected = new Map<string, BomComponent>();
  const visit = (dependency: BomDependency): void => {
    const key = componentKey(dependency);
    if (selected.has(key)) return;
    const component = byKey.get(key);
    if (!component) throw new BomRuntimeError("BOM_DEPENDENCY_MISSING", "projection request is outside the closed root graph");
    selected.set(key, component);
    component.dependencies.forEach(visit);
  };
  requested.forEach(visit);
  return { rootBomDigest: bom.digest, components: [...selected.values()].sort(compareComponents) };
}

export type OciDescriptor = { mediaType: string; digest: string; size: number };
export type OciArtifactManifest = {
  schemaVersion: 2;
  mediaType: string;
  artifactType: string;
  config: OciDescriptor;
  layers: OciDescriptor[];
  annotations: Record<string, string>;
};

export function createOciArtifactManifest(bomBytes: Uint8Array, bomDigest: string, auxiliary: OciDescriptor[] = []): Uint8Array {
  if (!DIGEST.test(bomDigest)) throw new BomRuntimeError("BOM_DIGEST_INVALID", "semantic digest is invalid");
  const emptyConfig = Buffer.from("{}", "utf8");
  const manifest: OciArtifactManifest = {
    schemaVersion: 2, mediaType: OCI_MEDIA_TYPE, artifactType: BOM_MEDIA_TYPE,
    config: { mediaType: "application/vnd.oci.empty.v1+json", digest: sha256(emptyConfig), size: emptyConfig.length },
    layers: [{ mediaType: BOM_MEDIA_TYPE, digest: sha256(bomBytes), size: bomBytes.length }, ...auxiliary].sort((a, b) => a.digest.localeCompare(b.digest)),
    annotations: { [SEMANTIC_ANNOTATION]: bomDigest },
  };
  return Buffer.from(JSON.stringify(manifest), "utf8");
}

export type ResolvedBom = { bom: ContractBom; manifestDigest: string; manifest: OciArtifactManifest };

export function verifyFetchedBom(reference: ContractBomReference, manifestBytes: Uint8Array, blobByDigest: ReadonlyMap<string, Uint8Array>, allowedRepositories: ReadonlySet<string>): ResolvedBom {
  const referenceFindings = validateBomReference(reference);
  if (referenceFindings.length) throw new BomRuntimeError(referenceFindings[0].code, referenceFindings[0].message);
  if (!allowedRepositories.has(reference.repository)) throw new BomRuntimeError("BOM_REPOSITORY_DENIED", "repository is absent from the approved allowlist");
  if (sha256(manifestBytes) !== reference.ociManifestDigest) throw new BomRuntimeError("OCI_MANIFEST_DIGEST_MISMATCH", "manifest bytes differ from the immutable locator");
  const manifest = parseJson(manifestBytes) as unknown as OciArtifactManifest;
  if (manifest.schemaVersion !== 2 || manifest.mediaType !== OCI_MEDIA_TYPE || manifest.artifactType !== BOM_MEDIA_TYPE || manifest.annotations?.[SEMANTIC_ANNOTATION] !== reference.bomDigest) {
    throw new BomRuntimeError("OCI_MANIFEST_PROFILE_INVALID", "manifest profile or semantic annotation differs");
  }
  const bomDescriptors = manifest.layers?.filter((descriptor) => descriptor.mediaType === BOM_MEDIA_TYPE) ?? [];
  if (bomDescriptors.length !== 1) throw new BomRuntimeError("OCI_BOM_DESCRIPTOR_INVALID", "exactly one BOM blob is required");
  const descriptor = bomDescriptors[0];
  const bomBytes = blobByDigest.get(descriptor.digest);
  if (!bomBytes || bomBytes.length !== descriptor.size || sha256(bomBytes) !== descriptor.digest) throw new BomRuntimeError("OCI_BOM_BLOB_INVALID", "BOM blob bytes differ from descriptor");
  const bom = parseJson(bomBytes) as unknown as ContractBom;
  if (bom.digest !== reference.bomDigest || !verifyContractBomIdentity(bom as unknown as JsonValue)) throw new BomRuntimeError("BOM_IDENTITY_INVALID", "semantic BOM identity differs");
  const findings = validateBomGraph(bom);
  if (findings.length) throw new BomRuntimeError(findings[0].code, findings[0].message);
  return { bom, manifestDigest: reference.ociManifestDigest, manifest };
}

export class ContentAddressedCache {
  private readonly root: string;
  constructor(root: string, private readonly maximumBlobBytes = 1_073_741_824) {
    this.root = resolve(root);
    mkdirSync(this.root, { recursive: true, mode: 0o700 });
  }

  private path(digest: string): string {
    if (!DIGEST.test(digest)) throw new BomRuntimeError("CACHE_DIGEST_INVALID", "cache key is not sha256");
    const target = join(this.root, digest.slice(7, 9), digest.slice(9));
    if (!target.startsWith(`${this.root}${sep}`)) throw new BomRuntimeError("CACHE_PATH_INVALID", "cache target escapes root");
    return target;
  }

  put(expectedDigest: string, bytes: Uint8Array): void {
    if (bytes.length > this.maximumBlobBytes) throw new BomRuntimeError("CACHE_RESOURCE_LIMIT", "blob exceeds cache limit");
    if (sha256(bytes) !== expectedDigest) throw new BomRuntimeError("CACHE_DIGEST_MISMATCH", "refusing corrupt cache input");
    const target = this.path(expectedDigest);
    if (existsSync(target)) {
      const existing = readFileSync(target);
      if (timingSafeEqual(existing, Buffer.from(bytes))) return;
      throw new BomRuntimeError("CACHE_CORRUPT", "existing cache entry differs");
    }
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
    const temporary = `${target}.tmp-${process.pid}`;
    writeFileSync(temporary, bytes, { mode: 0o400, flag: "wx" });
    renameSync(temporary, target);
  }

  get(digest: string): Uint8Array {
    const target = this.path(digest);
    if (!existsSync(target) || !statSync(target).isFile()) throw new BomRuntimeError("CACHE_MISS", "content is not cached");
    const bytes = readFileSync(target);
    if (bytes.length > this.maximumBlobBytes || sha256(bytes) !== digest) throw new BomRuntimeError("CACHE_CORRUPT", "cached bytes fail bounds or digest verification");
    return bytes;
  }
}
