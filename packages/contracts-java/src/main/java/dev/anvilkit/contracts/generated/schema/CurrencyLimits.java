
package dev.anvilkit.contracts.generated.schema;


public class CurrencyLimits {

    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1Cost maximumCost;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1Cost reservedCost;

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1Cost getMaximumCost() {
        return maximumCost;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMaximumCost(SharedPrimitivesV1Cost maximumCost) {
        this.maximumCost = maximumCost;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1Cost getReservedCost() {
        return reservedCost;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReservedCost(SharedPrimitivesV1Cost reservedCost) {
        this.reservedCost = reservedCost;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(CurrencyLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("maximumCost");
        sb.append('=');
        sb.append(((this.maximumCost == null)?"<null>":this.maximumCost));
        sb.append(',');
        sb.append("reservedCost");
        sb.append('=');
        sb.append(((this.reservedCost == null)?"<null>":this.reservedCost));
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
        result = ((result* 31)+((this.maximumCost == null)? 0 :this.maximumCost.hashCode()));
        result = ((result* 31)+((this.reservedCost == null)? 0 :this.reservedCost.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof CurrencyLimits) == false) {
            return false;
        }
        CurrencyLimits rhs = ((CurrencyLimits) other);
        return (((this.maximumCost == rhs.maximumCost)||((this.maximumCost!= null)&&this.maximumCost.equals(rhs.maximumCost)))&&((this.reservedCost == rhs.reservedCost)||((this.reservedCost!= null)&&this.reservedCost.equals(rhs.reservedCost))));
    }

}
