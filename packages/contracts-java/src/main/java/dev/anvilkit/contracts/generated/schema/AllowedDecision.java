
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum AllowedDecision {

    APPROVE("approve"),
    REJECT("reject"),
    REQUEST_CHANGES("request-changes");
    private final String value;
    private final static Map<String, AllowedDecision> CONSTANTS = new HashMap<String, AllowedDecision>();

    static {
        for (AllowedDecision c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    AllowedDecision(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static AllowedDecision fromValue(String value) {
        AllowedDecision constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
