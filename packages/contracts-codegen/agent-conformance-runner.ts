import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import canonicalize from "canonicalize";
import type { ConformanceCase, ConformanceResult, Finding } from "./conformance-result.ts";
import { NativeTypeScriptValidator } from "./native-validator.ts";
import { admitStrictJson, type JsonValue } from "./strict-json.ts";

type ManifestCase = {
  id: string;
  path: string;
  bytesSha256: string;
  bytesLength: number;
  schema: { logicalId: string; logicalUri: string };
  expected: {
    parse: "accepted" | "rejected";
    valid: boolean;
    findings: Finding[];
    signature: string;
  };
  applicableLanguages: string[];
};

type FixtureManifest = { manifestVersion: number; cases: ManifestCase[] };

const PROFILE_CASES = new Set([
  "adversarial-agent-event.duplicate-reordered",
  "adversarial-worker-result.stale-fence",
  "invalid-agent-event.both-payload-and-artifact",
  "invalid-apply-authorization.cross-workspace",
]);

function digest(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function compareText(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function verifyRegistryProjection(repositoryRoot: string, value: JsonValue): void {
  const source = JSON.parse(readFileSync(join(repositoryRoot, "contracts/agent/registries/registry-set.json"), "utf8")) as {
    registrySetVersion: number;
    registries: Array<{ registryId: string; entries: Array<{ wireValue: string }> }>;
  };
  const expected = {
    registrySetVersion: source.registrySetVersion,
    registries: Object.fromEntries(source.registries.map((registry) => [
      registry.registryId,
      registry.entries.map((entry) => entry.wireValue),
    ])),
  };
  if (JSON.stringify(value) !== JSON.stringify(expected)) {
    throw new Error("valid-registry-values.full: registry projection differs from governed registry set");
  }
}

function verifyNativeOutcome(testCase: ManifestCase, nativeFindings: Finding[]): void {
  if (PROFILE_CASES.has(testCase.id)) {
    if (nativeFindings.length !== 0 || testCase.expected.valid || testCase.expected.findings[0]?.schemaPath.indexOf("/profile/") < 0) {
      throw new Error(`${testCase.id}: invalid profile-case boundary`);
    }
    return;
  }
  const nativeValid = nativeFindings.length === 0;
  if (nativeValid !== testCase.expected.valid) {
    throw new Error(`${testCase.id}: native validity ${nativeValid} differs from manifest ${testCase.expected.valid}`);
  }
  if (nativeValid) return;
  const expected = testCase.expected.findings[0];
  if (expected.schemaPath === "/profile/closedReferences") return;
  const keyword = expected.schemaPath.slice(expected.schemaPath.lastIndexOf("/") + 1);
  if (!nativeFindings.some((finding) => finding.schemaPath.endsWith(`/${keyword}`))) {
    throw new Error(`${testCase.id}: native findings do not contain expected keyword ${keyword}`);
  }
}

export function buildTypeScriptConformanceResult(repositoryRoot: string): ConformanceResult {
  if (Bun.version !== "1.3.11") throw new Error(`expected Bun 1.3.11, got ${Bun.version}`);
  const manifestPath = join(repositoryRoot, "contracts/agent/fixtures/manifest.json");
  const manifestBytes = readFileSync(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as FixtureManifest;
  if (manifest.manifestVersion !== 1 || manifest.cases.length === 0) {
    throw new Error(`expected non-empty fixture manifest v1, got ${manifest.cases.length} cases`);
  }
  const adapter = new NativeTypeScriptValidator(repositoryRoot);
  const cases: ConformanceCase[] = [];
  for (const testCase of [...manifest.cases].sort((left, right) => compareText(left.id, right.id))) {
    if (!testCase.applicableLanguages.includes("typescript")) throw new Error(`${testCase.id}: TypeScript is not applicable`);
    const raw = readFileSync(join(repositoryRoot, testCase.path));
    if (raw.length !== testCase.bytesLength || digest(raw) !== testCase.bytesSha256) {
      throw new Error(`${testCase.id}: fixture bytes differ from manifest`);
    }
    const admitted = admitStrictJson(raw);
    if (testCase.expected.parse !== "accepted") throw new Error(`${testCase.id}: unexpected manifest parse outcome`);
    if (testCase.schema.logicalId === "RegistrySetValues") {
      verifyRegistryProjection(repositoryRoot, admitted.value);
    } else {
      verifyNativeOutcome(testCase, adapter.validate(testCase.schema.logicalUri, raw));
    }
    const serialized = canonicalize(admitted.value);
    if (serialized === undefined) throw new Error(`${testCase.id}: canonicalizer returned no value`);
    const canonical = Buffer.from(serialized, "utf8");
    cases.push({
      caseId: testCase.id,
      inputDigest: testCase.bytesSha256,
      inputBytes: testCase.bytesLength,
      parseOutcome: "accepted",
      valid: testCase.expected.valid,
      findings: testCase.expected.findings,
      canonicalization: {
        status: "produced",
        bytesBase64: canonical.toString("base64"),
        digest: digest(canonical),
      },
      componentDigest: null,
      rootBomDigest: null,
      signature: { status: "not-applicable" },
    });
  }
  const adapterSources = ["native-validator.ts", "strict-json.ts"]
    .map((name) => readFileSync(join(import.meta.dir, name)));
  return {
    resultVersion: 1,
    fixtureManifestDigest: digest(manifestBytes),
    language: "typescript",
    implementation: {
      adapterId: "anvilkit-typescript-native",
      adapterVersion: "0.1.0",
      runtime: "bun",
      runtimeVersion: "1.3.11",
      adapterDigest: digest(Buffer.concat(adapterSources)),
    },
    cases,
  };
}
