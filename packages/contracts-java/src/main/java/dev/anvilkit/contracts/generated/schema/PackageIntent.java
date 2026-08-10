
package dev.anvilkit.contracts.generated.schema;

import java.util.HashMap;
import java.util.Map;

public class PackageIntent {

    /**
     * 
     * (Required)
     * 
     */
    private PackageIntent.ComponentType componentType;
    /**
     * 
     * (Required)
     * 
     */
    private String name;
    /**
     * 
     * (Required)
     * 
     */
    private String version;

    /**
     * 
     * (Required)
     * 
     */
    public PackageIntent.ComponentType getComponentType() {
        return componentType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setComponentType(PackageIntent.ComponentType componentType) {
        this.componentType = componentType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getName() {
        return name;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getVersion() {
        return version;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setVersion(String version) {
        this.version = version;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(PackageIntent.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("componentType");
        sb.append('=');
        sb.append(((this.componentType == null)?"<null>":this.componentType));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("version");
        sb.append('=');
        sb.append(((this.version == null)?"<null>":this.version));
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
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.componentType == null)? 0 :this.componentType.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof PackageIntent) == false) {
            return false;
        }
        PackageIntent rhs = ((PackageIntent) other);
        return ((((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name)))&&((this.componentType == rhs.componentType)||((this.componentType!= null)&&this.componentType.equals(rhs.componentType))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))));
    }

    public enum ComponentType {

        PAGE_COMPONENT("page-component"),
        SECTION("section"),
        THEME("theme"),
        PACKAGE("package");
        private final String value;
        private final static Map<String, PackageIntent.ComponentType> CONSTANTS = new HashMap<String, PackageIntent.ComponentType>();

        static {
            for (PackageIntent.ComponentType c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        ComponentType(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static PackageIntent.ComponentType fromValue(String value) {
            PackageIntent.ComponentType constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
