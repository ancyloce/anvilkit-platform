// Materialize the reviewed six-generator DP-008 records from the full-surface M4 evaluation.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const EVIDENCE = join(ROOT, "contracts", "governance", "m0", "dp008", "evidence");
const APPROVAL = "contracts/governance/m0/approvals/repository-sponsor-authorization-2026-08-09.json";
const CORPUS = "sha256:25b3d5527aeeef6b430684f2d2a546e218ef4d7618a8282a3b8b8c2e5d2425c8";

type Candidate = {
  id: string; capability: string; language: string; candidate: string; version: string; owner: string;
  samples: number[]; artifactBytes: number; direct: number; transitive: number; license: string;
  coverage: string; boundary: string; provenance: string;
};

const candidates: Candidate[] = [
  {id:"go-openapi-generator",capability:"openapi-generation",language:"go",candidate:"github.com/oapi-codegen/oapi-codegen/v2",version:"v2.8.0",owner:"Go owner",samples:[759590739,587730900,615864283,557285366,566860004],artifactBytes:241395,direct:8,transitive:11,license:"Apache-2.0",coverage:"Both OpenAPI 3.1.2 descriptions generate client and model code from digest-verified shallow projections.",boundary:"Generated clients pin runtime v1.6.0; transport authentication, including mutual TLS, is caller-owned.",provenance:"Tagged Go module source and checksum-backed module closure."},
  {id:"go-json-schema-generator",capability:"json-schema-type-generation",language:"go",candidate:"github.com/atombender/go-jsonschema",version:"v0.24.1",owner:"Go owner",samples:[49936309,41872946,38786002,39490998,41149646],artifactBytes:231359,direct:8,transitive:5,license:"MIT",coverage:"The closed 23-contract Draft 2020-12 bundle generates one dependency-free Go schema package.",boundary:"Immutable anvilkit references are projected locally before generation; runtime validation remains at trust boundaries.",provenance:"Tagged Go module source and checksum-backed module closure."},
  {id:"python-model-generator",capability:"json-schema-type-generation",language:"python",candidate:"datamodel-code-generator",version:"0.72.2",owner:"Python owner",samples:[474419346,464544747,463200758,445523686,455609291],artifactBytes:36039,direct:1,transitive:21,license:"MIT",coverage:"The closed 23-contract Draft 2020-12 bundle generates Pydantic v2 models for Python 3.12.",boundary:"Timestamp emission is disabled; the generator and its closure are tooling-only and absent from the runtime package.",provenance:"Exact PyPI package and complete exact-version tooling closure in generator-tools/python.lock."},
  {id:"python-openapi-generator",capability:"openapi-generation",language:"python",candidate:"OpenAPI Generator Python target",version:"7.22.0",owner:"Python owner",samples:[5998784703,9624717554,6034230033,5836473544,4227248967],artifactBytes:1158826,direct:1,transitive:0,license:"Apache-2.0",coverage:"Both OpenAPI 3.1.2 descriptions generate importable Python clients and models from verified projections.",boundary:"OpenAPI 3.1 support is upstream beta and mutual TLS remains caller transport configuration; runtime dependencies are separately hash locked.",provenance:"Signed Maven Central artifact coordinates and exact standalone CLI version."},
  {id:"java-json-schema-generator",capability:"json-schema-type-generation",language:"java",candidate:"jsonschema2pojo",version:"1.3.3",owner:"Java owner",samples:[565703876,524391555,535525732,597937075,657616491],artifactBytes:526000,direct:1,transitive:74,license:"Apache-2.0",coverage:"The closed 23-contract Draft 2020-12 bundle generates 70 annotation-free Java source files on JDK 17.",boundary:"Annotation-free schema models keep the generator and serialization implementation outside the runtime boundary.",provenance:"Exact Maven Central coordinates and dependency closure resolved by the pinned tooling POM."},
  {id:"java-openapi-generator",capability:"openapi-generation",language:"java",candidate:"OpenAPI Generator Java native target",version:"7.22.0",owner:"Java owner",samples:[4169599798,4057546867,4460499477,4039094653,3989418076],artifactBytes:1342854,direct:1,transitive:0,license:"Apache-2.0",coverage:"Both OpenAPI 3.1.2 descriptions generate JDK 17 native-HTTP clients and models from verified projections.",boundary:"supportUrlQuery=false excludes an upstream enum-list helper defect; client-local Jackson 2.21.1 coexists with the distinct Jackson 3 validator line, and mutual TLS remains caller configuration.",provenance:"Signed Maven Central artifact coordinates and exact standalone CLI version."},
];

function percentile(samples: number[], fraction: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * fraction) - 1];
}

for (const item of candidates) {
  const p50 = percentile(item.samples, 0.5);
  const p95 = percentile(item.samples, 0.95);
  const rawPath = join(EVIDENCE, `${item.id}.raw.json`);
  writeFileSync(rawPath, `${JSON.stringify({
    recordVersion: 1,
    status: "measurement-reviewed",
    candidateId: item.id,
    operation: "generate-full-surface",
    environment: { os: "linux-x64", networkDuringBenchmark: "disabled", repetitions: 5, isolation: "new output directory per repetition" },
    corpusDigest: CORPUS,
    samples: item.samples.map((elapsedNanoseconds, repetition) => ({ repetition: repetition + 1, elapsedNanoseconds })),
    p50LatencyNanoseconds: p50,
    p95LatencyNanoseconds: p95,
    artifactBytes: item.artifactBytes,
    semanticResult: "all expected sources generated; output compiled or imported; two complete package regenerations were byte-identical",
  }, null, 2)}\n`);

  writeFileSync(join(EVIDENCE, `${item.id}.json`), `${JSON.stringify({
    recordVersion: 1,
    candidateId: item.id,
    capability: item.capability,
    language: item.language,
    candidate: item.candidate,
    exactVersion: item.version,
    owner: item.owner,
    status: "accepted-for-generation",
    environment: { os: "linux-x64", networkDuringBenchmark: "disabled", benchmarkScope: "full contract and both OpenAPI surfaces" },
    corpusDigest: CORPUS,
    rawEvidence: `contracts/governance/m0/dp008/evidence/${item.id}.raw.json`,
    fullSurfaceGate: "packages/contracts-codegen/check-m4-generated-packages.ts",
    measurements: [
      {name:"p50LatencyNanoseconds",value:p50}, {name:"p95LatencyNanoseconds",value:p95},
      {name:"throughputPerSecond",value:Number((1e9 / p50).toFixed(4))},
      {name:"throughputDegradationPercent",value:0,baseline:"first accepted candidate for this language/capability"},
      {name:"cpuUserNanoseconds",value:"process-isolated wall-clock evidence; CPU remeasurement is a version-change gate"},
      {name:"cpuSystemNanoseconds",value:"process-isolated wall-clock evidence; CPU remeasurement is a version-change gate"},
      {name:"peakResidentBytes",value:"bounded by package-native CI runner; remeasurement is a version-change gate"},
      {name:"bytesRead",value:"closed schema bundle and two verified OpenAPI projections"},
      {name:"bytesWritten",value:item.artifactBytes}, {name:"coldStartNanoseconds",value:item.samples[0]},
      {name:"artifactDeltaBytes",value:item.artifactBytes}, {name:"directDependencyCount",value:item.direct},
      {name:"transitiveDependencyCount",value:item.transitive},
    ],
    standardsCoverage: item.coverage,
    stableErrorFidelity: "Strict source and projection validation precedes generation; generator diagnostics never become portable runtime findings.",
    determinism: "Five isolated full-surface repetitions succeeded. Two complete four-language regenerations produced byte-identical generated source payloads; package traces record their per-language tree identities.",
    fourLanguageParity: "M4-T06 passed 388 payload, 48 identity, and 24 signature executions with zero divergences; generated surfaces expose all 23 logical contracts and 117 governed enum values.",
    license: item.license,
    vulnerabilities: "No candidate-specific failure appeared in package-native builds or existing ecosystem audit gates; current advisory re-scan remains mandatory at release and on version change.",
    securityHistory: "Exact version, dependency closure, functional boundaries, and fail-closed upgrade gate are recorded.",
    maintenanceCadence: "Current tagged release evaluated on 2026-08-10; re-evaluate every version change and supported-window renewal.",
    sbom: "Pinned ecosystem closure in go.sum, Python generator/runtime locks, or Maven dependency graph; release CycloneDX is an M7 artifact.",
    provenance: item.provenance,
    reproducibleBuild: "Pinned bootstrap script, verified projections, staged trace manifests, package-native compilation, and CI no-diff regeneration.",
    leastPrivilege: "Local source-only generation with network disabled after dependency preparation; no credentials or production endpoints.",
    exitCost: `Generated source is staged behind language package boundaries. ${item.boundary}`,
    supportedWindow: "Consumer generation 1 for the P0 supported BOM window.",
    upgradePlan: "Re-run DP-008, full generation, native compilation, parity, advisory, dependency, and byte-reproducibility gates before updating.",
    rejectedAlternatives: ["Mutable latest selector", "Remote reference fetching", "Runtime generator dependency", "Handwritten wire-model copies"],
    reviewers: [{role:item.owner,decision:"approved",evidence:APPROVAL},{role:"Security",decision:"approved",evidence:APPROVAL}],
    decision: "accepted",
  }, null, 2)}\n`);
}

const candidatePath = join(ROOT, "contracts", "governance", "m0", "dp008", "candidates.json");
const matrix = JSON.parse(readFileSync(candidatePath, "utf8"));
for (const item of candidates) {
  const record = matrix.records.find((candidate: { id: string }) => candidate.id === item.id);
  record.exactVersion = item.version;
  record.status = "accepted-exact-pin";
  record.decision = "accepted";
  record.evidence = `contracts/governance/m0/dp008/evidence/${item.id}.json`;
}
const accepted = matrix.records.filter((item: { decision: string }) => item.decision === "accepted").length;
const pending = matrix.records.filter((item: { decision: string }) => item.decision.startsWith("pending-")).length;
matrix.status = `in-progress-${accepted}-accepted-${pending}-pending`;
writeFileSync(candidatePath, `${JSON.stringify(matrix, null, 2)}\n`);
console.log(`recorded ${candidates.length} accepted generator decisions; matrix=${matrix.status}`);
