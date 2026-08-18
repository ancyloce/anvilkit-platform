# ADR-016: Agent contract signing, trust, revocation, and rollover

| | |
| --- | --- |
| **Status** | Accepted design; production integration evidence pending |
| **Resolves** | PLAN-0003 M0-T06 key custody/trust/revocation/rollover decision |
| **Gate** | Design gate cleared; M7-T01 remains an evidence gate |
| **Owners** | Security, SRE, Platform Contracts |
| **Date** | 2026-08-09 |

## Context

Contract BOM releases need an auditable, fail-closed trust model. The repository may define profiles and synthetic conformance vectors, but it must never contain a production private key or treat a test key as production evidence.

## Decision

- Release statements use standard single-signature DSSE with Ed25519 and a canonical `ContractSignatureStatement` payload. Apply authorizations use compact JWS EdDSA with only `alg`, `kid`, and `typ` protected headers.
- Production private keys are non-exportable and live in an approved KMS/HSM or isolated signing service. Workload identity, least privilege, audited use, and dual control apply to release signing.
- Trust roots and revocation snapshots are signed, content-addressed, distributed independently of payload-selected metadata, and cached only within their declared freshness bounds.
- A key is usable only when issuer, audience, algorithm, purpose, validity interval, status, and signed key ID all match the pinned policy. Unknown, stale, revoked, or ambiguous state fails closed.
- Rollover uses a bounded overlap window. Historical verification binds the decision-time trust and revocation snapshot; emergency recovery publishes a new signed snapshot and preserves the incident and audit trail.
- Clock comparisons use UTC instants, explicit maximum clock skew, and inclusive/exclusive bounds defined by the profile. Payloads cannot select remote trust URLs.

## Consequences

Repository-local deterministic test keys may exercise profiles but are marked synthetic. M7-T01 is not complete until the real signer, public trust distribution, audited key use, rotation/revocation drill, secret scan, and break-glass evidence exist.

## References

- PRD 0012 §§4.17, 5.5
- PLAN-0003 M0-T06, M3-T04..T07, M7-T01
