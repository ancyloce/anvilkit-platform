import unittest

from anvilkit_contracts.signature import sign_ed25519, verify_ed25519


class SignatureTests(unittest.TestCase):
    def test_ed25519_round_trip_and_tamper(self) -> None:
        seed = bytes.fromhex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60")
        public_key = bytes.fromhex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a")
        signature = sign_ed25519(seed, b"")
        self.assertTrue(verify_ed25519(public_key, b"", signature))
        self.assertFalse(verify_ed25519(public_key, b"tampered", signature))


if __name__ == "__main__":
    unittest.main()
