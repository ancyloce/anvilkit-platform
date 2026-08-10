// Fail-closed validator for externally produced M7 evidence. It verifies the
// release authorization envelope, not the external systems that created it.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const evidencePath = process.env.M7_PRODUCTION_EVIDENCE;
if (!evidencePath) throw new Error("M7_PRODUCTION_EVIDENCE must name the approved production evidence manifest");
const evidence = JSON.parse(readFileSync(resolve(evidencePath), "utf8"));
const mode = process.env.M7_EVIDENCE_MODE ?? "prepublish";
const expectedCommit = process.env.M7_RELEASE_COMMIT;
const digest = /^sha256:[0-9a-f]{64}$/;
const commit = /^[0-9a-f]{40}$/;
const failures: string[] = [];

if (evidence.evidenceVersion !== 1 || evidence.status !== (mode === "postpublish" ? "published" : "approved-for-publication")) failures.push(`evidence status is invalid for ${mode}`);
if (!commit.test(evidence.releaseCommit) || (expectedCommit && evidence.releaseCommit !== expectedCommit)) failures.push("evidence does not bind the release commit");
const releaseFields = ["semanticBomDigest", "ociManifestDigest", "evidenceManifestDigest"];
if (JSON.stringify(Object.keys(evidence.release ?? {})) !== JSON.stringify(releaseFields)) failures.push("release identity fields differ");
for (const name of releaseFields) if (!digest.test(String(evidence.release?.[name]))) failures.push(`release ${name} is not an immutable SHA-256 digest`);

const tasks = Array.from({length: 7}, (_, index) => `M7-T0${index + 1}`);
if (JSON.stringify(Object.keys(evidence.tasks ?? {})) !== JSON.stringify(tasks)) failures.push("production evidence task set differs from M7");
for (const task of tasks) {
  const record = evidence.tasks?.[task];
  const requiredStatus = task === "M7-T07" && mode === "prepublish" ? "authorized" : "passed";
  if (record?.status !== requiredStatus) failures.push(`${task} is not ${requiredStatus}`);
  if (!Array.isArray(record?.evidence) || record.evidence.length === 0) failures.push(`${task} has no external evidence`);
  for (const item of record?.evidence ?? []) {
    if (typeof item.uri !== "string" || !/^(?:https|oci):\/\//.test(item.uri) || !digest.test(item.sha256)) failures.push(`${task} has a mutable or malformed evidence reference`);
  }
  if (!Array.isArray(record?.approvals) || record.approvals.length === 0) failures.push(`${task} has no owner approval`);
  for (const approval of record?.approvals ?? []) {
    if (!approval.role || !approval.principal || Number.isNaN(Date.parse(approval.approvedAt))) failures.push(`${task} has a malformed owner approval`);
  }
}

if (evidence.publication?.authorized !== true) failures.push("publication is not explicitly authorized");
if (mode === "prepublish" && evidence.publication.discoverable !== false) failures.push("candidate became discoverable before publication gates completed");
if (mode === "postpublish" && (evidence.publication.discoverable !== true || Number.isNaN(Date.parse(evidence.publication.publishedAt)))) failures.push("post-publication evidence lacks discovery time");

if (failures.length) {
  console.error("M7 production evidence FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log(`M7 ${mode} production evidence passed for ${evidence.releaseCommit}`);
