
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.List;


/**
 * ImageOperationPlanV1 contract
 * <p>
 * Bounded ImageOperationPlanV1 wire contract governed by PRD 0012.
 * 
 */
public class ImageOperationPlanV1Contract {

    /**
     * 
     * (Required)
     * 
     */
    private Object apiVersion;
    /**
     * 
     * (Required)
     * 
     */
    private List<SharedPrimitivesV1ArtifactReference> inputs = new ArrayList<SharedPrimitivesV1ArtifactReference>();
    /**
     * 
     * (Required)
     * 
     */
    private Object kind;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1ResourceLimits limits;
    /**
     * 
     * (Required)
     * 
     */
    private List<Operation> operations = new ArrayList<Operation>();
    /**
     * 
     * (Required)
     * 
     */
    private List<Output__1> outputs = new ArrayList<Output__1>();
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference validationPolicy;

    /**
     * 
     * (Required)
     * 
     */
    public Object getApiVersion() {
        return apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setApiVersion(Object apiVersion) {
        this.apiVersion = apiVersion;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1ArtifactReference> getInputs() {
        return inputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setInputs(List<SharedPrimitivesV1ArtifactReference> inputs) {
        this.inputs = inputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Object getKind() {
        return kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKind(Object kind) {
        this.kind = kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1ResourceLimits getLimits() {
        return limits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLimits(SharedPrimitivesV1ResourceLimits limits) {
        this.limits = limits;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<Operation> getOperations() {
        return operations;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOperations(List<Operation> operations) {
        this.operations = operations;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<Output__1> getOutputs() {
        return outputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOutputs(List<Output__1> outputs) {
        this.outputs = outputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getValidationPolicy() {
        return validationPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setValidationPolicy(SharedPrimitivesV1PolicyReference validationPolicy) {
        this.validationPolicy = validationPolicy;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ImageOperationPlanV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("inputs");
        sb.append('=');
        sb.append(((this.inputs == null)?"<null>":this.inputs));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("limits");
        sb.append('=');
        sb.append(((this.limits == null)?"<null>":this.limits));
        sb.append(',');
        sb.append("operations");
        sb.append('=');
        sb.append(((this.operations == null)?"<null>":this.operations));
        sb.append(',');
        sb.append("outputs");
        sb.append('=');
        sb.append(((this.outputs == null)?"<null>":this.outputs));
        sb.append(',');
        sb.append("validationPolicy");
        sb.append('=');
        sb.append(((this.validationPolicy == null)?"<null>":this.validationPolicy));
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
        result = ((result* 31)+((this.outputs == null)? 0 :this.outputs.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.operations == null)? 0 :this.operations.hashCode()));
        result = ((result* 31)+((this.inputs == null)? 0 :this.inputs.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.limits == null)? 0 :this.limits.hashCode()));
        result = ((result* 31)+((this.validationPolicy == null)? 0 :this.validationPolicy.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ImageOperationPlanV1Contract) == false) {
            return false;
        }
        ImageOperationPlanV1Contract rhs = ((ImageOperationPlanV1Contract) other);
        return ((((((((this.outputs == rhs.outputs)||((this.outputs!= null)&&this.outputs.equals(rhs.outputs)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.operations == rhs.operations)||((this.operations!= null)&&this.operations.equals(rhs.operations))))&&((this.inputs == rhs.inputs)||((this.inputs!= null)&&this.inputs.equals(rhs.inputs))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.limits == rhs.limits)||((this.limits!= null)&&this.limits.equals(rhs.limits))))&&((this.validationPolicy == rhs.validationPolicy)||((this.validationPolicy!= null)&&this.validationPolicy.equals(rhs.validationPolicy))));
    }

}
