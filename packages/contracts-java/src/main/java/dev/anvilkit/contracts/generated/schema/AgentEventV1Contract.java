
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * AgentEventV1 contract
 * <p>
 * Bounded AgentEventV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentEventV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Object apiVersion;
    private SharedPrimitivesV1ArtifactReference artifactReference;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1ContractBomReferenceV1 contractBomReference;
    /**
     * 
     * (Required)
     * 
     */
    private String eventId;
    /**
     * 
     * (Required)
     * 
     */
    private AgentEventV1Contract.EventType eventType;
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
    private Date occurredAt;
    private SharedPrimitivesV1BoundedStringMap payload;
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
    private Long sequence;
    private String taskId;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1TraceContext traceContext;

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

    public SharedPrimitivesV1ArtifactReference getArtifactReference() {
        return artifactReference;
    }

    public void setArtifactReference(SharedPrimitivesV1ArtifactReference artifactReference) {
        this.artifactReference = artifactReference;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1ContractBomReferenceV1 getContractBomReference() {
        return contractBomReference;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setContractBomReference(SharedPrimitivesV1ContractBomReferenceV1 contractBomReference) {
        this.contractBomReference = contractBomReference;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getEventId() {
        return eventId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentEventV1Contract.EventType getEventType() {
        return eventType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEventType(AgentEventV1Contract.EventType eventType) {
        this.eventType = eventType;
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
    public Date getOccurredAt() {
        return occurredAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOccurredAt(Date occurredAt) {
        this.occurredAt = occurredAt;
    }

    public SharedPrimitivesV1BoundedStringMap getPayload() {
        return payload;
    }

    public void setPayload(SharedPrimitivesV1BoundedStringMap payload) {
        this.payload = payload;
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
    public Long getSequence() {
        return sequence;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSequence(Long sequence) {
        this.sequence = sequence;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1TraceContext getTraceContext() {
        return traceContext;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTraceContext(SharedPrimitivesV1TraceContext traceContext) {
        this.traceContext = traceContext;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AgentEventV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("artifactReference");
        sb.append('=');
        sb.append(((this.artifactReference == null)?"<null>":this.artifactReference));
        sb.append(',');
        sb.append("contractBomReference");
        sb.append('=');
        sb.append(((this.contractBomReference == null)?"<null>":this.contractBomReference));
        sb.append(',');
        sb.append("eventId");
        sb.append('=');
        sb.append(((this.eventId == null)?"<null>":this.eventId));
        sb.append(',');
        sb.append("eventType");
        sb.append('=');
        sb.append(((this.eventType == null)?"<null>":this.eventType));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("occurredAt");
        sb.append('=');
        sb.append(((this.occurredAt == null)?"<null>":this.occurredAt));
        sb.append(',');
        sb.append("payload");
        sb.append('=');
        sb.append(((this.payload == null)?"<null>":this.payload));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
        sb.append(',');
        sb.append("sequence");
        sb.append('=');
        sb.append(((this.sequence == null)?"<null>":this.sequence));
        sb.append(',');
        sb.append("taskId");
        sb.append('=');
        sb.append(((this.taskId == null)?"<null>":this.taskId));
        sb.append(',');
        sb.append("traceContext");
        sb.append('=');
        sb.append(((this.traceContext == null)?"<null>":this.traceContext));
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
        result = ((result* 31)+((this.eventId == null)? 0 :this.eventId.hashCode()));
        result = ((result* 31)+((this.occurredAt == null)? 0 :this.occurredAt.hashCode()));
        result = ((result* 31)+((this.artifactReference == null)? 0 :this.artifactReference.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.eventType == null)? 0 :this.eventType.hashCode()));
        result = ((result* 31)+((this.traceContext == null)? 0 :this.traceContext.hashCode()));
        result = ((result* 31)+((this.sequence == null)? 0 :this.sequence.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.payload == null)? 0 :this.payload.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        result = ((result* 31)+((this.contractBomReference == null)? 0 :this.contractBomReference.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentEventV1Contract) == false) {
            return false;
        }
        AgentEventV1Contract rhs = ((AgentEventV1Contract) other);
        return (((((((((((((this.eventId == rhs.eventId)||((this.eventId!= null)&&this.eventId.equals(rhs.eventId)))&&((this.occurredAt == rhs.occurredAt)||((this.occurredAt!= null)&&this.occurredAt.equals(rhs.occurredAt))))&&((this.artifactReference == rhs.artifactReference)||((this.artifactReference!= null)&&this.artifactReference.equals(rhs.artifactReference))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.eventType == rhs.eventType)||((this.eventType!= null)&&this.eventType.equals(rhs.eventType))))&&((this.traceContext == rhs.traceContext)||((this.traceContext!= null)&&this.traceContext.equals(rhs.traceContext))))&&((this.sequence == rhs.sequence)||((this.sequence!= null)&&this.sequence.equals(rhs.sequence))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.payload == rhs.payload)||((this.payload!= null)&&this.payload.equals(rhs.payload))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))))&&((this.contractBomReference == rhs.contractBomReference)||((this.contractBomReference!= null)&&this.contractBomReference.equals(rhs.contractBomReference))));
    }

    public enum EventType {

        RUN_CREATED("run.created"),
        RUN_STATE_CHANGED("run.state-changed"),
        RUN_INPUT_REQUESTED("run.input-requested"),
        RUN_APPROVAL_REQUESTED("run.approval-requested"),
        RUN_ARTIFACT_AVAILABLE("run.artifact-available"),
        RUN_PROBLEM_RECORDED("run.problem-recorded");
        private final String value;
        private final static Map<String, AgentEventV1Contract.EventType> CONSTANTS = new HashMap<String, AgentEventV1Contract.EventType>();

        static {
            for (AgentEventV1Contract.EventType c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        EventType(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentEventV1Contract.EventType fromValue(String value) {
            AgentEventV1Contract.EventType constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
