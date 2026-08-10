
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1PolicyReference {

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
    private String policyId;
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
    public String getPolicyId() {
        return policyId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPolicyId(String policyId) {
        this.policyId = policyId;
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
        sb.append(SharedPrimitivesV1PolicyReference.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("digest");
        sb.append('=');
        sb.append(((this.digest == null)?"<null>":this.digest));
        sb.append(',');
        sb.append("policyId");
        sb.append('=');
        sb.append(((this.policyId == null)?"<null>":this.policyId));
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
        result = ((result* 31)+((this.policyId == null)? 0 :this.policyId.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1PolicyReference) == false) {
            return false;
        }
        SharedPrimitivesV1PolicyReference rhs = ((SharedPrimitivesV1PolicyReference) other);
        return ((((this.digest == rhs.digest)||((this.digest!= null)&&this.digest.equals(rhs.digest)))&&((this.policyId == rhs.policyId)||((this.policyId!= null)&&this.policyId.equals(rhs.policyId))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))));
    }

}
