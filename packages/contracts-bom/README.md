# @anvilkit/contracts-bom

Build-only Contract BOM tooling for PLAN-0003. The initial M5-T01 candidate
checks closed structural graph rules and complete dual-digest references:

```bash
bun packages/contracts-bom/check-m5.ts
```

`bom-graph.ts` is intentionally not a canonicalizer, identity implementation,
resolver, or publisher. It performs no network access and does not create a
release artifact. Those capabilities remain gated by M3, M4-T07, DP-008, trust,
and OCI vendor evidence.
