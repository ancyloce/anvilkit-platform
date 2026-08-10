package dev.anvilkit.contracts;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Emits the 12-case native Java identity conformance result. */
public final class IdentityConformance {
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private IdentityConformance() {}

    private static String digest(byte[] raw) throws Exception {
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw));
    }

    private static ObjectNode base(String id, String corpusDigest, int corpusBytes) {
        ObjectNode item = MAPPER.createObjectNode();
        item.put("caseId", id);
        item.put("inputDigest", corpusDigest);
        item.put("inputBytes", corpusBytes);
        item.put("parseOutcome", "accepted");
        return item;
    }

    private static ObjectNode produced(byte[] canonical) throws Exception {
        ObjectNode value = MAPPER.createObjectNode();
        value.put("status", "produced");
        value.put("bytesBase64", Base64.getEncoder().encodeToString(canonical));
        value.put("digest", digest(canonical));
        return value;
    }

    private static ArrayNode findings(String code, String instancePath, String schemaPath) {
        ArrayNode findings = MAPPER.createArrayNode();
        ObjectNode finding = findings.addObject();
        finding.put("code", code);
        finding.put("instancePath", instancePath);
        finding.put("schemaPath", schemaPath);
        return findings;
    }

    private static Set<String> allowedPurposes(Path repositoryRoot) throws Exception {
        JsonNode source = MAPPER.readTree(Files.readAllBytes(repositoryRoot.resolve("contracts/registries/v1/registry-set.json")));
        Set<String> allowed = new HashSet<>();
        for (JsonNode registry : source.get("registries")) {
            if (registry.get("registryId").asString().equals("identity-purpose")) {
                for (JsonNode entry : registry.get("entries")) allowed.add(entry.get("wireValue").asString());
            }
        }
        return allowed;
    }

    private static JsonNode resolveBom(JsonNode testCase, Map<String, JsonNode> cases) {
        if (testCase.has("value")) return testCase.get("value").deepCopy();
        JsonNode source = cases.get(testCase.get("copyOf").asString());
        if (source == null) throw new IllegalStateException(testCase.get("id").asString() + ": invalid copyOf");
        JsonNode value = resolveBom(source, cases);
        if (value instanceof ObjectNode object && testCase.has("declaredDigest")) {
            object.put("digest", testCase.get("declaredDigest").asString());
        }
        return value;
    }

    public static ObjectNode generate(Path repositoryRoot) throws Exception {
        if (Runtime.version().feature() != 17) throw new IllegalStateException("expected JDK 17, got " + Runtime.version());
        repositoryRoot = repositoryRoot.toAbsolutePath().normalize();
        Path corpusPath = repositoryRoot.resolve("contracts/governance/m3/identity-cases.json");
        byte[] corpusBytes = Files.readAllBytes(corpusPath);
        JsonNode corpus = MAPPER.readTree(corpusBytes);
        if (corpus.get("corpusVersion").asInt() != 1 || corpus.get("componentCases").size() != 9 || corpus.get("bomCases").size() != 3) {
            throw new IllegalStateException("expected identity corpus v1 with nine component and three BOM cases");
        }
        String corpusDigest = digest(corpusBytes);
        Set<String> allowed = allowedPurposes(repositoryRoot);
        List<ObjectNode> cases = new ArrayList<>();
        for (JsonNode testCase : corpus.get("componentCases")) {
            ObjectNode item = base(testCase.get("id").asString(), corpusDigest, corpusBytes.length);
            try {
                var actual = ContractIdentity.component(testCase.get("value"), testCase.get("purpose").asString(), testCase.get("mediaType").asString(), allowed);
                if (testCase.has("expectedCode") || !actual.digest().equals(testCase.get("expectedDigest").asString())) {
                    throw new IllegalStateException(testCase.get("id").asString() + ": component expectation differs");
                }
                item.put("valid", true);
                item.set("findings", MAPPER.createArrayNode());
                item.set("canonicalization", produced(actual.canonical()));
                item.put("componentDigest", actual.digest());
                item.putNull("rootBomDigest");
            } catch (ContractIdentity.IdentityException error) {
                if (!testCase.has("expectedCode") || !error.code().equals(testCase.get("expectedCode").asString())) throw error;
                var canonical = ContractIdentity.component(testCase.get("value"), "schema", "application/json", Set.of("schema")).canonical();
                item.put("valid", false);
                item.set("findings", findings(error.code(), "/", "/profile/componentIdentity"));
                item.set("canonicalization", produced(canonical));
                item.putNull("componentDigest");
                item.putNull("rootBomDigest");
            }
            item.putObject("signature").put("status", "not-applicable");
            cases.add(item);
        }
        Map<String, JsonNode> rawBomCases = new HashMap<>();
        for (JsonNode testCase : corpus.get("bomCases")) rawBomCases.put(testCase.get("id").asString(), testCase);
        for (JsonNode testCase : corpus.get("bomCases")) {
            ObjectNode item = base(testCase.get("id").asString(), corpusDigest, corpusBytes.length);
            try {
                var actual = ContractIdentity.contractBom(resolveBom(testCase, rawBomCases));
                if (testCase.has("expectedCode") || !actual.digest().equals(testCase.get("expectedDigest").asString())
                        || actual.verified() != testCase.get("expectedVerification").asBoolean()) {
                    throw new IllegalStateException(testCase.get("id").asString() + ": BOM expectation differs");
                }
                if (testCase.has("expectedCanonicalWithoutDigest")
                        && !new String(actual.canonical(), java.nio.charset.StandardCharsets.UTF_8).equals(testCase.get("expectedCanonicalWithoutDigest").asString())) {
                    throw new IllegalStateException(testCase.get("id").asString() + ": canonical BOM differs");
                }
                item.put("valid", actual.verified());
                item.set("findings", actual.verified() ? MAPPER.createArrayNode() : findings("BOM_DIGEST_MISMATCH", "/digest", "/profile/contractBomIdentity"));
                item.set("canonicalization", produced(actual.canonical()));
                item.putNull("componentDigest");
                item.put("rootBomDigest", actual.digest());
            } catch (ContractIdentity.IdentityException error) {
                if (!testCase.has("expectedCode") || !error.code().equals(testCase.get("expectedCode").asString())) throw error;
                item.put("valid", false);
                item.set("findings", findings(error.code(), "/digest", "/profile/contractBomIdentity"));
                ObjectNode rejected = item.putObject("canonicalization");
                rejected.put("status", "rejected");
                rejected.put("code", error.code());
                item.putNull("componentDigest");
                item.putNull("rootBomDigest");
            }
            item.putObject("signature").put("status", "not-applicable");
            cases.add(item);
        }
        cases.sort(Comparator.comparing(item -> item.get("caseId").asString()));
        ByteArrayOutputStream adapterBytes = new ByteArrayOutputStream();
        for (String name : List.of("ContractIdentity.java", "JcsCanonicalizer.java", "IdentityConformance.java")) {
            adapterBytes.write(Files.readAllBytes(repositoryRoot.resolve("packages/contracts-java/src/main/java/dev/anvilkit/contracts").resolve(name)));
        }
        ObjectNode output = MAPPER.createObjectNode();
        output.put("resultVersion", 1);
        output.put("fixtureManifestDigest", corpusDigest);
        output.put("language", "java");
        ObjectNode implementation = output.putObject("implementation");
        implementation.put("adapterId", "anvilkit-java-identity");
        implementation.put("adapterVersion", "0.1.0");
        implementation.put("runtime", "jdk");
        implementation.put("runtimeVersion", "17");
        implementation.put("adapterDigest", digest(adapterBytes.toByteArray()));
        ArrayNode outputCases = output.putArray("cases");
        for (ObjectNode item : cases) outputCases.add(item);
        return output;
    }

    public static void main(String[] args) throws Exception {
        Path repositoryRoot = Path.of("../..");
        for (int index = 0; index + 1 < args.length; index++) {
            if (args[index].equals("--repository-root")) repositoryRoot = Path.of(args[index + 1]);
        }
        System.out.println(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(generate(repositoryRoot)));
    }
}
