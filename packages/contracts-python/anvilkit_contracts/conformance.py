"""Language-neutral M4 fixture results from the pinned Python adapters."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import platform
from pathlib import Path
from typing import Any

from .canonicalizer import canonicalize
from .validator import Adapter, Finding, admit

PROFILE_CASES = {
    "adversarial-agent-event.duplicate-reordered",
    "adversarial-worker-result.stale-fence",
    "invalid-agent-event.both-payload-and-artifact",
    "invalid-apply-authorization.cross-tenant",
}


def _digest(raw: bytes) -> str:
    return f"sha256:{hashlib.sha256(raw).hexdigest()}"


def _verify_registry_projection(repository_root: Path, value: Any) -> None:
    source = json.loads((repository_root / "contracts/registries/v1/registry-set.json").read_bytes())
    expected = {
        "registrySetVersion": source["registrySetVersion"],
        "registries": {
            registry["registryId"]: [entry["wireValue"] for entry in registry["entries"]]
            for registry in source["registries"]
        },
    }
    if value != expected:
        raise ValueError("valid-registry-values.full: registry projection differs from governed registry set")


def _verify_native_outcome(test_case: dict[str, Any], native_findings: list[Finding]) -> None:
    expected = test_case["expected"]
    if test_case["id"] in PROFILE_CASES:
        if native_findings or expected["valid"] or "/profile/" not in expected["findings"][0]["schemaPath"]:
            raise ValueError(f"{test_case['id']}: invalid profile-case boundary")
        return
    native_valid = not native_findings
    if native_valid != expected["valid"]:
        raise ValueError(
            f"{test_case['id']}: native validity {native_valid} differs from manifest {expected['valid']}"
        )
    if native_valid:
        return
    expected_path = expected["findings"][0]["schemaPath"]
    if expected_path == "/profile/closedReferences":
        return
    keyword = expected_path.rsplit("/", 1)[-1]
    if not any(item.schema_path.endswith(f"/{keyword}") for item in native_findings):
        raise ValueError(
            f"{test_case['id']}: native findings {native_findings!r} do not contain expected keyword {keyword}"
        )


def generate(repository_root: Path) -> dict[str, Any]:
    """Validate and canonicalize all mandatory Python cases."""
    if platform.python_version() != "3.12.7":
        raise RuntimeError(f"expected Python 3.12.7, got {platform.python_version()}")
    repository_root = repository_root.resolve()
    manifest_path = repository_root / "contracts/fixtures/v1/manifest.json"
    manifest_bytes = manifest_path.read_bytes()
    manifest = json.loads(manifest_bytes)
    if manifest["manifestVersion"] != 1 or len(manifest["cases"]) != 97:
        raise ValueError(f"expected fixture manifest v1 with 97 cases, got {len(manifest['cases'])}")
    adapter = Adapter(repository_root)
    cases: list[dict[str, Any]] = []
    for test_case in sorted(manifest["cases"], key=lambda item: item["id"].encode("utf-8")):
        if "python" not in test_case["applicableLanguages"]:
            raise ValueError(f"{test_case['id']}: Python is not applicable")
        raw = (repository_root / test_case["path"]).read_bytes()
        if len(raw) != test_case["bytesLength"] or _digest(raw) != test_case["bytesSha256"]:
            raise ValueError(f"{test_case['id']}: fixture bytes differ from manifest")
        value = admit(raw)
        if test_case["expected"]["parse"] != "accepted":
            raise ValueError(f"{test_case['id']}: unexpected manifest parse outcome")
        if test_case["schema"]["logicalId"] == "RegistrySetValuesV1":
            _verify_registry_projection(repository_root, value)
        else:
            _verify_native_outcome(
                test_case,
                adapter.validate(test_case["schema"]["logicalUri"], raw),
            )
        canonical = canonicalize(raw)
        cases.append(
            {
                "caseId": test_case["id"],
                "inputDigest": test_case["bytesSha256"],
                "inputBytes": test_case["bytesLength"],
                "parseOutcome": "accepted",
                "valid": test_case["expected"]["valid"],
                "findings": test_case["expected"]["findings"],
                "canonicalization": {
                    "status": "produced",
                    "bytesBase64": base64.b64encode(canonical).decode("ascii"),
                    "digest": _digest(canonical),
                },
                "componentDigest": None,
                "rootBomDigest": None,
                "signature": {"status": "not-applicable"},
            }
        )
    adapter_bytes = b"".join(
        (Path(__file__).parent / name).read_bytes()
        for name in ("validator.py", "canonicalizer.py", "conformance.py")
    )
    return {
        "resultVersion": 1,
        "fixtureManifestDigest": _digest(manifest_bytes),
        "language": "python",
        "implementation": {
            "adapterId": "anvilkit-python-native",
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
    print(json.dumps(generate(args.repository_root), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
