
package dev.anvilkit.contracts.generated.schema;

import java.util.LinkedHashSet;
import java.util.Set;

public class RetryPolicy {

    /**
     * 
     * (Required)
     * 
     */
    private Integer backoffMilliseconds;
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
    private Set<Retryability> retryability = new LinkedHashSet<Retryability>();

    /**
     * 
     * (Required)
     * 
     */
    public Integer getBackoffMilliseconds() {
        return backoffMilliseconds;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBackoffMilliseconds(Integer backoffMilliseconds) {
        this.backoffMilliseconds = backoffMilliseconds;
    }

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
    public Set<Retryability> getRetryability() {
        return retryability;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRetryability(Set<Retryability> retryability) {
        this.retryability = retryability;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(RetryPolicy.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("backoffMilliseconds");
        sb.append('=');
        sb.append(((this.backoffMilliseconds == null)?"<null>":this.backoffMilliseconds));
        sb.append(',');
        sb.append("maximumAttempts");
        sb.append('=');
        sb.append(((this.maximumAttempts == null)?"<null>":this.maximumAttempts));
        sb.append(',');
        sb.append("retryability");
        sb.append('=');
        sb.append(((this.retryability == null)?"<null>":this.retryability));
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
        result = ((result* 31)+((this.maximumAttempts == null)? 0 :this.maximumAttempts.hashCode()));
        result = ((result* 31)+((this.retryability == null)? 0 :this.retryability.hashCode()));
        result = ((result* 31)+((this.backoffMilliseconds == null)? 0 :this.backoffMilliseconds.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof RetryPolicy) == false) {
            return false;
        }
        RetryPolicy rhs = ((RetryPolicy) other);
        return ((((this.maximumAttempts == rhs.maximumAttempts)||((this.maximumAttempts!= null)&&this.maximumAttempts.equals(rhs.maximumAttempts)))&&((this.retryability == rhs.retryability)||((this.retryability!= null)&&this.retryability.equals(rhs.retryability))))&&((this.backoffMilliseconds == rhs.backoffMilliseconds)||((this.backoffMilliseconds!= null)&&this.backoffMilliseconds.equals(rhs.backoffMilliseconds))));
    }

}
