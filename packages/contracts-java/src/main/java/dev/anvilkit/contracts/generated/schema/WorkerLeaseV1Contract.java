
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;


/**
 * WorkerLeaseV1 contract
 * <p>
 * Bounded WorkerLeaseV1 wire contract governed by PRD 0012.
 * 
 */
public class WorkerLeaseV1Contract {

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
    private Integer attemptNumber;
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
    private Date expiresAt;
    /**
     * 
     * (Required)
     * 
     */
    private String fenceToken;
    /**
     * 
     * (Required)
     * 
     */
    private Date issuedAt;
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
    private String owner;
    /**
     * 
     * (Required)
     * 
     */
    private String physicalAttemptId;
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
    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
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
    public String getFenceToken() {
        return fenceToken;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setFenceToken(String fenceToken) {
        this.fenceToken = fenceToken;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getIssuedAt() {
        return issuedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setIssuedAt(Date issuedAt) {
        this.issuedAt = issuedAt;
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
    public String getOwner() {
        return owner;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOwner(String owner) {
        this.owner = owner;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(WorkerLeaseV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("attemptNumber");
        sb.append('=');
        sb.append(((this.attemptNumber == null)?"<null>":this.attemptNumber));
        sb.append(',');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("expiresAt");
        sb.append('=');
        sb.append(((this.expiresAt == null)?"<null>":this.expiresAt));
        sb.append(',');
        sb.append("fenceToken");
        sb.append('=');
        sb.append(((this.fenceToken == null)?"<null>":this.fenceToken));
        sb.append(',');
        sb.append("issuedAt");
        sb.append('=');
        sb.append(((this.issuedAt == null)?"<null>":this.issuedAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("leaseEpoch");
        sb.append('=');
        sb.append(((this.leaseEpoch == null)?"<null>":this.leaseEpoch));
        sb.append(',');
        sb.append("owner");
        sb.append('=');
        sb.append(((this.owner == null)?"<null>":this.owner));
        sb.append(',');
        sb.append("physicalAttemptId");
        sb.append('=');
        sb.append(((this.physicalAttemptId == null)?"<null>":this.physicalAttemptId));
        sb.append(',');
        sb.append("recoveryEpoch");
        sb.append('=');
        sb.append(((this.recoveryEpoch == null)?"<null>":this.recoveryEpoch));
        sb.append(',');
        sb.append("taskId");
        sb.append('=');
        sb.append(((this.taskId == null)?"<null>":this.taskId));
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
        result = ((result* 31)+((this.attemptNumber == null)? 0 :this.attemptNumber.hashCode()));
        result = ((result* 31)+((this.owner == null)? 0 :this.owner.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.expiresAt == null)? 0 :this.expiresAt.hashCode()));
        result = ((result* 31)+((this.recoveryEpoch == null)? 0 :this.recoveryEpoch.hashCode()));
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.fenceToken == null)? 0 :this.fenceToken.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.physicalAttemptId == null)? 0 :this.physicalAttemptId.hashCode()));
        result = ((result* 31)+((this.issuedAt == null)? 0 :this.issuedAt.hashCode()));
        result = ((result* 31)+((this.leaseEpoch == null)? 0 :this.leaseEpoch.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof WorkerLeaseV1Contract) == false) {
            return false;
        }
        WorkerLeaseV1Contract rhs = ((WorkerLeaseV1Contract) other);
        return (((((((((((((this.attemptNumber == rhs.attemptNumber)||((this.attemptNumber!= null)&&this.attemptNumber.equals(rhs.attemptNumber)))&&((this.owner == rhs.owner)||((this.owner!= null)&&this.owner.equals(rhs.owner))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.expiresAt == rhs.expiresAt)||((this.expiresAt!= null)&&this.expiresAt.equals(rhs.expiresAt))))&&((this.recoveryEpoch == rhs.recoveryEpoch)||((this.recoveryEpoch!= null)&&this.recoveryEpoch.equals(rhs.recoveryEpoch))))&&((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration))))&&((this.fenceToken == rhs.fenceToken)||((this.fenceToken!= null)&&this.fenceToken.equals(rhs.fenceToken))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.physicalAttemptId == rhs.physicalAttemptId)||((this.physicalAttemptId!= null)&&this.physicalAttemptId.equals(rhs.physicalAttemptId))))&&((this.issuedAt == rhs.issuedAt)||((this.issuedAt!= null)&&this.issuedAt.equals(rhs.issuedAt))))&&((this.leaseEpoch == rhs.leaseEpoch)||((this.leaseEpoch!= null)&&this.leaseEpoch.equals(rhs.leaseEpoch))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))));
    }

}
