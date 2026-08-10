# AnvilKit Agent contract Go adapter

This module is the repository-local Go validation and canonicalization adapter selected for PLAN-0003 M4. It pins `github.com/santhosh-tekuri/jsonschema/v6` at `v6.0.3` and `github.com/lattice-substrate/json-canon` at `v0.3.4`. Validation registers every immutable logical schema resource from verified repository bytes and emits language-neutral ordered findings. RFC 8785 canonicalization runs only after strict admission. This is a package/runtime boundary adapter, not a production service.

`go run ./cmd/m4-conformance --repository-root ../..` emits the complete
language-neutral 97-case result set on standard output.
`go run ./cmd/m4-identity --repository-root ../..` emits the 12-case native
component/root identity result set.
