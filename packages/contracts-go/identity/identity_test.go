package identity_test

import (
	"testing"

	contractidentity "github.com/ancyloce/anvilkit-platform/packages/contracts-go/identity"
)

func TestComponentAndRootVectors(t *testing.T) {
	canonical, digest, err := contractidentity.Component(
		[]byte(`{"$id":"https://contracts.anvilkit.dev/example.schema.json","type":"object"}`),
		"schema",
		"application/schema+json",
		map[string]bool{"schema": true},
	)
	if err != nil {
		t.Fatal(err)
	}
	if len(canonical) == 0 || digest != "sha256:d2ac6760e4e1ff8dad734f00a0ce58bf16fbc86ac3393332fa6439cf010a0acd" {
		t.Fatalf("canonical=%q digest=%s", canonical, digest)
	}
	if _, _, err := contractidentity.Component([]byte(`{}`), "contract-bom", "application/json", map[string]bool{"contract-bom": true}); err == nil {
		t.Fatal("reserved purpose was accepted")
	}
}
