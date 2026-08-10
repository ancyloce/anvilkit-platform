package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/validator"
	jsonschema "github.com/santhosh-tekuri/jsonschema/v6"
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
	if argument("--operation") != "validate" {
		os.Exit(2)
	}
	iterations, err := strconv.Atoi(argument("--iterations"))
	if err != nil || iterations < 1 {
		os.Exit(4)
	}
	schemaBytes, err := os.ReadFile(argument("--schema"))
	if err != nil {
		fail(err)
	}
	input, err := os.ReadFile(argument("--input"))
	if err != nil {
		fail(err)
	}
	schemaValue, err := jsonschema.UnmarshalJSON(strings.NewReader(string(schemaBytes)))
	if err != nil {
		fail(err)
	}
	compiler := jsonschema.NewCompiler()
	compiler.AssertFormat()
	if err = compiler.AddResource("urn:anvilkit:dp008:schema", schemaValue); err != nil {
		fail(err)
	}
	schema, err := compiler.Compile("urn:anvilkit:dp008:schema")
	if err != nil {
		fail(err)
	}
	parseOutcome := "accepted"
	valid := false
	findings := []map[string]string{}
	for index := 0; index < iterations; index++ {
		value, admissionErr := validator.Admit(input)
		if admissionErr != nil {
			parseOutcome = "rejected"
			valid = false
			findings = []map[string]string{{"code": "PARSE_REJECTED", "instancePath": "/", "schemaPath": "/profile/strictAdmission"}}
			continue
		}
		validationErr := schema.Validate(value)
		valid = validationErr == nil
		if validationErr != nil {
			var typed *jsonschema.ValidationError
			if errors.As(validationErr, &typed) {
				findings = []map[string]string{{"code": "VALIDATION_FAILED", "instancePath": "/", "schemaPath": typed.SchemaURL}}
			} else {
				findings = []map[string]string{{"code": "VALIDATION_FAILED", "instancePath": "/", "schemaPath": "/"}}
			}
		} else {
			findings = []map[string]string{}
		}
	}
	result := map[string]any{"candidateId": "go-json-schema-validator", "candidateVersion": "6.0.3", "operation": "validate", "iterations": iterations, "parseOutcome": parseOutcome, "valid": valid, "orderedFindings": findings}
	if err := json.NewEncoder(os.Stdout).Encode(result); err != nil {
		fail(err)
	}
}
func fail(err error) { fmt.Fprintln(os.Stderr, err); os.Exit(3) }
