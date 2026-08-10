
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1ResourceLimits {

    /**
     * 
     * (Required)
     * 
     */
    private Integer cpuMillis;
    /**
     * 
     * (Required)
     * 
     */
    private Integer gpuMillis;
    /**
     * 
     * (Required)
     * 
     */
    private Long memoryBytes;
    /**
     * 
     * (Required)
     * 
     */
    private Integer outputBytes;
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
    public Integer getCpuMillis() {
        return cpuMillis;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCpuMillis(Integer cpuMillis) {
        this.cpuMillis = cpuMillis;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getGpuMillis() {
        return gpuMillis;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setGpuMillis(Integer gpuMillis) {
        this.gpuMillis = gpuMillis;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getMemoryBytes() {
        return memoryBytes;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMemoryBytes(Long memoryBytes) {
        this.memoryBytes = memoryBytes;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getOutputBytes() {
        return outputBytes;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOutputBytes(Integer outputBytes) {
        this.outputBytes = outputBytes;
    }

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
        sb.append(SharedPrimitivesV1ResourceLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("cpuMillis");
        sb.append('=');
        sb.append(((this.cpuMillis == null)?"<null>":this.cpuMillis));
        sb.append(',');
        sb.append("gpuMillis");
        sb.append('=');
        sb.append(((this.gpuMillis == null)?"<null>":this.gpuMillis));
        sb.append(',');
        sb.append("memoryBytes");
        sb.append('=');
        sb.append(((this.memoryBytes == null)?"<null>":this.memoryBytes));
        sb.append(',');
        sb.append("outputBytes");
        sb.append('=');
        sb.append(((this.outputBytes == null)?"<null>":this.outputBytes));
        sb.append(',');
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
        result = ((result* 31)+((this.memoryBytes == null)? 0 :this.memoryBytes.hashCode()));
        result = ((result* 31)+((this.timeoutMilliseconds == null)? 0 :this.timeoutMilliseconds.hashCode()));
        result = ((result* 31)+((this.outputBytes == null)? 0 :this.outputBytes.hashCode()));
        result = ((result* 31)+((this.cpuMillis == null)? 0 :this.cpuMillis.hashCode()));
        result = ((result* 31)+((this.gpuMillis == null)? 0 :this.gpuMillis.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1ResourceLimits) == false) {
            return false;
        }
        SharedPrimitivesV1ResourceLimits rhs = ((SharedPrimitivesV1ResourceLimits) other);
        return ((((((this.memoryBytes == rhs.memoryBytes)||((this.memoryBytes!= null)&&this.memoryBytes.equals(rhs.memoryBytes)))&&((this.timeoutMilliseconds == rhs.timeoutMilliseconds)||((this.timeoutMilliseconds!= null)&&this.timeoutMilliseconds.equals(rhs.timeoutMilliseconds))))&&((this.outputBytes == rhs.outputBytes)||((this.outputBytes!= null)&&this.outputBytes.equals(rhs.outputBytes))))&&((this.cpuMillis == rhs.cpuMillis)||((this.cpuMillis!= null)&&this.cpuMillis.equals(rhs.cpuMillis))))&&((this.gpuMillis == rhs.gpuMillis)||((this.gpuMillis!= null)&&this.gpuMillis.equals(rhs.gpuMillis))));
    }

}
