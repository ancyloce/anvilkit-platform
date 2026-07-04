// Command asset-service-mock serves the contract-conformant asset-service
// mock (FR-022, EW-LOCAL-003) for local compose and CI.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ancyloce/anvilkit-platform/mocks/assetmock"
)

func main() {
	port := envOr("PORT", "8080")
	tokens := strings.Split(envOr("INTERNAL_SERVICE_TOKENS", "local-dev-token"), ",")

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           assetmock.New(tokens...).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("asset-service-mock listening on :%s (%d accepted tokens)", port, len(tokens))
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
