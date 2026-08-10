// Retained PLAN-0003 M5-T05/T08 publication and rollback evidence gate.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const evidence = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m5/oci-release-drill.raw.json"), "utf8"));
const status = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m5/status.json"), "utf8"));
const rootBom = JSON.parse(readFileSync(join(ROOT, "contracts/governance/m4/release-bom.json"), "utf8"));
const failures: string[] = [];
const digest = /^sha256:[0-9a-f]{64}$/;
const sha256 = (path: string) => createHash("sha256").update(readFileSync(join(ROOT, path))).digest("hex");

if (status.status !== "complete" || status.completedTasks.length !== 8 || status.inProgressTasks.length || status.blockedTasks.length) {
  failures.push("M5 status is not complete with all eight tasks closed");
}
if (evidence.status !== "passed" || evidence.registry !== "project-zot/zot 2.1.20" || evidence.client !== "ORAS 1.3.3") {
  failures.push("M5 release evidence does not bind the approved registry/client pins");
}
if (evidence.toolPins.drillSourceSha256 !== sha256("packages/contracts-bom/drill-m5-oci.ts") ||
    evidence.toolPins.runtimeSourceSha256 !== sha256("packages/contracts-bom/bom-runtime.ts")) {
  failures.push("M5 release evidence source hashes differ from the retained implementation");
}
if (evidence.releases.length !== 2 || new Set(evidence.releases.map((release: { version: string }) => release.version)).size !== 2) {
  failures.push("retained-version inventory must contain current and previous releases");
}
for (const release of evidence.releases) {
  if (![release.bomDigest, release.ociManifestDigest, release.evidenceManifestDigest, ...release.referrerDigests].every((value: string) => digest.test(value))) {
    failures.push(`${release.version}: malformed immutable digest`);
  }
  if (release.bomDigest === release.ociManifestDigest) failures.push(`${release.version}: semantic and OCI digest namespaces collapsed`);
  if (release.referrerDigests.length !== 3 || !release.referrerDigests.includes(release.evidenceManifestDigest)) {
    failures.push(`${release.version}: signature/SBOM/provenance referrer inventory is incomplete`);
  }
  if (release.immutableTag !== `sha256-${release.ociManifestDigest.slice(7)}`) failures.push(`${release.version}: tag is not content-addressed`);
}
const previous = evidence.releases.find((release: { version: string }) => release.version === "1.0.0-previous");
const current = evidence.releases.find((release: { version: string }) => release.version === "1.0.0");
if (!previous || evidence.rollbackSelected !== previous.ociManifestDigest) failures.push("rollback did not select the retained previous digest");
if (!current || current.bomDigest !== rootBom.digest) failures.push("published current release does not bind the M4 root BOM");
for (const required of [
  "failed-publication-not-discoverable", "partial-staging-cleanup", "registry-pulled-dsse-signature-trust-verification",
  "sbom-referrer", "provenance-referrer", "atomic-discovery-update", "dual-digest-clean-resolution",
  "recursive-mirror-identity", "recursive-mirror-referrers", "compatible-old-bom-rollback",
  "rollback-does-not-modify-published-bytes", "mutable-aliases-not-used-for-resolution",
]) if (!evidence.assertions.includes(required)) failures.push(`M5 release evidence lacks ${required}`);

if (failures.length) {
  console.error("M5 release evidence FAILED:");
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log("M5-T05/T08 release evidence valid: isolated OCI publication, pulled referrers, atomic discovery, mirror, inventory, and rollback");
