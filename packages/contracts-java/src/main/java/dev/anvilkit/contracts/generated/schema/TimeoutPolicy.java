
package dev.anvilkit.contracts.generated.schema;


public class TimeoutPolicy {

    /**
     * 
     * (Required)
     * 
     */
    private Integer timeoutMilliseconds;

    /**
     * 
     * (Required)
     * 
     */
    public Integer getTimeoutMilliseconds() {
        return timeoutMilliseconds;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTimeoutMilliseconds(Integer timeoutMilliseconds) {
        this.timeoutMilliseconds = timeoutMilliseconds;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(TimeoutPolicy.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("timeoutMilliseconds");
        sb.append('=');
        sb.append(((this.timeoutMilliseconds == null)?"<null>":this.timeoutMilliseconds));
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
        result = ((result* 31)+((this.timeoutMilliseconds == null)? 0 :this.timeoutMilliseconds.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof TimeoutPolicy) == false) {
            return false;
        }
        TimeoutPolicy rhs = ((TimeoutPolicy) other);
        return ((this.timeoutMilliseconds == rhs.timeoutMilliseconds)||((this.timeoutMilliseconds!= null)&&this.timeoutMilliseconds.equals(rhs.timeoutMilliseconds)));
    }

}
