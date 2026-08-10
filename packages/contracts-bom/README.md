# @anvilkit/contracts-bom

Build-only Contract BOM tooling for PLAN-0003. The retained M5 gate checks the
closed graph, deterministic composition and projections, dual-digest resolver,
offline cache, and governed OCI publication/mirror/rollback evidence:

```bash
bun run --cwd packages/contracts-bom check-m5
```

The separately invoked `drill-m5-oci` command creates an isolated Zot registry,
publishes with ORAS, pulls and verifies DSSE/SBOM/provenance referrers, promotes
through atomic discovery, mirrors both retained releases, and replays a
compatible rollback. Production registry controls remain M7 evidence.
