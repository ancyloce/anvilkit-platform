// Deterministic append-only registry governance report command.

import { readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { compareRegistrySets, sha256, type RegistrySet } from "./m1-lib.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
const previousArg = arg("--previous");
const candidateArg = arg("--candidate");
if (!previousArg || !candidateArg) {
  console.error("usage: registry-diff.ts --previous <registry-set.json> --candidate <registry-set.json> [--deprecation-authorization <evidence>]");
  process.exit(2);
}
const previousPath = resolve(previousArg);
const candidatePath = resolve(candidateArg);
const previousBytes = readFileSync(previousPath);
const candidateBytes = readFileSync(candidatePath);
const previous = JSON.parse(previousBytes.toString("utf8")) as RegistrySet;
const candidate = JSON.parse(candidateBytes.toString("utf8")) as RegistrySet;
const findings = compareRegistrySets(previous, candidate, arg("--deprecation-authorization"));
process.stdout.write(JSON.stringify({
  reportVersion: 1,
  previousSource: relative(REPO_ROOT, previousPath),
  candidateSource: relative(REPO_ROOT, candidatePath),
  previousDigest: sha256(previousBytes),
  candidateDigest: sha256(candidateBytes),
  findings,
}, null, 2) + "\n");
if (findings.length > 0) process.exit(1);
