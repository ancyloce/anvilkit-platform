// Canonicalization and identity reference adapter.
//
// This dependency-free implementation makes the selected RFC 8785 and
// AnvilKitIdentityV1 profiles executable for corpus development. It is not an
// approved runtime implementation: production use remains gated by DP-008,
// four-language parity, and Security/Platform Contracts approval.

import { createHash, timingSafeEqual } from "node:crypto";
import type { JsonValue } from "./strict-json.ts";

const COMPONENT_PREFIX = Buffer.from("anvilkit.component.identity.v1\0", "utf8");
const BOM_PREFIX = Buffer.from("anvilkit.contract-bom.identity.v1\0", "utf8");
const BOM_MEDIA_TYPE = "application/vnd.anvilkit.contract-bom+json";
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const PURPOSE = /^[\x21-\x7e]+$/;
const MEDIA_TYPE = /^[a-z0-9][a-z0-9.+-]*\/[a-z0-9][a-z0-9.+-]*$/;

export class IdentityProfileError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "IdentityProfileError";
  }
}

function assertUnicodeScalarString(value: string, label: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new IdentityProfileError("JCS_INVALID_UNICODE", `${label} contains an unpaired high surrogate`);
      }
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      throw new IdentityProfileError("JCS_INVALID_UNICODE", `${label} contains an unpaired low surrogate`);
    }
  }
}

function serialize(value: JsonValue, path: string): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    if (typeof value === "string") assertUnicodeScalarString(value, path);
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new IdentityProfileError("JCS_NUMBER_RANGE", `${path} is not a finite binary64 number`);
    }
    if (Object.is(value, -0)) {
      throw new IdentityProfileError("JCS_NEGATIVE_ZERO", `${path} is negative zero`);
    }
    // Unsafe integer *tokens* are rejected by strict admission before this
    // function is called. JCS itself must still serialize finite binary64
    // values such as 1e+30, which happen to satisfy Number.isInteger().
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item, index) => serialize(item, `${path}/${index}`)).join(",")}]`;
  }
  if (typeof value !== "object") {
    throw new IdentityProfileError("JCS_UNSUPPORTED_VALUE", `${path} is not JSON data`);
  }

  // ECMAScript's default string sort is an unsigned UTF-16 code-unit sort,
  // which is the ordering RFC 8785 requires. Property names are serialized
  // only after sorting their unescaped form.
  const keys = Object.keys(value).sort();
  const fields = keys.map((key) => {
    assertUnicodeScalarString(key, `${path} property name`);
    const childPath = `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
    return `${JSON.stringify(key)}:${serialize(value[key], childPath)}`;
  });
  return `{${fields.join(",")}}`;
}

export function canonicalizeJcs(value: JsonValue): Uint8Array {
  return Buffer.from(serialize(value, ""), "utf8");
}

function sha256Wire(chunks: readonly Uint8Array[]): string {
  const hash = createHash("sha256");
  chunks.forEach((chunk) => hash.update(chunk));
  return `sha256:${hash.digest("hex")}`;
}

function assertPurpose(purpose: string, allowedPurposes: ReadonlySet<string>): void {
  if (!PURPOSE.test(purpose) || purpose.includes("\0")) {
    throw new IdentityProfileError("IDENTITY_PURPOSE_INVALID", "purpose must be non-empty printable ASCII without NUL");
  }
  if (purpose === "contract-bom") {
    throw new IdentityProfileError("IDENTITY_PURPOSE_RESERVED", "contract-bom is reserved to ContractBomIdentityV1");
  }
  if (!allowedPurposes.has(purpose)) {
    throw new IdentityProfileError("IDENTITY_PURPOSE_UNKNOWN", "purpose is absent from the pinned registry snapshot");
  }
}

function assertMediaType(mediaType: string): void {
  if (!MEDIA_TYPE.test(mediaType) || !/^[\x21-\x7e]+$/.test(mediaType) || mediaType.includes("\0")) {
    throw new IdentityProfileError("IDENTITY_MEDIA_TYPE_INVALID", "mediaType is not a restricted lowercase ASCII media type");
  }
}

export function componentIdentity(
  value: JsonValue,
  purpose: string,
  mediaType: string,
  allowedPurposes: ReadonlySet<string>,
): string {
  assertPurpose(purpose, allowedPurposes);
  assertMediaType(mediaType);
  return sha256Wire([
    COMPONENT_PREFIX,
    Buffer.from(purpose, "ascii"),
    Buffer.from([0]),
    Buffer.from(mediaType, "ascii"),
    Buffer.from([0]),
    canonicalizeJcs(value),
  ]);
}

function bomWithoutDigest(value: JsonValue): JsonValue {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new IdentityProfileError("BOM_SHAPE_INVALID", "ContractBomIdentityV1 requires a root object");
  }
  if (!Object.hasOwn(value, "digest")) {
    throw new IdentityProfileError("BOM_DIGEST_MISSING", "root BOM must declare its digest before verification");
  }
  const result: { [key: string]: JsonValue } = Object.create(null) as { [key: string]: JsonValue };
  for (const [key, item] of Object.entries(value)) {
    if (key !== "digest") result[key] = item;
  }
  return result;
}

export function canonicalBomBytesWithoutDigest(value: JsonValue): Uint8Array {
  return canonicalizeJcs(bomWithoutDigest(value));
}

export function contractBomIdentity(value: JsonValue): string {
  return sha256Wire([
    BOM_PREFIX,
    Buffer.from(BOM_MEDIA_TYPE, "ascii"),
    Buffer.from([0]),
    canonicalBomBytesWithoutDigest(value),
  ]);
}

export function verifyContractBomIdentity(value: JsonValue): boolean {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const declared = value.digest;
  if (typeof declared !== "string" || !DIGEST.test(declared)) return false;
  const calculated = contractBomIdentity(value);
  return timingSafeEqual(Buffer.from(declared, "ascii"), Buffer.from(calculated, "ascii"));
}
