import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NativeTypeScriptValidator } from "./native-validator.ts";
import { buildTypeScriptConformanceResult } from "./m4-conformance-runner.ts";
import { buildTypeScriptIdentityResult } from "./m4-identity-runner.ts";

const root = join(import.meta.dir, "..", "..");
const adapter = new NativeTypeScriptValidator(root);
const uri = "anvilkit://schema/agent-run.v1@1.0.0?digest=sha256:68949242c9b4557a8b5ff965f76de8f2de49c11523a7cc1e64cfd1b4af824233";
const valid = readFileSync(join(root, "contracts", "fixtures", "v1", "valid", "agent-run.minimum.json"));
if (adapter.validate(uri, valid).length !== 0) throw new Error("Ajv rejected valid AgentRunV1 fixture");
for (const raw of [Buffer.from('{"a":1,"a":2}'), Buffer.from([0xef, 0xbb, 0xbf, 0x7b, 0x7d]), Buffer.from('{"n":-0}')]) {
  if (adapter.validate(uri, raw)[0]?.code !== "PARSE_REJECTED") throw new Error("strict admission did not precede Ajv");
}
const conformance = buildTypeScriptConformanceResult(root);
if (conformance.cases.length !== 97) throw new Error("TypeScript conformance runner omitted mandatory cases");
const identity = buildTypeScriptIdentityResult(root);
if (identity.cases.length !== 12) throw new Error("TypeScript identity runner omitted mandatory vectors");
console.log("M4 TypeScript adapter valid: Ajv 8.20.0 Draft 2020-12, strict admission, 97 payload cases, and 12 identity vectors");
