// Command render-origin-mock serves the render-origin contract stand-in
// (§8.3) for local compose and CI until BD-007/ADR-007 confirms the real
// anvilkit-studio render-origin integration mode.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ancyloce/anvilkit-platform/mocks/renderoriginmock"
)

func main() {
	port := envOr("PORT", "3000")
	tokens := strings.Split(envOr("INTERNAL_SERVICE_TOKENS", "local-dev-token"), ",")

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           renderoriginmock.New(tokens...).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("render-origin-mock listening on :%s (contract stand-in until BD-007/ADR-007)", port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func envOr(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}
