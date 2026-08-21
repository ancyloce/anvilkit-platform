// Regression suite for the capability-based naming guard. Every forbidden
// label here is composed at run time from a prefix and a digit held
// separately, so this file's own source stays clean under the very scan it
// exercises: spelling one out would fail the check it protects.

import { expect, test } from "bun:test";
import { contentScan, governedContentNames, governedPathNames, pathScan, sourceScan, LABELS } from "./naming-governance.ts";

const PREFIXES = [
  "m", "M", "wp", "WP", "Wp", "p", "P",
  "work-package-", "work_package_", "WORK-PACKAGE-", "Work_Package_", "workpackage", "work.package.",
  "milestone-", "MILESTONE_", "Milestone.", "milestone",
  "phase-", "PHASE_", "Phase.",
  "gate-", "GATE_", "Gate.", "gate",
];
const DIGITS = ["0", "1", "3", "4", "8", "12"];

// The profile scope identity ADR-018 established is readable inside governed
// contract prose, so it is the one label the content tier admits. That it can
// never become a name is proved separately, below.
const GOVERNED_SCOPE = new Set(["p0", "phase0"]);

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
        expect(pathScan(subject), `path ${subject}`).not.toBe("");
      }
    }
  }
});

test("every delivery-label variant is rejected in content", () => {
  for (const prefix of PREFIXES) {
    for (const digits of DIGITS) {
      const label = prefix + digits;
      if (GOVERNED_SCOPE.has(label.toLowerCase())) continue;
      for (const subject of [
        `// the ${label} reconciliation sweep`,
        `run: bun scripts/agent-service-${label}-audit.ts`,
        `anvilkit_agent_service_${label}_total`,
        `AGENT_SERVICE_${label}_ENABLED: true`,
        `test("${label} reconciles", () => {});`,
        `"evidenceName": "${label}-report.json"`,
      ]) {
        expect(contentScan(subject), `content ${subject}`).not.toBe("");
      }
      // A label opening an identifier is followed by an uppercase letter the
      // text scan cannot admit; one buried mid-identifier has no separator
      // before it either, and reaches the reader as a camel-case hump. Only
      // the source pass sees both.
      const hump = label[0].toUpperCase() + label.slice(1);
      for (const subject of [`const ${label}Policy = readJSON(path);`, `function reconcile${hump}Holds() {}`]) {
        expect(sourceScan(subject), `source ${subject}`).not.toBe("");
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
    "packages/contracts-codegen/contract-validation.ts",
  ]) {
    expect(pathScan(subject), `path ${subject}`).toBe("");
    expect(contentScan(subject), `content ${subject}`).toBe("");
  }
  for (const subject of [
    "// RecoverSupersededFinality settles finalized superseded holds",
    "anvilkit_agent_service_budget_reconciliation_total",
    "const budgetReconciliation = readJSON(path);",
    "beyond-kernel preview operation present in the surface",
    // Ordinary words that merely contain a forbidden prefix must not trip: the
    // label has to stand alone as a token.
    "compileTemplate2Digest",
    "sha256:abc123def456",
    "the map4 helper is not a milestone",
  ]) {
    expect(contentScan(subject), `content ${subject}`).toBe("");
  }
  // Ordinary camel-cased names carry no hump, so the source pass leaves them be.
  for (const subject of ["const item0Total = 1;", "let sum0Bytes = 0;", "checksum256Digest"]) {
    expect(sourceScan(subject), `source ${subject}`).toBe("");
  }
});

test("explicitly governed canonical names remain valid", () => {
  for (const subject of [
    "contracts/agent/profile/p0-kernel-profile.json",
    "docs/adr/ADR-018-canonical-agent-contract-refactor-and-p0-kernel-profile.md",
    "docs/acceptance/p0-kernel/gate-register.json",
  ]) {
    expect(pathScan(subject), `governed path ${subject}`).toBe("");
  }
  for (const subject of [
    '"description": "Canonical P0 Agent Service HTTP contract"',
    "the P0-Kernel Profile pins the canonical contract set",
    'candidate.phase === "phase0"',
    "createP95Milliseconds: 300,",
    '"p95Milliseconds": 120',
    '"For multi-page (P1-001) routes[] is authoritative"',
    "# artifact GC is deferred (P1-008)",
  ]) {
    expect(contentScan(subject), `governed content ${subject}`).toBe("");
  }
});

test("the path tier is stricter than the content tier", () => {
  // The scope identity is readable in governed prose but may never name a file,
  // which is what stops the allowlist becoming a licence to create new
  // delivery-labelled artifacts.
  for (const subject of ["internal/p0/store.go", "docs/acceptance/phase0/report.json"]) {
    expect(pathScan(subject), `path ${subject}`).not.toBe("");
    expect(contentScan(subject), `content ${subject}`).toBe("");
  }
});

test("the governed allowlist stays narrow", () => {
  const bare = new RegExp("^" + LABELS + "$");
  for (const name of governedPathNames) {
    expect(bare.test(name), `path allowlist entry ${name}`).toBe(false);
  }
  // Content entries may name a governed scope, but the list has to stay small
  // enough that every entry is a reviewable governance decision.
  expect(governedContentNames.length).toBeLessThanOrEqual(12);
});
