// Reference security profiles. Production key custody
// remains outside this repository; these functions verify standard DSSE/JWS
// bytes against caller-supplied, pinned trust snapshots.

import { createPublicKey, timingSafeEqual, verify } from "node:crypto";
import { canonicalizeJcs } from "./identity.ts";
import { admitStrictJson, type JsonValue } from "./strict-json.ts";

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const KEY_ID = /^urn:anvilkit:key:[a-z0-9][a-z0-9:-]{14,255}$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const DSSE_PAYLOAD_TYPE = "application/vnd.anvilkit.contract-signature-statement+json";
const APPLY_TYP = "anvilkit-apply-authorization+jws";

export class SecurityProfileError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "SecurityProfileError";
  }
}

export type TrustedKey = {
  keyId: string;
  issuer: string;
  audiences: string[];
  algorithms: ("dsse-ed25519-v1" | "jws-eddsa-v1")[];
  publicKeyJwk: { kty: "OKP"; crv: "Ed25519"; x: string };
  status: "active" | "overlap" | "retired" | "revoked";
  notBefore: string;
  notAfter: string;
};

export type TrustRoot = {
  kind: "ContractTrustRoot";
  snapshotId: string;
  issuedAt: string;
  nextUpdate: string;
  maximumClockSkewSeconds: number;
  keys: TrustedKey[];
};

export type RevocationSnapshot = {
  kind: "ContractRevocationSnapshot";
  snapshotId: string;
  issuedAt: string;
  nextUpdate: string;
  revokedKeys: { keyId: string; effectiveAt: string; reason: string }[];
};

export type SignatureStatement = {
  kind: "ContractSignatureStatement";
  subject: { digest: string; size: number; purpose: string; mediaType: string };
  contractBomDigest: string;
  issuer: string;
  audience: string;
  keyId: string;
  issuedAt: string;
  notBefore: string;
  expiresAt: string;
  algorithm: "dsse-ed25519-v1";
};

export type DsseEnvelope = {
  payloadType: string;
  payload: string;
  signatures: { keyid: string; sig: string }[];
};

export type VerificationContext = {
  issuer: string;
  audience: string;
  now: string;
  trust: TrustRoot;
  revocations: RevocationSnapshot;
};

function parseInstant(value: string, label: string): number {
  if (!TIMESTAMP.test(value)) throw new SecurityProfileError("TIME_FORMAT_INVALID", `${label} must use UTC milliseconds`);
  const instant = Date.parse(value);
  if (!Number.isFinite(instant)) throw new SecurityProfileError("TIME_FORMAT_INVALID", `${label} is not an instant`);
  return instant;
}

function decodeBase64Url(value: string, label: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.includes("=")) {
    throw new SecurityProfileError("BASE64URL_INVALID", `${label} is not unpadded base64url`);
  }
  const decoded = Buffer.from(value, "base64url");
  if (decoded.toString("base64url") !== value) {
    throw new SecurityProfileError("BASE64URL_INVALID", `${label} is not canonical base64url`);
  }
  return decoded;
}

function asObject(value: JsonValue, label: string): Record<string, JsonValue> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new SecurityProfileError("PAYLOAD_SHAPE_INVALID", `${label} must be an object`);
  }
  return value;
}

function requireExactKeys(object: Record<string, JsonValue>, expected: string[], label: string): void {
  const actual = Object.keys(object).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new SecurityProfileError("PAYLOAD_SHAPE_INVALID", `${label} has missing or unknown fields`);
  }
}

function validateTrustSnapshots(context: VerificationContext): number {
  const now = parseInstant(context.now, "now");
  const skew = context.trust.maximumClockSkewSeconds * 1_000;
  if (!Number.isInteger(context.trust.maximumClockSkewSeconds) || skew < 0 || skew > 300_000) {
    throw new SecurityProfileError("TRUST_POLICY_INVALID", "maximum clock skew must be 0..300 seconds");
  }
  if (now > parseInstant(context.trust.nextUpdate, "trust.nextUpdate") + skew) {
    throw new SecurityProfileError("TRUST_SNAPSHOT_STALE", "trust root is stale");
  }
  if (now > parseInstant(context.revocations.nextUpdate, "revocations.nextUpdate") + skew) {
    throw new SecurityProfileError("REVOCATION_SNAPSHOT_STALE", "revocation snapshot is stale");
  }
  return now;
}

function trustedKey(keyId: string, algorithm: TrustedKey["algorithms"][number], context: VerificationContext): TrustedKey {
  const now = validateTrustSnapshots(context);
  const keys = context.trust.keys.filter((candidate) => candidate.keyId === keyId);
  if (keys.length !== 1) throw new SecurityProfileError("KEY_NOT_TRUSTED", "key ID is missing or ambiguous");
  const key = keys[0];
  if (key.issuer !== context.issuer || !key.audiences.includes(context.audience) || !key.algorithms.includes(algorithm)) {
    throw new SecurityProfileError("KEY_CONTEXT_MISMATCH", "key is not trusted for issuer, audience, and algorithm");
  }
  if (key.status === "revoked") throw new SecurityProfileError("KEY_REVOKED", "trust root marks key revoked");
  if (key.status !== "active" && key.status !== "overlap") {
    throw new SecurityProfileError("KEY_STATUS_DENIED", "key status cannot verify current material");
  }
  const skew = context.trust.maximumClockSkewSeconds * 1_000;
  if (now + skew < parseInstant(key.notBefore, "key.notBefore") || now - skew >= parseInstant(key.notAfter, "key.notAfter")) {
    throw new SecurityProfileError("KEY_TIME_DENIED", "key is outside its validity interval");
  }
  const revocation = context.revocations.revokedKeys.find((entry) => entry.keyId === keyId);
  if (revocation && now >= parseInstant(revocation.effectiveAt, "revocation.effectiveAt")) {
    throw new SecurityProfileError("KEY_REVOKED", "signed revocation snapshot denies key");
  }
  return key;
}

function verifyTimeWindow(notBefore: string, expiresAt: string, context: VerificationContext): void {
  const now = parseInstant(context.now, "now");
  const skew = context.trust.maximumClockSkewSeconds * 1_000;
  if (now + skew < parseInstant(notBefore, "notBefore")) throw new SecurityProfileError("NOT_YET_VALID", "material is not yet valid");
  if (now - skew >= parseInstant(expiresAt, "expiresAt")) throw new SecurityProfileError("EXPIRED", "material is expired");
}

export function dssePreAuthEncoding(payloadType: string, payload: Uint8Array): Uint8Array {
  const type = Buffer.from(payloadType, "utf8");
  return Buffer.concat([
    Buffer.from(`DSSEv1 ${type.length} `, "ascii"), type,
    Buffer.from(` ${payload.length} `, "ascii"), Buffer.from(payload),
  ]);
}

function statementFromBytes(bytes: Uint8Array): SignatureStatement {
  const value = asObject(admitStrictJson(bytes).value, "signature statement");
  requireExactKeys(value, ["kind", "subject", "contractBomDigest", "issuer", "audience", "keyId", "issuedAt", "notBefore", "expiresAt", "algorithm"], "signature statement");
  const subject = asObject(value.subject, "subject");
  requireExactKeys(subject, ["digest", "size", "purpose", "mediaType"], "subject");
  if (value.kind !== "ContractSignatureStatement" || value.algorithm !== "dsse-ed25519-v1") {
    throw new SecurityProfileError("SIGNATURE_PROFILE_INVALID", "statement profile constants differ");
  }
  for (const digest of [subject.digest, value.contractBomDigest]) {
    if (typeof digest !== "string" || !DIGEST.test(digest)) throw new SecurityProfileError("DIGEST_INVALID", "statement digest is invalid");
  }
  if (!Number.isSafeInteger(subject.size) || (subject.size as number) < 0) throw new SecurityProfileError("SIZE_INVALID", "subject size is invalid");
  if (typeof value.keyId !== "string" || !KEY_ID.test(value.keyId)) throw new SecurityProfileError("KEY_ID_INVALID", "statement key ID is invalid");
  return value as unknown as SignatureStatement;
}

export function verifyDsseEnvelope(envelope: DsseEnvelope, expected: SignatureStatement, context: VerificationContext): SignatureStatement {
  if (envelope.payloadType !== DSSE_PAYLOAD_TYPE) throw new SecurityProfileError("DSSE_PAYLOAD_TYPE_INVALID", "unexpected DSSE payload type");
  if (envelope.signatures.length !== 1) throw new SecurityProfileError("DSSE_MULTIPLICITY_INVALID", "exactly one DSSE signature is required");
  const payload = decodeBase64Url(envelope.payload, "DSSE payload");
  const signature = envelope.signatures[0];
  const statement = statementFromBytes(payload);
  if (signature.keyid !== statement.keyId) throw new SecurityProfileError("KEY_ID_MISMATCH", "envelope and statement key IDs differ");
  if (statement.issuer !== context.issuer || statement.audience !== context.audience) throw new SecurityProfileError("SIGNATURE_CONTEXT_MISMATCH", "issuer or audience differs");
  verifyTimeWindow(statement.notBefore, statement.expiresAt, context);
  const key = trustedKey(statement.keyId, "dsse-ed25519-v1", context);
  const actual = Buffer.from(canonicalizeJcs(statement as unknown as JsonValue));
  if (!timingSafeEqual(actual, payload)) throw new SecurityProfileError("NON_CANONICAL_PAYLOAD", "statement payload is not canonical JCS");
  const expectedBytes = Buffer.from(canonicalizeJcs(expected as unknown as JsonValue));
  if (!timingSafeEqual(expectedBytes, payload)) throw new SecurityProfileError("SUBJECT_CONTEXT_MISMATCH", "statement does not equal the expected context");
  const ok = verify(null, dssePreAuthEncoding(envelope.payloadType, payload), createPublicKey({ key: key.publicKeyJwk, format: "jwk" }), decodeBase64Url(signature.sig, "DSSE signature"));
  if (!ok) throw new SecurityProfileError("SIGNATURE_INVALID", "DSSE Ed25519 verification failed");
  return statement;
}

export type ApplyAuthorization = Record<string, JsonValue> & {
  keyId: string; issuer: string; audience: string; notBefore: string; expiresAt: string; authorizationId: string;
};

export function verifyApplyAuthorizationJws(compact: string, context: VerificationContext): ApplyAuthorization {
  const segments = compact.split(".");
  if (segments.length !== 3) throw new SecurityProfileError("JWS_COMPACT_INVALID", "compact JWS must have three segments");
  const header = asObject(admitStrictJson(decodeBase64Url(segments[0], "JWS protected header")).value, "protected header");
  requireExactKeys(header, ["alg", "kid", "typ"], "protected header");
  if (header.alg !== "EdDSA" || header.typ !== APPLY_TYP || typeof header.kid !== "string" || !KEY_ID.test(header.kid)) {
    throw new SecurityProfileError("JWS_HEADER_INVALID", "protected JWS header differs from the governed profile");
  }
  const payloadBytes = decodeBase64Url(segments[1], "JWS payload");
  const payload = asObject(admitStrictJson(payloadBytes).value, "ApplyAuthorization") as ApplyAuthorization;
  if (payload.kind !== "ApplyAuthorization") throw new SecurityProfileError("AUTHORIZATION_PROFILE_INVALID", "payload profile constants differ");
  if (payload.keyId !== header.kid) throw new SecurityProfileError("KEY_ID_MISMATCH", "header and payload key IDs differ");
  if (payload.issuer !== context.issuer || payload.audience !== context.audience) throw new SecurityProfileError("AUTHORIZATION_CONTEXT_MISMATCH", "issuer or audience differs");
  verifyTimeWindow(String(payload.notBefore), String(payload.expiresAt), context);
  const key = trustedKey(header.kid, "jws-eddsa-v1", context);
  const signingInput = Buffer.from(`${segments[0]}.${segments[1]}`, "ascii");
  if (!verify(null, signingInput, createPublicKey({ key: key.publicKeyJwk, format: "jwk" }), decodeBase64Url(segments[2], "JWS signature"))) {
    throw new SecurityProfileError("SIGNATURE_INVALID", "JWS Ed25519 verification failed");
  }
  return payload;
}

export class AuthorizationRedemptionSet {
  private readonly redeemed = new Map<string, string>();

  redeem(authorization: ApplyAuthorization, compactJws: string): "accepted" | "identical-retry" {
    const key = `${authorization.issuer}\0${authorization.authorizationId}`;
    const previous = this.redeemed.get(key);
    if (previous === undefined) {
      this.redeemed.set(key, compactJws);
      return "accepted";
    }
    if (previous === compactJws) return "identical-retry";
    throw new SecurityProfileError("AUTHORIZATION_REDEMPTION_CONFLICT", "issuer and authorization ID were already redeemed with different bytes");
  }
}
