#!/usr/bin/env bun
import { join, resolve } from "node:path";
import { buildTypeScriptConformanceResult } from "./agent-conformance-runner.ts";

const rootIndex = process.argv.indexOf("--repository-root");
const repositoryRoot = rootIndex >= 0 && process.argv[rootIndex + 1]
  ? resolve(process.argv[rootIndex + 1])
  : join(import.meta.dir, "..", "..");
process.stdout.write(`${JSON.stringify(buildTypeScriptConformanceResult(repositoryRoot), null, 2)}\n`);
