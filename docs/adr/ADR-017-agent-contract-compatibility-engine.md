# ADR-017: Repository-owned Agent contract compatibility engine

| | |
| --- | --- |
| **Status** | Superseded by ADR-018 |
| **Resolves** | PLAN-0003 M0-T06 custom/deviating technology trigger |
| **Gate** | M1-T06 design and maintenance ownership |
| **Owner** | Platform Contracts |
| **Date** | 2026-08-09 |

## Context

The AnvilKit policy has four review classes—documentation-only, compatible additive, behaviorally narrowing, and breaking—and requires repository-local consumer evidence for narrowing changes. Generic schema-diff tools do not encode the immutable-reference, registry, finding-order, or authorization rules as one policy.

This ADR is retained only as decision history. ADR-018 replaced its first-party Agent contract versioning and compatibility policy for the greenfield canonical refactor. Nothing in the decision below is normative where it conflicts with ADR-018 through ADR-022.

## Decision

Maintain the small repository-owned engine in `packages/contracts-codegen/compatibility.ts` behind its machine-readable report format. It is limited to policy classification and does not replace native JSON Schema validators. Every rule is exercised by governed compatibility cases; unknown semantics fail as breaking. Narrowing changes require explicit consumer evidence and breaking changes require a new major version.

The replacement boundary is the versioned compatibility report. A mature alternative may replace the implementation only after it reproduces every case and stable finding, has acceptable dependency/security evidence, and preserves deterministic output.

## Consequences

The repository does not maintain this engine as a release-generation or migration gate for canonical Agent contracts. Any future compatibility policy requires new evidence and a new ADR after real external consumers exist.

## References

- PRD 0012 compatibility policy
- PLAN-0003 M0-T05..T06 and M1-T06
