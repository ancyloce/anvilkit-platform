// Mock conformance tests (EW-LOCAL-003 DoD), driven through the worker's
// generated asset-service client.
package assetmock_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/ancyloce/anvilkit-export-worker/contracts/assetservice"

	"github.com/ancyloce/anvilkit-platform/mocks/assetmock"
)

const testToken = "test-token"

func newMock(t *testing.T) (*assetservice.Client, *httptest.Server) {
	t.Helper()
	srv := httptest.NewServer(assetmock.New(testToken, "rotation-overlap-token").Handler())
	t.Cleanup(srv.Close)
	return &assetservice.Client{BaseURL: srv.URL, Token: testToken}, srv
}

func TestResolveBatchConformance(t *testing.T) {
	client, _ := newMock(t)
	raw, err := os.ReadFile("../../services/export-worker/contracts/assetservice/testdata/resolve-batch-request.json")
	if err != nil {
		t.Fatal(err)
	}
	var req assetservice.ResolveBatchRequest
	if err := json.Unmarshal(raw, &req); err != nil {
		t.Fatal(err)
	}

	resp, err := client.ResolveAssetsBatch(context.Background(), req)
	if err != nil {
		t.Fatalf("ResolveAssetsBatch: %v", err)
	}
	if len(resp.Assets) != len(req.Refs) {
		t.Fatalf("assets = %d, want %d", len(resp.Assets), len(req.Refs))
	}
	for i, asset := range resp.Assets {
		if asset.Ref != req.Refs[i] {
			t.Errorf("asset[%d].Ref = %q, want %q", i, asset.Ref, req.Refs[i])
		}
		if !strings.HasPrefix(asset.ContentHash, "sha256-") {
			t.Errorf("contentHash %q must be a sha256- hash (never an ETag)", asset.ContentHash)
		}
		if asset.URL == "" || asset.MimeType == "" || asset.SizeBytes <= 0 {
			t.Errorf("asset[%d] incomplete: %+v", i, asset)
		}
	}

	// Determinism: the same ref resolves identically on every call.
	again, err := client.ResolveAssetsBatch(context.Background(), req)
	if err != nil {
		t.Fatal(err)
	}
	if again.Assets[0] != resp.Assets[0] {
		t.Error("resolution must be deterministic")
	}
}

func TestAuthRejectionModes(t *testing.T) {
	_, srv := newMock(t)
	ctx := context.Background()
	req := assetservice.ResolveBatchRequest{TeamID: "team_01", SiteID: "site_01", Refs: []string{"asset://img_01"}}

	noToken := &assetservice.Client{BaseURL: srv.URL}
	if _, err := noToken.ResolveAssetsBatch(ctx, req); !isStatus(err, http.StatusUnauthorized) {
		t.Errorf("missing token: %v, want 401", err)
	}
	rotated := &assetservice.Client{BaseURL: srv.URL, Token: "rotation-overlap-token"}
	if _, err := rotated.ResolveAssetsBatch(ctx, req); err != nil {
		t.Errorf("dual-token window must accept the overlapping token: %v", err)
	}

	// Scripted 403 (ASSET_SERVICE_403 classification path in the worker).
	body := []byte(`{"failMode":"http403"}`)
	resp, err := http.Post(srv.URL+"/__mock/control", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	_ = resp.Body.Close()
	good := &assetservice.Client{BaseURL: srv.URL, Token: testToken}
	if _, err := good.ResolveAssetsBatch(ctx, req); !isStatus(err, http.StatusForbidden) {
		t.Errorf("scripted 403: %v", err)
	}
}

func isStatus(err error, status int) bool {
	var apiErr *assetservice.APIError
	return errors.As(err, &apiErr) && apiErr.StatusCode == status
}
