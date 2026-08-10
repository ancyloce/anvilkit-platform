#!/usr/bin/env bash
set -eu

output_file=${1:?usage: prepare-m4-generators.sh ENV_OUTPUT_FILE}
tools_dir=${M4_TOOLS_DIR:-/tmp/anvilkit-m4-generator-tools}
script_dir=$(cd "$(dirname "$0")" && pwd)

mkdir -p "$tools_dir/go-bin" "$tools_dir/go-cache" "$tools_dir/java"
GOBIN="$tools_dir/go-bin" GOMODCACHE="$tools_dir/go-cache" go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@v2.8.0
GOBIN="$tools_dir/go-bin" GOMODCACHE="$tools_dir/go-cache" go install github.com/atombender/go-jsonschema@v0.24.1

python -m venv "$tools_dir/python"
"$tools_dir/python/bin/python" -m pip install --disable-pip-version-check -r "$script_dir/generator-tools/python.lock"

mvn --batch-mode --no-transfer-progress -q \
  -f "$script_dir/generator-tools/java-pom.xml" \
  -Dmaven.repo.local="$tools_dir/maven-repository" \
  org.apache.maven.plugins:maven-dependency-plugin:3.8.1:copy-dependencies \
  -DoutputDirectory="$tools_dir/java"

java_classpath=$(find "$tools_dir/java" -name '*.jar' -type f | sort | paste -sd: -)
openapi_jar="$tools_dir/java/openapi-generator-cli-7.22.0.jar"

printf 'GO_JSONSCHEMA=%s\n' "$tools_dir/go-bin/go-jsonschema" >> "$output_file"
printf 'OAPI_CODEGEN=%s\n' "$tools_dir/go-bin/oapi-codegen" >> "$output_file"
printf 'DATAMODEL_CODEGEN=%s\n' "$tools_dir/python/bin/datamodel-codegen" >> "$output_file"
printf 'OPENAPI_GENERATOR_JAR=%s\n' "$openapi_jar" >> "$output_file"
printf 'JSONSCHEMA2POJO_CLASSPATH=%s\n' "$java_classpath" >> "$output_file"
