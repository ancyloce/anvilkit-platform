// Deterministic synthetic conformance gate for PLAN-0003 M3-T04..T07.

import { createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalizeJcs } from "./identity.ts";
import {
  AuthorizationRedemptionSet,
  dssePreAuthEncoding,
  SecurityProfileError,
  verifyApplyAuthorizationJws,
  verifyDsseEnvelope,
  type ApplyAuthorizationV1,
  type DsseEnvelope,
  type RevocationSnapshotV1,
  type SignatureStatementV1,
  type TrustRootV1,
  type VerificationContext,
} from "./security-profile.ts";
import type { JsonValue } from "./strict-json.ts";

const REPO_ROOT = join(import.meta.dir, "..", "..");
const KEY_ID_RELEASE = "urn:anvilkit:key:contracts-release:synthetic-rfc8032";
const KEY_ID_AGENT = "urn:anvilkit:key:agent-service:synthetic";
const X = "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo";
const D = "nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A";
const privateKey = createPrivateKey({ key: { kty: "OKP", crv: "Ed25519", x: X, d: D }, format: "jwk" });
const publicKeyJwk = { kty: "OKP" as const, crv: "Ed25519" as const, x: X };
const NOW = "2026-08-09T12:02:00.000Z";
const failures: string[] = [];

const trust: TrustRootV1 = {
  apiVersion: "anvilkit.io/contracts/v1", kind: "ContractTrustRoot", snapshotId: "trust.synthetic.001",
  issuedAt: "2026-08-09T00:00:00.000Z", nextUpdate: "2026-08-10T00:00:00.000Z", maximumClockSkewSeconds: 30,
  keys: [
    { keyId: KEY_ID_RELEASE, issuer: "urn:anvilkit:issuer:contracts-release", audiences: ["urn:anvilkit:audience:contract-consumers"], algorithms: ["dsse-ed25519-v1"], publicKeyJwk, status: "active", notBefore: "2026-08-01T00:00:00.000Z", notAfter: "2026-09-01T00:00:00.000Z" },
    { keyId: KEY_ID_AGENT, issuer: "urn:anvilkit:issuer:agent-service", audiences: ["urn:anvilkit:audience:pagix"], algorithms: ["jws-eddsa-v1"], publicKeyJwk, status: "active", notBefore: "2026-08-01T00:00:00.000Z", notAfter: "2026-09-01T00:00:00.000Z" },
  ],
};
const revocations: RevocationSnapshotV1 = {
  apiVersion: "anvilkit.io/contracts/v1", kind: "ContractRevocationSnapshot", snapshotId: "revocation.synthetic.001",
  issuedAt: "2026-08-09T00:00:00.000Z", nextUpdate: "2026-08-10T00:00:00.000Z", revokedKeys: [],
};
const releaseContext: VerificationContext = { issuer: "urn:anvilkit:issuer:contracts-release", audience: "urn:anvilkit:audience:contract-consumers", now: NOW, trust, revocations };
const agentContext: VerificationContext = { issuer: "urn:anvilkit:issuer:agent-service", audience: "urn:anvilkit:audience:pagix", now: NOW, trust, revocations };

function expectCode(id: string, code: string, run: () => unknown): void {
  try { run(); failures.push(`${id}: expected ${code} but operation succeeded`); }
  catch (error) {
    if (!(error instanceof SecurityProfileError)) failures.push(`${id}: non-portable error ${String(error)}`);
    else if (error.code !== code) failures.push(`${id}: expected ${code}, got ${error.code}`);
  }
}

function statementEnvelope(statement: SignatureStatementV1): DsseEnvelope {
  const payload = Buffer.from(canonicalizeJcs(statement as unknown as JsonValue));
  const signature = sign(null, dssePreAuthEncoding("application/vnd.anvilkit.contract-signature-statement.v1+json", payload), privateKey);
  return { payloadType: "application/vnd.anvilkit.contract-signature-statement.v1+json", payload: payload.toString("base64url"), signatures: [{ keyid: statement.keyId, sig: signature.toString("base64url") }] };
}

const statement: SignatureStatementV1 = {
  apiVersion: "anvilkit.io/contracts/v1", kind: "ContractSignatureStatement",
  subject: { digest: `sha256:${"a".repeat(64)}`, size: 42, purpose: "schema", mediaType: "application/schema+json" },
  contractBomDigest: `sha256:${"b".repeat(64)}`, issuer: releaseContext.issuer, audience: releaseContext.audience,
  keyId: KEY_ID_RELEASE, issuedAt: "2026-08-09T12:00:00.000Z", notBefore: "2026-08-09T12:00:00.000Z", expiresAt: "2026-08-09T13:00:00.000Z", algorithm: "dsse-ed25519-v1",
};
const envelope = statementEnvelope(statement);
verifyDsseEnvelope(envelope, statement, releaseContext);
expectCode("changed-subject", "SUBJECT_CONTEXT_MISMATCH", () => verifyDsseEnvelope(envelope, { ...statement, subject: { ...statement.subject, size: 43 } }, releaseContext));
expectCode("envelope-key-substitution", "KEY_ID_MISMATCH", () => verifyDsseEnvelope({ ...envelope, signatures: [{ ...envelope.signatures[0], keyid: KEY_ID_AGENT }] }, statement, releaseContext));
expectCode("envelope-multiplicity", "DSSE_MULTIPLICITY_INVALID", () => verifyDsseEnvelope({ ...envelope, signatures: [...envelope.signatures, envelope.signatures[0]] }, statement, releaseContext));
expectCode("changed-signature", "SIGNATURE_INVALID", () => verifyDsseEnvelope({ ...envelope, signatures: [{ ...envelope.signatures[0], sig: Buffer.alloc(64).toString("base64url") }] }, statement, releaseContext));
expectCode("expired-statement", "EXPIRED", () => verifyDsseEnvelope(statementEnvelope({ ...statement, expiresAt: "2026-08-09T12:01:00.000Z" }), { ...statement, expiresAt: "2026-08-09T12:01:00.000Z" }, releaseContext));
expectCode("stale-trust", "TRUST_SNAPSHOT_STALE", () => verifyDsseEnvelope(envelope, statement, { ...releaseContext, trust: { ...trust, nextUpdate: "2026-08-09T10:00:00.000Z" } }));
expectCode("revoked-key", "KEY_REVOKED", () => verifyDsseEnvelope(envelope, statement, { ...releaseContext, revocations: { ...revocations, revokedKeys: [{ keyId: KEY_ID_RELEASE, effectiveAt: "2026-08-09T11:00:00.000Z", reason: "synthetic compromise" }] } }));

function compactJws(payload: Record<string, unknown>, header: Record<string, unknown> = { alg: "EdDSA", kid: KEY_ID_AGENT, typ: "application/vnd.anvilkit.apply-authorization.v1+json" }): string {
  const protectedSegment = Buffer.from(JSON.stringify(header), "utf8").toString("base64url");
  const payloadSegment = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(null, Buffer.from(`${protectedSegment}.${payloadSegment}`, "ascii"), privateKey).toString("base64url");
  return `${protectedSegment}.${payloadSegment}.${signature}`;
}

const authorization = JSON.parse(readFileSync(join(REPO_ROOT, "contracts", "fixtures", "v1", "valid", "apply-authorization.minimum.json"), "utf8")) as Record<string, unknown>;
const compact = compactJws(authorization);
const verified = verifyApplyAuthorizationJws(compact, agentContext);
const redemptions = new AuthorizationRedemptionSet();
if (redemptions.redeem(verified, compact) !== "accepted" || redemptions.redeem(verified, compact) !== "identical-retry") failures.push("identical redemption semantics differ");
const changedCompact = compactJws({ ...authorization, policyDigest: `sha256:${"d".repeat(64)}` });
expectCode("authorization-redemption-conflict", "AUTHORIZATION_REDEMPTION_CONFLICT", () => redemptions.redeem(verifyApplyAuthorizationJws(changedCompact, agentContext), changedCompact));
expectCode("jws-remote-key-header", "PAYLOAD_SHAPE_INVALID", () => verifyApplyAuthorizationJws(compactJws(authorization, { alg: "EdDSA", kid: KEY_ID_AGENT, typ: "application/vnd.anvilkit.apply-authorization.v1+json", jku: "https://attacker.invalid/keys" }), agentContext));
expectCode("jws-algorithm-substitution", "JWS_HEADER_INVALID", () => verifyApplyAuthorizationJws(compactJws(authorization, { alg: "none", kid: KEY_ID_AGENT, typ: "application/vnd.anvilkit.apply-authorization.v1+json" }), agentContext));
const tamperedSegments = compact.split(".");
tamperedSegments[1] = Buffer.from(JSON.stringify({ ...authorization, approvalVersion: 2 }), "utf8").toString("base64url");
expectCode("jws-payload-tamper", "SIGNATURE_INVALID", () => verifyApplyAuthorizationJws(tamperedSegments.join("."), agentContext));
expectCode("jws-wrong-audience", "AUTHORIZATION_CONTEXT_MISMATCH", () => verifyApplyAuthorizationJws(compact, { ...agentContext, audience: "urn:anvilkit:audience:contract-consumers" }));

if (failures.length) {
  console.error("M3 security profile FAILED:"); failures.sort().forEach((failure) => console.error(`  ${failure}`)); process.exit(1);
}
console.log("M3-T04..T07 synthetic security profile valid: canonical DSSE Ed25519, compact JWS EdDSA, context/time/substitution/revocation gates, and byte-identical redemption semantics");
