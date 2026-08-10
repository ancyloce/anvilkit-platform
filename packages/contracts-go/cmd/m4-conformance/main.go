package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/ancyloce/anvilkit-platform/packages/contracts-go/conformance"
)

func main() {
	repositoryRoot := flag.String("repository-root", "../..", "repository root")
	flag.Parse()
	result, err := conformance.Generate(*repositoryRoot)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if _, err := os.Stdout.Write(result); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
