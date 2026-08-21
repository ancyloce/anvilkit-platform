// Normalized-model stage. Source-specific documents are reduced to
// these deterministic language-neutral shapes before a language emitter runs.

import type { Schema } from "./json-model.ts";

export interface NormalizedEnum {
  name: string;
  values: string[];
  description: string;
}

export interface NormalizedField {
  wireName: string;
  required: boolean;
  schema: Schema;
  description: string;
}

export interface NormalizedObject {
  name: string;
  description: string;
  fields: NormalizedField[];
}

export function normalizeObject(name: string, description: string, schema: Schema): NormalizedObject {
  const required = new Set((schema.required ?? []) as string[]);
  const properties = (schema.properties ?? {}) as Record<string, Schema>;
  return {
    name,
    description,
    fields: Object.entries(properties).map(([wireName, fieldSchema]) => ({
      wireName,
      required: required.has(wireName),
      schema: fieldSchema,
      description: typeof fieldSchema.description === "string" ? fieldSchema.description : "",
    })),
  };
}
