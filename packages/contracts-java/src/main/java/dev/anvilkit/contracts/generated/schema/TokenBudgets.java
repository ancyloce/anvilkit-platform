
package dev.anvilkit.contracts.generated.schema;


public class TokenBudgets {

    /**
     * 
     * (Required)
     * 
     */
    private Long memory;
    /**
     * 
     * (Required)
     * 
     */
    private Long system;
    /**
     * 
     * (Required)
     * 
     */
    private Long tools;
    /**
     * 
     * (Required)
     * 
     */
    private Long total;
    /**
     * 
     * (Required)
     * 
     */
    private Long user;

    /**
     * 
     * (Required)
     * 
     */
    public Long getMemory() {
        return memory;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMemory(Long memory) {
        this.memory = memory;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getSystem() {
        return system;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSystem(Long system) {
        this.system = system;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getTools() {
        return tools;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTools(Long tools) {
        this.tools = tools;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getTotal() {
        return total;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTotal(Long total) {
        this.total = total;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getUser() {
        return user;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setUser(Long user) {
        this.user = user;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(TokenBudgets.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("memory");
        sb.append('=');
        sb.append(((this.memory == null)?"<null>":this.memory));
        sb.append(',');
        sb.append("system");
        sb.append('=');
        sb.append(((this.system == null)?"<null>":this.system));
        sb.append(',');
        sb.append("tools");
        sb.append('=');
        sb.append(((this.tools == null)?"<null>":this.tools));
        sb.append(',');
        sb.append("total");
        sb.append('=');
        sb.append(((this.total == null)?"<null>":this.total));
        sb.append(',');
        sb.append("user");
        sb.append('=');
        sb.append(((this.user == null)?"<null>":this.user));
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
        result = ((result* 31)+((this.total == null)? 0 :this.total.hashCode()));
        result = ((result* 31)+((this.memory == null)? 0 :this.memory.hashCode()));
        result = ((result* 31)+((this.system == null)? 0 :this.system.hashCode()));
        result = ((result* 31)+((this.tools == null)? 0 :this.tools.hashCode()));
        result = ((result* 31)+((this.user == null)? 0 :this.user.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof TokenBudgets) == false) {
            return false;
        }
        TokenBudgets rhs = ((TokenBudgets) other);
        return ((((((this.total == rhs.total)||((this.total!= null)&&this.total.equals(rhs.total)))&&((this.memory == rhs.memory)||((this.memory!= null)&&this.memory.equals(rhs.memory))))&&((this.system == rhs.system)||((this.system!= null)&&this.system.equals(rhs.system))))&&((this.tools == rhs.tools)||((this.tools!= null)&&this.tools.equals(rhs.tools))))&&((this.user == rhs.user)||((this.user!= null)&&this.user.equals(rhs.user))));
    }

}
