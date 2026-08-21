// Enforces the owner-approved resource-regression policy against the current
// canonical Agent Service artifact.
// Final release evidence still requires the committed release candidate and approved topology.
//
// Its inputs are the retained local evidence ADR-023 keeps out of Git, so it is
// a local and release precheck (scripts/release-precheck.sh) rather than a step
// in ordinary hosted CI, which runs from a clean checkout of tracked content
// alone. A missing input is reported as exactly that -- never silently skipped,
// and never a reason to commit the evidence to make a hosted job pass.

import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const service = join(root, "services", "agent-service");
const readJSON = (path: string): any => {
  const absolute = join(root, path);
  if (!existsSync(absolute)) {
    console.error(`resource budget check FAILED: ${path} is missing.`);
    console.error("  This check reads the retained local evidence ADR-023 keeps out of Git.");
    console.error("  Run it from a checkout that has that evidence: bash scripts/release-precheck.sh");
    process.exit(1);
  }
  return JSON.parse(readFileSync(absolute, "utf8"));
};
const policy = readJSON("docs/acceptance/agent-service/release-entry/budget-policy.json");
const baseline = readJSON("docs/acceptance/agent-service/governance-baseline/benchmark-results.json");
const createBenchmark = readJSON("docs/acceptance/agent-service/create-latency/create-benchmark-results.json");
const failures: string[] = [];

if (policy.schemaVersion !== 1 || policy.policyVersion !== "agent-service-resource-budget-v1" || policy.status !== "approved-input-from-governance-baseline" || policy.loadModelRevision !== "agent-service-load-model-v1" || policy.regressionRules?.postHocRelaxationAllowed !== false || policy.regressionRules?.revisionRequiresVersionedApproval !== true) {
  failures.push("resource budget policy identity, approval, or immutable-revision rule is invalid");
}
const expected = {
  releaseBinaryBytes: Math.floor(policy.baselines.combinedCapabilityBinaryBytes * 1.1),
  dependencyComponents: Math.floor(policy.baselines.dependencyComponents * 1.1),
  startupMilliseconds: Math.floor(policy.baselines.startupMilliseconds * 1.2),
  peakRSSKiB: Math.floor(policy.baselines.peakRSSKiB * 1.2),
};
for (const [name, value] of Object.entries(expected)) {
  if (policy.limits?.[name] !== value) failures.push(`${name} limit was relaxed without a policy revision`);
}
if (policy.limits?.createP95Milliseconds !== 300 || policy.limits?.minimumBaselineArrivalThroughputPerSecond !== 20) {
  failures.push("binding create latency or throughput limit drifted from the approved load model");
}

const temporary = mkdtempSync(join(tmpdir(), "anvilkit-agent-resource-budget-"));
try {
  const binary = join(temporary, "agent-service");
  const build = spawnSync("go", ["build", "-trimpath", "-ldflags=-s -w", "-o", binary, "./cmd/agent-service"], { cwd: service, encoding: "utf8" });
  if (build.status !== 0) {
    failures.push(`release build failed: ${build.stderr.trim()}`);
  }
  const binaryBytes = build.status === 0 ? statSync(binary).size : Number.MAX_SAFE_INTEGER;

  const dependencies = spawnSync("go", ["list", "-deps", "-f", "{{with .Module}}{{.Path}}@{{.Version}}{{end}}", "./cmd/agent-service"], { cwd: service, encoding: "utf8" });
  const modules = new Set((dependencies.stdout ?? "").split(/\r?\n/).filter((value: string) => value !== "" && !value.startsWith("github.com/ancyloce/anvilkit-agent-service@")));
  if (dependencies.status !== 0) failures.push("production dependency inventory failed");

  const timeOutput = join(temporary, "time.txt");
  const startupEnvironment = { ...process.env };
  for (const name of Object.keys(startupEnvironment)) {
    if (name.startsWith("ANVILKIT_") || name.startsWith("DBOS_")) delete startupEnvironment[name];
  }
  const startup = spawnSync("/usr/bin/time", ["-f", "elapsed=%e rss_kb=%M", "-o", timeOutput, binary], { cwd: service, env: startupEnvironment, encoding: "utf8" });
  const timing = readFileSync(timeOutput, "utf8").trim();
  const match = /(?:^|\n)elapsed=([0-9.]+) rss_kb=([0-9]+)$/.exec(timing);
  if (startup.status !== 1 || !match || !startup.stderr.includes("production command never embeds the in-memory proof engine")) {
    failures.push("the bounded startup probe did not fail closed at the expected dependency gate");
  }
  const startupMilliseconds = match ? Number(match[1]) * 1000 : Number.MAX_SAFE_INTEGER;
  const peakRSSKiB = match ? Number(match[2]) : Number.MAX_SAFE_INTEGER;

  // The baseline arrival profile is the load model's lowest arrival rate,
  // selected by what it measures rather than by the stage label the recorded
  // benchmark happens to carry: a label bound to a delivery schedule stops
  // being true the moment the schedule moves.
  const baselineArrival = [...(baseline.dbosLoad ?? [])].sort((left: any, right: any) => left.arrivalRatePerSecond - right.arrivalRatePerSecond)[0];
  const measurements = {
    createP95Milliseconds: createBenchmark.p95Milliseconds,
    baselineArrivalThroughputPerSecond: baselineArrival?.throughputPerSecond,
    startupMilliseconds,
    peakRSSKiB,
    releaseBinaryBytes: binaryBytes,
    dependencyComponents: modules.size,
  };
  if (createBenchmark.loadModelRevision !== policy.loadModelRevision || createBenchmark.passed !== true || measurements.createP95Milliseconds > policy.limits.createP95Milliseconds) failures.push("the create P95 input failed or drifted from the approved load model");
  if (baseline.loadModel !== policy.loadModelRevision || measurements.baselineArrivalThroughputPerSecond < policy.limits.minimumBaselineArrivalThroughputPerSecond) failures.push("the baseline-arrival throughput input failed");
  for (const name of ["startupMilliseconds", "peakRSSKiB", "releaseBinaryBytes", "dependencyComponents"] as const) {
    if (measurements[name] > policy.limits[name]) failures.push(`${name} budget exceeded: ${measurements[name]} > ${policy.limits[name]}`);
  }

  if (failures.length === 0) {
    console.log(JSON.stringify({ schemaVersion: 1, policyVersion: policy.policyVersion, loadModelRevision: policy.loadModelRevision, classification: "local-uncommitted-budget-precheck", finalCandidate: false, passed: true, measurements, limits: policy.limits }, null, 2));
  }
} finally {
  rmSync(temporary, { recursive: true, force: false });
}

if (failures.length > 0) {
  console.error("resource budget check FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
