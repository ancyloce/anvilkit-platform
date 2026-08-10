
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1Cost {

    /**
     * 
     * (Required)
     * 
     */
    private String amount;
    /**
     * 
     * (Required)
     * 
     */
    private String currency;

    /**
     * 
     * (Required)
     * 
     */
    public String getAmount() {
        return amount;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setAmount(String amount) {
        this.amount = amount;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1Cost.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("amount");
        sb.append('=');
        sb.append(((this.amount == null)?"<null>":this.amount));
        sb.append(',');
        sb.append("currency");
        sb.append('=');
        sb.append(((this.currency == null)?"<null>":this.currency));
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
        result = ((result* 31)+((this.amount == null)? 0 :this.amount.hashCode()));
        result = ((result* 31)+((this.currency == null)? 0 :this.currency.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1Cost) == false) {
            return false;
        }
        SharedPrimitivesV1Cost rhs = ((SharedPrimitivesV1Cost) other);
        return (((this.amount == rhs.amount)||((this.amount!= null)&&this.amount.equals(rhs.amount)))&&((this.currency == rhs.currency)||((this.currency!= null)&&this.currency.equals(rhs.currency))));
    }

}
