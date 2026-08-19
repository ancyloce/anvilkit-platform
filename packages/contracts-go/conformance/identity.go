package conformance

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"

	contractidentity "github.com/ancyloce/anvilkit-platform/packages/contracts-go/identity"
)

type componentIdentityCase struct {
	ID             string          `json:"id"`
	Value          json.RawMessage `json:"value"`
	Purpose        string          `json:"purpose"`
	MediaType      string          `json:"mediaType"`
	ExpectedDigest string          `json:"expectedDigest"`
	ExpectedCode   string          `json:"expectedCode"`
}

type bomIdentityCase struct {
	ID                             string          `json:"id"`
	Value                          json.RawMessage `json:"value"`
	CopyOf                         string          `json:"copyOf"`
	DeclaredDigest                 string          `json:"declaredDigest"`
	ExpectedCanonicalWithoutDigest string          `json:"expectedCanonicalWithoutDigest"`
	ExpectedDigest                 string          `json:"expectedDigest"`
	ExpectedVerification           *bool           `json:"expectedVerification"`
	ExpectedCode                   string          `json:"expectedCode"`
}

type identityCorpus struct {
	CorpusVersion  int                     `json:"corpusVersion"`
	ComponentCases []componentIdentityCase `json:"componentCases"`
	BOMCases       []bomIdentityCase       `json:"bomCases"`
}

func identityBase(id, corpusDigest string, corpusBytes int) resultCase {
	item := resultCase{
		CaseID:       id,
		InputDigest:  corpusDigest,
		InputBytes:   corpusBytes,
		ParseOutcome: "accepted",
	}
	item.Signature.Status = "not-applicable"
	return item
}

func identityPurposes(repositoryRoot string) (map[string]bool, error) {
	raw, err := os.ReadFile(filepath.Join(repositoryRoot, "contracts", "agent", "registries", "registry-set.json"))
	if err != nil {
		return nil, err
	}
	var registry struct {
		Registries []struct {
			RegistryID string `json:"registryId"`
			Entries    []struct {
				WireValue string `json:"wireValue"`
			} `json:"entries"`
		} `json:"registries"`
	}
	if err := json.Unmarshal(raw, &registry); err != nil {
		return nil, err
	}
	allowed := map[string]bool{}
	for _, item := range registry.Registries {
		if item.RegistryID == "identity-purpose" {
			for _, entry := range item.Entries {
				allowed[entry.WireValue] = true
			}
		}
	}
	return allowed, nil
}

func resolveBOM(testCase bomIdentityCase, cases map[string]bomIdentityCase) ([]byte, error) {
	if len(testCase.Value) > 0 {
		return testCase.Value, nil
	}
	source, ok := cases[testCase.CopyOf]
	if !ok {
		return nil, fmt.Errorf("%s: invalid copyOf", testCase.ID)
	}
	raw, err := resolveBOM(source, cases)
	if err != nil {
		return nil, err
	}
	var object map[string]json.RawMessage
	if err := json.Unmarshal(raw, &object); err != nil {
		return nil, err
	}
	if testCase.DeclaredDigest != "" {
		object["digest"], _ = json.Marshal(testCase.DeclaredDigest)
	}
	return json.Marshal(object)
}

// GenerateIdentity emits the 12-case ComponentIdentityV1 and
// ContractBomIdentityV1 matrix for Go.
func GenerateIdentity(repositoryRoot string) ([]byte, error) {
	if runtime.Version() != "go1.26.4" {
		return nil, fmt.Errorf("expected Go go1.26.4, got %s", runtime.Version())
	}
	corpusPath := filepath.Join(repositoryRoot, "contracts", "agent", "fixtures", "canonical", "identity-cases.json")
	corpusBytes, err := os.ReadFile(corpusPath)
	if err != nil {
		return nil, err
	}
	var corpus identityCorpus
	if err := json.Unmarshal(corpusBytes, &corpus); err != nil {
		return nil, err
	}
	if corpus.CorpusVersion != 1 || len(corpus.ComponentCases) != 9 || len(corpus.BOMCases) != 3 {
		return nil, fmt.Errorf("expected identity corpus v1 with nine component and three BOM cases")
	}
	allowed, err := identityPurposes(repositoryRoot)
	if err != nil {
		return nil, err
	}
	corpusDigest := digest(corpusBytes)
	cases := make([]resultCase, 0, 12)
	for _, testCase := range corpus.ComponentCases {
		item := identityBase(testCase.ID, corpusDigest, len(corpusBytes))
		canonical, calculated, operationErr := contractidentity.Component(testCase.Value, testCase.Purpose, testCase.MediaType, allowed)
		if operationErr == nil {
			if testCase.ExpectedCode != "" || calculated != testCase.ExpectedDigest {
				return nil, fmt.Errorf("%s: component expectation differs", testCase.ID)
			}
			item.Valid = true
			item.Findings = []finding{}
			item.Canonicalization = canonicalization{Status: "produced", BytesBase64: base64.StdEncoding.EncodeToString(canonical), Digest: digest(canonical)}
			item.ComponentDigest = &calculated
		} else {
			var profileErr *contractidentity.Error
			if !errors.As(operationErr, &profileErr) || profileErr.Code != testCase.ExpectedCode {
				return nil, operationErr
			}
			canonical, _, canonicalErr := contractidentity.Component(testCase.Value, "schema", "application/json", map[string]bool{"schema": true})
			if canonicalErr != nil {
				return nil, canonicalErr
			}
			item.Valid = false
			item.Findings = []finding{{Code: profileErr.Code, InstancePath: "/", SchemaPath: "/profile/componentIdentity"}}
			item.Canonicalization = canonicalization{Status: "produced", BytesBase64: base64.StdEncoding.EncodeToString(canonical), Digest: digest(canonical)}
		}
		cases = append(cases, item)
	}
	bomCases := make(map[string]bomIdentityCase, len(corpus.BOMCases))
	for _, item := range corpus.BOMCases {
		bomCases[item.ID] = item
	}
	for _, testCase := range corpus.BOMCases {
		item := identityBase(testCase.ID, corpusDigest, len(corpusBytes))
		raw, err := resolveBOM(testCase, bomCases)
		if err != nil {
			return nil, err
		}
		canonical, calculated, verified, operationErr := contractidentity.ContractBOM(raw)
		if operationErr == nil {
			if testCase.ExpectedCode != "" || calculated != testCase.ExpectedDigest || testCase.ExpectedVerification == nil || verified != *testCase.ExpectedVerification {
				return nil, fmt.Errorf("%s: BOM expectation differs", testCase.ID)
			}
			if testCase.ExpectedCanonicalWithoutDigest != "" && string(canonical) != testCase.ExpectedCanonicalWithoutDigest {
				return nil, fmt.Errorf("%s: canonical BOM differs", testCase.ID)
			}
			item.Valid = verified
			item.Findings = []finding{}
			if !verified {
				item.Findings = []finding{{Code: "BOM_DIGEST_MISMATCH", InstancePath: "/digest", SchemaPath: "/profile/contractBomIdentity"}}
			}
			item.Canonicalization = canonicalization{Status: "produced", BytesBase64: base64.StdEncoding.EncodeToString(canonical), Digest: digest(canonical)}
			item.RootBOMDigest = &calculated
		} else {
			var profileErr *contractidentity.Error
			if !errors.As(operationErr, &profileErr) || profileErr.Code != testCase.ExpectedCode {
				return nil, operationErr
			}
			item.Valid = false
			item.Findings = []finding{{Code: profileErr.Code, InstancePath: "/digest", SchemaPath: "/profile/contractBomIdentity"}}
			item.Canonicalization = canonicalization{Status: "rejected", Code: profileErr.Code}
		}
		cases = append(cases, item)
	}
	sort.Slice(cases, func(i, j int) bool { return cases[i].CaseID < cases[j].CaseID })
	var adapterBytes bytes.Buffer
	for _, name := range []string{"identity/identity.go", "canonicalizer/jcs.go", "conformance/identity.go"} {
		raw, err := os.ReadFile(filepath.Join(repositoryRoot, "packages", "contracts-go", filepath.FromSlash(name)))
		if err != nil {
			return nil, err
		}
		adapterBytes.Write(raw)
	}
	output := result{
		ResultVersion:         1,
		FixtureManifestDigest: corpusDigest,
		Language:              "go",
		Implementation: implementation{
			AdapterID: "anvilkit-go-identity", AdapterVersion: "0.1.0", Runtime: "go", RuntimeVersion: "go1.26.4",
			AdapterDigest: digest(adapterBytes.Bytes()),
		},
		Cases: cases,
	}
	encoded, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		return nil, err
	}
	return append(encoded, '\n'), nil
}
