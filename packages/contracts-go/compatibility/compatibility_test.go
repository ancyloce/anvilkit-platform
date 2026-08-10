package compatibility_test

import (
	"errors"
	"os"
	"testing"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/compatibility"
)

func TestCandidateBOMCompatibility(t *testing.T) {
	raw, err := os.ReadFile("../../../contracts/governance/m4/release-bom.json")
	if err != nil {
		t.Fatal(err)
	}
	digest, err := compatibility.VerifyCandidate(raw, 1)
	if err != nil || digest == "" {
		t.Fatalf("generation 1: digest=%q err=%v", digest, err)
	}
	for _, generation := range []int{0, 2} {
		_, err := compatibility.VerifyCandidate(raw, generation)
		var compatibilityError *compatibility.Error
		if !errors.As(err, &compatibilityError) || compatibilityError.Code != "CONTRACT_UNSUPPORTED" {
			t.Fatalf("generation %d: err=%v", generation, err)
		}
	}
}
