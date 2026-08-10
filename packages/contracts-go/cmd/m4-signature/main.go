package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/conformance"
)

func main() {
	repositoryRoot := flag.String("repository-root", "../..", "repository root")
	iterations := flag.Int("iterations", 1, "positive evaluation count")
	flag.Parse()
	if *iterations < 1 {
		fmt.Fprintln(os.Stderr, "iterations must be positive")
		os.Exit(1)
	}
	var output []byte
	var err error
	for index := 0; index < *iterations; index++ {
		output, err = conformance.GenerateSignature(*repositoryRoot)
		if err != nil {
			break
		}
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if _, err := os.Stdout.Write(output); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
