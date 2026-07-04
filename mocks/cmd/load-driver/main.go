// Command load-driver is the custom Go load driver (ADR-014, EW-TEST-007,
// AC-016): it seeds N deployment records into the mock deployment-service,
// publishes N export events up front (a sustained backlog), waits for every
// deployment to reach a terminal state, and reports:
//
//   - end-to-end publish→ARTIFACT_READY latency percentiles (backlog-
//     inclusive — the queue-wait view), and
//   - the worker's own per-job P95s scraped from the
//     anvilkit_export_worker_{job,render,upload}_duration_ms histograms
//     (the §16 SLO view: job ≤ 20 s, render ≤ 5 s, upload ≤ 10 s), and
//   - a duplicate check: every deployment READY, exactly one manifest per
//     deployment prefix, ready-event count.
//
// Usage (against the compose stack):
//
//	go run ./cmd/load-driver -n 60 \
//	  -redis redis://localhost:6379 -mock http://localhost:8080 \
//	  -metrics http://localhost:19091 -s3 http://localhost:9000
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	goredis "github.com/redis/go-redis/v9"

	"github.com/ancyloce/anvilkit-export-worker/contracts/deploymentservice"
)

func main() {
	var (
		n          = flag.Int("n", 60, "number of deployments")
		redisURL   = flag.String("redis", "redis://localhost:6379", "redis URL")
		mockURL    = flag.String("mock", "http://localhost:8080", "deployment-service mock base URL")
		metricsURL = flag.String("metrics", "http://localhost:19091", "worker metrics base URL")
		s3URL      = flag.String("s3", "http://localhost:9000", "S3 endpoint for the duplicate check")
		bucket     = flag.String("bucket", "anvilkit-artifacts", "artifact bucket")
		siteID     = flag.String("site", "site_load", "site id for the run")
		timeout    = flag.Duration("timeout", 5*time.Minute, "overall deadline")
	)
	flag.Parse()
	if err := run(*n, *redisURL, *mockURL, *metricsURL, *s3URL, *bucket, *siteID, *timeout); err != nil {
		fmt.Fprintln(os.Stderr, "load-driver:", err)
		os.Exit(1)
	}
}

func run(n int, redisURL, mockURL, metricsURL, s3URL, bucket, siteID string, timeout time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	opts, err := goredis.ParseURL(redisURL)
	if err != nil {
		return err
	}
	rdb := goredis.NewClient(opts)
	defer rdb.Close()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("redis: %w", err)
	}

	depID := func(i int) string { return fmt.Sprintf("dep_load_%04d", i) }

	// Seed all records, then publish the whole backlog up front.
	fmt.Printf("seeding %d deployment records (site %s)…\n", n, siteID)
	for i := range n {
		rec := deploymentservice.DeploymentRecord{
			DeploymentID: depID(i), TeamID: "team_load", SiteID: siteID,
			PageID: "page_home", Slug: "home", Version: "v1",
			Status:     deploymentservice.DeploymentStatusExportQueued,
			RenderMode: "fetch_route", TargetID: "target_platform_local", Environment: "production",
		}
		body, _ := json.Marshal(rec)
		resp, err := http.Post(mockURL+"/__mock/seed", "application/json", bytes.NewReader(body))
		if err != nil {
			return fmt.Errorf("seed %s: %w", rec.DeploymentID, err)
		}
		_ = resp.Body.Close()
		if resp.StatusCode != http.StatusNoContent {
			return fmt.Errorf("seed %s: status %d", rec.DeploymentID, resp.StatusCode)
		}
	}

	fmt.Printf("publishing %d events (sustained backlog)…\n", n)
	published := make(map[string]time.Time, n)
	for i := range n {
		payload, _ := json.Marshal(map[string]any{
			"eventId": "evt_load_" + strconv.Itoa(i), "eventType": "deployment.export.requested",
			"deploymentId": depID(i), "teamId": "team_load", "siteId": siteID,
			"pageId": "page_home", "slug": "home", "version": "v1",
			"renderMode": "fetch_route", "targetId": "target_platform_local",
			"environment": "production", "idempotencyKey": depID(i),
		})
		published[depID(i)] = time.Now()
		if err := rdb.XAdd(ctx, &goredis.XAddArgs{
			Stream: "anvilkit:deployment.export.requested",
			Values: map[string]any{"payload": string(payload), "attempt": "0"},
		}).Err(); err != nil {
			return fmt.Errorf("publish %s: %w", depID(i), err)
		}
	}

	// Poll to terminal states.
	completion := make(map[string]time.Duration, n)
	failed := map[string]string{}
	client := &http.Client{Timeout: 5 * time.Second}
	for len(completion)+len(failed) < n {
		if ctx.Err() != nil {
			return fmt.Errorf("deadline: %d/%d terminal (failed: %d)", len(completion)+len(failed), n, len(failed))
		}
		for i := range n {
			id := depID(i)
			if _, done := completion[id]; done {
				continue
			}
			if _, done := failed[id]; done {
				continue
			}
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet, mockURL+"/internal/deployments/"+id, nil)
			req.Header.Set("Authorization", "Bearer local-dev-token")
			resp, err := client.Do(req)
			if err != nil {
				continue
			}
			var rec deploymentservice.DeploymentRecord
			_ = json.NewDecoder(resp.Body).Decode(&rec)
			_ = resp.Body.Close()
			switch rec.Status {
			case deploymentservice.DeploymentStatusArtifactReady:
				completion[id] = time.Since(published[id])
			case deploymentservice.DeploymentStatusExportFailed:
				failed[id] = string(rec.Status)
			}
		}
		time.Sleep(150 * time.Millisecond)
	}
	if len(failed) > 0 {
		return fmt.Errorf("%d deployments failed: %v", len(failed), failed)
	}

	// End-to-end percentiles (backlog-inclusive).
	durations := make([]time.Duration, 0, n)
	for _, d := range completion {
		durations = append(durations, d)
	}
	sort.Slice(durations, func(i, j int) bool { return durations[i] < durations[j] })
	pct := func(p float64) time.Duration {
		idx := int(float64(len(durations)-1) * p)
		return durations[idx]
	}

	// Worker-side per-job P95s from the Prometheus histograms.
	metrics, err := scrape(ctx, metricsURL+"/metrics")
	if err != nil {
		return err
	}
	jobP95 := histogramQuantile(metrics, "anvilkit_export_worker_job_duration_ms", 0.95)
	renderP95 := histogramQuantile(metrics, "anvilkit_export_worker_render_duration_ms", 0.95)
	uploadP95 := histogramQuantile(metrics, "anvilkit_export_worker_upload_duration_ms", 0.95)

	// Duplicate check: exactly one manifest per deployment prefix.
	host := strings.TrimPrefix(strings.TrimPrefix(s3URL, "http://"), "https://")
	s3, err := minio.New(host, &minio.Options{
		Creds:  credentials.NewStaticV4("minioadmin", "minioadmin", ""),
		Secure: strings.HasPrefix(s3URL, "https://"),
	})
	if err != nil {
		return err
	}
	manifests := 0
	for object := range s3.ListObjects(ctx, bucket, minio.ListObjectsOptions{
		Prefix: "sites/" + siteID + "/", Recursive: true,
	}) {
		if object.Err != nil {
			return object.Err
		}
		if strings.HasSuffix(object.Key, "/artifact-manifest.json") {
			manifests++
		}
	}
	readyEvents, err := rdb.XLen(ctx, "anvilkit:deployment.artifact.ready").Result()
	if err != nil {
		return err
	}

	fmt.Println("\n=== load test result ===")
	fmt.Printf("deployments:               %d (all ARTIFACT_READY)\n", n)
	fmt.Printf("publish→READY p50/p95/max: %v / %v / %v (backlog-inclusive)\n",
		pct(0.50).Round(time.Millisecond), pct(0.95).Round(time.Millisecond), durations[len(durations)-1].Round(time.Millisecond))
	fmt.Printf("worker job P95:            %.0f ms (SLO 20000, §16)\n", jobP95)
	fmt.Printf("worker render P95:         %.0f ms (SLO 5000)\n", renderP95)
	fmt.Printf("worker upload P95:         %.0f ms (SLO 10000)\n", uploadP95)
	fmt.Printf("manifests in storage:      %d (want exactly %d — zero duplicates)\n", manifests, n)
	fmt.Printf("ready events emitted:      %d (duplicate-tolerant; >= %d)\n", readyEvents, n)

	if manifests != n {
		return fmt.Errorf("duplicate-artifact check failed: %d manifests for %d deployments", manifests, n)
	}
	if jobP95 > 20000 || renderP95 > 5000 || uploadP95 > 10000 {
		return fmt.Errorf("P95 SLO violated: job=%.0f render=%.0f upload=%.0f", jobP95, renderP95, uploadP95)
	}
	fmt.Println("SLOs met; zero duplicate artifacts under contention (AC-016).")
	return nil
}

func scrape(ctx context.Context, url string) (map[string]float64, error) {
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("metrics scrape: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	out := map[string]float64{}
	for _, line := range strings.Split(string(body), "\n") {
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		fields := strings.Fields(line)
		if len(fields) != 2 {
			continue
		}
		v, err := strconv.ParseFloat(fields[1], 64)
		if err != nil {
			continue
		}
		out[fields[0]] = v
	}
	return out, nil
}

// histogramQuantile computes q from Prometheus cumulative buckets by linear
// interpolation (promql-style, adequate for a pass/fail SLO gate).
func histogramQuantile(metrics map[string]float64, name string, q float64) float64 {
	type bucket struct {
		le    float64
		count float64
	}
	var buckets []bucket
	for metric, value := range metrics {
		if !strings.HasPrefix(metric, name+"_bucket{le=\"") {
			continue
		}
		leStr := strings.TrimSuffix(strings.TrimPrefix(metric, name+"_bucket{le=\""), "\"}")
		if leStr == "+Inf" {
			buckets = append(buckets, bucket{le: -1, count: value}) // sentinel
			continue
		}
		le, err := strconv.ParseFloat(leStr, 64)
		if err != nil {
			continue
		}
		buckets = append(buckets, bucket{le: le, count: value})
	}
	if len(buckets) == 0 {
		return -1
	}
	sort.Slice(buckets, func(i, j int) bool {
		// +Inf sentinel sorts last.
		if buckets[i].le == -1 {
			return false
		}
		if buckets[j].le == -1 {
			return true
		}
		return buckets[i].le < buckets[j].le
	})
	total := buckets[len(buckets)-1].count
	if total == 0 {
		return -1
	}
	target := q * total
	prevLe, prevCount := 0.0, 0.0
	for _, b := range buckets {
		if b.le == -1 {
			return prevLe // quantile beyond the last finite bucket
		}
		if b.count >= target {
			if b.count == prevCount {
				return b.le
			}
			return prevLe + (b.le-prevLe)*(target-prevCount)/(b.count-prevCount)
		}
		prevLe, prevCount = b.le, b.count
	}
	return prevLe
}
