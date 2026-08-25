// Emits a self-contained, generator-ready OpenAPI bundle for the Pagix Agent
// Integration surface.
//
// Pagix generates its own Java bindings (owner decision, 2026-08-24), but it
// cannot generate from the canonical description directly: that description
// refers to schemas through the closed `anvilkit://schema/...?digest=` resolver,
// which no stock generator can follow. This emitter resolves those references
// from verified repository bytes using the same normalizer the specification
// lint uses, then narrows the result to the schemas the Pagix surface actually
// reaches and republishes them under conventional `#/components/schemas` names.
//
// Narrowing is a boundary rule, not a size optimisation. The resolved
// description carries every canonical schema, including Agent definitions,
// runtime manifests, and tasks that are none of Pagix's business; generating
// Java models for those would hand Pagix a surface it has no contract to hold.
//
// Usage: bun scripts/emit-pagix-openapi-bundle.ts [--out <path>]
//        (writes to stdout when --out is absent)

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeDescriptionForTooling } from "../packages/contracts-codegen/spec-normalization.ts";

type Json = unknown;
type JsonObject = Record<string, Json>;

const REPO_ROOT = join(import.meta.dir, "..");
const SOURCE = "contracts/agent/openapi/pagix-agent-integration.openapi.json";
const RESOLVED_ROOT = "x-anvilkit-resolved-schemas";
const RESOLVED_PREFIX = `#/${RESOLVED_ROOT}/`;

const isObject = (value: Json): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function digest(bytes: Uint8Array | string): string {
  return "sha256:" + createHash("sha256").update(bytes).digest("hex");
}

/** Resolve one `#/x-anvilkit-resolved-schemas/...` pointer against the resolved tree. */
function pointer(resolved: JsonObject, ref: string): JsonObject {
  const segments = ref.slice(RESOLVED_PREFIX.length).split("/").map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let node: Json = resolved;
  for (const segment of segments) {
    if (!isObject(node)) throw new Error(`unresolvable reference: ${ref}`);
    node = node[segment];
  }
  if (!isObject(node)) throw new Error(`unresolvable reference: ${ref}`);
  return node;
}

function collectRefs(value: Json, into: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectRefs(item, into);
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "$ref" && typeof child === "string" && child.startsWith(RESOLVED_PREFIX)) into.add(child);
    else collectRefs(child, into);
  }
}

const pascal = (value: string): string =>
  value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join("");

/**
 * Names one reachable schema. A pointer that a `components.schemas` entry
 * already names keeps that name, so the published surface stays stable. A
 * `$defs` pointer takes its own definition name when that is unambiguous and a
 * slug-qualified name when two schemas define the same one — a collision must
 * never silently merge two contracts.
 */
function nameFor(ref: string, declared: Map<string, string>, defNameCounts: Map<string, number>): string {
  const declaredName = declared.get(ref);
  if (declaredName) return declaredName;
  const path = ref.slice(RESOLVED_PREFIX.length);
  const defs = path.split("/$defs/");
  if (defs.length === 2) {
    const [slug, defName] = defs;
    return (defNameCounts.get(defName) ?? 0) > 1 ? pascal(slug) + defName : defName;
  }
  return pascal(path);
}

const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;

/**
 * Widens integer schemas that do not fit a 32-bit signed integer.
 *
 * The canonical schemas bound counters and token totals at the JSON safe-integer
 * limit and assert no format, because format is a consumer concern and design
 * 0001 §4.2 forbids enabling a language from changing canonical wire bytes or
 * digests. A Java generator reading an unformatted `integer` emits `Integer`,
 * and a bound above 2^31-1 then emits an int literal that does not compile.
 *
 * Asserting `int64` here, on the derived bundle, is the projection this emitter
 * exists to perform: the canonical description keeps its bytes, and the consumer
 * receives a shape its language can hold.
 */
function widenIntegers(value: Json): Json {
  if (Array.isArray(value)) return value.map(widenIntegers);
  if (!isObject(value)) return value;
  const output: JsonObject = {};
  for (const [key, child] of Object.entries(value)) output[key] = widenIntegers(child);
  const exceedsInt32 =
    output.type === "integer" &&
    output.format === undefined &&
    ((typeof output.maximum === "number" && output.maximum > INT32_MAX) ||
      (typeof output.minimum === "number" && output.minimum < INT32_MIN));
  if (exceedsInt32) output.format = "int64";
  return output;
}

function rewrite(value: Json, naming: Map<string, string>): Json {
  if (Array.isArray(value)) return value.map((item) => rewrite(item, naming));
  if (!isObject(value)) return value;
  const output: JsonObject = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "$ref" && typeof child === "string" && child.startsWith(RESOLVED_PREFIX)) {
      const name = naming.get(child);
      if (!name) throw new Error(`reference outside the reachable closure: ${child}`);
      output[key] = `#/components/schemas/${name}`;
    } else {
      output[key] = rewrite(child, naming);
    }
  }
  return output;
}

// ---- resolve, then narrow to what the Pagix surface reaches ----

const sourceBytes = readFileSync(join(REPO_ROOT, SOURCE));
const resolved = normalizeDescriptionForTooling(JSON.parse(sourceBytes.toString("utf8")) as JsonObject) as JsonObject;
const resolvedSchemas = resolved[RESOLVED_ROOT] as JsonObject;

const components = (resolved.components ?? {}) as JsonObject;
const declaredSchemas = (components.schemas ?? {}) as JsonObject;

// Seed the closure from the operations and from every schema the description
// declares, then walk until it stops growing.
const reachable = new Set<string>();
collectRefs(resolved.paths, reachable);
collectRefs(declaredSchemas, reachable);
for (let frontier = [...reachable]; frontier.length > 0; ) {
  const next = new Set<string>();
  for (const ref of frontier) collectRefs(pointer(resolvedSchemas, ref.slice(RESOLVED_PREFIX.length) ? ref : ref), next);
  frontier = [...next].filter((ref) => !reachable.has(ref));
  for (const ref of frontier) reachable.add(ref);
}

// A `components.schemas` entry that is a bare $ref names the schema it points at.
const declaredNames = new Map<string, string>();
for (const [name, schema] of Object.entries(declaredSchemas)) {
  if (isObject(schema) && typeof schema.$ref === "string" && schema.$ref.startsWith(RESOLVED_PREFIX)) {
    declaredNames.set(schema.$ref, name);
  }
}

const defNameCounts = new Map<string, number>();
for (const ref of reachable) {
  const defs = ref.slice(RESOLVED_PREFIX.length).split("/$defs/");
  if (defs.length === 2) defNameCounts.set(defs[1], (defNameCounts.get(defs[1]) ?? 0) + 1);
}

const naming = new Map<string, string>();
const taken = new Map<string, string>();
for (const ref of [...reachable].sort()) {
  const name = nameFor(ref, declaredNames, defNameCounts);
  const clash = taken.get(name);
  if (clash && clash !== ref) throw new Error(`schema name collision: ${name} claimed by ${clash} and ${ref}`);
  taken.set(name, ref);
  naming.set(ref, name);
}

// ---- republish under conventional component names ----

const schemas: JsonObject = {};
for (const [ref, name] of [...naming].sort((a, b) => (a[1] < b[1] ? -1 : 1))) {
  schemas[name] = widenIntegers(rewrite(pointer(resolvedSchemas, ref), naming)) as JsonObject;
}

const bundle: JsonObject = {
  openapi: resolved.openapi,
  info: {
    ...(resolved.info as JsonObject),
    "x-anvilkit-bundle": {
      source: SOURCE,
      sourceSha256: digest(sourceBytes),
      note: "Generated bundle. Do not edit. Regenerate with scripts/emit-pagix-openapi-bundle.ts.",
    },
  },
  servers: resolved.servers,
  tags: resolved.tags,
  security: resolved.security,
  paths: widenIntegers(rewrite(resolved.paths, naming)),
  components: { ...components, schemas },
};

const text = JSON.stringify(bundle, null, 2) + "\n";
const outIndex = process.argv.indexOf("--out");
if (outIndex >= 0 && process.argv[outIndex + 1]) {
  writeFileSync(process.argv[outIndex + 1], text);
  process.stderr.write(
    `bundle: ${Object.keys(schemas).length} schemas, source ${digest(sourceBytes)}, bundle ${digest(text)}\n`,
  );
} else {
  process.stdout.write(text);
}
