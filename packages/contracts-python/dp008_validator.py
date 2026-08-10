#!/usr/bin/env python3
"""DP-008 adapter for the pinned Python jsonschema candidate."""
from __future__ import annotations
import argparse, json, resource
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from anvilkit_contracts.validator import AdmissionError, admit

parser=argparse.ArgumentParser();parser.add_argument("--operation",required=True);parser.add_argument("--schema",required=True);parser.add_argument("--input",required=True);parser.add_argument("--iterations",required=True,type=int);args=parser.parse_args()
if args.operation!="validate": raise SystemExit(2)
if args.iterations<1: raise SystemExit(4)
schema=json.loads(Path(args.schema).read_text());raw=Path(args.input).read_bytes();validator=Draft202012Validator(schema,format_checker=FormatChecker());parse_outcome="accepted";valid=False;findings=[];before=resource.getrusage(resource.RUSAGE_SELF)
for _ in range(args.iterations):
    try:
        value=admit(raw);errors=sorted(validator.iter_errors(value),key=lambda error:(list(error.absolute_path),list(error.absolute_schema_path)));valid=not errors;findings=[{"code":"VALIDATION_FAILED","instancePath":"/"+"/".join(map(str,error.absolute_path)) if error.absolute_path else "/","schemaPath":"/"+"/".join(map(str,error.absolute_schema_path)) if error.absolute_schema_path else "/"} for error in errors]
    except AdmissionError:
        parse_outcome="rejected";valid=False;findings=[{"code":"PARSE_REJECTED","instancePath":"/","schemaPath":"/profile/strictAdmission"}]
after=resource.getrusage(resource.RUSAGE_SELF)
print(json.dumps({"candidateId":"python-json-schema-validator","candidateVersion":"4.26.0","operation":"validate","iterations":args.iterations,"parseOutcome":parse_outcome,"valid":valid,"orderedFindings":findings,"nativeMeasurements":{"userCpuSeconds":after.ru_utime-before.ru_utime,"systemCpuSeconds":after.ru_stime-before.ru_stime,"maximumResidentKilobytes":after.ru_maxrss}}))
