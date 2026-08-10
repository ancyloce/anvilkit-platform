
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * WorkerResultV1 contract
 * <p>
 * Bounded WorkerResultV1 wire contract governed by PRD 0012.
 * 
 */
public class WorkerResultV1Contract {

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
    private List<SharedPrimitivesV1ArtifactReference> artifacts = new ArrayList<SharedPrimitivesV1ArtifactReference>();
    /**
     * 
     * (Required)
     * 
     */
    private String buildIdentity;
    /**
     * 
     * (Required)
     * 
     */
    private WorkerResultV1Contract.Capability capability;
    /**
     * 
     * (Required)
     * 
     */
    private Date completedAt;
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
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private Long leaseEpoch;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1BoundedStringMap metrics;
    /**
     * 
     * (Required)
     * 
     */
    private String physicalAttemptId;
    /**
     * ProblemDetailsV1 contract
     * <p>
     * Bounded ProblemDetailsV1 wire contract governed by PRD 0012.
     * 
     */
    private ProblemDetailsV1Contract problem;
    /**
     * 
     * (Required)
     * 
     */
    private Long recoveryEpoch;
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
    private List<String> usageReferences = new ArrayList<String>();
    /**
     * 
     * (Required)
     * 
     */
    private List<ProblemDetailsV1Contract> warnings = new ArrayList<ProblemDetailsV1Contract>();

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
    public List<SharedPrimitivesV1ArtifactReference> getArtifacts() {
        return artifacts;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setArtifacts(List<SharedPrimitivesV1ArtifactReference> artifacts) {
        this.artifacts = artifacts;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getBuildIdentity() {
        return buildIdentity;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBuildIdentity(String buildIdentity) {
        this.buildIdentity = buildIdentity;
    }

    /**
     * 
     * (Required)
     * 
     */
    public WorkerResultV1Contract.Capability getCapability() {
        return capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapability(WorkerResultV1Contract.Capability capability) {
        this.capability = capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getCompletedAt() {
        return completedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCompletedAt(Date completedAt) {
        this.completedAt = completedAt;
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
    public Long getLeaseEpoch() {
        return leaseEpoch;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLeaseEpoch(Long leaseEpoch) {
        this.leaseEpoch = leaseEpoch;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1BoundedStringMap getMetrics() {
        return metrics;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMetrics(SharedPrimitivesV1BoundedStringMap metrics) {
        this.metrics = metrics;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getPhysicalAttemptId() {
        return physicalAttemptId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPhysicalAttemptId(String physicalAttemptId) {
        this.physicalAttemptId = physicalAttemptId;
    }

    /**
     * ProblemDetailsV1 contract
     * <p>
     * Bounded ProblemDetailsV1 wire contract governed by PRD 0012.
     * 
     */
    public ProblemDetailsV1Contract getProblem() {
        return problem;
    }

    /**
     * ProblemDetailsV1 contract
     * <p>
     * Bounded ProblemDetailsV1 wire contract governed by PRD 0012.
     * 
     */
    public void setProblem(ProblemDetailsV1Contract problem) {
        this.problem = problem;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getRecoveryEpoch() {
        return recoveryEpoch;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRecoveryEpoch(Long recoveryEpoch) {
        this.recoveryEpoch = recoveryEpoch;
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
    public List<String> getUsageReferences() {
        return usageReferences;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setUsageReferences(List<String> usageReferences) {
        this.usageReferences = usageReferences;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<ProblemDetailsV1Contract> getWarnings() {
        return warnings;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setWarnings(List<ProblemDetailsV1Contract> warnings) {
        this.warnings = warnings;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(WorkerResultV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("artifacts");
        sb.append('=');
        sb.append(((this.artifacts == null)?"<null>":this.artifacts));
        sb.append(',');
        sb.append("buildIdentity");
        sb.append('=');
        sb.append(((this.buildIdentity == null)?"<null>":this.buildIdentity));
        sb.append(',');
        sb.append("capability");
        sb.append('=');
        sb.append(((this.capability == null)?"<null>":this.capability));
        sb.append(',');
        sb.append("completedAt");
        sb.append('=');
        sb.append(((this.completedAt == null)?"<null>":this.completedAt));
        sb.append(',');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("leaseEpoch");
        sb.append('=');
        sb.append(((this.leaseEpoch == null)?"<null>":this.leaseEpoch));
        sb.append(',');
        sb.append("metrics");
        sb.append('=');
        sb.append(((this.metrics == null)?"<null>":this.metrics));
        sb.append(',');
        sb.append("physicalAttemptId");
        sb.append('=');
        sb.append(((this.physicalAttemptId == null)?"<null>":this.physicalAttemptId));
        sb.append(',');
        sb.append("problem");
        sb.append('=');
        sb.append(((this.problem == null)?"<null>":this.problem));
        sb.append(',');
        sb.append("recoveryEpoch");
        sb.append('=');
        sb.append(((this.recoveryEpoch == null)?"<null>":this.recoveryEpoch));
        sb.append(',');
        sb.append("taskId");
        sb.append('=');
        sb.append(((this.taskId == null)?"<null>":this.taskId));
        sb.append(',');
        sb.append("usageReferences");
        sb.append('=');
        sb.append(((this.usageReferences == null)?"<null>":this.usageReferences));
        sb.append(',');
        sb.append("warnings");
        sb.append('=');
        sb.append(((this.warnings == null)?"<null>":this.warnings));
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
        result = ((result* 31)+((this.completedAt == null)? 0 :this.completedAt.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.warnings == null)? 0 :this.warnings.hashCode()));
        result = ((result* 31)+((this.usageReferences == null)? 0 :this.usageReferences.hashCode()));
        result = ((result* 31)+((this.buildIdentity == null)? 0 :this.buildIdentity.hashCode()));
        result = ((result* 31)+((this.recoveryEpoch == null)? 0 :this.recoveryEpoch.hashCode()));
        result = ((result* 31)+((this.capability == null)? 0 :this.capability.hashCode()));
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.problem == null)? 0 :this.problem.hashCode()));
        result = ((result* 31)+((this.physicalAttemptId == null)? 0 :this.physicalAttemptId.hashCode()));
        result = ((result* 31)+((this.leaseEpoch == null)? 0 :this.leaseEpoch.hashCode()));
        result = ((result* 31)+((this.metrics == null)? 0 :this.metrics.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        result = ((result* 31)+((this.artifacts == null)? 0 :this.artifacts.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof WorkerResultV1Contract) == false) {
            return false;
        }
        WorkerResultV1Contract rhs = ((WorkerResultV1Contract) other);
        return ((((((((((((((((this.completedAt == rhs.completedAt)||((this.completedAt!= null)&&this.completedAt.equals(rhs.completedAt)))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.warnings == rhs.warnings)||((this.warnings!= null)&&this.warnings.equals(rhs.warnings))))&&((this.usageReferences == rhs.usageReferences)||((this.usageReferences!= null)&&this.usageReferences.equals(rhs.usageReferences))))&&((this.buildIdentity == rhs.buildIdentity)||((this.buildIdentity!= null)&&this.buildIdentity.equals(rhs.buildIdentity))))&&((this.recoveryEpoch == rhs.recoveryEpoch)||((this.recoveryEpoch!= null)&&this.recoveryEpoch.equals(rhs.recoveryEpoch))))&&((this.capability == rhs.capability)||((this.capability!= null)&&this.capability.equals(rhs.capability))))&&((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.problem == rhs.problem)||((this.problem!= null)&&this.problem.equals(rhs.problem))))&&((this.physicalAttemptId == rhs.physicalAttemptId)||((this.physicalAttemptId!= null)&&this.physicalAttemptId.equals(rhs.physicalAttemptId))))&&((this.leaseEpoch == rhs.leaseEpoch)||((this.leaseEpoch!= null)&&this.leaseEpoch.equals(rhs.leaseEpoch))))&&((this.metrics == rhs.metrics)||((this.metrics!= null)&&this.metrics.equals(rhs.metrics))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))))&&((this.artifacts == rhs.artifacts)||((this.artifacts!= null)&&this.artifacts.equals(rhs.artifacts))));
    }

    public enum Capability {

        PROVIDER_INVOKE("provider.invoke"),
        CONTRACT_VALIDATE("contract.validate"),
        ARTIFACT_SCAN("artifact.scan"),
        FAKE_EXECUTE("fake.execute");
        private final String value;
        private final static Map<String, WorkerResultV1Contract.Capability> CONSTANTS = new HashMap<String, WorkerResultV1Contract.Capability>();

        static {
            for (WorkerResultV1Contract.Capability c: values()) {
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

        public static WorkerResultV1Contract.Capability fromValue(String value) {
            WorkerResultV1Contract.Capability constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
