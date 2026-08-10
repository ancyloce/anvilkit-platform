
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;


/**
 * TargetSnapshotV1 contract
 * <p>
 * Bounded TargetSnapshotV1 wire contract governed by PRD 0012.
 * 
 */
public class TargetSnapshotV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Object apiVersion;
    /**
     * 
     * (Required)
     * 
     */
    private String baseRevision;
    /**
     * 
     * (Required)
     * 
     */
    private Date capturedAt;
    /**
     * 
     * (Required)
     * 
     */
    private String catalogDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String contractBomDigest;
    /**
     * 
     * (Required)
     * 
     */
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1ArtifactReference snapshot;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1TargetReference target;

    /**
     * 
     * (Required)
     * 
     */
    public Object getApiVersion() {
        return apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setApiVersion(Object apiVersion) {
        this.apiVersion = apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getBaseRevision() {
        return baseRevision;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBaseRevision(String baseRevision) {
        this.baseRevision = baseRevision;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getCapturedAt() {
        return capturedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCapturedAt(Date capturedAt) {
        this.capturedAt = capturedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getCatalogDigest() {
        return catalogDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCatalogDigest(String catalogDigest) {
        this.catalogDigest = catalogDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getContractBomDigest() {
        return contractBomDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setContractBomDigest(String contractBomDigest) {
        this.contractBomDigest = contractBomDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Object getKind() {
        return kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKind(Object kind) {
        this.kind = kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1ArtifactReference getSnapshot() {
        return snapshot;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSnapshot(SharedPrimitivesV1ArtifactReference snapshot) {
        this.snapshot = snapshot;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1TargetReference getTarget() {
        return target;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTarget(SharedPrimitivesV1TargetReference target) {
        this.target = target;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(TargetSnapshotV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("baseRevision");
        sb.append('=');
        sb.append(((this.baseRevision == null)?"<null>":this.baseRevision));
        sb.append(',');
        sb.append("capturedAt");
        sb.append('=');
        sb.append(((this.capturedAt == null)?"<null>":this.capturedAt));
        sb.append(',');
        sb.append("catalogDigest");
        sb.append('=');
        sb.append(((this.catalogDigest == null)?"<null>":this.catalogDigest));
        sb.append(',');
        sb.append("contractBomDigest");
        sb.append('=');
        sb.append(((this.contractBomDigest == null)?"<null>":this.contractBomDigest));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("snapshot");
        sb.append('=');
        sb.append(((this.snapshot == null)?"<null>":this.snapshot));
        sb.append(',');
        sb.append("target");
        sb.append('=');
        sb.append(((this.target == null)?"<null>":this.target));
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
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.contractBomDigest == null)? 0 :this.contractBomDigest.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.baseRevision == null)? 0 :this.baseRevision.hashCode()));
        result = ((result* 31)+((this.capturedAt == null)? 0 :this.capturedAt.hashCode()));
        result = ((result* 31)+((this.catalogDigest == null)? 0 :this.catalogDigest.hashCode()));
        result = ((result* 31)+((this.snapshot == null)? 0 :this.snapshot.hashCode()));
        result = ((result* 31)+((this.target == null)? 0 :this.target.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof TargetSnapshotV1Contract) == false) {
            return false;
        }
        TargetSnapshotV1Contract rhs = ((TargetSnapshotV1Contract) other);
        return (((((((((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion)))&&((this.contractBomDigest == rhs.contractBomDigest)||((this.contractBomDigest!= null)&&this.contractBomDigest.equals(rhs.contractBomDigest))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.baseRevision == rhs.baseRevision)||((this.baseRevision!= null)&&this.baseRevision.equals(rhs.baseRevision))))&&((this.capturedAt == rhs.capturedAt)||((this.capturedAt!= null)&&this.capturedAt.equals(rhs.capturedAt))))&&((this.catalogDigest == rhs.catalogDigest)||((this.catalogDigest!= null)&&this.catalogDigest.equals(rhs.catalogDigest))))&&((this.snapshot == rhs.snapshot)||((this.snapshot!= null)&&this.snapshot.equals(rhs.snapshot))))&&((this.target == rhs.target)||((this.target!= null)&&this.target.equals(rhs.target))));
    }

}
