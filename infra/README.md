# Local Development Stack

Single compose stack for the export-worker development loop (EW-LOCAL-001, PLAN-0001 §11):
Redis, MinIO (+ bucket init), the three contract-conformant mocks (deployment-service,
asset-service, and the render-origin stand-in), and the worker running the **full M3 export
pipeline** — consume → render → harvest → upload → manifest → pointer → `ARTIFACT_READY` →
ready event.

The render-origin service here is a **contract stand-in** (mocks/renderoriginmock): the real
`anvilkit-render-origin` is hosted by `anvilkit-studio` and replaces it once BD-007/ADR-007
is confirmed with the studio owners. The worker cannot tell the difference — that is the
point of the §8.3 contract.

## Happy path (PLAN-0001 §11)

```bash
# 1. Bring up the stack (mocks auto-seed fixtures/ at boot)
docker compose -f infra/docker-compose.yml up -d --build

# 2. Publish the sample export request event (dep_local_001, slug home)
./infra/scripts/publish-event.sh

# 3. Watch the pipeline run
docker compose -f infra/docker-compose.yml logs -f export-worker

# 4. Verify status and the outcome event
curl -s -H 'Authorization: Bearer local-dev-token' \
  http://localhost:8080/internal/deployments/dep_local_001        # → ARTIFACT_READY
docker compose -f infra/docker-compose.yml exec redis \
  redis-cli XRANGE anvilkit:deployment.artifact.ready - +         # → one ready event

# 5. Verify the artifact is complete and self-contained
./infra/scripts/verify-artifact.sh dep_local_001 site_local

# 6. Self-containment spot check with the origin stopped (AC-009 groundwork)
docker compose -f infra/docker-compose.yml stop render-origin-mock
./infra/scripts/verify-artifact.sh dep_local_001 site_local
```

## Negative and multipart scenarios (EW-LOCAL-004 fixtures)

```bash
# Residual asset:// → EXPORT_FAILED with UNRESOLVED_ASSET_REF (T-asset-unresolved-ref)
./infra/scripts/publish-event.sh fixtures/export-requested.broken-asset.json

# /_next/image → EXPORT_FAILED with UNSUPPORTED_DYNAMIC_IMAGE_OPTIMIZER (T-next-image-guard)
./infra/scripts/publish-event.sh fixtures/export-requested.next-image.json

# > 16 MB asset → multipart upload with the same metadata contract (AC-006)
./infra/scripts/publish-event.sh fixtures/export-requested.huge.json

# Inspect failure events
docker compose -f infra/docker-compose.yml exec redis \
  redis-cli XRANGE anvilkit:deployment.export.failed - +
```

`./infra/scripts/seed-fixtures.sh` resets and re-seeds the deployment mock between runs.

## Scriptable mock failures

```bash
# deployment mock (:8080) and asset mock (:8081): none|timeout|http500|http401|http403
curl -X POST http://localhost:8080/__mock/control -d '{"failMode":"http500"}'
curl -X POST http://localhost:8081/__mock/control -d '{"failMode":"http403"}'
```

## Tracing (EW-OBS-003)

```bash
docker compose -f infra/docker-compose.yml --profile tracing up -d
# then uncomment OTEL_EXPORTER_OTLP_ENDPOINT on the worker service and re-up:
docker compose -f infra/docker-compose.yml logs -f otel-collector   # span summaries
```

## Alerts and Kubernetes (M4 slices)

- `infra/alerts/export-worker-rules.yaml` — the nine §15.4 Prometheus alert rules
  (promtool-validated in CI; thresholds tuned in staging drills before launch).
- `infra/k8s/` — the export-worker Deployment (probes on 8081,
  `terminationGracePeriodSeconds: 90`, ADR-012 proposed sizing) and the non-secret
  ConfigMap example. Secrets arrive via the secret manager per ADR-006 — never from the
  repo. kubeconform-validated in CI; the CD promotion flow lands at M5 (EW-K8S-004).

## Queue retention and replay (EW-QUEUE-009, ADR-011 — ops sign-off pending, OQ-2/AC-031)

Redis Streams have no TTL: retention is enforced operationally with `XTRIM` (a scheduled
trim job lands with the deployed environments, BD-006). **Floors (PRD 0010 §10.3.3):**

| Stream / structure | Floor | Rationale |
| --- | --- | --- |
| `anvilkit:deployment.export.requested` | 24 h dev/staging · **72 h production** | must cover the max worker outage window |
| `anvilkit:deployment.export.retry:*` (Hash + ZSET) | 24 h | max retry delay (5 m) + operational buffer; entries self-delete on dispatch |
| `anvilkit:deployment.export.dlq` | **7 days** | manual inspection + replay window |

**Manual DLQ replay procedure (MVP — tooling before broad rollout):**

1. Inspect: `redis-cli XRANGE anvilkit:deployment.export.dlq - +` — each entry carries the
   original `payload`, final `errorCode`, `failedStage`, `attempt`, `traceId`, `workerId`,
   and both timestamps.
2. Fix the root cause (the DLQ is exhaustion or unparseable input — replaying without a fix
   reproduces the failure).
3. Re-enqueue the original payload with the attempt counter **reset**:
   `redis-cli XADD anvilkit:deployment.export.requested '*' payload '<payload>' attempt 0`
   — safe because processing is idempotent by `deploymentId`.
4. Optionally delete the replayed DLQ entry: `redis-cli XDEL anvilkit:deployment.export.dlq <id>`.

## Troubleshooting (PLAN-0001 §11)

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Worker restart-loops at boot (`restart: unless-stopped` retries the fail-fast exit) | Missing/invalid required config, demo guard, or unreachable Redis/MinIO (fail-fast) | `docker compose logs export-worker` for the startup error; `ENVIRONMENT`; `RENDER_ORIGIN_URL`. Transient dependency outages self-heal once the dependency is back |
| `/readyz` returns 503 | Redis/MinIO unreachable at boot | `docker compose ps`; `REDIS_URL` / `S3_ENDPOINT` |
| Job fails with RENDER_ORIGIN_401/403 | Token mismatch between worker and render-origin | `INTERNAL_SERVICE_TOKEN` vs `INTERNAL_SERVICE_TOKENS` parity |
| Job fails with VERSION_SLUG_MISMATCH (409) | Event/record version differs from the published page | seeded page version vs record `version` |
| Uploads fail with NoSuchBucket | Bucket-init did not run | `docker compose logs minio-init` |
| Message consumed but never completes | Lock held by a stale owner | `redis-cli XPENDING anvilkit:deployment.export.requested export-worker`; TTL on `lock:deployment:{id}` |
| Retries never fire | Dispatcher not running or clock skew vs `nextAttemptAt` | `redis-cli ZRANGE anvilkit:deployment.export.retry:zset 0 -1 WITHSCORES`; worker logs `retry dispatched` |
| Event silently disappears | Unparseable payload routed to DLQ | `redis-cli XRANGE anvilkit:deployment.export.dlq - +` |
| Duplicate processing observed | Lock disabled/misconfigured | worker logs; `anvilkit_export_worker_lock_conflict_total` |
