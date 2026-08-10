#!/usr/bin/env python3
"""DP-008 adapter for rfc8785 0.1.4."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import resource
from pathlib import Path

import rfc8785

from anvilkit_contracts.canonicalizer import canonicalize
from anvilkit_contracts.validator import AdmissionError


parser = argparse.ArgumentParser()
parser.add_argument("--operation", required=True)
parser.add_argument("--schema", required=True)
parser.add_argument("--input", required=True)
parser.add_argument("--iterations", required=True, type=int)
args = parser.parse_args()
if args.operation != "canonicalize": raise SystemExit(2)
if args.iterations < 1: raise SystemExit(4)
raw = Path(args.input).read_bytes(); parse_outcome = "accepted"; canonical: bytes | None = None
before = resource.getrusage(resource.RUSAGE_SELF)
for _ in range(args.iterations):
    try: canonical = canonicalize(raw)
    except (AdmissionError, rfc8785.CanonicalizationError): parse_outcome = "rejected"; canonical = None
after = resource.getrusage(resource.RUSAGE_SELF)
print(json.dumps({
    "candidateId": "python-jcs-canonicalizer", "candidateVersion": "0.1.4", "operation": "canonicalize",
    "iterations": args.iterations, "parseOutcome": parse_outcome, "valid": None,
    "orderedFindings": [] if canonical is not None else [{"code": "PARSE_REJECTED", "instancePath": "/", "schemaPath": "/profile/strictAdmission"}],
    "canonicalSha256": f"sha256:{hashlib.sha256(canonical).hexdigest()}" if canonical is not None else None,
    "canonicalBytesBase64": base64.b64encode(canonical).decode("ascii") if canonical is not None else None,
    "nativeMeasurements": {"userCpuSeconds": after.ru_utime - before.ru_utime, "systemCpuSeconds": after.ru_stime - before.ru_stime, "maximumResidentKilobytes": after.ru_maxrss},
}))
