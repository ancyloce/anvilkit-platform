// Enforces the owner-approved M0-T07 regression policy against the current P0 artifact.
// Final M8 evidence still requires the committed release candidate and approved topology.

import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const service = join(root, "services", "agent-service");
const policy = JSON.parse(readFileSync(join(root, "docs/acceptance/agent-service/m8/budget-policy.json"), "utf8"));
const m0 = JSON.parse(readFileSync(join(root, "docs/acceptance/agent-service/m0/benchmark-results.json"), "utf8"));
const m2 = JSON.parse(readFileSync(join(root, "docs/acceptance/agent-service/m2/create-benchmark-results.json"), "utf8"));
const failures: string[] = [];

if (policy.schemaVersion !== 1 || policy.policyVersion !== "agent-service-m8-budget-v1" || policy.status !== "approved-input-from-m0-t07" || policy.loadModelRevision !== "agent-service-load-model-v1" || policy.regressionRules?.postHocRelaxationAllowed !== false || policy.regressionRules?.revisionRequiresVersionedApproval !== true) {
  failures.push("M8 budget policy identity, approval, or immutable-revision rule is invalid");
}
const expected = {
  releaseBinaryBytes: Math.floor(policy.baselines.combinedCapabilityBinaryBytes * 1.1),
  dependencyComponents: Math.floor(policy.baselines.dependencyComponents * 1.1),
  startupMilliseconds: Math.floor(policy.baselines.startupMilliseconds * 1.2),
  peakRSSKiB: Math.floor(policy.baselines.peakRSSKiB * 1.2),
};
for (const [name, value] of Object.entries(expected)) {
  if (policy.limits?.[name] !== value) failures.push(`M8 ${name} limit was relaxed without a policy revision`);
}
if (policy.limits?.createP95Milliseconds !== 300 || policy.limits?.minimumPhase0ThroughputPerSecond !== 20) {
  failures.push("M8 binding create latency or throughput limit drifted from the approved load model");
}

const temporary = mkdtempSync(join(tmpdir(), "anvilkit-agent-m8-"));
try {
  const binary = join(temporary, "agent-service");
  const build = spawnSync("go", ["build", "-trimpath", "-ldflags=-s -w", "-o", binary, "./cmd/agent-service"], { cwd: service, encoding: "utf8" });
  if (build.status !== 0) {
    failures.push(`M8 release build failed: ${build.stderr.trim()}`);
  }
  const binaryBytes = build.status === 0 ? statSync(binary).size : Number.MAX_SAFE_INTEGER;

  const dependencies = spawnSync("go", ["list", "-deps", "-f", "{{with .Module}}{{.Path}}@{{.Version}}{{end}}", "./cmd/agent-service"], { cwd: service, encoding: "utf8" });
  const modules = new Set((dependencies.stdout ?? "").split(/\r?\n/).filter((value: string) => value !== "" && !value.startsWith("github.com/ancyloce/anvilkit-agent-service@")));
  if (dependencies.status !== 0) failures.push("M8 production dependency inventory failed");

  const timeOutput = join(temporary, "time.txt");
  const startupEnvironment = { ...process.env };
  for (const name of Object.keys(startupEnvironment)) {
    if (name.startsWith("ANVILKIT_") || name.startsWith("DBOS_")) delete startupEnvironment[name];
  }
  const startup = spawnSync("/usr/bin/time", ["-f", "elapsed=%e rss_kb=%M", "-o", timeOutput, binary], { cwd: service, env: startupEnvironment, encoding: "utf8" });
  const timing = readFileSync(timeOutput, "utf8").trim();
  const match = /(?:^|\n)elapsed=([0-9.]+) rss_kb=([0-9]+)$/.exec(timing);
  if (startup.status !== 1 || !match || !startup.stderr.includes("production command never embeds the in-memory proof engine")) {
    failures.push("M8 bounded startup probe did not fail closed at the expected dependency gate");
  }
  const startupMilliseconds = match ? Number(match[1]) * 1000 : Number.MAX_SAFE_INTEGER;
  const peakRSSKiB = match ? Number(match[2]) : Number.MAX_SAFE_INTEGER;

  const phase0 = m0.dbosLoad?.find((candidate: any) => candidate.phase === "phase0");
  const measurements = {
    createP95Milliseconds: m2.p95Milliseconds,
    phase0ThroughputPerSecond: phase0?.throughputPerSecond,
    startupMilliseconds,
    peakRSSKiB,
    releaseBinaryBytes: binaryBytes,
    dependencyComponents: modules.size,
  };
  if (m2.loadModelRevision !== policy.loadModelRevision || m2.passed !== true || measurements.createP95Milliseconds > policy.limits.createP95Milliseconds) failures.push("M8 create P95 input failed or drifted from the approved load model");
  if (m0.loadModel !== policy.loadModelRevision || measurements.phase0ThroughputPerSecond < policy.limits.minimumPhase0ThroughputPerSecond) failures.push("M8 Phase 0 throughput input failed");
  for (const name of ["startupMilliseconds", "peakRSSKiB", "releaseBinaryBytes", "dependencyComponents"] as const) {
    if (measurements[name] > policy.limits[name]) failures.push(`M8 ${name} budget exceeded: ${measurements[name]} > ${policy.limits[name]}`);
  }

  if (failures.length === 0) {
    console.log(JSON.stringify({ schemaVersion: 1, policyVersion: policy.policyVersion, loadModelRevision: policy.loadModelRevision, classification: "local-uncommitted-budget-precheck", finalCandidate: false, passed: true, measurements, limits: policy.limits }, null, 2));
  }
} finally {
  rmSync(temporary, { recursive: true, force: false });
}

if (failures.length > 0) {
  console.error("M8 budget check FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
