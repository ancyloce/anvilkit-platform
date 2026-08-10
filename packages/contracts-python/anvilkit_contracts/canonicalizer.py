"""RFC 8785 adapter behind AnvilKit strict JSON admission."""

from __future__ import annotations

import rfc8785

from .validator import admit


def canonicalize(raw: bytes) -> bytes:
    """Return canonical UTF-8 bytes after strict byte admission."""
    return rfc8785.dumps(admit(raw))
