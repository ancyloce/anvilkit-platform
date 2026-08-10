package conformance_test

import (
	"encoding/json"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/conformance"
)

func TestGenerateCompleteResult(t *testing.T) {
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", ".."))
	raw, err := conformance.Generate(root)
	if err != nil {
		t.Fatal(err)
	}
	var result struct {
		Language string `json:"language"`
		Cases    []any  `json:"cases"`
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		t.Fatal(err)
	}
	if result.Language != "go" || len(result.Cases) != 97 {
		t.Fatalf("language=%q cases=%d", result.Language, len(result.Cases))
	}
}

func TestGenerateCompleteIdentityResult(t *testing.T) {
	_, file, _, _ := runtime.Caller(0)
	root := filepath.Clean(filepath.Join(filepath.Dir(file), "..", "..", ".."))
	raw, err := conformance.GenerateIdentity(root)
	if err != nil {
		t.Fatal(err)
	}
	var result struct {
		Language string `json:"language"`
		Cases    []any  `json:"cases"`
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		t.Fatal(err)
	}
	if result.Language != "go" || len(result.Cases) != 12 {
		t.Fatalf("language=%q cases=%d", result.Language, len(result.Cases))
	}
}
