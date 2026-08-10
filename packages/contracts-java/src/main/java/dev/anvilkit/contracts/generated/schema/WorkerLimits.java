
package dev.anvilkit.contracts.generated.schema;


public class WorkerLimits {

    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumAttempts;
    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumDurationMilliseconds;

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumAttempts() {
        return maximumAttempts;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumAttempts(Integer maximumAttempts) {
        this.maximumAttempts = maximumAttempts;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumDurationMilliseconds() {
        return maximumDurationMilliseconds;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumDurationMilliseconds(Integer maximumDurationMilliseconds) {
        this.maximumDurationMilliseconds = maximumDurationMilliseconds;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(WorkerLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumAttempts");
        sb.append('=');
        sb.append(((this.maximumAttempts == null)?"<null>":this.maximumAttempts));
        sb.append(',');
        sb.append("maximumDurationMilliseconds");
        sb.append('=');
        sb.append(((this.maximumDurationMilliseconds == null)?"<null>":this.maximumDurationMilliseconds));
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
        result = ((result* 31)+((this.maximumDurationMilliseconds == null)? 0 :this.maximumDurationMilliseconds.hashCode()));
        result = ((result* 31)+((this.maximumAttempts == null)? 0 :this.maximumAttempts.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof WorkerLimits) == false) {
            return false;
        }
        WorkerLimits rhs = ((WorkerLimits) other);
        return (((this.maximumDurationMilliseconds == rhs.maximumDurationMilliseconds)||((this.maximumDurationMilliseconds!= null)&&this.maximumDurationMilliseconds.equals(rhs.maximumDurationMilliseconds)))&&((this.maximumAttempts == rhs.maximumAttempts)||((this.maximumAttempts!= null)&&this.maximumAttempts.equals(rhs.maximumAttempts))));
    }

}
