
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1ContractBomReferenceV1 {

    /**
     * 
     * (Required)
     * 
     */
    private String bomDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String evidenceManifestDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String ociManifestDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String repository;

    /**
     * 
     * (Required)
     * 
     */
    public String getBomDigest() {
        return bomDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBomDigest(String bomDigest) {
        this.bomDigest = bomDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getEvidenceManifestDigest() {
        return evidenceManifestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEvidenceManifestDigest(String evidenceManifestDigest) {
        this.evidenceManifestDigest = evidenceManifestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getOciManifestDigest() {
        return ociManifestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOciManifestDigest(String ociManifestDigest) {
        this.ociManifestDigest = ociManifestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getRepository() {
        return repository;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRepository(String repository) {
        this.repository = repository;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1ContractBomReferenceV1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("bomDigest");
        sb.append('=');
        sb.append(((this.bomDigest == null)?"<null>":this.bomDigest));
        sb.append(',');
        sb.append("evidenceManifestDigest");
        sb.append('=');
        sb.append(((this.evidenceManifestDigest == null)?"<null>":this.evidenceManifestDigest));
        sb.append(',');
        sb.append("ociManifestDigest");
        sb.append('=');
        sb.append(((this.ociManifestDigest == null)?"<null>":this.ociManifestDigest));
        sb.append(',');
        sb.append("repository");
        sb.append('=');
        sb.append(((this.repository == null)?"<null>":this.repository));
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
        result = ((result* 31)+((this.bomDigest == null)? 0 :this.bomDigest.hashCode()));
        result = ((result* 31)+((this.ociManifestDigest == null)? 0 :this.ociManifestDigest.hashCode()));
        result = ((result* 31)+((this.repository == null)? 0 :this.repository.hashCode()));
        result = ((result* 31)+((this.evidenceManifestDigest == null)? 0 :this.evidenceManifestDigest.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1ContractBomReferenceV1) == false) {
            return false;
        }
        SharedPrimitivesV1ContractBomReferenceV1 rhs = ((SharedPrimitivesV1ContractBomReferenceV1) other);
        return (((((this.bomDigest == rhs.bomDigest)||((this.bomDigest!= null)&&this.bomDigest.equals(rhs.bomDigest)))&&((this.ociManifestDigest == rhs.ociManifestDigest)||((this.ociManifestDigest!= null)&&this.ociManifestDigest.equals(rhs.ociManifestDigest))))&&((this.repository == rhs.repository)||((this.repository!= null)&&this.repository.equals(rhs.repository))))&&((this.evidenceManifestDigest == rhs.evidenceManifestDigest)||((this.evidenceManifestDigest!= null)&&this.evidenceManifestDigest.equals(rhs.evidenceManifestDigest))));
    }

}
