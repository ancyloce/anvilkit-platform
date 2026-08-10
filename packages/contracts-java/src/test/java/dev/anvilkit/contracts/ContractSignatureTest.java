package dev.anvilkit.contracts;

import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContractSignatureTest {
    private static final Path ROOT = Path.of("../..").toAbsolutePath().normalize();

    @Test void rfc8032RoundTripAndTamper() throws Exception {
        byte[] seed = HexFormat.of().parseHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
        byte[] publicKey = HexFormat.of().parseHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
        byte[] signature = ContractSignature.sign(seed, new byte[0]);
        assertTrue(ContractSignature.verify(publicKey, new byte[0], signature));
        assertFalse(ContractSignature.verify(publicKey, "tampered".getBytes(), signature));
    }

    @Test void emitsSignatureResult() throws Exception {
        assertEquals(6, SignatureConformance.generate(ROOT).get("cases").size());
    }
}
