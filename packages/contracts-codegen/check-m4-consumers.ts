// Validate the signed-off M4 supported-consumer compatibility matrix.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyContractBomIdentity } from "./identity.ts";
import type { JsonValue } from "./strict-json.ts";

const ROOT = join(import.meta.dir, "..", "..");
const report = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m4/consumer-compatibility.json"), "utf8"));
const bom = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m4/release-bom.json"), "utf8"));
const failures: string[] = [];

if (!verifyContractBomIdentity(bom as JsonValue)) failures.push("candidate BOM identity does not verify");
if (bom.compatibility.minimumConsumerGeneration !== 1 || bom.compatibility.maximumConsumerGeneration !== 1) failures.push("candidate BOM window is not generation 1 only");
if (report.status !== "passed" || report.rootBomDigest !== bom.digest || report.supportedConsumerGeneration !== 1) failures.push("consumer report does not bind the candidate generation");
if (report.declaredExternalConsumers.length !== 0) failures.push("undeclared external consumer execution is not supported by this report");

const expectedLanguages = ["go", "java", "python", "typescript"];
if (JSON.stringify(report.consumers.map((item: { language: string }) => item.language).sort()) !== JSON.stringify(expectedLanguages)) failures.push("consumer language set differs");
for (const consumer of report.consumers) {
  const trace = JSON.parse(readFileSync(join(ROOT, consumer.trace), "utf8"));
  if (trace.language !== consumer.language || trace.packageVersion !== consumer.packageVersion || trace.rootBomIdentity !== bom.digest) failures.push(`${consumer.language}: package trace differs from report`);
  const expected = { identity: "passed", generation1: "accepted", generation0: "CONTRACT_UNSUPPORTED", generation2: "CONTRACT_UNSUPPORTED" };
  if (JSON.stringify(consumer.outcomes) !== JSON.stringify(expected)) failures.push(`${consumer.language}: compatibility outcomes differ`);
}

const approvalBytes = readFileSync(join(ROOT, report.approval.evidence));
if (createHash("sha256").update(approvalBytes).digest("hex") !== report.approval.sha256) failures.push("consumer approval digest differs");
for (const role of ["Go owner", "TypeScript owner", "Python owner", "Java owner", "Platform Contracts owner", "Security"]) {
  if (!report.approval.roles.includes(role)) failures.push(`missing consumer approval role ${role}`);
}

if (failures.length) {
  console.error("M4 consumer compatibility FAILED:");
  failures.sort().forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(`M4 consumer compatibility valid: ${report.consumers.length} package consumers accept generation 1 and reject generations 0 and 2`);
