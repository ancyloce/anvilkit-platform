
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1PageInfo {

    /**
     * 
     * (Required)
     * 
     */
    private Boolean hasMore;
    /**
     * 
     * (Required)
     * 
     */
    private Integer limit;
    private String nextCursor;

    /**
     * 
     * (Required)
     * 
     */
    public Boolean getHasMore() {
        return hasMore;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setHasMore(Boolean hasMore) {
        this.hasMore = hasMore;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Integer getLimit() {
        return limit;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public String getNextCursor() {
        return nextCursor;
    }

    public void setNextCursor(String nextCursor) {
        this.nextCursor = nextCursor;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1PageInfo.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("hasMore");
        sb.append('=');
        sb.append(((this.hasMore == null)?"<null>":this.hasMore));
        sb.append(',');
        sb.append("limit");
        sb.append('=');
        sb.append(((this.limit == null)?"<null>":this.limit));
        sb.append(',');
        sb.append("nextCursor");
        sb.append('=');
        sb.append(((this.nextCursor == null)?"<null>":this.nextCursor));
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
        result = ((result* 31)+((this.hasMore == null)? 0 :this.hasMore.hashCode()));
        result = ((result* 31)+((this.limit == null)? 0 :this.limit.hashCode()));
        result = ((result* 31)+((this.nextCursor == null)? 0 :this.nextCursor.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1PageInfo) == false) {
            return false;
        }
        SharedPrimitivesV1PageInfo rhs = ((SharedPrimitivesV1PageInfo) other);
        return ((((this.hasMore == rhs.hasMore)||((this.hasMore!= null)&&this.hasMore.equals(rhs.hasMore)))&&((this.limit == rhs.limit)||((this.limit!= null)&&this.limit.equals(rhs.limit))))&&((this.nextCursor == rhs.nextCursor)||((this.nextCursor!= null)&&this.nextCursor.equals(rhs.nextCursor))));
    }

}
