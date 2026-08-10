
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum AcceptedDataClass {

    PUBLIC("public"),
    INTERNAL("internal"),
    CONFIDENTIAL("confidential"),
    RESTRICTED("restricted");
    private final String value;
    private final static Map<String, AcceptedDataClass> CONSTANTS = new HashMap<String, AcceptedDataClass>();

    static {
        for (AcceptedDataClass c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    AcceptedDataClass(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static AcceptedDataClass fromValue(String value) {
        AcceptedDataClass constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
