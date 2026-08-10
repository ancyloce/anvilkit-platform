"""M4 identity-vector result emitter for the native Python adapter."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import platform
from copy import deepcopy
from pathlib import Path
from typing import Any

from .canonicalizer import canonicalize
from .identity import IdentityError, component, contract_bom


def _digest(raw: bytes) -> str:
    return f"sha256:{hashlib.sha256(raw).hexdigest()}"


def _raw(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _produced(canonical: bytes) -> dict[str, Any]:
    return {
        "status": "produced",
        "bytesBase64": base64.b64encode(canonical).decode("ascii"),
        "digest": _digest(canonical),
    }


def _base(case_id: str, corpus_digest: str, corpus_bytes: int) -> dict[str, Any]:
    return {
        "caseId": case_id,
        "inputDigest": corpus_digest,
        "inputBytes": corpus_bytes,
        "parseOutcome": "accepted",
    }


def _allowed(repository_root: Path) -> set[str]:
    source = json.loads((repository_root / "contracts/registries/v1/registry-set.json").read_bytes())
    registry = next(item for item in source["registries"] if item["registryId"] == "identity-purpose")
    return {entry["wireValue"] for entry in registry["entries"]}


def generate_identity(repository_root: Path) -> dict[str, Any]:
    if platform.python_version() != "3.12.7":
        raise RuntimeError(f"expected Python 3.12.7, got {platform.python_version()}")
    repository_root = repository_root.resolve()
    corpus_path = repository_root / "contracts/governance/m3/identity-cases.json"
    corpus_bytes = corpus_path.read_bytes()
    corpus = json.loads(corpus_bytes)
    if corpus["corpusVersion"] != 1 or len(corpus["componentCases"]) != 9 or len(corpus["bomCases"]) != 3:
        raise ValueError("expected identity corpus v1 with nine component and three BOM cases")
    corpus_digest = _digest(corpus_bytes)
    cases: list[dict[str, Any]] = []
    allowed = _allowed(repository_root)
    for test_case in corpus["componentCases"]:
        item = _base(test_case["id"], corpus_digest, len(corpus_bytes))
        try:
            canonical, calculated = component(test_case["value"], test_case["purpose"], test_case["mediaType"], allowed)
            if "expectedCode" in test_case or calculated != test_case["expectedDigest"]:
                raise AssertionError(f"{test_case['id']}: component expectation differs")
            item.update({
                "valid": True,
                "findings": [],
                "canonicalization": _produced(canonical),
                "componentDigest": calculated,
                "rootBomDigest": None,
                "signature": {"status": "not-applicable"},
            })
        except IdentityError as error:
            if error.code != test_case.get("expectedCode"):
                raise
            canonical = canonicalize(_raw(test_case["value"]))
            item.update({
                "valid": False,
                "findings": [{"code": error.code, "instancePath": "/", "schemaPath": "/profile/componentIdentity"}],
                "canonicalization": _produced(canonical),
                "componentDigest": None,
                "rootBomDigest": None,
                "signature": {"status": "not-applicable"},
            })
        cases.append(item)
    raw_bom_cases = {item["id"]: item for item in corpus["bomCases"]}

    def resolve(test_case: dict[str, Any]) -> Any:
        if "value" in test_case:
            return deepcopy(test_case["value"])
        source = raw_bom_cases.get(test_case.get("copyOf"))
        if source is None:
            raise ValueError(f"{test_case['id']}: invalid copyOf")
        value = resolve(source)
        if isinstance(value, dict) and "declaredDigest" in test_case:
            value["digest"] = test_case["declaredDigest"]
        return value

    for test_case in corpus["bomCases"]:
        item = _base(test_case["id"], corpus_digest, len(corpus_bytes))
        try:
            canonical, calculated, verified = contract_bom(resolve(test_case))
            if ("expectedCode" in test_case or calculated != test_case["expectedDigest"]
                    or verified != test_case["expectedVerification"]):
                raise AssertionError(f"{test_case['id']}: BOM expectation differs")
            if "expectedCanonicalWithoutDigest" in test_case and canonical.decode() != test_case["expectedCanonicalWithoutDigest"]:
                raise AssertionError(f"{test_case['id']}: canonical BOM differs")
            item.update({
                "valid": verified,
                "findings": [] if verified else [{"code": "BOM_DIGEST_MISMATCH", "instancePath": "/digest", "schemaPath": "/profile/contractBomIdentity"}],
                "canonicalization": _produced(canonical),
                "componentDigest": None,
                "rootBomDigest": calculated,
                "signature": {"status": "not-applicable"},
            })
        except IdentityError as error:
            if error.code != test_case.get("expectedCode"):
                raise
            item.update({
                "valid": False,
                "findings": [{"code": error.code, "instancePath": "/digest", "schemaPath": "/profile/contractBomIdentity"}],
                "canonicalization": {"status": "rejected", "code": error.code},
                "componentDigest": None,
                "rootBomDigest": None,
                "signature": {"status": "not-applicable"},
            })
        cases.append(item)
    cases.sort(key=lambda item: item["caseId"].encode("utf-8"))
    adapter_bytes = b"".join(
        (Path(__file__).parent / name).read_bytes()
        for name in ("identity.py", "canonicalizer.py", "identity_conformance.py")
    )
    return {
        "resultVersion": 1,
        "fixtureManifestDigest": corpus_digest,
        "language": "python",
        "implementation": {
            "adapterId": "anvilkit-python-identity",
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
    args = parser.parse_args()
    print(json.dumps(generate_identity(args.repository_root), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
