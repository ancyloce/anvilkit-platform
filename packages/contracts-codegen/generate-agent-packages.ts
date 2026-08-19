// Canonical Go and TypeScript Agent package generation (ADR-018).
//
// Reads the canonical contract tree, generates the Go and TypeScript packages
// with pinned generators, hardens the Go output, and synchronizes the Agent
// Service contract intake. Generation is deterministic: identical canonical
// bytes produce identical outputs and traces.

import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { compile } from "json-schema-to-typescript";
import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import {
  contractSchemaBundleForGeneration,
  normalizeOpenApiForGeneration,
  type JsonObject,
} from "./spec-normalization.ts";
import { hardenGeneratedGo } from "./go-generated-hardening.ts";

const ROOT = join(import.meta.dir, "..", "..");
const LOCK = JSON.parse(readFileSync(join(import.meta.dir, "agent-generators.lock.json"), "utf8"));
const OPENAPI_NAMES = ["agent-service", "pagix-agent-integration"];
const SYNC_AGENT_SERVICE = !process.argv.includes("--skip-agent-service");
const workspace = mkdtempSync(join(tmpdir(), "anvilkit-agent-generation-"));

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function write(path: string, value: string | Uint8Array): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, value);
}

function run(command: string, args: string[], stdoutPath?: string): void {
  const result = Bun.spawnSync([command, ...args], { cwd: ROOT, stdout: stdoutPath ? "pipe" : "inherit", stderr: "inherit" });
  if (result.exitCode !== 0) throw new Error(`${basename(command)} exited ${result.exitCode}`);
  if (stdoutPath) write(stdoutPath, result.stdout);
}

function filesUnder(directory: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(directory).sort()) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) files.push(...filesUnder(path));
    else files.push(path);
  }
  return files;
}

function treeIdentity(directory: string): { bytes: number; files: number; sha256: string } {
  const entries = filesUnder(directory).map((path) => {
    const bytes = readFileSync(path);
    return [relative(directory, path), bytes.length, sha256(bytes)];
  });
  return {
    bytes: entries.reduce((total, entry) => total + Number(entry[1]), 0),
    files: entries.length,
    sha256: sha256(JSON.stringify(entries)),
  };
}

const schemaBundle = contractSchemaBundleForGeneration();
const bundlePath = join(workspace, "contracts.bundle.json");
write(bundlePath, `${JSON.stringify(schemaBundle, null, 2)}\n`);
const projectedOpenApi = new Map<string, string>();
const sourceIdentities: Array<{ path: string; sha256: string }> = [];

for (const name of readdirSync(join(ROOT, "contracts", "agent", "schemas")).filter((item) => item.endsWith(".schema.json")).sort()) {
  const path = join(ROOT, "contracts", "agent", "schemas", name);
  sourceIdentities.push({ path: relative(ROOT, path), sha256: sha256(readFileSync(path)) });
}
for (const name of OPENAPI_NAMES) {
  const sourcePath = join(ROOT, "contracts", "agent", "openapi", `${name}.openapi.json`);
  const projectedPath = join(workspace, `${name}.openapi.json`);
  const projected = normalizeOpenApiForGeneration(JSON.parse(readFileSync(sourcePath, "utf8")) as JsonObject);
  write(projectedPath, `${JSON.stringify(projected, null, 2)}\n`);
  projectedOpenApi.set(name, projectedPath);
  sourceIdentities.push({ path: relative(ROOT, sourcePath), sha256: sha256(readFileSync(sourcePath)) });
}

const projectionIdentities = {
  schemaBundleSha256: sha256(readFileSync(bundlePath)),
  openapi: Object.fromEntries(OPENAPI_NAMES.map((name) => [name, sha256(readFileSync(projectedOpenApi.get(name)!))])),
};

function trace(language: string, outputDirectories: string | string[], generators: string[]): string {
  const directories = typeof outputDirectories === "string" ? [outputDirectories] : outputDirectories;
  const identities = directories.map((directory) => ({ directory: basename(directory), ...treeIdentity(directory) }));
  return `${JSON.stringify({
    traceVersion: 1,
    language,
    packageVersion: LOCK.packageVersion,
    sourceSetSha256: sha256(JSON.stringify(sourceIdentities)),
    sources: sourceIdentities,
    projections: projectionIdentities,
    generators: Object.fromEntries(generators.map((name) => [name, LOCK.generators[name]])),
    output: {
      bytes: identities.reduce((total, identity) => total + identity.bytes, 0),
      files: identities.reduce((total, identity) => total + identity.files, 0),
      sha256: sha256(JSON.stringify(identities)),
      directories: identities,
    },
  }, null, 2)}\n`;
}

async function generateGo(): Promise<void> {
  const output = join(ROOT, "packages", "contracts-go", "generated");
  rmSync(output, { recursive: true, force: true });
  run(process.env.GO_JSONSCHEMA ?? "go-jsonschema", ["-p", "schema", bundlePath], join(output, "schema", "contracts.gen.go"));
  for (const name of OPENAPI_NAMES) {
    const packageName = name === "agent-service" ? "agentclient" : "pagixclient";
    run(process.env.OAPI_CODEGEN ?? "oapi-codegen", ["-generate", "types,client", "-package", packageName, projectedOpenApi.get(name)!], join(output, packageName, "client.gen.go"));
  }
  hardenGeneratedGo(output);
  const goFiles = filesUnder(output).filter((path) => path.endsWith(".go"));
  run("gofmt", ["-w", ...goFiles]);
  write(join(output, "trace.json"), trace("go", output, ["goOpenApi", "goJsonSchema"]));
}

async function generateTypeScript(): Promise<void> {
  const output = join(ROOT, "packages", "contracts-typescript", "src", "generated");
  rmSync(output, { recursive: true, force: true });
  const schema = await compile(schemaBundle, "AnvilKitContracts", {
    additionalProperties: false,
    bannerComment: "/* Generated by json-schema-to-typescript 15.0.4. Do not edit. */",
    declareExternallyReferenced: true,
    format: false,
    strictIndexSignatures: true,
    unknownAny: true,
  });
  write(join(output, "schema.ts"), schema);
  for (const name of OPENAPI_NAMES) {
    const projected = JSON.parse(readFileSync(projectedOpenApi.get(name)!, "utf8")) as OpenAPI3;
    const generated = astToString(await openapiTS(projected, { alphabetize: true, immutable: true, silent: true }));
    write(join(output, `${name}.ts`), generated);
  }
  write(join(output, "trace.json"), trace("typescript", output, ["typescriptOpenApi", "typescriptJsonSchema"]));
}

function syncAgentServiceIntake(): void {
  const serviceRoot = join(ROOT, "services", "agent-service", "contracts");
  // canonical schema copies
  const schemaTarget = join(serviceRoot, "agent", "schemas");
  rmSync(join(serviceRoot, "schemas"), { recursive: true, force: true });
  rmSync(schemaTarget, { recursive: true, force: true });
  mkdirSync(join(schemaTarget, "meta"), { recursive: true });
  for (const name of readdirSync(join(ROOT, "contracts", "agent", "schemas")).sort()) {
    const source = join(ROOT, "contracts", "agent", "schemas", name);
    if (statSync(source).isDirectory()) continue;
    cpSync(source, join(schemaTarget, name));
  }
  cpSync(join(ROOT, "contracts", "agent", "schemas", "meta", "anvilkit-2020-12.schema.json"), join(schemaTarget, "meta", "anvilkit-2020-12.schema.json"));
  cpSync(join(ROOT, "contracts", "agent", "schemas", "meta", "source-lint-cases.json"), join(schemaTarget, "meta", "source-lint-cases.json"));
  // generated bindings and validator copies (byte-identical to packages/contracts-go)
  rmSync(join(serviceRoot, "generated"), { recursive: true, force: true });
  cpSync(join(ROOT, "packages", "contracts-go", "generated"), join(serviceRoot, "generated"), { recursive: true });
  cpSync(join(ROOT, "packages", "contracts-go", "validator", "validator.go"), join(serviceRoot, "validator", "validator.go"));
  console.log("synchronized services/agent-service/contracts intake");
}

await generateGo();
await generateTypeScript();
if (SYNC_AGENT_SERVICE) syncAgentServiceIntake();
console.log(JSON.stringify({ status: "generated", packageVersion: LOCK.packageVersion, projections: projectionIdentities }));
