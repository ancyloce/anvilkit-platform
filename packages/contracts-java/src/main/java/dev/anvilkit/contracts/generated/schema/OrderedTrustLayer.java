
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class OrderedTrustLayer {

    /**
     * 
     * (Required)
     * 
     */
    private OrderedTrustLayer.Classification classification;
    /**
     * 
     * (Required)
     * 
     */
    private String digest;
    /**
     * 
     * (Required)
     * 
     */
    private String layerId;
    /**
     * 
     * (Required)
     * 
     */
    private Integer position;
    /**
     * 
     * (Required)
     * 
     */
    private Boolean redacted;
    /**
     * 
     * (Required)
     * 
     */
    private Long tokenBudget;

    /**
     * 
     * (Required)
     * 
     */
    public OrderedTrustLayer.Classification getClassification() {
        return classification;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setClassification(OrderedTrustLayer.Classification classification) {
        this.classification = classification;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getDigest() {
        return digest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDigest(String digest) {
        this.digest = digest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getLayerId() {
        return layerId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLayerId(String layerId) {
        this.layerId = layerId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getPosition() {
        return position;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPosition(Integer position) {
        this.position = position;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Boolean getRedacted() {
        return redacted;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRedacted(Boolean redacted) {
        this.redacted = redacted;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getTokenBudget() {
        return tokenBudget;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTokenBudget(Long tokenBudget) {
        this.tokenBudget = tokenBudget;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(OrderedTrustLayer.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("classification");
        sb.append('=');
        sb.append(((this.classification == null)?"<null>":this.classification));
        sb.append(',');
        sb.append("digest");
        sb.append('=');
        sb.append(((this.digest == null)?"<null>":this.digest));
        sb.append(',');
        sb.append("layerId");
        sb.append('=');
        sb.append(((this.layerId == null)?"<null>":this.layerId));
        sb.append(',');
        sb.append("position");
        sb.append('=');
        sb.append(((this.position == null)?"<null>":this.position));
        sb.append(',');
        sb.append("redacted");
        sb.append('=');
        sb.append(((this.redacted == null)?"<null>":this.redacted));
        sb.append(',');
        sb.append("tokenBudget");
        sb.append('=');
        sb.append(((this.tokenBudget == null)?"<null>":this.tokenBudget));
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
        result = ((result* 31)+((this.layerId == null)? 0 :this.layerId.hashCode()));
        result = ((result* 31)+((this.redacted == null)? 0 :this.redacted.hashCode()));
        result = ((result* 31)+((this.digest == null)? 0 :this.digest.hashCode()));
        result = ((result* 31)+((this.tokenBudget == null)? 0 :this.tokenBudget.hashCode()));
        result = ((result* 31)+((this.position == null)? 0 :this.position.hashCode()));
        result = ((result* 31)+((this.classification == null)? 0 :this.classification.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof OrderedTrustLayer) == false) {
            return false;
        }
        OrderedTrustLayer rhs = ((OrderedTrustLayer) other);
        return (((((((this.layerId == rhs.layerId)||((this.layerId!= null)&&this.layerId.equals(rhs.layerId)))&&((this.redacted == rhs.redacted)||((this.redacted!= null)&&this.redacted.equals(rhs.redacted))))&&((this.digest == rhs.digest)||((this.digest!= null)&&this.digest.equals(rhs.digest))))&&((this.tokenBudget == rhs.tokenBudget)||((this.tokenBudget!= null)&&this.tokenBudget.equals(rhs.tokenBudget))))&&((this.position == rhs.position)||((this.position!= null)&&this.position.equals(rhs.position))))&&((this.classification == rhs.classification)||((this.classification!= null)&&this.classification.equals(rhs.classification))));
    }

    public enum Classification {

        PUBLIC("public"),
        INTERNAL("internal"),
        CONFIDENTIAL("confidential"),
        RESTRICTED("restricted");
        private final String value;
        private final static Map<String, OrderedTrustLayer.Classification> CONSTANTS = new HashMap<String, OrderedTrustLayer.Classification>();

        static {
            for (OrderedTrustLayer.Classification c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Classification(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static OrderedTrustLayer.Classification fromValue(String value) {
            OrderedTrustLayer.Classification constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
