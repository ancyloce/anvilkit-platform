#!/usr/bin/env bun
// DP-008 adapter for the pinned TypeScript Ajv validator candidate.

import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { admitStrictJson } from "./strict-json.ts";

function arg(name: string): string { const index = process.argv.indexOf(name); if (index < 0 || !process.argv[index + 1]) { console.error(`missing ${name}`); process.exit(4); } return process.argv[index + 1]; }
const operation = arg("--operation");
if (operation !== "validate") process.exit(2);
const iterations = Number.parseInt(arg("--iterations"), 10);
if (!Number.isSafeInteger(iterations) || iterations < 1) process.exit(4);
const schema = JSON.parse(readFileSync(arg("--schema"), "utf8"));
const input = readFileSync(arg("--input"));
const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: true });
addFormats(ajv);
const validate = ajv.compile(schema);
let parseOutcome: "accepted" | "rejected" = "accepted";
let valid = false;
let orderedFindings: Array<{ code: string; instancePath: string; schemaPath: string }> = [];
const before = process.resourceUsage();
for (let index = 0; index < iterations; index++) {
  try {
    const value = admitStrictJson(input).value;
    valid = Boolean(validate(value));
    orderedFindings = (validate.errors ?? []).map((error) => ({ code: "VALIDATION_FAILED", instancePath: error.instancePath || "/", schemaPath: error.schemaPath })).sort((a, b) => a.code.localeCompare(b.code) || a.instancePath.localeCompare(b.instancePath) || a.schemaPath.localeCompare(b.schemaPath));
  } catch {
    parseOutcome = "rejected"; valid = false;
    orderedFindings = [{ code: "PARSE_REJECTED", instancePath: "/", schemaPath: "/profile/strictAdmission" }];
  }
}
const after = process.resourceUsage();
console.log(JSON.stringify({ candidateId: "typescript-json-schema-validator", candidateVersion: "8.20.0", operation, iterations, parseOutcome, valid, orderedFindings, nativeMeasurements: { userCpuMicroseconds: after.userCPUTime - before.userCPUTime, systemCpuMicroseconds: after.systemCPUTime - before.systemCPUTime, maximumResidentSetKilobytes: after.maxRSS } }));
