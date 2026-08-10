
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.List;


/**
 * ComponentPackageSpecV1 contract
 * <p>
 * Bounded ComponentPackageSpecV1 wire contract governed by PRD 0012.
 * 
 */
public class ComponentPackageSpecV1Contract {

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
    private SharedPrimitivesV1PolicyReference buildPolicy;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1PolicyReference certificationPolicy;
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
    private List<Output> outputs = new ArrayList<Output>();
    /**
     * 
     * (Required)
     * 
     */
    private PackageIntent packageIntent;
    /**
     * 
     * (Required)
     * 
     */
    private List<SharedPrimitivesV1PolicyReference> validationConstraints = new ArrayList<SharedPrimitivesV1PolicyReference>();

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
    public SharedPrimitivesV1PolicyReference getBuildPolicy() {
        return buildPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setBuildPolicy(SharedPrimitivesV1PolicyReference buildPolicy) {
        this.buildPolicy = buildPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1PolicyReference getCertificationPolicy() {
        return certificationPolicy;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCertificationPolicy(SharedPrimitivesV1PolicyReference certificationPolicy) {
        this.certificationPolicy = certificationPolicy;
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
    public List<Output> getOutputs() {
        return outputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setOutputs(List<Output> outputs) {
        this.outputs = outputs;
    }

    /**
     * 
     * (Required)
     * 
     */
    public PackageIntent getPackageIntent() {
        return packageIntent;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setPackageIntent(PackageIntent packageIntent) {
        this.packageIntent = packageIntent;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1PolicyReference> getValidationConstraints() {
        return validationConstraints;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setValidationConstraints(List<SharedPrimitivesV1PolicyReference> validationConstraints) {
        this.validationConstraints = validationConstraints;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ComponentPackageSpecV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("buildPolicy");
        sb.append('=');
        sb.append(((this.buildPolicy == null)?"<null>":this.buildPolicy));
        sb.append(',');
        sb.append("certificationPolicy");
        sb.append('=');
        sb.append(((this.certificationPolicy == null)?"<null>":this.certificationPolicy));
        sb.append(',');
        sb.append("inputs");
        sb.append('=');
        sb.append(((this.inputs == null)?"<null>":this.inputs));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("outputs");
        sb.append('=');
        sb.append(((this.outputs == null)?"<null>":this.outputs));
        sb.append(',');
        sb.append("packageIntent");
        sb.append('=');
        sb.append(((this.packageIntent == null)?"<null>":this.packageIntent));
        sb.append(',');
        sb.append("validationConstraints");
        sb.append('=');
        sb.append(((this.validationConstraints == null)?"<null>":this.validationConstraints));
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
        result = ((result* 31)+((this.certificationPolicy == null)? 0 :this.certificationPolicy.hashCode()));
        result = ((result* 31)+((this.validationConstraints == null)? 0 :this.validationConstraints.hashCode()));
        result = ((result* 31)+((this.inputs == null)? 0 :this.inputs.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.packageIntent == null)? 0 :this.packageIntent.hashCode()));
        result = ((result* 31)+((this.buildPolicy == null)? 0 :this.buildPolicy.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ComponentPackageSpecV1Contract) == false) {
            return false;
        }
        ComponentPackageSpecV1Contract rhs = ((ComponentPackageSpecV1Contract) other);
        return (((((((((this.outputs == rhs.outputs)||((this.outputs!= null)&&this.outputs.equals(rhs.outputs)))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.certificationPolicy == rhs.certificationPolicy)||((this.certificationPolicy!= null)&&this.certificationPolicy.equals(rhs.certificationPolicy))))&&((this.validationConstraints == rhs.validationConstraints)||((this.validationConstraints!= null)&&this.validationConstraints.equals(rhs.validationConstraints))))&&((this.inputs == rhs.inputs)||((this.inputs!= null)&&this.inputs.equals(rhs.inputs))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.packageIntent == rhs.packageIntent)||((this.packageIntent!= null)&&this.packageIntent.equals(rhs.packageIntent))))&&((this.buildPolicy == rhs.buildPolicy)||((this.buildPolicy!= null)&&this.buildPolicy.equals(rhs.buildPolicy))));
    }

}
