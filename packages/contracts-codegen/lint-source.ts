// Deterministic single-schema AnvilKit source-profile linter.

import { readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { lintSchema, sha256, type JsonObject } from "./source-lint.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const index = process.argv.indexOf("--schema");
const sourceArg = index >= 0 ? process.argv[index + 1] : undefined;
if (!sourceArg) {
  console.error("usage: lint-source.ts --schema <schema.json>");
  process.exit(2);
}
const path = resolve(sourceArg);
const bytes = readFileSync(path);
const schema = JSON.parse(bytes.toString("utf8")) as JsonObject;
const findings = lintSchema(schema);
process.stdout.write(JSON.stringify({
  lintVersion: 1,
  source: relative(REPO_ROOT, path),
  sourceDigest: sha256(bytes),
  findings,
}, null, 2) + "\n");
if (findings.length > 0) process.exit(1);

