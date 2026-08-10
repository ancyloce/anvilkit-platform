
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * ApprovalRequestV1 contract
 * <p>
 * Bounded ApprovalRequestV1 wire contract governed by PRD 0012.
 * 
 */
public class ApprovalRequestV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private String actionDigest;
    /**
     * 
     * (Required)
     * 
     */
    private Set<AllowedDecision> allowedDecisions = new LinkedHashSet<AllowedDecision>();
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
    private SharedPrimitivesV1Cost cost;
    /**
     * 
     * (Required)
     * 
     */
    private Long decisionVersion;
    /**
     * 
     * (Required)
     * 
     */
    private List<Effect> effects = new ArrayList<Effect>();
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
    private String requestId;
    /**
     * 
     * (Required)
     * 
     */
    private ApprovalRequestV1Contract.ResumeState resumeState;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference reviewerPolicy;
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
    public String getActionDigest() {
        return actionDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setActionDigest(String actionDigest) {
        this.actionDigest = actionDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Set<AllowedDecision> getAllowedDecisions() {
        return allowedDecisions;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAllowedDecisions(Set<AllowedDecision> allowedDecisions) {
        this.allowedDecisions = allowedDecisions;
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
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1Cost getCost() {
        return cost;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCost(SharedPrimitivesV1Cost cost) {
        this.cost = cost;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getDecisionVersion() {
        return decisionVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDecisionVersion(Long decisionVersion) {
        this.decisionVersion = decisionVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<Effect> getEffects() {
        return effects;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEffects(List<Effect> effects) {
        this.effects = effects;
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
    public ApprovalRequestV1Contract.ResumeState getResumeState() {
        return resumeState;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResumeState(ApprovalRequestV1Contract.ResumeState resumeState) {
        this.resumeState = resumeState;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getReviewerPolicy() {
        return reviewerPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReviewerPolicy(SharedPrimitivesV1PolicyReference reviewerPolicy) {
        this.reviewerPolicy = reviewerPolicy;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ApprovalRequestV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("actionDigest");
        sb.append('=');
        sb.append(((this.actionDigest == null)?"<null>":this.actionDigest));
        sb.append(',');
        sb.append("allowedDecisions");
        sb.append('=');
        sb.append(((this.allowedDecisions == null)?"<null>":this.allowedDecisions));
        sb.append(',');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("cost");
        sb.append('=');
        sb.append(((this.cost == null)?"<null>":this.cost));
        sb.append(',');
        sb.append("decisionVersion");
        sb.append('=');
        sb.append(((this.decisionVersion == null)?"<null>":this.decisionVersion));
        sb.append(',');
        sb.append("effects");
        sb.append('=');
        sb.append(((this.effects == null)?"<null>":this.effects));
        sb.append(',');
        sb.append("expiresAt");
        sb.append('=');
        sb.append(((this.expiresAt == null)?"<null>":this.expiresAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("requestId");
        sb.append('=');
        sb.append(((this.requestId == null)?"<null>":this.requestId));
        sb.append(',');
        sb.append("resumeState");
        sb.append('=');
        sb.append(((this.resumeState == null)?"<null>":this.resumeState));
        sb.append(',');
        sb.append("reviewerPolicy");
        sb.append('=');
        sb.append(((this.reviewerPolicy == null)?"<null>":this.reviewerPolicy));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
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
        result = ((result* 31)+((this.cost == null)? 0 :this.cost.hashCode()));
        result = ((result* 31)+((this.resumeState == null)? 0 :this.resumeState.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.decisionVersion == null)? 0 :this.decisionVersion.hashCode()));
        result = ((result* 31)+((this.reviewerPolicy == null)? 0 :this.reviewerPolicy.hashCode()));
        result = ((result* 31)+((this.expiresAt == null)? 0 :this.expiresAt.hashCode()));
        result = ((result* 31)+((this.actionDigest == null)? 0 :this.actionDigest.hashCode()));
        result = ((result* 31)+((this.effects == null)? 0 :this.effects.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.requestId == null)? 0 :this.requestId.hashCode()));
        result = ((result* 31)+((this.allowedDecisions == null)? 0 :this.allowedDecisions.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ApprovalRequestV1Contract) == false) {
            return false;
        }
        ApprovalRequestV1Contract rhs = ((ApprovalRequestV1Contract) other);
        return (((((((((((((this.cost == rhs.cost)||((this.cost!= null)&&this.cost.equals(rhs.cost)))&&((this.resumeState == rhs.resumeState)||((this.resumeState!= null)&&this.resumeState.equals(rhs.resumeState))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.decisionVersion == rhs.decisionVersion)||((this.decisionVersion!= null)&&this.decisionVersion.equals(rhs.decisionVersion))))&&((this.reviewerPolicy == rhs.reviewerPolicy)||((this.reviewerPolicy!= null)&&this.reviewerPolicy.equals(rhs.reviewerPolicy))))&&((this.expiresAt == rhs.expiresAt)||((this.expiresAt!= null)&&this.expiresAt.equals(rhs.expiresAt))))&&((this.actionDigest == rhs.actionDigest)||((this.actionDigest!= null)&&this.actionDigest.equals(rhs.actionDigest))))&&((this.effects == rhs.effects)||((this.effects!= null)&&this.effects.equals(rhs.effects))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.requestId == rhs.requestId)||((this.requestId!= null)&&this.requestId.equals(rhs.requestId))))&&((this.allowedDecisions == rhs.allowedDecisions)||((this.allowedDecisions!= null)&&this.allowedDecisions.equals(rhs.allowedDecisions))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))));
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
        private final static Map<String, ApprovalRequestV1Contract.ResumeState> CONSTANTS = new HashMap<String, ApprovalRequestV1Contract.ResumeState>();

        static {
            for (ApprovalRequestV1Contract.ResumeState c: values()) {
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

        public static ApprovalRequestV1Contract.ResumeState fromValue(String value) {
            ApprovalRequestV1Contract.ResumeState constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
