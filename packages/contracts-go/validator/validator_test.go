package validator_test

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
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

func canonicalURI(t *testing.T, name string) string {
	t.Helper()
	raw, err := os.ReadFile(filepath.Join(root(t), "contracts", "agent", "schemas", name+".schema.json"))
	if err != nil {
		t.Fatal(err)
	}
	digest := sha256.Sum256(raw)
	return fmt.Sprintf("anvilkit://schema/%s?digest=sha256:%s", name, hex.EncodeToString(digest[:]))
}

func TestPinnedClosedValidator(t *testing.T) {
	adapter, err := validator.New(root(t))
	if err != nil {
		t.Fatal(err)
	}
	fixture, err := os.ReadFile(filepath.Join(root(t), "contracts", "agent", "fixtures", "valid", "agent-run.minimum.json"))
	if err != nil {
		t.Fatal(err)
	}
	// The logical URI is byte-bound to the canonical schema bytes.
	if findings := adapter.Validate(canonicalURI(t, "agent-run"), fixture); len(findings) != 0 {
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
	directory := filepath.Join(repositoryRoot, "contracts", "agent", "schemas")
	if err := os.MkdirAll(directory, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(filepath.Join(root(t), "contracts", "agent", "schemas", "agent-run.schema.json"), filepath.Join(directory, "escape.schema.json")); err != nil {
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
		"kind":        "ContractRevocationSnapshot",
		"snapshotId":  "snapshot:bounded:test",
		"issuedAt":    "2026-08-14T00:00:00.000Z",
		"nextUpdate":  "2026-08-15T00:00:00.000Z",
		"revokedKeys": revoked,
	})
	if err != nil {
		t.Fatal(err)
	}
	findings := adapter.Validate(canonicalURI(t, "contract-revocation-snapshot"), raw)
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
