"""M4 language-neutral results for the shared DSSE/JWS primitive corpus."""

from __future__ import annotations

import argparse
import base64
import hashlib
import importlib.metadata
import json
import platform
from pathlib import Path
from typing import Any

from .signature import dsse_pre_auth_encoding, sign_ed25519, verify_ed25519


def _decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _digest(raw: bytes) -> str:
    return f"sha256:{hashlib.sha256(raw).hexdigest()}"


def generate(repository_root: Path) -> dict[str, Any]:
    if platform.python_version() != "3.12.7":
        raise RuntimeError(f"expected Python 3.12.7, got {platform.python_version()}")
    version = importlib.metadata.version("cryptography")
    if version != "49.0.0":
        raise RuntimeError(f"expected cryptography 49.0.0, got {version}")
    repository_root = repository_root.resolve()
    corpus_path = repository_root / "contracts/governance/m3/signature-cases.json"
    corpus_bytes = corpus_path.read_bytes()
    corpus = json.loads(corpus_bytes)
    if corpus["corpusVersion"] != 1 or len(corpus["cases"]) != 6:
        raise ValueError("invalid signature corpus")
    public_key = _decode(corpus["key"]["publicKeyBase64Url"])
    private_seed = _decode(corpus["key"]["privateSeedBase64Url"])
    dsse_payload = _decode(corpus["dsse"]["payloadBase64Url"])
    dsse_signature = _decode(corpus["dsse"]["signatureBase64Url"])
    jws_signature = _decode(corpus["jws"]["signatureBase64Url"])
    cases: list[dict[str, Any]] = []
    for vector in corpus["cases"]:
        if vector["profile"] == "dsse":
            original_message = dsse_pre_auth_encoding(corpus["dsse"]["payloadType"], dsse_payload)
            expected_signature = dsse_signature
        elif vector["profile"] == "jws":
            original_message = (
                corpus["jws"]["protectedBase64Url"] + "." + corpus["jws"]["payloadBase64Url"]
            ).encode("ascii")
            expected_signature = jws_signature
        else:
            raise ValueError(f"{vector['id']}: unsupported profile")
        message = bytearray(original_message)
        if vector["mutation"] == "message-last-byte":
            message[-1] ^= 1
        candidate_signature = bytearray(expected_signature)
        if vector["operation"] == "sign-and-verify":
            candidate_signature = bytearray(sign_ed25519(private_seed, bytes(message)))
            if candidate_signature != expected_signature:
                raise ValueError(f"{vector['id']}: deterministic signature differs from corpus")
        if vector["mutation"] == "signature-first-byte":
            candidate_signature[0] ^= 1
        verified = verify_ed25519(public_key, bytes(message), bytes(candidate_signature))
        if verified != vector["expectedVerified"]:
            raise ValueError(f"{vector['id']}: verification differs from corpus")
        cases.append(
            {
                "caseId": vector["id"],
                "inputDigest": _digest(bytes(message)),
                "inputBytes": len(message),
                "parseOutcome": "accepted",
                "valid": verified,
                "findings": [] if verified else [
                    {"code": "SIGNATURE_INVALID", "instancePath": "/signature", "schemaPath": "/profile/ed25519"}
                ],
                "canonicalization": {"status": "not-applicable"},
                "componentDigest": None,
                "rootBomDigest": None,
                "signature": {"status": "verified"} if verified else {"status": "rejected", "code": "SIGNATURE_INVALID"},
            }
        )
    adapter_bytes = b"".join(
        (Path(__file__).parent / name).read_bytes()
        for name in ("signature.py", "signature_conformance.py")
    )
    return {
        "resultVersion": 1,
        "fixtureManifestDigest": _digest(corpus_bytes),
        "language": "python",
        "implementation": {
            "adapterId": "anvilkit-python-signature-native",
            "adapterVersion": "0.1.0",
            "runtime": "python",
            "runtimeVersion": "3.12.7",
            "adapterDigest": _digest(adapter_bytes),
        },
        "cases": cases,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repository-root", type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument("--iterations", type=int, default=1)
    args = parser.parse_args()
    if args.iterations < 1:
        parser.error("--iterations must be positive")
    result = None
    for _ in range(args.iterations):
        result = generate(args.repository_root)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
