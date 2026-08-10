
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1Idempotency {

    /**
     * 
     * (Required)
     * 
     */
    private String canonicalRequestDigest;
    /**
     * 
     * (Required)
     * 
     */
    private String key;
    /**
     * 
     * (Required)
     * 
     */
    private String scope;

    /**
     * 
     * (Required)
     * 
     */
    public String getCanonicalRequestDigest() {
        return canonicalRequestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCanonicalRequestDigest(String canonicalRequestDigest) {
        this.canonicalRequestDigest = canonicalRequestDigest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getKey() {
        return key;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKey(String key) {
        this.key = key;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getScope() {
        return scope;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setScope(String scope) {
        this.scope = scope;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1Idempotency.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("canonicalRequestDigest");
        sb.append('=');
        sb.append(((this.canonicalRequestDigest == null)?"<null>":this.canonicalRequestDigest));
        sb.append(',');
        sb.append("key");
        sb.append('=');
        sb.append(((this.key == null)?"<null>":this.key));
        sb.append(',');
        sb.append("scope");
        sb.append('=');
        sb.append(((this.scope == null)?"<null>":this.scope));
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
        result = ((result* 31)+((this.canonicalRequestDigest == null)? 0 :this.canonicalRequestDigest.hashCode()));
        result = ((result* 31)+((this.key == null)? 0 :this.key.hashCode()));
        result = ((result* 31)+((this.scope == null)? 0 :this.scope.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1Idempotency) == false) {
            return false;
        }
        SharedPrimitivesV1Idempotency rhs = ((SharedPrimitivesV1Idempotency) other);
        return ((((this.canonicalRequestDigest == rhs.canonicalRequestDigest)||((this.canonicalRequestDigest!= null)&&this.canonicalRequestDigest.equals(rhs.canonicalRequestDigest)))&&((this.key == rhs.key)||((this.key!= null)&&this.key.equals(rhs.key))))&&((this.scope == rhs.scope)||((this.scope!= null)&&this.scope.equals(rhs.scope))));
    }

}
