// Full-surface deterministic generation check for PLAN-0003 M4-T03.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { compile } from "json-schema-to-typescript";
import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import { normalizeDescriptionForTooling, type JsonObject } from "./spec-normalization.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const SCHEMA_DIR = join(REPO_ROOT, "contracts", "schemas", "v1");
const OPENAPI = [
  "contracts/openapi/v1/agent-service.openapi.json",
  "contracts/openapi/v1/pagix-agent-integration.openapi.json",
];

type Metadata = { logicalId: string; semanticVersion: string };
type ProfiledSchema = JsonObject & { "x-anvilkit-contract": Metadata };
type Generated = { path: string; logicalId: string; sourceSha256: string; outputSha256: string; outputBytes: number };

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(path: string): JsonObject {
  return JSON.parse(readFileSync(join(REPO_ROOT, path), "utf8")) as JsonObject;
}

async function schemaGeneration(): Promise<Generated[]> {
  const results: Generated[] = [];
  for (const name of readdirSync(SCHEMA_DIR).filter((item) => item.endsWith(".schema.json")).sort()) {
    const path = join(SCHEMA_DIR, name);
    const sourceBytes = readFileSync(path);
    const source = JSON.parse(sourceBytes.toString("utf8")) as ProfiledSchema;
    const metadata = source["x-anvilkit-contract"];
    if (!metadata?.logicalId || !metadata.semanticVersion) throw new Error(`profile metadata missing: ${name}`);
    const normalized = normalizeDescriptionForTooling(source);
    const options = {
      additionalProperties: false,
      bannerComment: `/* AnvilKit ${metadata.logicalId}@${metadata.semanticVersion}; source-sha256:${sha256(sourceBytes)} */`,
      declareExternallyReferenced: true,
      format: false,
      strictIndexSignatures: true,
      unknownAny: true,
    } as const;
    const first = await compile(normalized, metadata.logicalId, options);
    const second = await compile(normalized, metadata.logicalId, options);
    if (first !== second) throw new Error(`json-schema-to-typescript output drift: ${name}`);
    if (/\bany\b/.test(first)) throw new Error(`unsafe any emitted: ${name}`);
    results.push({
      path: `contracts/schemas/v1/${name}`,
      logicalId: metadata.logicalId,
      sourceSha256: sha256(sourceBytes),
      outputSha256: sha256(first),
      outputBytes: Buffer.byteLength(first),
    });
  }
  return results;
}

async function openApiGeneration(): Promise<Generated[]> {
  const results: Generated[] = [];
  for (const path of OPENAPI) {
    const sourceBytes = readFileSync(join(REPO_ROOT, path));
    const normalized = normalizeDescriptionForTooling(JSON.parse(sourceBytes.toString("utf8")) as JsonObject) as OpenAPI3;
    const generate = async () => astToString(await openapiTS(normalized, {
      alphabetize: true,
      immutable: true,
      silent: true,
    }));
    const first = await generate();
    const second = await generate();
    if (first !== second) throw new Error(`openapi-typescript output drift: ${path}`);
    if (/from ["']node:/.test(first)) throw new Error(`server-only import emitted: ${path}`);
    results.push({
      path,
      logicalId: basename(path, ".openapi.json"),
      sourceSha256: sha256(sourceBytes),
      outputSha256: sha256(first),
      outputBytes: Buffer.byteLength(first),
    });
  }
  return results;
}

const schemas = await schemaGeneration();
const openapi = await openApiGeneration();
const totalBytes = [...schemas, ...openapi].reduce((sum, item) => sum + item.outputBytes, 0);
console.log(JSON.stringify({
  status: "passed",
  generators: {
    jsonSchemaToTypeScript: "15.0.4",
    openapiTypeScript: "7.13.0",
  },
  schemas,
  openapi,
  totalOutputBytes: totalBytes,
  combinedOutputSha256: sha256(JSON.stringify([...schemas, ...openapi])),
}));
