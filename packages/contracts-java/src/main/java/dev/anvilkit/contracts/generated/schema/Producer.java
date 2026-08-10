
package dev.anvilkit.contracts.generated.schema;


public class Producer {

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
    private Long leaseEpoch;
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
        sb.append(Producer.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("leaseEpoch");
        sb.append('=');
        sb.append(((this.leaseEpoch == null)?"<null>":this.leaseEpoch));
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
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.leaseEpoch == null)? 0 :this.leaseEpoch.hashCode()));
        result = ((result* 31)+((this.physicalAttemptId == null)? 0 :this.physicalAttemptId.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        result = ((result* 31)+((this.recoveryEpoch == null)? 0 :this.recoveryEpoch.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Producer) == false) {
            return false;
        }
        Producer rhs = ((Producer) other);
        return ((((((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration)))&&((this.leaseEpoch == rhs.leaseEpoch)||((this.leaseEpoch!= null)&&this.leaseEpoch.equals(rhs.leaseEpoch))))&&((this.physicalAttemptId == rhs.physicalAttemptId)||((this.physicalAttemptId!= null)&&this.physicalAttemptId.equals(rhs.physicalAttemptId))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))))&&((this.recoveryEpoch == rhs.recoveryEpoch)||((this.recoveryEpoch!= null)&&this.recoveryEpoch.equals(rhs.recoveryEpoch))));
    }

}
