package dev.anvilkit.contracts;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Path;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ContractIdentityTest {
    private static final Path ROOT = Path.of("../..").toAbsolutePath().normalize();
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Test void componentVectorAndReservedPurpose() throws Exception {
        var value = MAPPER.readTree("{\"$id\":\"https://contracts.anvilkit.dev/example.schema.json\",\"type\":\"object\"}");
        var actual = ContractIdentity.component(value, "schema", "application/schema+json", Set.of("schema"));
        assertEquals("sha256:d2ac6760e4e1ff8dad734f00a0ce58bf16fbc86ac3393332fa6439cf010a0acd", actual.digest());
        assertThrows(ContractIdentity.IdentityException.class,
                () -> ContractIdentity.component(MAPPER.createObjectNode(), "contract-bom", "application/json", Set.of("contract-bom")));
    }

    @Test void emitsCompleteIdentityResult() throws Exception {
        var result = IdentityConformance.generate(ROOT);
        assertEquals("java", result.get("language").asString());
        assertEquals(12, result.get("cases").size());
    }
}
