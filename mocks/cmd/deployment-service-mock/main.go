// Command deployment-service-mock serves the contract-conformant
// deployment-service mock (FR-022, EW-LOCAL-002) for local compose and CI.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/ancyloce/anvilkit-export-worker/contracts/deploymentservice"

	"github.com/ancyloce/anvilkit-platform/mocks/deploymentmock"
)

func main() {
	port := envOr("PORT", "8080")
	tokens := strings.Split(envOr("INTERNAL_SERVICE_TOKENS", "local-dev-token"), ",")
	mock := deploymentmock.New(tokens...)

	if seedDir := os.Getenv("SEED_DIR"); seedDir != "" {
		files, err := filepath.Glob(filepath.Join(seedDir, "deployment-record*.json"))
		if err != nil {
			log.Fatalf("seed glob: %v", err)
		}
		for _, f := range files {
			raw, err := os.ReadFile(f)
			if err != nil {
				log.Fatalf("read seed %s: %v", f, err)
			}
			var rec deploymentservice.DeploymentRecord
			if err := json.Unmarshal(raw, &rec); err != nil || rec.DeploymentID == "" {
				log.Fatalf("invalid seed record %s: %v", f, err)
			}
			mock.Seed(rec)
			log.Printf("seeded deployment record %s (status %s) from %s", rec.DeploymentID, rec.Status, f)
		}
	}

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           mock.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("deployment-service-mock listening on :%s (%d accepted tokens)", port, len(tokens))
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
