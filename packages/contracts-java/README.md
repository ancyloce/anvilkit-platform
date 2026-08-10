# AnvilKit Agent contract Java adapter

This JDK 17 module pins NetworkNT JSON Schema Validator `3.0.6`, Jackson 3 through the validator's owning dependency line, and `java-json-canonicalization` `1.1`. It compiles Draft 2020-12 schemas from an in-memory immutable-resource map, performs strict admission before validation or RFC 8785 canonicalization, and exposes deterministic language-neutral findings.

`dev.anvilkit.contracts.M4Conformance` emits the complete language-neutral
97-case result set on standard output after the module is compiled.
`dev.anvilkit.contracts.IdentityConformance` emits the 12-case native
component/root identity result set.
