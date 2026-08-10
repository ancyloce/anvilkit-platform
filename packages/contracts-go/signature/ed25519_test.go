package signature

import (
	"bytes"
	"encoding/base64"
	"testing"
)

func TestRFC8032DerivedVector(t *testing.T) {
	decode := func(value string) []byte {
		raw, err := base64.RawURLEncoding.DecodeString(value)
		if err != nil {
			t.Fatal(err)
		}
		return raw
	}
	seed := decode("nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A")
	publicKey := decode("11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo")
	message := []byte("AnvilKit Ed25519 conformance")
	signed, err := Sign(seed, message)
	if err != nil {
		t.Fatal(err)
	}
	if !Verify(publicKey, message, signed) {
		t.Fatal("signature did not verify")
	}
	tampered := bytes.Clone(message)
	tampered[0] ^= 1
	if Verify(publicKey, tampered, signed) {
		t.Fatal("tampered message verified")
	}
}
