
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1SchemaReference {

    /**
     * 
     * (Required)
     * 
     */
    private String componentName;
    /**
     * 
     * (Required)
     * 
     */
    private String digest;
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
    public String getComponentName() {
        return componentName;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setComponentName(String componentName) {
        this.componentName = componentName;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getDigest() {
        return digest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDigest(String digest) {
        this.digest = digest;
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
        sb.append(SharedPrimitivesV1SchemaReference.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("componentName");
        sb.append('=');
        sb.append(((this.componentName == null)?"<null>":this.componentName));
        sb.append(',');
        sb.append("digest");
        sb.append('=');
        sb.append(((this.digest == null)?"<null>":this.digest));
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
        result = ((result* 31)+((this.digest == null)? 0 :this.digest.hashCode()));
        result = ((result* 31)+((this.componentName == null)? 0 :this.componentName.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1SchemaReference) == false) {
            return false;
        }
        SharedPrimitivesV1SchemaReference rhs = ((SharedPrimitivesV1SchemaReference) other);
        return ((((this.digest == rhs.digest)||((this.digest!= null)&&this.digest.equals(rhs.digest)))&&((this.componentName == rhs.componentName)||((this.componentName!= null)&&this.componentName.equals(rhs.componentName))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))));
    }

}
