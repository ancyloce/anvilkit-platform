# AnvilKit Agent contract Python adapter

The runtime adapter pins `jsonschema==4.26.0` and `rfc8785==0.1.4` using hash-locked wheels. It uses `Draft202012Validator` with an in-memory closed resource registry, and strict admission precedes both validation and RFC 8785 canonicalization. Generated models carry no generator dependency; findings are sorted into the shared language-neutral shape.

`PYTHONPATH=. python -m anvilkit_contracts.conformance --repository-root ../..`
emits the complete language-neutral 97-case result set on standard output.
`PYTHONPATH=. python -m anvilkit_contracts.identity_conformance --repository-root ../..`
emits the 12-case native component/root identity result set.
