# ADR-017: Repository-owned Agent contract compatibility engine

| | |
| --- | --- |
| **Status** | Accepted |
| **Resolves** | PLAN-0003 M0-T06 custom/deviating technology trigger |
| **Gate** | M1-T06 design and maintenance ownership |
| **Owner** | Platform Contracts |
| **Date** | 2026-08-09 |

## Context

The AnvilKit policy has four review classes—documentation-only, compatible additive, behaviorally narrowing, and breaking—and requires repository-local consumer evidence for narrowing changes. Generic schema-diff tools do not encode the immutable-reference, registry, finding-order, or authorization rules as one policy.

## Decision

Maintain the small repository-owned engine in `packages/contracts-codegen/compatibility.ts` behind its machine-readable report format. It is limited to policy classification and does not replace native JSON Schema validators. Every rule is exercised by governed compatibility cases; unknown semantics fail as breaking. Narrowing changes require explicit consumer evidence and breaking changes require a new major version.

The replacement boundary is the versioned compatibility report. A mature alternative may replace the implementation only after it reproduces every case and stable finding, has acceptable dependency/security evidence, and preserves deterministic output.

## Consequences

Platform Contracts owns rule maintenance and exit planning. The custom engine remains auditable and deliberately small; feature growth without a governed case is prohibited.

## References

- PRD 0012 compatibility policy
- PLAN-0003 M0-T05..T06 and M1-T06
