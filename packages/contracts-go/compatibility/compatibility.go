// Package compatibility verifies a candidate BOM at the consumer boundary.
package compatibility

import (
	"encoding/json"
	"fmt"

	contractidentity "github.com/ancyloce/anvilkit-platform/packages/contracts-go/identity"
)

type Error struct {
	Code string
	Text string
}

func (e *Error) Error() string { return e.Text }

// VerifyCandidate verifies the BOM identity and its declared consumer window.
func VerifyCandidate(raw []byte, consumerGeneration int) (string, error) {
	var bom struct {
		Compatibility struct {
			Minimum int `json:"minimumConsumerGeneration"`
			Maximum int `json:"maximumConsumerGeneration"`
		} `json:"compatibility"`
	}
	if err := json.Unmarshal(raw, &bom); err != nil {
		return "", fmt.Errorf("decode candidate BOM: %w", err)
	}
	_, digest, verified, err := contractidentity.ContractBOM(raw)
	if err != nil {
		return "", err
	}
	if !verified {
		return "", &Error{Code: "BOM_DIGEST_MISMATCH", Text: "candidate BOM identity does not verify"}
	}
	if consumerGeneration < bom.Compatibility.Minimum || consumerGeneration > bom.Compatibility.Maximum {
		return "", &Error{Code: "CONTRACT_UNSUPPORTED", Text: "consumer generation is outside the BOM compatibility window"}
	}
	return digest, nil
}
