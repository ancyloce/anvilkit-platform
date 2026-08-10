package dev.anvilkit.contracts;

import com.networknt.schema.Error;
import com.networknt.schema.Schema;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.SchemaLocation;
import com.networknt.schema.SpecificationVersion;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.math.BigInteger;
import java.math.BigDecimal;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/** Pinned PLAN-0003 M4 Java validation adapter. */
public final class ContractValidator {
    public record Finding(String code, String instancePath, String schemaPath) {}

    private static final BigInteger MAX_SAFE_INTEGER = BigInteger.valueOf(9_007_199_254_740_991L);
    private static final JsonMapper MAPPER = JsonMapper.builder()
            .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION)
            .enable(DeserializationFeature.USE_BIG_INTEGER_FOR_INTS)
            .enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS)
            .build();
    private final SchemaRegistry registry;
    private final Map<String, Schema> schemas = new HashMap<>();

    public ContractValidator(Path repositoryRoot) throws IOException {
        Map<String, String> resources = new HashMap<>();
        try (var paths = Files.list(repositoryRoot.resolve("contracts/schemas/v1"))) {
            for (Path path : paths.filter(value -> value.getFileName().toString().endsWith(".schema.json")).sorted().toList()) {
                byte[] raw = Files.readAllBytes(path);
                ObjectNode schema = (ObjectNode) MAPPER.readTree(raw);
                String version = schema.get("x-anvilkit-contract").get("semanticVersion").asString();
                String name = path.getFileName().toString().replace(".schema.json", "");
                String uri = "anvilkit://schema/" + name + ".v" + version.split("\\.")[0] + "@" + version + "?digest=sha256:" + sha256(raw);
                schema.put("$schema", "https://json-schema.org/draft/2020-12/schema");
                schema.put("$id", uri);
                schema.remove("x-anvilkit-contract");
                resources.put(uri, MAPPER.writeValueAsString(schema));
            }
        }
        registry = SchemaRegistry.withDefaultDialect(SpecificationVersion.DRAFT_2020_12, builder -> builder.schemas(resources));
        for (String uri : resources.keySet()) schemas.put(uri, registry.getSchema(SchemaLocation.of(uri)));
    }

    public List<Finding> validate(String schemaUri, byte[] raw) {
        final JsonNode value;
        try { value = admitStrict(raw); }
        catch (RuntimeException | IOException exception) { return List.of(new Finding("PARSE_REJECTED", "/", "/profile/strictAdmission")); }
        Schema schema = schemas.get(schemaUri);
        if (schema == null) return List.of(new Finding("VALIDATION_FAILED", "/", "/profile/closedResolver"));
        List<Finding> findings = new ArrayList<>();
        for (Error error : schema.validate(value)) findings.add(new Finding("VALIDATION_FAILED", normalize(error.getInstanceLocation().toString()), normalize(error.getSchemaLocation().toString())));
        findings.sort(Comparator.comparing(Finding::code).thenComparing(Finding::instancePath).thenComparing(Finding::schemaPath));
        return List.copyOf(findings);
    }

    public JsonNode admit(byte[] raw) throws IOException { return admitStrict(raw); }

    public static JsonNode admitStrict(byte[] raw) throws IOException {
        if (raw.length == 0 || raw.length > 1_048_576 || raw.length >= 3 && raw[0] == (byte)0xef && raw[1] == (byte)0xbb && raw[2] == (byte)0xbf) throw new IOException("byte limit or BOM");
        try { StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT).onUnmappableCharacter(CodingErrorAction.REPORT).decode(java.nio.ByteBuffer.wrap(raw)); }
        catch (CharacterCodingException exception) { throw new IOException("invalid UTF-8", exception); }
        try (var parser = MAPPER.createParser(raw)) {
            JsonToken token;
            while ((token = parser.nextToken()) != null) {
                if (token == JsonToken.VALUE_NUMBER_INT) {
                    BigInteger integer = new BigInteger(parser.getString());
                    if (integer.abs().compareTo(MAX_SAFE_INTEGER) > 0 || parser.getString().startsWith("-") && integer.signum() == 0) throw new IOException("unsafe integer or negative zero");
                } else if (token == JsonToken.VALUE_NUMBER_FLOAT) {
                    String wire = parser.getString(); BigDecimal decimal = new BigDecimal(wire); double binary = decimal.doubleValue();
                    if (!Double.isFinite(binary) || decimal.signum() != 0 && binary == 0 || wire.startsWith("-") && decimal.signum() == 0) throw new IOException("number range or negative zero");
                }
            }
        }
        JsonNode value = MAPPER.readTree(raw);
        check(value, 1);
        return value;
    }

    private static int check(JsonNode value, int depth) throws IOException {
        if (depth > 64) throw new IOException("depth limit");
        if (value.isTextual()) checkUnicodeScalars(value.asString());
        if (value.isIntegralNumber() && value.bigIntegerValue().abs().compareTo(MAX_SAFE_INTEGER) > 0) throw new IOException("unsafe integer");
        if (value.isNumber() && !Double.isFinite(value.asDouble())) throw new IOException("number range");
        int count = 1;
        if (value.isArray() || value.isObject()) {
            if (value.size() > 100_000) throw new IOException("item limit");
            if (value.isObject()) for (String name : value.propertyNames()) checkUnicodeScalars(name);
            for (JsonNode child : value) { count += check(child, depth + 1); if (count > 200_000) throw new IOException("total value limit"); }
        }
        return count;
    }

    private static void checkUnicodeScalars(String value) throws IOException {
        for (int index = 0; index < value.length(); index++) {
            char unit = value.charAt(index);
            if (Character.isHighSurrogate(unit)) {
                if (index + 1 >= value.length() || !Character.isLowSurrogate(value.charAt(index + 1))) throw new IOException("unpaired high surrogate");
                index++;
            } else if (Character.isLowSurrogate(unit)) throw new IOException("unpaired low surrogate");
        }
    }

    private static String normalize(String path) { return path == null || path.isEmpty() || path.equals("$") ? "/" : path; }
    private static String sha256(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
}
