from pathlib import Path
import unittest

from anvilkit_contracts.identity import IdentityError, component
from anvilkit_contracts.identity_conformance import generate_identity

ROOT = Path(__file__).resolve().parents[3]


class IdentityTests(unittest.TestCase):
    def test_component_vector_and_reserved_purpose(self) -> None:
        _, actual = component(
            {"$id": "https://contracts.anvilkit.dev/example.schema.json", "type": "object"},
            "schema",
            "application/schema+json",
            {"schema"},
        )
        self.assertEqual(actual, "sha256:d2ac6760e4e1ff8dad734f00a0ce58bf16fbc86ac3393332fa6439cf010a0acd")
        with self.assertRaisesRegex(IdentityError, "reserved"):
            component({}, "contract-bom", "application/json", {"contract-bom"})

    def test_complete_identity_result(self) -> None:
        result = generate_identity(ROOT)
        self.assertEqual(result["language"], "python")
        self.assertEqual(len(result["cases"]), 12)


if __name__ == "__main__":
    unittest.main()
