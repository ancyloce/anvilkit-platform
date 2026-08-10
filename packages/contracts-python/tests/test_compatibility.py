import json
from pathlib import Path
import unittest

from anvilkit_contracts.compatibility import CompatibilityError, verify_candidate_bom

ROOT = Path(__file__).resolve().parents[3]


class CompatibilityTests(unittest.TestCase):
    def test_candidate_bom_window(self) -> None:
        bom = json.loads((ROOT / "contracts/governance/m4/release-bom.json").read_text())
        self.assertEqual(verify_candidate_bom(bom, 1), bom["digest"])
        for generation in (0, 2):
            with self.assertRaises(CompatibilityError) as raised:
                verify_candidate_bom(bom, generation)
            self.assertEqual(raised.exception.code, "CONTRACT_UNSUPPORTED")


if __name__ == "__main__":
    unittest.main()
