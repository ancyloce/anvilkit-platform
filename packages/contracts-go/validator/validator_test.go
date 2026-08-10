package validator_test

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/validator"
)

func root(t *testing.T) string {
	t.Helper()
	_, file, _, _ := runtime.Caller(0)
	return filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", ".."))
}
func TestPinnedClosedValidator(t *testing.T) {
	adapter, err := validator.New(root(t))
	if err != nil {
		t.Fatal(err)
	}
	schemaBytes, err := os.ReadFile(filepath.Join(root(t), "contracts", "schemas", "v1", "agent-run.schema.json"))
	if err != nil {
		t.Fatal(err)
	}
	_ = schemaBytes
	fixture, err := os.ReadFile(filepath.Join(root(t), "contracts", "fixtures", "v1", "valid", "agent-run.minimum.json"))
	if err != nil {
		t.Fatal(err)
	}
	// URI is byte-bound to authoritative schema bytes and version.
	uri := "anvilkit://schema/agent-run.v1@1.0.0?digest=sha256:68949242c9b4557a8b5ff965f76de8f2de49c11523a7cc1e64cfd1b4af824233"
	if findings := adapter.Validate(uri, fixture); len(findings) != 0 {
		t.Fatalf("valid findings=%+v", findings)
	}
}
func TestStrictAdmission(t *testing.T) {
	for _, input := range []string{`{"a":1,"a":2}`, "\ufeff{}", `{"n":-0}`, `{"n":9007199254740992}`, strings.Repeat("[", 66) + strings.Repeat("]", 66)} {
		if _, err := validator.Admit([]byte(input)); err == nil {
			t.Fatalf("admitted %q", input)
		}
	}
}
