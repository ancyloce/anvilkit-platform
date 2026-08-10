#!/usr/bin/env bun
// DP-008 adapter for canonicalize 3.0.0 behind AnvilKit strict admission.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import canonicalize from "canonicalize";
import { admitStrictJson } from "./strict-json.ts";

function argument(name: string): string {
  const index = process.argv.indexOf(name);
  if (index < 0 || !process.argv[index + 1]) {
    console.error(`missing ${name}`);
    process.exit(4);
  }
  return process.argv[index + 1];
}

if (argument("--operation") !== "canonicalize") process.exit(2);
const iterations = Number.parseInt(argument("--iterations"), 10);
if (!Number.isSafeInteger(iterations) || iterations < 1) process.exit(4);
const input = readFileSync(argument("--input"));
let parseOutcome: "accepted" | "rejected" = "accepted";
let canonicalBytes: Uint8Array | undefined;
const before = process.resourceUsage();
for (let index = 0; index < iterations; index += 1) {
  try {
    const value = admitStrictJson(input).value;
    const serialized = canonicalize(value);
    if (serialized === undefined) throw new Error("canonicalizer returned no JSON value");
    canonicalBytes = Buffer.from(serialized, "utf8");
  } catch {
    parseOutcome = "rejected";
    canonicalBytes = undefined;
  }
}
const after = process.resourceUsage();
console.log(JSON.stringify({
  candidateId: "typescript-jcs-canonicalizer",
  candidateVersion: "3.0.0",
  operation: "canonicalize",
  iterations,
  parseOutcome,
  valid: null,
  orderedFindings: parseOutcome === "rejected"
    ? [{ code: "PARSE_REJECTED", instancePath: "/", schemaPath: "/profile/strictAdmission" }]
    : [],
  canonicalSha256: canonicalBytes
    ? `sha256:${createHash("sha256").update(canonicalBytes).digest("hex")}`
    : null,
  canonicalBytesBase64: canonicalBytes ? Buffer.from(canonicalBytes).toString("base64") : null,
  nativeMeasurements: {
    userCpuMicroseconds: after.userCPUTime - before.userCPUTime,
    systemCpuMicroseconds: after.systemCPUTime - before.systemCPUTime,
    maximumResidentSetKilobytes: after.maxRSS,
  },
}));
