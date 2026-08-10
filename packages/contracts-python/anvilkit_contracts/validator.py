"""Pinned Python PLAN-0003 M4 validation adapter."""

from __future__ import annotations

import hashlib
import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

MAX_SAFE_INTEGER = 9_007_199_254_740_991


@dataclass(frozen=True, order=True)
class Finding:
    code: str
    instance_path: str
    schema_path: str


class AdmissionError(ValueError):
    pass


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise AdmissionError("duplicate decoded key")
        result[key] = value
    return result


def _integer(wire: str) -> int:
    value = int(wire)
    if abs(value) > MAX_SAFE_INTEGER:
        raise AdmissionError("unsafe integer")
    if wire.startswith("-") and value == 0:
        raise AdmissionError("negative zero")
    return value


def _number(wire: str) -> float:
    value = float(wire)
    if not math.isfinite(value) or (value == 0 and wire.startswith("-")):
        raise AdmissionError("number range or negative zero")
    return value


def _limits(value: Any, depth: int = 1) -> int:
    if depth > 64:
        raise AdmissionError("depth limit")
    if isinstance(value, str):
        if any(0xD800 <= ord(character) <= 0xDFFF for character in value):
            raise AdmissionError("invalid Unicode scalar")
        if len(value.encode("utf-8")) > 1_048_576:
            raise AdmissionError("string byte limit")
        return 1
    if isinstance(value, list):
        if len(value) > 100_000:
            raise AdmissionError("item limit")
        return 1 + sum(_limits(item, depth + 1) for item in value)
    if isinstance(value, dict):
        if len(value) > 100_000:
            raise AdmissionError("item limit")
        return 1 + sum(_limits(key, depth + 1) + _limits(item, depth + 1) for key, item in value.items())
    return 1


def admit(raw: bytes) -> Any:
    if not raw or len(raw) > 1_048_576 or raw.startswith(b"\xef\xbb\xbf"):
        raise AdmissionError("byte limit or BOM")
    try:
        text = raw.decode("utf-8", "strict")
        value = json.loads(text, object_pairs_hook=_pairs, parse_int=_integer, parse_float=_number, parse_constant=lambda value: (_ for _ in ()).throw(AdmissionError(value)))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise AdmissionError("invalid JSON or UTF-8") from error
    if _limits(value) > 200_000:
        raise AdmissionError("total value limit")
    return value


def _pointer(parts: Any) -> str:
    encoded = [str(part).replace("~", "~0").replace("/", "~1") for part in parts]
    return "/" + "/".join(encoded) if encoded else "/"


class Adapter:
    def __init__(self, repository_root: Path):
        resources: list[tuple[str, Resource[Any]]] = []
        self._schemas: dict[str, dict[str, Any]] = {}
        for path in sorted((repository_root / "contracts" / "schemas" / "v1").glob("*.schema.json")):
            raw = path.read_bytes()
            schema = json.loads(raw)
            metadata = schema["x-anvilkit-contract"]
            name = path.name.removesuffix(".schema.json")
            version = metadata["semanticVersion"]
            uri = f"anvilkit://schema/{name}.v{version.split('.', 1)[0]}@{version}?digest=sha256:{hashlib.sha256(raw).hexdigest()}"
            projected = dict(schema)
            projected["$schema"] = "https://json-schema.org/draft/2020-12/schema"
            projected["$id"] = uri
            projected.pop("x-anvilkit-contract", None)
            self._schemas[uri] = projected
            resources.append((uri, Resource.from_contents(projected)))
        self._registry = Registry().with_resources(resources)

    def validate(self, schema_uri: str, raw: bytes) -> list[Finding]:
        try:
            value = admit(raw)
        except AdmissionError:
            return [Finding("PARSE_REJECTED", "/", "/profile/strictAdmission")]
        schema = self._schemas.get(schema_uri)
        if schema is None:
            return [Finding("VALIDATION_FAILED", "/", "/profile/closedResolver")]
        validator = Draft202012Validator(schema, registry=self._registry, format_checker=FormatChecker())
        return sorted(Finding("VALIDATION_FAILED", _pointer(error.absolute_path), _pointer(error.absolute_schema_path)) for error in validator.iter_errors(value))
