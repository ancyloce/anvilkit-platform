import { createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

export function dssePreAuthEncoding(payloadType: string, payload: Uint8Array): Buffer {
  const type = Buffer.from(payloadType, "utf8");
  return Buffer.concat([
    Buffer.from(`DSSEv1 ${type.length} `, "ascii"),
    type,
    Buffer.from(` ${payload.length} `, "ascii"),
    Buffer.from(payload),
  ]);
}

function publicJwk(publicKeyBase64Url: string): JsonWebKey {
  return { kty: "OKP", crv: "Ed25519", x: publicKeyBase64Url };
}

export function signEd25519(
  publicKeyBase64Url: string,
  privateSeedBase64Url: string,
  message: Uint8Array,
): Buffer {
  const key = createPrivateKey({
    key: { ...publicJwk(publicKeyBase64Url), d: privateSeedBase64Url },
    format: "jwk",
  });
  return sign(null, message, key);
}

export function verifyEd25519(
  publicKeyBase64Url: string,
  message: Uint8Array,
  signature: Uint8Array,
): boolean {
  const key = createPublicKey({ key: publicJwk(publicKeyBase64Url), format: "jwk" });
  return verify(null, message, key, signature);
}
