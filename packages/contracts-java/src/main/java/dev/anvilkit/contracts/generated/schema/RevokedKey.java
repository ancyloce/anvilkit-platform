
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;

public class RevokedKey {

    /**
     * 
     * (Required)
     * 
     */
    private Date effectiveAt;
    /**
     * 
     * (Required)
     * 
     */
    private String keyId;
    /**
     * 
     * (Required)
     * 
     */
    private String reason;

    /**
     * 
     * (Required)
     * 
     */
    public Date getEffectiveAt() {
        return effectiveAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEffectiveAt(Date effectiveAt) {
        this.effectiveAt = effectiveAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getKeyId() {
        return keyId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getReason() {
        return reason;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(RevokedKey.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("effectiveAt");
        sb.append('=');
        sb.append(((this.effectiveAt == null)?"<null>":this.effectiveAt));
        sb.append(',');
        sb.append("keyId");
        sb.append('=');
        sb.append(((this.keyId == null)?"<null>":this.keyId));
        sb.append(',');
        sb.append("reason");
        sb.append('=');
        sb.append(((this.reason == null)?"<null>":this.reason));
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
        result = ((result* 31)+((this.effectiveAt == null)? 0 :this.effectiveAt.hashCode()));
        result = ((result* 31)+((this.keyId == null)? 0 :this.keyId.hashCode()));
        result = ((result* 31)+((this.reason == null)? 0 :this.reason.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof RevokedKey) == false) {
            return false;
        }
        RevokedKey rhs = ((RevokedKey) other);
        return ((((this.effectiveAt == rhs.effectiveAt)||((this.effectiveAt!= null)&&this.effectiveAt.equals(rhs.effectiveAt)))&&((this.keyId == rhs.keyId)||((this.keyId!= null)&&this.keyId.equals(rhs.keyId))))&&((this.reason == rhs.reason)||((this.reason!= null)&&this.reason.equals(rhs.reason))));
    }

}
