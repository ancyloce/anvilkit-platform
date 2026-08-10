
package dev.anvilkit.contracts.generated.schema;


public class FieldError {

    /**
     * 
     * (Required)
     * 
     */
    private String code;
    /**
     * 
     * (Required)
     * 
     */
    private String instancePath;
    /**
     * 
     * (Required)
     * 
     */
    private String message;
    /**
     * 
     * (Required)
     * 
     */
    private String schemaPath;

    /**
     * 
     * (Required)
     * 
     */
    public String getCode() {
        return code;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCode(String code) {
        this.code = code;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getInstancePath() {
        return instancePath;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setInstancePath(String instancePath) {
        this.instancePath = instancePath;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getMessage() {
        return message;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getSchemaPath() {
        return schemaPath;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSchemaPath(String schemaPath) {
        this.schemaPath = schemaPath;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(FieldError.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("code");
        sb.append('=');
        sb.append(((this.code == null)?"<null>":this.code));
        sb.append(',');
        sb.append("instancePath");
        sb.append('=');
        sb.append(((this.instancePath == null)?"<null>":this.instancePath));
        sb.append(',');
        sb.append("message");
        sb.append('=');
        sb.append(((this.message == null)?"<null>":this.message));
        sb.append(',');
        sb.append("schemaPath");
        sb.append('=');
        sb.append(((this.schemaPath == null)?"<null>":this.schemaPath));
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
        result = ((result* 31)+((this.code == null)? 0 :this.code.hashCode()));
        result = ((result* 31)+((this.instancePath == null)? 0 :this.instancePath.hashCode()));
        result = ((result* 31)+((this.message == null)? 0 :this.message.hashCode()));
        result = ((result* 31)+((this.schemaPath == null)? 0 :this.schemaPath.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof FieldError) == false) {
            return false;
        }
        FieldError rhs = ((FieldError) other);
        return (((((this.code == rhs.code)||((this.code!= null)&&this.code.equals(rhs.code)))&&((this.instancePath == rhs.instancePath)||((this.instancePath!= null)&&this.instancePath.equals(rhs.instancePath))))&&((this.message == rhs.message)||((this.message!= null)&&this.message.equals(rhs.message))))&&((this.schemaPath == rhs.schemaPath)||((this.schemaPath!= null)&&this.schemaPath.equals(rhs.schemaPath))));
    }

}
