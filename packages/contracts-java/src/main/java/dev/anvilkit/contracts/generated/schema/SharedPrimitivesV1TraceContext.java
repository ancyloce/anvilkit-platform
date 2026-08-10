
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1TraceContext {

    /**
     * 
     * (Required)
     * 
     */
    private String traceparent;
    private String tracestate;

    /**
     * 
     * (Required)
     * 
     */
    public String getTraceparent() {
        return traceparent;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTraceparent(String traceparent) {
        this.traceparent = traceparent;
    }

    public String getTracestate() {
        return tracestate;
    }

    public void setTracestate(String tracestate) {
        this.tracestate = tracestate;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1TraceContext.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("traceparent");
        sb.append('=');
        sb.append(((this.traceparent == null)?"<null>":this.traceparent));
        sb.append(',');
        sb.append("tracestate");
        sb.append('=');
        sb.append(((this.tracestate == null)?"<null>":this.tracestate));
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
        result = ((result* 31)+((this.traceparent == null)? 0 :this.traceparent.hashCode()));
        result = ((result* 31)+((this.tracestate == null)? 0 :this.tracestate.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1TraceContext) == false) {
            return false;
        }
        SharedPrimitivesV1TraceContext rhs = ((SharedPrimitivesV1TraceContext) other);
        return (((this.traceparent == rhs.traceparent)||((this.traceparent!= null)&&this.traceparent.equals(rhs.traceparent)))&&((this.tracestate == rhs.tracestate)||((this.tracestate!= null)&&this.tracestate.equals(rhs.tracestate))));
    }

}
