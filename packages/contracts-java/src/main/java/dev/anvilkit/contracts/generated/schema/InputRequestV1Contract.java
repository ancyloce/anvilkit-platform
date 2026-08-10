
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * InputRequestV1 contract
 * <p>
 * Bounded InputRequestV1 wire contract governed by PRD 0012.
 * 
 */
public class InputRequestV1Contract {

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
    private Date expiresAt;
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
    private String question;
    /**
     * 
     * (Required)
     * 
     */
    private String requestId;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1SchemaReference responseSchema;
    /**
     * 
     * (Required)
     * 
     */
    private InputRequestV1Contract.ResumeState resumeState;
    /**
     * 
     * (Required)
     * 
     */
    private String runId;
    /**
     * 
     * (Required)
     * 
     */
    private Long version;

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
    public Date getExpiresAt() {
        return expiresAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
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
    public String getQuestion() {
        return question;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setQuestion(String question) {
        this.question = question;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getRequestId() {
        return requestId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1SchemaReference getResponseSchema() {
        return responseSchema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResponseSchema(SharedPrimitivesV1SchemaReference responseSchema) {
        this.responseSchema = responseSchema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public InputRequestV1Contract.ResumeState getResumeState() {
        return resumeState;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResumeState(InputRequestV1Contract.ResumeState resumeState) {
        this.resumeState = resumeState;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getRunId() {
        return runId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRunId(String runId) {
        this.runId = runId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getVersion() {
        return version;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(InputRequestV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("expiresAt");
        sb.append('=');
        sb.append(((this.expiresAt == null)?"<null>":this.expiresAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("question");
        sb.append('=');
        sb.append(((this.question == null)?"<null>":this.question));
        sb.append(',');
        sb.append("requestId");
        sb.append('=');
        sb.append(((this.requestId == null)?"<null>":this.requestId));
        sb.append(',');
        sb.append("responseSchema");
        sb.append('=');
        sb.append(((this.responseSchema == null)?"<null>":this.responseSchema));
        sb.append(',');
        sb.append("resumeState");
        sb.append('=');
        sb.append(((this.resumeState == null)?"<null>":this.resumeState));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
        sb.append(',');
        sb.append("version");
        sb.append('=');
        sb.append(((this.version == null)?"<null>":this.version));
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
        result = ((result* 31)+((this.responseSchema == null)? 0 :this.responseSchema.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.question == null)? 0 :this.question.hashCode()));
        result = ((result* 31)+((this.resumeState == null)? 0 :this.resumeState.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.requestId == null)? 0 :this.requestId.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        result = ((result* 31)+((this.expiresAt == null)? 0 :this.expiresAt.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof InputRequestV1Contract) == false) {
            return false;
        }
        InputRequestV1Contract rhs = ((InputRequestV1Contract) other);
        return ((((((((((this.responseSchema == rhs.responseSchema)||((this.responseSchema!= null)&&this.responseSchema.equals(rhs.responseSchema)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.question == rhs.question)||((this.question!= null)&&this.question.equals(rhs.question))))&&((this.resumeState == rhs.resumeState)||((this.resumeState!= null)&&this.resumeState.equals(rhs.resumeState))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.requestId == rhs.requestId)||((this.requestId!= null)&&this.requestId.equals(rhs.requestId))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))))&&((this.expiresAt == rhs.expiresAt)||((this.expiresAt!= null)&&this.expiresAt.equals(rhs.expiresAt))));
    }

    public enum ResumeState {

        CREATED("created"),
        PREPARING("preparing"),
        PLANNING("planning"),
        AWAITING_INPUT("awaiting_input"),
        EXECUTING("executing"),
        VALIDATING("validating"),
        AWAITING_REVIEW("awaiting_review"),
        AWAITING_APPROVAL("awaiting_approval"),
        COMMITTING("committing"),
        AWAITING_DOMAIN_CONFIRMATION("awaiting_domain_confirmation"),
        CONFLICT("conflict"),
        CANCELLING("cancelling"),
        FAILED("failed"),
        COMPLETED("completed"),
        CANCELLED("cancelled"),
        REFUSED("refused"),
        DISCARDED("discarded");
        private final String value;
        private final static Map<String, InputRequestV1Contract.ResumeState> CONSTANTS = new HashMap<String, InputRequestV1Contract.ResumeState>();

        static {
            for (InputRequestV1Contract.ResumeState c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        ResumeState(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static InputRequestV1Contract.ResumeState fromValue(String value) {
            InputRequestV1Contract.ResumeState constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
