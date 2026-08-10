
package dev.anvilkit.contracts.generated.schema;


public class Reference {

    /**
     * 
     * (Required)
     * 
     */
    private String bucket;
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
    private String objectKey;
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
    public String getBucket() {
        return bucket;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBucket(String bucket) {
        this.bucket = bucket;
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
    public String getObjectKey() {
        return objectKey;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
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
        sb.append(Reference.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("bucket");
        sb.append('=');
        sb.append(((this.bucket == null)?"<null>":this.bucket));
        sb.append(',');
        sb.append("mediaType");
        sb.append('=');
        sb.append(((this.mediaType == null)?"<null>":this.mediaType));
        sb.append(',');
        sb.append("objectKey");
        sb.append('=');
        sb.append(((this.objectKey == null)?"<null>":this.objectKey));
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
        result = ((result* 31)+((this.bucket == null)? 0 :this.bucket.hashCode()));
        result = ((result* 31)+((this.mediaType == null)? 0 :this.mediaType.hashCode()));
        result = ((result* 31)+((this.objectKey == null)? 0 :this.objectKey.hashCode()));
        result = ((result* 31)+((this.sizeBytes == null)? 0 :this.sizeBytes.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Reference) == false) {
            return false;
        }
        Reference rhs = ((Reference) other);
        return (((((this.bucket == rhs.bucket)||((this.bucket!= null)&&this.bucket.equals(rhs.bucket)))&&((this.mediaType == rhs.mediaType)||((this.mediaType!= null)&&this.mediaType.equals(rhs.mediaType))))&&((this.objectKey == rhs.objectKey)||((this.objectKey!= null)&&this.objectKey.equals(rhs.objectKey))))&&((this.sizeBytes == rhs.sizeBytes)||((this.sizeBytes!= null)&&this.sizeBytes.equals(rhs.sizeBytes))));
    }

}
