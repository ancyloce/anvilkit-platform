package conformance

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	contractsSignature "github.com/ancyloce/anvilkit-platform/packages/contracts-go/signature"
)

type signatureVectorCase struct {
	ID               string `json:"id"`
	Profile          string `json:"profile"`
	Operation        string `json:"operation"`
	Mutation         string `json:"mutation"`
	ExpectedVerified bool   `json:"expectedVerified"`
}

type signatureCorpus struct {
	CorpusVersion int `json:"corpusVersion"`
	Key           struct {
		PublicKeyBase64URL   string `json:"publicKeyBase64Url"`
		PrivateSeedBase64URL string `json:"privateSeedBase64Url"`
	} `json:"key"`
	DSSE struct {
		PayloadType        string `json:"payloadType"`
		PayloadBase64URL   string `json:"payloadBase64Url"`
		SignatureBase64URL string `json:"signatureBase64Url"`
	} `json:"dsse"`
	JWS struct {
		ProtectedBase64URL string `json:"protectedBase64Url"`
		PayloadBase64URL   string `json:"payloadBase64Url"`
		SignatureBase64URL string `json:"signatureBase64Url"`
	} `json:"jws"`
	Cases []signatureVectorCase `json:"cases"`
}

type signatureFinding struct {
	Code         string `json:"code"`
	InstancePath string `json:"instancePath"`
	SchemaPath   string `json:"schemaPath"`
}

type signatureResultCase struct {
	CaseID           string             `json:"caseId"`
	InputDigest      string             `json:"inputDigest"`
	InputBytes       int                `json:"inputBytes"`
	ParseOutcome     string             `json:"parseOutcome"`
	Valid            bool               `json:"valid"`
	Findings         []signatureFinding `json:"findings"`
	Canonicalization struct {
		Status string `json:"status"`
	} `json:"canonicalization"`
	ComponentDigest *string `json:"componentDigest"`
	RootBOMDigest   *string `json:"rootBomDigest"`
	Signature       struct {
		Status string `json:"status"`
		Code   string `json:"code,omitempty"`
	} `json:"signature"`
}

// GenerateSignature evaluates the pinned Go Ed25519 primitive against the
// shared DSSE/JWS corpus and emits conformance-result v1.
func GenerateSignature(repositoryRoot string) ([]byte, error) {
	if runtime.Version() != "go1.26.4" {
		return nil, fmt.Errorf("expected Go go1.26.4, got %s", runtime.Version())
	}
	corpusPath := filepath.Join(repositoryRoot, "contracts", "governance", "m3", "signature-cases.json")
	corpusBytes, err := os.ReadFile(corpusPath)
	if err != nil {
		return nil, err
	}
	var corpus signatureCorpus
	if err := json.Unmarshal(corpusBytes, &corpus); err != nil {
		return nil, err
	}
	if corpus.CorpusVersion != 1 || len(corpus.Cases) != 6 {
		return nil, fmt.Errorf("invalid signature corpus")
	}
	decode := func(value string) ([]byte, error) { return base64.RawURLEncoding.DecodeString(value) }
	publicKey, err := decode(corpus.Key.PublicKeyBase64URL)
	if err != nil {
		return nil, err
	}
	privateSeed, err := decode(corpus.Key.PrivateSeedBase64URL)
	if err != nil {
		return nil, err
	}
	dssePayload, err := decode(corpus.DSSE.PayloadBase64URL)
	if err != nil {
		return nil, err
	}
	dsseSignature, err := decode(corpus.DSSE.SignatureBase64URL)
	if err != nil {
		return nil, err
	}
	jwsSignature, err := decode(corpus.JWS.SignatureBase64URL)
	if err != nil {
		return nil, err
	}

	cases := make([]signatureResultCase, 0, len(corpus.Cases))
	for _, vector := range corpus.Cases {
		var message, expectedSignature []byte
		if vector.Profile == "dsse" {
			message = contractsSignature.PreAuthEncoding(corpus.DSSE.PayloadType, dssePayload)
			expectedSignature = dsseSignature
		} else if vector.Profile == "jws" {
			message = []byte(corpus.JWS.ProtectedBase64URL + "." + corpus.JWS.PayloadBase64URL)
			expectedSignature = jwsSignature
		} else {
			return nil, fmt.Errorf("%s: unsupported profile", vector.ID)
		}
		message = bytes.Clone(message)
		candidateSignature := bytes.Clone(expectedSignature)
		if vector.Mutation == "message-last-byte" {
			message[len(message)-1] ^= 1
		}
		if vector.Operation == "sign-and-verify" {
			candidateSignature, err = contractsSignature.Sign(privateSeed, message)
			if err != nil {
				return nil, err
			}
			if !bytes.Equal(candidateSignature, expectedSignature) {
				return nil, fmt.Errorf("%s: deterministic signature differs from corpus", vector.ID)
			}
		}
		if vector.Mutation == "signature-first-byte" {
			candidateSignature[0] ^= 1
		}
		verified := contractsSignature.Verify(publicKey, message, candidateSignature)
		if verified != vector.ExpectedVerified {
			return nil, fmt.Errorf("%s: verification differs from corpus", vector.ID)
		}
		item := signatureResultCase{
			CaseID: vector.ID, InputDigest: digest(message), InputBytes: len(message), ParseOutcome: "accepted",
			Valid: verified, Findings: []signatureFinding{},
		}
		item.Canonicalization.Status = "not-applicable"
		if verified {
			item.Signature.Status = "verified"
		} else {
			item.Findings = append(item.Findings, signatureFinding{Code: "SIGNATURE_INVALID", InstancePath: "/signature", SchemaPath: "/profile/ed25519"})
			item.Signature.Status = "rejected"
			item.Signature.Code = "SIGNATURE_INVALID"
		}
		cases = append(cases, item)
	}
	var adapterBytes bytes.Buffer
	for _, name := range []string{"signature/ed25519.go", "conformance/signature.go"} {
		raw, readErr := os.ReadFile(filepath.Join(repositoryRoot, "packages", "contracts-go", filepath.FromSlash(name)))
		if readErr != nil {
			return nil, readErr
		}
		adapterBytes.Write(raw)
	}
	output := result{
		ResultVersion: 1, FixtureManifestDigest: digest(corpusBytes), Language: "go",
		Implementation: implementation{AdapterID: "anvilkit-go-signature-native", AdapterVersion: "0.1.0", Runtime: "go", RuntimeVersion: "go1.26.4", AdapterDigest: digest(adapterBytes.Bytes())},
	}
	// The general fixture result has a different private case type, so marshal a
	// local closed document rather than weakening either representation.
	document := struct {
		ResultVersion         int                   `json:"resultVersion"`
		FixtureManifestDigest string                `json:"fixtureManifestDigest"`
		Language              string                `json:"language"`
		Implementation        implementation        `json:"implementation"`
		Cases                 []signatureResultCase `json:"cases"`
	}{output.ResultVersion, output.FixtureManifestDigest, output.Language, output.Implementation, cases}
	encoded, err := json.MarshalIndent(document, "", "  ")
	if err != nil {
		return nil, err
	}
	return append(encoded, '\n'), nil
}
