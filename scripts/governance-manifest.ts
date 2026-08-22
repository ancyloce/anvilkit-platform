#!/usr/bin/env bun
/**
 * Governance corpus freeze manifest (ADR-023).
 *
 * ADR-023 keeps most of the governance corpus out of Git, so Git history
 * cannot be its record. The manifest is: a SHA-256 per governed file and one
 * root digest over the sorted digest lines, whose ROOT is recorded with the
 * baseline commit. Hashes prove content — they cannot recover it, which is
 * why the corpus itself is retained locally alongside them.
 *
 * It is generated rather than written because a hand-maintained manifest is a
 * description of the corpus rather than a measurement of it, and the failure
 * mode is silent: a governed document changes, nobody re-hashes it, and the
 * anchor keeps attesting bytes that are gone.
 *
 * The output path is an argument rather than a constant. The manifest lives in
 * the Gate 0 evidence directory, whose name this repository does not own — it
 * is a governed path established by plan 0005 — and a tool that spells a name
 * it does not own is a tool that quietly becomes an authority on it.
 *
 * Usage:
 *   bun scripts/governance-manifest.ts --date <YYYY-MM-DD> --out <path>
 *   bun scripts/governance-manifest.ts --date <YYYY-MM-DD> --out <path> --check
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dir, "..");

/** The governed corpus: the rules, not the records of applying them. */
const INCLUDED_TREES = ["docs/adr", "docs/design", "docs/prd", "docs/plans", "docs/runbooks"];
const INCLUDED_FILES = ["AGENTS.md", "CLAUDE.md"];

/**
 * Working artifacts, not frozen governance rules. Acceptance records describe
 * what was done at a moment and are expected to change; backups and diffs are
 * scaffolding; review and mock notes are neither rules nor evidence.
 */
const EXCLUDED_TREES = ["docs/acceptance", "docs/backs", "docs/diffs", "docs/code-review", "docs/mocks"];

function governedFiles(): string[] {
  const found: string[] = [];
  const walk = (directory: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(directory);
    } catch {
      return;
    }
    for (const entry of entries.sort()) {
      const path = join(directory, entry);
      const relativePath = relative(repositoryRoot, path).split("\\").join("/");
      if (EXCLUDED_TREES.some((tree) => relativePath === tree || relativePath.startsWith(`${tree}/`))) continue;
      const info = statSync(path);
      if (info.isDirectory()) {
        walk(path);
        continue;
      }
      if (!info.isFile()) continue;
      found.push(relativePath);
    }
  };
  for (const tree of INCLUDED_TREES) walk(resolve(repositoryRoot, tree));
  for (const file of INCLUDED_FILES) {
    try {
      if (statSync(resolve(repositoryRoot, file)).isFile()) found.push(file);
    } catch {
      throw new Error(`the governed file ${file} is missing`);
    }
  }
  return found.sort();
}

function digestOf(relativePath: string): string {
  return createHash("sha256").update(readFileSync(resolve(repositoryRoot, relativePath))).digest("hex");
}

function render(date: string): { manifest: string; root: string; count: number } {
  const files = governedFiles();
  if (files.length === 0) throw new Error("the governed corpus is empty");
  const lines = files.map((file) => `${digestOf(file)}  ${file}`);
  const root = createHash("sha256").update(`${lines.join("\n")}\n`).digest("hex");
  const header = [
    "# AnvilKit governance corpus — SHA-256 freeze manifest",
    `# Generated: ${date} (Gate 0, ADR-023 anchoring)`,
    `# Scope: ${INCLUDED_TREES.map((tree) => `${tree}/**`).join(", ")}, ${INCLUDED_FILES.join(", ")}`,
    `# Excluded (mutable working artifacts, not frozen governance rules): ${EXCLUDED_TREES.map((tree) => `${tree}/**`).join(",\\n#   ")}`,
    "# Root digest = SHA-256 over the sorted digest lines below, LF-joined with trailing LF.",
    "# Per ADR-023: this manifest is local-only; record the ROOT line in the baseline commit",
    "# message to anchor it in Git. Hashes prove content — they cannot recover it.",
    "# Regenerate with: bun scripts/governance-manifest.ts --date <YYYY-MM-DD> --out <this file>",
    "#",
  ].join("\n");
  return { manifest: `${header}\n${lines.join("\n")}\n#\nROOT ${root}\n`, root, count: files.length };
}

function main(): void {
  const args = process.argv.slice(2);
  const dateIndex = args.indexOf("--date");
  if (dateIndex < 0 || !args[dateIndex + 1]) {
    throw new Error("--date <YYYY-MM-DD> is required so the manifest names the corpus it measured");
  }
  const date = args[dateIndex + 1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`--date must be YYYY-MM-DD, got ${date}`);
  const outIndex = args.indexOf("--out");
  if (outIndex < 0 || !args[outIndex + 1]) {
    throw new Error("--out <path> is required; the manifest's governed location is not this tool's to name");
  }
  const output = resolve(repositoryRoot, args[outIndex + 1]);
  const { manifest, root, count } = render(date);
  if (args.includes("--check")) {
    const recorded = readFileSync(output, "utf8");
    if (recorded !== manifest) {
      console.error(`the governance manifest for ${date} has drifted from the corpus it measures`);
      process.exit(1);
    }
    console.log(`governance manifest ${date}: ${count} files, ROOT ${root} (verified)`);
    return;
  }
  writeFileSync(output, manifest);
  console.log(`governance manifest ${date}: ${count} files, ROOT ${root}`);
  console.log(`written to ${relative(repositoryRoot, output)}`);
}

try {
  main();
} catch (error) {
  console.error(`governance manifest failed: ${(error as Error).message}`);
  process.exit(1);
}
