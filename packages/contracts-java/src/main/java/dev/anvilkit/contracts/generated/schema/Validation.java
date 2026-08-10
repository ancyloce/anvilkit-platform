
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Validation {

    /**
     * 
     * (Required)
     * 
     */
    private List<Check> checks = new ArrayList<Check>();
    /**
     * 
     * (Required)
     * 
     */
    private Date validatedAt;

    /**
     * 
     * (Required)
     * 
     */
    public List<Check> getChecks() {
        return checks;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setChecks(List<Check> checks) {
        this.checks = checks;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getValidatedAt() {
        return validatedAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setValidatedAt(Date validatedAt) {
        this.validatedAt = validatedAt;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Validation.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("checks");
        sb.append('=');
        sb.append(((this.checks == null)?"<null>":this.checks));
        sb.append(',');
        sb.append("validatedAt");
        sb.append('=');
        sb.append(((this.validatedAt == null)?"<null>":this.validatedAt));
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
        result = ((result* 31)+((this.validatedAt == null)? 0 :this.validatedAt.hashCode()));
        result = ((result* 31)+((this.checks == null)? 0 :this.checks.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Validation) == false) {
            return false;
        }
        Validation rhs = ((Validation) other);
        return (((this.validatedAt == rhs.validatedAt)||((this.validatedAt!= null)&&this.validatedAt.equals(rhs.validatedAt)))&&((this.checks == rhs.checks)||((this.checks!= null)&&this.checks.equals(rhs.checks))));
    }

}
