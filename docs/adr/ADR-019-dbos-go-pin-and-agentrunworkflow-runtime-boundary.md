# ADR-019: DBOS Go Pin and AgentRunWorkflow Runtime Boundary

| Item | Decision |
| --- | --- |
| Status | Proposed |
| Date | 2026-08-18 |
| Scope | P0-Kernel |
| Current dependency | `github.com/dbos-inc/dbos-transact-golang v0.20.0` |
| Required dependency | `github.com/dbos-inc/dbos-transact-golang v1.1.0` |

## Context

Agent Service currently pins DBOS Go `v0.20.0`. DBOS Go `v1.0.0` introduced breaking library changes, and `v1.1.0` is the current stable release as of this decision.

AnvilKit is a greenfield project. There is no production workflow history, production database, or released runtime contract to preserve. The project should update the dependency and refactor the integration now instead of building mixed-runtime operation, workflow compatibility, or migration machinery.

The DBOS number is an external dependency pin required for reproducible builds. It does not introduce versioned AnvilKit contracts or names.

## Decision

### 1. Pin DBOS Go exactly

Agent Service must use:

```text
github.com/dbos-inc/dbos-transact-golang v1.1.0
```

Do not use `latest`, a branch, a pseudo-version, or a loose range. Commit the resulting `go.sum` changes.

### 2. Refactor immediately; do not support mixed DBOS generations

The change is a direct cutover from the current development dependency to `v1.1.0`:

- no mixed old/new DBOS executors;
- no old workflow replay support;
- no compatibility wrapper for removed DBOS APIs;
- no rolling-upgrade protocol for development workflow data;
- no migration path for disposable local or test system databases.

Development and test DBOS system databases may be recreated after confirming that they contain no production or irreplaceable evidence. Any database reset must remain explicit and scoped to the verified non-production DBOS database.

### 3. Keep DBOS inside the infrastructure adapter

Application and domain code depend only on a repository-owned durable runtime port. The following DBOS details must not cross the adapter boundary:

- DBOS Context, workflow handle, queue, and error types;
- DBOS workflow and step options;
- DBOS system database models and status values.

The adapter maps DBOS errors, cancellation results, and execution state into AnvilKit ProblemDetails, AgentRun state, and internal Evidence.

### 4. Expose only the AgentRunWorkflow business abstraction

The only top-level durable business workflow is `AgentRunWorkflow`. Business code must not receive a generic `[]Step` or arbitrary DAG API.

The workflow must contain recoverable boundaries for:

- loading and validating the Agent Definition and target;
- executing an AgentRunner turn;
- persisting TurnDecision;
- requesting and waiting for input or approval;
- invoking a Specialist;
- recording artifacts, public events, and internal Evidence;
- cancellation, retry, recovery, and terminal-state handling.

### 5. Use deterministic workflow code

- Non-deterministic I/O and side effects run only inside declared durable steps.
- Every external side effect uses a stable idempotency key.
- Workflow code must not depend directly on wall-clock time, random values, process environment, or unordered iteration.
- Input and output serialization is pinned by canonical fixtures.
- A workflow code change that invalidates existing development executions requires those executions to be discarded and the non-production DBOS state to be recreated. No compatibility branch is added.

### 6. Do not add a second durable engine

DBOS is the only durable execution engine. A custom PostgreSQL journal must not operate beside it as a dual-write or fallback authority. Replacing DBOS would require a separate ADR and a complete cutover.

## Required implementation work

1. Update `go.mod` and `go.sum` to DBOS Go `v1.1.0`.
2. Replace the removed DBOS APIs with the current Context, Client, queue, option, and error APIs.
3. Implement the repository-owned durable runtime port and DBOS adapter.
4. Implement `AgentRunWorkflow`, AgentRunner, AgentRegistry, TurnDecision, and Specialist paths.
5. Remove obsolete integration code rather than wrapping it.
6. Recreate disposable development/test DBOS databases where required.
7. Add crash, retry, cancellation, waiting, and multi-replica tests against a clean database.

## Acceptance evidence

- `go.mod` and `go.sum` pin DBOS Go `v1.1.0` exactly;
- no DBOS type crosses the infrastructure adapter boundary;
- no compatibility wrapper or mixed-generation executor remains;
- `AgentRunWorkflow`, AgentRunner, AgentRegistry, TurnDecision, and Specialist are implemented;
- process-crash recovery, waiting for input, waiting for approval, cancellation, retry exhaustion, and multi-replica contention tests pass;
- external side-effect idempotency is proven with failure injection;
- a clean database can be initialized and the full workflow test suite can run from zero state;
- the platform status report links to executable evidence rather than a design assertion.

## Consequences

### Benefits

- The project adopts the stable DBOS API before production use.
- No effort is spent preserving disposable development workflow history.
- DBOS remains replaceable behind a repository-owned boundary.

### Costs

- Existing local workflow data may be discarded after verification.
- The integration must be refactored in one coordinated change.
- Tests and fixtures tied to the earlier DBOS API must be rewritten.

## References

- [DBOS Go v1.1.0 release](https://github.com/dbos-inc/dbos-transact-golang/releases/tag/v1.1.0)
- [DBOS Go v1.0.0 breaking changes](https://github.com/dbos-inc/dbos-transact-golang/releases/tag/v1.0.0)
- `services/agent-service/go.mod`
- `docs/design/0005-agent-service-detailed-design.md`
