from pathlib import Path
import unittest

from anvilkit_contracts import Adapter, admit
from anvilkit_contracts.conformance import generate

ROOT = Path(__file__).resolve().parents[3]


class ValidatorTests(unittest.TestCase):
    def test_closed_draft_2020_12_validator(self) -> None:
        adapter = Adapter(ROOT)
        uri = "anvilkit://schema/agent-run.v1@1.0.0?digest=sha256:68949242c9b4557a8b5ff965f76de8f2de49c11523a7cc1e64cfd1b4af824233"
        raw = (ROOT / "contracts/fixtures/v1/valid/agent-run.minimum.json").read_bytes()
        self.assertEqual(adapter.validate(uri, raw), [])

    def test_strict_admission(self) -> None:
        for raw in [b'{"a":1,"a":2}', b"\xef\xbb\xbf{}", b'{"n":-0}', b'{"n":9007199254740992}', b'{"x":"\\ud800"}']:
            with self.subTest(raw=raw):
                with self.assertRaises(ValueError):
                    admit(raw)

    def test_complete_conformance_result(self) -> None:
        result = generate(ROOT)
        self.assertEqual(result["language"], "python")
        self.assertEqual(len(result["cases"]), 97)


if __name__ == "__main__":
    unittest.main()
