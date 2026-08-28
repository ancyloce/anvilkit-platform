// Regression suite for the capability-based naming guard. Every forbidden
// label here is composed at run time from a prefix and a digit held
// separately, and every governed name is read from the guard itself rather
// than spelled out, so this file's own source stays clean under the very scan
// it exercises: spelling one out would fail the check it protects.

import { expect, test } from "bun:test";
import {
  allowlistFor,
  canonicalScopeNames,
  committablePaths,
  contentScan,
  governedLocations,
  measurementNames,
  pathScan,
  sourceScan,
  LABELS,
} from "./naming-governance.ts";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PREFIXES = [
  "m", "M", "wp", "WP", "Wp", "p", "P",
  "work-package-", "work_package_", "WORK-PACKAGE-", "Work_Package_", "workpackage", "work.package.",
  "milestone-", "MILESTONE_", "Milestone.", "milestone",
  "phase-", "PHASE_", "Phase.",
  "gate-", "GATE_", "Gate.", "gate",
];
const DIGITS = ["0", "1", "3", "4", "8", "12"];

const locations = governedLocations();
// The allowlist an ordinary file is judged under. It admits no delivery label
// at all -- not even the canonical scope identity, which is readable only at
// the exact governance-owned paths that own it.
const ordinary = allowlistFor("scripts/naming-governance.test.ts", locations);
// The allowlist the canonical profile artifact itself is judged under.
const canonicalPath = "contracts/agent/profile/" + canonicalScopeNames[0] + ".json";
const canonical = allowlistFor(canonicalPath, locations);

test("every delivery-label variant is rejected in a name", () => {
  for (const prefix of PREFIXES) {
    for (const digits of DIGITS) {
      const label = prefix + digits;
      for (const subject of [
        `scripts/agent-service-${label}-budget.ts`,
        `packages/contracts-codegen/${label}/generate.ts`,
        `docs/acceptance/${label}/results.json`,
        `infra/k8s/${label}-deployment.yaml`,
      ]) {
        expect(pathScan(subject, ordinary), `path ${subject}`).not.toBe("");
      }
    }
  }
});

test("every delivery-label variant is rejected in content", () => {
  for (const prefix of PREFIXES) {
    for (const digits of DIGITS) {
      const label = prefix + digits;
      for (const subject of [
        `// the ${label} reconciliation sweep`,
        `run: bun scripts/agent-service-${label}-audit.ts`,
        `anvilkit_agent_service_${label}_total`,
        `AGENT_SERVICE_${label}_ENABLED: true`,
        `test("${label} reconciles", () => {});`,
        `"evidenceName": "${label}-report.json"`,
      ]) {
        expect(contentScan(subject, ordinary), `content ${subject}`).not.toBe("");
      }
      // A label opening an identifier is followed by an uppercase letter the
      // text scan cannot admit; one buried mid-identifier has no separator
      // before it either, and reaches the reader as a camel-case hump. Only
      // the source pass sees both.
      const hump = label[0].toUpperCase() + label.slice(1);
      for (const subject of [`const ${label}Policy = readJSON(path);`, `function reconcile${hump}Holds() {}`]) {
        expect(sourceScan(subject, ordinary), `source ${subject}`).not.toBe("");
      }
    }
  }
});

test("capability-based names remain valid", () => {
  for (const subject of [
    "scripts/agent-service-resource-budget.ts",
    "scripts/agent-service-release-evidence-audit.ts",
    "scripts/naming-governance.ts",
    "docs/acceptance/agent-service/budget-reconciliation/results.json",
    "internal/recovery/operator-recovery.go",
    "internal/budget/cancellation-fencing.go",
    "packages/contracts-codegen/contract-validation.ts",
  ]) {
    expect(pathScan(subject, ordinary), `path ${subject}`).toBe("");
    expect(contentScan(subject, ordinary), `content ${subject}`).toBe("");
  }
  for (const subject of [
    "// RecoverSupersededFinality settles finalized superseded holds",
    "// ConcludeCancelledRun settles a cancelled run after reconciled finality",
    "anvilkit_agent_service_budget_reconciliation_total",
    "const budgetReconciliation = readJSON(path);",
    "const baselineArrivalThroughputPerSecond = measured;",
    "beyond-kernel preview operation present in the surface",
    // Ordinary words that merely contain a forbidden prefix must not trip: the
    // label has to stand alone as a token.
    "compileTemplate2Digest",
    "sha256:abc123def456",
    "the map4 helper is not a milestone",
  ]) {
    expect(contentScan(subject, ordinary), `content ${subject}`).toBe("");
  }
  // Measurement vocabulary is not a delivery label and is readable anywhere.
  for (const name of measurementNames) {
    expect(contentScan(`"${name}Milliseconds": 120`, ordinary), `measurement ${name}`).toBe("");
  }
  expect(contentScan("createP95Milliseconds: 300,", ordinary)).toBe("");
  // Ordinary camel-cased names carry no hump, so the source pass leaves them be.
  for (const subject of ["const item0Total = 1;", "let sum0Bytes = 0;", "checksum256Digest"]) {
    expect(sourceScan(subject, ordinary), `source ${subject}`).toBe("");
  }
});

test("canonical scope names are readable only at governed locations", () => {
  for (const name of canonicalScopeNames) {
    for (const subject of [name, `"stability": "${name}"`, `the ${name} Profile pins the canonical contract set`]) {
      // Readable at the exact governance-owned path that owns the name.
      expect(contentScan(subject, canonical), `governed content ${subject}`).toBe("");
      // Rejected everywhere else, which is the narrowing this guard exists for.
      expect(contentScan(subject, ordinary), `ordinary content ${subject}`).not.toBe("");
    }
    // A governed location excuses the canonical name it owns and nothing else.
    for (const other of [`internal/${"m" + "8"}/store.go`, `// the ${"phase-" + "2"} sweep`]) {
      expect(contentScan(other, canonical), `unrelated label ${other}`).not.toBe("");
    }
  }
});

test("governed locations are derived from the canonical lock", () => {
  // The canonical profile and every source the ADR-018 lock enumerates are
  // governed; an ordinary source file never is, whatever it contains.
  expect(locations.has(canonicalPath)).toBe(true);
  expect(locations.has("contracts/agent/lock/contracts.lock.json")).toBe(true);
  expect(locations.has("contracts/agent/schemas/agent-run.schema.json")).toBe(true);
  expect(locations.has("scripts/dependency-audit.ts")).toBe(false);
  expect(locations.has("packages/contracts-codegen/generate.ts")).toBe(false);
  // An absent lock yields no contract locations at all: the scan gets stricter
  // when the authority is missing, never looser.
  const withoutLock = governedLocations("/nonexistent-repository-root");
  expect(withoutLock.has(canonicalPath)).toBe(false);
  expect(withoutLock.has("contracts/agent/schemas/agent-run.schema.json")).toBe(false);
});

test("no delivery label may name a path outside a governed location", () => {
  // The scope identity may never name a new file: an allowance that could
  // create delivery-labelled artifacts is not an exception, it is a rename
  // waiting to happen.
  for (const name of canonicalScopeNames) {
    const lowered = name.toLowerCase();
    for (const subject of [`internal/${lowered}/store.go`, `docs/acceptance/${lowered}/report.json`]) {
      expect(pathScan(subject, ordinary), `path ${subject}`).not.toBe("");
      expect(locations.has(subject), `location ${subject}`).toBe(false);
    }
  }
});

test("the governed allowlist stays narrow", () => {
  const bare = new RegExp("^" + LABELS + "$");
  // Measurement vocabulary is the only thing readable tree-wide, and none of
  // it is a canonical scope name.
  for (const name of measurementNames) {
    expect(canonicalScopeNames.includes(name), `measurement ${name}`).toBe(false);
  }
  // A bare label is admissible only where a governed location owns it, so the
  // set of such locations has to stay small enough to review, and every entry
  // outside the derived contract set is spelled out with its reason.
  const bareCanonical = canonicalScopeNames.filter((name) => bare.test(name));
  expect(bareCanonical.length).toBeLessThanOrEqual(1);
  expect(canonicalScopeNames.length).toBeLessThanOrEqual(6);
  const explicit = [...locations.keys()].filter((file) => !file.startsWith("contracts/agent/"));
  expect(explicit.length).toBeLessThanOrEqual(8);
});

// The aggregate verification runs from a materialised committable tree, which
// carries no history on purpose. A guard that can only enumerate through git
// is unrunnable exactly where reproducibility is proven, so the tree itself is
// the enumerator there — minus what the run's own tooling writes into it.
test("a tree with no history enumerates as its own committable content", () => {
  const tree = mkdtempSync(join(tmpdir(), "naming-governance-"));
  try {
    writeFileSync(join(tree, "package.json"), "{}\n");
    mkdirSync(join(tree, "scripts"));
    writeFileSync(join(tree, "scripts", "verify.sh"), "#!/bin/sh\n");
    mkdirSync(join(tree, "node_modules", "left-pad"), { recursive: true });
    writeFileSync(join(tree, "node_modules", "left-pad", "index.js"), "\n");
    // A submodule is governed by its own scan, over its own tree, under its
    // own allowed names -- exactly as git's own enumeration treats it.
    writeFileSync(join(tree, ".gitmodules"), '[submodule "services/renderer"]\n\tpath = services/renderer\n');
    mkdirSync(join(tree, "services", "renderer"), { recursive: true });
    writeFileSync(join(tree, "services", "renderer", "main.go"), "package main\n");

    const found = committablePaths(tree);

    expect(found).toEqual([".gitmodules", "package.json", "scripts/verify.sh"]);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});
