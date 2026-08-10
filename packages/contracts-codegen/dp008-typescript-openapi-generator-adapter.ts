#!/usr/bin/env bun
// DP-008 adapter for the pinned openapi-typescript generator candidate.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import { admitStrictJson } from "./strict-json.ts";

function arg(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) {
    console.error(`missing ${name}`);
    process.exit(4);
  }
  return process.argv[index + 1];
}

const operation = arg("--operation");
if (operation !== "generate") process.exit(2);
const iterations = Number.parseInt(arg("--iterations"), 10);
if (!Number.isSafeInteger(iterations) || iterations < 1) process.exit(4);

const contractSchema = JSON.parse(readFileSync(arg("--schema"), "utf8")) as Record<string, unknown>;
const input = readFileSync(arg("--input"));
const openapi = {
  openapi: "3.1.2",
  info: { title: "AnvilKit DP-008 representative", version: "1.0.0" },
  paths: {},
  components: { schemas: { Representative: contractSchema } },
} as OpenAPI3;

let parseOutcome: "accepted" | "rejected" = "accepted";
let artifact: string | undefined;
const before = process.resourceUsage();
for (let index = 0; index < iterations; index++) {
  try {
    admitStrictJson(input);
  } catch {
    parseOutcome = "rejected";
    artifact = undefined;
    continue;
  }
  const generated = astToString(await openapiTS(openapi, {
    alphabetize: true,
    immutable: true,
    silent: true,
  }));
  if (artifact !== undefined && generated !== artifact) {
    console.error("generator produced non-deterministic bytes");
    process.exit(3);
  }
  artifact = generated;
}
const after = process.resourceUsage();

console.log(JSON.stringify({
  candidateId: "typescript-openapi-generator",
  candidateVersion: "7.13.0",
  operation,
  iterations,
  parseOutcome,
  valid: parseOutcome === "accepted",
  orderedFindings: parseOutcome === "accepted" ? [] : [{
    code: "PARSE_REJECTED",
    instancePath: "/",
    schemaPath: "/profile/strictAdmission",
  }],
  artifactSha256: artifact === undefined ? null : createHash("sha256").update(artifact).digest("hex"),
  artifactBytes: artifact === undefined ? 0 : Buffer.byteLength(artifact),
  nativeMeasurements: {
    userCpuMicroseconds: after.userCPUTime - before.userCPUTime,
    systemCpuMicroseconds: after.systemCPUTime - before.systemCPUTime,
    maximumResidentSetKilobytes: after.maxRSS,
  },
}));
