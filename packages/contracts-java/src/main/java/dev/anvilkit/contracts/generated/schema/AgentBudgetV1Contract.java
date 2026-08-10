
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;


/**
 * AgentBudgetV1 contract
 * <p>
 * Bounded AgentBudgetV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentBudgetV1Contract {

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
    private CurrencyLimits currencyLimits;
    /**
     * 
     * (Required)
     * 
     */
    private AgentBudgetV1Contract.ExceedBehavior exceedBehavior;
    /**
     * 
     * (Required)
     * 
     */
    private GpuLimits gpuLimits;
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
    private ModelLimits modelLimits;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference policy;
    /**
     * 
     * (Required)
     * 
     */
    private String reservationId;
    /**
     * 
     * (Required)
     * 
     */
    private TokenLimits tokenLimits;
    /**
     * 
     * (Required)
     * 
     */
    private WorkerLimits workerLimits;

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
    public CurrencyLimits getCurrencyLimits() {
        return currencyLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCurrencyLimits(CurrencyLimits currencyLimits) {
        this.currencyLimits = currencyLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentBudgetV1Contract.ExceedBehavior getExceedBehavior() {
        return exceedBehavior;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setExceedBehavior(AgentBudgetV1Contract.ExceedBehavior exceedBehavior) {
        this.exceedBehavior = exceedBehavior;
    }

    /**
     * 
     * (Required)
     * 
     */
    public GpuLimits getGpuLimits() {
        return gpuLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setGpuLimits(GpuLimits gpuLimits) {
        this.gpuLimits = gpuLimits;
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
    public ModelLimits getModelLimits() {
        return modelLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setModelLimits(ModelLimits modelLimits) {
        this.modelLimits = modelLimits;
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
     * 
     * (Required)
     * 
     */
    public String getReservationId() {
        return reservationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public TokenLimits getTokenLimits() {
        return tokenLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTokenLimits(TokenLimits tokenLimits) {
        this.tokenLimits = tokenLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public WorkerLimits getWorkerLimits() {
        return workerLimits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setWorkerLimits(WorkerLimits workerLimits) {
        this.workerLimits = workerLimits;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AgentBudgetV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("currencyLimits");
        sb.append('=');
        sb.append(((this.currencyLimits == null)?"<null>":this.currencyLimits));
        sb.append(',');
        sb.append("exceedBehavior");
        sb.append('=');
        sb.append(((this.exceedBehavior == null)?"<null>":this.exceedBehavior));
        sb.append(',');
        sb.append("gpuLimits");
        sb.append('=');
        sb.append(((this.gpuLimits == null)?"<null>":this.gpuLimits));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("modelLimits");
        sb.append('=');
        sb.append(((this.modelLimits == null)?"<null>":this.modelLimits));
        sb.append(',');
        sb.append("policy");
        sb.append('=');
        sb.append(((this.policy == null)?"<null>":this.policy));
        sb.append(',');
        sb.append("reservationId");
        sb.append('=');
        sb.append(((this.reservationId == null)?"<null>":this.reservationId));
        sb.append(',');
        sb.append("tokenLimits");
        sb.append('=');
        sb.append(((this.tokenLimits == null)?"<null>":this.tokenLimits));
        sb.append(',');
        sb.append("workerLimits");
        sb.append('=');
        sb.append(((this.workerLimits == null)?"<null>":this.workerLimits));
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
        result = ((result* 31)+((this.exceedBehavior == null)? 0 :this.exceedBehavior.hashCode()));
        result = ((result* 31)+((this.workerLimits == null)? 0 :this.workerLimits.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.tokenLimits == null)? 0 :this.tokenLimits.hashCode()));
        result = ((result* 31)+((this.gpuLimits == null)? 0 :this.gpuLimits.hashCode()));
        result = ((result* 31)+((this.reservationId == null)? 0 :this.reservationId.hashCode()));
        result = ((result* 31)+((this.currencyLimits == null)? 0 :this.currencyLimits.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.modelLimits == null)? 0 :this.modelLimits.hashCode()));
        result = ((result* 31)+((this.policy == null)? 0 :this.policy.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentBudgetV1Contract) == false) {
            return false;
        }
        AgentBudgetV1Contract rhs = ((AgentBudgetV1Contract) other);
        return (((((((((((this.exceedBehavior == rhs.exceedBehavior)||((this.exceedBehavior!= null)&&this.exceedBehavior.equals(rhs.exceedBehavior)))&&((this.workerLimits == rhs.workerLimits)||((this.workerLimits!= null)&&this.workerLimits.equals(rhs.workerLimits))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.tokenLimits == rhs.tokenLimits)||((this.tokenLimits!= null)&&this.tokenLimits.equals(rhs.tokenLimits))))&&((this.gpuLimits == rhs.gpuLimits)||((this.gpuLimits!= null)&&this.gpuLimits.equals(rhs.gpuLimits))))&&((this.reservationId == rhs.reservationId)||((this.reservationId!= null)&&this.reservationId.equals(rhs.reservationId))))&&((this.currencyLimits == rhs.currencyLimits)||((this.currencyLimits!= null)&&this.currencyLimits.equals(rhs.currencyLimits))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.modelLimits == rhs.modelLimits)||((this.modelLimits!= null)&&this.modelLimits.equals(rhs.modelLimits))))&&((this.policy == rhs.policy)||((this.policy!= null)&&this.policy.equals(rhs.policy))));
    }

    public enum ExceedBehavior {

        REFUSE("refuse"),
        PAUSE_FOR_APPROVAL("pause-for-approval"),
        CANCEL("cancel");
        private final String value;
        private final static Map<String, AgentBudgetV1Contract.ExceedBehavior> CONSTANTS = new HashMap<String, AgentBudgetV1Contract.ExceedBehavior>();

        static {
            for (AgentBudgetV1Contract.ExceedBehavior c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        ExceedBehavior(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentBudgetV1Contract.ExceedBehavior fromValue(String value) {
            AgentBudgetV1Contract.ExceedBehavior constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
