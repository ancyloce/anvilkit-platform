
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public enum StopCondition {

    COMPLETED("completed"),
    REFUSED("refused"),
    BUDGET_EXHAUSTED("budget-exhausted"),
    APPROVAL_REQUIRED("approval-required"),
    INPUT_REQUIRED("input-required"),
    POLICY_BLOCKED("policy-blocked");
    private final String value;
    private final static Map<String, StopCondition> CONSTANTS = new HashMap<String, StopCondition>();

    static {
        for (StopCondition c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    StopCondition(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public String value() {
        return this.value;
    }

    public static StopCondition fromValue(String value) {
        StopCondition constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException(value);
        } else {
            return constant;
        }
    }

}
