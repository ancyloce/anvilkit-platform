// Mock conformance tests (EW-LOCAL-002 DoD): the mock is driven exclusively
// through the worker's GENERATED deployment-service client, so mock and
// worker stay pinned to the same frozen contract.
package deploymentmock_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"reflect"
	"testing"

	"github.com/ancyloce/anvilkit-export-worker/contracts/deploymentservice"

	"github.com/ancyloce/anvilkit-platform/mocks/deploymentmock"
)

const testToken = "test-token"

func fixtureRecord(t *testing.T) deploymentservice.DeploymentRecord {
	t.Helper()
	raw, err := os.ReadFile("../../services/export-worker/contracts/deploymentservice/testdata/deployment-record.json")
	if err != nil {
		t.Fatalf("read fixture: %v", err)
	}
	var rec deploymentservice.DeploymentRecord
	if err := json.Unmarshal(raw, &rec); err != nil {
		t.Fatal(err)
	}
	return rec
}

func newMock(t *testing.T) (*deploymentmock.Server, *deploymentservice.Client, *httptest.Server) {
	t.Helper()
	mock := deploymentmock.New(testToken, "rotation-overlap-token")
	srv := httptest.NewServer(mock.Handler())
	t.Cleanup(srv.Close)
	client := &deploymentservice.Client{BaseURL: srv.URL, Token: testToken}
	return mock, client, srv
}

func TestRecordRoundTripThroughGeneratedClient(t *testing.T) {
	mock, client, _ := newMock(t)
	rec := fixtureRecord(t)
	mock.Seed(rec)

	got, err := client.GetDeployment(context.Background(), rec.DeploymentID)
	if err != nil {
		t.Fatalf("GetDeployment: %v", err)
	}
	if !reflect.DeepEqual(*got, rec) {
		t.Errorf("record mismatch:\nwant %+v\ngot  %+v", rec, *got)
	}
}

func TestCASApplyAndConflict(t *testing.T) {
	mock, client, _ := newMock(t)
	rec := fixtureRecord(t) // status EXPORT_QUEUED
	mock.Seed(rec)
	ctx := context.Background()

	err := client.UpdateDeploymentStatus(ctx, rec.DeploymentID, deploymentservice.StatusUpdateRequest{
		From: deploymentservice.DeploymentStatusExportQueued, To: deploymentservice.DeploymentStatusExporting,
		Reason: "worker_started", TraceID: "trace_01",
	})
	if err != nil {
		t.Fatalf("CAS apply: %v", err)
	}
	if got, _ := mock.Record(rec.DeploymentID); got.Status != deploymentservice.DeploymentStatusExporting {
		t.Errorf("status after CAS = %s", got.Status)
	}

	// Same CAS again: from no longer matches → 409 with currentStatus.
	err = client.UpdateDeploymentStatus(ctx, rec.DeploymentID, deploymentservice.StatusUpdateRequest{
		From: deploymentservice.DeploymentStatusExportQueued, To: deploymentservice.DeploymentStatusExporting,
		Reason: "worker_started", TraceID: "trace_01",
	})
	var conflict *deploymentservice.StatusConflictError
	if !errors.As(err, &conflict) {
		t.Fatalf("want StatusConflictError, got %v", err)
	}
	if conflict.CurrentStatus != deploymentservice.DeploymentStatusExporting {
		t.Errorf("currentStatus = %s", conflict.CurrentStatus)
	}
}

// TestArtifactSubmissionBD004: identical re-POST → idempotent accept (204);
// different pointer → 409 benign conflict (ADR-004 interim semantics).
func TestArtifactSubmissionBD004(t *testing.T) {
	mock, client, _ := newMock(t)
	rec := fixtureRecord(t)
	mock.Seed(rec)
	ctx := context.Background()

	raw, err := os.ReadFile("../../services/export-worker/contracts/deploymentservice/testdata/artifact-pointer.json")
	if err != nil {
		t.Fatal(err)
	}
	var pointer deploymentservice.ArtifactPointer
	if err := json.Unmarshal(raw, &pointer); err != nil {
		t.Fatal(err)
	}

	if err := client.SubmitArtifact(ctx, rec.DeploymentID, pointer); err != nil {
		t.Fatalf("first submission: %v", err)
	}
	if err := client.SubmitArtifact(ctx, rec.DeploymentID, pointer); err != nil {
		t.Fatalf("identical re-POST must be accepted idempotently (ADR-004): %v", err)
	}

	different := pointer
	different.ManifestDigest = "sha256-different"
	err = client.SubmitArtifact(ctx, rec.DeploymentID, different)
	var apiErr *deploymentservice.APIError
	if !errors.As(err, &apiErr) || apiErr.StatusCode != http.StatusConflict {
		t.Fatalf("different pointer must 409, got %v", err)
	}
}

// TestArtifactPointerRoutesInvariant: the submission must carry routes[] as
// an array (FR-012) — the mock enforces the contract.
func TestArtifactPointerRoutesInvariant(t *testing.T) {
	mock, _, srv := newMock(t)
	rec := fixtureRecord(t)
	mock.Seed(rec)

	body := []byte(`{"manifestStorageKey":"k","artifactBasePath":"b","manifestDigest":"sha256-x","entry":"/e","filesCount":1,"totalBytes":2}`)
	req, _ := http.NewRequest(http.MethodPost, srv.URL+"/internal/deployments/"+rec.DeploymentID+"/artifact", bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+testToken)
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("pointer without routes[] = %d, want 400", resp.StatusCode)
	}
}

// TestAuthModes (ADR-002/EW-TEST-008 groundwork): missing/invalid token →
// 401; dual-token window accepts both configured tokens; scripted 401/403.
func TestAuthModes(t *testing.T) {
	mock, _, srv := newMock(t)
	rec := fixtureRecord(t)
	mock.Seed(rec)
	ctx := context.Background()

	noToken := &deploymentservice.Client{BaseURL: srv.URL}
	if _, err := noToken.GetDeployment(ctx, rec.DeploymentID); !isStatus(err, http.StatusUnauthorized) {
		t.Errorf("missing token: %v, want 401", err)
	}
	badToken := &deploymentservice.Client{BaseURL: srv.URL, Token: "wrong"}
	if _, err := badToken.GetDeployment(ctx, rec.DeploymentID); !isStatus(err, http.StatusUnauthorized) {
		t.Errorf("invalid token: %v, want 401", err)
	}
	rotated := &deploymentservice.Client{BaseURL: srv.URL, Token: "rotation-overlap-token"}
	if _, err := rotated.GetDeployment(ctx, rec.DeploymentID); err != nil {
		t.Errorf("dual-token window must accept the overlapping token: %v", err)
	}

	setFailMode(t, srv.URL, "http403")
	good := &deploymentservice.Client{BaseURL: srv.URL, Token: testToken}
	if _, err := good.GetDeployment(ctx, rec.DeploymentID); !isStatus(err, http.StatusForbidden) {
		t.Errorf("scripted 403: %v", err)
	}
}

func TestScriptableServerError(t *testing.T) {
	mock, client, srv := newMock(t)
	rec := fixtureRecord(t)
	mock.Seed(rec)
	setFailMode(t, srv.URL, "http500")
	if _, err := client.GetDeployment(context.Background(), rec.DeploymentID); !isStatus(err, http.StatusInternalServerError) {
		t.Errorf("scripted 500: %v", err)
	}
	setFailMode(t, srv.URL, "none")
	if _, err := client.GetDeployment(context.Background(), rec.DeploymentID); err != nil {
		t.Errorf("recovery after failMode reset: %v", err)
	}
}

func isStatus(err error, status int) bool {
	var apiErr *deploymentservice.APIError
	return errors.As(err, &apiErr) && apiErr.StatusCode == status
}

func setFailMode(t *testing.T, baseURL, mode string) {
	t.Helper()
	body := []byte(`{"failMode":"` + mode + `"}`)
	resp, err := http.Post(baseURL+"/__mock/control", "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("control endpoint = %d", resp.StatusCode)
	}
}
