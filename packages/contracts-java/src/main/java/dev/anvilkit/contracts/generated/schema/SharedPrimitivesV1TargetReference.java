
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1TargetReference {

    /**
     * 
     * (Required)
     * 
     */
    private String targetId;
    /**
     * 
     * (Required)
     * 
     */
    private String targetType;
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
    public String getTargetId() {
        return targetId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getTargetType() {
        return targetType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTargetType(String targetType) {
        this.targetType = targetType;
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
        sb.append(SharedPrimitivesV1TargetReference.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("targetId");
        sb.append('=');
        sb.append(((this.targetId == null)?"<null>":this.targetId));
        sb.append(',');
        sb.append("targetType");
        sb.append('=');
        sb.append(((this.targetType == null)?"<null>":this.targetType));
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
        result = ((result* 31)+((this.targetType == null)? 0 :this.targetType.hashCode()));
        result = ((result* 31)+((this.targetId == null)? 0 :this.targetId.hashCode()));
        result = ((result* 31)+((this.workspaceId == null)? 0 :this.workspaceId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1TargetReference) == false) {
            return false;
        }
        SharedPrimitivesV1TargetReference rhs = ((SharedPrimitivesV1TargetReference) other);
        return ((((this.targetType == rhs.targetType)||((this.targetType!= null)&&this.targetType.equals(rhs.targetType)))&&((this.targetId == rhs.targetId)||((this.targetId!= null)&&this.targetId.equals(rhs.targetId))))&&((this.workspaceId == rhs.workspaceId)||((this.workspaceId!= null)&&this.workspaceId.equals(rhs.workspaceId))));
    }

}
