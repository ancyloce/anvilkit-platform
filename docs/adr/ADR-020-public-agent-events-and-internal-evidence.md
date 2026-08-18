# ADR-020: Public Agent Events and Internal Evidence

| Item | Decision |
| --- | --- |
| Status | Proposed |
| Date | 2026-08-18 |
| Scope | P0-Kernel |
| Related ADR | ADR-018 |

## Context

The platform needs high-fidelity execution records for audit, recovery, debugging, and policy decisions. Exposing every `agent.*`, `model.*`, `tool.*`, `validation.*`, `artifact.*`, `approval.*`, `commit.*`, `domain.*`, and `recovery.*` detail as a public AgentEvent would permanently couple product consumers to internal orchestration steps.

Public events need to be small, stable, low-cardinality product signals. Internal Evidence needs to be detailed, security-controlled, and free to change with the implementation. They must not share an undifferentiated registry.

Because AnvilKit is greenfield, the existing event draft will be replaced directly. No event compatibility or conversion layer will be maintained.

## Decision

### 1. Create two explicit layers

#### Public layer: AgentEvent

The initial public registry contains only these consumer-facing lifecycle events:

- `run.created`
- `run.state-changed`
- `run.input-requested`
- `run.approval-requested`
- `run.artifact-available`
- `run.problem-recorded`

Internal step names must not enter the public registry merely for debugging convenience.

#### Internal layer: AgentEvidence

Internal Evidence records high-fidelity execution facts and may use these namespaces:

- `agent.*`
- `model.*`
- `tool.*`
- `validation.*`
- `artifact.*`
- `approval.*`
- `commit.*`
- `domain.*`
- `recovery.*`

The Evidence Registry is separate from the public Event Registry and is protected by stricter authorization, retention, and audit controls.

### 2. Public events are explicit projections

Internal Evidence produces public events only through a repository-owned projector. Projection rules must:

- use an allowlist and project nothing by default;
- produce only registered event types and fields;
- remove prompts, raw model responses, tool arguments/results, credentials, keys, internal stacks, and other sensitive material;
- be validated with positive, negative, and redaction fixtures;
- record the projector digest and source Evidence reference.

Evidence may produce no public event. Multiple Evidence records may be summarized into one public event. Consumers must not assume a one-to-one relationship.

### 3. Keep public and internal sequences independent

- `AgentEvent.sequence` is continuous and monotonically increasing within a run.
- Hidden Evidence must not create gaps in the public sequence.
- `AgentEvidence.evidenceSequence` is an independent monotonically increasing run sequence.
- Evidence may carry `causedByEvidenceId`, `publicEventId`, `turnId`, `workflowId`, and trace context.
- Public events must not expose DBOS step identifiers, database primary keys, or provider request identifiers as stable fields.

### 4. Streaming deltas are not durable public events

Tokens, partial text, and tool progress use a separate `AgentStreamDelta` transport shape:

- it is not AgentEvent and is not stored in the public Event Registry;
- it is not a system-of-record entry by default;
- it may be dropped, combined, sampled, or rate-limited;
- clients must recover final state using durable AgentEvent entries only;
- it must not contain credentials, system prompts, or unclassified tool payloads.

If a delta category must become durable, it must first be modeled as Evidence or as an explicit public projection.

### 5. Define the canonical shapes without version fields

AgentEvent includes at least:

- `eventId`, `runId`, `workspaceId`, and `projectId`;
- `eventType` and `sequence`;
- `occurredAt`;
- actor or system-subject reference;
- a type-specific bounded payload;
- trace and correlation references that exclude provider-private data.

AgentEvidence includes at least:

- `evidenceId`, `runId`, `workspaceId`, and `projectId`;
- `evidenceType` and `evidenceSequence`;
- recorded and actual occurrence times;
- producing component and definition, policy, and BOM digests;
- causal and trace references;
- data classification and retention category.

Neither shape contains a first-party release version field or suffix.

### 6. Replace the existing event draft directly

The implementation must remove the obsolete event definitions, generated types, fixtures, and registry entries in the same change that adds the canonical Event and Evidence layers. Do not add old-event adapters, dual registries, fallback parsers, or conversion jobs.

## Acceptance evidence

- the public Event Registry and internal Evidence Registry are separate;
- no first-party event or Evidence type carries a release-generation suffix or version field;
- obsolete event definitions and generated types are removed;
- Go and TypeScript cannot deserialize Event as Evidence or Evidence as Event;
- projection allowlist, redaction, and sensitive-data scanning tests pass;
- public sequence remains continuous in the presence of hidden Evidence;
- SSE reconnection depends only on the durable public cursor;
- losing temporary deltas does not change the final AgentRun state;
- Evidence read authorization, access audit, and retention tests pass.

## Consequences

### Benefits

- The public protocol remains small and consumer-oriented.
- The kernel retains the detailed facts required for recovery and audit.
- AgentRunner, model, and tool internals can change without exposing every implementation detail.

### Costs

- The platform must maintain a projector and two registries.
- Debugging tools need controlled Evidence access.
- Delta rate limiting and recovery behavior require separate implementation.

## References

- `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-v1.9.1-0816.md`
- `contracts/registries/agent-event-types.json`
- ADR-018: Canonical Agent Contract Refactor and P0-Kernel Profile
