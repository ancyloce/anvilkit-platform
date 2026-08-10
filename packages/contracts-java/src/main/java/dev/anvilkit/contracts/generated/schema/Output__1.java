
package dev.anvilkit.contracts.generated.schema;


public class Output__1 {

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
    private String mediaType;
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
    public String getMediaType() {
        return mediaType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Output__1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumBytes");
        sb.append('=');
        sb.append(((this.maximumBytes == null)?"<null>":this.maximumBytes));
        sb.append(',');
        sb.append("mediaType");
        sb.append('=');
        sb.append(((this.mediaType == null)?"<null>":this.mediaType));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
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
        result = ((result* 31)+((this.mediaType == null)? 0 :this.mediaType.hashCode()));
        result = ((result* 31)+((this.maximumBytes == null)? 0 :this.maximumBytes.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Output__1) == false) {
            return false;
        }
        Output__1 rhs = ((Output__1) other);
        return ((((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name)))&&((this.mediaType == rhs.mediaType)||((this.mediaType!= null)&&this.mediaType.equals(rhs.mediaType))))&&((this.maximumBytes == rhs.maximumBytes)||((this.maximumBytes!= null)&&this.maximumBytes.equals(rhs.maximumBytes))));
    }

}
