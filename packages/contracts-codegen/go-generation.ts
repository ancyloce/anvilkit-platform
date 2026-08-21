// Go language-generation stage for the retained export bindings.

import type { Schema } from "./json-model.ts";
import { normalizeObject, type NormalizedEnum } from "./normalized-model.ts";

const INITIALISMS = new Set(["id", "url", "uri", "api", "http", "json"]);

export function goFieldName(property: string): string {
  return property.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[\s_.-]+/).filter(Boolean).map((word) => {
    const lower = word.toLowerCase();
    return INITIALISMS.has(lower) ? lower.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1);
  }).join("");
}

export function goConstSuffix(value: string): string {
  return value.split(/[^A-Za-z0-9]+/).filter(Boolean).map((token) => {
    const lower = token.toLowerCase();
    return /^[0-9]/.test(lower) ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join("");
}

export function goArgName(parameter: string): string {
  const field = goFieldName(parameter);
  return field.charAt(0).toLowerCase() + field.slice(1);
}

function propertyGoType(
  property: string,
  schema: Schema,
  enumTypes: Record<string, string>,
  refNamer: (ref: string) => string,
  typeOverrides: Record<string, string>,
): string {
  if (property in typeOverrides) return typeOverrides[property];
  if (typeof schema.$ref === "string") return refNamer(schema.$ref);
  if (property in enumTypes && Array.isArray(schema.enum)) return enumTypes[property];
  if ("const" in schema) return typeof schema.const === "number" ? "int64" : "string";
  if (schema.type === "string") return "string";
  if (schema.type === "integer") return "int64";
  if (schema.type === "number") return "float64";
  if (schema.type === "boolean") return "bool";
  if (schema.type === "array") {
    const items = schema.items as Schema | undefined;
    if (items && typeof items.$ref === "string") return "[]" + refNamer(items.$ref);
    if (items?.type === "string") return "[]string";
  }
  throw new Error(`unsupported schema type for property ${property}: ${schema.type}`);
}

export function emitGoStruct(
  name: string,
  description: string,
  schema: Schema,
  enumTypes: Record<string, string>,
  refNamer: (ref: string) => string,
  fieldRenames: Record<string, string> = {},
  typeOverrides: Record<string, string> = {},
): string {
  const object = normalizeObject(name, description, schema);
  let output = `// ${object.name} ${object.description}\ntype ${object.name} struct {\n`;
  for (const field of object.fields) {
    const goType = propertyGoType(field.wireName, field.schema, enumTypes, refNamer, typeOverrides);
    const omit = field.required ? "" : ",omitempty";
    const fieldName = fieldRenames[field.wireName] ?? goFieldName(field.wireName);
    if (field.description) output += `\t// ${fieldName}: ${field.description.replace(/\n/g, " ")}\n`;
    output += `\t${fieldName} ${goType} \`json:"${field.wireName}${omit}"\`\n`;
  }
  return output + "}\n";
}

export function emitGoEnum(spec: NormalizedEnum): string {
  let output = `// ${spec.name} ${spec.description}\ntype ${spec.name} string\n\n`;
  output += `// ${spec.name} values.\nconst (\n`;
  for (const value of spec.values) output += `\t${spec.name}${goConstSuffix(value)} ${spec.name} = "${value}"\n`;
  return output + ")\n";
}
