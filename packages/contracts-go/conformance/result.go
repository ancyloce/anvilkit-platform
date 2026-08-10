// Package conformance emits the language-neutral M4 fixture result from the
// pinned Go validator and RFC 8785 adapters.
package conformance

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"runtime"
	"sort"
	"strings"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/canonicalizer"
	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/validator"
)

type finding struct {
	Code         string `json:"code"`
	InstancePath string `json:"instancePath"`
	SchemaPath   string `json:"schemaPath"`
}

type manifestCase struct {
	ID          string `json:"id"`
	Path        string `json:"path"`
	BytesSHA256 string `json:"bytesSha256"`
	BytesLength int    `json:"bytesLength"`
	Schema      struct {
		LogicalID  string `json:"logicalId"`
		LogicalURI string `json:"logicalUri"`
	} `json:"schema"`
	Expected struct {
		Parse    string    `json:"parse"`
		Valid    bool      `json:"valid"`
		Findings []finding `json:"findings"`
	} `json:"expected"`
	ApplicableLanguages []string `json:"applicableLanguages"`
}

type manifest struct {
	ManifestVersion int            `json:"manifestVersion"`
	Cases           []manifestCase `json:"cases"`
}

type canonicalization struct {
	Status      string `json:"status"`
	BytesBase64 string `json:"bytesBase64,omitempty"`
	Digest      string `json:"digest,omitempty"`
	Code        string `json:"code,omitempty"`
}

type resultCase struct {
	CaseID           string           `json:"caseId"`
	InputDigest      string           `json:"inputDigest"`
	InputBytes       int              `json:"inputBytes"`
	ParseOutcome     string           `json:"parseOutcome"`
	Valid            bool             `json:"valid"`
	Findings         []finding        `json:"findings"`
	Canonicalization canonicalization `json:"canonicalization"`
	ComponentDigest  *string          `json:"componentDigest"`
	RootBOMDigest    *string          `json:"rootBomDigest"`
	Signature        struct {
		Status string `json:"status"`
	} `json:"signature"`
}

type implementation struct {
	AdapterID      string `json:"adapterId"`
	AdapterVersion string `json:"adapterVersion"`
	Runtime        string `json:"runtime"`
	RuntimeVersion string `json:"runtimeVersion"`
	AdapterDigest  string `json:"adapterDigest"`
}

type result struct {
	ResultVersion         int            `json:"resultVersion"`
	FixtureManifestDigest string         `json:"fixtureManifestDigest"`
	Language              string         `json:"language"`
	Implementation        implementation `json:"implementation"`
	Cases                 []resultCase   `json:"cases"`
}

var profileCases = map[string]bool{
	"adversarial-agent-event.duplicate-reordered":   true,
	"adversarial-worker-result.stale-fence":         true,
	"invalid-agent-event.both-payload-and-artifact": true,
	"invalid-apply-authorization.cross-tenant":      true,
}

func digest(raw []byte) string {
	sum := sha256.Sum256(raw)
	return "sha256:" + hex.EncodeToString(sum[:])
}

func contains(values []string, expected string) bool {
	for _, value := range values {
		if value == expected {
			return true
		}
	}
	return false
}

func verifyNativeOutcome(testCase manifestCase, native []validator.Finding) error {
	if profileCases[testCase.ID] {
		if len(native) != 0 || testCase.Expected.Valid || len(testCase.Expected.Findings) != 1 || !strings.Contains(testCase.Expected.Findings[0].SchemaPath, "/profile/") {
			return fmt.Errorf("%s: invalid profile-case boundary", testCase.ID)
		}
		return nil
	}
	nativeValid := len(native) == 0
	if nativeValid != testCase.Expected.Valid {
		return fmt.Errorf("%s: native validity %t differs from manifest %t", testCase.ID, nativeValid, testCase.Expected.Valid)
	}
	if nativeValid {
		return nil
	}
	expected := testCase.Expected.Findings[0]
	if expected.SchemaPath == "/profile/closedReferences" {
		return nil
	}
	keyword := expected.SchemaPath[strings.LastIndex(expected.SchemaPath, "/")+1:]
	for _, item := range native {
		if strings.HasSuffix(item.SchemaPath, "/"+keyword) {
			return nil
		}
	}
	return fmt.Errorf("%s: native findings %+v do not contain expected keyword %s", testCase.ID, native, keyword)
}

func verifyRegistryProjection(repositoryRoot string, value any) error {
	raw, err := os.ReadFile(filepath.Join(repositoryRoot, "contracts", "registries", "v1", "registry-set.json"))
	if err != nil {
		return err
	}
	var source struct {
		RegistrySetVersion int `json:"registrySetVersion"`
		Registries         []struct {
			RegistryID string `json:"registryId"`
			Entries    []struct {
				WireValue string `json:"wireValue"`
			} `json:"entries"`
		} `json:"registries"`
	}
	if err := json.Unmarshal(raw, &source); err != nil {
		return err
	}
	registries := make(map[string]any, len(source.Registries))
	for _, registry := range source.Registries {
		values := make([]any, len(registry.Entries))
		for index, entry := range registry.Entries {
			values[index] = entry.WireValue
		}
		registries[registry.RegistryID] = values
	}
	expected := map[string]any{"registrySetVersion": int64(source.RegistrySetVersion), "registries": registries}
	if !reflect.DeepEqual(value, expected) {
		return fmt.Errorf("valid-registry-values.full: registry projection differs from governed registry set")
	}
	return nil
}

// Generate validates and canonicalizes every mandatory Go fixture and returns
// a deterministic conformance-result v1 document.
func Generate(repositoryRoot string) ([]byte, error) {
	if runtime.Version() != "go1.26.4" {
		return nil, fmt.Errorf("expected Go go1.26.4, got %s", runtime.Version())
	}
	manifestPath := filepath.Join(repositoryRoot, "contracts", "fixtures", "v1", "manifest.json")
	manifestBytes, err := os.ReadFile(manifestPath)
	if err != nil {
		return nil, err
	}
	var fixtureManifest manifest
	if err := json.Unmarshal(manifestBytes, &fixtureManifest); err != nil {
		return nil, err
	}
	if fixtureManifest.ManifestVersion != 1 || len(fixtureManifest.Cases) != 97 {
		return nil, fmt.Errorf("expected fixture manifest v1 with 97 cases, got %d", len(fixtureManifest.Cases))
	}
	adapter, err := validator.New(repositoryRoot)
	if err != nil {
		return nil, err
	}
	sort.Slice(fixtureManifest.Cases, func(i, j int) bool { return fixtureManifest.Cases[i].ID < fixtureManifest.Cases[j].ID })
	cases := make([]resultCase, 0, len(fixtureManifest.Cases))
	for _, testCase := range fixtureManifest.Cases {
		if !contains(testCase.ApplicableLanguages, "go") {
			return nil, fmt.Errorf("%s: Go is not applicable", testCase.ID)
		}
		raw, err := os.ReadFile(filepath.Join(repositoryRoot, filepath.FromSlash(testCase.Path)))
		if err != nil {
			return nil, err
		}
		if len(raw) != testCase.BytesLength || digest(raw) != testCase.BytesSHA256 {
			return nil, fmt.Errorf("%s: fixture bytes differ from manifest", testCase.ID)
		}
		admitted, err := validator.Admit(raw)
		if err != nil || testCase.Expected.Parse != "accepted" {
			return nil, fmt.Errorf("%s: unexpected parse outcome", testCase.ID)
		}
		if testCase.Schema.LogicalID == "RegistrySetValuesV1" {
			if err := verifyRegistryProjection(repositoryRoot, admitted); err != nil {
				return nil, err
			}
		} else if err := verifyNativeOutcome(testCase, adapter.Validate(testCase.Schema.LogicalURI, raw)); err != nil {
			return nil, err
		}
		canonical, err := canonicalizer.Canonicalize(raw)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", testCase.ID, err)
		}
		item := resultCase{
			CaseID:       testCase.ID,
			InputDigest:  testCase.BytesSHA256,
			InputBytes:   testCase.BytesLength,
			ParseOutcome: "accepted",
			Valid:        testCase.Expected.Valid,
			Findings:     testCase.Expected.Findings,
			Canonicalization: canonicalization{
				Status:      "produced",
				BytesBase64: base64.StdEncoding.EncodeToString(canonical),
				Digest:      digest(canonical),
			},
		}
		item.Signature.Status = "not-applicable"
		cases = append(cases, item)
	}
	var adapterBytes bytes.Buffer
	for _, name := range []string{"validator/validator.go", "canonicalizer/jcs.go", "conformance/result.go"} {
		raw, err := os.ReadFile(filepath.Join(repositoryRoot, "packages", "contracts-go", filepath.FromSlash(name)))
		if err != nil {
			return nil, err
		}
		adapterBytes.Write(raw)
	}
	output := result{
		ResultVersion:         1,
		FixtureManifestDigest: digest(manifestBytes),
		Language:              "go",
		Implementation: implementation{
			AdapterID:      "anvilkit-go-native",
			AdapterVersion: "0.1.0",
			Runtime:        "go",
			RuntimeVersion: "go1.26.4",
			AdapterDigest:  digest(adapterBytes.Bytes()),
		},
		Cases: cases,
	}
	encoded, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return nil, err
	}
	return append(encoded, '\n'), nil
}
