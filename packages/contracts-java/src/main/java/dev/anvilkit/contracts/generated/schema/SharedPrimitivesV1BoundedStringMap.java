
package dev.anvilkit.contracts.generated.schema;


public class SharedPrimitivesV1BoundedStringMap {


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(SharedPrimitivesV1BoundedStringMap.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof SharedPrimitivesV1BoundedStringMap) == false) {
            return false;
        }
        SharedPrimitivesV1BoundedStringMap rhs = ((SharedPrimitivesV1BoundedStringMap) other);
        return true;
    }

}
