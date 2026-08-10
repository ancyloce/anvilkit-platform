
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;


/**
 * ContractTrustRootV1 contract
 * <p>
 * Pinned public trust snapshot for contract release and apply-authorization verification.
 * 
 */
public class ContractTrustRootV1Contract {

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
    private Set<Key> keys = new LinkedHashSet<Key>();
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
    private Integer maximumClockSkewSeconds;
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
    public Set<Key> getKeys() {
        return keys;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKeys(Set<Key> keys) {
        this.keys = keys;
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
    public Integer getMaximumClockSkewSeconds() {
        return maximumClockSkewSeconds;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumClockSkewSeconds(Integer maximumClockSkewSeconds) {
        this.maximumClockSkewSeconds = maximumClockSkewSeconds;
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
        sb.append(ContractTrustRootV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("issuedAt");
        sb.append('=');
        sb.append(((this.issuedAt == null)?"<null>":this.issuedAt));
        sb.append(',');
        sb.append("keys");
        sb.append('=');
        sb.append(((this.keys == null)?"<null>":this.keys));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("maximumClockSkewSeconds");
        sb.append('=');
        sb.append(((this.maximumClockSkewSeconds == null)?"<null>":this.maximumClockSkewSeconds));
        sb.append(',');
        sb.append("nextUpdate");
        sb.append('=');
        sb.append(((this.nextUpdate == null)?"<null>":this.nextUpdate));
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
        result = ((result* 31)+((this.maximumClockSkewSeconds == null)? 0 :this.maximumClockSkewSeconds.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.snapshotId == null)? 0 :this.snapshotId.hashCode()));
        result = ((result* 31)+((this.keys == null)? 0 :this.keys.hashCode()));
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
        if ((other instanceof ContractTrustRootV1Contract) == false) {
            return false;
        }
        ContractTrustRootV1Contract rhs = ((ContractTrustRootV1Contract) other);
        return ((((((((this.maximumClockSkewSeconds == rhs.maximumClockSkewSeconds)||((this.maximumClockSkewSeconds!= null)&&this.maximumClockSkewSeconds.equals(rhs.maximumClockSkewSeconds)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.snapshotId == rhs.snapshotId)||((this.snapshotId!= null)&&this.snapshotId.equals(rhs.snapshotId))))&&((this.keys == rhs.keys)||((this.keys!= null)&&this.keys.equals(rhs.keys))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.issuedAt == rhs.issuedAt)||((this.issuedAt!= null)&&this.issuedAt.equals(rhs.issuedAt))))&&((this.nextUpdate == rhs.nextUpdate)||((this.nextUpdate!= null)&&this.nextUpdate.equals(rhs.nextUpdate))));
    }

}
