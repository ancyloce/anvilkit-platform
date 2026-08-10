
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1ArtifactReference {

    /**
     * 
     * (Required)
     * 
     */
    private String artifactId;
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
    private String mediaType;
    /**
     * 
     * (Required)
     * 
     */
    private Integer sizeBytes;

    /**
     * 
     * (Required)
     * 
     */
    public String getArtifactId() {
        return artifactId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setArtifactId(String artifactId) {
        this.artifactId = artifactId;
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
    public Integer getSizeBytes() {
        return sizeBytes;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSizeBytes(Integer sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1ArtifactReference.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("artifactId");
        sb.append('=');
        sb.append(((this.artifactId == null)?"<null>":this.artifactId));
        sb.append(',');
        sb.append("digest");
        sb.append('=');
        sb.append(((this.digest == null)?"<null>":this.digest));
        sb.append(',');
        sb.append("mediaType");
        sb.append('=');
        sb.append(((this.mediaType == null)?"<null>":this.mediaType));
        sb.append(',');
        sb.append("sizeBytes");
        sb.append('=');
        sb.append(((this.sizeBytes == null)?"<null>":this.sizeBytes));
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
        result = ((result* 31)+((this.artifactId == null)? 0 :this.artifactId.hashCode()));
        result = ((result* 31)+((this.mediaType == null)? 0 :this.mediaType.hashCode()));
        result = ((result* 31)+((this.sizeBytes == null)? 0 :this.sizeBytes.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1ArtifactReference) == false) {
            return false;
        }
        SharedPrimitivesV1ArtifactReference rhs = ((SharedPrimitivesV1ArtifactReference) other);
        return (((((this.digest == rhs.digest)||((this.digest!= null)&&this.digest.equals(rhs.digest)))&&((this.artifactId == rhs.artifactId)||((this.artifactId!= null)&&this.artifactId.equals(rhs.artifactId))))&&((this.mediaType == rhs.mediaType)||((this.mediaType!= null)&&this.mediaType.equals(rhs.mediaType))))&&((this.sizeBytes == rhs.sizeBytes)||((this.sizeBytes!= null)&&this.sizeBytes.equals(rhs.sizeBytes))));
    }

}
