#!/usr/bin/env bun
import { join, resolve } from "node:path";
import { buildTypeScriptIdentityResult } from "./m4-identity-runner.ts";

const rootIndex = process.argv.indexOf("--repository-root");
const root = rootIndex >= 0 && process.argv[rootIndex + 1]
  ? resolve(process.argv[rootIndex + 1])
  : join(import.meta.dir, "..", "..");
process.stdout.write(`${JSON.stringify(buildTypeScriptIdentityResult(root), null, 2)}\n`);
