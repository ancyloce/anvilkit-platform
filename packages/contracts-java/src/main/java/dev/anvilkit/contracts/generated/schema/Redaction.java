
package dev.anvilkit.contracts.generated.schema;


public class Redaction {

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
    private Integer removedFieldCount;
    /**
     * 
     * (Required)
     * 
     */
    private String replacementMarker;

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
    public Integer getRemovedFieldCount() {
        return removedFieldCount;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRemovedFieldCount(Integer removedFieldCount) {
        this.removedFieldCount = removedFieldCount;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getReplacementMarker() {
        return replacementMarker;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReplacementMarker(String replacementMarker) {
        this.replacementMarker = replacementMarker;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Redaction.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("policy");
        sb.append('=');
        sb.append(((this.policy == null)?"<null>":this.policy));
        sb.append(',');
        sb.append("removedFieldCount");
        sb.append('=');
        sb.append(((this.removedFieldCount == null)?"<null>":this.removedFieldCount));
        sb.append(',');
        sb.append("replacementMarker");
        sb.append('=');
        sb.append(((this.replacementMarker == null)?"<null>":this.replacementMarker));
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
        result = ((result* 31)+((this.replacementMarker == null)? 0 :this.replacementMarker.hashCode()));
        result = ((result* 31)+((this.removedFieldCount == null)? 0 :this.removedFieldCount.hashCode()));
        result = ((result* 31)+((this.policy == null)? 0 :this.policy.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Redaction) == false) {
            return false;
        }
        Redaction rhs = ((Redaction) other);
        return ((((this.replacementMarker == rhs.replacementMarker)||((this.replacementMarker!= null)&&this.replacementMarker.equals(rhs.replacementMarker)))&&((this.removedFieldCount == rhs.removedFieldCount)||((this.removedFieldCount!= null)&&this.removedFieldCount.equals(rhs.removedFieldCount))))&&((this.policy == rhs.policy)||((this.policy!= null)&&this.policy.equals(rhs.policy))));
    }

}
