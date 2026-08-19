# Contracts Codegen (Bun/TypeScript tooling)

Tooling workspace for both contract systems in this repository. TypeScript here is
tooling-only (PRD 0009); no production service code lives in this package.

## Canonical Agent contracts (ADR-018)

```bash
bun packages/contracts-codegen/check-agent-contracts.ts     # source lint, closed refs, registries, fixtures, separation, corpora
bun packages/contracts-codegen/check-agent-specs.ts         # Redocly + AsyncAPI parser lint over the closed projections
bash packages/contracts-codegen/prepare-agent-generators.sh # install pinned Go generators (oapi-codegen v2.8.0, go-jsonschema v0.24.1)
bun packages/contracts-codegen/generate-agent-packages.ts   # deterministic Go + TypeScript generation + agent-service intake sync
bun packages/contracts-codegen/check-agent-profile.ts       # P0-Kernel Profile, canonical lock, intake byte-identity
```

Deliberate regeneration modes (diffs are review-visible):

```bash
bun packages/contracts-codegen/check-agent-contracts.ts --update-manifest   # fixtures/manifest.json
bun packages/contracts-codegen/check-agent-profile.ts --update              # profile + lock + agent-service pin
```

Go↔TypeScript parity (ADR-018 requires 100% semantic and fixture parity):

```bash
bun packages/contracts-codegen/emit-typescript-conformance.ts --repository-root . > /tmp/ts.json
(cd packages/contracts-go && go run ./cmd/conformance --repository-root ../.. > /tmp/go.json)
bun packages/contracts-codegen/compare-agent-conformance.ts --repository-root . --result /tmp/go.json --result /tmp/ts.json
# identity and signature parity use emit-typescript-identity/signature and
# cmd/identity-conformance, cmd/signature-conformance with compare-agent-identity/signature.
```

Key modules: `source-lint.ts` (canonical source profile + closed digest-pinned
`anvilkit://schema/<name>?digest=sha256:<hex>` references), `native-validator.ts`
(Ajv 2020-12 adapter), `identity.ts`/`native-identity.ts` (RFC 8785 JCS +
domain-separated identities), `native-signature.ts`/`security-profile.ts`
(Ed25519 DSSE and compact JWS per ADR-016/021), `spec-normalization.ts`
(closed-reference projections for external tooling),
`agent-generators.lock.json` (pinned generator identities),
`conformance-result.schema.json` (Go/TypeScript result shape).

Java has no active generator (non-blocking consumer); Python is absent until a
real consumer exists (ADR-018 §5). Neither may be reintroduced without a new
governance decision — `scripts/dependency-audit.ts` enforces this.

## Legacy export-worker contracts (ADR-001)

```bash
bun packages/contracts-codegen/generate.ts       # validate fixtures + regenerate Go bindings into services/export-worker/contracts/
bun packages/contracts-codegen/check-freeze.ts   # verify the frozen export lock (contracts/contracts.lock.json)
bun packages/contracts-codegen/generate.ts --update-lock   # deliberate re-lock after an additive change
```

The legacy pipeline reads `contracts/{events,artifact,openapi}/v1` and remains
frozen under ADR-001 until a separate governance decision changes that scope.
