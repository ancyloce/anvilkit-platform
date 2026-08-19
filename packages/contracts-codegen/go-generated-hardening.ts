import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const clientHelper = `

const (
\tdefaultRequestTimeout    = 30 * time.Second
\tmaximumResponseBodyBytes = int64(8 * 1024 * 1024)
)

func readBoundedResponseBody(body io.Reader) ([]byte, error) {
\traw, err := io.ReadAll(io.LimitReader(body, maximumResponseBodyBytes+1))
\tif err != nil {
\t\treturn nil, err
\t}
\tif int64(len(raw)) > maximumResponseBodyBytes {
\t\treturn nil, fmt.Errorf("response body exceeds %d bytes", maximumResponseBodyBytes)
\t}
\treturn raw, nil
}

func decodeStrictResponseJSON(raw []byte, target any) error {
\tif bytes.Equal(bytes.TrimSpace(raw), []byte("null")) {
\t\treturn fmt.Errorf("response JSON must not be null")
\t}
\tif err := rejectDuplicateJSONNames(raw); err != nil {
\t\treturn err
\t}
\tdecoder := json.NewDecoder(bytes.NewReader(raw))
\tdecoder.DisallowUnknownFields()
\tif err := decoder.Decode(target); err != nil {
\t\treturn err
\t}
\tif err := decoder.Decode(&struct{}{}); err != io.EOF {
\t\treturn fmt.Errorf("response contains a trailing JSON value")
\t}
\treturn nil
}

func rejectDuplicateJSONNames(raw []byte) error {
\tdecoder := json.NewDecoder(bytes.NewReader(raw))
\tif err := scanJSONValue(decoder, 0); err != nil {
\t\treturn err
\t}
\tif _, err := decoder.Token(); err != io.EOF {
\t\treturn fmt.Errorf("response contains a trailing JSON value")
\t}
\treturn nil
}

func scanJSONValue(decoder *json.Decoder, depth int) error {
\tif depth > 64 {
\t\treturn fmt.Errorf("response JSON exceeds the nesting limit")
\t}
\ttoken, err := decoder.Token()
\tif err != nil {
\t\treturn err
\t}
\tdelimiter, ok := token.(json.Delim)
\tif !ok {
\t\treturn nil
\t}
\tswitch delimiter {
\tcase '{':
\t\tseen := map[string]struct{}{}
\t\tfor decoder.More() {
\t\t\tnameToken, err := decoder.Token()
\t\t\tif err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t\tname, ok := nameToken.(string)
\t\t\tif !ok {
\t\t\t\treturn fmt.Errorf("response JSON object name is invalid")
\t\t\t}
\t\t\tif _, duplicate := seen[name]; duplicate {
\t\t\t\treturn fmt.Errorf("response JSON contains duplicate field %q", name)
\t\t\t}
\t\t\tseen[name] = struct{}{}
\t\t\tif err := scanJSONValue(decoder, depth+1); err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t}
\tcase '[':
\t\tfor decoder.More() {
\t\t\tif err := scanJSONValue(decoder, depth+1); err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t}
\tdefault:
\t\treturn fmt.Errorf("response JSON delimiter is invalid")
\t}
\t_, err = decoder.Token()
\treturn err
}
`;

const schemaHelper = `

func rejectUnknownJSONFields(value []byte, target reflect.Type) error {
\tif target.Kind() != reflect.Struct {
\t\treturn nil
\t}
\tif err := rejectDuplicateJSONNames(value); err != nil {
\t\treturn err
\t}
\tvar raw map[string]json.RawMessage
\tif err := json.Unmarshal(value, &raw); err != nil {
\t\treturn err
\t}
\tif raw == nil {
\t\treturn fmt.Errorf("%s must be a JSON object", target.Name())
\t}
\tallowed := make(map[string]struct{}, target.NumField())
\tfor index := 0; index < target.NumField(); index++ {
\t\ttag := target.Field(index).Tag.Get("json")
\t\tname := strings.SplitN(tag, ",", 2)[0]
\t\tif name != "" && name != "-" {
\t\t\tallowed[name] = struct{}{}
\t\t}
\t}
\tfor name := range raw {
\t\tif _, ok := allowed[name]; !ok {
\t\t\treturn fmt.Errorf("unknown field %q for %s", name, target.Name())
\t\t}
\t}
\treturn nil
}

func rejectDuplicateJSONNames(raw []byte) error {
\tdecoder := json.NewDecoder(bytes.NewReader(raw))
\tif err := scanJSONValue(decoder, 0); err != nil {
\t\treturn err
\t}
\tif _, err := decoder.Token(); err != io.EOF {
\t\treturn fmt.Errorf("schema value contains a trailing JSON value")
\t}
\treturn nil
}

func scanJSONValue(decoder *json.Decoder, depth int) error {
\tif depth > 64 {
\t\treturn fmt.Errorf("schema JSON exceeds the nesting limit")
\t}
\ttoken, err := decoder.Token()
\tif err != nil {
\t\treturn err
\t}
\tdelimiter, ok := token.(json.Delim)
\tif !ok {
\t\treturn nil
\t}
\tswitch delimiter {
\tcase '{':
\t\tseen := map[string]struct{}{}
\t\tfor decoder.More() {
\t\t\tnameToken, err := decoder.Token()
\t\t\tif err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t\tname, ok := nameToken.(string)
\t\t\tif !ok {
\t\t\t\treturn fmt.Errorf("schema JSON object name is invalid")
\t\t\t}
\t\t\tif _, duplicate := seen[name]; duplicate {
\t\t\t\treturn fmt.Errorf("schema JSON contains duplicate field %q", name)
\t\t\t}
\t\t\tseen[name] = struct{}{}
\t\t\tif err := scanJSONValue(decoder, depth+1); err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t}
\tcase '[':
\t\tfor decoder.More() {
\t\t\tif err := scanJSONValue(decoder, depth+1); err != nil {
\t\t\t\treturn err
\t\t\t}
\t\t}
\tdefault:
\t\treturn fmt.Errorf("schema JSON delimiter is invalid")
\t}
\t_, err = decoder.Token()
\treturn err
}

// UnmarshalJSON enforces the bounds declared by BoundedStringMap.
func (j *SharedPrimitivesBoundedStringMap) UnmarshalJSON(value []byte) error {
\tvar plain map[string]string
\tif err := json.Unmarshal(value, &plain); err != nil {
\t\treturn err
\t}
\tif plain == nil {
\t\treturn fmt.Errorf("bounded string map must be a JSON object")
\t}
\tif len(plain) > 32 {
\t\treturn fmt.Errorf("bounded string map must contain at most 32 properties")
\t}
\tfor key, item := range plain {
\t\tif utf8.RuneCountInString(item) > 1024 {
\t\t\treturn fmt.Errorf("bounded string map value %q exceeds 1024 characters", key)
\t\t}
\t}
\t*j = plain
\treturn nil
}
`;

function replaceRequired(source: string, before: string | RegExp, after: string, description: string): string {
  const changed = source.replace(before, after);
  if (changed === source) throw new Error(`generated Go hardening could not locate ${description}`);
  return changed;
}

function hardenClient(path: string): void {
  let source = readFileSync(path, "utf8");
  if (source.includes("client.Client = &http.Client{}")) source = source.replace("client.Client = &http.Client{}", "client.Client = &http.Client{Timeout: defaultRequestTimeout}");
  if (source.includes("io.ReadAll(rsp.Body)")) source = source.replace(/io\.ReadAll\(rsp\.Body\)/g, "readBoundedResponseBody(rsp.Body)");
  if (source.includes("json.Unmarshal(bodyBytes, &dest)")) source = source.replace(/json\.Unmarshal\(bodyBytes, &dest\)/g, "decodeStrictResponseJSON(bodyBytes, &dest)");
  if (!source.includes("client.Client = &http.Client{Timeout: defaultRequestTimeout}") || !source.includes("readBoundedResponseBody(rsp.Body)") || !source.includes("decodeStrictResponseJSON(bodyBytes, &dest)")) {
    throw new Error("generated Go client hardening is incomplete");
  }
  const helperStart = source.indexOf("\nconst (\n\tdefaultRequestTimeout");
  if (helperStart >= 0) source = source.slice(0, helperStart);
  source += clientHelper;
  writeFileSync(path, source);
}

function hardenSchema(path: string): void {
  let source = readFileSync(path, "utf8");
  if (!source.includes('import "bytes"')) source = replaceRequired(source, 'import "encoding/json"', 'import "bytes"\nimport "encoding/json"', "schema byte import");
  if (!source.includes('import "io"')) source = replaceRequired(source, 'import "fmt"', 'import "fmt"\nimport "io"', "schema I/O import");
  if (!source.includes('import "strings"')) source = replaceRequired(source, 'import "reflect"', 'import "reflect"\nimport "strings"', "schema string import");
  if (!source.includes("rejectUnknownJSONFields(value, reflect.TypeOf(*j))")) {
    source = replaceRequired(
      source,
      /(func \(j \*[A-Za-z0-9_]+\) UnmarshalJSON\(value \[\]byte\) error \{)\n/g,
      "$1\n\tif err := rejectUnknownJSONFields(value, reflect.TypeOf(*j)); err != nil {\n\t\treturn err\n\t}\n",
      "schema JSON unmarshalers",
    );
  }
  const helperStart = source.indexOf("\nfunc rejectUnknownJSONFields");
  if (helperStart >= 0) source = source.slice(0, helperStart);
  source += schemaHelper;
  writeFileSync(path, source);
}

export function hardenGeneratedGo(output: string): void {
  hardenSchema(join(output, "schema", "contracts.gen.go"));
  hardenClient(join(output, "agentclient", "client.gen.go"));
  hardenClient(join(output, "pagixclient", "client.gen.go"));
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function generatedFiles(directory: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(directory).sort()) {
    if (name === "trace.json") continue;
    const path = join(directory, name);
    if (statSync(path).isDirectory()) files.push(...generatedFiles(path));
    else files.push(path);
  }
  return files;
}

export function refreshGeneratedGoTrace(output: string): void {
  const tracePath = join(output, "trace.json");
  const trace = JSON.parse(readFileSync(tracePath, "utf8"));
  const entries = generatedFiles(output).map((path) => {
    const bytes = readFileSync(path);
    return [relative(output, path), bytes.length, sha256(bytes)];
  });
  const identity = {
    directory: basename(output),
    bytes: entries.reduce((total, entry) => total + Number(entry[1]), 0),
    files: entries.length,
    sha256: sha256(JSON.stringify(entries)),
  };
  trace.output = { bytes: identity.bytes, files: identity.files, sha256: sha256(JSON.stringify([identity])), directories: [identity] };
  writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
}

if (import.meta.main) {
  const refreshOnly = process.argv[2] === "--refresh-trace";
  const output = process.argv[refreshOnly ? 3 : 2];
  if (!output) throw new Error("generated Go output directory is required");
  if (!refreshOnly) hardenGeneratedGo(output);
  refreshGeneratedGoTrace(output);
}
