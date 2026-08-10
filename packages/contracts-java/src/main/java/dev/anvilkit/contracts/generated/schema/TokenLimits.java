
package dev.anvilkit.contracts.generated.schema;


public class TokenLimits {

    /**
     * 
     * (Required)
     * 
     */
    private Long inputTokens;
    /**
     * 
     * (Required)
     * 
     */
    private Long outputTokens;
    /**
     * 
     * (Required)
     * 
     */
    private Long totalTokens;

    /**
     * 
     * (Required)
     * 
     */
    public Long getInputTokens() {
        return inputTokens;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setInputTokens(Long inputTokens) {
        this.inputTokens = inputTokens;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getOutputTokens() {
        return outputTokens;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOutputTokens(Long outputTokens) {
        this.outputTokens = outputTokens;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Long getTotalTokens() {
        return totalTokens;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setTotalTokens(Long totalTokens) {
        this.totalTokens = totalTokens;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(TokenLimits.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("inputTokens");
        sb.append('=');
        sb.append(((this.inputTokens == null)?"<null>":this.inputTokens));
        sb.append(',');
        sb.append("outputTokens");
        sb.append('=');
        sb.append(((this.outputTokens == null)?"<null>":this.outputTokens));
        sb.append(',');
        sb.append("totalTokens");
        sb.append('=');
        sb.append(((this.totalTokens == null)?"<null>":this.totalTokens));
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
        result = ((result* 31)+((this.inputTokens == null)? 0 :this.inputTokens.hashCode()));
        result = ((result* 31)+((this.outputTokens == null)? 0 :this.outputTokens.hashCode()));
        result = ((result* 31)+((this.totalTokens == null)? 0 :this.totalTokens.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof TokenLimits) == false) {
            return false;
        }
        TokenLimits rhs = ((TokenLimits) other);
        return ((((this.inputTokens == rhs.inputTokens)||((this.inputTokens!= null)&&this.inputTokens.equals(rhs.inputTokens)))&&((this.outputTokens == rhs.outputTokens)||((this.outputTokens!= null)&&this.outputTokens.equals(rhs.outputTokens))))&&((this.totalTokens == rhs.totalTokens)||((this.totalTokens!= null)&&this.totalTokens.equals(rhs.totalTokens))));
    }

}
