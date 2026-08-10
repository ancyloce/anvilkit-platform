// M4-T01 fixture-execution stage. Native language adapters will consume the
// shared Agent manifest later; these helpers preserve the legacy regression
// behavior while keeping fixture evaluation separate from generation.

import type { Json, Schema } from "./json-model.ts";
import { validateValue } from "./source-validation.ts";

export function assertFixtureValid(schema: Schema, value: Json, root: Json, label: string): void {
  const errors: string[] = [];
  validateValue(schema, value, root, "$", errors);
  if (errors.length > 0) throw new Error(`fixture ${label} failed validation:\n  ${errors.join("\n  ")}`);
}

export function assertFixtureInvalid(schema: Schema, value: Json, root: Json, label: string): void {
  const errors: string[] = [];
  validateValue(schema, value, root, "$", errors);
  if (errors.length === 0) throw new Error(`invalid fixture ${label} unexpectedly passed validation`);
}
