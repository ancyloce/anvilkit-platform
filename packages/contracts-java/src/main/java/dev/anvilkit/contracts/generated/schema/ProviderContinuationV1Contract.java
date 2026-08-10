
package dev.anvilkit.contracts.generated.schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;


/**
 * ProviderContinuationV1 contract
 * <p>
 * Bounded ProviderContinuationV1 wire contract governed by PRD 0012.
 * 
 */
public class ProviderContinuationV1Contract {

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
    private String bindingDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String encryptedBinding;
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
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private String provider;
    /**
     * 
     * (Required)
     * 
     */
    private ProviderContinuationV1Contract.RestartPolicy restartPolicy;

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
    public String getBindingDigest() {
        return bindingDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBindingDigest(String bindingDigest) {
        this.bindingDigest = bindingDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getEncryptedBinding() {
        return encryptedBinding;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setEncryptedBinding(String encryptedBinding) {
        this.encryptedBinding = encryptedBinding;
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
    public String getProvider() {
        return provider;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setProvider(String provider) {
        this.provider = provider;
    }

    /**
     * 
     * (Required)
     * 
     */
    public ProviderContinuationV1Contract.RestartPolicy getRestartPolicy() {
        return restartPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRestartPolicy(ProviderContinuationV1Contract.RestartPolicy restartPolicy) {
        this.restartPolicy = restartPolicy;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ProviderContinuationV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("bindingDigest");
        sb.append('=');
        sb.append(((this.bindingDigest == null)?"<null>":this.bindingDigest));
        sb.append(',');
        sb.append("encryptedBinding");
        sb.append('=');
        sb.append(((this.encryptedBinding == null)?"<null>":this.encryptedBinding));
        sb.append(',');
        sb.append("expiresAt");
        sb.append('=');
        sb.append(((this.expiresAt == null)?"<null>":this.expiresAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("provider");
        sb.append('=');
        sb.append(((this.provider == null)?"<null>":this.provider));
        sb.append(',');
        sb.append("restartPolicy");
        sb.append('=');
        sb.append(((this.restartPolicy == null)?"<null>":this.restartPolicy));
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
        result = ((result* 31)+((this.provider == null)? 0 :this.provider.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.encryptedBinding == null)? 0 :this.encryptedBinding.hashCode()));
        result = ((result* 31)+((this.bindingDigest == null)? 0 :this.bindingDigest.hashCode()));
        result = ((result* 31)+((this.restartPolicy == null)? 0 :this.restartPolicy.hashCode()));
        result = ((result* 31)+((this.expiresAt == null)? 0 :this.expiresAt.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ProviderContinuationV1Contract) == false) {
            return false;
        }
        ProviderContinuationV1Contract rhs = ((ProviderContinuationV1Contract) other);
        return ((((((((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion)))&&((this.provider == rhs.provider)||((this.provider!= null)&&this.provider.equals(rhs.provider))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.encryptedBinding == rhs.encryptedBinding)||((this.encryptedBinding!= null)&&this.encryptedBinding.equals(rhs.encryptedBinding))))&&((this.bindingDigest == rhs.bindingDigest)||((this.bindingDigest!= null)&&this.bindingDigest.equals(rhs.bindingDigest))))&&((this.restartPolicy == rhs.restartPolicy)||((this.restartPolicy!= null)&&this.restartPolicy.equals(rhs.restartPolicy))))&&((this.expiresAt == rhs.expiresAt)||((this.expiresAt!= null)&&this.expiresAt.equals(rhs.expiresAt))));
    }

    public enum RestartPolicy {

        RESUME_IF_VALID("resume-if-valid"),
        RESTART_STAGE("restart-stage"),
        RESTART_RUN("restart-run");
        private final String value;
        private final static Map<String, ProviderContinuationV1Contract.RestartPolicy> CONSTANTS = new HashMap<String, ProviderContinuationV1Contract.RestartPolicy>();

        static {
            for (ProviderContinuationV1Contract.RestartPolicy c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        RestartPolicy(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static ProviderContinuationV1Contract.RestartPolicy fromValue(String value) {
            ProviderContinuationV1Contract.RestartPolicy constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
