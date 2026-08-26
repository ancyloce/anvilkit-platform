// Platform dependency-audit gate (EW-REPO-004; AC-002, AC-018, AC-019).
//
// Enforced rules:
//   1. Node/TS confinement (PRD 0009): JS/TS sources and package manifests
//      live only under packages/ (tooling/mocks/contract generation). The
//      root workspace manifest (package.json, bun.lock, turbo.json) is
//      allowed. Production services are Go — any JS/TS under services/ fails.
//   2. No frontend dependencies anywhere: react, react-dom, next,
//      @measured/puck / puck, or any @anvilkit/* package that is not a
//      workspace package of this repo (the forbidden set is the
//      anvilkit-studio frontend surface).
//   3. No Rust (AC-018).
//   4. The worker submodule passes its own stricter audit
//      (services/export-worker/scripts/dependency-audit.sh — pure Go, no
//      cross-repo modules).
//
// Usage (from the repo root): bun scripts/dependency-audit.ts

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const REPO_ROOT = join(import.meta.dir, "..");
const SKIP_DIRS = new Set(["node_modules", ".git", ".claude", ".turbo", "dist"]);

const failures: string[] = [];

function walk(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(relative(REPO_ROOT, full));
    }
  }
}

const files: string[] = [];
walk(REPO_ROOT, files);

// --- 1. Node/TS confinement -------------------------------------------------
const JS_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const ROOT_ALLOWED = new Set(["package.json", "bun.lock", "bun.lockb", "turbo.json"]);
// Go-first (PRD 0009) confines Node/TS to tooling, with exactly one service
// exempted by ADR-025 §17: the page preview worker runs in a Node runtime. It
// drives a browser through a Node automation library, so the runtime is part of
// what the service is rather than a choice about how to write it. (Rendering
// reinforces it: a Go renderer could not use Puck, and a preview that
// reimplements Puck's rendering is evidence about the reimplementation — the
// "without reinterpretation" rule in design 0001 §2.2.)
//
// The exemption is this path and no other, and it is only the language
// confinement: the forbidden-frontend-dependency check below still applies to
// this service in full.
const GO_FIRST_EXEMPT = ["services/preview-worker/"];
for (const rel of files) {
  const isJs = JS_EXT.test(rel) || rel.endsWith("/package.json") || rel === "package.json";
  if (!isJs) continue;
  const allowed =
    rel.startsWith("packages/") ||
    rel.startsWith("scripts/") ||
    GO_FIRST_EXEMPT.some((prefix) => rel.startsWith(prefix)) ||
    ROOT_ALLOWED.has(rel);
  if (!allowed) {
    failures.push(`Node/TS outside tooling areas: ${rel}`);
  }
}

const agentServiceRoot = join(REPO_ROOT, "services", "agent-service");
if (existsSync(join(agentServiceRoot, "go.mod"))) {
	const serviceModule = readFileSync(join(agentServiceRoot, "go.mod"), "utf8");
	if (!serviceModule.startsWith("module github.com/ancyloce/anvilkit-agent-service\n")) {
		failures.push("agent-service module identity changed or was extracted");
	}
  const inventory = spawnSync("go", ["list", "-deps", "./cmd/agent-service"], {
    cwd: agentServiceRoot,
    encoding: "utf8",
  });
  if (inventory.status !== 0) {
    failures.push("agent-service production dependency inventory could not be generated");
  } else {
    const productionDependencies = new Set(inventory.stdout.trim().split(/\r?\n/));
    if (/(^|\/)(mocks|fakeworker)(\/|$)/m.test(inventory.stdout)) {
      failures.push("fake or mock package present in agent-service production dependency inventory");
    }
    if (productionDependencies.has("github.com/ancyloce/anvilkit-agent-service/internal/workflow/memory")) {
      failures.push("in-memory proof workflow engine present in agent-service production dependency inventory");
    }
    if (!productionDependencies.has("github.com/ancyloce/anvilkit-agent-service/internal/workflow/dbos")) {
      failures.push("pinned DBOS workflow engine absent from agent-service production dependency inventory");
    }
  }
}

for (const rel of files) {
	if (rel.startsWith("services/agent-service/") && rel !== "services/agent-service/go.mod" && rel.endsWith("/go.mod")) {
		failures.push(`nested agent-service module extraction is forbidden: ${rel}`);
	}
	if (/^services\/agent-service\/cmd\/[^/]*(?:worker|preview|undo)[^/]*\//i.test(rel)) {
		failures.push(`the canonical agent-service production command inventory contains excluded behavior: ${rel}`);
	}
}

// ADR-018: Go and TypeScript are the only active Agent contract consumers.
// Java/Python Agent packages and the superseded versioned contract tree must
// not reappear without a new governance decision.
for (const forbiddenPath of [
	"packages/contracts-java",
	"packages/contracts-python",
	"packages/contracts-bom",
	"contracts/schemas",
	"contracts/freeze",
	"contracts/compatibility",
	"contracts/registries",
	"contracts/fixtures",
	"contracts/evidence",
	"contracts/bom",
	"contracts/asyncapi",
]) {
	if (existsSync(join(REPO_ROOT, forbiddenPath))) {
		failures.push(`superseded Agent contract machinery is present: ${forbiddenPath} (ADR-018 canonical cutover)`);
	}
}

const agentOpenAPI = join(REPO_ROOT, "contracts", "agent", "openapi", "agent-service.openapi.json");
if (!existsSync(agentOpenAPI)) {
	failures.push("agent-service OpenAPI inventory is missing");
} else {
	try {
		const document = JSON.parse(readFileSync(agentOpenAPI, "utf8"));
		for (const [pathName, pathItem] of Object.entries(document.paths ?? {})) {
			for (const operation of Object.values(pathItem as Record<string, any>)) {
				const operationID = typeof operation?.operationId === "string" ? operation.operationId : "";
				if (/preview|undo|applyPage|pageApply|interactiveApply/i.test(operationID)) {
					failures.push(`beyond-kernel preview/interactive-apply/undo operation present in the canonical surface: ${pathName} ${operationID}`);
				}
			}
		}
	} catch {
		failures.push("agent-service OpenAPI inventory is not valid JSON");
	}
}

for (const rel of files) {
  if (!rel.startsWith("services/agent-service/cmd/") || !rel.endsWith(".go")) continue;
  const body = readFileSync(join(REPO_ROOT, rel), "utf8");
  if (body.includes("mocks/fakeworker") || body.includes("internal/fakeworker")) {
    failures.push(`fake worker packaged into production composition: ${rel}`);
  }
}

// --- 2. Forbidden frontend dependencies -------------------------------------
const workspaceNames = new Set<string>();
for (const rel of files) {
  if (rel === "package.json" || (rel.startsWith("packages/") && rel.endsWith("/package.json"))) {
    try {
      const pkg = JSON.parse(readFileSync(join(REPO_ROOT, rel), "utf8"));
      if (typeof pkg.name === "string") workspaceNames.add(pkg.name);
    } catch {
      failures.push(`unparseable package.json: ${rel}`);
    }
  }
}
const FORBIDDEN_EXACT = new Set(["react", "react-dom", "next", "puck", "@measured/puck"]);
for (const rel of files) {
  if (!(rel === "package.json" || rel.endsWith("/package.json"))) continue;
  let pkg: any;
  try {
    pkg = JSON.parse(readFileSync(join(REPO_ROOT, rel), "utf8"));
  } catch {
    continue; // already reported above when relevant
  }
  for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const dep of Object.keys(pkg[section] ?? {})) {
      if (FORBIDDEN_EXACT.has(dep)) {
        failures.push(`forbidden frontend dependency "${dep}" in ${rel} (${section})`);
      } else if (dep.startsWith("@anvilkit/") && !workspaceNames.has(dep)) {
        failures.push(
          `forbidden @anvilkit/* dependency "${dep}" in ${rel} (${section}) — only this repo's workspace packages are allowed`,
        );
      }
    }
  }
}

// --- 3a. Pagix is API-only: no database credential configuration ------------
const PAGIX_DATABASE_CREDENTIAL = new RegExp(
  "ANVILKIT_PAGIX_" + "(?:DATABASE|DB|PASSWORD|USERNAME|USER)_?",
  "i",
);
for (const rel of files) {
  if (!(rel.startsWith("services/agent-service/") || rel.startsWith("infra/"))) continue;
  if (!/\.(go|ya?ml|json|env|toml)$/.test(rel)) continue;
  const body = readFileSync(join(REPO_ROOT, rel), "utf8");
  if (PAGIX_DATABASE_CREDENTIAL.test(body)) {
    failures.push(`Pagix database credential configuration is forbidden: ${rel}`);
  }
}

// --- 4. No Rust --------------------------------------------------------------
for (const rel of files) {
  if (rel.endsWith(".rs") || rel.endsWith("/Cargo.toml") || rel === "Cargo.toml") {
    failures.push(`Rust file found (AC-018): ${rel}`);
  }
}

// --- 5. Production service submodule audits ---------------------------------
const workerAudit = join(REPO_ROOT, "services", "export-worker", "scripts", "dependency-audit.sh");
if (!existsSync(workerAudit)) {
  failures.push("worker audit script missing: services/export-worker/scripts/dependency-audit.sh");
} else {
  const res = spawnSync("bash", [workerAudit], { stdio: "inherit" });
  if (res.status !== 0) failures.push("worker dependency audit failed");
}

const agentBoundary = join(REPO_ROOT, "services", "agent-service", "cmd", "boundarycheck");
if (!existsSync(agentBoundary)) {
  failures.push("agent-service boundary checker missing: services/agent-service/cmd/boundarycheck");
} else {
  const res = spawnSync("go", ["run", "./cmd/boundarycheck", "-root", "."], {
    cwd: join(REPO_ROOT, "services", "agent-service"),
    stdio: "inherit",
  });
  if (res.status !== 0) failures.push("agent-service dependency boundary audit failed");
}

if (failures.length > 0) {
  console.error("\ndependency audit FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("platform dependency audit passed");
