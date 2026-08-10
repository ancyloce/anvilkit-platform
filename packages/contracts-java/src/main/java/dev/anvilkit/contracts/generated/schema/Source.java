
package dev.anvilkit.contracts.generated.schema;


public class Source {

    /**
     * 
     * (Required)
     * 
     */
    private String buildIdentity;
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
    public String getBuildIdentity() {
        return buildIdentity;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBuildIdentity(String buildIdentity) {
        this.buildIdentity = buildIdentity;
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

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Source.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("buildIdentity");
        sb.append('=');
        sb.append(((this.buildIdentity == null)?"<null>":this.buildIdentity));
        sb.append(',');
        sb.append("provider");
        sb.append('=');
        sb.append(((this.provider == null)?"<null>":this.provider));
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
        result = ((result* 31)+((this.buildIdentity == null)? 0 :this.buildIdentity.hashCode()));
        result = ((result* 31)+((this.provider == null)? 0 :this.provider.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Source) == false) {
            return false;
        }
        Source rhs = ((Source) other);
        return (((this.buildIdentity == rhs.buildIdentity)||((this.buildIdentity!= null)&&this.buildIdentity.equals(rhs.buildIdentity)))&&((this.provider == rhs.provider)||((this.provider!= null)&&this.provider.equals(rhs.provider))));
    }

}
