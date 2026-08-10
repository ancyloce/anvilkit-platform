
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class Resources {

    /**
     * 
     * (Required)
     * 
     */
    private Integer priority;
    /**
     * 
     * (Required)
     * 
     */
    private Resources.ResourceClass resourceClass;

    /**
     * 
     * (Required)
     * 
     */
    public Integer getPriority() {
        return priority;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Resources.ResourceClass getResourceClass() {
        return resourceClass;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setResourceClass(Resources.ResourceClass resourceClass) {
        this.resourceClass = resourceClass;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Resources.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("priority");
        sb.append('=');
        sb.append(((this.priority == null)?"<null>":this.priority));
        sb.append(',');
        sb.append("resourceClass");
        sb.append('=');
        sb.append(((this.resourceClass == null)?"<null>":this.resourceClass));
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
        result = ((result* 31)+((this.priority == null)? 0 :this.priority.hashCode()));
        result = ((result* 31)+((this.resourceClass == null)? 0 :this.resourceClass.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Resources) == false) {
            return false;
        }
        Resources rhs = ((Resources) other);
        return (((this.priority == rhs.priority)||((this.priority!= null)&&this.priority.equals(rhs.priority)))&&((this.resourceClass == rhs.resourceClass)||((this.resourceClass!= null)&&this.resourceClass.equals(rhs.resourceClass))));
    }

    public enum ResourceClass {

        INTERACTIVE_CPU("interactive-cpu"),
        BATCH_CPU("batch-cpu"),
        INTERACTIVE_GPU("interactive-gpu"),
        BATCH_GPU("batch-gpu");
        private final String value;
        private final static Map<String, Resources.ResourceClass> CONSTANTS = new HashMap<String, Resources.ResourceClass>();

        static {
            for (Resources.ResourceClass c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        ResourceClass(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static Resources.ResourceClass fromValue(String value) {
            Resources.ResourceClass constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
