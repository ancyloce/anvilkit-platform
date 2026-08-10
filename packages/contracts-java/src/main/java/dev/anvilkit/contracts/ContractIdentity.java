package dev.anvilkit.contracts;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Set;
import java.util.regex.Pattern;

/** Native ComponentIdentityV1 and ContractBomIdentityV1 adapter. */
public final class ContractIdentity {
    public static final class IdentityException extends Exception {
        private final String code;
        public IdentityException(String code, String message) { super(message); this.code = code; }
        public String code() { return code; }
    }

    public record IdentityResult(byte[] canonical, String digest) {}
    public record BomResult(byte[] canonical, String digest, boolean verified) {}

    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final Pattern MEDIA_TYPE = Pattern.compile("^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$");
    private static final Pattern DIGEST = Pattern.compile("^sha256:[0-9a-f]{64}$");

    private ContractIdentity() {}

    private static boolean printableAscii(String value) {
        if (value.isEmpty()) return false;
        for (int index = 0; index < value.length(); index++) {
            char unit = value.charAt(index);
            if (unit < 0x21 || unit > 0x7e) return false;
        }
        return true;
    }

    private static String digest(byte[]... parts) throws Exception {
        MessageDigest hash = MessageDigest.getInstance("SHA-256");
        for (byte[] part : parts) hash.update(part);
        return "sha256:" + HexFormat.of().formatHex(hash.digest());
    }

    public static IdentityResult component(JsonNode value, String purpose, String mediaType, Set<String> allowed) throws Exception {
        if (!printableAscii(purpose) || purpose.indexOf('\0') >= 0) {
            throw new IdentityException("IDENTITY_PURPOSE_INVALID", "purpose is not printable ASCII");
        }
        if (purpose.equals("contract-bom")) {
            throw new IdentityException("IDENTITY_PURPOSE_RESERVED", "contract-bom is reserved");
        }
        if (!allowed.contains(purpose)) {
            throw new IdentityException("IDENTITY_PURPOSE_UNKNOWN", "purpose is not governed");
        }
        if (!printableAscii(mediaType) || !MEDIA_TYPE.matcher(mediaType).matches()) {
            throw new IdentityException("IDENTITY_MEDIA_TYPE_INVALID", "media type is outside the profile");
        }
        byte[] canonical = JcsCanonicalizer.canonicalize(MAPPER.writeValueAsBytes(value));
        return new IdentityResult(canonical, digest(
                "anvilkit.component.identity.v1\0".getBytes(StandardCharsets.UTF_8),
                purpose.getBytes(StandardCharsets.US_ASCII), new byte[]{0},
                mediaType.getBytes(StandardCharsets.US_ASCII), new byte[]{0}, canonical));
    }

    public static BomResult contractBom(JsonNode value) throws Exception {
        if (!(value instanceof ObjectNode object)) {
            throw new IdentityException("BOM_SHAPE_INVALID", "root BOM must be an object");
        }
        if (!object.has("digest")) {
            throw new IdentityException("BOM_DIGEST_MISSING", "root BOM must declare a digest");
        }
        JsonNode declaredNode = object.get("digest");
        String declared = declaredNode.isString() ? declaredNode.asString() : "";
        ObjectNode withoutDigest = object.deepCopy();
        withoutDigest.remove("digest");
        byte[] canonical = JcsCanonicalizer.canonicalize(MAPPER.writeValueAsBytes(withoutDigest));
        String calculated = digest(
                "anvilkit.contract-bom.identity.v1\0".getBytes(StandardCharsets.UTF_8),
                "application/vnd.anvilkit.contract-bom.v1+json".getBytes(StandardCharsets.US_ASCII),
                new byte[]{0}, canonical);
        boolean verified = DIGEST.matcher(declared).matches()
                && MessageDigest.isEqual(declared.getBytes(StandardCharsets.US_ASCII), calculated.getBytes(StandardCharsets.US_ASCII));
        return new BomResult(canonical, calculated, verified);
    }
}
