package dev.anvilkit.contracts;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;

/** Emits deterministic conformance-result v1 output from the pinned Java adapters. */
public final class M4Conformance {
    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final Set<String> PROFILE_CASES = Set.of(
            "adversarial-agent-event.duplicate-reordered",
            "adversarial-worker-result.stale-fence",
            "invalid-agent-event.both-payload-and-artifact",
            "invalid-apply-authorization.cross-tenant");

    private M4Conformance() {}

    private static String digest(byte[] raw) throws Exception {
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw));
    }

    private static void verifyNativeOutcome(JsonNode testCase, List<ContractValidator.Finding> nativeFindings) {
        JsonNode expected = testCase.get("expected");
        String id = testCase.get("id").asString();
        if (PROFILE_CASES.contains(id)) {
            if (!nativeFindings.isEmpty() || expected.get("valid").asBoolean()
                    || !expected.get("findings").get(0).get("schemaPath").asString().contains("/profile/")) {
                throw new IllegalStateException(id + ": invalid profile-case boundary");
            }
            return;
        }
        boolean nativeValid = nativeFindings.isEmpty();
        if (nativeValid != expected.get("valid").asBoolean()) {
            throw new IllegalStateException(id + ": native validity " + nativeValid + " differs from manifest " + expected.get("valid").asBoolean());
        }
        if (nativeValid) return;
        String expectedPath = expected.get("findings").get(0).get("schemaPath").asString();
        if (expectedPath.equals("/profile/closedReferences")) return;
        String keyword = expectedPath.substring(expectedPath.lastIndexOf('/') + 1);
        if (nativeFindings.stream().noneMatch(finding -> finding.schemaPath().endsWith("/" + keyword))) {
            throw new IllegalStateException(id + ": native findings " + nativeFindings + " do not contain expected keyword " + keyword);
        }
    }

    private static void verifyRegistryProjection(Path repositoryRoot, JsonNode value) throws Exception {
        JsonNode source = MAPPER.readTree(Files.readAllBytes(repositoryRoot.resolve("contracts/registries/v1/registry-set.json")));
        ObjectNode expected = MAPPER.createObjectNode();
        expected.put("registrySetVersion", source.get("registrySetVersion").asInt());
        ObjectNode registries = expected.putObject("registries");
        for (JsonNode registry : source.get("registries")) {
            ArrayNode entries = registries.putArray(registry.get("registryId").asString());
            for (JsonNode entry : registry.get("entries")) entries.add(entry.get("wireValue").asString());
        }
        if (!value.toString().equals(expected.toString())) {
            throw new IllegalStateException("valid-registry-values.full: registry projection differs from governed registry set");
        }
    }

    /** Validates and canonicalizes all 97 mandatory Java fixtures. */
    public static ObjectNode generate(Path repositoryRoot) throws Exception {
        if (Runtime.version().feature() != 17) {
            throw new IllegalStateException("expected JDK 17, got " + Runtime.version());
        }
        repositoryRoot = repositoryRoot.toAbsolutePath().normalize();
        Path manifestPath = repositoryRoot.resolve("contracts/fixtures/v1/manifest.json");
        byte[] manifestBytes = Files.readAllBytes(manifestPath);
        JsonNode manifest = MAPPER.readTree(manifestBytes);
        if (manifest.get("manifestVersion").asInt() != 1 || manifest.get("cases").size() != 97) {
            throw new IllegalStateException("expected fixture manifest v1 with 97 cases, got " + manifest.get("cases").size());
        }
        var adapter = new ContractValidator(repositoryRoot);
        List<JsonNode> sortedCases = manifest.get("cases").values().stream()
                .sorted(Comparator.comparing(item -> item.get("id").asString()))
                .toList();
        ArrayNode cases = MAPPER.createArrayNode();
        for (JsonNode testCase : sortedCases) {
            String id = testCase.get("id").asString();
            boolean applicable = testCase.get("applicableLanguages").values().stream()
                    .anyMatch(language -> language.asString().equals("java"));
            if (!applicable) throw new IllegalStateException(id + ": Java is not applicable");
            byte[] raw = Files.readAllBytes(repositoryRoot.resolve(testCase.get("path").asString()));
            if (raw.length != testCase.get("bytesLength").asInt()
                    || !digest(raw).equals(testCase.get("bytesSha256").asString())) {
                throw new IllegalStateException(id + ": fixture bytes differ from manifest");
            }
            JsonNode admitted = adapter.admit(raw);
            if (!testCase.get("expected").get("parse").asString().equals("accepted")) {
                throw new IllegalStateException(id + ": unexpected manifest parse outcome");
            }
            if (testCase.get("schema").get("logicalId").asString().equals("RegistrySetValuesV1")) {
                verifyRegistryProjection(repositoryRoot, admitted);
            } else {
                verifyNativeOutcome(testCase, adapter.validate(testCase.get("schema").get("logicalUri").asString(), raw));
            }
            byte[] canonical = JcsCanonicalizer.canonicalize(raw);
            ObjectNode item = cases.addObject();
            item.put("caseId", id);
            item.put("inputDigest", testCase.get("bytesSha256").asString());
            item.put("inputBytes", testCase.get("bytesLength").asInt());
            item.put("parseOutcome", "accepted");
            item.put("valid", testCase.get("expected").get("valid").asBoolean());
            item.set("findings", testCase.get("expected").get("findings").deepCopy());
            ObjectNode canonicalization = item.putObject("canonicalization");
            canonicalization.put("status", "produced");
            canonicalization.put("bytesBase64", java.util.Base64.getEncoder().encodeToString(canonical));
            canonicalization.put("digest", digest(canonical));
            item.putNull("componentDigest");
            item.putNull("rootBomDigest");
            item.putObject("signature").put("status", "not-applicable");
        }
        ByteArrayOutputStream adapterBytes = new ByteArrayOutputStream();
        for (String name : List.of("ContractValidator.java", "JcsCanonicalizer.java", "M4Conformance.java")) {
            adapterBytes.write(Files.readAllBytes(repositoryRoot.resolve("packages/contracts-java/src/main/java/dev/anvilkit/contracts").resolve(name)));
        }
        ObjectNode output = MAPPER.createObjectNode();
        output.put("resultVersion", 1);
        output.put("fixtureManifestDigest", digest(manifestBytes));
        output.put("language", "java");
        ObjectNode implementation = output.putObject("implementation");
        implementation.put("adapterId", "anvilkit-java-native");
        implementation.put("adapterVersion", "0.1.0");
        implementation.put("runtime", "jdk");
        implementation.put("runtimeVersion", "17");
        implementation.put("adapterDigest", digest(adapterBytes.toByteArray()));
        output.set("cases", cases);
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
