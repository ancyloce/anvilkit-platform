
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class Operation {

    /**
     * 
     * (Required)
     * 
     */
    private String operationId;
    /**
     * 
     * (Required)
     * 
     */
    private Operation.OperationType operationType;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1BoundedStringMap parameters;

    /**
     * 
     * (Required)
     * 
     */
    public String getOperationId() {
        return operationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOperationId(String operationId) {
        this.operationId = operationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Operation.OperationType getOperationType() {
        return operationType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOperationType(Operation.OperationType operationType) {
        this.operationType = operationType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1BoundedStringMap getParameters() {
        return parameters;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setParameters(SharedPrimitivesV1BoundedStringMap parameters) {
        this.parameters = parameters;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Operation.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("operationId");
        sb.append('=');
        sb.append(((this.operationId == null)?"<null>":this.operationId));
        sb.append(',');
        sb.append("operationType");
        sb.append('=');
        sb.append(((this.operationType == null)?"<null>":this.operationType));
        sb.append(',');
        sb.append("parameters");
        sb.append('=');
        sb.append(((this.parameters == null)?"<null>":this.parameters));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.operationId == null)? 0 :this.operationId.hashCode()));
        result = ((result* 31)+((this.operationType == null)? 0 :this.operationType.hashCode()));
        result = ((result* 31)+((this.parameters == null)? 0 :this.parameters.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Operation) == false) {
            return false;
        }
        Operation rhs = ((Operation) other);
        return ((((this.operationId == rhs.operationId)||((this.operationId!= null)&&this.operationId.equals(rhs.operationId)))&&((this.operationType == rhs.operationType)||((this.operationType!= null)&&this.operationType.equals(rhs.operationType))))&&((this.parameters == rhs.parameters)||((this.parameters!= null)&&this.parameters.equals(rhs.parameters))));
    }

    public enum OperationType {

        CROP("crop"),
        RESIZE("resize"),
        COMPOSITE("composite"),
        ENCODE("encode");
        private final String value;
        private final static Map<String, Operation.OperationType> CONSTANTS = new HashMap<String, Operation.OperationType>();

        static {
            for (Operation.OperationType c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        OperationType(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static Operation.OperationType fromValue(String value) {
            Operation.OperationType constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
