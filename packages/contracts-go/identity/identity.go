// Package identity implements AnvilKit component and root-BOM identity using
// the selected strict-admission and RFC 8785 adapters.
package identity

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/canonicalizer"
)

var mediaType = regexp.MustCompile(`^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$`)

type Error struct {
	Code string
	Text string
}

func (e *Error) Error() string { return e.Text }

func wireDigest(parts ...[]byte) string {
	hash := sha256.New()
	for _, part := range parts {
		_, _ = hash.Write(part)
	}
	return "sha256:" + hex.EncodeToString(hash.Sum(nil))
}

func validPrintableASCII(value string) bool {
	if value == "" {
		return false
	}
	for _, unit := range []byte(value) {
		if unit < 0x21 || unit > 0x7e {
			return false
		}
	}
	return true
}

// Component calculates ComponentIdentityV1 and returns the canonical value.
func Component(raw []byte, purpose, contentType string, allowed map[string]bool) ([]byte, string, error) {
	if !validPrintableASCII(purpose) || strings.ContainsRune(purpose, 0) {
		return nil, "", &Error{Code: "IDENTITY_PURPOSE_INVALID", Text: "purpose is not printable ASCII"}
	}
	if purpose == "contract-bom" {
		return nil, "", &Error{Code: "IDENTITY_PURPOSE_RESERVED", Text: "contract-bom is reserved"}
	}
	if !allowed[purpose] {
		return nil, "", &Error{Code: "IDENTITY_PURPOSE_UNKNOWN", Text: "purpose is not governed"}
	}
	if !validPrintableASCII(contentType) || !mediaType.MatchString(contentType) {
		return nil, "", &Error{Code: "IDENTITY_MEDIA_TYPE_INVALID", Text: "media type is outside the profile"}
	}
	canonical, err := canonicalizer.Canonicalize(raw)
	if err != nil {
		return nil, "", fmt.Errorf("canonicalize component: %w", err)
	}
	digest := wireDigest(
		[]byte("anvilkit.component.identity.v1\x00"),
		[]byte(purpose), []byte{0}, []byte(contentType), []byte{0}, canonical,
	)
	return canonical, digest, nil
}

// ContractBOM calculates ContractBomIdentityV1 after omitting exactly the root
// digest field and reports whether the declaration matches.
func ContractBOM(raw []byte) ([]byte, string, bool, error) {
	var object map[string]json.RawMessage
	if err := json.Unmarshal(raw, &object); err != nil || object == nil {
		return nil, "", false, &Error{Code: "BOM_SHAPE_INVALID", Text: "root BOM must be an object"}
	}
	declaredRaw, ok := object["digest"]
	if !ok {
		return nil, "", false, &Error{Code: "BOM_DIGEST_MISSING", Text: "root BOM must declare a digest"}
	}
	var declared string
	_ = json.Unmarshal(declaredRaw, &declared)
	delete(object, "digest")
	withoutDigest, err := json.Marshal(object)
	if err != nil {
		return nil, "", false, err
	}
	canonical, err := canonicalizer.Canonicalize(withoutDigest)
	if err != nil {
		return nil, "", false, fmt.Errorf("canonicalize BOM: %w", err)
	}
	digest := wireDigest(
		[]byte("anvilkit.contract-bom.identity.v1\x00"),
		[]byte("application/vnd.anvilkit.contract-bom.v1+json"), []byte{0}, canonical,
	)
	verified := len(declared) == len(digest) && subtle.ConstantTimeCompare([]byte(declared), []byte(digest)) == 1
	return canonical, digest, verified, nil
}
