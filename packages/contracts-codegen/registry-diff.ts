// Deterministic append-only registry governance report command.

import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
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
const previousDigest = sha256(previousBytes);
const candidateDigest = sha256(candidateBytes);

function repositoryEvidence(path: string): string | undefined {
  const resolved = resolve(REPO_ROOT, path);
  if (resolved !== REPO_ROOT && !resolved.startsWith(`${REPO_ROOT}${sep}`)) return undefined;
  if (!existsSync(resolved) || !statSync(resolved).isFile()) return undefined;
  return resolved;
}

function approvedAuthorization(path: string | undefined): string | undefined {
  if (!path) return undefined;
  const evidencePath = repositoryEvidence(path);
  if (!evidencePath) return undefined;
  try {
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as {
      authorizationVersion?: number;
      status?: string;
      previousDigest?: string;
      candidateDigest?: string;
      registryOwners?: Array<{ registryId?: string; decision?: string; evidence?: string }>;
    };
    if (
      evidence.authorizationVersion !== 1 || evidence.status !== "approved" ||
      evidence.previousDigest !== previousDigest || evidence.candidateDigest !== candidateDigest
    ) return undefined;
    const changed = new Set<string>();
    const candidateRegistries = new Map(candidate.registries.map((registry) => [registry.registryId, registry]));
    for (const oldRegistry of previous.registries) {
      const nextRegistry = candidateRegistries.get(oldRegistry.registryId);
      if (!nextRegistry) continue;
      const nextEntries = new Map(nextRegistry.entries.map((entry) => [entry.wireValue, entry]));
      for (const oldEntry of oldRegistry.entries) {
        const nextEntry = nextEntries.get(oldEntry.wireValue);
        if (nextEntry && (oldEntry.status !== nextEntry.status || oldEntry.replacement !== nextEntry.replacement)) {
          changed.add(oldRegistry.registryId);
        }
      }
    }
    const approvals = new Map((evidence.registryOwners ?? []).map((owner) => [owner.registryId, owner]));
    for (const registryId of changed) {
      const approval = approvals.get(registryId);
      if (approval?.decision !== "approved" || typeof approval.evidence !== "string" || !repositoryEvidence(approval.evidence)) {
        return undefined;
      }
    }
    return relative(REPO_ROOT, evidencePath);
  } catch {
    return undefined;
  }
}

const authorizationEvidence = approvedAuthorization(arg("--deprecation-authorization"));
const findings = compareRegistrySets(previous, candidate, authorizationEvidence);
process.stdout.write(JSON.stringify({
  reportVersion: 1,
  previousSource: relative(REPO_ROOT, previousPath),
  candidateSource: relative(REPO_ROOT, candidatePath),
  previousDigest,
  candidateDigest,
  authorizationEvidence: authorizationEvidence ?? null,
  findings,
}, null, 2) + "\n");
if (findings.length > 0) process.exit(1);
