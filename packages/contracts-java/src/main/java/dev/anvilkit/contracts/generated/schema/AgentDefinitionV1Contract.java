
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * AgentDefinitionV1 contract
 * <p>
 * Bounded AgentDefinitionV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentDefinitionV1Contract {

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
    private String definitionId;
    /**
     * 
     * (Required)
     * 
     */
    private AgentDefinitionV1Contract.Domain domain;
    /**
     * 
     * (Required)
     * 
     */
    private List<SharedPrimitivesV1SchemaReference> evaluators = new ArrayList<SharedPrimitivesV1SchemaReference>();
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference guardrailPolicy;
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
    private SharedPrimitivesV1PolicyReference memoryPolicy;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference modelPolicy;
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
    private String promptDigest;
    /**
     * 
     * (Required)
     * 
     */
    private Set<StopCondition> stopConditions = new LinkedHashSet<StopCondition>();
    /**
     * 
     * (Required)
     * 
     */
    private ToolProfile toolProfile;
    /**
     * 
     * (Required)
     * 
     */
    private Integer turnLimit;
    /**
     * 
     * (Required)
     * 
     */
    private String version;

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
    public String getDefinitionId() {
        return definitionId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDefinitionId(String definitionId) {
        this.definitionId = definitionId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentDefinitionV1Contract.Domain getDomain() {
        return domain;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDomain(AgentDefinitionV1Contract.Domain domain) {
        this.domain = domain;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1SchemaReference> getEvaluators() {
        return evaluators;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEvaluators(List<SharedPrimitivesV1SchemaReference> evaluators) {
        this.evaluators = evaluators;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getGuardrailPolicy() {
        return guardrailPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setGuardrailPolicy(SharedPrimitivesV1PolicyReference guardrailPolicy) {
        this.guardrailPolicy = guardrailPolicy;
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
    public SharedPrimitivesV1PolicyReference getMemoryPolicy() {
        return memoryPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMemoryPolicy(SharedPrimitivesV1PolicyReference memoryPolicy) {
        this.memoryPolicy = memoryPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getModelPolicy() {
        return modelPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setModelPolicy(SharedPrimitivesV1PolicyReference modelPolicy) {
        this.modelPolicy = modelPolicy;
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
    public String getPromptDigest() {
        return promptDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPromptDigest(String promptDigest) {
        this.promptDigest = promptDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Set<StopCondition> getStopConditions() {
        return stopConditions;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setStopConditions(Set<StopCondition> stopConditions) {
        this.stopConditions = stopConditions;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ToolProfile getToolProfile() {
        return toolProfile;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setToolProfile(ToolProfile toolProfile) {
        this.toolProfile = toolProfile;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getTurnLimit() {
        return turnLimit;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTurnLimit(Integer turnLimit) {
        this.turnLimit = turnLimit;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getVersion() {
        return version;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setVersion(String version) {
        this.version = version;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AgentDefinitionV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("definitionId");
        sb.append('=');
        sb.append(((this.definitionId == null)?"<null>":this.definitionId));
        sb.append(',');
        sb.append("domain");
        sb.append('=');
        sb.append(((this.domain == null)?"<null>":this.domain));
        sb.append(',');
        sb.append("evaluators");
        sb.append('=');
        sb.append(((this.evaluators == null)?"<null>":this.evaluators));
        sb.append(',');
        sb.append("guardrailPolicy");
        sb.append('=');
        sb.append(((this.guardrailPolicy == null)?"<null>":this.guardrailPolicy));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("memoryPolicy");
        sb.append('=');
        sb.append(((this.memoryPolicy == null)?"<null>":this.memoryPolicy));
        sb.append(',');
        sb.append("modelPolicy");
        sb.append('=');
        sb.append(((this.modelPolicy == null)?"<null>":this.modelPolicy));
        sb.append(',');
        sb.append("outputSchema");
        sb.append('=');
        sb.append(((this.outputSchema == null)?"<null>":this.outputSchema));
        sb.append(',');
        sb.append("promptDigest");
        sb.append('=');
        sb.append(((this.promptDigest == null)?"<null>":this.promptDigest));
        sb.append(',');
        sb.append("stopConditions");
        sb.append('=');
        sb.append(((this.stopConditions == null)?"<null>":this.stopConditions));
        sb.append(',');
        sb.append("toolProfile");
        sb.append('=');
        sb.append(((this.toolProfile == null)?"<null>":this.toolProfile));
        sb.append(',');
        sb.append("turnLimit");
        sb.append('=');
        sb.append(((this.turnLimit == null)?"<null>":this.turnLimit));
        sb.append(',');
        sb.append("version");
        sb.append('=');
        sb.append(((this.version == null)?"<null>":this.version));
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
        result = ((result* 31)+((this.guardrailPolicy == null)? 0 :this.guardrailPolicy.hashCode()));
        result = ((result* 31)+((this.outputSchema == null)? 0 :this.outputSchema.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.modelPolicy == null)? 0 :this.modelPolicy.hashCode()));
        result = ((result* 31)+((this.evaluators == null)? 0 :this.evaluators.hashCode()));
        result = ((result* 31)+((this.memoryPolicy == null)? 0 :this.memoryPolicy.hashCode()));
        result = ((result* 31)+((this.promptDigest == null)? 0 :this.promptDigest.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        result = ((result* 31)+((this.stopConditions == null)? 0 :this.stopConditions.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.domain == null)? 0 :this.domain.hashCode()));
        result = ((result* 31)+((this.turnLimit == null)? 0 :this.turnLimit.hashCode()));
        result = ((result* 31)+((this.toolProfile == null)? 0 :this.toolProfile.hashCode()));
        result = ((result* 31)+((this.definitionId == null)? 0 :this.definitionId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentDefinitionV1Contract) == false) {
            return false;
        }
        AgentDefinitionV1Contract rhs = ((AgentDefinitionV1Contract) other);
        return (((((((((((((((this.guardrailPolicy == rhs.guardrailPolicy)||((this.guardrailPolicy!= null)&&this.guardrailPolicy.equals(rhs.guardrailPolicy)))&&((this.outputSchema == rhs.outputSchema)||((this.outputSchema!= null)&&this.outputSchema.equals(rhs.outputSchema))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.modelPolicy == rhs.modelPolicy)||((this.modelPolicy!= null)&&this.modelPolicy.equals(rhs.modelPolicy))))&&((this.evaluators == rhs.evaluators)||((this.evaluators!= null)&&this.evaluators.equals(rhs.evaluators))))&&((this.memoryPolicy == rhs.memoryPolicy)||((this.memoryPolicy!= null)&&this.memoryPolicy.equals(rhs.memoryPolicy))))&&((this.promptDigest == rhs.promptDigest)||((this.promptDigest!= null)&&this.promptDigest.equals(rhs.promptDigest))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))))&&((this.stopConditions == rhs.stopConditions)||((this.stopConditions!= null)&&this.stopConditions.equals(rhs.stopConditions))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.domain == rhs.domain)||((this.domain!= null)&&this.domain.equals(rhs.domain))))&&((this.turnLimit == rhs.turnLimit)||((this.turnLimit!= null)&&this.turnLimit.equals(rhs.turnLimit))))&&((this.toolProfile == rhs.toolProfile)||((this.toolProfile!= null)&&this.toolProfile.equals(rhs.toolProfile))))&&((this.definitionId == rhs.definitionId)||((this.definitionId!= null)&&this.definitionId.equals(rhs.definitionId))));
    }

    public enum Domain {

        PLATFORM_AGENT("platform-agent"),
        PAGIX_PAGE("pagix-page"),
        CONTRACT_RUNTIME("contract-runtime");
        private final String value;
        private final static Map<String, AgentDefinitionV1Contract.Domain> CONSTANTS = new HashMap<String, AgentDefinitionV1Contract.Domain>();

        static {
            for (AgentDefinitionV1Contract.Domain c: values()) {
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

        public static AgentDefinitionV1Contract.Domain fromValue(String value) {
            AgentDefinitionV1Contract.Domain constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
