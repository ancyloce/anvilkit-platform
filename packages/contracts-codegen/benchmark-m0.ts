// Reproducible PLAN-0003 M0 DP-008 harness and dataset materializer.
//
// --validate checks the method without running a candidate.
// --materialize <dir> writes exact representative bytes for adapter development.
// --run invokes an already-installed absolute adapter path. It does not install,
// download, or select any candidate.

import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const DP008_DIR = join(REPO_ROOT, "contracts", "governance", "m0", "dp008");

type DatasetCase = {
  id: string;
  category: string;
  expectedParse: string;
  expectedValid: boolean | null;
  encoding: "utf8" | "hex" | "generated";
  data?: string;
  generator?: { kind: string; targetBytes: number; id: string };
};

const plan = JSON.parse(readFileSync(join(DP008_DIR, "benchmark-plan.json"), "utf8")) as {
  operations: string[];
  requiredMeasurements: string[];
  requiredAssessments: string[];
  controlledVariables: {
    warmupIterations: number;
    sampleIterations: number;
    repetitions: number;
  };
};
const datasetSource = readFileSync(join(DP008_DIR, "dataset-plan.json"));
const datasetPlan = JSON.parse(datasetSource.toString("utf8")) as {
  representativeSchema: string;
  cases: DatasetCase[];
};
const representativeSchemaPath = join(DP008_DIR, datasetPlan.representativeSchema);
const representativeSchemaSource = readFileSync(representativeSchemaPath);

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function materializedBytes(testCase: DatasetCase): Uint8Array {
  if (testCase.encoding === "utf8") return Buffer.from(testCase.data ?? "", "utf8");
  if (testCase.encoding === "hex") return Buffer.from(testCase.data ?? "", "hex");
  const generator = testCase.generator;
  if (!generator || generator.kind !== "padded-json-object") {
    throw new Error(`unsupported generator for ${testCase.id}`);
  }
  const prefix = Buffer.from(`{"value":"`, "utf8");
  const suffix = Buffer.from(
    `","id":"${generator.id}","occurredAt":"2026-08-09T00:00:00.000Z"}\n`,
    "utf8",
  );
  const paddingBytes = generator.targetBytes - prefix.length - suffix.length;
  if (paddingBytes < 0) throw new Error(`target too small for ${testCase.id}`);
  const result = Buffer.concat([prefix, Buffer.alloc(paddingBytes, "x"), suffix]);
  if (result.length !== generator.targetBytes) throw new Error(`materialization size mismatch for ${testCase.id}`);
  return result;
}

function materialize(directory: string): Array<{ testCase: DatasetCase; path: string; sha256: string; size: number }> {
  mkdirSync(directory, { recursive: true });
  return datasetPlan.cases.map((testCase) => {
    const bytes = materializedBytes(testCase);
    const path = join(directory, `${testCase.id}.json`);
    writeFileSync(path, bytes);
    return {
      testCase,
      path,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length,
    };
  });
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

function validatePlan(): void {
  const categories = new Set(datasetPlan.cases.map((item) => item.category));
  for (const category of ["valid", "invalid", "adversarial", "maximum-bound"]) {
    if (!categories.has(category)) throw new Error(`dataset category missing: ${category}`);
  }
  if (new Set(datasetPlan.cases.map((item) => item.id)).size !== datasetPlan.cases.length) {
    throw new Error("duplicate dataset case ID");
  }
  for (const testCase of datasetPlan.cases) materializedBytes(testCase);
  JSON.parse(representativeSchemaSource.toString("utf8"));
  if (plan.operations.length < 9 || plan.requiredMeasurements.length < 13 || plan.requiredAssessments.length < 15) {
    throw new Error("benchmark plan does not cover the DP-008 budget");
  }
  console.log(
    `DP-008 M0 benchmark plan valid: ${datasetPlan.cases.length} cases, ` +
    `${plan.operations.length} operations, ${plan.requiredMeasurements.length} measurements, ` +
    `${plan.requiredAssessments.length} assessments; dataset plan sha256=` +
    createHash("sha256").update(datasetSource).digest("hex") +
    `; representative schema sha256=${createHash("sha256").update(representativeSchemaSource).digest("hex")}`,
  );
}

if (process.argv.includes("--validate")) {
  validatePlan();
  process.exit(0);
}

const materializeDir = arg("--materialize");
if (materializeDir && !process.argv.includes("--run")) {
  validatePlan();
  const cases = materialize(resolve(materializeDir));
  for (const item of cases) console.log(`${item.testCase.id}\t${item.size}\t${item.sha256}\t${item.path}`);
  process.exit(0);
}

if (!process.argv.includes("--run")) {
  console.error("usage: benchmark-m0.ts --validate | --materialize <dir> | --run --adapter <absolute-path> --candidate <id> --operation <operation> --output <path>");
  process.exit(4);
}

validatePlan();
const adapter = arg("--adapter");
const candidate = arg("--candidate");
const operation = arg("--operation");
const output = arg("--output");
if (!adapter || !isAbsolute(adapter) || !candidate || !operation || !output) {
  throw new Error("--run requires an absolute --adapter plus --candidate, --operation, and --output");
}
if (!plan.operations.includes(operation)) throw new Error(`operation is not governed by the plan: ${operation}`);

const temporaryDirectory = mkdtempSync(join(tmpdir(), "anvilkit-dp008-"));
try {
  const cases = materialize(temporaryDirectory);
  const results: unknown[] = [];
  const elapsedPerIteration: number[] = [];
  for (const item of cases) {
    const invoke = (iterations: number) => {
      const started = Bun.nanoseconds();
      const result = spawnSync(
        adapter,
        [
          "--operation", operation,
          "--schema", representativeSchemaPath,
          "--input", item.path,
          "--iterations", String(iterations),
        ],
        { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
      );
      const elapsed = Bun.nanoseconds() - started;
      if (result.status !== 0) {
        throw new Error(`adapter failed for ${item.testCase.id}: exit=${result.status}; ${result.stderr.trim()}`);
      }
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(result.stdout) as Record<string, unknown>;
      } catch (error) {
        throw new Error(`adapter returned invalid JSON for ${item.testCase.id}: ${error}`);
      }
      if (parsed.candidateId !== candidate) {
        throw new Error(`adapter candidateId mismatch for ${item.testCase.id}`);
      }
      if (typeof parsed.candidateVersion !== "string" || parsed.candidateVersion === "TBD") {
        throw new Error(`adapter must report an exact candidateVersion for ${item.testCase.id}`);
      }
      if (parsed.parseOutcome !== item.testCase.expectedParse) {
        throw new Error(
          `adapter parseOutcome mismatch for ${item.testCase.id}: ` +
          `expected ${item.testCase.expectedParse}, got ${parsed.parseOutcome}`,
        );
      }
      if (
        operation === "validate" &&
        item.testCase.expectedValid !== null &&
        parsed.valid !== item.testCase.expectedValid
      ) {
        throw new Error(
          `adapter validity mismatch for ${item.testCase.id}: ` +
          `expected ${item.testCase.expectedValid}, got ${parsed.valid}`,
        );
      }
      return { parsed, elapsed, iterations };
    };

    const cold = invoke(1);
    invoke(plan.controlledVariables.warmupIterations);
    const repetitions = [];
    for (let index = 0; index < plan.controlledVariables.repetitions; index++) {
      const sample = invoke(plan.controlledVariables.sampleIterations);
      elapsedPerIteration.push(sample.elapsed / sample.iterations);
      repetitions.push({ elapsedNanoseconds: sample.elapsed, iterations: sample.iterations, native: sample.parsed });
    }
    results.push({
      caseId: item.testCase.id,
      category: item.testCase.category,
      inputSha256: item.sha256,
      inputBytes: item.size,
      expectedParse: item.testCase.expectedParse,
      expectedValid: item.testCase.expectedValid,
      coldStartNanoseconds: cold.elapsed,
      coldResult: cold.parsed,
      repetitions,
    });
  }
  const evidence = {
    recordVersion: 1,
    status: "measurement-unreviewed",
    candidateId: candidate,
    operation,
    adapter,
    datasetPlanSha256: createHash("sha256").update(datasetSource).digest("hex"),
    representativeSchemaSha256: createHash("sha256")
      .update(representativeSchemaSource)
      .digest("hex"),
    p50LatencyNanoseconds: percentile(elapsedPerIteration, 0.5),
    p95LatencyNanoseconds: percentile(elapsedPerIteration, 0.95),
    cases: results,
    missingReviewEvidence: plan.requiredAssessments,
    note: "This raw harness output is not an approval or version pin. Native CPU/memory/I/O, concurrency, dependency, supply-chain, and reviewer evidence must be merged before DP-008 acceptance."
  };
  writeFileSync(resolve(output), JSON.stringify(evidence, null, 2) + "\n");
  console.log(`wrote unreviewed measurement evidence to ${resolve(output)}`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
