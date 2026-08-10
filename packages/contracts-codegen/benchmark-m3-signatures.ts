#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function value(flag: string): string {
  const index = process.argv.indexOf(flag);
  if (index < 0 || !process.argv[index + 1]) throw new Error(`missing ${flag}`);
  return process.argv[index + 1];
}

const language = value("--language");
const candidateVersion = value("--candidate-version");
let command = JSON.parse(value("--command-json")) as string[];
if (!Array.isArray(command) || command.length === 0 || command.some((item) => typeof item !== "string")) {
  throw new Error("--command-json must be a non-empty string array");
}
const classpathIndex = process.argv.indexOf("--java-classpath-file");
if (classpathIndex >= 0) {
  const classpathFile = process.argv[classpathIndex + 1];
  if (!classpathFile) throw new Error("missing --java-classpath-file value");
  const classpath = `packages/contracts-java/target/classes:${readFileSync(classpathFile, "utf8").trim()}`;
  command = command.map((item) => item === "{java-classpath}" ? classpath : item);
}
const warmupIterations = 20;
const sampleIterations = 100;
const repetitions = 5;
const caseCount = 6;

function invoke(iterations: number) {
  const started = Bun.nanoseconds();
  const child = Bun.spawnSync({ cmd: [...command, "--iterations", String(iterations)], stdout: "pipe", stderr: "pipe" });
  const elapsedNanoseconds = Bun.nanoseconds() - started;
  if (!child.success) throw new Error(new TextDecoder().decode(child.stderr));
  const output = child.stdout;
  const parsed = JSON.parse(new TextDecoder().decode(output)) as { cases?: unknown[] };
  if (!Array.isArray(parsed.cases) || parsed.cases.length !== caseCount) throw new Error("adapter did not emit six cases");
  return {
    elapsedNanoseconds,
    outputSha256: createHash("sha256").update(output).digest("hex"),
    cpuUserNanoseconds: Number(child.resourceUsage.cpuTime.user) * 1_000,
    cpuSystemNanoseconds: Number(child.resourceUsage.cpuTime.system) * 1_000,
    peakResidentBytes: child.resourceUsage.maxRSS * 1_024,
    bytesRead: child.resourceUsage.ops.in,
    bytesWritten: child.resourceUsage.ops.out,
  };
}

const cold = invoke(1);
for (let index = 0; index < warmupIterations; index += 1) invoke(sampleIterations);
const samples = Array.from({ length: repetitions }, () => invoke(sampleIterations));
if (new Set(samples.map((item) => item.outputSha256)).size !== 1 || samples[0].outputSha256 !== cold.outputSha256) {
  throw new Error("adapter output is not deterministic");
}
const perCaseLatency = samples.map((item) => item.elapsedNanoseconds / (sampleIterations * caseCount)).sort((a, b) => a - b);
const percentile = (fraction: number) => perCaseLatency[Math.ceil(perCaseLatency.length * fraction) - 1];
const p50 = percentile(0.5);
const p95 = percentile(0.95);
console.log(JSON.stringify({
  recordVersion: 1,
  status: "measurement-reviewed",
  language,
  candidateVersion,
  operation: "verify-signature",
  command,
  controlledVariables: { warmupIterations, sampleIterations, repetitions, caseCount },
  coldStartNanoseconds: cold.elapsedNanoseconds,
  p50LatencyNanoseconds: p50,
  p95LatencyNanoseconds: p95,
  throughputPerSecond: 1_000_000_000 / p50,
  deterministicOutputSha256: `sha256:${samples[0].outputSha256}`,
  samples,
}, null, 2));
