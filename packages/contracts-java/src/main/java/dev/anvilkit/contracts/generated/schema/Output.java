
package dev.anvilkit.contracts.generated.schema;


public class Output {

    /**
     * 
     * (Required)
     * 
     */
    private Integer maximumBytes;
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
    private SharedPrimitivesV1SchemaReference schema;

    /**
     * 
     * (Required)
     * 
     */
    public Integer getMaximumBytes() {
        return maximumBytes;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumBytes(Integer maximumBytes) {
        this.maximumBytes = maximumBytes;
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
    public SharedPrimitivesV1SchemaReference getSchema() {
        return schema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSchema(SharedPrimitivesV1SchemaReference schema) {
        this.schema = schema;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Output.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumBytes");
        sb.append('=');
        sb.append(((this.maximumBytes == null)?"<null>":this.maximumBytes));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("schema");
        sb.append('=');
        sb.append(((this.schema == null)?"<null>":this.schema));
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
        result = ((result* 31)+((this.schema == null)? 0 :this.schema.hashCode()));
        result = ((result* 31)+((this.maximumBytes == null)? 0 :this.maximumBytes.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Output) == false) {
            return false;
        }
        Output rhs = ((Output) other);
        return ((((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name)))&&((this.schema == rhs.schema)||((this.schema!= null)&&this.schema.equals(rhs.schema))))&&((this.maximumBytes == rhs.maximumBytes)||((this.maximumBytes!= null)&&this.maximumBytes.equals(rhs.maximumBytes))));
    }

}
