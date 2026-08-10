
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * UsageObservationV1 contract
 * <p>
 * Bounded UsageObservationV1 wire contract governed by PRD 0012.
 * 
 */
public class UsageObservationV1Contract {

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
    private Long executionGeneration;
    /**
     * 
     * (Required)
     * 
     */
    private Boolean _final;
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
    private UsageObservationV1Contract.Meter meter;
    /**
     * 
     * (Required)
     * 
     */
    private Long meterSequence;
    /**
     * 
     * (Required)
     * 
     */
    private String observationId;
    /**
     * 
     * (Required)
     * 
     */
    private Date observedAt;
    /**
     * 
     * (Required)
     * 
     */
    private String physicalAttemptId;
    private String providerEventId;
    /**
     * 
     * (Required)
     * 
     */
    private String quantity;
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
    private String reservationId;
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
    private Source source;
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
    private UsageObservationV1Contract.Unit unit;

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
    public Boolean getFinal() {
        return _final;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setFinal(Boolean _final) {
        this._final = _final;
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
    public UsageObservationV1Contract.Meter getMeter() {
        return meter;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMeter(UsageObservationV1Contract.Meter meter) {
        this.meter = meter;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getMeterSequence() {
        return meterSequence;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMeterSequence(Long meterSequence) {
        this.meterSequence = meterSequence;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getObservationId() {
        return observationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setObservationId(String observationId) {
        this.observationId = observationId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getObservedAt() {
        return observedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setObservedAt(Date observedAt) {
        this.observedAt = observedAt;
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

    public String getProviderEventId() {
        return providerEventId;
    }

    public void setProviderEventId(String providerEventId) {
        this.providerEventId = providerEventId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getQuantity() {
        return quantity;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setQuantity(String quantity) {
        this.quantity = quantity;
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
    public Source getSource() {
        return source;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSource(Source source) {
        this.source = source;
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

    /**
     * 
     * (Required)
     * 
     */
    public UsageObservationV1Contract.Unit getUnit() {
        return unit;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setUnit(UsageObservationV1Contract.Unit unit) {
        this.unit = unit;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(UsageObservationV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("cost");
        sb.append('=');
        sb.append(((this.cost == null)?"<null>":this.cost));
        sb.append(',');
        sb.append("executionGeneration");
        sb.append('=');
        sb.append(((this.executionGeneration == null)?"<null>":this.executionGeneration));
        sb.append(',');
        sb.append("_final");
        sb.append('=');
        sb.append(((this._final == null)?"<null>":this._final));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("meter");
        sb.append('=');
        sb.append(((this.meter == null)?"<null>":this.meter));
        sb.append(',');
        sb.append("meterSequence");
        sb.append('=');
        sb.append(((this.meterSequence == null)?"<null>":this.meterSequence));
        sb.append(',');
        sb.append("observationId");
        sb.append('=');
        sb.append(((this.observationId == null)?"<null>":this.observationId));
        sb.append(',');
        sb.append("observedAt");
        sb.append('=');
        sb.append(((this.observedAt == null)?"<null>":this.observedAt));
        sb.append(',');
        sb.append("physicalAttemptId");
        sb.append('=');
        sb.append(((this.physicalAttemptId == null)?"<null>":this.physicalAttemptId));
        sb.append(',');
        sb.append("providerEventId");
        sb.append('=');
        sb.append(((this.providerEventId == null)?"<null>":this.providerEventId));
        sb.append(',');
        sb.append("quantity");
        sb.append('=');
        sb.append(((this.quantity == null)?"<null>":this.quantity));
        sb.append(',');
        sb.append("recoveryEpoch");
        sb.append('=');
        sb.append(((this.recoveryEpoch == null)?"<null>":this.recoveryEpoch));
        sb.append(',');
        sb.append("reservationId");
        sb.append('=');
        sb.append(((this.reservationId == null)?"<null>":this.reservationId));
        sb.append(',');
        sb.append("rootRunId");
        sb.append('=');
        sb.append(((this.rootRunId == null)?"<null>":this.rootRunId));
        sb.append(',');
        sb.append("runId");
        sb.append('=');
        sb.append(((this.runId == null)?"<null>":this.runId));
        sb.append(',');
        sb.append("source");
        sb.append('=');
        sb.append(((this.source == null)?"<null>":this.source));
        sb.append(',');
        sb.append("taskId");
        sb.append('=');
        sb.append(((this.taskId == null)?"<null>":this.taskId));
        sb.append(',');
        sb.append("traceContext");
        sb.append('=');
        sb.append(((this.traceContext == null)?"<null>":this.traceContext));
        sb.append(',');
        sb.append("unit");
        sb.append('=');
        sb.append(((this.unit == null)?"<null>":this.unit));
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
        result = ((result* 31)+((this.providerEventId == null)? 0 :this.providerEventId.hashCode()));
        result = ((result* 31)+((this.cost == null)? 0 :this.cost.hashCode()));
        result = ((result* 31)+((this.quantity == null)? 0 :this.quantity.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.meter == null)? 0 :this.meter.hashCode()));
        result = ((result* 31)+((this.observedAt == null)? 0 :this.observedAt.hashCode()));
        result = ((result* 31)+((this.source == null)? 0 :this.source.hashCode()));
        result = ((result* 31)+((this.traceContext == null)? 0 :this.traceContext.hashCode()));
        result = ((result* 31)+((this.recoveryEpoch == null)? 0 :this.recoveryEpoch.hashCode()));
        result = ((result* 31)+((this.executionGeneration == null)? 0 :this.executionGeneration.hashCode()));
        result = ((result* 31)+((this.observationId == null)? 0 :this.observationId.hashCode()));
        result = ((result* 31)+((this.unit == null)? 0 :this.unit.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.meterSequence == null)? 0 :this.meterSequence.hashCode()));
        result = ((result* 31)+((this.reservationId == null)? 0 :this.reservationId.hashCode()));
        result = ((result* 31)+((this.physicalAttemptId == null)? 0 :this.physicalAttemptId.hashCode()));
        result = ((result* 31)+((this.rootRunId == null)? 0 :this.rootRunId.hashCode()));
        result = ((result* 31)+((this.runId == null)? 0 :this.runId.hashCode()));
        result = ((result* 31)+((this._final == null)? 0 :this._final.hashCode()));
        result = ((result* 31)+((this.taskId == null)? 0 :this.taskId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof UsageObservationV1Contract) == false) {
            return false;
        }
        UsageObservationV1Contract rhs = ((UsageObservationV1Contract) other);
        return (((((((((((((((((((((this.providerEventId == rhs.providerEventId)||((this.providerEventId!= null)&&this.providerEventId.equals(rhs.providerEventId)))&&((this.cost == rhs.cost)||((this.cost!= null)&&this.cost.equals(rhs.cost))))&&((this.quantity == rhs.quantity)||((this.quantity!= null)&&this.quantity.equals(rhs.quantity))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.meter == rhs.meter)||((this.meter!= null)&&this.meter.equals(rhs.meter))))&&((this.observedAt == rhs.observedAt)||((this.observedAt!= null)&&this.observedAt.equals(rhs.observedAt))))&&((this.source == rhs.source)||((this.source!= null)&&this.source.equals(rhs.source))))&&((this.traceContext == rhs.traceContext)||((this.traceContext!= null)&&this.traceContext.equals(rhs.traceContext))))&&((this.recoveryEpoch == rhs.recoveryEpoch)||((this.recoveryEpoch!= null)&&this.recoveryEpoch.equals(rhs.recoveryEpoch))))&&((this.executionGeneration == rhs.executionGeneration)||((this.executionGeneration!= null)&&this.executionGeneration.equals(rhs.executionGeneration))))&&((this.observationId == rhs.observationId)||((this.observationId!= null)&&this.observationId.equals(rhs.observationId))))&&((this.unit == rhs.unit)||((this.unit!= null)&&this.unit.equals(rhs.unit))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.meterSequence == rhs.meterSequence)||((this.meterSequence!= null)&&this.meterSequence.equals(rhs.meterSequence))))&&((this.reservationId == rhs.reservationId)||((this.reservationId!= null)&&this.reservationId.equals(rhs.reservationId))))&&((this.physicalAttemptId == rhs.physicalAttemptId)||((this.physicalAttemptId!= null)&&this.physicalAttemptId.equals(rhs.physicalAttemptId))))&&((this.rootRunId == rhs.rootRunId)||((this.rootRunId!= null)&&this.rootRunId.equals(rhs.rootRunId))))&&((this.runId == rhs.runId)||((this.runId!= null)&&this.runId.equals(rhs.runId))))&&((this._final == rhs._final)||((this._final!= null)&&this._final.equals(rhs._final))))&&((this.taskId == rhs.taskId)||((this.taskId!= null)&&this.taskId.equals(rhs.taskId))));
    }

    public enum Meter {

        INPUT_TOKENS("input-tokens"),
        OUTPUT_TOKENS("output-tokens"),
        WORKER_DURATION("worker-duration"),
        GPU_DURATION("gpu-duration"),
        PROVIDER_COST("provider-cost");
        private final String value;
        private final static Map<String, UsageObservationV1Contract.Meter> CONSTANTS = new HashMap<String, UsageObservationV1Contract.Meter>();

        static {
            for (UsageObservationV1Contract.Meter c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Meter(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static UsageObservationV1Contract.Meter fromValue(String value) {
            UsageObservationV1Contract.Meter constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum Unit {

        TOKEN("token"),
        MILLISECOND("millisecond"),
        BYTE("byte"),
        COUNT("count"),
        USD_MICRO("usd-micro");
        private final String value;
        private final static Map<String, UsageObservationV1Contract.Unit> CONSTANTS = new HashMap<String, UsageObservationV1Contract.Unit>();

        static {
            for (UsageObservationV1Contract.Unit c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Unit(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static UsageObservationV1Contract.Unit fromValue(String value) {
            UsageObservationV1Contract.Unit constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
