package dev.anvilkit.contracts;

import tools.jackson.databind.json.JsonMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** DP-008 process adapter for java-json-canonicalization 1.1. */
public final class Dp008JcsMain {
    private static String argument(String[] args, String name) {
        for (int index = 0; index + 1 < args.length; index++) if (args[index].equals(name)) return args[index + 1];
        throw new IllegalArgumentException("missing " + name);
    }

    public static void main(String[] args) throws Exception {
        if (!argument(args, "--operation").equals("canonicalize")) System.exit(2);
        int iterations = Integer.parseInt(argument(args, "--iterations"));
        if (iterations < 1) System.exit(4);
        byte[] input = Files.readAllBytes(Path.of(argument(args, "--input")));
        String parseOutcome = "accepted";
        byte[] canonical = null;
        for (int index = 0; index < iterations; index++) {
            try { canonical = JcsCanonicalizer.canonicalize(input); }
            catch (Exception exception) { parseOutcome = "rejected"; canonical = null; }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("candidateId", "java-jcs-canonicalizer");
        result.put("candidateVersion", "1.1");
        result.put("operation", "canonicalize");
        result.put("iterations", iterations);
        result.put("parseOutcome", parseOutcome);
        result.put("valid", null);
        result.put("orderedFindings", canonical == null
                ? List.of(Map.of("code", "PARSE_REJECTED", "instancePath", "/", "schemaPath", "/profile/strictAdmission"))
                : List.of());
        result.put("canonicalSha256", canonical == null ? null : "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonical)));
        result.put("canonicalBytesBase64", canonical == null ? null : Base64.getEncoder().encodeToString(canonical));
        System.out.println(JsonMapper.builder().build().writeValueAsString(result));
    }
}
