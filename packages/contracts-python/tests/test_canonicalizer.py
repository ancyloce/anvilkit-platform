from __future__ import annotations

import unittest

from anvilkit_contracts.canonicalizer import canonicalize
from anvilkit_contracts.validator import AdmissionError


class CanonicalizerTests(unittest.TestCase):
    def test_rfc_sample(self) -> None:
        raw = '{"numbers":[333333333.33333329,1e30,4.50,2e-3,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/","literals":[null,true,false]}'.encode()
        expected = '{"literals":[null,true,false],"numbers":[333333333.3333333,1e+30,4.5,0.002,1e-27],"string":"€$\\u000f\\nA\'B\\"\\\\\\\\\\"/"}'.encode()
        self.assertEqual(canonicalize(raw), expected)

    def test_utf16_property_order(self) -> None:
        raw = '{"€":"Euro","\\r":"CR","דּ":"Hebrew","1":"One","😀":"Emoji","":"Control","ö":"Latin"}'.encode()
        expected = '{"\\r":"CR","1":"One","":"Control","ö":"Latin","€":"Euro","😀":"Emoji","דּ":"Hebrew"}'.encode()
        self.assertEqual(canonicalize(raw), expected)

    def test_strict_admission_precedes_canonicalization(self) -> None:
        for raw in (b'{"value":-0}', b'{"a":1,"a":2}', b'{"value":"\\ud800"}'):
            with self.subTest(raw=raw), self.assertRaises(AdmissionError): canonicalize(raw)


if __name__ == "__main__": unittest.main()
