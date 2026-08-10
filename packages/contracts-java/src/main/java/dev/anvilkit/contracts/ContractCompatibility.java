package dev.anvilkit.contracts;

import tools.jackson.databind.JsonNode;

/** Candidate BOM verification at the consumer boundary. */
public final class ContractCompatibility {
    public static final class CompatibilityException extends Exception {
        private final String code;
        public CompatibilityException(String code, String message) { super(message); this.code = code; }
        public String code() { return code; }
    }

    private ContractCompatibility() {}

    public static String verifyCandidateBom(JsonNode bom, int consumerGeneration) throws Exception {
        var identity = ContractIdentity.contractBom(bom);
        if (!identity.verified()) {
            throw new CompatibilityException("BOM_DIGEST_MISMATCH", "candidate BOM identity does not verify");
        }
        JsonNode window = bom.get("compatibility");
        int minimum = window.get("minimumConsumerGeneration").asInt();
        int maximum = window.get("maximumConsumerGeneration").asInt();
        if (consumerGeneration < minimum || consumerGeneration > maximum) {
            throw new CompatibilityException("CONTRACT_UNSUPPORTED", "consumer generation is outside the BOM compatibility window");
        }
        return identity.digest();
    }
}
