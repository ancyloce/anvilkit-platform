// Conformance tests for the render-origin contract stand-in (§8.3): auth,
// worker-only access, version pinning, and harvest-form coverage.
package renderoriginmock_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/ancyloce/anvilkit-platform/mocks/renderoriginmock"
)

func get(t *testing.T, srv *httptest.Server, path, version string, mutate func(*http.Request)) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, srv.URL+path, nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Authorization", "Bearer test-token")
	req.Header.Set("X-AnvilKit-Render-Worker", "true")
	req.Header.Set("X-AnvilKit-Deployment-Id", "dep_01")
	req.Header.Set("X-AnvilKit-Page-Id", "page_home")
	req.Header.Set("X-AnvilKit-Version", version)
	req.Header.Set("X-AnvilKit-Team-Id", "team_01")
	req.Header.Set("X-AnvilKit-Site-Id", "site_01")
	req.Header.Set("X-AnvilKit-Environment", "production")
	if mutate != nil {
		mutate(req)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = resp.Body.Close() })
	return resp
}

func TestVersionPinnedPageFetch(t *testing.T) {
	srv := httptest.NewServer(renderoriginmock.New("test-token").Handler())
	defer srv.Close()

	resp := get(t, srv, "/home", "v1", nil)
	if resp.StatusCode != http.StatusOK || !strings.HasPrefix(resp.Header.Get("Content-Type"), "text/html") {
		t.Fatalf("home fetch = %d %s", resp.StatusCode, resp.Header.Get("Content-Type"))
	}
	body, _ := io.ReadAll(resp.Body)
	for _, ref := range []string{"/_next/static/css/main.css", "/assets/hero-640.jpg 640w", "og:image"} {
		if !strings.Contains(string(body), ref) {
			t.Errorf("seeded page missing harvest form %q", ref)
		}
	}

	// Version pinning: an unpublished pin is a 409 (VERSION_SLUG_MISMATCH).
	if resp := get(t, srv, "/home", "v99", nil); resp.StatusCode != http.StatusConflict {
		t.Errorf("stale version = %d, want 409", resp.StatusCode)
	}

	// Immutable snapshots coexist: v1 and v2 both stay fetchable, each
	// pinned fetch returning its own bytes (AC-004 contract).
	v2 := get(t, srv, "/home", "v2", nil)
	if v2.StatusCode != http.StatusOK {
		t.Fatalf("v2 fetch = %d", v2.StatusCode)
	}
	v2Body, _ := io.ReadAll(v2.Body)
	if !strings.Contains(string(v2Body), "Home v2") {
		t.Errorf("v2 body must be the v2 snapshot")
	}
	v1Again := get(t, srv, "/home", "v1", nil)
	v1Body, _ := io.ReadAll(v1Again.Body)
	if !strings.Contains(string(v1Body), "Home v1") {
		t.Errorf("v1 snapshot must remain byte-stable after v2 exists")
	}
}

func TestAuthAndWorkerOnlyAccess(t *testing.T) {
	srv := httptest.NewServer(renderoriginmock.New("test-token").Handler())
	defer srv.Close()

	if resp := get(t, srv, "/home", "v1", func(r *http.Request) {
		r.Header.Del("Authorization")
	}); resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("missing token = %d, want 401", resp.StatusCode)
	}
	if resp := get(t, srv, "/home", "v1", func(r *http.Request) {
		r.Header.Del("X-AnvilKit-Render-Worker")
	}); resp.StatusCode != http.StatusForbidden {
		t.Errorf("non-worker request = %d, want 403", resp.StatusCode)
	}
	if resp := get(t, srv, "/missing-page", "v1", nil); resp.StatusCode != http.StatusNotFound {
		t.Errorf("missing page = %d, want 404", resp.StatusCode)
	}
}

func TestNegativeFixturePages(t *testing.T) {
	srv := httptest.NewServer(renderoriginmock.New("test-token").Handler())
	defer srv.Close()

	resp := get(t, srv, "/broken-asset-ref", "v1", nil)
	body, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "asset://") {
		t.Error("broken-asset-ref page must contain residual asset://")
	}
	resp = get(t, srv, "/next-image", "v1", nil)
	body, _ = io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "/_next/image") {
		t.Error("next-image page must reference /_next/image")
	}
}

func TestHugeAssetForMultipart(t *testing.T) {
	srv := httptest.NewServer(renderoriginmock.New("test-token").Handler())
	defer srv.Close()

	resp := get(t, srv, "/assets/huge.bin", "v1", nil)
	body, _ := io.ReadAll(resp.Body)
	if len(body) <= 16<<20 {
		t.Fatalf("huge.bin = %d bytes, must exceed 16 MiB for the multipart contract", len(body))
	}
}
