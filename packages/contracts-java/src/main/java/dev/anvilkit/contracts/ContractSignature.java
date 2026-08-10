package dev.anvilkit.contracts;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

/** Narrow Java SE 17 Ed25519 boundary for governed DSSE and compact-JWS. */
public final class ContractSignature {
    private static final byte[] ED25519_PKCS8_PREFIX = java.util.HexFormat.of().parseHex("302e020100300506032b657004220420");
    private static final byte[] ED25519_X509_PREFIX = java.util.HexFormat.of().parseHex("302a300506032b6570032100");

    private ContractSignature() {}

    public static byte[] dssePreAuthEncoding(String payloadType, byte[] payload) {
        byte[] type = payloadType.getBytes(StandardCharsets.UTF_8);
        byte[] prefix = ("DSSEv1 " + type.length + " ").getBytes(StandardCharsets.US_ASCII);
        byte[] length = (" " + payload.length + " ").getBytes(StandardCharsets.US_ASCII);
        byte[] result = new byte[prefix.length + type.length + length.length + payload.length];
        int offset = 0;
        System.arraycopy(prefix, 0, result, offset, prefix.length); offset += prefix.length;
        System.arraycopy(type, 0, result, offset, type.length); offset += type.length;
        System.arraycopy(length, 0, result, offset, length.length); offset += length.length;
        System.arraycopy(payload, 0, result, offset, payload.length);
        return result;
    }

    private static byte[] prefixed(byte[] prefix, byte[] raw) {
        byte[] encoded = new byte[prefix.length + raw.length];
        System.arraycopy(prefix, 0, encoded, 0, prefix.length);
        System.arraycopy(raw, 0, encoded, prefix.length, raw.length);
        return encoded;
    }

    public static byte[] sign(byte[] privateSeed, byte[] message) throws Exception {
        if (privateSeed.length != 32) throw new IllegalArgumentException("Ed25519 private seed must be 32 bytes");
        var privateKey = KeyFactory.getInstance("Ed25519").generatePrivate(
                new PKCS8EncodedKeySpec(prefixed(ED25519_PKCS8_PREFIX, privateSeed)));
        Signature signer = Signature.getInstance("Ed25519");
        signer.initSign(privateKey);
        signer.update(message);
        return signer.sign();
    }

    public static boolean verify(byte[] publicKey, byte[] message, byte[] signature) {
        if (publicKey.length != 32 || signature.length != 64) return false;
        try {
            var key = KeyFactory.getInstance("Ed25519").generatePublic(
                    new X509EncodedKeySpec(prefixed(ED25519_X509_PREFIX, publicKey)));
            Signature verifier = Signature.getInstance("Ed25519");
            verifier.initVerify(key);
            verifier.update(message);
            return verifier.verify(signature);
        } catch (Exception error) {
            return false;
        }
    }
}
