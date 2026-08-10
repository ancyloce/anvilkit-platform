"""Candidate BOM verification at the consumer boundary."""

from __future__ import annotations

from typing import Any

from .identity import contract_bom


class CompatibilityError(ValueError):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def verify_candidate_bom(value: dict[str, Any], consumer_generation: int) -> str:
    _, digest, verified = contract_bom(value)
    if not verified:
        raise CompatibilityError("BOM_DIGEST_MISMATCH", "candidate BOM identity does not verify")
    window = value["compatibility"]
    if not window["minimumConsumerGeneration"] <= consumer_generation <= window["maximumConsumerGeneration"]:
        raise CompatibilityError("CONTRACT_UNSUPPORTED", "consumer generation is outside the BOM compatibility window")
    return digest
