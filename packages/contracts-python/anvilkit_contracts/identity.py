"""ComponentIdentityV1 and ContractBomIdentityV1 native Python adapters."""

from __future__ import annotations

import hashlib
import hmac
import json
import re
from typing import Any

from .canonicalizer import canonicalize

COMPONENT_PREFIX = b"anvilkit.component.identity.v1\0"
BOM_PREFIX = b"anvilkit.contract-bom.identity.v1\0"
BOM_MEDIA_TYPE = b"application/vnd.anvilkit.contract-bom.v1+json"
DIGEST = re.compile(r"^sha256:[0-9a-f]{64}$")
MEDIA_TYPE = re.compile(r"^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$")


class IdentityError(ValueError):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def _raw(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _wire_digest(*parts: bytes) -> str:
    digest = hashlib.sha256()
    for part in parts:
        digest.update(part)
    return f"sha256:{digest.hexdigest()}"


def _printable_ascii(value: str) -> bool:
    return bool(value) and all(0x21 <= ord(character) <= 0x7E for character in value)


def component(value: Any, purpose: str, media_type: str, allowed: set[str]) -> tuple[bytes, str]:
    if not _printable_ascii(purpose) or "\0" in purpose:
        raise IdentityError("IDENTITY_PURPOSE_INVALID", "purpose is not printable ASCII")
    if purpose == "contract-bom":
        raise IdentityError("IDENTITY_PURPOSE_RESERVED", "contract-bom is reserved")
    if purpose not in allowed:
        raise IdentityError("IDENTITY_PURPOSE_UNKNOWN", "purpose is not governed")
    if not _printable_ascii(media_type) or not MEDIA_TYPE.fullmatch(media_type):
        raise IdentityError("IDENTITY_MEDIA_TYPE_INVALID", "media type is outside the profile")
    canonical = canonicalize(_raw(value))
    return canonical, _wire_digest(
        COMPONENT_PREFIX,
        purpose.encode("ascii"),
        b"\0",
        media_type.encode("ascii"),
        b"\0",
        canonical,
    )


def contract_bom(value: Any) -> tuple[bytes, str, bool]:
    if not isinstance(value, dict):
        raise IdentityError("BOM_SHAPE_INVALID", "root BOM must be an object")
    if "digest" not in value:
        raise IdentityError("BOM_DIGEST_MISSING", "root BOM must declare a digest")
    declared = value["digest"]
    canonical = canonicalize(_raw({key: item for key, item in value.items() if key != "digest"}))
    calculated = _wire_digest(BOM_PREFIX, BOM_MEDIA_TYPE, b"\0", canonical)
    verified = isinstance(declared, str) and DIGEST.fullmatch(declared) is not None and hmac.compare_digest(declared, calculated)
    return canonical, calculated, verified
