
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1TraceAndScope {

    /**
     * 
     * (Required)
     * 
     */
    private String actorId;
    /**
     * 
     * (Required)
     * 
     */
    private String tenantId;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1TraceContext traceContext;
    /**
     * 
     * (Required)
     * 
     */
    private String workspaceId;

    /**
     * 
     * (Required)
     * 
     */
    public String getActorId() {
        return actorId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getTenantId() {
        return tenantId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1TraceContext getTraceContext() {
        return traceContext;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTraceContext(SharedPrimitivesV1TraceContext traceContext) {
        this.traceContext = traceContext;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getWorkspaceId() {
        return workspaceId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1TraceAndScope.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("actorId");
        sb.append('=');
        sb.append(((this.actorId == null)?"<null>":this.actorId));
        sb.append(',');
        sb.append("tenantId");
        sb.append('=');
        sb.append(((this.tenantId == null)?"<null>":this.tenantId));
        sb.append(',');
        sb.append("traceContext");
        sb.append('=');
        sb.append(((this.traceContext == null)?"<null>":this.traceContext));
        sb.append(',');
        sb.append("workspaceId");
        sb.append('=');
        sb.append(((this.workspaceId == null)?"<null>":this.workspaceId));
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
        result = ((result* 31)+((this.tenantId == null)? 0 :this.tenantId.hashCode()));
        result = ((result* 31)+((this.actorId == null)? 0 :this.actorId.hashCode()));
        result = ((result* 31)+((this.traceContext == null)? 0 :this.traceContext.hashCode()));
        result = ((result* 31)+((this.workspaceId == null)? 0 :this.workspaceId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1TraceAndScope) == false) {
            return false;
        }
        SharedPrimitivesV1TraceAndScope rhs = ((SharedPrimitivesV1TraceAndScope) other);
        return (((((this.tenantId == rhs.tenantId)||((this.tenantId!= null)&&this.tenantId.equals(rhs.tenantId)))&&((this.actorId == rhs.actorId)||((this.actorId!= null)&&this.actorId.equals(rhs.actorId))))&&((this.traceContext == rhs.traceContext)||((this.traceContext!= null)&&this.traceContext.equals(rhs.traceContext))))&&((this.workspaceId == rhs.workspaceId)||((this.workspaceId!= null)&&this.workspaceId.equals(rhs.workspaceId))));
    }

}
