package main

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strconv"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/canonicalizer"
)

func argument(name string) string {
	for index, value := range os.Args {
		if value == name && index+1 < len(os.Args) {
			return os.Args[index+1]
		}
	}
	fmt.Fprintln(os.Stderr, "missing", name)
	os.Exit(4)
	return ""
}

func main() {
	if argument("--operation") != "canonicalize" {
		os.Exit(2)
	}
	iterations, err := strconv.Atoi(argument("--iterations"))
	if err != nil || iterations < 1 {
		os.Exit(4)
	}
	input, err := os.ReadFile(argument("--input"))
	if err != nil {
		fail(err)
	}
	parseOutcome := "accepted"
	var canonical []byte
	for index := 0; index < iterations; index++ {
		canonical, err = canonicalizer.Canonicalize(input)
		if err != nil {
			parseOutcome = "rejected"
			canonical = nil
		}
	}
	var digest any
	var encoded any
	findings := []map[string]string{}
	if canonical == nil {
		findings = []map[string]string{{"code": "PARSE_REJECTED", "instancePath": "/", "schemaPath": "/profile/strictAdmission"}}
	} else {
		sum := sha256.Sum256(canonical)
		digest = "sha256:" + hex.EncodeToString(sum[:])
		encoded = base64.StdEncoding.EncodeToString(canonical)
	}
	result := map[string]any{"candidateId": "go-jcs-canonicalizer", "candidateVersion": "0.3.4", "operation": "canonicalize", "iterations": iterations, "parseOutcome": parseOutcome, "valid": nil, "orderedFindings": findings, "canonicalSha256": digest, "canonicalBytesBase64": encoded}
	if err := json.NewEncoder(os.Stdout).Encode(result); err != nil {
		fail(err)
	}
}

func fail(err error) { fmt.Fprintln(os.Stderr, err); os.Exit(3) }
