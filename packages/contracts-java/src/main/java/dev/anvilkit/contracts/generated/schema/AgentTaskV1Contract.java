
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * AgentTaskV1 contract
 * <p>
 * Bounded AgentTaskV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentTaskV1Contract {

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
    private List<SharedPrimitivesV1ArtifactReference> artifactInputs = new ArrayList<SharedPrimitivesV1ArtifactReference>();
    /**
     * 
     * (Required)
     * 
     */
    private AgentTaskV1Contract.Capability capability;
    /**
     * 
     * (Required)
     * 
     */
    private AgentTaskV1Contract.CapabilityVersion capabilityVersion;
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
    private Long executionGeneration;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1Idempotency idempotency;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1SchemaReference inputSchemaVersion;
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
    private SharedPrimitivesV1ResourceLimits limits;
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
    private Resources resources;
    /**
     * 
     * (Required)
     * 
     */
    private String rootRunId;
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

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1ArtifactReference> getArtifactInputs() {
        return artifactInputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setArtifactInputs(List<SharedPrimitivesV1ArtifactReference> artifactInputs) {
        this.artifactInputs = artifactInputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentTaskV1Contract.Capability getCapability() {
        return capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapability(AgentTaskV1Contract.Capability capability) {
        this.capability = capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentTaskV1Contract.CapabilityVersion getCapabilityVersion() {
        return capabilityVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapabilityVersion(AgentTaskV1Contract.CapabilityVersion capabilityVersion) {
        this.capabilityVersion = capabilityVersion;
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
    public Long getExecutionGeneration() {
        return executionGeneration;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setExecutionGeneration(Long executionGeneration) {
        this.executionGeneration = executionGeneration;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1Idempotency getIdempotency() {
        return idempotency;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setIdempotency(SharedPrimitivesV1Idempotency idempotency) {
        this.idempotency = idempotency;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1SchemaReference getInputSchemaVersion() {
        return inputSchemaVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setInputSchemaVersion(SharedPrimitivesV1SchemaReference inputSchemaVersion) {
        this.inputSchemaVersion = inputSchemaVersion;
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
    public SharedPrimitivesV1ResourceLimits getLimits() {
        return limits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLimits(SharedPrimitivesV1ResourceLimits limits) {
        this.limits = limits;
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

    /**
     * 
     * (Required)
     * 
     */
    public Resources getResources() {
        return resources;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResources(Resources resources) {
        this.resources = resources;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getRootRunId() {
        return rootRunId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRootRunId(String rootRunId) {
        this.rootRunId = rootRunId;
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
    public String getTaskId() {
        return taskId;
    }

    /**
     * 
     * (Required)
     * 
     */
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
        sb.append(AgentTaskV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("artifactInputs");
        sb.append('=');
        sb.append(((this.artifactInputs == null)?"<null>":this.artifactInputs));
        sb.append(',');
        sb.append("capability");
        sb.append('=');
        sb.append(((this.capability == null)?"<null>":this.capability));
        sb.append(',');
        sb.append("capabilityVersion");
        sb.append('=');
        sb.append(((this.capabilityVersion == null)?"<null>":this.capabilityVersion));
        sb.append(',');
        sb.append("contractBomReference");
        sb.append('=');
        sb.append(((this.contractBomReference == null)?"<null>":this.contractBomReference));
        sb.append(',');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("idempotency");
        sb.append('=');
        sb.append(((this.idempotency == null)?"<null>":this.idempotency));
        sb.append(',');
        sb.append("inputSchemaVersion");
        sb.append('=');
        sb.append(((this.inputSchemaVersion == null)?"<null>":this.inputSchemaVersion));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("limits");
        sb.append('=');
        sb.append(((this.limits == null)?"<null>":this.limits));
        sb.append(',');
        sb.append("parameters");
        sb.append('=');
        sb.append(((this.parameters == null)?"<null>":this.parameters));
        sb.append(',');
        sb.append("resources");
        sb.append('=');
        sb.append(((this.resources == null)?"<null>":this.resources));
        sb.append(',');
        sb.append("rootRunId");
        sb.append('=');
        sb.append(((this.rootRunId == null)?"<null>":this.rootRunId));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
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
        result = ((result* 31)+((this.artifactInputs == null)? 0 :this.artifactInputs.hashCode()));
        result = ((result* 31)+((this.idempotency == null)? 0 :this.idempotency.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.resources == null)? 0 :this.resources.hashCode()));
        result = ((result* 31)+((this.traceContext == null)? 0 :this.traceContext.hashCode()));
        result = ((result* 31)+((this.capability == null)? 0 :this.capability.hashCode()));
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.inputSchemaVersion == null)? 0 :this.inputSchemaVersion.hashCode()));
        result = ((result* 31)+((this.rootRunId == null)? 0 :this.rootRunId.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this.capabilityVersion == null)? 0 :this.capabilityVersion.hashCode()));
        result = ((result* 31)+((this.parameters == null)? 0 :this.parameters.hashCode()));
        result = ((result* 31)+((this.limits == null)? 0 :this.limits.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        result = ((result* 31)+((this.contractBomReference == null)? 0 :this.contractBomReference.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentTaskV1Contract) == false) {
            return false;
        }
        AgentTaskV1Contract rhs = ((AgentTaskV1Contract) other);
        return (((((((((((((((((this.artifactInputs == rhs.artifactInputs)||((this.artifactInputs!= null)&&this.artifactInputs.equals(rhs.artifactInputs)))&&((this.idempotency == rhs.idempotency)||((this.idempotency!= null)&&this.idempotency.equals(rhs.idempotency))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.resources == rhs.resources)||((this.resources!= null)&&this.resources.equals(rhs.resources))))&&((this.traceContext == rhs.traceContext)||((this.traceContext!= null)&&this.traceContext.equals(rhs.traceContext))))&&((this.capability == rhs.capability)||((this.capability!= null)&&this.capability.equals(rhs.capability))))&&((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.inputSchemaVersion == rhs.inputSchemaVersion)||((this.inputSchemaVersion!= null)&&this.inputSchemaVersion.equals(rhs.inputSchemaVersion))))&&((this.rootRunId == rhs.rootRunId)||((this.rootRunId!= null)&&this.rootRunId.equals(rhs.rootRunId))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this.capabilityVersion == rhs.capabilityVersion)||((this.capabilityVersion!= null)&&this.capabilityVersion.equals(rhs.capabilityVersion))))&&((this.parameters == rhs.parameters)||((this.parameters!= null)&&this.parameters.equals(rhs.parameters))))&&((this.limits == rhs.limits)||((this.limits!= null)&&this.limits.equals(rhs.limits))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))))&&((this.contractBomReference == rhs.contractBomReference)||((this.contractBomReference!= null)&&this.contractBomReference.equals(rhs.contractBomReference))));
    }

    public enum Capability {

        PROVIDER_INVOKE("provider.invoke"),
        CONTRACT_VALIDATE("contract.validate"),
        ARTIFACT_SCAN("artifact.scan"),
        FAKE_EXECUTE("fake.execute");
        private final String value;
        private final static Map<String, AgentTaskV1Contract.Capability> CONSTANTS = new HashMap<String, AgentTaskV1Contract.Capability>();

        static {
            for (AgentTaskV1Contract.Capability c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Capability(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentTaskV1Contract.Capability fromValue(String value) {
            AgentTaskV1Contract.Capability constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum CapabilityVersion {

        PROVIDER_INVOKE_V_1("provider.invoke/v1"),
        CONTRACT_VALIDATE_V_1("contract.validate/v1"),
        ARTIFACT_SCAN_V_1("artifact.scan/v1"),
        FAKE_EXECUTE_V_1("fake.execute/v1");
        private final String value;
        private final static Map<String, AgentTaskV1Contract.CapabilityVersion> CONSTANTS = new HashMap<String, AgentTaskV1Contract.CapabilityVersion>();

        static {
            for (AgentTaskV1Contract.CapabilityVersion c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        CapabilityVersion(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentTaskV1Contract.CapabilityVersion fromValue(String value) {
            AgentTaskV1Contract.CapabilityVersion constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
