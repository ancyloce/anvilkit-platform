// M4-T01 source-validation stage for the retained legacy export contracts.
//
// This validator intentionally supports only the vocabulary used by that
// frozen source set. Adding a schema keyword requires implementing it here;
// unknown keywords fail instead of being silently ignored.

import { isJsonObject, type Json, type Schema } from "./json-model.ts";

const SUPPORTED_KEYWORDS = new Set([
  "$id",
  "$ref",
  "$schema",
  "additionalProperties",
  "const",
  "description",
  "enum",
  "format",
  "items",
  "maximum",
  "minLength",
  "minimum",
  "pattern",
  "properties",
  "required",
  "title",
  "type",
]);

const SUPPORTED_FORMATS = new Set(["date-time", "uri"]);

function escapePointer(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

export function assertSupportedSchema(schema: Schema, label: string): void {
  const visit = (node: Json, pointer: string): void => {
    if (!isJsonObject(node)) throw new Error(`${label}${pointer}: schema node must be an object`);
    for (const keyword of Object.keys(node).sort()) {
      if (!SUPPORTED_KEYWORDS.has(keyword)) {
        throw new Error(`${label}${pointer}/${escapePointer(keyword)}: unsupported JSON Schema keyword`);
      }
    }
    if (typeof node.format === "string" && !SUPPORTED_FORMATS.has(node.format)) {
      throw new Error(`${label}${pointer}/format: unsupported JSON Schema format ${node.format}`);
    }
    if (node.properties !== undefined) {
      if (!isJsonObject(node.properties)) throw new Error(`${label}${pointer}/properties: must be an object`);
      for (const [name, child] of Object.entries(node.properties)) {
        visit(child, `${pointer}/properties/${escapePointer(name)}`);
      }
    }
    if (node.items !== undefined) visit(node.items, `${pointer}/items`);
  };
  visit(schema, "");
}

export function resolveRef(root: Json, ref: string): Schema {
  if (!ref.startsWith("#/")) throw new Error(`unsupported $ref: ${ref}`);
  let node: Json = root;
  for (const encodedPart of ref.slice(2).split("/")) {
    const part = encodedPart.replaceAll("~1", "/").replaceAll("~0", "~");
    if (!isJsonObject(node)) throw new Error(`$ref not found: ${ref}`);
    node = node[part];
    if (node === undefined) throw new Error(`$ref not found: ${ref}`);
  }
  if (!isJsonObject(node)) throw new Error(`$ref does not identify a schema object: ${ref}`);
  return node;
}

export function validateValue(
  schema: Schema,
  value: Json,
  root: Json,
  path: string,
  errors: string[],
): void {
  if (typeof schema.$ref === "string") {
    validateValue(resolveRef(root, schema.$ref), value, root, path, errors);
    return;
  }
  if ("const" in schema && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push(`${path}: expected const ${JSON.stringify(schema.const)}`);
    return;
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => JSON.stringify(item) === JSON.stringify(value))) {
    errors.push(`${path}: value ${JSON.stringify(value)} not in enum`);
    return;
  }
  if (schema.type === "object") {
    if (!isJsonObject(value)) {
      errors.push(`${path}: expected object`);
      return;
    }
    const properties = isJsonObject(schema.properties) ? schema.properties as Record<string, Schema> : {};
    for (const required of (schema.required ?? []) as string[]) {
      if (!(required in value)) errors.push(`${path}: missing required property ${required}`);
    }
    for (const [key, child] of Object.entries(value)) {
      if (key in properties) validateValue(properties[key], child, root, `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: additional property ${key} not allowed`);
    }
    return;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected array`);
      return;
    }
    if (isJsonObject(schema.items)) {
      value.forEach((item, index) => validateValue(schema.items as Schema, item, root, `${path}[${index}]`, errors));
    }
    return;
  }
  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push(`${path}: expected string`);
      return;
    }
    if (typeof schema.minLength === "number" && value.length < schema.minLength) {
      errors.push(`${path}: shorter than minLength ${schema.minLength}`);
    }
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: does not match pattern ${schema.pattern}`);
    }
    if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) {
      errors.push(`${path}: invalid date-time`);
    }
    if (schema.format === "uri") {
      try { new URL(value); } catch { errors.push(`${path}: invalid uri`); }
    }
    return;
  }
  if (schema.type === "integer" || schema.type === "number") {
    if (typeof value !== "number" || (schema.type === "integer" && !Number.isInteger(value))) {
      errors.push(`${path}: expected ${schema.type}`);
      return;
    }
    if (typeof schema.minimum === "number" && value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
    if (typeof schema.maximum === "number" && value > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
    return;
  }
  if (schema.type === "boolean" && typeof value !== "boolean") errors.push(`${path}: expected boolean`);
}
