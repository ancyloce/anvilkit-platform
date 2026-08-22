# ADR-024: Agent Service Instance Topology and the Durable Stream-Cursor Spool

| Item | Decision |
| --- | --- |
| Status | Accepted |
| Date | 2026-08-21 |
| Amended | 2026-08-22 — governance precedence and topology boundary made explicit |
| Scope | P0-Kernel, Agent Service instance state only |
| Related ADR | ADR-006, ADR-008, ADR-012, ADR-020, ADR-022 |

## Context

Design 0001 §"streaming" requires that a slow consumer is disconnected **after
the last durable cursor is recorded**: when an event stream ends, the service
records the last public cursor the client actually received. That record is the
only account of what a disconnected client had, so a slow-consumer or
authority-revocation incident is only diagnosable — and only resumable — if it
survives.

The authoritative cursor store is PostgreSQL. A write to it can fail, and the
common reason is that PostgreSQL is briefly unreachable. Retrying into the same
store does not address that, and reporting the loss to a metric is not a place
a record is kept: a counter names an incident, it does not preserve the fact.

The Agent Service therefore holds a refused disconnect record on the instance's
own durable storage and drains it into the authoritative store once that store
is reachable — at the next start, and on a bounded sweep thereafter. That makes
the instance the owner of durable local state, which is a deployment-topology
question and not only a code question.

Design 0005 records that production topology, replicas, and autoscaling remain
evidence-driven. This ADR decides only the shape the durability requirement
forces; it does not fix the evidence-driven values.

## Decision

### 1. The Agent Service is deployed as a StatefulSet with a per-instance claim

`infra/k8s/agent-service-statefulset.yaml` deploys the service as a StatefulSet
whose `volumeClaimTemplates` give every instance its own `ReadWriteOnce` claim,
mounted at the path `ANVILKIT_STREAM_CURSOR_SPOOL` names.

The alternatives were rejected on the guarantee, not on preference:

- **Deployment with `emptyDir`** survives a container restart inside a pod, but
  not pod rescheduling or deletion — which is the case the spool exists for. It
  would leave the governed requirement unmet while appearing to meet it.
- **Deployment with a shared `ReadWriteMany` claim** is semantically sound —
  held records are named by a per-connection digest, draining is idempotent, and
  any instance can place any record — but it puts a governed durability
  guarantee on storage that not every cluster provides, and network filesystems
  weaken the flush semantics the spool relies on.

A StatefulSet delivers the guarantee on any storage class that survives
rescheduling, which is the weakest assumption that still satisfies the
requirement.

### 2. Held records outlive scale-down and StatefulSet deletion

`persistentVolumeClaimRetentionPolicy` is `Retain` for both `whenDeleted` and
`whenScaled`. A claim reclaimed while it still holds records would discard the
only account of what those clients received, so reclamation is never automatic.

### 3. The spool path is declared beside its mount

`ANVILKIT_STREAM_CURSOR_SPOOL` is set as a container environment variable next
to the `volumeMount`, not in the ConfigMap. The configured path and the mounted
path are one decision and cannot be allowed to drift apart.

Configuration validation requires the variable wherever the authenticated agent
API is composed, so a deployment with nowhere durable to keep a disconnect
record fails at startup rather than at the first disconnect it would have had
to record.

### 4. The volume must be writable by the non-root user

The pod runs non-root with a read-only root filesystem. `fsGroup` is set so the
mounted claim is group-writable; without it the spool's startup probe fails and
the instance refuses to serve. The spool is the only path the service writes to,
and it is a mounted volume, so the root filesystem stays read-only.

### 5. Sizing remains evidence-driven

Replicas and resource values in the manifest are proposed defaults, re-profiled
in staging before launch review — the same standing ADR-012 gives the worker's
values. This ADR does not resolve the topology and autoscaling questions design
0005 leaves open beyond the instance-state shape decided above.

### 6. This decision is subordinate to ADR-018 through ADR-022

ADR-016 and ADR-018 through ADR-022 hold the highest architecture-governance
priority, and this ADR does not change that. It decides one thing inside the
boundary those ADRs draw, and it is bounded so that nothing in it can be read
as reopening them.

What this ADR decides:

- the Agent Service's workload kind, because a governed durability requirement
  in design 0001 forces it;
- that per-instance claims are retained rather than reclaimed, for the same
  reason;
- that the spool path is declared beside its mount and required at startup.

What this ADR does not decide, and what continues to be governed elsewhere:

- **Contract Runtime topology** — open under ADR-022 §4 and §6, and untouched
  here. This ADR is about the Agent Service; the two are different subjects.
- **Replicas, autoscaling, storage class, and every product** ADR-022 §6 names
  — evidence-driven, including for the Agent Service, as §5 above already says.
- **Numerical SLOs** — approved only on the terms design 0001 sets.
- **Contract governance** — ADR-018's canonical, non-versioned, no-compatibility
  rules are unaffected: nothing here introduces a release generation, a
  migration path, a dual system, or a fallback.

If a deployment can meet the "record before disconnect" requirement without
instance-owned durable state, that is an amendment to this ADR rather than an
appeal to ADR-022 §6: §6 defers choices evidence should make, and this is not
one of them.

## Acceptance evidence

- the manifest and its ConfigMap example validate under the repository's
  `kubeconform -strict` gate;
- a disconnect record the cursor store refuses is held durably and is placed by
  a successor process once the store is reachable (proved in the spool unit
  suite and against real storage in the persistence integration suite);
- configuration that composes the agent API without a declared spool directory
  is refused at startup;
- the built image starts non-root against a read-only root filesystem with only
  the spool volume mounted, resolves its pinned contract material, and serves
  `/healthz` and `/readyz`.

## Consequences

### Benefits

- The governed "record before disconnect" requirement holds across process
  restart and pod rescheduling.
- The guarantee needs no ReadWriteMany storage class.
- Instance-owned durable state is expressed by the workload kind rather than
  left as an operational convention.

### Costs

- The Agent Service gains stable pod identity and ordered rollout semantics.
- Retained claims are an operator responsibility: a permanently removed replica
  leaves a claim whose records must be drained or consciously discarded.
- The image carries the pinned canonical contract material the service verifies
  before it serves, so the contract root is part of the image contract: CI starts
  the built image and fails the build if that material cannot be resolved.

## References

- `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-0808.md`
- `docs/design/0005-agent-service-development-design-0808.md`
- ADR-020: Public Agent Events and Internal Evidence
- ADR-022: Contract Runtime Boundary and Evidence-Driven Topology Decision
- ADR-012: Kubernetes Resource Sizing and Scaling
