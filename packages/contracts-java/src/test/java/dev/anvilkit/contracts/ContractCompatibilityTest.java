package dev.anvilkit.contracts;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ContractCompatibilityTest {
    private static final Path ROOT = Path.of("../..").toAbsolutePath().normalize();
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Test void candidateBomWindow() throws Exception {
        var bom = MAPPER.readTree(Files.readAllBytes(ROOT.resolve("contracts/governance/m4/release-bom.json")));
        assertEquals(bom.get("digest").asString(), ContractCompatibility.verifyCandidateBom(bom, 1));
        for (int generation : new int[]{0, 2}) {
            var failure = assertThrows(ContractCompatibility.CompatibilityException.class,
                    () -> ContractCompatibility.verifyCandidateBom(bom, generation));
            assertEquals("CONTRACT_UNSUPPORTED", failure.code());
        }
    }
}
