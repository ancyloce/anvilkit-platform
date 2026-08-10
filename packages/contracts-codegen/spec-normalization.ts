// Deterministic closed-reference projection for OpenAPI/AsyncAPI tooling.
//
// Authoritative descriptions retain immutable anvilkit:// references. Tools
// that do not understand that scheme receive a non-authoritative local JSON
// projection only after every referenced source digest has been verified.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

const REPO_ROOT = join(import.meta.dir, "..", "..");
const SCHEMA_DIRECTORY = join(REPO_ROOT, "contracts", "schemas", "v1");
const PROFILE_KEYS = new Set(["$schema", "$id", "x-anvilkit-contract"]);
const IMMUTABLE_REFERENCE = /^anvilkit:\/\/schema\/([a-z0-9]+(?:[.-][a-z0-9]+)*)\.v([1-9][0-9]*)@([1-9][0-9]*\.[0-9]+\.[0-9]+)\?digest=sha256:([0-9a-f]{64})(#\/.*)?$/;

type SchemaSource = {
  key: string;
  logicalId: string;
  major: string;
  version: string;
  digest: string;
  schema: JsonObject;
};

function isObject(value: Json | undefined): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function pointerToken(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function schemaSources(): Map<string, SchemaSource> {
  const sources = new Map<string, SchemaSource>();
  for (const name of readdirSync(SCHEMA_DIRECTORY).filter((item) => item.endsWith(".schema.json")).sort()) {
    const path = join(SCHEMA_DIRECTORY, name);
    const bytes = readFileSync(path);
    const schema = JSON.parse(bytes.toString("utf8")) as JsonObject;
    const metadata = schema["x-anvilkit-contract"];
    if (!isObject(metadata) || typeof metadata.semanticVersion !== "string") {
      throw new Error(`schema metadata missing for ${name}`);
    }
    const key = basename(name, ".schema.json");
    const version = metadata.semanticVersion;
    sources.set(key, {
      key,
      logicalId: String(metadata.logicalId),
      major: version.split(".")[0],
      version,
      digest: createHash("sha256").update(bytes).digest("hex"),
      schema,
    });
  }
  return sources;
}

function localReference(key: string, fragment = ""): string {
  return `#/x-anvilkit-resolved-schemas/${pointerToken(key)}${fragment}`;
}

function rewriteReference(ref: string, sources: Map<string, SchemaSource>, localSchemaKey?: string): string {
  if (ref.startsWith("#")) {
    return localSchemaKey ? localReference(localSchemaKey, ref.slice(1)) : ref;
  }
  const match = IMMUTABLE_REFERENCE.exec(ref);
  if (!match) throw new Error(`description contains a non-immutable or external reference: ${ref}`);
  const [, key, major, version, digest, fragment = ""] = match;
  const source = sources.get(key);
  if (!source) throw new Error(`closed description graph is missing schema ${key}`);
  if (source.major !== major || source.version !== version) {
    throw new Error(`reference version does not match ${key}: ${version}`);
  }
  if (source.digest !== digest) throw new Error(`reference digest does not match ${key}`);
  return localReference(key, fragment ? fragment.slice(1) : "");
}

function project(value: Json, sources: Map<string, SchemaSource>, localSchemaKey?: string): Json {
  if (Array.isArray(value)) return value.map((item) => project(item, sources, localSchemaKey));
  if (!isObject(value)) return value;
  const output: JsonObject = {};
  for (const key of Object.keys(value).sort()) {
    if (localSchemaKey && PROFILE_KEYS.has(key)) continue;
    const child = value[key];
    if (key === "$ref" && typeof child === "string") {
      output[key] = rewriteReference(child, sources, localSchemaKey);
    } else {
      output[key] = project(child, sources, localSchemaKey);
    }
  }
  return output;
}

export function normalizeDescriptionForTooling(description: JsonObject): JsonObject {
  const sources = schemaSources();
  const normalized = project(description, sources) as JsonObject;
  normalized["x-anvilkit-resolved-schemas"] = Object.fromEntries(
    [...sources.values()].map((source) => [source.key, project(source.schema, sources, source.key)]),
  );
  return normalized;
}

function rewriteResolvedReferences(value: Json, sources: Map<string, SchemaSource>): Json {
  if (Array.isArray(value)) return value.map((item) => rewriteResolvedReferences(item, sources));
  if (!isObject(value)) return value;
  const output: JsonObject = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "$ref" && typeof child === "string" && child.startsWith("#/x-anvilkit-resolved-schemas/")) {
      const [, schemaKey, definition] = /^#\/x-anvilkit-resolved-schemas\/([^/]+)(?:\/\$defs\/([^/]+))?$/.exec(child) ?? [];
      const source = sources.get(schemaKey ?? "");
      if (!source) throw new Error(`unsupported resolved schema reference: ${child}`);
      output[key] = `#/components/schemas/${source.logicalId}${definition ?? ""}`;
    } else {
      output[key] = rewriteResolvedReferences(child, sources);
    }
  }
  return output;
}

function rewriteSchemaReferences(value: Json, sources: Map<string, SchemaSource>): Json {
  if (Array.isArray(value)) return value.map((item) => rewriteSchemaReferences(item, sources));
  if (!isObject(value)) return value;
  const output: JsonObject = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "$ref" && typeof child === "string" && child.startsWith("#/x-anvilkit-resolved-schemas/")) {
      const [, schemaKey, definition] = /^#\/x-anvilkit-resolved-schemas\/([^/]+)(?:\/\$defs\/([^/]+))?$/.exec(child) ?? [];
      const source = sources.get(schemaKey ?? "");
      if (!source) throw new Error(`unsupported resolved schema reference: ${child}`);
      output[key] = `#/$defs/${source.logicalId}${definition ?? ""}`;
    } else {
      output[key] = rewriteSchemaReferences(child, sources);
    }
  }
  return output;
}

function generationDefinitions(sources: Map<string, SchemaSource>): JsonObject {
  const definitions: JsonObject = {};
  for (const source of sources.values()) {
    const sourceProjection = project(source.schema, sources, source.key) as JsonObject;
    const { $defs, ...sourceRoot } = sourceProjection;
    definitions[source.logicalId] = rewriteSchemaReferences(sourceRoot, sources);
    if (isObject($defs)) {
      for (const [name, definition] of Object.entries($defs)) {
        definitions[`${source.logicalId}${name}`] = rewriteSchemaReferences(definition, sources);
      }
    }
  }
  return definitions;
}

export function normalizeJsonSchemaForGeneration(schema: JsonObject): JsonObject {
  const sources = schemaSources();
  const metadata = schema["x-anvilkit-contract"] as JsonObject;
  const current = [...sources.values()].find((source) => source.logicalId === metadata.logicalId)!;
  const projected = project(schema, sources, current.key) as JsonObject;
  const { $defs: _localDefinitions, ...root } = projected;
  root.$defs = generationDefinitions(sources);
  return rewriteSchemaReferences(root, sources) as JsonObject;
}

export function contractSchemaBundleForGeneration(): JsonObject {
  const sources = schemaSources();
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "AnvilKitContractsV1",
    type: "object",
    additionalProperties: false,
    properties: Object.fromEntries(
      [...sources.values()].map((source) => [source.logicalId, { $ref: `#/$defs/${source.logicalId}` }]),
    ),
    $defs: generationDefinitions(sources),
  };
}

// OpenAPI generators generally require schema references to terminate directly
// under components.schemas. Lift the verified closed graph into that shape.
export function normalizeOpenApiForGeneration(description: JsonObject): JsonObject {
  const sources = schemaSources();
  const normalized = normalizeDescriptionForTooling(description);
  const components = isObject(normalized.components) ? normalized.components : {};
  const schemas = isObject(components.schemas) ? components.schemas : {};

  for (const source of sources.values()) {
    const projected = project(source.schema, sources, source.key) as JsonObject;
    const { $defs, ...root } = projected;
    schemas[source.logicalId] = rewriteResolvedReferences(root, sources);
    if (isObject($defs)) {
      for (const [name, definition] of Object.entries($defs)) {
        schemas[`${source.logicalId}${name}`] = rewriteResolvedReferences(definition, sources);
      }
    }
  }

  components.schemas = schemas;
  normalized.components = components;
  delete normalized["x-anvilkit-resolved-schemas"];
  return rewriteResolvedReferences(normalized, sources) as JsonObject;
}
