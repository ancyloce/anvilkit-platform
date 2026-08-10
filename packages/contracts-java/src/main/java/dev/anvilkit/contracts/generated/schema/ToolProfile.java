
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.List;

public class ToolProfile {

    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumParallelTools;
    /**
     * 
     * (Required)
     * 
     */
    private List<SharedPrimitivesV1SchemaReference> tools = new ArrayList<SharedPrimitivesV1SchemaReference>();

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumParallelTools() {
        return maximumParallelTools;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumParallelTools(Integer maximumParallelTools) {
        this.maximumParallelTools = maximumParallelTools;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1SchemaReference> getTools() {
        return tools;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTools(List<SharedPrimitivesV1SchemaReference> tools) {
        this.tools = tools;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ToolProfile.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumParallelTools");
        sb.append('=');
        sb.append(((this.maximumParallelTools == null)?"<null>":this.maximumParallelTools));
        sb.append(',');
        sb.append("tools");
        sb.append('=');
        sb.append(((this.tools == null)?"<null>":this.tools));
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
        result = ((result* 31)+((this.tools == null)? 0 :this.tools.hashCode()));
        result = ((result* 31)+((this.maximumParallelTools == null)? 0 :this.maximumParallelTools.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ToolProfile) == false) {
            return false;
        }
        ToolProfile rhs = ((ToolProfile) other);
        return (((this.tools == rhs.tools)||((this.tools!= null)&&this.tools.equals(rhs.tools)))&&((this.maximumParallelTools == rhs.maximumParallelTools)||((this.maximumParallelTools!= null)&&this.maximumParallelTools.equals(rhs.maximumParallelTools))));
    }

}
