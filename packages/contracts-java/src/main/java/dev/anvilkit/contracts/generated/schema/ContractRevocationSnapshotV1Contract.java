
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;


/**
 * ContractRevocationSnapshotV1 contract
 * <p>
 * Signed fail-closed key revocation snapshot with explicit freshness.
 * 
 */
public class ContractRevocationSnapshotV1Contract {

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
    private Date issuedAt;
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
    private Date nextUpdate;
    /**
     * 
     * (Required)
     * 
     */
    private Set<RevokedKey> revokedKeys = new LinkedHashSet<RevokedKey>();
    /**
     * 
     * (Required)
     * 
     */
    private String snapshotId;

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
    public Date getIssuedAt() {
        return issuedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setIssuedAt(Date issuedAt) {
        this.issuedAt = issuedAt;
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
    public Date getNextUpdate() {
        return nextUpdate;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setNextUpdate(Date nextUpdate) {
        this.nextUpdate = nextUpdate;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Set<RevokedKey> getRevokedKeys() {
        return revokedKeys;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRevokedKeys(Set<RevokedKey> revokedKeys) {
        this.revokedKeys = revokedKeys;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getSnapshotId() {
        return snapshotId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSnapshotId(String snapshotId) {
        this.snapshotId = snapshotId;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ContractRevocationSnapshotV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("issuedAt");
        sb.append('=');
        sb.append(((this.issuedAt == null)?"<null>":this.issuedAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("nextUpdate");
        sb.append('=');
        sb.append(((this.nextUpdate == null)?"<null>":this.nextUpdate));
        sb.append(',');
        sb.append("revokedKeys");
        sb.append('=');
        sb.append(((this.revokedKeys == null)?"<null>":this.revokedKeys));
        sb.append(',');
        sb.append("snapshotId");
        sb.append('=');
        sb.append(((this.snapshotId == null)?"<null>":this.snapshotId));
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
        result = ((result* 31)+((this.snapshotId == null)? 0 :this.snapshotId.hashCode()));
        result = ((result* 31)+((this.revokedKeys == null)? 0 :this.revokedKeys.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.issuedAt == null)? 0 :this.issuedAt.hashCode()));
        result = ((result* 31)+((this.nextUpdate == null)? 0 :this.nextUpdate.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ContractRevocationSnapshotV1Contract) == false) {
            return false;
        }
        ContractRevocationSnapshotV1Contract rhs = ((ContractRevocationSnapshotV1Contract) other);
        return (((((((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion)))&&((this.snapshotId == rhs.snapshotId)||((this.snapshotId!= null)&&this.snapshotId.equals(rhs.snapshotId))))&&((this.revokedKeys == rhs.revokedKeys)||((this.revokedKeys!= null)&&this.revokedKeys.equals(rhs.revokedKeys))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.issuedAt == rhs.issuedAt)||((this.issuedAt!= null)&&this.issuedAt.equals(rhs.issuedAt))))&&((this.nextUpdate == rhs.nextUpdate)||((this.nextUpdate!= null)&&this.nextUpdate.equals(rhs.nextUpdate))));
    }

}
