# ADR-022: Contract Runtime Boundary, Security, and Topology Decision Process

| Item | Decision |
| --- | --- |
| Status | Accepted |
| Date | 2026-08-18 |
| Scope | P0-Kernel boundary and P0-Integration topology evidence |
| Related ADR | ADR-018 |

## Context

The platform needs a Contract Runtime that can execute deterministic contract logic produced by controlled definitions and support the required Go and TypeScript consumers. The design must freeze verifiable behavior and the security boundary first. There is not yet enough evidence to preselect a build-time library, embedded module, sidecar, or independent service.

The `anvilkit-platform` repository rules also state that production services are implemented in Go and TypeScript is tooling-only. A standalone Node/TypeScript production service therefore cannot be placed in that repository without an explicit governance change.

AnvilKit is greenfield. Only the selected implementation will be kept. No topology compatibility, parallel runtime, or fallback deployment will be maintained.

## Decision

### 1. Freeze behavior and security at P0-Kernel

Contract Runtime provides a transport-independent interface that can:

- validate input and output by canonical schema identity and digest;
- load an approved, content-addressed contract bundle;
- execute only allowed contract expressions deterministically;
- return a canonical result or ProblemDetails;
- emit the bundle, schema, runtime, and policy digests used for execution;
- produce equivalent results for the Go and TypeScript fixture suites.

P0-Kernel does not depend on a network-accessible Contract Runtime service. Kernel tests use the same boundary through an in-memory implementation or controlled fake.

### 2. Freeze mandatory security properties

Every candidate implementation must:

- deny network access by default;
- deny arbitrary file-system access, process creation, dynamic package installation, and native extension loading;
- execute only allowlisted capabilities from an approved bundle;
- verify bundle digest, signature or approval state, and policy before execution;
- treat time, randomness, environment, and locale as unavailable unless explicitly supplied as input;
- enforce execution time, memory, recursion or instruction budget, input/output size, and concurrency limits;
- fail closed with stable error codes;
- prevent logs and Evidence from exposing secrets or full sensitive payloads.

### 3. Keep semantics transport-neutral and unversioned

The boundary must not depend on HTTP, gRPC, in-process calls, language exceptions, or a release-generation suffix. Requests and responses contain:

- operation and contract/bundle identity and digest;
- canonical input;
- policy and resource limits;
- deterministic result or ProblemDetails;
- runtime identity and execution digest.

The same request under the same bundle, runtime profile, and declared inputs must produce the same canonical result. Performance is not part of semantic equivalence.

### 4. Select topology with P0-Integration evidence

Evaluate at least these candidates:

1. build-time or code-generation tool;
2. embedded Go module or runtime;
3. same-pod sidecar;
4. independent internal service.

The evidence matrix must cover:

- expression capability and Puck executable fidelity;
- Go and TypeScript interoperability and bundle distribution;
- failure isolation, escape surface, and least privilege;
- p50/p95 latency, throughput, cold start, and resource use;
- horizontal scaling, cache consistency, and multi-replica behavior;
- bundle rollout and rollback;
- observability, troubleshooting, and operational ownership;
- image or binary supply chain and patch cadence;
- compliance with `anvilkit-platform` repository governance.

After the evidence review, amend this ADR or replace it with the final topology decision. Implement only the selected topology and remove spike implementations. Do not ship multiple runtime topologies as compatibility or fallback modes.

### 5. Add gates for an independent Node/TypeScript service

If evidence selects a standalone Node/TypeScript production service, implementation requires all of the following first:

- a dedicated repository, or an explicit change to the platform production-language rule;
- service owner, deployment unit, image, SLO, capacity, and on-call responsibility;
- mTLS or workload identity, network policy, and bundle-supply-chain threat model;
- proof that network failure cannot bypass contract validation or permit an unverified AgentRun side effect.

Until these conditions are met, a Node/TypeScript Runtime is not an established production service inside `anvilkit-platform`.

### 6. Do not freeze deployment products prematurely

The following do not block P0-Kernel and are selected from evidence or deployment requirements:

- process, sidecar, or service topology;
- replica count, autoscaling, and cache product;
- object storage or messaging product;
- numerical SLO targets;
- whether Node/TypeScript becomes an independent production service.

## Required implementation work

1. Define the canonical transport-neutral request, response, and error contracts without release suffixes.
2. Implement the kernel boundary and controlled fake.
3. Add Go and TypeScript equivalence fixtures.
4. Add sandbox escape, resource exhaustion, malicious bundle, and digest-bypass tests.
5. Build time-boxed topology spikes and complete the evidence matrix.
6. Select one topology, record the decision, and remove the rejected spike implementations.

## Acceptance evidence

### P0-Kernel

- transport-neutral request, response, and error contracts are included in the P0-Kernel Profile;
- no first-party Runtime contract carries a release-generation suffix or version field;
- Go and TypeScript equivalence fixtures pass;
- no-network, no-file, timeout, memory/budget, and malicious-bundle tests pass;
- bundle digest and approval checks cannot be bypassed;
- Agent Service depends only on the Runtime boundary, not a preselected topology.

### P0-Integration

- the four-candidate evidence matrix is complete;
- performance, failure-isolation, and security tests ran in the target environment;
- one topology is selected with explicit ownership, rollback, and removal of rejected spikes;
- a selected Node/TypeScript service has resolved repository governance and deployment ownership.

## Consequences

### Benefits

- The kernel freezes the correct behavior and security boundary first.
- Deployment is selected by evidence without blocking kernel completion.
- Only one production topology is implemented and operated.

### Costs

- The project must maintain a transport-neutral boundary while running the spikes.
- P0-Integration cannot claim topology completion before the evidence matrix is complete.
- Security testing must cover every serious candidate during evaluation.

## Amendments

### 2026-08-22 — the boundary between this decision and ADR-024

ADR-024 decides that the Agent Service is deployed as a StatefulSet with a
per-instance retained claim. That is a statement about a workload kind, and §6
above says topology is not frozen at P0-Kernel, so the two have to be read
together rather than left to be reconciled by whoever reads them next.

They do not overlap, and the reason is what each is about.

§6 defers **product and sizing choices that evidence should decide**: which
topology the *Contract Runtime* is deployed in, how many replicas run, how they
scale, and which cache, object-store, and messaging products are used. Nothing
in the kernel's behavior depends on those answers, so choosing them early would
be choosing without the evidence that should decide them.

ADR-024 decides the one thing evidence cannot defer: **where instance-owned
durable state lives**. Design 0001 requires that a slow consumer is
disconnected only after the last durable cursor is recorded, and that the
record survives. A record held on an instance that can be rescheduled without
its storage is a record that does not survive, so the requirement itself picks
the workload kind — not a preference about it. Deferring that would leave a
governed durability requirement unmet while appearing to defer a product
choice.

So the rule stands as written, with its subject made explicit:

- topology, replicas, autoscaling, storage class, and every product named in §6
  remain evidence-driven, including for the Agent Service — ADR-024 §5 says so
  in its own terms;
- the Agent Service's workload kind and claim retention are decided by ADR-024
  because a governed durability requirement forces them, and they are the only
  deployment facts P0-Kernel freezes;
- the Contract Runtime's topology is untouched by ADR-024 and remains open
  under §4 and §6.

An Agent Service deployment that meets the durability requirement another way
would need an amendment to ADR-024, not an appeal to this section.

## References

- `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-0808.md`
- ADR-018: Canonical Agent Contract Refactor and P0-Kernel Profile
- ADR-024: Agent Service Instance Topology and the Durable Stream-Cursor Spool
- Root `AGENTS.md` and `CLAUDE.md` production-language and repository-boundary rules
