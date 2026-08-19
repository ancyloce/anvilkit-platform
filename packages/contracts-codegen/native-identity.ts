import { createHash, timingSafeEqual } from "node:crypto";
import canonicalize from "canonicalize";
import { admitStrictJson, type JsonValue } from "./strict-json.ts";

const COMPONENT_PREFIX = Buffer.from("anvilkit.component.identity.v1\0", "utf8");
const BOM_PREFIX = Buffer.from("anvilkit.contract-bom.identity.v1\0", "utf8");
const BOM_MEDIA_TYPE = "application/vnd.anvilkit.contract-bom+json";
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const PURPOSE = /^[\x21-\x7e]+$/;
const MEDIA_TYPE = /^[a-z0-9][a-z0-9.+-]*\/[a-z0-9][a-z0-9.+-]*$/;

export class NativeIdentityError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "NativeIdentityError";
  }
}

function digest(chunks: Uint8Array[]): string {
  const hash = createHash("sha256");
  chunks.forEach((chunk) => hash.update(chunk));
  return `sha256:${hash.digest("hex")}`;
}

export function nativeCanonicalize(value: JsonValue): Uint8Array {
  const raw = Buffer.from(JSON.stringify(value), "utf8");
  const admitted = admitStrictJson(raw).value;
  const serialized = canonicalize(admitted);
  if (serialized === undefined) throw new NativeIdentityError("JCS_UNSUPPORTED_VALUE", "canonicalizer returned no value");
  return Buffer.from(serialized, "utf8");
}

export function nativeComponentIdentity(
  value: JsonValue,
  purpose: string,
  mediaType: string,
  allowedPurposes: ReadonlySet<string>,
): { canonical: Uint8Array; digest: string } {
  if (!PURPOSE.test(purpose) || purpose.includes("\0")) {
    throw new NativeIdentityError("IDENTITY_PURPOSE_INVALID", "purpose is not printable ASCII");
  }
  if (purpose === "contract-bom") {
    throw new NativeIdentityError("IDENTITY_PURPOSE_RESERVED", "contract-bom is reserved");
  }
  if (!allowedPurposes.has(purpose)) {
    throw new NativeIdentityError("IDENTITY_PURPOSE_UNKNOWN", "purpose is not governed");
  }
  if (!MEDIA_TYPE.test(mediaType) || !/^[\x21-\x7e]+$/.test(mediaType) || mediaType.includes("\0")) {
    throw new NativeIdentityError("IDENTITY_MEDIA_TYPE_INVALID", "media type is outside the profile");
  }
  const canonical = nativeCanonicalize(value);
  return {
    canonical,
    digest: digest([
      COMPONENT_PREFIX,
      Buffer.from(purpose, "ascii"),
      Buffer.from([0]),
      Buffer.from(mediaType, "ascii"),
      Buffer.from([0]),
      canonical,
    ]),
  };
}

export function nativeContractBomIdentity(value: JsonValue): {
  canonical: Uint8Array;
  digest: string;
  verified: boolean;
} {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new NativeIdentityError("BOM_SHAPE_INVALID", "root BOM must be an object");
  }
  if (!Object.hasOwn(value, "digest")) {
    throw new NativeIdentityError("BOM_DIGEST_MISSING", "root BOM must declare a digest");
  }
  const declared = value.digest;
  const withoutDigest: Record<string, JsonValue> = Object.create(null) as Record<string, JsonValue>;
  for (const [key, item] of Object.entries(value)) if (key !== "digest") withoutDigest[key] = item;
  const canonical = nativeCanonicalize(withoutDigest);
  const calculated = digest([
    BOM_PREFIX,
    Buffer.from(BOM_MEDIA_TYPE, "ascii"),
    Buffer.from([0]),
    canonical,
  ]);
  const verified = typeof declared === "string" && DIGEST.test(declared)
    && timingSafeEqual(Buffer.from(declared, "ascii"), Buffer.from(calculated, "ascii"));
  return { canonical, digest: calculated, verified };
}
