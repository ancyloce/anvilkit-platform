# ADR-003: Redis Streams Retry, Delayed Retry, Pending Recovery, and DLQ Mechanics

| | |
| --- | --- |
| **Status** | Accepted as ADR-backed default (per doc 0010 conditional gate: "resolved **or accepted as ADR-backed defaults**") |
| **Resolves** | BD-003 (PLAN-0001 §4; doc 0010 §4, §10.3.1) |
| **Gate** | Phase 2 start (M2) |
| **Owner** | Backend |
| **Date** | 2026-07-01 |

## Context

The queue driver (FR-003), retry policy (FR-014), and pending recovery (FR-016) are unimplementable while delivery vs retry semantics stay ambiguous. Doc 0010 §10.3.1 supplies a complete recommended model, aligned with PRD 0008 §10.4/§12.2/D-1.

## Decision

Adopt the §10.3.1 model in full — **five mechanisms, never conflated**:

1. **Message delivery** — at-least-once via Redis Streams consumer group (stream `anvilkit:deployment.export.requested`, group `export-worker` per ADR-015). A delivery is not an attempt count.
2. **Pending recovery** — `XPENDING`/`XAUTOCLAIM` reclaim of delivered-but-unacked messages. Infrastructure-level; **never increments the business `attempt` counter**; relies on idempotency (FR-015).
3. **Business retry** — worker decision after a classified retryable failure (doc 0010 §13). Increments `attempt`; `maxRetries = 3` means **four executions max** with `attempt` values 0 (initial), 1, 2, 3; a retryable failure at `attempt = 3` is exhaustion.
4. **Delayed retry** — exponential backoff (base 10 s, max 5 m, jitter) enforced by explicit data structures, not by leaving the message pending:
   - Payloads: Redis **Hash** `anvilkit:deployment.export.retry:payloads`, envelope JSON keyed by `retryEnvelopeId`.
   - Delay index: Redis **ZSET** `anvilkit:deployment.export.retry:zset`, scored by `nextAttemptAt` (epoch millis), member = `retryEnvelopeId`.
   - Dispatcher loop: `ZRANGEBYSCORE ... -inf <now> LIMIT 0 <batch>` → load payload → re-enqueue to the main stream → remove ZSET member and Hash payload **only after** successful re-enqueue.
5. **Dead-letter routing** — stream `anvilkit:deployment.export.dlq` after exhaustion or for unparseable input (no extractable `deploymentId`). DLQ entries preserve the original payload, final errorCode, failedStage, attempt, traceId, workerId, and enqueue/failure timestamps.

**Retry-envelope idempotency:** `retryEnvelopeId = deploymentId + ":" + attempt + ":" + lastErrorCode` (the recommended key; the alternative `eventId + ":" + attempt` is not adopted). Repeated `HSET` of the same field is a harmless overwrite, never a second envelope.

**Ack rule (P0 invariant):** ack the original message only after (a) successful completion, (b) confirmed terminal/non-actionable deployment state, or (c) successful **write-then-ack** handoff of a retry envelope or DLQ entry. A lock conflict on an active deployment is none of these — delay, nack, requeue, or leave pending; never ack.

## Consequences

- Phase 2 (M2) queue work (EW-QUEUE-001..008) is unblocked; BD-002/ADR-002 is the other half of the gate.
- The driver interface must keep these mechanics behind the Kafka-ready seam (FR-021): at GA, retry/DLQ become dedicated topics keyed by `deploymentId`.
- Test obligations pinned by this ADR: AC-021 (five mechanisms distinct), AC-026 (Hash + ZSET model), AC-027 (envelope idempotency under crash-before-ack), AC-033 (four-execution semantics).

## References

- PLAN-0001 §4 (BD-003), §6 WS3, §13 (ADR-003)
- doc 0010 §10.3, §10.3.1, §10.3.3; PRD 0008 §10.4, §12.2, D-1
