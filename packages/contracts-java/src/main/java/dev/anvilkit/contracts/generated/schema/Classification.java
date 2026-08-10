
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum Classification {

    PUBLIC("public"),
    INTERNAL("internal"),
    CONFIDENTIAL("confidential"),
    RESTRICTED("restricted");
    private final String value;
    private final static Map<String, Classification> CONSTANTS = new HashMap<String, Classification>();

    static {
        for (Classification c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    Classification(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static Classification fromValue(String value) {
        Classification constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
