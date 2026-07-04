// Contract freeze verification (ADR-001, AC-029; EW-CONTRACT-005/006).
//
// Recomputes the sha256 of every frozen file under contracts/ and compares it
// with contracts/contracts.lock.json. Any drift fails: frozen contract files
// are immutable — additive evolution happens deliberately via
// `bun packages/contracts-codegen/generate.ts --update-lock` (so the lock diff
// is visible in review), and breaking changes require a new version directory
// (v2/) plus contract-test updates (FR-002).
//
// Usage (from the repo root): bun packages/contracts-codegen/check-freeze.ts

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const CONTRACTS_DIR = join(REPO_ROOT, "contracts");
const LOCK_PATH = join(CONTRACTS_DIR, "contracts.lock.json");

if (!existsSync(LOCK_PATH)) {
  console.error(
    "contracts/contracts.lock.json missing — run `bun packages/contracts-codegen/generate.ts --update-lock`",
  );
  process.exit(1);
}

function walk(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
}

const lock = JSON.parse(readFileSync(LOCK_PATH, "utf8")) as {
  files: Record<string, string>;
};

const actual: Record<string, string> = {};
const files: string[] = [];
walk(CONTRACTS_DIR, files);
for (const f of files) {
  const rel = relative(REPO_ROOT, f);
  if (rel === "contracts/contracts.lock.json" || rel === "contracts/README.md") continue;
  actual[rel] = createHash("sha256").update(readFileSync(f)).digest("hex");
}

const problems: string[] = [];
for (const [rel, hash] of Object.entries(lock.files)) {
  if (!(rel in actual)) {
    problems.push(`frozen file deleted: ${rel}`);
  } else if (actual[rel] !== hash) {
    problems.push(`frozen file changed: ${rel}`);
  }
}
for (const rel of Object.keys(actual)) {
  if (!(rel in lock.files)) {
    problems.push(`unlocked contract file added: ${rel} (re-lock with --update-lock)`);
  }
}

if (problems.length > 0) {
  console.error("contract freeze violated (ADR-001):");
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    "\nContracts are additive-only within a version. If this change is intentional and additive,\n" +
      "re-lock with `bun packages/contracts-codegen/generate.ts --update-lock` so the lock diff is\n" +
      "reviewed. Breaking changes require a new version directory (e.g. contracts/events/v2).",
  );
  process.exit(1);
}

console.log(`contract freeze intact: ${Object.keys(lock.files).length} files verified`);
