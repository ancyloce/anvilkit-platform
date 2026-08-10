
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

public class Key {

    /**
     * 
     * (Required)
     * 
     */
    private Set<Algorithm> algorithms = new LinkedHashSet<Algorithm>();
    /**
     * 
     * (Required)
     * 
     */
    private Set<String> audiences = new LinkedHashSet<String>();
    /**
     * 
     * (Required)
     * 
     */
    private String issuer;
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
    private Date notAfter;
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
    private PublicKeyJwk publicKeyJwk;
    /**
     * 
     * (Required)
     * 
     */
    private Key.Status status;

    /**
     * 
     * (Required)
     * 
     */
    public Set<Algorithm> getAlgorithms() {
        return algorithms;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAlgorithms(Set<Algorithm> algorithms) {
        this.algorithms = algorithms;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Set<String> getAudiences() {
        return audiences;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAudiences(Set<String> audiences) {
        this.audiences = audiences;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getIssuer() {
        return issuer;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setIssuer(String issuer) {
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
    public Date getNotAfter() {
        return notAfter;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setNotAfter(Date notAfter) {
        this.notAfter = notAfter;
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
    public PublicKeyJwk getPublicKeyJwk() {
        return publicKeyJwk;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPublicKeyJwk(PublicKeyJwk publicKeyJwk) {
        this.publicKeyJwk = publicKeyJwk;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Key.Status getStatus() {
        return status;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setStatus(Key.Status status) {
        this.status = status;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Key.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("algorithms");
        sb.append('=');
        sb.append(((this.algorithms == null)?"<null>":this.algorithms));
        sb.append(',');
        sb.append("audiences");
        sb.append('=');
        sb.append(((this.audiences == null)?"<null>":this.audiences));
        sb.append(',');
        sb.append("issuer");
        sb.append('=');
        sb.append(((this.issuer == null)?"<null>":this.issuer));
        sb.append(',');
        sb.append("keyId");
        sb.append('=');
        sb.append(((this.keyId == null)?"<null>":this.keyId));
        sb.append(',');
        sb.append("notAfter");
        sb.append('=');
        sb.append(((this.notAfter == null)?"<null>":this.notAfter));
        sb.append(',');
        sb.append("notBefore");
        sb.append('=');
        sb.append(((this.notBefore == null)?"<null>":this.notBefore));
        sb.append(',');
        sb.append("publicKeyJwk");
        sb.append('=');
        sb.append(((this.publicKeyJwk == null)?"<null>":this.publicKeyJwk));
        sb.append(',');
        sb.append("status");
        sb.append('=');
        sb.append(((this.status == null)?"<null>":this.status));
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
        result = ((result* 31)+((this.algorithms == null)? 0 :this.algorithms.hashCode()));
        result = ((result* 31)+((this.notAfter == null)? 0 :this.notAfter.hashCode()));
        result = ((result* 31)+((this.audiences == null)? 0 :this.audiences.hashCode()));
        result = ((result* 31)+((this.keyId == null)? 0 :this.keyId.hashCode()));
        result = ((result* 31)+((this.publicKeyJwk == null)? 0 :this.publicKeyJwk.hashCode()));
        result = ((result* 31)+((this.issuer == null)? 0 :this.issuer.hashCode()));
        result = ((result* 31)+((this.notBefore == null)? 0 :this.notBefore.hashCode()));
        result = ((result* 31)+((this.status == null)? 0 :this.status.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Key) == false) {
            return false;
        }
        Key rhs = ((Key) other);
        return (((((((((this.algorithms == rhs.algorithms)||((this.algorithms!= null)&&this.algorithms.equals(rhs.algorithms)))&&((this.notAfter == rhs.notAfter)||((this.notAfter!= null)&&this.notAfter.equals(rhs.notAfter))))&&((this.audiences == rhs.audiences)||((this.audiences!= null)&&this.audiences.equals(rhs.audiences))))&&((this.keyId == rhs.keyId)||((this.keyId!= null)&&this.keyId.equals(rhs.keyId))))&&((this.publicKeyJwk == rhs.publicKeyJwk)||((this.publicKeyJwk!= null)&&this.publicKeyJwk.equals(rhs.publicKeyJwk))))&&((this.issuer == rhs.issuer)||((this.issuer!= null)&&this.issuer.equals(rhs.issuer))))&&((this.notBefore == rhs.notBefore)||((this.notBefore!= null)&&this.notBefore.equals(rhs.notBefore))))&&((this.status == rhs.status)||((this.status!= null)&&this.status.equals(rhs.status))));
    }

    public enum Status {

        ACTIVE("active"),
        OVERLAP("overlap"),
        RETIRED("retired"),
        REVOKED("revoked");
        private final String value;
        private final static Map<String, Key.Status> CONSTANTS = new HashMap<String, Key.Status>();

        static {
            for (Key.Status c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Status(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static Key.Status fromValue(String value) {
            Key.Status constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
