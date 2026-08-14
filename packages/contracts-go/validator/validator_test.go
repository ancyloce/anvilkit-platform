package validator_test

import (
	"encoding/json"
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

func TestSchemaRootRejectsEscapingSymlink(t *testing.T) {
	repositoryRoot := t.TempDir()
	directory := filepath.Join(repositoryRoot, "contracts", "schemas", "v1")
	if err := os.MkdirAll(directory, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(filepath.Join(root(t), "contracts", "schemas", "v1", "agent-run.schema.json"), filepath.Join(directory, "escape.schema.json")); err != nil {
		t.Skipf("symbolic links unavailable: %v", err)
	}
	if _, err := validator.New(repositoryRoot); err == nil || !strings.Contains(err.Error(), "symbolic link") {
		t.Fatalf("escaping symbolic link was not rejected: %v", err)
	}
}

func TestValidationFindingsAreBounded(t *testing.T) {
	adapter, err := validator.New(root(t))
	if err != nil {
		t.Fatal(err)
	}
	revoked := make([]map[string]any, 500)
	for index := range revoked {
		revoked[index] = map[string]any{"unexpected": index}
	}
	raw, err := json.Marshal(map[string]any{
		"apiVersion":  "anvilkit.io/contracts/v1",
		"kind":        "ContractRevocationSnapshot",
		"snapshotId":  "snapshot:bounded:test",
		"issuedAt":    "2026-08-14T00:00:00.000Z",
		"nextUpdate":  "2026-08-15T00:00:00.000Z",
		"revokedKeys": revoked,
	})
	if err != nil {
		t.Fatal(err)
	}
	const schemaURI = "anvilkit://schema/contract-revocation-snapshot.v1@1.0.0?digest=sha256:3f1513e42d97b2f5175cfd5ab1f380719d5233e27095de32caf96c771f5ef410"
	findings := adapter.Validate(schemaURI, raw)
	if len(findings) != 100 {
		t.Fatalf("finding count = %d, want 100", len(findings))
	}
	bounded := false
	for _, finding := range findings {
		bounded = bounded || finding.SchemaPath == "/profile/findingLimit"
	}
	if !bounded {
		t.Fatal("bounded finding sentinel is absent")
	}
}
