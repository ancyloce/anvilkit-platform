package generatedsecurity_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/generated/agentclient"
	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/generated/pagixclient"
	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/generated/schema"
)

func TestGeneratedSchemaRejectsUnknownProperties(t *testing.T) {
	var artifact schema.AgentArtifact
	err := json.Unmarshal([]byte(`{"unexpected":true}`), &artifact)
	if err == nil || !strings.Contains(err.Error(), "unknown field") {
		t.Fatalf("unknown property was accepted: %v", err)
	}
	if err := json.Unmarshal([]byte(`null`), &artifact); err == nil {
		t.Fatal("null object was accepted")
	}
	if err := json.Unmarshal([]byte(`{"apiVersion":"first","apiVersion":"second"}`), &artifact); err == nil || !strings.Contains(err.Error(), "duplicate") {
		t.Fatalf("duplicate property was accepted: %v", err)
	}
}

func TestGeneratedBoundedMapEnforcesLimits(t *testing.T) {
	properties := make(map[string]string, 33)
	for index := 0; index < 33; index++ {
		properties[string(rune('a'+index))] = "value"
	}
	raw, err := json.Marshal(properties)
	if err != nil {
		t.Fatal(err)
	}
	var bounded schema.SharedPrimitivesBoundedStringMap
	if err := json.Unmarshal(raw, &bounded); err == nil {
		t.Fatal("map with excessive properties was accepted")
	}
	if err := json.Unmarshal([]byte(`{"key":"`+strings.Repeat("x", 1025)+`"}`), &bounded); err == nil {
		t.Fatal("map with an excessive value was accepted")
	}
}

func TestGeneratedClientsUseBoundedDefaults(t *testing.T) {
	for name, create := range map[string]func() any{
		"agent": func() any {
			client, err := agentclient.NewClient("https://agent.invalid")
			if err != nil {
				t.Fatal(err)
			}
			return client.Client
		},
		"pagix": func() any {
			client, err := pagixclient.NewClient("https://pagix.invalid")
			if err != nil {
				t.Fatal(err)
			}
			return client.Client
		},
	} {
		t.Run(name, func(t *testing.T) {
			client, ok := create().(*http.Client)
			if !ok || client.Timeout != 30*time.Second {
				t.Fatalf("default client timeout = %v", client)
			}
		})
	}
}

func TestGeneratedClientRejectsOversizedAndUnknownResponses(t *testing.T) {
	response := func(body io.ReadCloser) *http.Response {
		return &http.Response{StatusCode: http.StatusOK, Header: http.Header{"Content-Type": []string{"application/json"}}, Body: body}
	}
	if _, err := agentclient.ParseListAgentRunsResponse(response(io.NopCloser(bytes.NewReader(make([]byte, 8*1024*1024+1))))); err == nil || !strings.Contains(err.Error(), "exceeds") {
		t.Fatalf("oversized response was accepted: %v", err)
	}
	if _, err := agentclient.ParseListAgentRunsResponse(response(io.NopCloser(strings.NewReader(`{"unexpected":true}`)))); err == nil {
		t.Fatal("response with unknown properties was accepted")
	}
	if _, err := agentclient.ParseListAgentRunsResponse(response(io.NopCloser(strings.NewReader(`{"runs":[],"runs":[]}`)))); err == nil || !strings.Contains(err.Error(), "duplicate") {
		t.Fatalf("response with duplicate properties was accepted: %v", err)
	}
	if _, err := agentclient.ParseListAgentRunsResponse(response(io.NopCloser(strings.NewReader(`null`)))); err == nil {
		t.Fatal("null response was accepted")
	}
}
