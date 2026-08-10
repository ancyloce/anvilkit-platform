// Generation-aware Agent contract freeze verification (PLAN-0003 M1-T07).

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const LOCK_PATH = join(REPO_ROOT, "contracts", "freeze", "v1", "contracts.lock.json");
const failures: string[] = [];

type Lock = {
  lockVersion: number;
  status: "candidate-unapproved" | "approved";
  sourceRoots: string[];
  sources: Array<{
    path: string;
    sha256: string;
    classification: "initial-baseline" | "documentation-only" | "compatible-additive" | "behaviorally-narrowing" | "breaking";
    compatibilityEvidence: string | null;
  }>;
  registrySnapshot: {
    path: string;
    sourceSha256: string;
    semanticSha256: string;
  };
  tools: Array<{
    identity: string;
    path: string | null;
    sourceSha256: string | null;
    status: "source-tool" | "not-applicable-m1" | "tbd-dp008";
  }>;
  authorization: {
    status: "candidate-unapproved" | "approved";
    evidence: string | null;
    reviewers: Array<{ role: string; decision: "pending" | "approved"; evidence: string | null }>;
  };
  legacyExportLock: {
    path: string;
    sha256: string;
  };
};

function digest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function repositoryEvidence(path: string, label: string): string | undefined {
  const resolved = resolve(REPO_ROOT, path);
  if (resolved !== REPO_ROOT && !resolved.startsWith(`${REPO_ROOT}${sep}`)) {
    failures.push(`AK-FREEZE-004 ${label} escapes the repository: ${path}`);
    return undefined;
  }
  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    failures.push(`AK-FREEZE-004 ${label} is missing: ${path}`);
    return undefined;
  }
  return resolved;
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function walkJson(directory: string, files: string[]): void {
  if (!existsSync(directory)) return;
  for (const name of readdirSync(directory).sort()) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walkJson(path, files);
    else if (name.endsWith(".json")) {
      const rel = relative(REPO_ROOT, path);
      const legacyOpenApi =
        rel === "contracts/openapi/v1/asset-service.internal.json" ||
        rel === "contracts/openapi/v1/deployment-service.internal.json" ||
        rel.startsWith("contracts/openapi/v1/fixtures/");
      if (!legacyOpenApi) files.push(rel);
    }
  }
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

function registrySemanticSnapshot(path: string): string {
  const source = JSON.parse(readFileSync(path, "utf8")) as {
    registrySetVersion: number;
    status: string;
    registries: Array<{ registryId: string; owner: string; compatibilityPolicy: string; entries: Array<Record<string, unknown>> }>;
  };
  const normalized = {
    registrySetVersion: source.registrySetVersion,
    status: source.status,
    registries: source.registries
      .map((registry) => ({
        ...registry,
        entries: registry.entries
          .map((entry) => ({
            ...entry,
            aliases: Array.isArray(entry.aliases) ? [...entry.aliases].sort() : entry.aliases,
          }))
          .sort((left, right) => compareUtf8(String(left.wireValue), String(right.wireValue))),
      }))
      .sort((left, right) => compareUtf8(left.registryId, right.registryId)),
  };
  return digest(Buffer.from(canonicalJson(normalized), "utf8"));
}

if (!existsSync(LOCK_PATH)) {
  console.error("Agent freeze lock missing: contracts/freeze/v1/contracts.lock.json");
  process.exit(1);
}
const lock = JSON.parse(readFileSync(LOCK_PATH, "utf8")) as Lock;
if (lock.lockVersion !== 1) failures.push(`unsupported Agent lock version ${lock.lockVersion}`);

const discovered: string[] = [];
for (const root of lock.sourceRoots) walkJson(join(REPO_ROOT, root), discovered);
const expectedPaths = new Set(lock.sources.map((source) => source.path));
for (const path of discovered.sort()) {
  if (!expectedPaths.has(path)) failures.push(`AK-FREEZE-001 unlocked Agent source added: ${path}`);
}
for (const source of lock.sources) {
  const path = join(REPO_ROOT, source.path);
  if (!existsSync(path)) {
    failures.push(`AK-FREEZE-001 frozen Agent source deleted: ${source.path}`);
    continue;
  }
  const actual = digest(readFileSync(path));
  if (actual !== source.sha256) failures.push(`AK-FREEZE-001 frozen Agent source changed: ${source.path}`);
  if (source.classification !== "initial-baseline") {
    if (!source.compatibilityEvidence) {
      failures.push(`AK-FREEZE-004 classified source lacks compatibility evidence: ${source.path}`);
    } else {
      const evidencePath = repositoryEvidence(source.compatibilityEvidence, "compatibility evidence");
      if (evidencePath) {
        const report = JSON.parse(readFileSync(evidencePath, "utf8")) as {
          candidateSource?: string;
          candidateDigest?: string;
          classification?: string;
          changes?: Array<{ classification?: string }>;
          findings?: unknown[];
          consumerEvidence?: unknown[];
        };
        if (report.candidateSource !== source.path || report.candidateDigest !== `sha256:${source.sha256}`) {
          failures.push(`AK-FREEZE-004 compatibility evidence does not bind candidate bytes: ${source.path}`);
        }
        if (report.classification !== source.classification) {
          failures.push(`AK-FREEZE-004 lock classification differs from compatibility report: ${source.path}`);
        }
        const rank: Record<string, number> = {
          "documentation-only": 1,
          "compatible-additive": 2,
          "behaviorally-narrowing": 3,
          "breaking": 4,
        };
        const computed = (report.changes ?? []).reduce(
          (maximum, change) => Math.max(maximum, rank[change.classification ?? ""] ?? 4),
          0,
        );
        if (computed !== rank[source.classification]) {
          failures.push(`AK-FREEZE-004 report changes do not support lock classification: ${source.path}`);
        }
        if ((report.findings?.length ?? 0) > 0) {
          failures.push(`AK-FREEZE-004 compatibility report contains blocking findings: ${source.path}`);
        }
        if (source.classification === "behaviorally-narrowing" && (report.consumerEvidence?.length ?? 0) === 0) {
          failures.push(`AK-FREEZE-004 narrowing lock update lacks consumer evidence: ${source.path}`);
        }
        if (source.classification === "behaviorally-narrowing") {
          for (const evidence of report.consumerEvidence ?? []) {
            if (typeof evidence !== "string") {
              failures.push(`AK-FREEZE-004 narrowing consumer evidence path is invalid: ${source.path}`);
            } else {
              repositoryEvidence(evidence, "narrowing consumer evidence");
            }
          }
        }
      }
    }
    if (lock.authorization.status !== "approved") {
      failures.push(`AK-FREEZE-004 non-initial lock update lacks approved authorization: ${source.path}`);
    }
  }
}

const registryPath = join(REPO_ROOT, lock.registrySnapshot.path);
if (!existsSync(registryPath)) {
  failures.push(`AK-FREEZE-002 registry snapshot missing: ${lock.registrySnapshot.path}`);
} else {
  if (digest(readFileSync(registryPath)) !== lock.registrySnapshot.sourceSha256) {
    failures.push("AK-FREEZE-002 registry source digest changed");
  }
  if (registrySemanticSnapshot(registryPath) !== lock.registrySnapshot.semanticSha256) {
    failures.push("AK-FREEZE-002 registry semantic snapshot changed");
  }
}

for (const tool of lock.tools) {
  if (tool.status === "source-tool") {
    if (!tool.path || !tool.sourceSha256) {
      failures.push(`AK-FREEZE-003 source tool identity incomplete: ${tool.identity}`);
      continue;
    }
    const path = join(REPO_ROOT, tool.path);
    if (!existsSync(path) || digest(readFileSync(path)) !== tool.sourceSha256) {
      failures.push(`AK-FREEZE-003 source tool identity changed: ${tool.identity}`);
    }
  }
  if (tool.status === "tbd-dp008" && tool.sourceSha256 !== null) {
    failures.push(`AK-FREEZE-003 DP-008 TBD tool cannot carry an unapproved digest: ${tool.identity}`);
  }
}

const legacyPath = join(REPO_ROOT, lock.legacyExportLock.path);
if (!existsSync(legacyPath) || digest(readFileSync(legacyPath)) !== lock.legacyExportLock.sha256) {
  failures.push("AK-FREEZE-001 legacy export lock bytes changed during Agent migration");
}

if (lock.status === "approved" || lock.authorization.status === "approved") {
  if (lock.status !== "approved" || lock.authorization.status !== "approved" || !lock.authorization.evidence) {
    failures.push("AK-FREEZE-004 approved lock and authorization states must agree and name evidence");
  }
  for (const reviewer of lock.authorization.reviewers) {
    if (reviewer.decision !== "approved" || !reviewer.evidence) {
      failures.push(`AK-FREEZE-004 approved lock lacks reviewer evidence: ${reviewer.role}`);
    } else {
      repositoryEvidence(reviewer.evidence, `reviewer evidence for ${reviewer.role}`);
    }
  }
  if (lock.authorization.evidence) {
    const authorizationPath = repositoryEvidence(lock.authorization.evidence, "lock authorization evidence");
    if (authorizationPath) {
      try {
        const authorization = JSON.parse(readFileSync(authorizationPath, "utf8")) as {
          authorizationVersion?: number;
          status?: string;
          classificationReports?: unknown[];
          registryDiffReport?: unknown;
          consumerEvidence?: unknown[];
          reviewers?: Array<{ role?: string; decision?: string; evidence?: string | null }>;
        };
        if (authorization.authorizationVersion !== 1 || authorization.status !== "approved") {
          failures.push("AK-FREEZE-004 lock authorization evidence is not an approved version 1 record");
        }
        for (const evidence of authorization.classificationReports ?? []) {
          if (typeof evidence !== "string") failures.push("AK-FREEZE-004 authorization classification report path is invalid");
          else repositoryEvidence(evidence, "authorization classification report");
        }
        if (authorization.registryDiffReport !== null && authorization.registryDiffReport !== undefined) {
          if (typeof authorization.registryDiffReport !== "string") failures.push("AK-FREEZE-004 authorization registry report path is invalid");
          else repositoryEvidence(authorization.registryDiffReport, "authorization registry report");
        }
        for (const evidence of authorization.consumerEvidence ?? []) {
          if (typeof evidence !== "string") failures.push("AK-FREEZE-004 authorization consumer evidence path is invalid");
          else repositoryEvidence(evidence, "authorization consumer evidence");
        }
        const decisions = new Map((authorization.reviewers ?? []).map((reviewer) => [reviewer.role, reviewer]));
        for (const reviewer of lock.authorization.reviewers) {
          const decision = decisions.get(reviewer.role);
          if (decision?.decision !== "approved" || decision.evidence !== reviewer.evidence) {
            failures.push(`AK-FREEZE-004 authorization does not bind approved reviewer ${reviewer.role}`);
          }
        }
      } catch (error) {
        failures.push(`AK-FREEZE-004 cannot parse lock authorization evidence: ${error}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Agent contract freeze FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(
  `Agent contract freeze intact: ${lock.sources.length} source files, ` +
  `${lock.tools.filter((tool) => tool.status === "source-tool").length} source-tool identities, ` +
  `status=${lock.status}`,
);
