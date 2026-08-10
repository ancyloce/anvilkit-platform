
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class Effect {

    /**
     * 
     * (Required)
     * 
     */
    private Effect.EffectType effectType;
    /**
     * 
     * (Required)
     * 
     */
    private String summary;
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
    public Effect.EffectType getEffectType() {
        return effectType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEffectType(Effect.EffectType effectType) {
        this.effectType = effectType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getSummary() {
        return summary;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSummary(String summary) {
        this.summary = summary;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Effect.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("effectType");
        sb.append('=');
        sb.append(((this.effectType == null)?"<null>":this.effectType));
        sb.append(',');
        sb.append("summary");
        sb.append('=');
        sb.append(((this.summary == null)?"<null>":this.summary));
        sb.append(',');
        sb.append("target");
        sb.append('=');
        sb.append(((this.target == null)?"<null>":this.target));
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
        result = ((result* 31)+((this.summary == null)? 0 :this.summary.hashCode()));
        result = ((result* 31)+((this.effectType == null)? 0 :this.effectType.hashCode()));
        result = ((result* 31)+((this.target == null)? 0 :this.target.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Effect) == false) {
            return false;
        }
        Effect rhs = ((Effect) other);
        return ((((this.summary == rhs.summary)||((this.summary!= null)&&this.summary.equals(rhs.summary)))&&((this.effectType == rhs.effectType)||((this.effectType!= null)&&this.effectType.equals(rhs.effectType))))&&((this.target == rhs.target)||((this.target!= null)&&this.target.equals(rhs.target))));
    }

    public enum EffectType {

        ARTIFACT_FINALIZE("artifact-finalize"),
        PAGE_PERSIST("page-persist"),
        ASSET_FINALIZE("asset-finalize"),
        COMPONENT_APPLY("component-apply"),
        PACKAGE_PUBLISH("package-publish");
        private final String value;
        private final static Map<String, Effect.EffectType> CONSTANTS = new HashMap<String, Effect.EffectType>();

        static {
            for (Effect.EffectType c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        EffectType(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static Effect.EffectType fromValue(String value) {
            Effect.EffectType constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
