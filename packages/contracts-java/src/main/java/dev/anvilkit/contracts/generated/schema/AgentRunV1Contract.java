
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * AgentRunV1 contract
 * <p>
 * Bounded AgentRunV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentRunV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private String actorId;
    /**
     * 
     * (Required)
     * 
     */
    private Object apiVersion;
    /**
     * AgentBudgetV1 contract
     * <p>
     * Bounded AgentBudgetV1 wire contract governed by PRD 0012.
     * (Required)
     * 
     */
    private AgentBudgetV1Contract budget;
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
    private Date createdAt;
    /**
     * 
     * (Required)
     * 
     */
    private AgentRunV1Contract.Domain domain;
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
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private AgentRunV1Contract.Operation operation;
    private String parentRunId;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference policy;
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
    private AgentRunV1Contract.Status status;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1TargetReference target;
    /**
     * 
     * (Required)
     * 
     */
    private String tenantId;
    /**
     * 
     * (Required)
     * 
     */
    private Date updatedAt;
    /**
     * 
     * (Required)
     * 
     */
    private String workspaceId;

    /**
     * 
     * (Required)
     * 
     */
    public String getActorId() {
        return actorId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

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
     * AgentBudgetV1 contract
     * <p>
     * Bounded AgentBudgetV1 wire contract governed by PRD 0012.
     * (Required)
     * 
     */
    public AgentBudgetV1Contract getBudget() {
        return budget;
    }

    /**
     * AgentBudgetV1 contract
     * <p>
     * Bounded AgentBudgetV1 wire contract governed by PRD 0012.
     * (Required)
     * 
     */
    public void setBudget(AgentBudgetV1Contract budget) {
        this.budget = budget;
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
    public Date getCreatedAt() {
        return createdAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentRunV1Contract.Domain getDomain() {
        return domain;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDomain(AgentRunV1Contract.Domain domain) {
        this.domain = domain;
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
    public AgentRunV1Contract.Operation getOperation() {
        return operation;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOperation(AgentRunV1Contract.Operation operation) {
        this.operation = operation;
    }

    public String getParentRunId() {
        return parentRunId;
    }

    public void setParentRunId(String parentRunId) {
        this.parentRunId = parentRunId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getPolicy() {
        return policy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPolicy(SharedPrimitivesV1PolicyReference policy) {
        this.policy = policy;
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
    public AgentRunV1Contract.Status getStatus() {
        return status;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setStatus(AgentRunV1Contract.Status status) {
        this.status = status;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1TargetReference getTarget() {
        return target;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTarget(SharedPrimitivesV1TargetReference target) {
        this.target = target;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getTenantId() {
        return tenantId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getUpdatedAt() {
        return updatedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getWorkspaceId() {
        return workspaceId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AgentRunV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("actorId");
        sb.append('=');
        sb.append(((this.actorId == null)?"<null>":this.actorId));
        sb.append(',');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("budget");
        sb.append('=');
        sb.append(((this.budget == null)?"<null>":this.budget));
        sb.append(',');
        sb.append("contractBomReference");
        sb.append('=');
        sb.append(((this.contractBomReference == null)?"<null>":this.contractBomReference));
        sb.append(',');
        sb.append("createdAt");
        sb.append('=');
        sb.append(((this.createdAt == null)?"<null>":this.createdAt));
        sb.append(',');
        sb.append("domain");
        sb.append('=');
        sb.append(((this.domain == null)?"<null>":this.domain));
        sb.append(',');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("idempotency");
        sb.append('=');
        sb.append(((this.idempotency == null)?"<null>":this.idempotency));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("operation");
        sb.append('=');
        sb.append(((this.operation == null)?"<null>":this.operation));
        sb.append(',');
        sb.append("parentRunId");
        sb.append('=');
        sb.append(((this.parentRunId == null)?"<null>":this.parentRunId));
        sb.append(',');
        sb.append("policy");
        sb.append('=');
        sb.append(((this.policy == null)?"<null>":this.policy));
        sb.append(',');
        sb.append("problem");
        sb.append('=');
        sb.append(((this.problem == null)?"<null>":this.problem));
        sb.append(',');
        sb.append("rootRunId");
        sb.append('=');
        sb.append(((this.rootRunId == null)?"<null>":this.rootRunId));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
        sb.append(',');
        sb.append("status");
        sb.append('=');
        sb.append(((this.status == null)?"<null>":this.status));
        sb.append(',');
        sb.append("target");
        sb.append('=');
        sb.append(((this.target == null)?"<null>":this.target));
        sb.append(',');
        sb.append("tenantId");
        sb.append('=');
        sb.append(((this.tenantId == null)?"<null>":this.tenantId));
        sb.append(',');
        sb.append("updatedAt");
        sb.append('=');
        sb.append(((this.updatedAt == null)?"<null>":this.updatedAt));
        sb.append(',');
        sb.append("workspaceId");
        sb.append('=');
        sb.append(((this.workspaceId == null)?"<null>":this.workspaceId));
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
        result = ((result* 31)+((this.idempotency == null)? 0 :this.idempotency.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.target == null)? 0 :this.target.hashCode()));
        result = ((result* 31)+((this.parentRunId == null)? 0 :this.parentRunId.hashCode()));
        result = ((result* 31)+((this.createdAt == null)? 0 :this.createdAt.hashCode()));
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.actorId == null)? 0 :this.actorId.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.problem == null)? 0 :this.problem.hashCode()));
        result = ((result* 31)+((this.domain == null)? 0 :this.domain.hashCode()));
        result = ((result* 31)+((this.rootRunId == null)? 0 :this.rootRunId.hashCode()));
        result = ((result* 31)+((this.tenantId == null)? 0 :this.tenantId.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this.operation == null)? 0 :this.operation.hashCode()));
        result = ((result* 31)+((this.budget == null)? 0 :this.budget.hashCode()));
        result = ((result* 31)+((this.contractBomReference == null)? 0 :this.contractBomReference.hashCode()));
        result = ((result* 31)+((this.policy == null)? 0 :this.policy.hashCode()));
        result = ((result* 31)+((this.status == null)? 0 :this.status.hashCode()));
        result = ((result* 31)+((this.updatedAt == null)? 0 :this.updatedAt.hashCode()));
        result = ((result* 31)+((this.workspaceId == null)? 0 :this.workspaceId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentRunV1Contract) == false) {
            return false;
        }
        AgentRunV1Contract rhs = ((AgentRunV1Contract) other);
        return (((((((((((((((((((((this.idempotency == rhs.idempotency)||((this.idempotency!= null)&&this.idempotency.equals(rhs.idempotency)))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.target == rhs.target)||((this.target!= null)&&this.target.equals(rhs.target))))&&((this.parentRunId == rhs.parentRunId)||((this.parentRunId!= null)&&this.parentRunId.equals(rhs.parentRunId))))&&((this.createdAt == rhs.createdAt)||((this.createdAt!= null)&&this.createdAt.equals(rhs.createdAt))))&&((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration))))&&((this.actorId == rhs.actorId)||((this.actorId!= null)&&this.actorId.equals(rhs.actorId))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.problem == rhs.problem)||((this.problem!= null)&&this.problem.equals(rhs.problem))))&&((this.domain == rhs.domain)||((this.domain!= null)&&this.domain.equals(rhs.domain))))&&((this.rootRunId == rhs.rootRunId)||((this.rootRunId!= null)&&this.rootRunId.equals(rhs.rootRunId))))&&((this.tenantId == rhs.tenantId)||((this.tenantId!= null)&&this.tenantId.equals(rhs.tenantId))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this.operation == rhs.operation)||((this.operation!= null)&&this.operation.equals(rhs.operation))))&&((this.budget == rhs.budget)||((this.budget!= null)&&this.budget.equals(rhs.budget))))&&((this.contractBomReference == rhs.contractBomReference)||((this.contractBomReference!= null)&&this.contractBomReference.equals(rhs.contractBomReference))))&&((this.policy == rhs.policy)||((this.policy!= null)&&this.policy.equals(rhs.policy))))&&((this.status == rhs.status)||((this.status!= null)&&this.status.equals(rhs.status))))&&((this.updatedAt == rhs.updatedAt)||((this.updatedAt!= null)&&this.updatedAt.equals(rhs.updatedAt))))&&((this.workspaceId == rhs.workspaceId)||((this.workspaceId!= null)&&this.workspaceId.equals(rhs.workspaceId))));
    }

    public enum Domain {

        PLATFORM_AGENT("platform-agent"),
        PAGIX_PAGE("pagix-page"),
        CONTRACT_RUNTIME("contract-runtime");
        private final String value;
        private final static Map<String, AgentRunV1Contract.Domain> CONSTANTS = new HashMap<String, AgentRunV1Contract.Domain>();

        static {
            for (AgentRunV1Contract.Domain c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Domain(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentRunV1Contract.Domain fromValue(String value) {
            AgentRunV1Contract.Domain constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum Operation {

        PAGE_CHANGE("page-change"),
        ARTIFACT_VALIDATION("artifact-validation"),
        IMAGE_OPERATION("image-operation"),
        COMPONENT_PACKAGE("component-package");
        private final String value;
        private final static Map<String, AgentRunV1Contract.Operation> CONSTANTS = new HashMap<String, AgentRunV1Contract.Operation>();

        static {
            for (AgentRunV1Contract.Operation c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Operation(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentRunV1Contract.Operation fromValue(String value) {
            AgentRunV1Contract.Operation constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum Status {

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
        private final static Map<String, AgentRunV1Contract.Status> CONSTANTS = new HashMap<String, AgentRunV1Contract.Status>();

        static {
            for (AgentRunV1Contract.Status c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Status(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentRunV1Contract.Status fromValue(String value) {
            AgentRunV1Contract.Status constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
