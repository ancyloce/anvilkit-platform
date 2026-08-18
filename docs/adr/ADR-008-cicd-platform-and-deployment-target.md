# ADR-008: CI/CD Platform and Deployment Target

| | |
| --- | --- |
| **Status** | Accepted (assumption-based — see Confirmation note) |
| **Resolves** | BD-008 (PLAN-0001 §4; doc 0010 §4) |
| **Gate** | Phase 1 start — first decision overall; nothing else may start until resolved |
| **Owner** | DevOps |
| **Date** | 2026-07-01 |

## Context

BD-008 blocks Phase 1: repository bootstrap (FR-001) needs CI from day one, and image publishing plus the deployment target gate Phases 4–5. The source document supplies no default — this is the only Phase 0 decision with no recommended approach.

## Decision

1. **CI/CD platform: GitHub Actions.** The platform repo and the service repos are hosted on GitHub (`github.com/ancyloce/*`), so GitHub Actions is the zero-friction choice: no external CI account, native required-check enforcement on PRs, and first-party container-registry integration. GitHub-hosted runners at MVP.
2. **Container registry: GHCR (`ghcr.io`).** Immutable tags per the release plan (PLAN-0001 §10): git SHA on every main build, semver on release tags; tags never reused. PR builds build but do not publish.
3. **Deployment target: Kubernetes.** The source deployment plan (doc 0010 §18) is Kubernetes-shaped (Deployment, probes on 8081, `terminationGracePeriodSeconds >= 60`, K8s Secrets). The **specific cluster/provider is deliberately deferred** to the first-deployed-environment gate (M2, alongside BD-006/ADR-006) — it does not block Phase 1, which needs only CI and image publishing.
4. **CI pipeline stages** follow PLAN-0001 §10 exactly: lint (golangci-lint), `go vet`, unit (`go test -race`), integration (Redis + MinIO + mocks as service containers), contract tests, dependency audit (+ `govulncheck`), container build, K8s manifest validation.
5. **CD promotion:** dev → staging → production with a manual approval gate into production (source recommended shape); implemented via GitHub Actions environments when the first deployed environment is provisioned.

## Consequences

- Phase 1 (EW-REPO-001..005) is unblocked; EW-REPO-001 is complete with this ADR.
- Worker CI lives in the `anvilkit-export-worker` service repo; the platform repo carries its own CI for contracts/tooling and submodule-pin validation.
- GHCR image path: `ghcr.io/ancyloce/anvilkit-export-worker`.
- Kubernetes manifests (or Helm — ADR to be recorded with EW-K8S-002) live under `infra/` in the platform repo.

## Confirmation note

This decision is recorded autonomously from repository evidence (GitHub hosting) because BD-008 blocks all other work. It is docs-only and cheap to reverse before Phase 1 CI lands. **DevOps owner should confirm or veto at the next review; silence at M1 review = confirmed.**

## References

- PLAN-0001 §4 (BD-008), §10 (CI/CD and release plan), §14 step 1
- doc 0010 §4 (BD-008), §18 (deployment plan)
