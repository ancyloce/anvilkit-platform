
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class Check {

    /**
     * 
     * (Required)
     * 
     */
    private String evidenceDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String name;
    /**
     * 
     * (Required)
     * 
     */
    private Check.Result result;

    /**
     * 
     * (Required)
     * 
     */
    public String getEvidenceDigest() {
        return evidenceDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEvidenceDigest(String evidenceDigest) {
        this.evidenceDigest = evidenceDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getName() {
        return name;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Check.Result getResult() {
        return result;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResult(Check.Result result) {
        this.result = result;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Check.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("evidenceDigest");
        sb.append('=');
        sb.append(((this.evidenceDigest == null)?"<null>":this.evidenceDigest));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("result");
        sb.append('=');
        sb.append(((this.result == null)?"<null>":this.result));
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
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.result == null)? 0 :this.result.hashCode()));
        result = ((result* 31)+((this.evidenceDigest == null)? 0 :this.evidenceDigest.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Check) == false) {
            return false;
        }
        Check rhs = ((Check) other);
        return ((((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name)))&&((this.result == rhs.result)||((this.result!= null)&&this.result.equals(rhs.result))))&&((this.evidenceDigest == rhs.evidenceDigest)||((this.evidenceDigest!= null)&&this.evidenceDigest.equals(rhs.evidenceDigest))));
    }

    public enum Result {

        PASSED("passed"),
        FAILED("failed");
        private final String value;
        private final static Map<String, Check.Result> CONSTANTS = new HashMap<String, Check.Result>();

        static {
            for (Check.Result c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Result(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static Check.Result fromValue(String value) {
            Check.Result constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
