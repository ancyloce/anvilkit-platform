// Package renderoriginmock is a contract stand-in for anvilkit-render-origin
// (the §8.3 runtime HTTP contract: bearer auth + X-AnvilKit-* pinning
// headers → version-pinned HTML). The REAL render-origin is hosted by
// anvilkit-studio and joins local/E2E loops once BD-007/ADR-007 is confirmed
// with the studio owners (M5 cross-repo E2E, EW-XREPO-002); this mock keeps
// the pipeline loop reproducible until then and never contains render code —
// it serves canned bytes behind the contract.
//
// Pages are keyed by slug+version: published versions are IMMUTABLE
// snapshots that coexist, so a concurrent publish never mutates what an
// in-flight pinned fetch sees (the contract behind T-version-pinned-render,
// AC-004, and the BD-009 snapshot direction). A pinned version that is not
// published answers 409 — never a silent fallback to another version.
//
// Seeded content covers every FR-009 harvest form (link/script/img/srcset/
// og:image, CSS url(...) incl. a relative ref, hashed and non-hashed asset
// names) plus the negative pages of PLAN-0001 §11: a page with residual
// asset:// (slug broken-asset-ref), a page using /_next/image (slug
// next-image), and a page referencing a > 16 MB asset (slug huge) for
// multipart coverage.
package renderoriginmock

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"sync"
)

// Page is one seeded, immutable, version-pinned page snapshot.
type Page struct {
	Slug    string
	Version string
	HTML    string
}

// Server is one mock render-origin instance.
type Server struct {
	mu     sync.Mutex
	tokens map[string]bool
	pages  map[string]map[string]Page // slug → version → page
	assets map[string]assetContent    // path → asset
}

type assetContent struct {
	body        []byte
	contentType string
}

// New builds a mock with the default seeded site (page_home / slug home /
// versions v1 and v2, per the PLAN-0001 §11 fixture contract).
func New(tokens ...string) *Server {
	accepted := map[string]bool{}
	for _, t := range tokens {
		if t != "" {
			accepted[t] = true
		}
	}
	s := &Server{tokens: accepted, pages: map[string]map[string]Page{}, assets: map[string]assetContent{}}
	s.seedDefaults()
	return s
}

// SeedPage publishes one immutable page snapshot (slug + version).
func (s *Server) SeedPage(p Page) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.pages[p.Slug] == nil {
		s.pages[p.Slug] = map[string]Page{}
	}
	s.pages[p.Slug][p.Version] = p
}

// SeedAsset adds or replaces a same-origin asset.
func (s *Server) SeedAsset(path string, contentType string, body []byte) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.assets[path] = assetContent{body: body, contentType: contentType}
}

func (s *Server) seedDefaults() {
	s.SeedPage(Page{Slug: "home", Version: "v1", HTML: `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>AnvilKit Home</title>
<meta property="og:image" content="/assets/og.png">
<link rel="stylesheet" href="/_next/static/css/main.css">
<link rel="stylesheet" href="/component-styles.css">
<script src="/_next/static/chunks/app.3f9d21ab.js" defer></script>
</head><body>
<h1>Home v1</h1>
<img src="/assets/hero.jpg" srcset="/assets/hero-640.jpg 640w, /assets/hero-1280.jpg 1280w" alt="hero">
</body></html>`})

	// A second published version of the same slug: snapshots are immutable
	// and coexist — pinned fetches of v1 stay byte-stable after v2 publishes
	// (T-version-pinned-render, AC-004).
	s.SeedPage(Page{Slug: "home", Version: "v2", HTML: `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>AnvilKit Home</title>
<link rel="stylesheet" href="/component-styles.css">
</head><body>
<h1>Home v2</h1>
</body></html>`})

	s.SeedPage(Page{Slug: "broken-asset-ref", Version: "v1", HTML: `<!doctype html>
<html><body><img src="asset://img_unresolved"></body></html>`})

	s.SeedPage(Page{Slug: "next-image", Version: "v1", HTML: `<!doctype html>
<html><body><img src="/_next/image?url=%2Fassets%2Fhero.jpg&w=640&q=75"></body></html>`})

	s.SeedPage(Page{Slug: "huge", Version: "v1", HTML: `<!doctype html>
<html><head><link rel="preload" href="/assets/huge.bin"></head><body>multipart fixture</body></html>`})

	s.assets["/_next/static/css/main.css"] = assetContent{
		contentType: "text/css",
		body: []byte(`@font-face{font-family:Inter;src:url("/fonts/inter.woff2") format("woff2")}
.hero{background-image:url(./chunk-bg.4a1b2c3d.png)}`),
	}
	s.assets["/_next/static/css/chunk-bg.4a1b2c3d.png"] = assetContent{contentType: "image/png", body: []byte("png-chunk-bg")}
	s.assets["/_next/static/chunks/app.3f9d21ab.js"] = assetContent{contentType: "application/javascript", body: []byte("console.log('anvilkit home')")}
	s.assets["/component-styles.css"] = assetContent{contentType: "text/css", body: []byte(".puck{display:block}")}
	s.assets["/assets/og.png"] = assetContent{contentType: "image/png", body: []byte("og-image")}
	s.assets["/assets/hero.jpg"] = assetContent{contentType: "image/jpeg", body: []byte("hero-full")}
	s.assets["/assets/hero-640.jpg"] = assetContent{contentType: "image/jpeg", body: []byte("hero-640")}
	s.assets["/assets/hero-1280.jpg"] = assetContent{contentType: "image/jpeg", body: []byte("hero-1280")}
	s.assets["/fonts/inter.woff2"] = assetContent{contentType: "font/woff2", body: []byte("woff2-bytes")}
	// > 16 MB deterministic fixture for the multipart metadata contract.
	s.assets["/assets/huge.bin"] = assetContent{
		contentType: "application/octet-stream",
		body:        bytes.Repeat([]byte("anvilkit-multipart-"), (17<<20)/19),
	}
}

// Handler serves the §8.3 contract.
func (s *Server) Handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		token, ok := strings.CutPrefix(r.Header.Get("Authorization"), "Bearer ")
		s.mu.Lock()
		tokenOK := ok && s.tokens[token]
		s.mu.Unlock()
		if !tokenOK {
			http.Error(w, "missing or invalid service token", http.StatusUnauthorized)
			return
		}
		if r.Header.Get("X-AnvilKit-Render-Worker") != "true" {
			// Only the export worker may fetch from render-origin (§8.3).
			http.Error(w, "render-origin accepts render-worker requests only", http.StatusForbidden)
			return
		}

		path := r.URL.Path

		// Same-origin assets first (no version pinning on static assets —
		// hashed filenames make them naturally immutable).
		s.mu.Lock()
		asset, isAsset := s.assets[path]
		s.mu.Unlock()
		if isAsset {
			w.Header().Set("Content-Type", asset.contentType)
			_, _ = w.Write(asset.body)
			return
		}

		// Page routes are version-pinned: the X-AnvilKit-Version header must
		// name a published snapshot or the fetch is a VERSION_SLUG_MISMATCH
		// (409) — never a silent fallback to a different version.
		slug := strings.Trim(path, "/")
		pinned := r.Header.Get("X-AnvilKit-Version")
		s.mu.Lock()
		versions, isPage := s.pages[slug]
		page, hasVersion := versions[pinned]
		s.mu.Unlock()
		if !isPage {
			http.NotFound(w, r)
			return
		}
		if !hasVersion {
			http.Error(w, fmt.Sprintf("version mismatch: pinned %q not published for slug %q", pinned, slug),
				http.StatusConflict)
			return
		}
		if r.Header.Get("X-AnvilKit-Deployment-Id") == "" || r.Header.Get("X-AnvilKit-Page-Id") == "" {
			http.Error(w, "missing pinning headers", http.StatusForbidden)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(page.HTML))
	})
}
