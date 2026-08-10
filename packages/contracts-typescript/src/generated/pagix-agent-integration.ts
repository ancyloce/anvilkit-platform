export interface paths {
    readonly "/v1/internal/agent/assets/finalization": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Finalize a validated immutable artifact. */
        readonly post: operations["finalizeAgentAsset"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/assets/reservations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reserve bounded artifact storage. */
        readonly post: operations["reserveAgentAsset"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/context-snapshots": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Return an authorized immutable target snapshot. */
        readonly post: operations["createTargetSnapshot"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/domain/page-persistence": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Atomically redeem authorization, persist the effect, idempotency record, and outbox event. */
        readonly post: operations["persistAuthorizedPage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/entitlements/check": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Check current permission and entitlement. */
        readonly post: operations["checkAgentEntitlement"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/usage/observations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Append usage from every physical attempt. */
        readonly post: operations["observeAgentUsage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/usage/reconciliation": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reconcile or release an authorized reservation. */
        readonly post: operations["reconcileAgentUsage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/v1/internal/agent/usage/reservations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reserve the pinned upper budget before dispatch. */
        readonly post: operations["reserveAgentUsage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AgentArtifactV1 contract
         * @description Bounded AgentArtifactV1 wire contract governed by PRD 0012.
         */
        readonly AgentArtifactV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly artifactId: components["schemas"]["SharedPrimitivesV1ArtifactId"];
            /** @constant */
            readonly contractType: "AgentArtifact";
            readonly createdAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly digest: components["schemas"]["SharedPrimitivesV1Digest"];
            /** @enum {unknown} */
            readonly kind: "compiled-context" | "target-snapshot" | "agent-plan" | "worker-result" | "validation-report";
            /** @enum {unknown} */
            readonly lifecycle: "pending" | "scanning" | "valid" | "finalized" | "committed" | "quarantined" | "expired" | "deleted";
            readonly lineage: readonly components["schemas"]["SharedPrimitivesV1ArtifactReference"][];
            readonly producer: {
                readonly executionGeneration: number;
                readonly leaseEpoch: number;
                readonly physicalAttemptId: components["schemas"]["SharedPrimitivesV1PhysicalAttemptId"];
                readonly recoveryEpoch: number;
                readonly taskId: components["schemas"]["SharedPrimitivesV1TaskId"];
            };
            readonly reference: {
                readonly bucket: string;
                readonly mediaType: string;
                readonly objectKey: string;
                readonly sizeBytes: number;
            };
            readonly schema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            readonly validation: {
                readonly checks: readonly {
                    readonly evidenceDigest: components["schemas"]["SharedPrimitivesV1Digest"];
                    readonly name: string;
                    /** @enum {unknown} */
                    readonly result: "passed" | "failed";
                }[];
                readonly validatedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            };
        };
        /**
         * AgentBudgetV1 contract
         * @description Bounded AgentBudgetV1 wire contract governed by PRD 0012.
         */
        readonly AgentBudgetV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly currencyLimits: {
                readonly maximumCost: components["schemas"]["SharedPrimitivesV1Cost"];
                readonly reservedCost: components["schemas"]["SharedPrimitivesV1Cost"];
            };
            /** @enum {unknown} */
            readonly exceedBehavior: "refuse" | "pause-for-approval" | "cancel";
            readonly gpuLimits: {
                readonly maximumGpuMilliseconds: number;
            };
            /** @constant */
            readonly kind: "AgentBudget";
            readonly modelLimits: {
                readonly maximumCalls: number;
                readonly maximumConcurrentCalls: number;
            };
            readonly policy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly reservationId: components["schemas"]["SharedPrimitivesV1ReservationId"];
            readonly tokenLimits: {
                readonly inputTokens: number;
                readonly outputTokens: number;
                readonly totalTokens: number;
            };
            readonly workerLimits: {
                readonly maximumAttempts: number;
                readonly maximumDurationMilliseconds: number;
            };
        };
        /**
         * AgentDefinitionV1 contract
         * @description Bounded AgentDefinitionV1 wire contract governed by PRD 0012.
         */
        readonly AgentDefinitionV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly definitionId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            /** @enum {unknown} */
            readonly domain: "platform-agent" | "pagix-page" | "contract-runtime";
            readonly evaluators: readonly components["schemas"]["SharedPrimitivesV1SchemaReference"][];
            readonly guardrailPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            /** @constant */
            readonly kind: "AgentDefinition";
            readonly memoryPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly modelPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly outputSchema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            readonly promptDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly stopConditions: readonly ("completed" | "refused" | "budget-exhausted" | "approval-required" | "input-required" | "policy-blocked")[];
            readonly toolProfile: {
                readonly maximumParallelTools: number;
                readonly tools: readonly components["schemas"]["SharedPrimitivesV1SchemaReference"][];
            };
            readonly turnLimit: number;
            readonly version: string;
        };
        /**
         * AgentEventV1 contract
         * @description Bounded AgentEventV1 wire contract governed by PRD 0012.
         */
        readonly AgentEventV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly artifactReference?: components["schemas"]["SharedPrimitivesV1ArtifactReference"];
            readonly contractBomReference: components["schemas"]["SharedPrimitivesV1ContractBomReferenceV1"];
            readonly eventId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            /** @enum {unknown} */
            readonly eventType: "run.created" | "run.state-changed" | "run.input-requested" | "run.approval-requested" | "run.artifact-available" | "run.problem-recorded";
            /** @constant */
            readonly kind: "AgentEvent";
            readonly occurredAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly payload?: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly sequence: number;
            readonly taskId?: components["schemas"]["SharedPrimitivesV1TaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesV1TraceContext"];
        };
        /**
         * AgentRunV1 contract
         * @description Bounded AgentRunV1 wire contract governed by PRD 0012.
         */
        readonly AgentRunV1: {
            readonly actorId: components["schemas"]["SharedPrimitivesV1ActorId"];
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly budget: components["schemas"]["AgentBudgetV1"];
            readonly contractBomReference: components["schemas"]["SharedPrimitivesV1ContractBomReferenceV1"];
            readonly createdAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @enum {unknown} */
            readonly domain: "platform-agent" | "pagix-page" | "contract-runtime";
            readonly executionGeneration: number;
            readonly idempotency: components["schemas"]["SharedPrimitivesV1Idempotency"];
            /** @constant */
            readonly kind: "AgentRun";
            /** @enum {unknown} */
            readonly operation: "page-change" | "artifact-validation" | "image-operation" | "component-package";
            readonly parentRunId?: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly policy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly problem?: components["schemas"]["ProblemDetailsV1"];
            readonly rootRunId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            /** @enum {unknown} */
            readonly status: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly target: components["schemas"]["SharedPrimitivesV1TargetReference"];
            readonly tenantId: components["schemas"]["SharedPrimitivesV1TenantId"];
            readonly updatedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesV1WorkspaceId"];
        };
        /**
         * AgentTaskV1 contract
         * @description Bounded AgentTaskV1 wire contract governed by PRD 0012.
         */
        readonly AgentTaskV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly artifactInputs: readonly components["schemas"]["SharedPrimitivesV1ArtifactReference"][];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            /** @enum {unknown} */
            readonly capabilityVersion: "provider.invoke/v1" | "contract.validate/v1" | "artifact.scan/v1" | "fake.execute/v1";
            readonly contractBomReference: components["schemas"]["SharedPrimitivesV1ContractBomReferenceV1"];
            readonly executionGeneration: number;
            readonly idempotency: components["schemas"]["SharedPrimitivesV1Idempotency"];
            readonly inputSchemaVersion: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            /** @constant */
            readonly kind: "AgentTask";
            readonly limits: components["schemas"]["SharedPrimitivesV1ResourceLimits"];
            readonly parameters: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            readonly resources: {
                readonly priority: number;
                /** @enum {unknown} */
                readonly resourceClass: "interactive-cpu" | "batch-cpu" | "interactive-gpu" | "batch-gpu";
            };
            readonly rootRunId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly taskId: components["schemas"]["SharedPrimitivesV1TaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesV1TraceContext"];
        };
        /**
         * ApplyAuthorizationV1 contract
         * @description Bounded ApplyAuthorizationV1 wire contract governed by PRD 0012.
         */
        readonly ApplyAuthorizationV1: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly actorId: components["schemas"]["SharedPrimitivesV1ActorId"];
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly approvalVersion: number;
            readonly artifactDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            /** @constant */
            readonly audience: "urn:anvilkit:audience:pagix";
            readonly authorizationId: components["schemas"]["SharedPrimitivesV1AuthorizationId"];
            readonly baseRevision: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly contractBomDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly expiresAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly issuedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly issuer: "urn:anvilkit:issuer:agent-service";
            readonly keyId: string;
            /** @constant */
            readonly kind: "ApplyAuthorization";
            readonly notBefore: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly policyDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly target: components["schemas"]["SharedPrimitivesV1TargetReference"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesV1WorkspaceId"];
        };
        /**
         * ApprovalRequestV1 contract
         * @description Bounded ApprovalRequestV1 wire contract governed by PRD 0012.
         */
        readonly ApprovalRequestV1: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly allowedDecisions: readonly ("approve" | "reject" | "request-changes")[];
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly cost: components["schemas"]["SharedPrimitivesV1Cost"];
            readonly decisionVersion: number;
            readonly effects: readonly {
                /** @enum {unknown} */
                readonly effectType: "artifact-finalize" | "page-persist" | "asset-finalize" | "component-apply" | "package-publish";
                readonly summary: string;
                readonly target: components["schemas"]["SharedPrimitivesV1TargetReference"];
            }[];
            readonly expiresAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly kind: "ApprovalRequest";
            readonly requestId: components["schemas"]["SharedPrimitivesV1RequestId"];
            /** @enum {unknown} */
            readonly resumeState: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly reviewerPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
        };
        readonly BoundedRequest: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
        /**
         * CompiledContextV1 contract
         * @description Bounded CompiledContextV1 wire contract governed by PRD 0012.
         */
        readonly CompiledContextV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly classifications: readonly ("public" | "internal" | "confidential" | "restricted")[];
            readonly compiledAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly kind: "CompiledContext";
            readonly layerDigests: readonly components["schemas"]["SharedPrimitivesV1Digest"][];
            readonly orderedTrustLayers: readonly {
                /** @enum {unknown} */
                readonly classification: "public" | "internal" | "confidential" | "restricted";
                readonly digest: components["schemas"]["SharedPrimitivesV1Digest"];
                readonly layerId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
                readonly position: number;
                readonly redacted: boolean;
                readonly tokenBudget: number;
            }[];
            readonly policySnapshot: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly redaction: {
                readonly policy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
                readonly removedFieldCount: number;
                readonly replacementMarker: string;
            };
            readonly tokenBudgets: {
                readonly memory: number;
                readonly system: number;
                readonly tools: number;
                readonly total: number;
                readonly user: number;
            };
        };
        /**
         * ComponentPackageSpecV1 contract
         * @description Bounded ComponentPackageSpecV1 wire contract governed by PRD 0012.
         */
        readonly ComponentPackageSpecV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly buildPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly certificationPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly inputs: readonly components["schemas"]["SharedPrimitivesV1ArtifactReference"][];
            /** @constant */
            readonly kind: "ComponentPackageSpec";
            readonly outputs: readonly {
                readonly maximumBytes: number;
                readonly name: string;
                readonly schema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            }[];
            readonly packageIntent: {
                /** @enum {unknown} */
                readonly componentType: "page-component" | "section" | "theme" | "package";
                readonly name: string;
                readonly version: string;
            };
            readonly validationConstraints: readonly components["schemas"]["SharedPrimitivesV1PolicyReference"][];
        };
        /**
         * ContractRevocationSnapshotV1 contract
         * @description Signed fail-closed key revocation snapshot with explicit freshness.
         */
        readonly ContractRevocationSnapshotV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            /** Format: date-time */
            readonly issuedAt: string;
            /** @constant */
            readonly kind: "ContractRevocationSnapshot";
            /** Format: date-time */
            readonly nextUpdate: string;
            readonly revokedKeys: readonly {
                /** Format: date-time */
                readonly effectiveAt: string;
                readonly keyId: string;
                readonly reason: string;
            }[];
            readonly snapshotId: string;
        };
        /**
         * ContractSignatureStatementV1 contract
         * @description Canonical context-bound statement carried by a standard single-signature DSSE envelope.
         */
        readonly ContractSignatureStatementV1: {
            /** @constant */
            readonly algorithm: "dsse-ed25519-v1";
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            /** @constant */
            readonly audience: "urn:anvilkit:audience:contract-consumers";
            readonly contractBomDigest: string;
            /** Format: date-time */
            readonly expiresAt: string;
            /** Format: date-time */
            readonly issuedAt: string;
            /** @constant */
            readonly issuer: "urn:anvilkit:issuer:contracts-release";
            readonly keyId: string;
            /** @constant */
            readonly kind: "ContractSignatureStatement";
            /** Format: date-time */
            readonly notBefore: string;
            readonly subject: {
                readonly digest: string;
                readonly mediaType: string;
                readonly purpose: string;
                readonly size: number;
            };
        };
        /**
         * ContractTrustRootV1 contract
         * @description Pinned public trust snapshot for contract release and apply-authorization verification.
         */
        readonly ContractTrustRootV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            /** Format: date-time */
            readonly issuedAt: string;
            readonly keys: readonly {
                readonly algorithms: readonly ("dsse-ed25519-v1" | "jws-eddsa-v1")[];
                readonly audiences: readonly string[];
                readonly issuer: string;
                readonly keyId: string;
                /** Format: date-time */
                readonly notAfter: string;
                /** Format: date-time */
                readonly notBefore: string;
                readonly publicKeyJwk: {
                    /** @constant */
                    readonly crv: "Ed25519";
                    /** @constant */
                    readonly kty: "OKP";
                    readonly x: string;
                };
                /** @enum {unknown} */
                readonly status: "active" | "overlap" | "retired" | "revoked";
            }[];
            /** @constant */
            readonly kind: "ContractTrustRoot";
            readonly maximumClockSkewSeconds: number;
            /** Format: date-time */
            readonly nextUpdate: string;
            readonly snapshotId: string;
        };
        /**
         * ImageOperationPlanV1 contract
         * @description Bounded ImageOperationPlanV1 wire contract governed by PRD 0012.
         */
        readonly ImageOperationPlanV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly inputs: readonly components["schemas"]["SharedPrimitivesV1ArtifactReference"][];
            /** @constant */
            readonly kind: "ImageOperationPlan";
            readonly limits: components["schemas"]["SharedPrimitivesV1ResourceLimits"];
            readonly operations: readonly {
                readonly operationId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
                /** @enum {unknown} */
                readonly operationType: "crop" | "resize" | "composite" | "encode";
                readonly parameters: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            }[];
            readonly outputs: readonly {
                readonly maximumBytes: number;
                readonly mediaType: string;
                readonly name: string;
            }[];
            readonly validationPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
        };
        /**
         * InputRequestV1 contract
         * @description Bounded InputRequestV1 wire contract governed by PRD 0012.
         */
        readonly InputRequestV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly expiresAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly kind: "InputRequest";
            readonly question: string;
            readonly requestId: components["schemas"]["SharedPrimitivesV1RequestId"];
            readonly responseSchema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            /** @enum {unknown} */
            readonly resumeState: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly version: number;
        };
        /**
         * ProblemDetailsV1 contract
         * @description Bounded ProblemDetailsV1 wire contract governed by PRD 0012.
         */
        readonly ProblemDetailsV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly code: string;
            readonly fieldErrors: readonly {
                readonly code: string;
                readonly instancePath: string;
                readonly message: string;
                readonly schemaPath: string;
            }[];
            /** @constant */
            readonly kind: "ProblemDetails";
            readonly message: string;
            /** @enum {unknown} */
            readonly retryability: "never" | "safe-immediate" | "safe-after-backoff" | "after-input" | "after-approval" | "after-rebase" | "operator-action";
            readonly runId?: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly stage?: string;
            readonly traceId?: string;
        };
        /**
         * ProviderContinuationV1 contract
         * @description Bounded ProviderContinuationV1 wire contract governed by PRD 0012.
         */
        readonly ProviderContinuationV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly bindingDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly encryptedBinding: string;
            readonly expiresAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly kind: "ProviderContinuation";
            readonly provider: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            /** @enum {unknown} */
            readonly restartPolicy: "resume-if-valid" | "restart-stage" | "restart-run";
        };
        /**
         * AnvilKit Agent shared primitives v1
         * @description Bounded reusable wire primitives for the Agent contract catalog.
         */
        readonly SharedPrimitivesV1: {
            readonly $defs: components["schemas"]["SharedPrimitivesV1DefinitionSet"];
        };
        readonly SharedPrimitivesV1ActorId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1ArtifactId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1ArtifactReference: {
            readonly artifactId: components["schemas"]["SharedPrimitivesV1ArtifactId"];
            readonly digest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly mediaType: string;
            readonly sizeBytes: number;
        };
        readonly SharedPrimitivesV1AuthorizationId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1BoundedStringMap: {
            readonly [key: string]: string;
        };
        readonly SharedPrimitivesV1BuildId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1ContractBomReferenceV1: {
            readonly bomDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly evidenceManifestDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly ociManifestDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly repository: string;
        };
        readonly SharedPrimitivesV1Cost: {
            readonly amount: components["schemas"]["SharedPrimitivesV1DecimalString"];
            readonly currency: string;
        };
        readonly SharedPrimitivesV1Cursor: string;
        readonly SharedPrimitivesV1DecimalString: string;
        readonly SharedPrimitivesV1DefinitionSet: {
            readonly ActorId: components["schemas"]["SharedPrimitivesV1ActorId"];
            readonly ArtifactId: components["schemas"]["SharedPrimitivesV1ArtifactId"];
            readonly ArtifactReference: components["schemas"]["SharedPrimitivesV1ArtifactReference"];
            readonly AuthorizationId: components["schemas"]["SharedPrimitivesV1AuthorizationId"];
            readonly BoundedStringMap: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            readonly BuildId: components["schemas"]["SharedPrimitivesV1BuildId"];
            readonly ContractBomReferenceV1: components["schemas"]["SharedPrimitivesV1ContractBomReferenceV1"];
            readonly Cost: components["schemas"]["SharedPrimitivesV1Cost"];
            readonly Cursor: components["schemas"]["SharedPrimitivesV1Cursor"];
            readonly DecimalString: components["schemas"]["SharedPrimitivesV1DecimalString"];
            readonly Digest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly Idempotency: components["schemas"]["SharedPrimitivesV1Idempotency"];
            readonly IntegerString: components["schemas"]["SharedPrimitivesV1IntegerString"];
            readonly OpaqueId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly PageInfo: components["schemas"]["SharedPrimitivesV1PageInfo"];
            readonly PhysicalAttemptId: components["schemas"]["SharedPrimitivesV1PhysicalAttemptId"];
            readonly PolicyId: components["schemas"]["SharedPrimitivesV1PolicyId"];
            readonly PolicyReference: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            readonly RequestId: components["schemas"]["SharedPrimitivesV1RequestId"];
            readonly ReservationId: components["schemas"]["SharedPrimitivesV1ReservationId"];
            readonly ResourceLimits: components["schemas"]["SharedPrimitivesV1ResourceLimits"];
            readonly RunId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly SchemaReference: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            readonly TargetReference: components["schemas"]["SharedPrimitivesV1TargetReference"];
            readonly TaskId: components["schemas"]["SharedPrimitivesV1TaskId"];
            readonly TenantId: components["schemas"]["SharedPrimitivesV1TenantId"];
            readonly Timestamp: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly TraceAndScope: components["schemas"]["SharedPrimitivesV1TraceAndScope"];
            readonly TraceContext: components["schemas"]["SharedPrimitivesV1TraceContext"];
            readonly WorkspaceId: components["schemas"]["SharedPrimitivesV1WorkspaceId"];
        };
        readonly SharedPrimitivesV1Digest: string;
        readonly SharedPrimitivesV1Idempotency: {
            readonly canonicalRequestDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly key: string;
            readonly scope: string;
        };
        readonly SharedPrimitivesV1IntegerString: string;
        readonly SharedPrimitivesV1OpaqueId: string;
        readonly SharedPrimitivesV1PageInfo: {
            readonly hasMore: boolean;
            readonly limit: number;
            readonly nextCursor?: components["schemas"]["SharedPrimitivesV1Cursor"];
        };
        readonly SharedPrimitivesV1PhysicalAttemptId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1PolicyId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1PolicyReference: {
            readonly digest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly policyId: components["schemas"]["SharedPrimitivesV1PolicyId"];
            readonly version: string;
        };
        readonly SharedPrimitivesV1RequestId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1ReservationId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1ResourceLimits: {
            readonly cpuMillis: number;
            readonly gpuMillis: number;
            readonly memoryBytes: number;
            readonly outputBytes: number;
            readonly timeoutMilliseconds: number;
        };
        readonly SharedPrimitivesV1RunId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1SchemaReference: {
            readonly componentName: string;
            readonly digest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly version: string;
        };
        readonly SharedPrimitivesV1TargetReference: {
            readonly targetId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly targetType: string;
            readonly workspaceId: components["schemas"]["SharedPrimitivesV1WorkspaceId"];
        };
        readonly SharedPrimitivesV1TaskId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        readonly SharedPrimitivesV1TenantId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        /** Format: date-time */
        readonly SharedPrimitivesV1Timestamp: string;
        readonly SharedPrimitivesV1TraceAndScope: {
            readonly actorId: components["schemas"]["SharedPrimitivesV1ActorId"];
            readonly tenantId: components["schemas"]["SharedPrimitivesV1TenantId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesV1TraceContext"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesV1WorkspaceId"];
        };
        readonly SharedPrimitivesV1TraceContext: {
            readonly traceparent: string;
            readonly tracestate?: string;
        };
        readonly SharedPrimitivesV1WorkspaceId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        /**
         * TargetSnapshotV1 contract
         * @description Bounded TargetSnapshotV1 wire contract governed by PRD 0012.
         */
        readonly TargetSnapshotV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly baseRevision: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly capturedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly catalogDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            readonly contractBomDigest: components["schemas"]["SharedPrimitivesV1Digest"];
            /** @constant */
            readonly kind: "TargetSnapshot";
            readonly snapshot: components["schemas"]["SharedPrimitivesV1ArtifactReference"];
            readonly target: components["schemas"]["SharedPrimitivesV1TargetReference"];
        };
        /**
         * ToolDefinitionV1 contract
         * @description Bounded ToolDefinitionV1 wire contract governed by PRD 0012.
         */
        readonly ToolDefinitionV1: {
            readonly acceptedDataClasses: readonly ("public" | "internal" | "confidential" | "restricted")[];
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly approvalPolicy: components["schemas"]["SharedPrimitivesV1PolicyReference"];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            /** @enum {unknown} */
            readonly capabilityVersion: "provider.invoke/v1" | "contract.validate/v1" | "artifact.scan/v1" | "fake.execute/v1";
            readonly inputSchema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            /** @constant */
            readonly kind: "ToolDefinition";
            readonly outputSchema: components["schemas"]["SharedPrimitivesV1SchemaReference"];
            readonly retryPolicy: {
                readonly backoffMilliseconds: number;
                readonly maximumAttempts: number;
                readonly retryability: readonly ("safe-immediate" | "safe-after-backoff" | "operator-action")[];
            };
            /** @enum {unknown} */
            readonly riskClass: "low" | "medium" | "high" | "critical";
            /** @enum {unknown} */
            readonly sideEffectClass: "none" | "read" | "artifact-write" | "domain-effect";
            readonly timeoutPolicy: {
                readonly timeoutMilliseconds: number;
            };
            readonly toolId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
        };
        /**
         * UsageObservationV1 contract
         * @description Bounded UsageObservationV1 wire contract governed by PRD 0012.
         */
        readonly UsageObservationV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly cost: components["schemas"]["SharedPrimitivesV1Cost"];
            readonly executionGeneration: number;
            readonly final: boolean;
            /** @constant */
            readonly kind: "UsageObservation";
            /** @enum {unknown} */
            readonly meter: "input-tokens" | "output-tokens" | "worker-duration" | "gpu-duration" | "provider-cost";
            readonly meterSequence: number;
            readonly observationId: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly observedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesV1PhysicalAttemptId"];
            readonly providerEventId?: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly quantity: components["schemas"]["SharedPrimitivesV1DecimalString"];
            readonly recoveryEpoch: number;
            readonly reservationId: components["schemas"]["SharedPrimitivesV1ReservationId"];
            readonly rootRunId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly runId: components["schemas"]["SharedPrimitivesV1RunId"];
            readonly source: {
                readonly buildIdentity: components["schemas"]["SharedPrimitivesV1BuildId"];
                readonly provider: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            };
            readonly taskId: components["schemas"]["SharedPrimitivesV1TaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesV1TraceContext"];
            /** @enum {unknown} */
            readonly unit: "token" | "millisecond" | "byte" | "count" | "usd-micro";
        };
        /**
         * WorkerLeaseV1 contract
         * @description Bounded WorkerLeaseV1 wire contract governed by PRD 0012.
         */
        readonly WorkerLeaseV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly attemptNumber: number;
            readonly executionGeneration: number;
            readonly expiresAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly fenceToken: string;
            readonly issuedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            /** @constant */
            readonly kind: "WorkerLease";
            readonly leaseEpoch: number;
            readonly owner: components["schemas"]["SharedPrimitivesV1OpaqueId"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesV1PhysicalAttemptId"];
            readonly recoveryEpoch: number;
            readonly taskId: components["schemas"]["SharedPrimitivesV1TaskId"];
        };
        /**
         * WorkerResultV1 contract
         * @description Bounded WorkerResultV1 wire contract governed by PRD 0012.
         */
        readonly WorkerResultV1: {
            /** @constant */
            readonly apiVersion: "anvilkit.io/contracts/v1";
            readonly artifacts: readonly components["schemas"]["SharedPrimitivesV1ArtifactReference"][];
            readonly buildIdentity: components["schemas"]["SharedPrimitivesV1BuildId"];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            readonly completedAt: components["schemas"]["SharedPrimitivesV1Timestamp"];
            readonly executionGeneration: number;
            /** @constant */
            readonly kind: "WorkerResult";
            readonly leaseEpoch: number;
            readonly metrics: components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesV1PhysicalAttemptId"];
            readonly problem?: components["schemas"]["ProblemDetailsV1"];
            readonly recoveryEpoch: number;
            readonly taskId: components["schemas"]["SharedPrimitivesV1TaskId"];
            readonly usageReferences: readonly components["schemas"]["SharedPrimitivesV1OpaqueId"][];
            readonly warnings: readonly components["schemas"]["ProblemDetailsV1"][];
        };
    };
    responses: never;
    parameters: {
        readonly ArtifactId: string;
        readonly IdempotencyKey: string;
        readonly RequestDigest: string;
        readonly RequestId: string;
        readonly RunId: string;
        readonly Traceparent: string;
        readonly WorkspaceId: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    readonly finalizeAgentAsset: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentArtifactV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["AgentArtifactV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly reserveAgentAsset: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentArtifactV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["AgentArtifactV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly createTargetSnapshot: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["TargetSnapshotV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly persistAuthorizedPage: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["ApplyAuthorizationV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["TargetSnapshotV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly checkAgentEntitlement: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["SharedPrimitivesV1BoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly observeAgentUsage: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["UsageObservationV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["UsageObservationV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly reconcileAgentUsage: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentBudgetV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["AgentBudgetV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
    readonly reserveAgentUsage: {
        readonly parameters: {
            readonly query?: never;
            readonly header: {
                readonly "Idempotency-Key": components["parameters"]["IdempotencyKey"];
                readonly traceparent: components["parameters"]["Traceparent"];
                readonly "X-AnvilKit-Request-Digest": components["parameters"]["RequestDigest"];
            };
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": components["schemas"]["AgentBudgetV1"];
            };
        };
        readonly responses: {
            /** @description Recorded semantic outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["AgentBudgetV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
            /** @description Stable contract problem. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetailsV1"];
                };
            };
        };
    };
}
