"""Narrow Ed25519 primitive boundary for governed DSSE and compact-JWS."""

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey


def dsse_pre_auth_encoding(payload_type: str, payload: bytes) -> bytes:
    encoded_type = payload_type.encode("utf-8")
    return (
        f"DSSEv1 {len(encoded_type)} ".encode("ascii")
        + encoded_type
        + f" {len(payload)} ".encode("ascii")
        + payload
    )


def sign_ed25519(private_seed: bytes, message: bytes) -> bytes:
    if len(private_seed) != 32:
        raise ValueError("Ed25519 private seed must be 32 bytes")
    return Ed25519PrivateKey.from_private_bytes(private_seed).sign(message)


def verify_ed25519(public_key: bytes, message: bytes, signature: bytes) -> bool:
    if len(public_key) != 32 or len(signature) != 64:
        return False
    try:
        Ed25519PublicKey.from_public_bytes(public_key).verify(signature, message)
    except (InvalidSignature, ValueError):
        return False
    return True
