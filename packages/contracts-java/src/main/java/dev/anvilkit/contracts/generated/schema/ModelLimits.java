
package dev.anvilkit.contracts.generated.schema;


public class ModelLimits {

    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumCalls;
    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumConcurrentCalls;

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumCalls() {
        return maximumCalls;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumCalls(Integer maximumCalls) {
        this.maximumCalls = maximumCalls;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumConcurrentCalls() {
        return maximumConcurrentCalls;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumConcurrentCalls(Integer maximumConcurrentCalls) {
        this.maximumConcurrentCalls = maximumConcurrentCalls;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ModelLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumCalls");
        sb.append('=');
        sb.append(((this.maximumCalls == null)?"<null>":this.maximumCalls));
        sb.append(',');
        sb.append("maximumConcurrentCalls");
        sb.append('=');
        sb.append(((this.maximumConcurrentCalls == null)?"<null>":this.maximumConcurrentCalls));
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
        result = ((result* 31)+((this.maximumCalls == null)? 0 :this.maximumCalls.hashCode()));
        result = ((result* 31)+((this.maximumConcurrentCalls == null)? 0 :this.maximumConcurrentCalls.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ModelLimits) == false) {
            return false;
        }
        ModelLimits rhs = ((ModelLimits) other);
        return (((this.maximumCalls == rhs.maximumCalls)||((this.maximumCalls!= null)&&this.maximumCalls.equals(rhs.maximumCalls)))&&((this.maximumConcurrentCalls == rhs.maximumConcurrentCalls)||((this.maximumConcurrentCalls!= null)&&this.maximumConcurrentCalls.equals(rhs.maximumConcurrentCalls))));
    }

}
