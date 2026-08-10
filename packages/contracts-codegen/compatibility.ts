// Deterministic PLAN-0003 M1 schema compatibility report command.

import { readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import {
  compareSchemas,
  compatibilityRank,
  lintSchema,
  sha256,
  stableFindings,
  type CompatibilityClassification,
  type Finding,
  type JsonObject,
} from "./m1-lib.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function allArgs(name: string): string[] {
  const values: string[] = [];
  process.argv.forEach((value, index) => {
    if (value === name && process.argv[index + 1]) values.push(process.argv[index + 1]);
  });
  return values;
}

function major(schema: JsonObject): number | undefined {
  const metadata = schema["x-anvilkit-contract"];
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  const version = metadata.semanticVersion;
  if (typeof version !== "string") return undefined;
  const parsed = Number(version.split(".")[0]);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function governanceFinding(code: string, message: string): Finding {
  return {
    code,
    severity: "error",
    instancePath: "/classification",
    schemaPath: "/compatibilityGovernance",
    message,
    retryability: "never",
  };
}

const previousArg = arg("--previous");
const candidateArg = arg("--candidate");
if (!previousArg || !candidateArg) {
  console.error("usage: compatibility.ts --previous <schema> --candidate <schema> [--claimed <classification>] [--consumer-evidence <path>]... [--output <report.json>]");
  process.exit(2);
}
const previousPath = resolve(previousArg);
const candidatePath = resolve(candidateArg);
const previousBytes = readFileSync(previousPath);
const candidateBytes = readFileSync(candidatePath);
const previous = JSON.parse(previousBytes.toString("utf8")) as JsonObject;
const candidate = JSON.parse(candidateBytes.toString("utf8")) as JsonObject;
const analysis = compareSchemas(previous, candidate);
const consumerEvidence = allArgs("--consumer-evidence").sort();
const findings = [...lintSchema(candidate)];
const claimed = arg("--claimed") as CompatibilityClassification | undefined;
if (claimed && compatibilityRank(claimed) < compatibilityRank(analysis.classification)) {
  findings.push(governanceFinding("AK-COMPAT-001", `claimed ${claimed} is less severe than computed ${analysis.classification}`));
}
if (analysis.classification === "breaking" && major(previous) === major(candidate)) {
  findings.push(governanceFinding("AK-COMPAT-002", "breaking change requires a new semantic major version"));
}
if (analysis.classification === "behaviorally-narrowing" && consumerEvidence.length === 0) {
  findings.push(governanceFinding("AK-COMPAT-003", "behaviorally narrowing change requires explicit all-consumer evidence"));
}
const report = {
  reportVersion: 1,
  previousSource: relative(REPO_ROOT, previousPath),
  candidateSource: relative(REPO_ROOT, candidatePath),
  previousDigest: sha256(previousBytes),
  candidateDigest: sha256(candidateBytes),
  classification: analysis.classification,
  changes: analysis.changes,
  findings: stableFindings(findings),
  consumerEvidence,
};
const serialized = JSON.stringify(report, null, 2) + "\n";
const output = arg("--output");
if (output) writeFileSync(resolve(output), serialized);
else process.stdout.write(serialized);
if (report.findings.length > 0) process.exit(1);
