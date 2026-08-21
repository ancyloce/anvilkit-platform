// Pinned TypeScript validation adapter: strict admission plus Ajv 2020-12.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { admitStrictJson, type JsonValue, type ValidationFinding } from "./strict-json.ts";

type ContractSchema = Record<string, unknown> & { "x-anvilkit-contract": { logicalId: string } };

function logicalUri(path: string, bytes: Uint8Array): string {
  const name = basename(path, ".schema.json");
  return `anvilkit://schema/${name}?digest=sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function compare(left: ValidationFinding, right: ValidationFinding): number {
  return left.code.localeCompare(right.code) || left.instancePath.localeCompare(right.instancePath) || left.schemaPath.localeCompare(right.schemaPath);
}

export class NativeTypeScriptValidator {
  private readonly validators = new Map<string, ValidateFunction>();

  constructor(repositoryRoot: string) {
    const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: true, allowUnionTypes: false });
    addFormats(ajv);
    for (const keyword of ["x-anvilkit-integerString", "x-anvilkit-decimalString", "x-anvilkit-extensionMap", "x-anvilkit-omittedSemantics"]) {
      ajv.addKeyword({ keyword, schemaType: ["boolean", "string", "object"], valid: true });
    }
    const directory = join(repositoryRoot, "contracts", "agent", "schemas");
    const projected: Array<{ uri: string; schema: Record<string, unknown> }> = [];
    for (const name of readdirSync(directory).filter((value) => value.endsWith(".schema.json")).sort()) {
      const path = join(directory, name);
      const bytes = readFileSync(path);
      const source = JSON.parse(bytes.toString("utf8")) as ContractSchema;
      const uri = logicalUri(path, bytes);
      const schema = structuredClone(source) as Record<string, unknown>;
      schema.$schema = "https://json-schema.org/draft/2020-12/schema";
      schema.$id = uri;
      delete schema["x-anvilkit-contract"];
      projected.push({ uri, schema });
      ajv.addSchema(schema, uri);
    }
    for (const item of projected) this.validators.set(item.uri, ajv.getSchema(item.uri)!);
  }

  validate(schemaUri: string, bytes: Uint8Array): ValidationFinding[] {
    let value: JsonValue;
    try { value = admitStrictJson(bytes).value; }
    catch { return [{ code: "PARSE_REJECTED", instancePath: "/", schemaPath: "/profile/strictAdmission" }]; }
    const validator = this.validators.get(schemaUri);
    if (!validator) return [{ code: "VALIDATION_FAILED", instancePath: "/", schemaPath: "/profile/closedResolver" }];
    if (validator(value)) return [];
    return (validator.errors ?? []).map((error: ErrorObject) => ({
      code: "VALIDATION_FAILED",
      instancePath: error.instancePath || "/",
      schemaPath: error.schemaPath,
    })).sort(compare);
  }
}
