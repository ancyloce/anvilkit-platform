
package dev.anvilkit.contracts.generated.schema;



/**
 * AnvilKit Agent shared primitives v1
 * <p>
 * Bounded reusable wire primitives for the Agent contract catalog.
 * 
 */
public class AnvilKitAgentSharedPrimitivesV1 {

    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1DefinitionSet $defs;

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1DefinitionSet get$defs() {
        return $defs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void set$defs(SharedPrimitivesV1DefinitionSet $defs) {
        this.$defs = $defs;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AnvilKitAgentSharedPrimitivesV1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("$defs");
        sb.append('=');
        sb.append(((this.$defs == null)?"<null>":this.$defs));
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
        result = ((result* 31)+((this.$defs == null)? 0 :this.$defs.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AnvilKitAgentSharedPrimitivesV1) == false) {
            return false;
        }
        AnvilKitAgentSharedPrimitivesV1 rhs = ((AnvilKitAgentSharedPrimitivesV1) other);
        return ((this.$defs == rhs.$defs)||((this.$defs!= null)&&this.$defs.equals(rhs.$defs)));
    }

}
