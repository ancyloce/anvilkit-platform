// PLAN-0003 M4 foundation gate.
//
// This checks the unblocked M4-T01 modular pipeline and explicitly verifies
// that unsupported source vocabulary fails. Native four-language packages,
// parity, and freeze remain blocked on approved DP-008 versions and M3.

import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { assertFixtureInvalid, assertFixtureValid } from "./fixture-execution.ts";
import { emitGoStruct } from "./go-generation.ts";
import type { Schema } from "./json-model.ts";
import { normalizeObject } from "./normalized-model.ts";
import { assertSupportedSchema } from "./source-validation.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const failures: string[] = [];

function expectFailure(label: string, action: () => void, pattern: RegExp): void {
  try {
    action();
    failures.push(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (!pattern.test(String(error))) failures.push(`${label}: unexpected error ${String(error)}`);
  }
}

const stages = [
  "json-model.ts",
  "source-validation.ts",
  "fixture-execution.ts",
  "normalized-model.ts",
  "go-generation.ts",
];
for (const stage of stages) {
  if (!existsSync(join(import.meta.dir, stage))) failures.push(`missing M4-T01 stage ${stage}`);
}

const representative: Schema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: { type: "string", minLength: 1 },
    count: { type: "integer", minimum: 0 },
  },
};

assertSupportedSchema(representative, "representative");
expectFailure(
  "unknown root keyword",
  () => assertSupportedSchema({ ...representative, unevaluatedProperties: false }, "unknown-root"),
  /unknown-root\/unevaluatedProperties: unsupported JSON Schema keyword/,
);
expectFailure(
  "unknown nested keyword",
  () => assertSupportedSchema({ type: "object", properties: { id: { type: "string", maxLength: 10 } } }, "unknown-nested"),
  /unknown-nested\/properties\/id\/maxLength: unsupported JSON Schema keyword/,
);
expectFailure(
  "unknown format",
  () => assertSupportedSchema({ type: "string", format: "email" }, "unknown-format"),
  /unknown-format\/format: unsupported JSON Schema format email/,
);

assertFixtureValid(representative, { id: "run-1", count: 0 }, representative, "valid");
assertFixtureInvalid(representative, { id: "" }, representative, "invalid");

const normalized = normalizeObject("Example", "is deterministic.", representative);
if (JSON.stringify(normalized.fields.map((field) => [field.wireName, field.required])) !== JSON.stringify([["id", true], ["count", false]])) {
  failures.push("normalized model did not preserve declared field order and requiredness");
}
const emitted = emitGoStruct("Example", "is deterministic.", representative, {}, () => "never");
for (const expected of ["type Example struct", "ID string `json:\"id\"`", "Count int64 `json:\"count,omitempty\"`"]) {
  if (!emitted.includes(expected)) failures.push(`Go emitter missing ${expected}`);
}

const candidatesPath = join(REPO_ROOT, "contracts", "governance", "m0", "dp008", "candidates.json");
const candidates = JSON.parse(readFileSync(candidatesPath, "utf8")) as {
  records: Array<{ language: string; capability: string; exactVersion: string; decision: string; evidence?: string }>;
};
for (const language of ["go", "typescript", "python", "java"]) {
  const records = candidates.records.filter((record) => record.language === language &&
    ["json-schema-validation", "openapi-generation", "json-schema-type-generation"].includes(record.capability));
  if (records.length === 0) failures.push(`${language}: DP-008 generator/validator candidates missing`);
  for (const record of records) {
    const pending = record.exactVersion === "TBD" && record.decision === "pending-evidence";
    const approved = record.exactVersion !== "TBD" && record.decision === "accepted" && Boolean(record.evidence);
    if (!pending && !approved) failures.push(`${language}: inconsistent DP-008 candidate state`);
  }
}

const governancePath = join(REPO_ROOT, "contracts", "governance", "m4", "status.json");
if (!existsSync(governancePath)) failures.push(`missing ${relative(REPO_ROOT, governancePath)}`);

if (failures.length > 0) {
  console.error("M4 foundation FAILED:");
  failures.sort().forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  "M4-T01 foundation valid: explicit source-validation, fixture-execution, normalized-model, and Go generation stages; " +
  "unknown keywords fail; exact DP-008 decisions are enforced when promoted",
);
