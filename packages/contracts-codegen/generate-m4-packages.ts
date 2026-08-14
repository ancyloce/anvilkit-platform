// Pinned four-language M4 package generation.

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
const LOCK = JSON.parse(readFileSync(join(import.meta.dir, "m4-generators.lock.json"), "utf8"));
const RELEASE_BOM = JSON.parse(readFileSync(join(ROOT, "contracts", "governance", "m4", "release-bom.json"), "utf8"));
const OPENAPI_NAMES = ["agent-service", "pagix-agent-integration"];
const workspace = mkdtempSync(join(tmpdir(), "anvilkit-m4-generation-"));

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
    if (name === "__pycache__" || name.endsWith(".pyc")) continue;
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

for (const name of readdirSync(join(ROOT, "contracts", "schemas", "v1")).filter((item) => item.endsWith(".schema.json")).sort()) {
  const path = join(ROOT, "contracts", "schemas", "v1", name);
  sourceIdentities.push({ path: relative(ROOT, path), sha256: sha256(readFileSync(path)) });
}
for (const name of OPENAPI_NAMES) {
  const sourcePath = join(ROOT, "contracts", "openapi", "v1", `${name}.openapi.json`);
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
    rootBomIdentity: RELEASE_BOM.digest,
    rootBomState: "composed-candidate-unpublished",
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
  write(join(output, "trace.json"), trace("go", output, ["goOpenApi", "goJsonSchema"]));
}

async function generateTypeScript(): Promise<void> {
  const output = join(ROOT, "packages", "contracts-typescript", "src", "generated");
  rmSync(output, { recursive: true, force: true });
  const schema = await compile(schemaBundle, "AnvilKitContractsV1", {
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

function generatePython(): void {
  const packageRoot = join(ROOT, "packages", "contracts-python");
  const schemaOutput = join(packageRoot, "anvilkit_contracts", "generated");
  for (const path of [schemaOutput, join(packageRoot, "anvilkit_agent_client"), join(packageRoot, "anvilkit_pagix_client")]) {
    rmSync(path, { recursive: true, force: true });
  }
  run(process.env.DATAMODEL_CODEGEN ?? "datamodel-codegen", [
    "--input", bundlePath,
    "--input-file-type", "jsonschema",
    "--output", join(schemaOutput, "contracts.py"),
    "--output-model-type", "pydantic_v2.BaseModel",
    "--target-python-version", "3.12",
    "--no-allow-remote-refs",
    "--formatters", "builtin",
    "--disable-timestamp",
  ]);
  write(join(schemaOutput, "__init__.py"), "from .contracts import *  # noqa: F403\n");
  const jar = process.env.OPENAPI_GENERATOR_JAR!;
  for (const name of OPENAPI_NAMES) {
    const packageName = name === "agent-service" ? "anvilkit_agent_client" : "anvilkit_pagix_client";
    const target = join(workspace, `python-${name}`);
    run("java", ["-jar", jar, "generate", "-g", "python", "-i", projectedOpenApi.get(name)!, "-o", target,
      "-p", `packageName=${packageName},projectName=${packageName},packageVersion=${LOCK.packageVersion},hideGenerationTimestamp=true`,
      "--global-property", "apiDocs=false,modelDocs=false,apiTests=false,modelTests=false"]);
    cpSync(join(target, packageName), join(packageRoot, packageName), { recursive: true });
  }
  const traced = join(packageRoot, "anvilkit_contracts", "generated");
  write(join(traced, "trace.json"), trace("python", [schemaOutput, join(packageRoot, "anvilkit_agent_client"), join(packageRoot, "anvilkit_pagix_client")], ["pythonOpenApi", "pythonJsonSchema"]));
}

function generateJava(): void {
  const packageRoot = join(ROOT, "packages", "contracts-java");
  const generatedRoot = join(packageRoot, "src", "main", "java", "dev", "anvilkit", "contracts", "generated");
  rmSync(generatedRoot, { recursive: true, force: true });
  const classpath = process.env.JSONSCHEMA2POJO_CLASSPATH!;
  run("java", ["-cp", classpath, "org.jsonschema2pojo.cli.Jsonschema2PojoCLI",
    "--source", bundlePath,
    "--target", join(workspace, "java-schema"),
    "--package", "dev.anvilkit.contracts.generated.schema",
    "--annotation-style", "NONE",
    "--target-version", "17",
    "--use-title-as-classname",
    "--omit-generated-annotation",
    "-log", "error"]);
  cpSync(join(workspace, "java-schema", "dev", "anvilkit", "contracts", "generated", "schema"), join(generatedRoot, "schema"), { recursive: true });
  const jar = process.env.OPENAPI_GENERATOR_JAR!;
  for (const name of OPENAPI_NAMES) {
    const client = name === "agent-service" ? "agentclient" : "pagixclient";
    const target = join(workspace, `java-${name}`);
    run("java", ["-jar", jar, "generate", "-g", "java", "-i", projectedOpenApi.get(name)!, "-o", target,
      "-p", `apiPackage=dev.anvilkit.contracts.generated.${client}.api,modelPackage=dev.anvilkit.contracts.generated.${client}.model,invokerPackage=dev.anvilkit.contracts.generated.${client},groupId=dev.anvilkit,artifactId=contracts-${client},artifactVersion=${LOCK.packageVersion},library=native,serializationLibrary=jackson,openApiNullable=false,supportUrlQuery=false,hideGenerationTimestamp=true`,
      "--global-property", "apiDocs=false,modelDocs=false,apiTests=false,modelTests=false"]);
    cpSync(join(target, "src", "main", "java", "dev", "anvilkit", "contracts", "generated", client), join(generatedRoot, client), { recursive: true });
  }
  const resourceRoot = join(packageRoot, "src", "main", "resources", "META-INF", "anvilkit");
  mkdirSync(resourceRoot, { recursive: true });
  write(join(resourceRoot, "generation-trace.json"), trace("java", generatedRoot, ["javaOpenApi", "javaJsonSchema"]));
}

await generateGo();
await generateTypeScript();
generatePython();
generateJava();
console.log(JSON.stringify({ status: "generated", packageVersion: LOCK.packageVersion, projections: projectionIdentities }));
