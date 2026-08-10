
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;


/**
 * CompiledContextV1 contract
 * <p>
 * Bounded CompiledContextV1 wire contract governed by PRD 0012.
 * 
 */
public class CompiledContextV1Contract {

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
    private Set<Classification> classifications = new LinkedHashSet<Classification>();
    /**
     * 
     * (Required)
     * 
     */
    private Date compiledAt;
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
    private List<String> layerDigests = new ArrayList<String>();
    /**
     * 
     * (Required)
     * 
     */
    private List<OrderedTrustLayer> orderedTrustLayers = new ArrayList<OrderedTrustLayer>();
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference policySnapshot;
    /**
     * 
     * (Required)
     * 
     */
    private Redaction redaction;
    /**
     * 
     * (Required)
     * 
     */
    private TokenBudgets tokenBudgets;

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
    public Set<Classification> getClassifications() {
        return classifications;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setClassifications(Set<Classification> classifications) {
        this.classifications = classifications;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getCompiledAt() {
        return compiledAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCompiledAt(Date compiledAt) {
        this.compiledAt = compiledAt;
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
    public List<String> getLayerDigests() {
        return layerDigests;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLayerDigests(List<String> layerDigests) {
        this.layerDigests = layerDigests;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<OrderedTrustLayer> getOrderedTrustLayers() {
        return orderedTrustLayers;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOrderedTrustLayers(List<OrderedTrustLayer> orderedTrustLayers) {
        this.orderedTrustLayers = orderedTrustLayers;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getPolicySnapshot() {
        return policySnapshot;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPolicySnapshot(SharedPrimitivesV1PolicyReference policySnapshot) {
        this.policySnapshot = policySnapshot;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Redaction getRedaction() {
        return redaction;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setRedaction(Redaction redaction) {
        this.redaction = redaction;
    }

    /**
     * 
     * (Required)
     * 
     */
    public TokenBudgets getTokenBudgets() {
        return tokenBudgets;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTokenBudgets(TokenBudgets tokenBudgets) {
        this.tokenBudgets = tokenBudgets;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(CompiledContextV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("classifications");
        sb.append('=');
        sb.append(((this.classifications == null)?"<null>":this.classifications));
        sb.append(',');
        sb.append("compiledAt");
        sb.append('=');
        sb.append(((this.compiledAt == null)?"<null>":this.compiledAt));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("layerDigests");
        sb.append('=');
        sb.append(((this.layerDigests == null)?"<null>":this.layerDigests));
        sb.append(',');
        sb.append("orderedTrustLayers");
        sb.append('=');
        sb.append(((this.orderedTrustLayers == null)?"<null>":this.orderedTrustLayers));
        sb.append(',');
        sb.append("policySnapshot");
        sb.append('=');
        sb.append(((this.policySnapshot == null)?"<null>":this.policySnapshot));
        sb.append(',');
        sb.append("redaction");
        sb.append('=');
        sb.append(((this.redaction == null)?"<null>":this.redaction));
        sb.append(',');
        sb.append("tokenBudgets");
        sb.append('=');
        sb.append(((this.tokenBudgets == null)?"<null>":this.tokenBudgets));
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
        result = ((result* 31)+((this.classifications == null)? 0 :this.classifications.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.orderedTrustLayers == null)? 0 :this.orderedTrustLayers.hashCode()));
        result = ((result* 31)+((this.redaction == null)? 0 :this.redaction.hashCode()));
        result = ((result* 31)+((this.tokenBudgets == null)? 0 :this.tokenBudgets.hashCode()));
        result = ((result* 31)+((this.layerDigests == null)? 0 :this.layerDigests.hashCode()));
        result = ((result* 31)+((this.policySnapshot == null)? 0 :this.policySnapshot.hashCode()));
        result = ((result* 31)+((this.compiledAt == null)? 0 :this.compiledAt.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof CompiledContextV1Contract) == false) {
            return false;
        }
        CompiledContextV1Contract rhs = ((CompiledContextV1Contract) other);
        return ((((((((((this.classifications == rhs.classifications)||((this.classifications!= null)&&this.classifications.equals(rhs.classifications)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.orderedTrustLayers == rhs.orderedTrustLayers)||((this.orderedTrustLayers!= null)&&this.orderedTrustLayers.equals(rhs.orderedTrustLayers))))&&((this.redaction == rhs.redaction)||((this.redaction!= null)&&this.redaction.equals(rhs.redaction))))&&((this.tokenBudgets == rhs.tokenBudgets)||((this.tokenBudgets!= null)&&this.tokenBudgets.equals(rhs.tokenBudgets))))&&((this.layerDigests == rhs.layerDigests)||((this.layerDigests!= null)&&this.layerDigests.equals(rhs.layerDigests))))&&((this.policySnapshot == rhs.policySnapshot)||((this.policySnapshot!= null)&&this.policySnapshot.equals(rhs.policySnapshot))))&&((this.compiledAt == rhs.compiledAt)||((this.compiledAt!= null)&&this.compiledAt.equals(rhs.compiledAt))));
    }

}
