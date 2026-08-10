package dev.anvilkit.contracts;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ContractValidatorTest {
    private static final Path ROOT = Path.of("../..").toAbsolutePath().normalize();

    @Test void validatesClosedDraft202012Resource() throws Exception {
        var adapter = new ContractValidator(ROOT);
        String uri = "anvilkit://schema/agent-run.v1@1.0.0?digest=sha256:68949242c9b4557a8b5ff965f76de8f2de49c11523a7cc1e64cfd1b4af824233";
        byte[] fixture = Files.readAllBytes(ROOT.resolve("contracts/fixtures/v1/valid/agent-run.minimum.json"));
        assertEquals(0, adapter.validate(uri, fixture).size());
    }

    @Test void rejectsStrictAdmissionCases() throws Exception {
        var adapter = new ContractValidator(ROOT);
        for (byte[] raw : new byte[][] {"{\"a\":1,\"a\":2}".getBytes(), new byte[]{(byte)0xef,(byte)0xbb,(byte)0xbf,'{','}'}, "{\"n\":9007199254740992}".getBytes()}) {
            assertThrows(Exception.class, () -> adapter.admit(raw));
        }
    }

    @Test void emitsCompleteConformanceResult() throws Exception {
        var result = M4Conformance.generate(ROOT);
        assertEquals("java", result.get("language").asString());
        assertEquals(97, result.get("cases").size());
    }
}
