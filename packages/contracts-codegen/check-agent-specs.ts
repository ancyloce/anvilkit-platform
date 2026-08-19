// Selected OpenAPI/AsyncAPI lint gate with closed AnvilKit reference projection.

import { Parser } from "@asyncapi/parser";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { normalizeDescriptionForTooling, type JsonObject } from "./spec-normalization.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const REDOCLY = join(import.meta.dir, "node_modules", ".bin", "redocly");
const OPENAPI = [
  "contracts/agent/openapi/agent-service.openapi.json",
  "contracts/agent/openapi/pagix-agent-integration.openapi.json",
];
const ASYNCAPI = [
  "contracts/agent/asyncapi/agent-events.asyncapi.json",
  "contracts/agent/asyncapi/pagix-domain-events.asyncapi.json",
];
const failures: string[] = [];
const directory = mkdtempSync(join(tmpdir(), "anvilkit-spec-lint-"));

function readDescription(path: string): JsonObject {
  return JSON.parse(readFileSync(join(REPO_ROOT, path), "utf8")) as JsonObject;
}

try {
  const normalizedOpenApi: string[] = [];
  for (const source of OPENAPI) {
    try {
      const output = join(directory, source.split("/").at(-1)!);
      writeFileSync(output, JSON.stringify(normalizeDescriptionForTooling(readDescription(source)), null, 2) + "\n");
      normalizedOpenApi.push(output);
    } catch (error) {
      failures.push(`${source}: ${error}`);
    }
  }
  if (normalizedOpenApi.length === OPENAPI.length) {
    const lint = spawnSync(REDOCLY, ["lint", ...normalizedOpenApi, "--format=json"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    if (lint.status !== 0) failures.push(`Redocly 2.46.0 failed: ${lint.stdout || lint.stderr}`);
  }

  const parser = new Parser();
  for (const source of ASYNCAPI) {
    try {
      const normalized = normalizeDescriptionForTooling(readDescription(source));
      const diagnostics = await parser.validate(normalized);
      const errors = diagnostics.filter((item) => item.severity === 0);
      if (errors.length > 0) {
        failures.push(`${source}: AsyncAPI parser 3.6.3 returned ${errors.length} errors: ${JSON.stringify(errors)}`);
      }
    } catch (error) {
      failures.push(`${source}: ${error}`);
    }
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("Selected specification lint FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  `Selected specification lint valid: ${OPENAPI.length} OpenAPI descriptions with Redocly 2.46.0, ` +
  `${ASYNCAPI.length} AsyncAPI descriptions with @asyncapi/parser 3.6.3; all immutable references resolved from verified repository bytes`,
);

