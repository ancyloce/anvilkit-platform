package dev.anvilkit.contracts;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;

/** Emits M4 conformance-result v1 for the shared DSSE/JWS primitive corpus. */
public final class SignatureConformance {
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private SignatureConformance() {}

    private static String digest(byte[] raw) throws Exception {
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw));
    }

    private static byte[] decode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }

    public static ObjectNode generate(Path repositoryRoot) throws Exception {
        if (Runtime.version().feature() != 17) throw new IllegalStateException("expected JDK 17, got " + Runtime.version());
        repositoryRoot = repositoryRoot.toAbsolutePath().normalize();
        Path corpusPath = repositoryRoot.resolve("contracts/governance/m3/signature-cases.json");
        byte[] corpusBytes = Files.readAllBytes(corpusPath);
        JsonNode corpus = MAPPER.readTree(corpusBytes);
        if (corpus.get("corpusVersion").asInt() != 1 || corpus.get("cases").size() != 6) {
            throw new IllegalStateException("invalid signature corpus");
        }
        byte[] publicKey = decode(corpus.at("/key/publicKeyBase64Url").asString());
        byte[] privateSeed = decode(corpus.at("/key/privateSeedBase64Url").asString());
        byte[] dssePayload = decode(corpus.at("/dsse/payloadBase64Url").asString());
        byte[] dsseSignature = decode(corpus.at("/dsse/signatureBase64Url").asString());
        byte[] jwsSignature = decode(corpus.at("/jws/signatureBase64Url").asString());
        List<ObjectNode> cases = new ArrayList<>();
        for (JsonNode vector : corpus.get("cases")) {
            String id = vector.get("id").asString();
            byte[] message;
            byte[] expectedSignature;
            if (vector.get("profile").asString().equals("dsse")) {
                message = ContractSignature.dssePreAuthEncoding(corpus.at("/dsse/payloadType").asString(), dssePayload);
                expectedSignature = dsseSignature;
            } else if (vector.get("profile").asString().equals("jws")) {
                message = (corpus.at("/jws/protectedBase64Url").asString() + "." + corpus.at("/jws/payloadBase64Url").asString())
                        .getBytes(StandardCharsets.US_ASCII);
                expectedSignature = jwsSignature;
            } else throw new IllegalStateException(id + ": unsupported profile");
            message = message.clone();
            if (vector.get("mutation").asString().equals("message-last-byte")) message[message.length - 1] ^= 1;
            byte[] candidateSignature = expectedSignature.clone();
            if (vector.get("operation").asString().equals("sign-and-verify")) {
                candidateSignature = ContractSignature.sign(privateSeed, message);
                if (!Arrays.equals(candidateSignature, expectedSignature)) {
                    throw new IllegalStateException(id + ": deterministic signature differs from corpus");
                }
            }
            if (vector.get("mutation").asString().equals("signature-first-byte")) candidateSignature[0] ^= 1;
            boolean verified = ContractSignature.verify(publicKey, message, candidateSignature);
            if (verified != vector.get("expectedVerified").asBoolean()) {
                throw new IllegalStateException(id + ": verification differs from corpus");
            }
            ObjectNode item = MAPPER.createObjectNode();
            item.put("caseId", id);
            item.put("inputDigest", digest(message));
            item.put("inputBytes", message.length);
            item.put("parseOutcome", "accepted");
            item.put("valid", verified);
            ArrayNode findings = item.putArray("findings");
            if (!verified) {
                ObjectNode finding = findings.addObject();
                finding.put("code", "SIGNATURE_INVALID");
                finding.put("instancePath", "/signature");
                finding.put("schemaPath", "/profile/ed25519");
            }
            item.putObject("canonicalization").put("status", "not-applicable");
            item.putNull("componentDigest");
            item.putNull("rootBomDigest");
            ObjectNode signature = item.putObject("signature");
            signature.put("status", verified ? "verified" : "rejected");
            if (!verified) signature.put("code", "SIGNATURE_INVALID");
            cases.add(item);
        }
        cases.sort(Comparator.comparing(item -> item.get("caseId").asString()));
        ByteArrayOutputStream adapterBytes = new ByteArrayOutputStream();
        for (String name : List.of("ContractSignature.java", "SignatureConformance.java")) {
            adapterBytes.write(Files.readAllBytes(repositoryRoot.resolve("packages/contracts-java/src/main/java/dev/anvilkit/contracts").resolve(name)));
        }
        ObjectNode output = MAPPER.createObjectNode();
        output.put("resultVersion", 1);
        output.put("fixtureManifestDigest", digest(corpusBytes));
        output.put("language", "java");
        ObjectNode implementation = output.putObject("implementation");
        implementation.put("adapterId", "anvilkit-java-signature-native");
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
        int iterations = 1;
        for (int index = 0; index + 1 < args.length; index++) {
            if (args[index].equals("--repository-root")) repositoryRoot = Path.of(args[index + 1]);
            if (args[index].equals("--iterations")) iterations = Integer.parseInt(args[index + 1]);
        }
        if (iterations < 1) throw new IllegalArgumentException("--iterations must be positive");
        ObjectNode result = null;
        for (int index = 0; index < iterations; index++) result = generate(repositoryRoot);
        System.out.println(MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(result));
    }
}
