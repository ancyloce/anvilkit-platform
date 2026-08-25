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
         * AgentRunSnapshot contract
         * @description Bounded AgentRunSnapshot recovery contract: the authoritative run resource, its governed artifact projections, and the durable public AgentEvent cursor a client resumes the event stream from after EVENT_CURSOR_EXPIRED.
         */
        readonly AgentRunSnapshot: {
            readonly artifacts: readonly {
                readonly artifactId: components["schemas"]["SharedPrimitivesArtifactId"];
                readonly digest: components["schemas"]["SharedPrimitivesDigest"];
                readonly securityGeneration: number;
                /** @enum {unknown} */
                readonly state: "pending" | "scanning" | "valid" | "finalized" | "committed" | "quarantined" | "expired" | "deleted";
            }[];
            readonly cursor?: components["schemas"]["SharedPrimitivesOpaqueId"];
            /** @constant */
            readonly kind: "AgentRunSnapshot";
            readonly run: components["schemas"]["AgentRun"];
        };
        /**
         * AgentRuntimeManifest contract
         * @description Immutable binding between one Agent Runtime Unit and the single AgentDefinition it is permitted to execute. It pins the image, provenance, and invocation protocol the unit was released with, the workload identity and the closed set of control-plane endpoints it may reach, and the queue, concurrency, resource, scaling, telemetry, drain, and rollback profile it is operated under. It carries execution-plane binding only: it never confers AgentRun, workflow, Tool, budget, approval, artifact, or business authority, and a runtime unit cannot reach another Agent Runtime Unit through it.
         */
        readonly AgentRuntimeManifest: {
            readonly definition: components["schemas"]["SharedPrimitivesDefinitionReference"];
            readonly execution: {
                readonly cpuMillis: number;
                readonly maxConcurrency: number;
                readonly memoryBytes: number;
                /** @enum {unknown} */
                readonly resourceClass: "interactive-cpu" | "batch-cpu" | "interactive-gpu" | "batch-gpu";
                readonly taskChannel: string;
                readonly timeoutMilliseconds: number;
            };
            readonly image: {
                readonly imageDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly provenanceDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly signatureDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly sourceCommit: string;
            };
            /** @constant */
            readonly kind: "AgentRuntimeManifest";
            readonly protocol: {
                readonly contractBomReference: components["schemas"]["SharedPrimitivesContractBomReference"];
                readonly invocationProtocolDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            readonly release: {
                readonly drainSeconds: number;
                readonly owner: string;
                readonly rollbackTarget: components["schemas"]["SharedPrimitivesDigest"];
                /** @enum {unknown} */
                readonly rolloutPolicy: "new-runs-only";
            };
            readonly runtimeUnitId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly scaling: {
                readonly maxReplicas: number;
                readonly minReplicas: number;
                readonly targetConcurrency: number;
            };
            readonly telemetry: {
                readonly healthPath: string;
                readonly namespace: string;
                readonly readinessPath: string;
            };
            readonly workload: {
                readonly allowedControlPlaneEndpoints: readonly string[];
                readonly audience: string;
                /** @enum {unknown} */
                readonly networkPolicy: "deny-all-except-allowed-endpoints";
                readonly workloadIdentity: string;
            };
        };
        /**
         * AgentRuntimeResult contract
         * @description Signed, bounded result returned by one Agent Runtime Unit for exactly one AgentTask attempt. It reports which definition, runtime manifest, invocation protocol, and image digests actually served the attempt, the physical attempt identity and execution generation it belongs to, the metered usage it consumed, one bounded TurnDecision, safe coded diagnostics, and its signature and provenance references. It is a proposal that Agent Service validates and may reject: it never carries authoritative workflow state, never commits, approves, or publishes, and never names another Agent Runtime Unit to call.
         */
        readonly AgentRuntimeResult: {
            readonly diagnostics: readonly {
                readonly code: string;
                readonly detail: string;
            }[];
            readonly executionGeneration: number;
            /** @constant */
            readonly kind: "AgentRuntimeResult";
            readonly physicalAttemptId: components["schemas"]["SharedPrimitivesPhysicalAttemptId"];
            readonly provenance: {
                /** @enum {unknown} */
                readonly signatureAlgorithm: "dsse-ed25519-v1" | "jws-eddsa-v1";
                readonly signatureDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly statementDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            readonly rootRunId: components["schemas"]["SharedPrimitivesRunId"];
            readonly runId: components["schemas"]["SharedPrimitivesRunId"];
            readonly selected: {
                readonly definitionDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly imageDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly invocationProtocolDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly runtimeManifestDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly turnDecision: {
                readonly artifactOutputs: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
                /** @enum {unknown} */
                readonly decision: "continue" | "tool_call" | "delegate_agent" | "need_input" | "final" | "refuse";
                readonly payload: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            };
            readonly usage: {
                readonly durationMilliseconds: number;
                readonly inputTokens: number;
                readonly outputTokens: number;
            };
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
            readonly catalogDigest: components["schemas"]["SharedPrimitivesDigest"];
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
        /**
         * ArtifactContentGrant contract
         * @description Bounded, expiring permission to read one artifact's bytes.
         *
         *     The governed metadata route describes an artifact; it never returns content. This grant is the separate, explicitly governed channel content travels on, so a disclosure of bytes is always a decision that was made, recorded, and time-boxed rather than a side effect of reading metadata.
         *
         *     A grant is scoped to one artifact at one content digest, for one actor, for one declared purpose from the governed access vocabulary, and it expires. `securityGeneration` pins the generation the grant was issued under: an artifact whose access is revoked advances its generation, and a grant issued before that no longer matches, so revocation takes effect on grants already in flight rather than only on new ones.
         *
         *     `url` is a capability. Anyone holding it holds the access it names for as long as it lives, so it is bounded, short-lived, and never logged. The grant conveys read access to bytes and nothing else: it approves nothing, finalizes nothing, and cannot change an artifact's custody or lifecycle.
         */
        readonly ArtifactContentGrant: {
            readonly actorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly artifactId: components["schemas"]["SharedPrimitivesArtifactId"];
            readonly digest: components["schemas"]["SharedPrimitivesDigest"];
            readonly expiresAt: components["schemas"]["SharedPrimitivesTimestamp"];
            /** @constant */
            readonly kind: "ArtifactContentGrant";
            /** @enum {unknown} */
            readonly purpose: "producer" | "scanner" | "review" | "approval" | "finalization" | "commit" | "read";
            readonly securityGeneration: number;
            readonly url: string;
        };
        readonly BoundedRequest: components["schemas"]["SharedPrimitivesBoundedStringMap"];
        /**
         * CatalogSnapshot contract
         * @description Immutable snapshot of the component catalog a page-generation run is permitted to compose from. It freezes the catalog revision and digest, the exact Puck schema and runtime revisions, every allowed component with its package revision, prop schema, defaults, slot rules, and nesting bound, the components that are forbidden or deprecated with their replacements, and the approved design-token, asset, and font references. It is produced by the catalog authority rather than by an editor client, and its digest is the value carried by TargetSnapshot's catalogDigest so that admission, candidate validation, preview, and apply all resolve the same catalog bytes. It confers no authority: it states what may be composed, never who may compose or commit it.
         */
        readonly CatalogSnapshot: {
            readonly allowedComponents: readonly {
                readonly componentId: string;
                readonly defaults: components["schemas"]["SharedPrimitivesBoundedStringMap"];
                readonly maxNestingDepth: number;
                readonly packageRevision: string;
                readonly propSchema: components["schemas"]["SharedPrimitivesSchemaReference"];
                readonly slots: readonly {
                    readonly allowedComponentIds: readonly string[];
                    readonly maxChildren: number;
                    readonly slotName: string;
                }[];
            }[];
            readonly approvedAssets: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly approvedFonts: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly capturedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly catalogDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly catalogRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly designTokens: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly forbiddenComponents: readonly {
                readonly componentId: string;
                /** @enum {unknown} */
                readonly reason: "deprecated" | "forbidden";
                readonly replacementComponentId: string;
            }[];
            /** @constant */
            readonly kind: "CatalogSnapshot";
            readonly puckRuntime: {
                readonly runtimeRevision: string;
                readonly schemaRevision: string;
            };
        };
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
         * ComponentDesignSpec contract
         * @description Reviewable design-only proposal for a new component. It states the intent and rationale, the namespace and component name, the props with kinds and defaults, the variants and state model, the slot and composition rules, the design tokens it consumes, its accessibility requirements, the approved assets it needs, the preview scenarios a reviewer should see, and the decisions still open for a human to settle. It is semantically distinct from ComponentPackageSpec, which remains the later build-oriented boundary and is untouched by this contract. ComponentDesignSpec carries no source bundle, no dependency request, no lifecycle script, no build authorization, and no publication grant, so approving one authorizes further design work only and can never be read as permission to execute code, build, publish, or promote anything into a catalog.
         */
        readonly ComponentDesignSpec: {
            readonly accessibilityRequirements: readonly {
                readonly criterion: string;
                readonly requirement: string;
            }[];
            readonly approvedAssetNeeds: readonly {
                readonly assetReference: components["schemas"]["SharedPrimitivesArtifactReference"];
                readonly purpose: string;
            }[];
            readonly composition: readonly {
                readonly allowedComponentIds: readonly string[];
                readonly maxChildren: number;
                readonly slotName: string;
            }[];
            readonly designTokenUsage: readonly {
                readonly tokenName: string;
                readonly usage: string;
            }[];
            readonly intent: {
                readonly rationale: string;
                readonly summary: string;
            };
            /** @constant */
            readonly kind: "ComponentDesignSpec";
            readonly namespace: {
                readonly componentName: string;
                readonly namespace: string;
            };
            readonly previewScenarios: readonly {
                readonly description: string;
                readonly name: string;
                readonly propValues: components["schemas"]["SharedPrimitivesBoundedStringMap"];
            }[];
            readonly props: readonly {
                readonly defaultValue: string;
                readonly description: string;
                readonly name: string;
                readonly required: boolean;
                /** @enum {unknown} */
                readonly valueKind: "string" | "integer" | "boolean" | "enum" | "token-reference" | "asset-reference" | "slot";
            }[];
            readonly stateModel: readonly {
                readonly description: string;
                readonly state: string;
                readonly trigger: string;
            }[];
            readonly unresolvedDecisions: readonly {
                readonly options: readonly string[];
                readonly question: string;
            }[];
            readonly variants: readonly {
                readonly description: string;
                readonly name: string;
            }[];
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
         * DecideArtifactCustodyRequest contract
         * @description Intent-only artifact custody command. It states which custody decision an authorized custodian made about one immutable artifact: placing or lifting the legal hold that decides whether the artifact may be destroyed, or destroying it. The basis is a bounded evidence reference rather than free-form prose, and the ticket names the change record the decision answers to, so the protected audit record can be reconstructed without ever carrying custodian-authored content. No identity is carried on the wire: the acting custodian, the workspace, and the project are derived by Agent Service from the verified request authority and the current authority register.
         */
        readonly DecideArtifactCustodyRequest: {
            readonly artifactId: string;
            readonly basis: string;
            /** @enum {unknown} */
            readonly decision: "legal-hold-placed" | "legal-hold-lifted" | "deleted";
            /** @constant */
            readonly kind: "DecideArtifactCustodyRequest";
            readonly ticket: string;
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
         * IssueArtifactContentGrantRequest contract
         * @description Intent-only command asking for bounded, expiring read access to one immutable artifact's bytes. It states which artifact is to be read and the governed purpose the reader declares for reading it. The purpose travels in the command body rather than in a header so that it is covered by the request digest the idempotency key binds: a retry under the same key that declares a different purpose is a different request and is refused as key reuse, instead of silently returning a capability issued for a purpose nobody asked for. No identity is carried on the wire: the acting reader, the workspace, and the project are derived by Agent Service from the verified request authority and the current authority register, and whether that reader may read this artifact for this purpose is decided against current authority rather than against anything the command asserts.
         */
        readonly IssueArtifactContentGrantRequest: {
            readonly artifactId: string;
            /** @constant */
            readonly kind: "IssueArtifactContentGrantRequest";
            /** @enum {unknown} */
            readonly purpose: "producer" | "scanner" | "review" | "approval" | "finalization" | "commit" | "read";
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
         * PageCandidate contract
         * @description Reviewable page-generation proposal bound to the exact inputs that produced it. It names the target and the base revision it was generated against, references the canonical Puck Data document that is the authoritative page content, and pins the target, catalog, contract-BOM, definition, and policy digests so a reviewer and the apply path resolve the same bytes the run saw. It carries validation receipts, the preview task and accepted preview result, a bounded generation summary and declared assumptions, bounded model, tool, delegation, and evidence references, and stable coded warnings a reviewer must see. Canonical Puck Data is authoritative within the candidate; pageIr is optional and derived, and never becomes the page document. The candidate is a proposal only: it commits nothing, approves nothing, and grants no authority to persist a page.
         */
        readonly PageCandidate: {
            readonly baseRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly candidateDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly digests: {
                readonly catalogDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly contractBomDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly definitionDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly policyDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly targetDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            readonly generation: {
                readonly assumptions: readonly string[];
                readonly summary: string;
            };
            /** @constant */
            readonly kind: "PageCandidate";
            readonly pageData: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly pageIr?: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly preview: {
                readonly resultArtifact: components["schemas"]["SharedPrimitivesArtifactReference"];
                readonly taskId: components["schemas"]["SharedPrimitivesTaskId"];
            };
            readonly references: {
                readonly delegations: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
                readonly evidence: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
                readonly modelInvocations: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
                readonly toolInvocations: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
            };
            readonly target: components["schemas"]["SharedPrimitivesTargetReference"];
            readonly validationReceipts: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
            readonly warnings: readonly {
                readonly code: string;
                readonly detail: string;
            }[];
        };
        /**
         * PagePreviewResult contract
         * @description Bounded evidence payload returned by one deterministic page-preview render, carried as an artifact on the canonical worker result envelope. It binds the candidate digest it rendered, the per-viewport screenshots and render statuses, how each component resolved or was substituted, the console and network-policy violations observed, accessibility findings with their impact, measured resource usage, and the worker image and environment digests that produced it. It is render evidence a reviewer and the apply path consult: it approves nothing, commits nothing, and cannot mark a candidate fit to publish.
         */
        readonly PagePreviewResult: {
            readonly accessibilityFindings: readonly {
                /** @enum {unknown} */
                readonly impact: "minor" | "moderate" | "serious" | "critical";
                readonly nodeCount: number;
                readonly ruleId: string;
            }[];
            readonly candidateDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly componentResolution: readonly {
                readonly componentId: string;
                readonly detail: string;
                /** @enum {unknown} */
                readonly status: "resolved" | "substituted" | "missing" | "forbidden";
            }[];
            readonly evidence: readonly components["schemas"]["SharedPrimitivesOpaqueId"][];
            /** @constant */
            readonly kind: "PagePreviewResult";
            readonly policyViolations: readonly {
                /** @enum {unknown} */
                readonly channel: "console" | "network";
                readonly detail: string;
                /** @enum {unknown} */
                readonly severity: "info" | "warning" | "error";
            }[];
            readonly resourceUsage: {
                readonly cpuMillis: number;
                readonly durationMilliseconds: number;
                readonly peakMemoryBytes: number;
            };
            readonly screenshots: readonly {
                readonly artifact: components["schemas"]["SharedPrimitivesArtifactReference"];
                readonly viewportIndex: number;
            }[];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
            readonly viewportStatuses: readonly {
                /** @enum {unknown} */
                readonly status: "rendered" | "failed" | "timed-out";
                readonly viewportIndex: number;
            }[];
            readonly workerEnvironment: {
                readonly environmentDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly imageDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
        };
        /**
         * PagePreviewTask contract
         * @description Bounded input payload for one deterministic page-preview render, carried as an artifact input on the canonical worker lease envelope rather than as a second task family. It names the PageCandidate and its digest, the resolved catalog snapshot, approved assets, and exact Puck schema and runtime revisions, the viewport/locale/theme matrix to render, a deterministic runtime profile whose network policy is deny-all, the render deadline and resource bounds, and the contract, catalog, and runtime digests the worker must verify before rendering. It carries inputs only: no credential, no endpoint selection, and no authority to commit, approve, or publish anything it renders.
         */
        readonly PagePreviewTask: {
            readonly candidate: components["schemas"]["SharedPrimitivesArtifactReference"];
            readonly candidateDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly deadlineAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly expected: {
                readonly catalogDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly contractBomDigest: components["schemas"]["SharedPrimitivesDigest"];
                readonly runtimeDigest: components["schemas"]["SharedPrimitivesDigest"];
            };
            /** @constant */
            readonly kind: "PagePreviewTask";
            readonly limits: components["schemas"]["SharedPrimitivesResourceLimits"];
            readonly matrix: readonly {
                readonly locale: string;
                readonly theme: string;
                readonly viewportHeight: number;
                readonly viewportWidth: number;
            }[];
            readonly resolved: {
                readonly approvedAssets: readonly components["schemas"]["SharedPrimitivesArtifactReference"][];
                readonly catalogSnapshot: components["schemas"]["SharedPrimitivesArtifactReference"];
                readonly puckRuntimeRevision: string;
                readonly puckSchemaRevision: string;
            };
            readonly runtimeProfile: {
                readonly deterministicSeed: number;
                /** @enum {unknown} */
                readonly networkPolicy: "deny-all";
                readonly reducedMotion: boolean;
                readonly timezone: string;
            };
        };
        /**
         * PagixCommitReceipt contract
         * @description Domain result Pagix returns after committing one approved page candidate. It names the Apply Authorization it redeemed, the previous and new revision identifiers, the committed Puck Data digest and the candidate digest it came from, the durable outbox identifier written in the same transaction, the acting actor and the effective permission decision, whether this call committed or replayed an earlier identical commit, and the commit timestamp and trace. The authorization redemption, the new revision, the idempotency outcome, and the outbox event are persisted in one database transaction; an asynchronous publication is not evidence of that invariant. The receipt reports a commit that already happened — it authorizes nothing and cannot be replayed to cause one. permissionDecision.decision admits only 'allowed', so a receipt for a denied commit is unrepresentable.
         */
        readonly PagixCommitReceipt: {
            readonly actorId: components["schemas"]["SharedPrimitivesActorId"];
            readonly candidateDigest: components["schemas"]["SharedPrimitivesDigest"];
            readonly committedAt: components["schemas"]["SharedPrimitivesTimestamp"];
            readonly committedPageDataDigest: components["schemas"]["SharedPrimitivesDigest"];
            /** @enum {unknown} */
            readonly idempotencyOutcome: "committed" | "replayed";
            /** @constant */
            readonly kind: "PagixCommitReceipt";
            readonly newRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly outboxId: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly permissionDecision: {
                /** @enum {unknown} */
                readonly decision: "allowed";
                readonly policy: components["schemas"]["SharedPrimitivesPolicyReference"];
            };
            readonly previousRevision: components["schemas"]["SharedPrimitivesOpaqueId"];
            readonly redeemedAuthorizationId: components["schemas"]["SharedPrimitivesAuthorizationId"];
            readonly traceContext: components["schemas"]["SharedPrimitivesTraceContext"];
        };
        /**
         * PersistAuthorizedPageRequest contract
         * @description The complete command to commit one approved page candidate. It carries the issued Apply Authorization, the reviewed PageCandidate that authorization was issued over, and the page document that candidate names, because the domain owner cannot create a revision from a document it never receives and must not fetch page bytes over a channel the authorization does not cover.
         *
         *     `pageCandidate` is the reviewed PageCandidate serialized as JSON and `pageDocument` is the canonical Puck Data serialized as JSON. Both are carried verbatim as strings rather than as embedded objects: their digests are taken over exact bytes, and re-serializing an embedded object would change those bytes and break every check below. `candidateDigest` is the SHA-256 of the `pageCandidate` bytes and `pageDocumentDigest` is the SHA-256 of the `pageDocument` bytes.
         *
         *     The bindings that make this safe, all four verifiable by the domain owner from this request alone:
         *
         *     1. `candidateDigest` MUST equal the authorization's `artifactDigest`. The authorized artifact is the reviewed PageCandidate — the run's one final product — so an authorization can only ever commit the candidate it was issued for.
         *     2. `candidateDigest` MUST equal the SHA-256 of the `pageCandidate` bytes, so the carried candidate is the one the authorization names rather than another candidate with a borrowed digest.
         *     3. `pageDocumentDigest` MUST equal the SHA-256 of the `pageDocument` bytes.
         *     4. `pageDocumentDigest` MUST equal the `digest` of the `pageData` reference inside `pageCandidate`. `pageData` is one of the candidate's identity fields, so the candidate's own digest already covers it: the document is bound to the candidate, and the candidate to the authorization. Substituting either the document or the candidate breaks the chain and the commit is refused.
         *
         *     `pageDocument` is bounded at 744 KiB rather than the 768 KiB a document alone could occupy: the reviewed candidate is carried in the same request at its own contract's full 256 KiB, and the governed 1 MiB ceiling for a canonical document is not negotiable. Carrying the candidate is what lets the domain owner verify the chain itself, and this is what that costs.
         *
         *     The request authorizes nothing on its own. It carries an authorization issued elsewhere and is refused unless that authorization verifies, is unspent, and still matches the page's current revision.
         */
        readonly PersistAuthorizedPageRequest: {
            readonly authorization: components["schemas"]["IssuedApplyAuthorization"];
            readonly candidateDigest: components["schemas"]["SharedPrimitivesDigest"];
            /** @constant */
            readonly kind: "PersistAuthorizedPageRequest";
            readonly pageCandidate: string;
            readonly pageDocument: string;
            readonly pageDocumentDigest: components["schemas"]["SharedPrimitivesDigest"];
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
                readonly "application/json": components["schemas"]["PersistAuthorizedPageRequest"];
            };
        };
        readonly responses: {
            /** @description Authoritative domain outcome as a PagixCommitReceipt; a revision conflict consumes the authorization. */
            readonly 200: {
                headers: {
                    /** @description true when a recorded semantic outcome is replayed. */
                    readonly "Idempotency-Replayed"?: boolean;
                    /** @description Canonical request digest accepted for the operation. */
                    readonly "X-AnvilKit-Request-Digest"?: string;
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": components["schemas"]["PagixCommitReceipt"];
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
