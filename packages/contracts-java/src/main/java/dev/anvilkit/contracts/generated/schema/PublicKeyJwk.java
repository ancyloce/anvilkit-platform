
package dev.anvilkit.contracts.generated.schema;


public class PublicKeyJwk {

    /**
     * 
     * (Required)
     * 
     */
    private Object crv;
    /**
     * 
     * (Required)
     * 
     */
    private Object kty;
    /**
     * 
     * (Required)
     * 
     */
    private String x;

    /**
     * 
     * (Required)
     * 
     */
    public Object getCrv() {
        return crv;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCrv(Object crv) {
        this.crv = crv;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Object getKty() {
        return kty;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKty(Object kty) {
        this.kty = kty;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getX() {
        return x;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setX(String x) {
        this.x = x;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(PublicKeyJwk.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("crv");
        sb.append('=');
        sb.append(((this.crv == null)?"<null>":this.crv));
        sb.append(',');
        sb.append("kty");
        sb.append('=');
        sb.append(((this.kty == null)?"<null>":this.kty));
        sb.append(',');
        sb.append("x");
        sb.append('=');
        sb.append(((this.x == null)?"<null>":this.x));
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
        result = ((result* 31)+((this.x == null)? 0 :this.x.hashCode()));
        result = ((result* 31)+((this.kty == null)? 0 :this.kty.hashCode()));
        result = ((result* 31)+((this.crv == null)? 0 :this.crv.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof PublicKeyJwk) == false) {
            return false;
        }
        PublicKeyJwk rhs = ((PublicKeyJwk) other);
        return ((((this.x == rhs.x)||((this.x!= null)&&this.x.equals(rhs.x)))&&((this.kty == rhs.kty)||((this.kty!= null)&&this.kty.equals(rhs.kty))))&&((this.crv == rhs.crv)||((this.crv!= null)&&this.crv.equals(rhs.crv))));
    }

}
