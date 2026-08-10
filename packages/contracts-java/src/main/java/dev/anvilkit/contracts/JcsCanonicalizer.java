package dev.anvilkit.contracts;

import org.erdtman.jcs.JsonCanonicalizer;

import java.io.IOException;

/** RFC 8785 adapter behind AnvilKit strict JSON admission. */
public final class JcsCanonicalizer {
    private JcsCanonicalizer() {}

    public static byte[] canonicalize(byte[] raw) throws IOException {
        ContractValidator.admitStrict(raw);
        try {
            return new JsonCanonicalizer(raw).getEncodedUTF8();
        } catch (RuntimeException exception) {
            throw new IOException("RFC 8785 canonicalization failed", exception);
        }
    }
}
