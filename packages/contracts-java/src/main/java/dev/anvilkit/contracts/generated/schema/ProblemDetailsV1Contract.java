
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * ProblemDetailsV1 contract
 * <p>
 * Bounded ProblemDetailsV1 wire contract governed by PRD 0012.
 * 
 */
public class ProblemDetailsV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Object apiVersion;
    /**
     * 
     * (Required)
     * 
     */
    private String code;
    /**
     * 
     * (Required)
     * 
     */
    private List<FieldError> fieldErrors = new ArrayList<FieldError>();
    /**
     * 
     * (Required)
     * 
     */
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private String message;
    /**
     * 
     * (Required)
     * 
     */
    private ProblemDetailsV1Contract.Retryability retryability;
    private String runId;
    private String stage;
    private String traceId;

    /**
     * 
     * (Required)
     * 
     */
    public Object getApiVersion() {
        return apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setApiVersion(Object apiVersion) {
        this.apiVersion = apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getCode() {
        return code;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCode(String code) {
        this.code = code;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setFieldErrors(List<FieldError> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Object getKind() {
        return kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKind(Object kind) {
        this.kind = kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getMessage() {
        return message;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ProblemDetailsV1Contract.Retryability getRetryability() {
        return retryability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRetryability(ProblemDetailsV1Contract.Retryability retryability) {
        this.retryability = retryability;
    }

    public String getRunId() {
        return runId;
    }

    public void setRunId(String runId) {
        this.runId = runId;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ProblemDetailsV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("code");
        sb.append('=');
        sb.append(((this.code == null)?"<null>":this.code));
        sb.append(',');
        sb.append("fieldErrors");
        sb.append('=');
        sb.append(((this.fieldErrors == null)?"<null>":this.fieldErrors));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("message");
        sb.append('=');
        sb.append(((this.message == null)?"<null>":this.message));
        sb.append(',');
        sb.append("retryability");
        sb.append('=');
        sb.append(((this.retryability == null)?"<null>":this.retryability));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
        sb.append(',');
        sb.append("stage");
        sb.append('=');
        sb.append(((this.stage == null)?"<null>":this.stage));
        sb.append(',');
        sb.append("traceId");
        sb.append('=');
        sb.append(((this.traceId == null)?"<null>":this.traceId));
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
        result = ((result* 31)+((this.traceId == null)? 0 :this.traceId.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.code == null)? 0 :this.code.hashCode()));
        result = ((result* 31)+((this.fieldErrors == null)? 0 :this.fieldErrors.hashCode()));
        result = ((result* 31)+((this.retryability == null)? 0 :this.retryability.hashCode()));
        result = ((result* 31)+((this.stage == null)? 0 :this.stage.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this.message == null)? 0 :this.message.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ProblemDetailsV1Contract) == false) {
            return false;
        }
        ProblemDetailsV1Contract rhs = ((ProblemDetailsV1Contract) other);
        return ((((((((((this.traceId == rhs.traceId)||((this.traceId!= null)&&this.traceId.equals(rhs.traceId)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.code == rhs.code)||((this.code!= null)&&this.code.equals(rhs.code))))&&((this.fieldErrors == rhs.fieldErrors)||((this.fieldErrors!= null)&&this.fieldErrors.equals(rhs.fieldErrors))))&&((this.retryability == rhs.retryability)||((this.retryability!= null)&&this.retryability.equals(rhs.retryability))))&&((this.stage == rhs.stage)||((this.stage!= null)&&this.stage.equals(rhs.stage))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this.message == rhs.message)||((this.message!= null)&&this.message.equals(rhs.message))));
    }

    public enum Retryability {

        NEVER("never"),
        SAFE_IMMEDIATE("safe-immediate"),
        SAFE_AFTER_BACKOFF("safe-after-backoff"),
        AFTER_INPUT("after-input"),
        AFTER_APPROVAL("after-approval"),
        AFTER_REBASE("after-rebase"),
        OPERATOR_ACTION("operator-action");
        private final String value;
        private final static Map<String, ProblemDetailsV1Contract.Retryability> CONSTANTS = new HashMap<String, ProblemDetailsV1Contract.Retryability>();

        static {
            for (ProblemDetailsV1Contract.Retryability c: values()) {
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

        public static ProblemDetailsV1Contract.Retryability fromValue(String value) {
            ProblemDetailsV1Contract.Retryability constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
