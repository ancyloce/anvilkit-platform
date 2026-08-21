export interface paths {
    readonly "/internal/agent/assets/finalization": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Finalize an immutable governed asset. */
        readonly post: operations["finalizeAgentAsset"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/assets/reservations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reserve governed asset capacity before finalization. */
        readonly post: operations["reserveAgentAsset"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/context-snapshots": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Capture an immutable authorized target snapshot. */
        readonly post: operations["createTargetSnapshot"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/domain/page-persistence": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Verify and atomically commit an authorized page mutation with its outbox event. */
        readonly post: operations["persistAuthorizedPage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/entitlements/check": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Check current Team, Project, permission, and entitlement authority. */
        readonly post: operations["checkAgentEntitlement"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/usage/observations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Record one additive per-attempt usage observation. */
        readonly post: operations["observeAgentUsage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/usage/reconciliation": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reconcile reservation and observed usage exactly once. */
        readonly post: operations["reconcileAgentUsage"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/internal/agent/usage/reservations": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        /** Reserve worst-case budget before expensive dispatch. */
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
         * AgentArtifact contract
         * @description Bounded AgentArtifact wire contract governed by PRD 0012.
         */
        readonly AgentArtifact: {
            readonly artifactId: components["schemas"]["SharedPrimitivesArtifactId"];
            /** @constant */
            readonly contractType: "AgentArtifact";
            readonly createdAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            /** @enum {unknown} */
            readonly kind: "compiled-context" | "target-snapshot" | "agent-plan" | "worker-result" | "validation-report";
            /** @enum {unknown} */
            readonly lifecycle: "pending" | "scanning" | "valid" | "finalized" | "committed" | "quarantined" | "expired" | "deleted";
            readonly lineage: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly producer: {
                readonly executionGeneration: number;
                readonly leaseEpoch: number;
                readonly physicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
                readonly recoveryEpoch: number;
                readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            };
            readonly reference: {
                readonly bucket: string;
                readonly mediaType: string;
                readonly objectKey: string;
                readonly sizeBytes: number;
            };
            readonly schema: components["schemas"]["SharedPrimitivesSchemaReference"];
            readonly validation: {
                readonly checks: readonly {
                    readonly evidenceDigest: components["schemas"]["SharedPrimitivesDigest"];
                    readonly name: string;
                    /** @enum {unknown} */
                    readonly result: "passed" | "failed";
                }[];
                readonly validatedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            };
        };
        /**
         * AgentBudget contract
         * @description Bounded AgentBudget wire contract governed by PRD 0012.
         */
        readonly AgentBudget: {
            readonly currencyLimits: {
                readonly maximumCost: components["schemas"]["SharedPrimitivesCost"];
                readonly reservedCost: components["schemas"]["SharedPrimitivesCost"];
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
            readonly policy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly reservationId: components["schemas"]["SharedPrimitivesReservationId"];
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
         * AgentDefinition contract
         * @description Bounded AgentDefinition wire contract governed by PRD 0012 and ADR-018. A definition is immutable by definitionId and definitionDigest and carries role, owner, instruction digest, input/output schema identity, Tool profile, delegation constraints, repair policy, and evaluation profile.
         */
        readonly AgentDefinition: {
            readonly allowedDelegates: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
            readonly definitionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly definitionId: components["schemas"]["SharedPrimitivesOpaqueId"];
            /** @enum {unknown} */
            readonly domain: "platform-agent" | "pagix-page" | "contract-runtime";
            readonly evaluators: readonly components["schemas"]["SharedPrimitivesSchemaReference"][];
            readonly guardrailPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly inputSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
            /** @constant */
            readonly kind: "AgentDefinition";
            readonly maximumDelegationDepth: number;
            readonly maximumFanOut: number;
            readonly memoryPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly modelPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly outputSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
            readonly owner: string;
            readonly promptDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly repairPolicy: {
                readonly maximumAttempts: number;
                /** @enum {unknown} */
                readonly mode: "reject" | "bounded-repair";
            };
            /** @enum {unknown} */
            readonly role: "manager" | "specialist";
            readonly stopConditions: readonly ("completed" | "refused" | "budget-exhausted" | "approval-required" | "input-required" | "policy-blocked")[];
            readonly toolProfile: {
                readonly maximumParallelTools: number;
                readonly tools: readonly components["schemas"]["SharedPrimitivesSchemaReference"][];
            };
            readonly turnLimit: number;
        };
        /**
         * AgentEvent contract
         * @description Bounded AgentEvent wire contract governed by PRD 0012.
         */
        readonly AgentEvent: {
            readonly artifactReference?: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly contractBomReference: components["schemas"]["SharedPrimitivesContractBomReference"];
            readonly eventId: components["schemas"]["SharedPrimitivesOpaqueId"];
            /** @enum {unknown} */
            readonly eventType: "run.created" | "run.state-changed" | "run.input-requested" | "run.approval-requested" | "run.artifact-available" | "run.problem-recorded";
            /** @constant */
            readonly kind: "AgentEvent";
            readonly occurredAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly payload?: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            readonly projectId: components["schemas"]["SharedPrimitivesProjectId"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly sequence: number;
            readonly subject: {
                readonly subjectId: components["schemas"]["SharedPrimitivesActorId"];
                /** @enum {unknown} */
                readonly subjectType: "user" | "system";
            };
            readonly taskId?: components["schemas"]["SharedPrimitivesTaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        /**
         * AgentEvidence contract
         * @description Bounded internal AgentEvidence wire contract governed by ADR-020. Evidence is internal, separately sequenced, access-controlled execution fact and is never a public AgentEvent.
         */
        readonly AgentEvidence: {
            readonly artifactReference?: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly causedByEvidenceId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            /** @enum {unknown} */
            readonly dataClassification: "public" | "internal" | "confidential" | "restricted";
            readonly evidenceId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly evidenceSequence: number;
            readonly evidenceType: string;
            /** @constant */
            readonly kind: "AgentEvidence";
            readonly occurredAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly payload?: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            readonly producer: {
                readonly component: components["schemas"]["SharedPrimitivesOpaqueId"];
                readonly contractBomDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly definitionDigest?: components["schemas"]["SharedPrimitivesDigest"];
                readonly policyDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            readonly projectId: components["schemas"]["SharedPrimitivesProjectId"];
            readonly publicEventId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly recordedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @enum {unknown} */
            readonly retentionCategory: "operational" | "audit" | "security";
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly turnId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly workflowId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        /**
         * AgentRun contract
         * @description Bounded AgentRun wire contract governed by PRD 0012.
         */
        readonly AgentRun: {
            readonly actorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly budget: components["schemas"]["AgentBudget"];
            readonly contractBomReference: components["schemas"]["SharedPrimitivesContractBomReference"];
            readonly createdAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly definition: components["schemas"]["SharedPrimitivesDefinitionReference"];
            /** @enum {unknown} */
            readonly domain: "platform-agent" | "pagix-page" | "contract-runtime";
            readonly executionGeneration: number;
            readonly idempotency: components["schemas"]["SharedPrimitivesIdempotency"];
            /** @constant */
            readonly kind: "AgentRun";
            /** @enum {unknown} */
            readonly operation: "page-change" | "artifact-validation" | "image-operation" | "component-package";
            readonly parentRunId?: components["schemas"]["SharedPrimitivesRunId"];
            readonly policy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly problem?: components["schemas"]["ProblemDetails"];
            readonly resourceRevision: number;
            readonly rootRunId: components["schemas"]["SharedPrimitivesRunId"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            /** @enum {unknown} */
            readonly status: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
            readonly updatedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        /**
         * AgentStreamDelta contract
         * @description Provisional streaming transport shape governed by ADR-020. Deltas are not AgentEvent, carry no public sequence, may be dropped, combined, sampled, or rate-limited, and can never satisfy a Validator, approval, or final-state reconstruction.
         */
        readonly AgentStreamDelta: {
            /** @enum {unknown} */
            readonly channel: "token" | "text" | "field" | "progress";
            readonly emittedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "AgentStreamDelta";
            readonly payload: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            /** @constant */
            readonly provisional: true;
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly traceContext?: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly turnId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        /**
         * AgentTask contract
         * @description Bounded AgentTask wire contract governed by PRD 0012.
         */
        readonly AgentTask: {
            readonly artifactInputs: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            readonly contractBomReference: components["schemas"]["SharedPrimitivesContractBomReference"];
            readonly executionGeneration: number;
            readonly idempotency: components["schemas"]["SharedPrimitivesIdempotency"];
            readonly inputSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
            /** @constant */
            readonly kind: "AgentTask";
            readonly limits: components["schemas"]["SharedPrimitivesResourceLimits"];
            readonly parameters: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            readonly resources: {
                readonly priority: number;
                /** @enum {unknown} */
                readonly resourceClass: "interactive-cpu" | "batch-cpu" | "interactive-gpu" | "batch-gpu";
            };
            readonly rootRunId: components["schemas"]["SharedPrimitivesRunId"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
        };
        /**
         * ApplyAuthorization contract
         * @description Bounded ApplyAuthorization wire contract governed by PRD 0012.
         */
        readonly ApplyAuthorization: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly actorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly approvalVersion: number;
            readonly artifactDigest: components["schemas"]["SharedPrimitivesDigest"];
            /** @constant */
            readonly audience: "urn:anvilkit:audience:pagix";
            readonly authorizationId: components["schemas"]["SharedPrimitivesAuthorizationId"];
            readonly baseRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly contractBomDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly definitionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly issuedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly issuer: "urn:anvilkit:issuer:agent-service";
            readonly keyId: string;
            /** @constant */
            readonly kind: "ApplyAuthorization";
            readonly notBefore: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly policyDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        /**
         * ApprovalRequest contract
         * @description Bounded ApprovalRequest wire contract governed by PRD 0012.
         */
        readonly ApprovalRequest: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly allowedDecisions: readonly ("approve" | "reject" | "request-changes")[];
            readonly cost: components["schemas"]["SharedPrimitivesCost"];
            readonly decisionVersion: number;
            readonly effects: readonly {
                /** @enum {unknown} */
                readonly effectType: "artifact-finalize" | "page-persist" | "asset-finalize" | "component-apply" | "package-publish";
                readonly summary: string;
                readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
            }[];
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "ApprovalRequest";
            readonly requestId: components["schemas"]["SharedPrimitivesRequestId"];
            /** @enum {unknown} */
            readonly resumeState: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly reviewerPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
        };
        readonly BoundedRequest: components["schemas"]["SharedPrimitivesBoundedStringMap"];
        /**
         * CompiledContext contract
         * @description Bounded CompiledContext wire contract governed by PRD 0012.
         */
        readonly CompiledContext: {
            readonly classifications: readonly ("public" | "internal" | "confidential" | "restricted")[];
            readonly compiledAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "CompiledContext";
            readonly layerDigests: readonly components["schemas"]["SharedPrimitivesDigest"][];
            readonly orderedTrustLayers: readonly {
                /** @enum {unknown} */
                readonly classification: "public" | "internal" | "confidential" | "restricted";
                readonly digest: components["schemas"]["SharedPrimitivesDigest"];
                readonly layerId: components["schemas"]["SharedPrimitivesOpaqueId"];
                readonly position: number;
                readonly redacted: boolean;
                readonly tokenBudget: number;
            }[];
            readonly policySnapshot: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly redaction: {
                readonly policy: components["schemas"]["SharedPrimitivesPolicyReference"];
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
         * ComponentPackageSpec contract
         * @description Bounded ComponentPackageSpec wire contract governed by PRD 0012.
         */
        readonly ComponentPackageSpec: {
            readonly buildPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly certificationPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly inputs: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            /** @constant */
            readonly kind: "ComponentPackageSpec";
            readonly outputs: readonly {
                readonly maximumBytes: number;
                readonly name: string;
                readonly schema: components["schemas"]["SharedPrimitivesSchemaReference"];
            }[];
            readonly packageIntent: {
                /** @enum {unknown} */
                readonly componentType: "page-component" | "section" | "theme" | "package";
                readonly name: string;
                readonly version: string;
            };
            readonly validationConstraints: readonly components["schemas"]["SharedPrimitivesPolicyReference"][];
        };
        /**
         * ContractBom contract
         * @description Closed content-addressed Contract BOM manifest governed by design 0003 §8: the exact schema, registry, definition, Tool profile, policy, bundle, and generator/runtime identities resolved for a run. Resolution uses immutable digests, rejects missing, duplicate-conflicting, revoked, unsigned, or mismatched components, and performs no bundle-directed network fetch.
         */
        readonly ContractBom: {
            readonly components: readonly components["schemas"]["ContractBomEntry"][];
            readonly createdAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly issuer: string;
            /** @constant */
            readonly kind: "ContractBom";
            readonly name: string;
            readonly profileDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly registrySetDigest: components["schemas"]["SharedPrimitivesDigest"];
        };
        /** @enum {unknown} */
        readonly ContractBomComponentKind: "agent-definition" | "asyncapi" | "declarative-bundle" | "fixture-manifest" | "generated-binding" | "generator" | "json-schema" | "openapi" | "policy" | "registry-set" | "runtime" | "tool-profile";
        readonly ContractBomComponentName: string;
        readonly ContractBomDependency: {
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly kind: components["schemas"]["ContractBomComponentKind"];
            readonly name: components["schemas"]["ContractBomComponentName"];
        };
        readonly ContractBomEntry: {
            readonly dependencies: readonly components["schemas"]["ContractBomDependency"][];
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly issuer: string;
            readonly kind: components["schemas"]["ContractBomComponentKind"];
            readonly mediaType: string;
            readonly name: components["schemas"]["ContractBomComponentName"];
            readonly provenanceDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly size: number;
        };
        /**
         * ContractRevocationSnapshot contract
         * @description Signed fail-closed key revocation snapshot with explicit freshness.
         */
        readonly ContractRevocationSnapshot: {
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
         * ContractRuntimeRequest contract
         * @description Transport-neutral Contract Runtime request governed by ADR-022. The same request under the same bundle, runtime profile, and declared inputs must produce the same canonical result; time, randomness, environment, and locale are unavailable unless explicitly supplied as input.
         */
        readonly ContractRuntimeRequest: {
            readonly bundleDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly canonicalInput: string;
            readonly canonicalInputDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly contract: components["schemas"]["SharedPrimitivesSchemaReference"];
            /** @constant */
            readonly kind: "ContractRuntimeRequest";
            readonly limits: components["schemas"]["SharedPrimitivesResourceLimits"];
            /** @enum {unknown} */
            readonly operation: "validate" | "execute";
            readonly policy: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly traceContext?: components["schemas"]["SharedPrimitivesTraceContext"];
        };
        /**
         * ContractRuntimeResult contract
         * @description Transport-neutral deterministic Contract Runtime result governed by ADR-022: a canonical result or ProblemDetails, plus the bundle, schema, policy, runtime, and execution digests used for execution.
         */
        readonly ContractRuntimeResult: {
            readonly bundleDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly canonicalOutput?: string;
            readonly executionDigest: components["schemas"]["SharedPrimitivesDigest"];
            /** @constant */
            readonly kind: "ContractRuntimeResult";
            /** @enum {unknown} */
            readonly outcome: "ok" | "problem";
            readonly outputDigest?: components["schemas"]["SharedPrimitivesDigest"];
            readonly policyDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly problem?: components["schemas"]["ProblemDetails"];
            readonly runtime: {
                readonly buildIdentity: components["schemas"]["SharedPrimitivesBuildId"];
                readonly runtimeId: components["schemas"]["SharedPrimitivesOpaqueId"];
            };
            readonly schemaDigest: components["schemas"]["SharedPrimitivesDigest"];
        };
        /**
         * ContractSignatureStatement contract
         * @description Canonical context-bound statement carried by a standard single-signature DSSE envelope.
         */
        readonly ContractSignatureStatement: {
            /** @constant */
            readonly algorithm: "dsse-ed25519-v1";
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
         * ContractTrustRoot contract
         * @description Pinned public trust snapshot for contract release and apply-authorization verification.
         */
        readonly ContractTrustRoot: {
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
         * CreateAgentRunRequest contract
         * @description Intent-only AgentRun creation command governed by ADR-021. The caller declares only authorized intent; run identity, workspace, actor, state, revision, digest bindings, timestamps, sequence, and signatures are resolved or generated by Agent Service and are structurally absent from this command.
         */
        readonly CreateAgentRunRequest: {
            readonly definition: components["schemas"]["SharedPrimitivesDefinitionReference"];
            readonly input?: {
                readonly artifactInputs?: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
                readonly userInput?: string;
            };
            /** @constant */
            readonly kind: "CreateAgentRunRequest";
            readonly labels?: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            /** @enum {unknown} */
            readonly operation: "page-change" | "artifact-validation" | "image-operation" | "component-package";
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
        };
        /**
         * ImageOperationPlan contract
         * @description Bounded ImageOperationPlan wire contract governed by PRD 0012.
         */
        readonly ImageOperationPlan: {
            readonly inputs: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            /** @constant */
            readonly kind: "ImageOperationPlan";
            readonly limits: components["schemas"]["SharedPrimitivesResourceLimits"];
            readonly operations: readonly {
                readonly operationId: components["schemas"]["SharedPrimitivesOpaqueId"];
                /** @enum {unknown} */
                readonly operationType: "crop" | "resize" | "composite" | "encode";
                readonly parameters: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            }[];
            readonly outputs: readonly {
                readonly maximumBytes: number;
                readonly mediaType: string;
                readonly name: string;
            }[];
            readonly validationPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
        };
        /**
         * InputRequest contract
         * @description Bounded InputRequest wire contract governed by PRD 0012.
         */
        readonly InputRequest: {
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "InputRequest";
            readonly question: string;
            readonly requestId: components["schemas"]["SharedPrimitivesRequestId"];
            readonly responseSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
            /** @enum {unknown} */
            readonly resumeState: "created" | "preparing" | "planning" | "awaiting_input" | "executing" | "validating" | "awaiting_review" | "awaiting_approval" | "committing" | "awaiting_domain_confirmation" | "conflict" | "cancelling" | "failed" | "completed" | "cancelled" | "refused" | "discarded";
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly version: number;
        };
        /**
         * IssueApplyAuthorizationRequest contract
         * @description Intent-only Apply Authorization issuance command governed by ADR-021. Issuer, subject, audience, key identity, times, final digest bindings, and replay protection are server-owned and structurally absent from this command.
         */
        readonly IssueApplyAuthorizationRequest: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly approvalReference: {
                readonly decisionVersion: number;
                readonly requestId: components["schemas"]["SharedPrimitivesRequestId"];
            };
            readonly artifact: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly baseRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly expectedRunRevision: number;
            /** @constant */
            readonly kind: "IssueApplyAuthorizationRequest";
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
        };
        /**
         * IssuedApplyAuthorization contract
         * @description Issued Apply Authorization response governed by ADR-021: the canonical ApplyAuthorization document plus its compact JWS carrier. The document must be byte-equivalent to the decoded JWS payload after canonicalization.
         */
        readonly IssuedApplyAuthorization: {
            readonly authorization: components["schemas"]["ApplyAuthorization"];
            readonly compactJws: string;
            /** @constant */
            readonly kind: "IssuedApplyAuthorization";
        };
        /**
         * ProblemDetails contract
         * @description Bounded ProblemDetails wire contract governed by PRD 0012.
         */
        readonly ProblemDetails: {
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
            readonly runId?: components["schemas"]["SharedPrimitivesRunId"];
            readonly stage?: string;
            readonly traceId?: string;
        };
        /**
         * ProviderContinuation contract
         * @description Bounded ProviderContinuation wire contract governed by PRD 0012.
         */
        readonly ProviderContinuation: {
            readonly bindingDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly encryptedBinding: string;
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "ProviderContinuation";
            readonly provider: components["schemas"]["SharedPrimitivesOpaqueId"];
            /** @enum {unknown} */
            readonly restartPolicy: "resume-if-valid" | "restart-stage" | "restart-run";
        };
        /**
         * ResolveDomainOperationRequest contract
         * @description Intent-only operator recovery command governed by ADR-021. It records which authoritative outcome an escalated governed effect actually had, bound to the exact domain operation the operator reviewed and to the evidence the decision rests on. The basis is a bounded evidence reference, never free-form prose: an operator names the authoritative record a reviewer can retrieve, so the audited decision can be recorded as immutable internal evidence without ever carrying operator-authored content. The resolving operator is never carried on the wire: Agent Service derives it from the verified request authority.
         */
        readonly ResolveDomainOperationRequest: {
            readonly basis: string;
            /** @constant */
            readonly kind: "ResolveDomainOperationRequest";
            readonly operationId: string;
            /** @enum {unknown} */
            readonly outcome: "confirmed" | "conflict" | "rejected";
        };
        /**
         * AnvilKit Agent shared primitives
         * @description Bounded reusable wire primitives for the Agent contract catalog.
         */
        readonly SharedPrimitives: {
            readonly $defs: components["schemas"]["SharedPrimitivesDefinitionSet"];
        };
        readonly SharedPrimitivesActorId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesArtifactId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesArtifactReference: {
            readonly artifactId: components["schemas"]["SharedPrimitivesArtifactId"];
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly mediaType: string;
            readonly sizeBytes: number;
        };
        readonly SharedPrimitivesAuthorizationId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesBoundedStringMap: {
            readonly [key: string]: string;
        };
        readonly SharedPrimitivesBuildId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesContractBomReference: {
            readonly bomDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly evidenceManifestDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly ociManifestDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly repository: string;
        };
        readonly SharedPrimitivesCost: {
            readonly amount: components["schemas"]["SharedPrimitivesDecimalString"];
            readonly currency: string;
        };
        readonly SharedPrimitivesCursor: string;
        readonly SharedPrimitivesDecimalString: string;
        readonly SharedPrimitivesDefinitionReference: {
            readonly definitionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly definitionId: components["schemas"]["SharedPrimitivesOpaqueId"];
        };
        readonly SharedPrimitivesDefinitionSet: {
            readonly ActorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly ArtifactId: components["schemas"]["SharedPrimitivesArtifactId"];
            readonly ArtifactReference: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly AuthorizationId: components["schemas"]["SharedPrimitivesAuthorizationId"];
            readonly BoundedStringMap: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            readonly BuildId: components["schemas"]["SharedPrimitivesBuildId"];
            readonly ContractBomReference: components["schemas"]["SharedPrimitivesContractBomReference"];
            readonly Cost: components["schemas"]["SharedPrimitivesCost"];
            readonly Cursor: components["schemas"]["SharedPrimitivesCursor"];
            readonly DecimalString: components["schemas"]["SharedPrimitivesDecimalString"];
            readonly DefinitionReference: components["schemas"]["SharedPrimitivesDefinitionReference"];
            readonly Digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly Idempotency: components["schemas"]["SharedPrimitivesIdempotency"];
            readonly IntegerString: components["schemas"]["SharedPrimitivesIntegerString"];
            readonly OpaqueId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly PageInfo: components["schemas"]["SharedPrimitivesPageInfo"];
            readonly PhysicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
            readonly PolicyId: components["schemas"]["SharedPrimitivesPolicyId"];
            readonly PolicyReference: components["schemas"]["SharedPrimitivesPolicyReference"];
            readonly ProjectId: components["schemas"]["SharedPrimitivesProjectId"];
            readonly RequestId: components["schemas"]["SharedPrimitivesRequestId"];
            readonly ReservationId: components["schemas"]["SharedPrimitivesReservationId"];
            readonly ResourceLimits: components["schemas"]["SharedPrimitivesResourceLimits"];
            readonly RunId: components["schemas"]["SharedPrimitivesRunId"];
            readonly SchemaReference: components["schemas"]["SharedPrimitivesSchemaReference"];
            readonly TargetReference: components["schemas"]["SharedPrimitivesTargetReference"];
            readonly TaskId: components["schemas"]["SharedPrimitivesTaskId"];
            readonly Timestamp: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly TraceAndScope: components["schemas"]["SharedPrimitivesTraceAndScope"];
            readonly TraceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly WorkspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        readonly SharedPrimitivesDigest: string;
        readonly SharedPrimitivesIdempotency: {
            readonly canonicalRequestDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly key: string;
            readonly scope: string;
        };
        readonly SharedPrimitivesIntegerString: string;
        readonly SharedPrimitivesOpaqueId: string;
        readonly SharedPrimitivesPageInfo: {
            readonly hasMore: boolean;
            readonly limit: number;
            readonly nextCursor?: components["schemas"]["SharedPrimitivesCursor"];
        };
        readonly SharedPrimitivesPhysicalAttemptId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesPolicyId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesPolicyReference: {
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly policyId: components["schemas"]["SharedPrimitivesPolicyId"];
            readonly version: string;
        };
        readonly SharedPrimitivesProjectId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesRequestId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesReservationId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesResourceLimits: {
            readonly cpuMillis: number;
            readonly gpuMillis: number;
            readonly memoryBytes: number;
            readonly outputBytes: number;
            readonly timeoutMilliseconds: number;
        };
        readonly SharedPrimitivesRunId: components["schemas"]["SharedPrimitivesOpaqueId"];
        readonly SharedPrimitivesSchemaReference: {
            readonly componentName: string;
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
        };
        readonly SharedPrimitivesTargetReference: {
            readonly projectId: components["schemas"]["SharedPrimitivesProjectId"];
            readonly targetId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly targetType: string;
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        readonly SharedPrimitivesTaskId: components["schemas"]["SharedPrimitivesOpaqueId"];
        /** Format: date-time */
        readonly SharedPrimitivesTimestamp: string;
        readonly SharedPrimitivesTraceAndScope: {
            readonly actorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly workspaceId: components["schemas"]["SharedPrimitivesWorkspaceId"];
        };
        readonly SharedPrimitivesTraceContext: {
            readonly traceparent: string;
            readonly tracestate?: string;
        };
        readonly SharedPrimitivesWorkspaceId: components["schemas"]["SharedPrimitivesOpaqueId"];
        /**
         * SubmitApprovalDecisionRequest contract
         * @description Intent-only approval decision command governed by ADR-021. The decision binds the current ApprovalRequest decision revision and the exact action digest being approved.
         */
        readonly SubmitApprovalDecisionRequest: {
            readonly actionDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly comment?: string;
            /** @enum {unknown} */
            readonly decision: "approve" | "reject" | "request-changes";
            readonly decisionVersion: number;
            /** @constant */
            readonly kind: "SubmitApprovalDecisionRequest";
        };
        /**
         * SubmitInputResponseRequest contract
         * @description Intent-only input response command governed by ADR-021. The response binds the current InputRequest revision; the payload is additionally validated against the InputRequest response schema by Agent Service.
         */
        readonly SubmitInputResponseRequest: {
            /** @constant */
            readonly kind: "SubmitInputResponseRequest";
            readonly requestVersion: number;
            readonly responsePayload: components["schemas"]["SharedPrimitivesBoundedStringMap"];
        };
        /**
         * TargetSnapshot contract
         * @description Bounded TargetSnapshot wire contract governed by PRD 0012.
         */
        readonly TargetSnapshot: {
            readonly baseRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly capturedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly catalogDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly contractBomDigest: components["schemas"]["SharedPrimitivesDigest"];
            /** @constant */
            readonly kind: "TargetSnapshot";
            readonly snapshot: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
        };
        /**
         * ToolDefinition contract
         * @description Bounded ToolDefinition wire contract governed by PRD 0012.
         */
        readonly ToolDefinition: {
            readonly acceptedDataClasses: readonly ("public" | "internal" | "confidential" | "restricted")[];
            readonly approvalPolicy: components["schemas"]["SharedPrimitivesPolicyReference"];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            readonly inputSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
            /** @constant */
            readonly kind: "ToolDefinition";
            readonly outputSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
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
            readonly toolId: components["schemas"]["SharedPrimitivesOpaqueId"];
        };
        /**
         * UsageObservation contract
         * @description Bounded UsageObservation wire contract governed by PRD 0012.
         */
        readonly UsageObservation: {
            readonly cost: components["schemas"]["SharedPrimitivesCost"];
            readonly executionGeneration: number;
            readonly final: boolean;
            /** @constant */
            readonly kind: "UsageObservation";
            /** @enum {unknown} */
            readonly meter: "input-tokens" | "output-tokens" | "worker-duration" | "gpu-duration" | "provider-cost";
            readonly meterSequence: number;
            readonly observationId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly observedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
            readonly providerEventId?: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly quantity: components["schemas"]["SharedPrimitivesDecimalString"];
            readonly recoveryEpoch: number;
            readonly reservationId: components["schemas"]["SharedPrimitivesReservationId"];
            readonly rootRunId: components["schemas"]["SharedPrimitivesRunId"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly source: {
                readonly buildIdentity: components["schemas"]["SharedPrimitivesBuildId"];
                readonly provider: components["schemas"]["SharedPrimitivesOpaqueId"];
            };
            readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            /** @enum {unknown} */
            readonly unit: "token" | "millisecond" | "byte" | "count" | "usd-micro";
        };
        /**
         * WorkerLease contract
         * @description Bounded WorkerLease wire contract governed by PRD 0012.
         */
        readonly WorkerLease: {
            readonly attemptNumber: number;
            readonly executionGeneration: number;
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly fenceToken: string;
            readonly issuedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "WorkerLease";
            readonly leaseEpoch: number;
            readonly owner: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
            readonly recoveryEpoch: number;
            readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
        };
        /**
         * WorkerResult contract
         * @description Bounded WorkerResult wire contract governed by PRD 0012.
         */
        readonly WorkerResult: {
            readonly artifacts: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly buildIdentity: components["schemas"]["SharedPrimitivesBuildId"];
            /** @enum {unknown} */
            readonly capability: "provider.invoke" | "contract.validate" | "artifact.scan" | "fake.execute";
            readonly completedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly executionGeneration: number;
            /** @constant */
            readonly kind: "WorkerResult";
            readonly leaseEpoch: number;
            readonly metrics: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
            readonly problem?: components["schemas"]["ProblemDetails"];
            readonly recoveryEpoch: number;
            readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            readonly usageReferences: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
            readonly warnings: readonly components["schemas"]["ProblemDetails"][];
        };
    };
    responses: never;
    parameters: {
        readonly IdempotencyKey: string;
        readonly RequestDigest: string;
        readonly Traceparent: string;
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
                readonly "application/json": components["schemas"]["AgentArtifact"];
            };
        };
        readonly responses: {
            /** @description Finalized artifact metadata. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["AgentArtifact"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Recorded asset reservation. */
            readonly 201: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Immutable snapshot bound to catalog, policy, and Contract BOM digests. */
            readonly 201: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["TargetSnapshot"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["IssuedApplyAuthorization"];
            };
        };
        readonly responses: {
            /** @description Authoritative domain outcome; a revision conflict consumes the authorization. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Bounded current-authority decision. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["UsageObservation"];
            };
        };
        readonly responses: {
            /** @description Recorded additive observation. */
            readonly 201: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
            };
        };
        readonly responses: {
            /** @description Recorded reconciliation outcome. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
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
                readonly "application/json": components["schemas"]["AgentBudget"];
            };
        };
        readonly responses: {
            /** @description Recorded reservation state. */
            readonly 201: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["SharedPrimitivesBoundedStringMap"];
                };
            };
            /** @description Stable contract problem. */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Not authenticated. */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Authenticated but not authorized. */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Absent resource, or existence hidden by anti-enumeration policy. */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Business-state or idempotency conflict. */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Structurally valid command failing domain validation. */
            readonly 422: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
            /** @description Stable internal problem without sensitive detail. */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/problem+json": components["schemas"]["ProblemDetails"];
                };
            };
        };
    };
}
