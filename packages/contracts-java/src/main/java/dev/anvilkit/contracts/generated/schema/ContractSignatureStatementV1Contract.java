
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;


/**
 * ContractSignatureStatementV1 contract
 * <p>
 * Canonical context-bound statement carried by a standard single-signature DSSE envelope.
 * 
 */
public class ContractSignatureStatementV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Object algorithm;
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
    private Object audience;
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
    private Date expiresAt;
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
    private Object issuer;
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
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private Date notBefore;
    /**
     * 
     * (Required)
     * 
     */
    private Subject subject;

    /**
     * 
     * (Required)
     * 
     */
    public Object getAlgorithm() {
        return algorithm;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAlgorithm(Object algorithm) {
        this.algorithm = algorithm;
    }

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
    public Object getAudience() {
        return audience;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAudience(Object audience) {
        this.audience = audience;
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
    public Date getExpiresAt() {
        return expiresAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
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
    public Object getIssuer() {
        return issuer;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setIssuer(Object issuer) {
        this.issuer = issuer;
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
    public Date getNotBefore() {
        return notBefore;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setNotBefore(Date notBefore) {
        this.notBefore = notBefore;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Subject getSubject() {
        return subject;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ContractSignatureStatementV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("algorithm");
        sb.append('=');
        sb.append(((this.algorithm == null)?"<null>":this.algorithm));
        sb.append(',');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("audience");
        sb.append('=');
        sb.append(((this.audience == null)?"<null>":this.audience));
        sb.append(',');
        sb.append("contractBomDigest");
        sb.append('=');
        sb.append(((this.contractBomDigest == null)?"<null>":this.contractBomDigest));
        sb.append(',');
        sb.append("expiresAt");
        sb.append('=');
        sb.append(((this.expiresAt == null)?"<null>":this.expiresAt));
        sb.append(',');
        sb.append("issuedAt");
        sb.append('=');
        sb.append(((this.issuedAt == null)?"<null>":this.issuedAt));
        sb.append(',');
        sb.append("issuer");
        sb.append('=');
        sb.append(((this.issuer == null)?"<null>":this.issuer));
        sb.append(',');
        sb.append("keyId");
        sb.append('=');
        sb.append(((this.keyId == null)?"<null>":this.keyId));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("notBefore");
        sb.append('=');
        sb.append(((this.notBefore == null)?"<null>":this.notBefore));
        sb.append(',');
        sb.append("subject");
        sb.append('=');
        sb.append(((this.subject == null)?"<null>":this.subject));
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
        result = ((result* 31)+((this.audience == null)? 0 :this.audience.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.contractBomDigest == null)? 0 :this.contractBomDigest.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.subject == null)? 0 :this.subject.hashCode()));
        result = ((result* 31)+((this.keyId == null)? 0 :this.keyId.hashCode()));
        result = ((result* 31)+((this.issuedAt == null)? 0 :this.issuedAt.hashCode()));
        result = ((result* 31)+((this.expiresAt == null)? 0 :this.expiresAt.hashCode()));
        result = ((result* 31)+((this.issuer == null)? 0 :this.issuer.hashCode()));
        result = ((result* 31)+((this.notBefore == null)? 0 :this.notBefore.hashCode()));
        result = ((result* 31)+((this.algorithm == null)? 0 :this.algorithm.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ContractSignatureStatementV1Contract) == false) {
            return false;
        }
        ContractSignatureStatementV1Contract rhs = ((ContractSignatureStatementV1Contract) other);
        return ((((((((((((this.audience == rhs.audience)||((this.audience!= null)&&this.audience.equals(rhs.audience)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.contractBomDigest == rhs.contractBomDigest)||((this.contractBomDigest!= null)&&this.contractBomDigest.equals(rhs.contractBomDigest))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.subject == rhs.subject)||((this.subject!= null)&&this.subject.equals(rhs.subject))))&&((this.keyId == rhs.keyId)||((this.keyId!= null)&&this.keyId.equals(rhs.keyId))))&&((this.issuedAt == rhs.issuedAt)||((this.issuedAt!= null)&&this.issuedAt.equals(rhs.issuedAt))))&&((this.expiresAt == rhs.expiresAt)||((this.expiresAt!= null)&&this.expiresAt.equals(rhs.expiresAt))))&&((this.issuer == rhs.issuer)||((this.issuer!= null)&&this.issuer.equals(rhs.issuer))))&&((this.notBefore == rhs.notBefore)||((this.notBefore!= null)&&this.notBefore.equals(rhs.notBefore))))&&((this.algorithm == rhs.algorithm)||((this.algorithm!= null)&&this.algorithm.equals(rhs.algorithm))));
    }

}
