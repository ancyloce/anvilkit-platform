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
for (const rel of files) {
  const isJs = JS_EXT.test(rel) || rel.endsWith("/package.json") || rel === "package.json";
  if (!isJs) continue;
  const allowed =
    rel.startsWith("packages/") || rel.startsWith("scripts/") || ROOT_ALLOWED.has(rel);
  if (!allowed) {
    failures.push(`Node/TS outside tooling areas: ${rel}`);
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

// --- 3. No Rust --------------------------------------------------------------
for (const rel of files) {
  if (rel.endsWith(".rs") || rel.endsWith("/Cargo.toml") || rel === "Cargo.toml") {
    failures.push(`Rust file found (AC-018): ${rel}`);
  }
}

// --- 4. Worker submodule audit ----------------------------------------------
const workerAudit = join(REPO_ROOT, "services", "export-worker", "scripts", "dependency-audit.sh");
if (!existsSync(workerAudit)) {
  failures.push("worker audit script missing: services/export-worker/scripts/dependency-audit.sh");
} else {
  const res = spawnSync("bash", [workerAudit], { stdio: "inherit" });
  if (res.status !== 0) failures.push("worker dependency audit failed");
}

if (failures.length > 0) {
  console.error("\ndependency audit FAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("platform dependency audit passed");
