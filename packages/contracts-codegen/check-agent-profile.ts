// P0-Kernel Contract Profile and canonical lock gate (ADR-018 §5).
//
// The profile is the only machine-readable definition of the P0-Kernel
// contract scope: every logical contract, canonical source path, content
// digest, fixture coverage, required consumers, event vocabulary, and
// Event/Evidence/Delta separation. The lock binds the profile, every
// canonical source byte, the registry snapshot, the pinned generator
// identities, the generated Go/TypeScript outputs, the Agent Service intake,
// and the legacy ADR-001 export lock.
//
// --update deterministically regenerates both files; without the flag the
// on-disk files must be byte-identical to the regeneration. The scope itself
// is frozen below in EXPECTED_CONTRACTS: changing the canonical catalog is a
// deliberate coordinated refactor, never a drift.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const AGENT_ROOT = join(REPO_ROOT, "contracts", "agent");
const PROFILE_PATH = join(AGENT_ROOT, "profile", "p0-kernel-profile.json");
const LOCK_PATH = join(AGENT_ROOT, "lock", "contracts.lock.json");
const UPDATE = process.argv.includes("--update");
const failures: string[] = [];

const PUBLIC_EVENT_TYPES = [
  "run.created",
  "run.state-changed",
  "run.input-requested",
  "run.approval-requested",
  "run.artifact-available",
  "run.problem-recorded",
];

// Frozen canonical catalog (design 0003 §4 plus ADR-021 commands and the
// ADR-022 transport-neutral runtime boundary).
const EXPECTED_CONTRACTS = [
  "AgentArtifact", "AgentBudget", "AgentDefinition", "AgentEvent", "AgentEvidence",
  "AgentRun", "AgentStreamDelta", "AgentTask", "ApplyAuthorization", "ApprovalRequest",
  "CompiledContext", "ComponentPackageSpec", "ContractBom", "ContractRevocationSnapshot",
  "ContractRuntimeRequest", "ContractRuntimeResult", "ContractSignatureStatement",
  "ContractTrustRoot", "CreateAgentRunRequest", "ImageOperationPlan", "InputRequest",
  "IssueApplyAuthorizationRequest", "IssuedApplyAuthorization", "ProblemDetails",
  "ProviderContinuation", "ResolveDomainOperationRequest", "SharedPrimitives",
  "SubmitApprovalDecisionRequest", "SubmitInputResponseRequest", "TargetReference",
  "TargetSnapshot", "ToolDefinition",
  "UsageObservation", "WorkerLease", "WorkerResult",
];

// Contracts represented by a shared-primitives definition rather than a
// standalone schema file.
const EMBEDDED_CONTRACTS: Record<string, { schema: string; pointer: string }> = {
  TargetReference: { schema: "shared-primitives", pointer: "#/$defs/TargetReference" },
};

// Minimum required fixture coverage per logical contract. The original
// families keep the full five-category corpus; every other contract requires
// at least a valid, an invalid, and an adversarial fixture.
const FULL_COVERAGE = ["minimum", "full", "maximum-bound", "invalid", "adversarial"];
const FULL_COVERAGE_CONTRACTS = new Set([
  "AgentArtifact", "AgentBudget", "AgentDefinition", "AgentEvent", "AgentRun", "AgentTask",
  "ApplyAuthorization", "ApprovalRequest", "CompiledContext", "InputRequest", "ProblemDetails",
  "ProviderContinuation", "TargetSnapshot", "ToolDefinition", "UsageObservation",
  "WorkerLease", "WorkerResult",
]);
const EXTENDED_COVERAGE = ["minimum", "full", "invalid", "adversarial"];
const EXTENDED_COVERAGE_CONTRACTS = new Set([
  "AgentEvidence", "AgentStreamDelta", "CreateAgentRunRequest",
  "SubmitApprovalDecisionRequest", "ContractRuntimeRequest",
]);
const BASE_COVERAGE = ["minimum", "invalid", "adversarial"];

function digest(bytes: Uint8Array): string {
  return "sha256:" + createHash("sha256").update(bytes).digest("hex");
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function filesUnder(directory: string): string[] {
  const output: string[] = [];
  for (const name of readdirSync(directory).sort(compareUtf8)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) output.push(...filesUnder(path));
    else output.push(path);
  }
  return output;
}

type Metadata = {
  logicalId: string;
  componentName: string;
  owner: string;
  stability: string;
  identityFields: string[];
  maximumSerializedBytes: number;
  descriptions: string[];
};

// ---- canonical sources ----

const schemaDir = join(AGENT_ROOT, "schemas");
const schemas = readdirSync(schemaDir)
  .filter((name) => name.endsWith(".schema.json"))
  .sort(compareUtf8)
  .map((name) => {
    const bytes = readFileSync(join(schemaDir, name));
    const parsed = JSON.parse(bytes.toString("utf8")) as { "x-anvilkit-contract": Metadata };
    return { slug: basename(name, ".schema.json"), path: "contracts/agent/schemas/" + name, bytes, metadata: parsed["x-anvilkit-contract"] };
  });
const byLogicalId = new Map(schemas.map((schema) => [schema.metadata.logicalId, schema]));

const manifestPath = join(AGENT_ROOT, "fixtures", "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  cases: Array<{ schema: { logicalId: string }; category: string }>;
};
const coverageByLogicalId = new Map<string, Set<string>>();
for (const testCase of manifest.cases) {
  const set = coverageByLogicalId.get(testCase.schema.logicalId) ?? new Set<string>();
  set.add(testCase.category);
  coverageByLogicalId.set(testCase.schema.logicalId, set);
}

// ---- build the profile ----

function requiredCoverage(logicalId: string): string[] {
  if (logicalId === "SharedPrimitives" || logicalId in EMBEDDED_CONTRACTS) return [];
  if (FULL_COVERAGE_CONTRACTS.has(logicalId)) return FULL_COVERAGE;
  if (EXTENDED_COVERAGE_CONTRACTS.has(logicalId)) return EXTENDED_COVERAGE;
  return BASE_COVERAGE;
}

const contractEntries = EXPECTED_CONTRACTS.map((logicalId) => {
  const embedded = EMBEDDED_CONTRACTS[logicalId];
  if (embedded) {
    const host = schemas.find((schema) => schema.slug === embedded.schema)!;
    return {
      logicalId,
      componentName: host.metadata.componentName + embedded.pointer.replaceAll("#/$defs/", "."),
      schemaPath: host.path,
      schemaPointer: embedded.pointer,
      digest: digest(host.bytes),
      owner: host.metadata.owner,
      stability: host.metadata.stability,
      fixtureCoverage: requiredCoverage(logicalId),
      descriptions: [] as string[],
    };
  }
  const schema = byLogicalId.get(logicalId);
  if (!schema) {
    failures.push("AK-PROFILE-001 canonical schema missing for " + logicalId);
    return undefined;
  }
  return {
    logicalId,
    componentName: schema.metadata.componentName,
    schemaPath: schema.path,
    digest: digest(schema.bytes),
    owner: schema.metadata.owner,
    stability: schema.metadata.stability,
    fixtureCoverage: requiredCoverage(logicalId),
    descriptions: schema.metadata.descriptions,
  };
}).filter((entry) => entry !== undefined);

for (const schema of schemas) {
  if (!EXPECTED_CONTRACTS.includes(schema.metadata.logicalId)) {
    failures.push("AK-PROFILE-001 schema outside the frozen catalog: " + schema.path);
  }
}
for (const [logicalId, coverage] of Object.entries(Object.fromEntries(
  contractEntries.map((entry) => [entry.logicalId, entry.fixtureCoverage]),
))) {
  const actual = coverageByLogicalId.get(logicalId) ?? new Set<string>();
  for (const category of coverage) {
    if (!actual.has(category)) failures.push("AK-PROFILE-001 " + logicalId + " lacks required " + category + " fixture coverage");
  }
}

function sourceDigest(path: string): string {
  return digest(readFileSync(join(REPO_ROOT, path)));
}

const profileDocument = {
  profileVersion: 1,
  profileId: "anvilkit-p0-kernel",
  title: "AnvilKit P0-Kernel Contract Profile",
  description: "Machine-readable P0-Kernel contract scope (ADR-018 §5). Contract identity is the canonical schema path, content digest, this profile, the canonical lock, and the repository commit. Regenerate with check-agent-profile.ts --update.",
  authority: ["ADR-016", "ADR-018", "ADR-019", "ADR-020", "ADR-021", "ADR-022"],
  consumers: { required: ["go", "typescript"], nonBlocking: ["java"], absent: ["python"] },
  eventVocabulary: PUBLIC_EVENT_TYPES,
  separation: {
    publicEvent: "AgentEvent",
    internalEvidence: "AgentEvidence",
    provisionalDelta: "AgentStreamDelta",
  },
  sources: {
    metaSchema: { path: "contracts/agent/schemas/meta/anvilkit-2020-12.schema.json", digest: sourceDigest("contracts/agent/schemas/meta/anvilkit-2020-12.schema.json") },
    sourceLintCases: { path: "contracts/agent/schemas/meta/source-lint-cases.json", digest: sourceDigest("contracts/agent/schemas/meta/source-lint-cases.json") },
    registrySet: { path: "contracts/agent/registries/registry-set.json", digest: sourceDigest("contracts/agent/registries/registry-set.json") },
    registrySetSchema: { path: "contracts/agent/registries/registry-set.schema.json", digest: sourceDigest("contracts/agent/registries/registry-set.schema.json") },
    openapi: [
      { path: "contracts/agent/openapi/agent-service.openapi.json", digest: sourceDigest("contracts/agent/openapi/agent-service.openapi.json") },
      { path: "contracts/agent/openapi/pagix-agent-integration.openapi.json", digest: sourceDigest("contracts/agent/openapi/pagix-agent-integration.openapi.json") },
    ],
    asyncapi: [
      { path: "contracts/agent/asyncapi/agent-events.asyncapi.json", digest: sourceDigest("contracts/agent/asyncapi/agent-events.asyncapi.json") },
      { path: "contracts/agent/asyncapi/pagix-domain-events.asyncapi.json", digest: sourceDigest("contracts/agent/asyncapi/pagix-domain-events.asyncapi.json") },
    ],
    fixtureManifest: { path: "contracts/agent/fixtures/manifest.json", digest: digest(readFileSync(manifestPath)) },
    fixtureManifestSchema: { path: "contracts/agent/fixtures/manifest.schema.json", digest: sourceDigest("contracts/agent/fixtures/manifest.schema.json") },
    identityCases: { path: "contracts/agent/fixtures/canonical/identity-cases.json", digest: sourceDigest("contracts/agent/fixtures/canonical/identity-cases.json") },
    strictAdmissionCases: { path: "contracts/agent/fixtures/canonical/strict-admission-cases.json", digest: sourceDigest("contracts/agent/fixtures/canonical/strict-admission-cases.json") },
    signatureCases: { path: "contracts/agent/fixtures/signing/signature-cases.json", digest: sourceDigest("contracts/agent/fixtures/signing/signature-cases.json") },
  },
  contracts: contractEntries,
  generated: {
    go: {
      output: "packages/contracts-go/generated",
      trace: "packages/contracts-go/generated/trace.json",
      consumers: ["services/agent-service/contracts/generated"],
    },
    typescript: {
      output: "packages/contracts-typescript/src/generated",
      trace: "packages/contracts-typescript/src/generated/trace.json",
    },
  },
  generatorLock: "packages/contracts-codegen/agent-generators.lock.json",
};

const profileText = JSON.stringify(profileDocument, null, 2) + "\n";

// ---- build the lock ----

function semanticRegistryDigest(): string {
  const registrySet = JSON.parse(readFileSync(join(AGENT_ROOT, "registries", "registry-set.json"), "utf8")) as {
    registrySetVersion: number;
    status: string;
    registries: Array<{ registryId: string; owner: string; entries: Array<Record<string, unknown>> }>;
  };
  const normalized = {
    registrySetVersion: registrySet.registrySetVersion,
    status: registrySet.status,
    registries: [...registrySet.registries]
      .sort((left, right) => compareUtf8(left.registryId, right.registryId))
      .map((registry) => ({
        registryId: registry.registryId,
        owner: registry.owner,
        entries: [...registry.entries]
          .sort((left, right) => compareUtf8(String(left.wireValue), String(right.wireValue)))
          .map((entry) => ({
            ...entry,
            aliases: Array.isArray(entry.aliases) ? [...(entry.aliases as string[])].sort(compareUtf8) : entry.aliases,
          })),
      })),
  };
  return digest(Buffer.from(JSON.stringify(normalized), "utf8"));
}

function buildLock(profileBytes: Buffer): string {
  const sources: Record<string, string> = {};
  for (const path of filesUnder(AGENT_ROOT)) {
    const relPath = relative(REPO_ROOT, path).replaceAll("\\", "/");
    if (relPath === "contracts/agent/lock/contracts.lock.json") continue;
    if (relPath === "contracts/agent/profile/p0-kernel-profile.json") continue;
    sources[relPath] = digest(readFileSync(path));
  }
  const generatorLock = readFileSync(join(REPO_ROOT, "packages", "contracts-codegen", "agent-generators.lock.json"));
  const generated: Record<string, { path: string; sha256: string }> = {};
  for (const [key, path] of [
    ["goTrace", "packages/contracts-go/generated/trace.json"],
    ["typescriptTrace", "packages/contracts-typescript/src/generated/trace.json"],
    ["agentServiceIntakeTrace", "services/agent-service/contracts/generated/trace.json"],
  ] as const) {
    if (!existsSync(join(REPO_ROOT, path))) {
      failures.push("AK-PROFILE-001 generated trace missing: " + path);
      continue;
    }
    generated[key] = { path, sha256: sourceDigest(path) };
  }
  const lockDocument = {
    lockVersion: 1,
    description: "Canonical Agent contract lock (ADR-018). Regenerate with check-agent-profile.ts --update after a coordinated atomic refactor; CI verifies byte equality.",
    profile: { path: "contracts/agent/profile/p0-kernel-profile.json", sha256: digest(profileBytes) },
    sources,
    registrySnapshot: {
      path: "contracts/agent/registries/registry-set.json",
      sourceSha256: sourceDigest("contracts/agent/registries/registry-set.json"),
      semanticSha256: semanticRegistryDigest(),
    },
    generators: { path: "packages/contracts-codegen/agent-generators.lock.json", sha256: digest(generatorLock) },
    generated,
    legacyExportLock: { path: "contracts/contracts.lock.json", sha256: sourceDigest("contracts/contracts.lock.json") },
  };
  return JSON.stringify(lockDocument, null, 2) + "\n";
}

const lockText = buildLock(Buffer.from(profileText, "utf8"));

const INTAKE_ROOT = join(REPO_ROOT, "services", "agent-service", "contracts");
const pinDocument = {
  pinVersion: 1,
  state: "canonical",
  profile: { path: "agent/profile/p0-kernel-profile.json", sha256: digest(Buffer.from(profileText, "utf8")) },
  lock: { path: "agent/lock/contracts.lock.json", sha256: digest(Buffer.from(lockText, "utf8")) },
  source: "anvilkit-platform contracts/agent (ADR-018 canonical cutover)",
};
const pinText = JSON.stringify(pinDocument, null, 2) + "\n";

if (UPDATE) {
  writeFileSync(PROFILE_PATH, profileText);
  writeFileSync(LOCK_PATH, lockText);
  for (const [path, text] of [
    [join(INTAKE_ROOT, "agent", "profile", "p0-kernel-profile.json"), profileText],
    [join(INTAKE_ROOT, "agent", "lock", "contracts.lock.json"), lockText],
    [join(INTAKE_ROOT, "pin.json"), pinText],
  ] as const) {
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, text);
  }
  console.log("wrote canonical profile, lock, and agent-service pin");
} else {
  if (!existsSync(PROFILE_PATH)) failures.push("AK-PROFILE-001 profile missing: run --update");
  else if (readFileSync(PROFILE_PATH, "utf8") !== profileText) failures.push("AK-PROFILE-001 profile differs from deterministic regeneration");
  if (!existsSync(LOCK_PATH)) failures.push("AK-FREEZE-001 canonical lock missing: run --update");
  else if (readFileSync(LOCK_PATH, "utf8") !== lockText) failures.push("AK-FREEZE-001 canonical lock differs from canonical bytes");
  for (const [path, text, label] of [
    [join(INTAKE_ROOT, "agent", "profile", "p0-kernel-profile.json"), profileText, "profile copy"],
    [join(INTAKE_ROOT, "agent", "lock", "contracts.lock.json"), lockText, "lock copy"],
    [join(INTAKE_ROOT, "pin.json"), pinText, "pin"],
  ] as const) {
    if (!existsSync(path)) failures.push("AK-PROFILE-001 agent-service " + label + " missing: run --update");
    else if (readFileSync(path, "utf8") !== text) failures.push("AK-PROFILE-001 agent-service " + label + " differs from canonical bytes");
  }
}

// intake byte-identity: agent-service must consume the exact generated bytes
{
  const pairs: Array<[string, string]> = [
    ["packages/contracts-go/generated/trace.json", "services/agent-service/contracts/generated/trace.json"],
    ["packages/contracts-go/generated/schema/contracts.gen.go", "services/agent-service/contracts/generated/schema/contracts.gen.go"],
    ["packages/contracts-go/generated/agentclient/client.gen.go", "services/agent-service/contracts/generated/agentclient/client.gen.go"],
    ["packages/contracts-go/generated/pagixclient/client.gen.go", "services/agent-service/contracts/generated/pagixclient/client.gen.go"],
    ["packages/contracts-go/validator/validator.go", "services/agent-service/contracts/validator/validator.go"],
  ];
  for (const [source, copy] of pairs) {
    if (!existsSync(join(REPO_ROOT, copy))) {
      failures.push("AK-PROFILE-001 agent-service intake missing: " + copy);
      continue;
    }
    if (!readFileSync(join(REPO_ROOT, source)).equals(readFileSync(join(REPO_ROOT, copy)))) {
      failures.push("AK-PROFILE-001 agent-service intake differs from canonical generation: " + copy);
    }
  }
  for (const schema of schemas) {
    const copy = join(REPO_ROOT, "services", "agent-service", "contracts", "agent", "schemas", basename(schema.path));
    if (!existsSync(copy) || !readFileSync(copy).equals(schema.bytes)) {
      failures.push("AK-PROFILE-001 agent-service schema intake differs: " + basename(schema.path));
    }
  }
}

if (failures.length > 0) {
  console.error("P0-Kernel profile check FAILED:");
  [...new Set(failures)].sort(compareUtf8).forEach((failure) => console.error("  " + failure));
  process.exit(1);
}

console.log(
  "P0-Kernel profile intact: " + contractEntries.length + " logical contracts, " +
  Object.keys(JSON.parse(lockText).sources).length + " locked canonical sources, Go and TypeScript consumers bound",
);
