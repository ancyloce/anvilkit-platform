#!/usr/bin/env bun
/**
 * Privilege-separation audit.
 *
 * The Agent Service records every authorization-changing security decision in
 * a tamper-evident protected audit. Establishing that audit — its table, its
 * append-only trigger, its payload guard, and the grant the service appends
 * under — needs a credential that owns the table. Appending to it needs a
 * credential that can do none of those things.
 *
 * Those were once the same startup path in one process. The consequence was
 * not that the service rewrote its audit; it was that it always could. A
 * long-running process configured with a credential that owns the audit table
 * owns the account of its own security decisions for as long as it runs,
 * whether it ever uses that credential or not, and every barrier on the table
 * is then a barrier the process could remove. Requiring the two credentials to
 * be different logins did not fix that, because the process was still handed
 * both.
 *
 * So the administrative credential is delivered to exactly one workload: the
 * one-shot provisioner, which exits. This gate is what keeps that true. It
 * fails when the administrative variable appears anywhere that is delivered
 * to, or read by, the long-running service — and it fails just as loudly when
 * it disappears from the provisioning workload, because a separation with
 * nothing on the other side of it is not a separation.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dir, "..");

/** The environment variable that carries the administrative audit credential. */
const ADMINISTRATIVE = "ANVILKIT_PROTECTED_AUDIT_ADMIN_URL";

/**
 * The paths the administrative credential is allowed to be named in: the
 * provisioning workload's manifest, and the one configuration loader that
 * reads it for that workload. Everything is matched as an exact
 * repository-relative path — a prefix allowance would let a file added later
 * inherit the exemption without anyone deciding to grant it.
 */
const PERMITTED = new Set([
  "infra/k8s/agent-service-protected-audit-provisioning.yaml",
  "services/agent-service/cmd/protected-audit-provisioner/main.go",
  "services/agent-service/internal/config/config.go",
  "services/agent-service/internal/config/config_test.go",
]);

/**
 * Where the credential must NOT appear: everything delivered to the running
 * service, and everything the running service reads. The service's own
 * configuration package is scanned through the permitted list above rather
 * than excluded, so the loader that legitimately names the variable is a
 * decision on the record instead of a hole in the scan.
 */
const SCANNED_TREES = [
  "infra/k8s",
  "infra/docker-compose.yml",
  "services/agent-service/cmd",
  "services/agent-service/internal",
];

/** Files whose bytes are worth reading: configuration, manifests, and Go. */
const SCANNED_SUFFIXES = [".yaml", ".yml", ".go", ".json", ".env", ".sh"];

function walk(path: string, found: string[]): void {
  let info;
  try {
    info = statSync(path);
  } catch {
    return;
  }
  if (info.isFile()) {
    if (SCANNED_SUFFIXES.some((suffix) => path.endsWith(suffix))) found.push(path);
    return;
  }
  if (!info.isDirectory()) return;
  for (const entry of readdirSync(path).sort()) {
    if (entry === ".git" || entry === "node_modules" || entry === "vendor") continue;
    walk(join(path, entry), found);
  }
}

function main(): void {
  const files: string[] = [];
  for (const tree of SCANNED_TREES) walk(resolve(repositoryRoot, tree), files);
  if (files.length === 0) {
    throw new Error("the privilege-separation audit scanned nothing; its scan roots have moved");
  }

  const failures: string[] = [];
  let provisioningNamesIt = false;
  for (const file of files) {
    const relativePath = relative(repositoryRoot, file).split("\\").join("/");
    if (!readFileSync(file, "utf8").includes(ADMINISTRATIVE)) continue;
    if (!PERMITTED.has(relativePath)) {
      failures.push(
        `${relativePath} names ${ADMINISTRATIVE}; the administrative audit credential belongs only to the one-shot provisioning workload`,
      );
      continue;
    }
    if (relativePath === "infra/k8s/agent-service-protected-audit-provisioning.yaml") {
      provisioningNamesIt = true;
    }
  }

  // The other direction. If the provisioning workload stops carrying the
  // credential, the audit is either established by something unaccounted for
  // or not established at all, and the absence of the variable everywhere
  // would read as a clean result.
  if (!provisioningNamesIt) {
    failures.push(
      `infra/k8s/agent-service-protected-audit-provisioning.yaml does not deliver ${ADMINISTRATIVE}; nothing establishes the protected audit`,
    );
  }

  if (failures.length > 0) {
    console.error("privilege-separation audit failed:");
    for (const failure of failures.sort()) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(
    `privilege-separation audit: ${files.length} files scanned, ${ADMINISTRATIVE} confined to the provisioning workload`,
  );
}

try {
  main();
} catch (error) {
  console.error(`privilege-separation audit failed: ${(error as Error).message}`);
  process.exit(1);
}
