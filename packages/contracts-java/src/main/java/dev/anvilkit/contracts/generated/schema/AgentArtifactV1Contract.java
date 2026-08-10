
package dev.anvilkit.contracts.generated.schema;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * AgentArtifactV1 contract
 * <p>
 * Bounded AgentArtifactV1 wire contract governed by PRD 0012.
 * 
 */
public class AgentArtifactV1Contract {

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
    private String artifactId;
    /**
     * 
     * (Required)
     * 
     */
    private Object contractType;
    /**
     * 
     * (Required)
     * 
     */
    private Date createdAt;
    /**
     * 
     * (Required)
     * 
     */
    private String digest;
    /**
     * 
     * (Required)
     * 
     */
    private AgentArtifactV1Contract.Kind kind;
    /**
     * 
     * (Required)
     * 
     */
    private AgentArtifactV1Contract.Lifecycle lifecycle;
    /**
     * 
     * (Required)
     * 
     */
    private List<SharedPrimitivesV1ArtifactReference> lineage = new ArrayList<SharedPrimitivesV1ArtifactReference>();
    /**
     * 
     * (Required)
     * 
     */
    private Producer producer;
    /**
     * 
     * (Required)
     * 
     */
    private Reference reference;
    /**
     * 
     * (Required)
     * 
     */
    private SharedPrimitivesV1SchemaReference schema;
    /**
     * 
     * (Required)
     * 
     */
    private Validation validation;

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
    public String getArtifactId() {
        return artifactId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setArtifactId(String artifactId) {
        this.artifactId = artifactId;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Object getContractType() {
        return contractType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setContractType(Object contractType) {
        this.contractType = contractType;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Date getCreatedAt() {
        return createdAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * 
     * (Required)
     * 
     */
    public String getDigest() {
        return digest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setDigest(String digest) {
        this.digest = digest;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentArtifactV1Contract.Kind getKind() {
        return kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setKind(AgentArtifactV1Contract.Kind kind) {
        this.kind = kind;
    }

    /**
     * 
     * (Required)
     * 
     */
    public AgentArtifactV1Contract.Lifecycle getLifecycle() {
        return lifecycle;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLifecycle(AgentArtifactV1Contract.Lifecycle lifecycle) {
        this.lifecycle = lifecycle;
    }

    /**
     * 
     * (Required)
     * 
     */
    public List<SharedPrimitivesV1ArtifactReference> getLineage() {
        return lineage;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setLineage(List<SharedPrimitivesV1ArtifactReference> lineage) {
        this.lineage = lineage;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Producer getProducer() {
        return producer;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setProducer(Producer producer) {
        this.producer = producer;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Reference getReference() {
        return reference;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setReference(Reference reference) {
        this.reference = reference;
    }

    /**
     * 
     * (Required)
     * 
     */
    public SharedPrimitivesV1SchemaReference getSchema() {
        return schema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setSchema(SharedPrimitivesV1SchemaReference schema) {
        this.schema = schema;
    }

    /**
     * 
     * (Required)
     * 
     */
    public Validation getValidation() {
        return validation;
    }

    /**
     * 
     * (Required)
     * 
     */
    public void setValidation(Validation validation) {
        this.validation = validation;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(AgentArtifactV1Contract.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("apiVersion");
        sb.append('=');
        sb.append(((this.apiVersion == null)?"<null>":this.apiVersion));
        sb.append(',');
        sb.append("artifactId");
        sb.append('=');
        sb.append(((this.artifactId == null)?"<null>":this.artifactId));
        sb.append(',');
        sb.append("contractType");
        sb.append('=');
        sb.append(((this.contractType == null)?"<null>":this.contractType));
        sb.append(',');
        sb.append("createdAt");
        sb.append('=');
        sb.append(((this.createdAt == null)?"<null>":this.createdAt));
        sb.append(',');
        sb.append("digest");
        sb.append('=');
        sb.append(((this.digest == null)?"<null>":this.digest));
        sb.append(',');
        sb.append("kind");
        sb.append('=');
        sb.append(((this.kind == null)?"<null>":this.kind));
        sb.append(',');
        sb.append("lifecycle");
        sb.append('=');
        sb.append(((this.lifecycle == null)?"<null>":this.lifecycle));
        sb.append(',');
        sb.append("lineage");
        sb.append('=');
        sb.append(((this.lineage == null)?"<null>":this.lineage));
        sb.append(',');
        sb.append("producer");
        sb.append('=');
        sb.append(((this.producer == null)?"<null>":this.producer));
        sb.append(',');
        sb.append("reference");
        sb.append('=');
        sb.append(((this.reference == null)?"<null>":this.reference));
        sb.append(',');
        sb.append("schema");
        sb.append('=');
        sb.append(((this.schema == null)?"<null>":this.schema));
        sb.append(',');
        sb.append("validation");
        sb.append('=');
        sb.append(((this.validation == null)?"<null>":this.validation));
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
        result = ((result* 31)+((this.lineage == null)? 0 :this.lineage.hashCode()));
        result = ((result* 31)+((this.schema == null)? 0 :this.schema.hashCode()));
        result = ((result* 31)+((this.contractType == null)? 0 :this.contractType.hashCode()));
        result = ((result* 31)+((this.kind == null)? 0 :this.kind.hashCode()));
        result = ((result* 31)+((this.lifecycle == null)? 0 :this.lifecycle.hashCode()));
        result = ((result* 31)+((this.reference == null)? 0 :this.reference.hashCode()));
        result = ((result* 31)+((this.createdAt == null)? 0 :this.createdAt.hashCode()));
        result = ((result* 31)+((this.apiVersion == null)? 0 :this.apiVersion.hashCode()));
        result = ((result* 31)+((this.digest == null)? 0 :this.digest.hashCode()));
        result = ((result* 31)+((this.producer == null)? 0 :this.producer.hashCode()));
        result = ((result* 31)+((this.artifactId == null)? 0 :this.artifactId.hashCode()));
        result = ((result* 31)+((this.validation == null)? 0 :this.validation.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof AgentArtifactV1Contract) == false) {
            return false;
        }
        AgentArtifactV1Contract rhs = ((AgentArtifactV1Contract) other);
        return (((((((((((((this.lineage == rhs.lineage)||((this.lineage!= null)&&this.lineage.equals(rhs.lineage)))&&((this.schema == rhs.schema)||((this.schema!= null)&&this.schema.equals(rhs.schema))))&&((this.contractType == rhs.contractType)||((this.contractType!= null)&&this.contractType.equals(rhs.contractType))))&&((this.kind == rhs.kind)||((this.kind!= null)&&this.kind.equals(rhs.kind))))&&((this.lifecycle == rhs.lifecycle)||((this.lifecycle!= null)&&this.lifecycle.equals(rhs.lifecycle))))&&((this.reference == rhs.reference)||((this.reference!= null)&&this.reference.equals(rhs.reference))))&&((this.createdAt == rhs.createdAt)||((this.createdAt!= null)&&this.createdAt.equals(rhs.createdAt))))&&((this.apiVersion == rhs.apiVersion)||((this.apiVersion!= null)&&this.apiVersion.equals(rhs.apiVersion))))&&((this.digest == rhs.digest)||((this.digest!= null)&&this.digest.equals(rhs.digest))))&&((this.producer == rhs.producer)||((this.producer!= null)&&this.producer.equals(rhs.producer))))&&((this.artifactId == rhs.artifactId)||((this.artifactId!= null)&&this.artifactId.equals(rhs.artifactId))))&&((this.validation == rhs.validation)||((this.validation!= null)&&this.validation.equals(rhs.validation))));
    }

    public enum Kind {

        COMPILED_CONTEXT("compiled-context"),
        TARGET_SNAPSHOT("target-snapshot"),
        AGENT_PLAN("agent-plan"),
        WORKER_RESULT("worker-result"),
        VALIDATION_REPORT("validation-report");
        private final String value;
        private final static Map<String, AgentArtifactV1Contract.Kind> CONSTANTS = new HashMap<String, AgentArtifactV1Contract.Kind>();

        static {
            for (AgentArtifactV1Contract.Kind c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Kind(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentArtifactV1Contract.Kind fromValue(String value) {
            AgentArtifactV1Contract.Kind constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum Lifecycle {

        PENDING("pending"),
        SCANNING("scanning"),
        VALID("valid"),
        FINALIZED("finalized"),
        COMMITTED("committed"),
        QUARANTINED("quarantined"),
        EXPIRED("expired"),
        DELETED("deleted");
        private final String value;
        private final static Map<String, AgentArtifactV1Contract.Lifecycle> CONSTANTS = new HashMap<String, AgentArtifactV1Contract.Lifecycle>();

        static {
            for (AgentArtifactV1Contract.Lifecycle c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        Lifecycle(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public String value() {
            return this.value;
        }

        public static AgentArtifactV1Contract.Lifecycle fromValue(String value) {
            AgentArtifactV1Contract.Lifecycle constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
