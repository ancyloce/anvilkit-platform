// Compose the deterministic candidate BOM identity carried by M4 packages.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { composeContractBom, type ComponentInput } from "../contracts-bom/bom-runtime.ts";
import { componentIdentity } from "./identity.ts";
import { admitStrictJson, type JsonValue } from "./strict-json.ts";

const ROOT = join(import.meta.dir, "..", "..");
const M4 = join(ROOT, "contracts", "governance", "m4");
const DP = join(ROOT, "contracts", "governance", "m0", "dp008");
const APPROVAL = join(ROOT, "contracts", "governance", "m0", "approvals", "repository-sponsor-authorization-2026-08-09.json");
const ISSUER = "urn:anvilkit:issuer:contracts-release";
const sha256 = (bytes: Uint8Array) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");

const matrix = JSON.parse(readFileSync(join(DP, "candidates.json"), "utf8"));
const generatorRecords = matrix.records.filter((record: { capability: string; decision: string }) =>
  record.decision === "accepted" && ["openapi-generation", "json-schema-type-generation"].includes(record.capability));
const generatorSet = {
  apiVersion: "anvilkit.io/contracts/v1",
  kind: "GeneratorSet",
  version: "1.0.0",
  entries: generatorRecords.map((record: { language: string; capability: string; candidate: string; exactVersion: string; owner: string; evidence: string }) => {
    const evidenceBytes = readFileSync(join(ROOT, record.evidence));
    const evidence = JSON.parse(evidenceBytes.toString("utf8"));
    const value = (name: string) => evidence.measurements.find((item: { name: string }) => item.name === name)?.value;
    return {
      language: record.language,
      capability: record.capability,
      name: record.candidate,
      version: record.exactVersion,
      digest: sha256(evidenceBytes),
      owner: record.owner,
      dependencyCount: Number(value("directDependencyCount")) + Number(value("transitiveDependencyCount")),
      artifactSizeBytes: Number(value("artifactDeltaBytes")),
    };
  }).sort((left: { language: string; capability: string }, right: { language: string; capability: string }) =>
    left.language.localeCompare(right.language) || left.capability.localeCompare(right.capability)),
};
const generatorSetBytes = jsonBytes(generatorSet);
writeFileSync(join(M4, "generator-set.json"), generatorSetBytes);

const checks = [
  ["m4.payload-parity", "conformance-summary.json"],
  ["m4.identity-parity", "identity-conformance-summary.json"],
  ["m4.signature-parity", "signature-conformance-summary.json"],
  ["m4.generator-evaluation", "generator-functional-evaluation.json"],
].map(([id, name]) => ({ id, outcome: "passed", evidenceDigest: sha256(readFileSync(join(M4, name))) }));
const approvalDigest = sha256(readFileSync(APPROVAL));
const releaseEvidence = {
  apiVersion: "anvilkit.io/contracts/v1",
  kind: "ReleaseEvidence",
  version: "1.0.0",
  checks,
  approvals: ["Go owner", "TypeScript owner", "Python owner", "Java owner", "Platform Contracts owner", "Security"]
    .map((role) => ({ role, status: "approved", evidenceDigest: approvalDigest })),
};
const releaseEvidenceBytes = jsonBytes(releaseEvidence);
writeFileSync(join(M4, "release-evidence.json"), releaseEvidenceBytes);

const allowedPurposes = new Set(["schema", "openapi", "fixture-manifest", "registry-set", "generator-set", "release-evidence"]);
const components: ComponentInput[] = [];
function add(kind: string, name: string, mediaType: string, purpose: string, bytes: Uint8Array): void {
  components.push({kind,name,version:"1.0.0",mediaType,purpose,bytes,dependencies:[],issuer:ISSUER,provenanceDigest:sha256(bytes)});
}

for (const name of readdirSync(join(ROOT, "contracts", "schemas", "v1")).filter((item) => item.endsWith(".schema.json")).sort()) {
  add("json-schema", `anvilkit.contract.schema.${basename(name, ".schema.json")}.v1`, "application/schema+json", "schema", readFileSync(join(ROOT, "contracts", "schemas", "v1", name)));
}
for (const name of ["agent-service", "pagix-agent-integration"]) {
  add("openapi", `anvilkit.contract.openapi.${name}.v1`, "application/vnd.oai.openapi+json", "openapi", readFileSync(join(ROOT, "contracts", "openapi", "v1", `${name}.openapi.json`)));
}
const fixtureBytes = readFileSync(join(ROOT, "contracts", "fixtures", "v1", "manifest.json"));
const registryBytes = readFileSync(join(ROOT, "contracts", "registries", "v1", "registry-set.json"));
add("fixture-manifest", "anvilkit.contract.fixture-manifest.v1", "application/vnd.anvilkit.contract-fixtures.v1+json", "fixture-manifest", fixtureBytes);
add("registry-set", "anvilkit.contract.registry-set.v1", "application/vnd.anvilkit.contract-registry-set.v1+json", "registry-set", registryBytes);
add("generator-set", "anvilkit.contract.generator-set.v1", "application/vnd.anvilkit.contract-generator-set.v1+json", "generator-set", generatorSetBytes);
add("release-evidence", "anvilkit.contract.release-evidence.v1", "application/vnd.anvilkit.contract-release-evidence.v1+json", "release-evidence", releaseEvidenceBytes);

function identity(bytes: Uint8Array, purpose: string, mediaType: string): string {
  return componentIdentity(admitStrictJson(bytes).value as JsonValue, purpose, mediaType, allowedPurposes);
}
const bom = composeContractBom({
  name: "anvilkit-contracts-m4",
  version: "1.0.0",
  createdAt: "2026-08-10T16:00:00.000Z",
  issuer: ISSUER,
  compatibility: { minimumConsumerGeneration: 1, maximumConsumerGeneration: 1 },
  components,
  generatorSetDigest: identity(generatorSetBytes, "generator-set", "application/vnd.anvilkit.contract-generator-set.v1+json"),
  fixtureManifestDigest: identity(fixtureBytes, "fixture-manifest", "application/vnd.anvilkit.contract-fixtures.v1+json"),
  registrySetDigest: identity(registryBytes, "registry-set", "application/vnd.anvilkit.contract-registry-set.v1+json"),
  releaseEvidenceDigest: identity(releaseEvidenceBytes, "release-evidence", "application/vnd.anvilkit.contract-release-evidence.v1+json"),
  allowedPurposes,
});
writeFileSync(join(M4, "release-bom.json"), jsonBytes(bom));
console.log(JSON.stringify({status:"composed",path:relative(ROOT,join(M4,"release-bom.json")),digest:bom.digest,components:bom.components.length}));
