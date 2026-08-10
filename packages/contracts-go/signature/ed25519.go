// Package signature isolates the Ed25519 primitive used by the governed DSSE
// and compact-JWS profiles. Trust and payload policy remain with callers.
package signature

import (
	"crypto/ed25519"
	"fmt"
)

// PreAuthEncoding implements the DSSE v1 PAE byte construction.
func PreAuthEncoding(payloadType string, payload []byte) []byte {
	prefix := fmt.Sprintf("DSSEv1 %d %s %d ", len([]byte(payloadType)), payloadType, len(payload))
	encoded := make([]byte, 0, len(prefix)+len(payload))
	encoded = append(encoded, []byte(prefix)...)
	return append(encoded, payload...)
}

// Sign signs exact bytes with an Ed25519 private seed.
func Sign(privateSeed, message []byte) ([]byte, error) {
	if len(privateSeed) != ed25519.SeedSize {
		return nil, fmt.Errorf("Ed25519 seed must be %d bytes", ed25519.SeedSize)
	}
	return ed25519.Sign(ed25519.NewKeyFromSeed(privateSeed), message), nil
}

// Verify verifies an Ed25519 signature over exact bytes.
func Verify(publicKey, message, signature []byte) bool {
	return len(publicKey) == ed25519.PublicKeySize && len(signature) == ed25519.SignatureSize &&
		ed25519.Verify(ed25519.PublicKey(publicKey), message, signature)
}
