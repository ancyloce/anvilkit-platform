// Package canonicalizer provides the selected Go RFC 8785 adapter behind
// AnvilKit strict JSON admission.
package canonicalizer

import (
	"fmt"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/validator"
	"github.com/lattice-substrate/json-canon/jcs"
)

// Canonicalize returns RFC 8785 UTF-8 bytes only after strict admission has
// rejected duplicate keys, invalid Unicode, negative zero, and unsafe numbers.
func Canonicalize(raw []byte) ([]byte, error) {
	if _, err := validator.Admit(raw); err != nil {
		return nil, fmt.Errorf("strict JSON admission: %w", err)
	}
	canonical, err := jcs.Canonicalize(raw)
	if err != nil {
		return nil, fmt.Errorf("RFC 8785 canonicalization: %w", err)
	}
	return canonical, nil
}
