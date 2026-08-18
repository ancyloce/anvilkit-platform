# ADR-018: Canonical Agent Contract Refactor and P0-Kernel Profile

| Item | Decision |
| --- | --- |
| Status | Accepted |
| Date | 2026-08-18 |
| Scope | P0-Kernel |
| Related ADR | ADR-016 |
| Supersedes | ADR-017 |

## Context

AnvilKit is a greenfield project with no released contract consumers and no production data that requires preservation. The repository currently contains first-party contract names and paths that encode release generations. Those artifacts reflect an earlier design iteration rather than a compatibility obligation.

Maintaining parallel first-party contract generations would add adapters, conversion rules, dual fixtures, and release gates before the product has a stable external consumer. That work does not improve the kernel and would slow the required refactor.

ADR-017 established major-version compatibility handling. This ADR supersedes that policy for the current greenfield phase.

## Decision

### 1. Refactor the canonical contract set now

There is one canonical Agent Contract set. The repository must replace the existing draft contracts directly rather than introducing another first-party contract generation.

The refactor must include at least the following changes:

1. Remove `tenantId`; use `workspaceId` as the Pagix Team authorization boundary.
2. Require `projectId` in `TargetReference`.
3. Expand `AgentDefinition` to include:
   - role and owner;
   - input JSON Schema reference or digest;
   - allowed delegates, maximum delegation depth, and maximum fan-out;
   - `definitionDigest`;
   - output validation and repair policy.
4. Apply the event and Evidence boundaries defined by ADR-020.
5. Apply the command ownership and authorization envelope defined by ADR-021.
6. Preserve the identity, digest, signature, trust-root, and clock decisions in ADR-016.

### 2. Remove first-party contract version mechanics

First-party contract names, schemas, registries, generated types, media types, and API models must not carry release-generation suffixes or fields.

Examples of the required naming style:

```text
AgentRun
AgentDefinition
AgentEvent
AgentEvidence
TargetReference
ApplyAuthorization
CreateAgentRunRequest
```

The repository must not retain release-generation suffixes, release-generation fields, or parallel release-number contract directories.

Contract identity is established by the canonical schema path, content digest, lock manifest, and repository commit. It is not established by a first-party version suffix.

### 3. Do not maintain compatibility code

The refactor is an atomic repository cutover:

- no old/new contract coexistence;
- no conversion adapters;
- no fallback deserializers;
- no dual-write or dual-read paths;
- no preservation of obsolete fixtures as release evidence;
- no compatibility matrix for superseded draft contracts.

All in-repository consumers, generated packages, fixtures, mocks, examples, and tests must move to the canonical contract in the same change set. Obsolete generated code and draft lock evidence must be removed.

### 4. Replace version directories with canonical locations

The target layout should use stable, non-versioned first-party paths, for example:

```text
contracts/canonical/
contracts/registries/
contracts/fixtures/
contracts/generated/go/
contracts/generated/typescript/
contracts/contracts.lock.json
contracts/p0-kernel-profile.json
```

Exact directory names may follow repository conventions, but parallel release-number directories are prohibited.

### 5. Add a machine-readable P0-Kernel Contract Profile

The repository must own a CI-verifiable profile containing at least:

- every P0-Kernel logical contract;
- canonical schema path and content digest;
- required consumers: Go and TypeScript;
- non-blocking consumer: Java;
- Python only after a real production consumer exists;
- generated artifacts and package digests;
- positive and negative fixtures;
- ADR-016 identity and signing fixtures;
- the Event, Evidence, command, and Apply Authorization contract references.

The profile is the only machine-readable definition of the P0-Kernel contract scope. Prose in the design document does not replace it.

### 6. Define the post-refactor change rule

Until the first external release, a contract change is made by coordinated atomic refactor and regeneration. After external consumers exist, the project must make a new explicit governance decision based on real consumer requirements. This ADR does not pre-design that future compatibility system.

## Required implementation work

1. Move canonical schemas out of the release-number directory.
2. Rename all first-party generated types and API models to remove generation suffixes.
3. Implement the complete `AgentDefinition`, `TargetReference`, Event, Evidence, command, and authorization shapes.
4. Regenerate Go and TypeScript packages.
5. Update every repository consumer in the same change set.
6. Delete obsolete generated packages, adapters, fixtures, and lock evidence.
7. Generate the new canonical lock manifest and P0-Kernel Profile.
8. Update CI so only the canonical contract set can pass.

## Acceptance evidence

This ADR may become Accepted only when:

- no first-party contract type uses a release-generation suffix;
- no canonical contract is stored under a parallel version directory;
- `tenantId` is absent from the Agent Contract surface;
- `TargetReference` requires `projectId`;
- `AgentDefinition` contains all required kernel fields;
- no compatibility adapter, dual reader, dual writer, or fallback parser remains;
- all in-repository consumers use the canonical contract;
- Go and TypeScript generation, validation, digest parity, and fixtures pass;
- the P0-Kernel Contract Profile is parsed and enforced by CI;
- obsolete draft lock evidence is removed rather than reported as current completion evidence.

## Consequences

### Benefits

- The project pays the refactor cost once, before external adoption.
- The kernel has one source of truth and one set of generated types.
- Go and TypeScript remain the only blocking contract consumers.
- Future compatibility policy is based on real consumers rather than hypothetical ones.

### Costs

- The refactor is intentionally breaking inside the repository.
- All current consumers and fixtures must change together.
- Existing draft completion reports become invalid and must be regenerated.

## References

- `docs/design/0001-anvilkit-controlled-agent-platform-product-technical-design-0808.md`
- `docs/adr/ADR-016-agent-contract-signing-trust-and-revocation.md`
- `docs/adr/ADR-017-agent-contract-compatibility-engine.md` (superseded)
