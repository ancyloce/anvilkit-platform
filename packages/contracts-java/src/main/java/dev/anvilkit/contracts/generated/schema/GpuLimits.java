
package dev.anvilkit.contracts.generated.schema;


public class GpuLimits {

    /**
     * 
     * (Required)
     * 
     */
    private Long maximumGpuMilliseconds;

    /**
     * 
     * (Required)
     * 
     */
    public Long getMaximumGpuMilliseconds() {
        return maximumGpuMilliseconds;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumGpuMilliseconds(Long maximumGpuMilliseconds) {
        this.maximumGpuMilliseconds = maximumGpuMilliseconds;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(GpuLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumGpuMilliseconds");
        sb.append('=');
        sb.append(((this.maximumGpuMilliseconds == null)?"<null>":this.maximumGpuMilliseconds));
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
        result = ((result* 31)+((this.maximumGpuMilliseconds == null)? 0 :this.maximumGpuMilliseconds.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof GpuLimits) == false) {
            return false;
        }
        GpuLimits rhs = ((GpuLimits) other);
        return ((this.maximumGpuMilliseconds == rhs.maximumGpuMilliseconds)||((this.maximumGpuMilliseconds!= null)&&this.maximumGpuMilliseconds.equals(rhs.maximumGpuMilliseconds)));
    }

}
