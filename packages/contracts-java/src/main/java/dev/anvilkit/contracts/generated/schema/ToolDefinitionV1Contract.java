
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;


/**
 * ToolDefinitionV1 contract
 * <p>
 * Bounded ToolDefinitionV1 wire contract governed by PRD 0012.
 * 
 */
public class ToolDefinitionV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Set<AcceptedDataClass> acceptedDataClasses = new LinkedHashSet<AcceptedDataClass>();
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
    private SharedPrimitivesV1PolicyReference approvalPolicy;
    /**
     * 
     * (Required)
     * 
     */
    private ToolDefinitionV1Contract.Capability capability;
    /**
     * 
     * (Required)
     * 
     */
    private ToolDefinitionV1Contract.CapabilityVersion capabilityVersion;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1SchemaReference inputSchema;
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
    private SharedPrimitivesV1SchemaReference outputSchema;
    /**
     * 
     * (Required)
     * 
     */
    private RetryPolicy retryPolicy;
    /**
     * 
     * (Required)
     * 
     */
    private ToolDefinitionV1Contract.RiskClass riskClass;
    /**
     * 
     * (Required)
     * 
     */
    private ToolDefinitionV1Contract.SideEffectClass sideEffectClass;
    /**
     * 
     * (Required)
     * 
     */
    private TimeoutPolicy timeoutPolicy;
    /**
     * 
     * (Required)
     * 
     */
    private String toolId;

    /**
     * 
     * (Required)
     * 
     */
    public Set<AcceptedDataClass> getAcceptedDataClasses() {
        return acceptedDataClasses;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAcceptedDataClasses(Set<AcceptedDataClass> acceptedDataClasses) {
        this.acceptedDataClasses = acceptedDataClasses;
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
    public SharedPrimitivesV1PolicyReference getApprovalPolicy() {
        return approvalPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setApprovalPolicy(SharedPrimitivesV1PolicyReference approvalPolicy) {
        this.approvalPolicy = approvalPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ToolDefinitionV1Contract.Capability getCapability() {
        return capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapability(ToolDefinitionV1Contract.Capability capability) {
        this.capability = capability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ToolDefinitionV1Contract.CapabilityVersion getCapabilityVersion() {
        return capabilityVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapabilityVersion(ToolDefinitionV1Contract.CapabilityVersion capabilityVersion) {
        this.capabilityVersion = capabilityVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1SchemaReference getInputSchema() {
        return inputSchema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setInputSchema(SharedPrimitivesV1SchemaReference inputSchema) {
        this.inputSchema = inputSchema;
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
    public SharedPrimitivesV1SchemaReference getOutputSchema() {
        return outputSchema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOutputSchema(SharedPrimitivesV1SchemaReference outputSchema) {
        this.outputSchema = outputSchema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public RetryPolicy getRetryPolicy() {
        return retryPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRetryPolicy(RetryPolicy retryPolicy) {
        this.retryPolicy = retryPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ToolDefinitionV1Contract.RiskClass getRiskClass() {
        return riskClass;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRiskClass(ToolDefinitionV1Contract.RiskClass riskClass) {
        this.riskClass = riskClass;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ToolDefinitionV1Contract.SideEffectClass getSideEffectClass() {
        return sideEffectClass;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSideEffectClass(ToolDefinitionV1Contract.SideEffectClass sideEffectClass) {
        this.sideEffectClass = sideEffectClass;
    }

    /**
     * 
     * (Required)
     * 
     */
    public TimeoutPolicy getTimeoutPolicy() {
        return timeoutPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTimeoutPolicy(TimeoutPolicy timeoutPolicy) {
        this.timeoutPolicy = timeoutPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getToolId() {
        return toolId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setToolId(String toolId) {
        this.toolId = toolId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ToolDefinitionV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("acceptedDataClasses");
        sb.append('=');
        sb.append(((this.acceptedDataClasses == null)?"<null>":this.acceptedDataClasses));
        sb.append(',');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("approvalPolicy");
        sb.append('=');
        sb.append(((this.approvalPolicy == null)?"<null>":this.approvalPolicy));
        sb.append(',');
        sb.append("capability");
        sb.append('=');
        sb.append(((this.capability == null)?"<null>":this.capability));
        sb.append(',');
        sb.append("capabilityVersion");
        sb.append('=');
        sb.append(((this.capabilityVersion == null)?"<null>":this.capabilityVersion));
        sb.append(',');
        sb.append("inputSchema");
        sb.append('=');
        sb.append(((this.inputSchema == null)?"<null>":this.inputSchema));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("outputSchema");
        sb.append('=');
        sb.append(((this.outputSchema == null)?"<null>":this.outputSchema));
        sb.append(',');
        sb.append("retryPolicy");
        sb.append('=');
        sb.append(((this.retryPolicy == null)?"<null>":this.retryPolicy));
        sb.append(',');
        sb.append("riskClass");
        sb.append('=');
        sb.append(((this.riskClass == null)?"<null>":this.riskClass));
        sb.append(',');
        sb.append("sideEffectClass");
        sb.append('=');
        sb.append(((this.sideEffectClass == null)?"<null>":this.sideEffectClass));
        sb.append(',');
        sb.append("timeoutPolicy");
        sb.append('=');
        sb.append(((this.timeoutPolicy == null)?"<null>":this.timeoutPolicy));
        sb.append(',');
        sb.append("toolId");
        sb.append('=');
        sb.append(((this.toolId == null)?"<null>":this.toolId));
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
        result = ((result* 31)+((this.approvalPolicy == null)? 0 :this.approvalPolicy.hashCode()));
        result = ((result* 31)+((this.timeoutPolicy == null)? 0 :this.timeoutPolicy.hashCode()));
        result = ((result* 31)+((this.outputSchema == null)? 0 :this.outputSchema.hashCode()));
        result = ((result* 31)+((this.retryPolicy == null)? 0 :this.retryPolicy.hashCode()));
        result = ((result* 31)+((this.inputSchema == null)? 0 :this.inputSchema.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.toolId == null)? 0 :this.toolId.hashCode()));
        result = ((result* 31)+((this.capability == null)? 0 :this.capability.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.riskClass == null)? 0 :this.riskClass.hashCode()));
        result = ((result* 31)+((this.acceptedDataClasses == null)? 0 :this.acceptedDataClasses.hashCode()));
        result = ((result* 31)+((this.capabilityVersion == null)? 0 :this.capabilityVersion.hashCode()));
        result = ((result* 31)+((this.sideEffectClass == null)? 0 :this.sideEffectClass.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ToolDefinitionV1Contract) == false) {
            return false;
        }
        ToolDefinitionV1Contract rhs = ((ToolDefinitionV1Contract) other);
        return ((((((((((((((this.approvalPolicy == rhs.approvalPolicy)||((this.approvalPolicy!= null)&&this.approvalPolicy.equals(rhs.approvalPolicy)))&&((this.timeoutPolicy == rhs.timeoutPolicy)||((this.timeoutPolicy!= null)&&this.timeoutPolicy.equals(rhs.timeoutPolicy))))&&((this.outputSchema == rhs.outputSchema)||((this.outputSchema!= null)&&this.outputSchema.equals(rhs.outputSchema))))&&((this.retryPolicy == rhs.retryPolicy)||((this.retryPolicy!= null)&&this.retryPolicy.equals(rhs.retryPolicy))))&&((this.inputSchema == rhs.inputSchema)||((this.inputSchema!= null)&&this.inputSchema.equals(rhs.inputSchema))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.toolId == rhs.toolId)||((this.toolId!= null)&&this.toolId.equals(rhs.toolId))))&&((this.capability == rhs.capability)||((this.capability!= null)&&this.capability.equals(rhs.capability))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.riskClass == rhs.riskClass)||((this.riskClass!= null)&&this.riskClass.equals(rhs.riskClass))))&&((this.acceptedDataClasses == rhs.acceptedDataClasses)||((this.acceptedDataClasses!= null)&&this.acceptedDataClasses.equals(rhs.acceptedDataClasses))))&&((this.capabilityVersion == rhs.capabilityVersion)||((this.capabilityVersion!= null)&&this.capabilityVersion.equals(rhs.capabilityVersion))))&&((this.sideEffectClass == rhs.sideEffectClass)||((this.sideEffectClass!= null)&&this.sideEffectClass.equals(rhs.sideEffectClass))));
    }

    public enum Capability {

        PROVIDER_INVOKE("provider.invoke"),
        CONTRACT_VALIDATE("contract.validate"),
        ARTIFACT_SCAN("artifact.scan"),
        FAKE_EXECUTE("fake.execute");
        private final String value;
        private final static Map<String, ToolDefinitionV1Contract.Capability> CONSTANTS = new HashMap<String, ToolDefinitionV1Contract.Capability>();

        static {
            for (ToolDefinitionV1Contract.Capability c: values()) {
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

        public static ToolDefinitionV1Contract.Capability fromValue(String value) {
            ToolDefinitionV1Contract.Capability constant = CONSTANTS.get(value);
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
        private final static Map<String, ToolDefinitionV1Contract.CapabilityVersion> CONSTANTS = new HashMap<String, ToolDefinitionV1Contract.CapabilityVersion>();

        static {
            for (ToolDefinitionV1Contract.CapabilityVersion c: values()) {
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

        public static ToolDefinitionV1Contract.CapabilityVersion fromValue(String value) {
            ToolDefinitionV1Contract.CapabilityVersion constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum RiskClass {

        LOW("low"),
        MEDIUM("medium"),
        HIGH("high"),
        CRITICAL("critical");
        private final String value;
        private final static Map<String, ToolDefinitionV1Contract.RiskClass> CONSTANTS = new HashMap<String, ToolDefinitionV1Contract.RiskClass>();

        static {
            for (ToolDefinitionV1Contract.RiskClass c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        RiskClass(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static ToolDefinitionV1Contract.RiskClass fromValue(String value) {
            ToolDefinitionV1Contract.RiskClass constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum SideEffectClass {

        NONE("none"),
        READ("read"),
        ARTIFACT_WRITE("artifact-write"),
        DOMAIN_EFFECT("domain-effect");
        private final String value;
        private final static Map<String, ToolDefinitionV1Contract.SideEffectClass> CONSTANTS = new HashMap<String, ToolDefinitionV1Contract.SideEffectClass>();

        static {
            for (ToolDefinitionV1Contract.SideEffectClass c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        SideEffectClass(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static ToolDefinitionV1Contract.SideEffectClass fromValue(String value) {
            ToolDefinitionV1Contract.SideEffectClass constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
