
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum Retryability {

    SAFE_IMMEDIATE("safe-immediate"),
    SAFE_AFTER_BACKOFF("safe-after-backoff"),
    OPERATOR_ACTION("operator-action");
    private final String value;
    private final static Map<String, Retryability> CONSTANTS = new HashMap<String, Retryability>();

    static {
        for (Retryability c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    Retryability(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static Retryability fromValue(String value) {
        Retryability constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
