// Structural Contract BOM graph rules from PLAN-0003 M5-T01.
//
// This module deliberately does not calculate ContractBomIdentityV1. M3 has
// not yet supplied the approved canonicalization/identity implementation.

export type BomDependency = {
  kind: string;
  name: string;
  version: string;
  digest: string;
};

export type BomComponent = BomDependency & {
  mediaType: string;
  size: number;
  dependencies: BomDependency[];
  issuer: string;
  provenanceDigest: string;
};

export type ContractBom = {
  apiVersion: string;
  kind: string;
  name: string;
  version: string;
  digest: string;
  createdAt: string;
  issuer: string;
  compatibility: {
    minimumConsumerGeneration: number;
    maximumConsumerGeneration: number;
  };
  components: BomComponent[];
  generatorSetDigest: string;
  fixtureManifestDigest: string;
  registrySetDigest: string;
  releaseEvidenceDigest: string;
};

export type ContractBomReference = {
  repository: string;
  bomDigest: string;
  ociManifestDigest: string;
  evidenceManifestDigest: string;
};

export type BomFindingCode =
  | "BOM_SHAPE_INVALID"
  | "BOM_COMPONENT_UNSORTED"
  | "BOM_COMPONENT_DUPLICATE"
  | "BOM_COMPONENT_CONFLICT"
  | "BOM_DEPENDENCY_MISSING"
  | "BOM_DEPENDENCY_CYCLE"
  | "BOM_DEPENDENCY_UNSORTED"
  | "BOM_MUTABLE_SELECTOR"
  | "BOM_REFERENCE_INCOMPLETE";

export type BomFinding = {
  code: BomFindingCode;
  path: string;
  message: string;
};

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const SEMVER = /^[1-9][0-9]*\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/;
const COMPONENT_NAME = /^anvilkit\.[a-z0-9][a-z0-9.-]*\.v[1-9][0-9]*$/;
const ROOT_NAME = /^[a-z0-9][a-z0-9.-]*$/;
const MEDIA_TYPE = /^[a-z0-9][a-z0-9.+-]*\/[a-z0-9][a-z0-9.+-]*$/;
const ISSUER = /^urn:anvilkit:issuer:[a-z0-9][a-z0-9:-]*$/;
const TIMESTAMP = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;
const REPOSITORY = /^[a-z0-9][a-z0-9.-]*(?::[1-9][0-9]{0,4})?\/[a-z0-9][a-z0-9._/-]*$/;
const MUTABLE = /(?:^|[.@:/-])(latest|current|main|stable|head)(?:$|[.@:/-])/i;
const COMPONENT_KINDS = new Set([
  "asyncapi", "declarative-bundle", "fixture-manifest", "generated-binding",
  "generator-set", "json-schema", "openapi", "registry-set", "release-evidence",
]);

function compareAscii(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "ascii"), Buffer.from(right, "ascii"));
}

function tuple(component: BomDependency): string {
  return `${component.kind}\0${component.name}\0${component.version}`;
}

function identity(component: BomDependency): string {
  return `${tuple(component)}\0${component.digest}`;
}

export function compareComponents(left: BomDependency, right: BomDependency): number {
  return compareAscii(left.kind, right.kind) ||
    compareAscii(left.name, right.name) ||
    compareAscii(left.version, right.version) ||
    compareAscii(left.digest, right.digest);
}

function finding(code: BomFindingCode, path: string, message: string): BomFinding {
  return { code, path, message };
}

function validateDependencyShape(value: BomDependency, path: string, findings: BomFinding[]): void {
  if (!value || typeof value !== "object") {
    findings.push(finding("BOM_SHAPE_INVALID", path, "dependency must be an object"));
    return;
  }
  if (typeof value.kind !== "string" || !COMPONENT_KINDS.has(value.kind) || typeof value.name !== "string" ||
      typeof value.version !== "string" || typeof value.digest !== "string" ||
      !COMPONENT_NAME.test(value.name) || !SEMVER.test(value.version) || !DIGEST.test(value.digest)) {
    findings.push(finding("BOM_SHAPE_INVALID", path, "dependency requires exact kind, governed name, semantic version, and digest"));
  }
  if (MUTABLE.test(value.name) || MUTABLE.test(value.version)) {
    findings.push(finding("BOM_MUTABLE_SELECTOR", path, "mutable component selectors are forbidden"));
  }
}

function validateRootShape(bom: ContractBom, findings: BomFinding[]): boolean {
  if (!bom || typeof bom !== "object" || bom.apiVersion !== "anvilkit.io/contracts/v1" ||
      bom.kind !== "ContractBom" || typeof bom.name !== "string" || !ROOT_NAME.test(bom.name) || !SEMVER.test(bom.version) ||
      !DIGEST.test(bom.digest) || !DIGEST.test(bom.generatorSetDigest) ||
      !DIGEST.test(bom.fixtureManifestDigest) || !DIGEST.test(bom.registrySetDigest) ||
      !DIGEST.test(bom.releaseEvidenceDigest) || typeof bom.createdAt !== "string" || !TIMESTAMP.test(bom.createdAt) ||
      typeof bom.issuer !== "string" || !ISSUER.test(bom.issuer) || !Array.isArray(bom.components) ||
      bom.components.length < 1 || bom.components.length > 4096) {
    findings.push(finding("BOM_SHAPE_INVALID", "/", "root BOM shape or immutable digest fields are invalid"));
    return false;
  }
  if (!bom.compatibility || !Number.isInteger(bom.compatibility.minimumConsumerGeneration) ||
      !Number.isInteger(bom.compatibility.maximumConsumerGeneration) ||
      bom.compatibility.minimumConsumerGeneration < 1 ||
      bom.compatibility.maximumConsumerGeneration < bom.compatibility.minimumConsumerGeneration) {
    findings.push(finding("BOM_SHAPE_INVALID", "/compatibility", "consumer generation range is invalid"));
  }
  if (MUTABLE.test(bom.name) || MUTABLE.test(bom.version)) {
    findings.push(finding("BOM_MUTABLE_SELECTOR", "/version", "mutable BOM selectors are forbidden"));
  }
  return true;
}

export function validateBomGraph(bom: ContractBom): BomFinding[] {
  const findings: BomFinding[] = [];
  if (!validateRootShape(bom, findings)) return findings;

  const byIdentity = new Map<string, BomComponent>();
  const digestByTuple = new Map<string, string>();
  for (let index = 0; index < bom.components.length; index += 1) {
    const component = bom.components[index];
    const path = `/components/${index}`;
    validateDependencyShape(component, path, findings);
    if (!Array.isArray(component.dependencies) || component.dependencies.length > 256 ||
        !Number.isInteger(component.size) || component.size < 1 || component.size > 1_073_741_824 ||
        typeof component.mediaType !== "string" || !MEDIA_TYPE.test(component.mediaType) ||
        typeof component.issuer !== "string" || !ISSUER.test(component.issuer) ||
        !DIGEST.test(component.provenanceDigest)) {
      findings.push(finding("BOM_SHAPE_INVALID", path, "component metadata is incomplete or invalid"));
      continue;
    }
    if (index > 0 && compareComponents(bom.components[index - 1], component) > 0) {
      findings.push(finding("BOM_COMPONENT_UNSORTED", path, "components must be strictly sorted by kind, name, version, and digest"));
    }
    const key = tuple(component);
    const previousDigest = digestByTuple.get(key);
    if (previousDigest === component.digest) {
      findings.push(finding("BOM_COMPONENT_DUPLICATE", path, "component identity is duplicated"));
    } else if (previousDigest !== undefined) {
      findings.push(finding("BOM_COMPONENT_CONFLICT", path, "logical component tuple has conflicting digests"));
    } else {
      digestByTuple.set(key, component.digest);
    }
    byIdentity.set(identity(component), component);
    for (let dependencyIndex = 0; dependencyIndex < component.dependencies.length; dependencyIndex += 1) {
      const dependency = component.dependencies[dependencyIndex];
      validateDependencyShape(dependency, `${path}/dependencies/${dependencyIndex}`, findings);
      if (dependencyIndex > 0 && compareComponents(component.dependencies[dependencyIndex - 1], dependency) > 0) {
        findings.push(finding("BOM_DEPENDENCY_UNSORTED", `${path}/dependencies/${dependencyIndex}`, "dependencies must be strictly sorted"));
      }
    }
  }

  for (let index = 0; index < bom.components.length; index += 1) {
    for (let dependencyIndex = 0; dependencyIndex < bom.components[index].dependencies.length; dependencyIndex += 1) {
      const dependency = bom.components[index].dependencies[dependencyIndex];
      if (!byIdentity.has(identity(dependency))) {
        findings.push(finding(
          "BOM_DEPENDENCY_MISSING",
          `/components/${index}/dependencies/${dependencyIndex}`,
          "exact dependency is absent from the closed root graph",
        ));
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (component: BomComponent, path: string): void => {
    const key = identity(component);
    if (visiting.has(key)) {
      findings.push(finding("BOM_DEPENDENCY_CYCLE", path, "dependency graph contains an unapproved cycle"));
      return;
    }
    if (visited.has(key)) return;
    visiting.add(key);
    for (let index = 0; index < component.dependencies.length; index += 1) {
      const target = byIdentity.get(identity(component.dependencies[index]));
      if (target) visit(target, `${path}/dependencies/${index}`);
    }
    visiting.delete(key);
    visited.add(key);
  };
  bom.components.forEach((component, index) => visit(component, `/components/${index}`));

  return findings.sort((left, right) => compareAscii(left.code, right.code) || compareAscii(left.path, right.path));
}

export function validateBomReference(reference: ContractBomReference): BomFinding[] {
  if (!reference || typeof reference !== "object" ||
      typeof reference.repository !== "string" || !REPOSITORY.test(reference.repository) ||
      !DIGEST.test(reference.bomDigest) || !DIGEST.test(reference.ociManifestDigest) ||
      !DIGEST.test(reference.evidenceManifestDigest)) {
    return [finding(
      "BOM_REFERENCE_INCOMPLETE",
      "/",
      "reference requires repository plus semantic BOM, OCI manifest, and evidence manifest digests",
    )];
  }
  return [];
}
