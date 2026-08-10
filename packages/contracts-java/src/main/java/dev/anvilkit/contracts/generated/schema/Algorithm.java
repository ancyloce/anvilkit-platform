
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum Algorithm {

    DSSE_ED_25519_V_1("dsse-ed25519-v1"),
    JWS_EDDSA_V_1("jws-eddsa-v1");
    private final String value;
    private final static Map<String, Algorithm> CONSTANTS = new HashMap<String, Algorithm>();

    static {
        for (Algorithm c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    Algorithm(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static Algorithm fromValue(String value) {
        Algorithm constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
