// Isolated OCI Distribution 1.1 tooling and registry conformance benchmark.

import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(import.meta.dir, "..", "..");
const oras = process.env.ORAS ?? "oras";
const registry = process.env.OCI_REGISTRY ?? "registry";
const registryKind = process.env.OCI_REGISTRY_KIND ?? "distribution";
const host = process.env.OCI_TEST_HOST ?? "127.0.0.1:5508";
const workspace = mkdtempSync(join(tmpdir(), "anvilkit-m0-oci-"));
const config = join(workspace, registryKind === "zot" ? "registry.json" : "registry.yml");

if (registryKind === "zot") {
  const [address, port] = host.split(":");
  writeFileSync(config, JSON.stringify({
    distSpecVersion: "1.1.1",
    storage: { rootDirectory: join(workspace, "data") },
    http: { address, port: Number(port) },
    log: { level: "error" },
  }));
} else {
  writeFileSync(config, `version: 0.1\nlog:\n  level: error\nstorage:\n  filesystem:\n    rootdirectory: ${join(workspace, "data")}\nhttp:\n  addr: ${host}\n`);
}
cpSync(join(ROOT, "contracts/governance/m4/release-bom.json"), join(workspace, "candidate-bom.json"));
writeFileSync(join(workspace, "signature.json"), '{"kind":"synthetic-m0-signature-referrer"}\n');
writeFileSync(join(workspace, "sbom.json"), '{"bomFormat":"CycloneDX","specVersion":"1.6","version":1}\n');
writeFileSync(join(workspace, "provenance.json"), '{"_type":"https://in-toto.io/Statement/v1","subject":[]}\n');

function run(command: string, args: string[]): string {
  const result = Bun.spawnSync([command, ...args], { cwd: workspace, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) throw new Error(`${command} ${args[0]} failed: ${result.stderr.toString()}`);
  return result.stdout.toString().trim();
}

async function ready(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const result = Bun.spawnSync([oras, "repo", "ls", "--plain-http", host], { stdout: "ignore", stderr: "ignore" });
    if (result.exitCode === 0) return;
    await Bun.sleep(50);
  }
  throw new Error("isolated registry did not become ready");
}

function referrers(raw: string): Array<{ artifactType?: string }> {
  const value = JSON.parse(raw);
  return value.referrers ?? value.manifests ?? [];
}

const server = Bun.spawn([registry, "serve", config], { cwd: workspace, stdout: "pipe", stderr: "pipe" });
const samples: number[] = [];
const artifactTypes = [
  ["application/vnd.dev.cosign.simplesigning.v1+json", "signature.json"],
  ["application/vnd.cyclonedx+json", "sbom.json"],
  ["application/vnd.in-toto+json", "provenance.json"],
];

try {
  await ready();
  for (let repetition = 1; repetition <= 5; repetition++) {
    const started = Bun.nanoseconds();
    const source = `${host}/anvilkit/m0-${repetition}:candidate`;
    const mirror = `${host}/anvilkit/m0-mirror-${repetition}:candidate`;
    run(oras, ["push", "--plain-http", "--no-tty", "--artifact-type", "application/vnd.anvilkit.contract-bom.v1+json", source,
      "candidate-bom.json:application/vnd.anvilkit.contract-bom.v1+json"]);
    const digest = run(oras, ["resolve", "--plain-http", source]);
    if (!/^sha256:[0-9a-f]{64}$/.test(digest)) throw new Error(`invalid resolved digest ${digest}`);
    run(oras, ["manifest", "fetch", "--plain-http", `${source.split(":candidate")[0]}@${digest}`]);
    for (const [artifactType, file] of artifactTypes) {
      run(oras, ["attach", "--plain-http", "--no-tty", "--distribution-spec", "v1.1-referrers-api", "--artifact-type", artifactType,
        `${source.split(":candidate")[0]}@${digest}`, `${file}:application/json`]);
    }
    const discovered = referrers(run(oras, ["discover", "--plain-http", "--distribution-spec", "v1.1-referrers-api", "--format", "json", "--depth", "1",
      `${source.split(":candidate")[0]}@${digest}`]));
    if (discovered.length !== 3) throw new Error(`expected three source referrers, got ${discovered.length}`);
    run(oras, ["cp", "--from-plain-http", "--to-plain-http", "--recursive", "--from-distribution-spec", "v1.1-referrers-api",
      "--to-distribution-spec", "v1.1-referrers-api", `${source.split(":candidate")[0]}@${digest}`, mirror]);
    if (run(oras, ["resolve", "--plain-http", mirror]) !== digest) throw new Error("mirror changed the subject digest");
    const mirrorReferrers = referrers(run(oras, ["discover", "--plain-http", "--distribution-spec", "v1.1-referrers-api", "--format", "json", "--depth", "1", mirror]));
    if (mirrorReferrers.length !== 3) throw new Error(`expected three mirror referrers, got ${mirrorReferrers.length}`);
    const pull = join(workspace, `pull-${repetition}`);
    mkdirSync(pull);
    run(oras, ["pull", "--plain-http", "--output", pull, `${source.split(":candidate")[0]}@${digest}`]);
    if (!readFileSync(join(pull, "candidate-bom.json")).equals(readFileSync(join(workspace, "candidate-bom.json")))) throw new Error("digest pull changed payload bytes");
    samples.push(Bun.nanoseconds() - started);
  }
} finally {
  server.kill();
  await server.exited;
}

const sorted = [...samples].sort((left, right) => left - right);
const sourceBytes = readFileSync(join(workspace, "candidate-bom.json"));
console.log(JSON.stringify({
  recordVersion: 1,
  status: "passed",
  candidate: { client: run(oras, ["version"]).split("\n")[0], registry: registryKind },
  target: { protocol: "OCI Distribution 1.1 referrers API", transport: "isolated loopback HTTP", authentication: "not evaluated locally" },
  repetitions: 5,
  samples: samples.map((elapsedNanoseconds, index) => ({ repetition: index + 1, elapsedNanoseconds })),
  p50LatencyNanoseconds: sorted[2],
  p95LatencyNanoseconds: sorted[4],
  payloadBytes: sourceBytes.length,
  payloadSha256: createHash("sha256").update(sourceBytes).digest("hex"),
  assertions: ["push", "immutable-digest-resolve", "manifest-fetch-by-digest", "three-referrers-api", "recursive-mirror-copy", "mirror-digest-preserved", "mirror-referrers-preserved", "payload-bytes-preserved"],
}));
