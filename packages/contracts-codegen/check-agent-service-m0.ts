import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const path = join(root, "docs/acceptance/agent-service/m0/gate-register.json");
const register = JSON.parse(readFileSync(path, "utf8"));
const failures: string[] = [];

if (register.rule !== "No milestone or task may start while any listed entry gate is not closed.") {
  failures.push("gate register must retain the fail-closed milestone rule");
}
if (!register.architectureApproval || register.architectureApproval.gate !== "A") {
  failures.push("Gate A architecture status is missing");
}
if (register.architectureApproval?.status !== "closed" || !register.architectureApproval?.evidence) {
  failures.push("Gate A must be closed with evidence before M0 can complete");
}

const expectedSources = [
  ...Array.from({ length: 14 }, (_, i) => `design-0005-15.2-${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `prd-0014-4.17-${i + 1}`),
];
const seenIds = new Set<string>();
const seenSources = new Map<string, number>();
let skeletonBlockers = 0;

for (const entry of register.entries ?? []) {
  for (const field of ["id", "decision", "owner", "gate", "blocks", "status"] as const) {
    if (!entry[field]) failures.push(`${entry.id ?? "unknown"}: missing ${field}`);
  }
  if (seenIds.has(entry.id)) failures.push(`duplicate entry id: ${entry.id}`);
  seenIds.add(entry.id);
  if (!/^[A-J]$/.test(entry.gate)) failures.push(`${entry.id}: invalid gate ${entry.gate}`);
  if (!new Set(["open", "blocked", "proposed", "closed"]).has(entry.status)) {
    failures.push(`${entry.id}: invalid status ${entry.status}`);
  }
  if (entry.status === "closed" && !entry.evidence) failures.push(`${entry.id}: closed without evidence`);
  if (entry.skeletonBlocker) skeletonBlockers++;
  for (const source of entry.sources ?? []) seenSources.set(source, (seenSources.get(source) ?? 0) + 1);
}

for (const source of expectedSources) {
  const count = seenSources.get(source) ?? 0;
  if (count !== 1) failures.push(`${source}: expected exactly once, found ${count}`);
}
for (const source of seenSources.keys()) {
  if (!expectedSources.includes(source)) failures.push(`unexpected source reference: ${source}`);
}
if (skeletonBlockers !== 2) failures.push(`expected two skeleton blockers, found ${skeletonBlockers}`);
if (!seenIds.has("AS-TBC-004") || !seenIds.has("AS-TBC-012")) {
  failures.push("DBOS and canonical identity skeleton blockers must be retained");
}
for (const id of ["AS-TBC-004", "AS-TBC-011", "AS-TBC-012", "AS-TBC-014", "AS-TBC-016"]) {
  const entry = register.entries.find((candidate: any) => candidate.id === id);
  if (entry?.status !== "closed" || !entry?.evidence) failures.push(`${id}: M0 closure missing`);
  if (entry?.evidence && !existsSync(join(root, entry.evidence))) failures.push(`${id}: evidence file missing`);
}
for (const relative of [
  "docs/acceptance/agent-service/m0/acceptance-status.md",
  "docs/acceptance/agent-service/m0/benchmark-results.json",
  "services/agent-service/sbom.cdx.json",
]) {
  if (!existsSync(join(root, relative))) failures.push(`required M0 evidence missing: ${relative}`);
}

if (failures.length) {
  console.error("Agent Service M0 gate audit FAILED:");
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

const nonClosed = register.entries.filter((entry: any) => entry.status !== "closed");
console.log(
  `Agent Service M0 gate audit passed: ${register.entries.length} families, ` +
    `${expectedSources.length} source rows exactly once, ${nonClosed.length} non-closed entries retained fail-closed.`,
);
