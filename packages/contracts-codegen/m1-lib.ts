import { createHash } from "node:crypto";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

export type Finding = {
  code: string;
  severity: "error" | "warning" | "info";
  instancePath: string;
  schemaPath: string;
  message: string;
  retryability: "never" | "operator-action";
};

export type RegistryEntry = {
  wireValue: string;
  meaning: string;
  owner: string;
  introducedIn: string;
  status: string;
  aliases: string[];
  replacement: string | null;
  retryability?: string;
};

export type Registry = {
  registryId: string;
  owner: string;
  compatibilityPolicy: string;
  entries: RegistryEntry[];
};

export type RegistrySet = {
  registrySetVersion: number;
  status: string;
  registries: Registry[];
};

export type CompatibilityClassification =
  | "no-change"
  | "documentation-only"
  | "compatible-additive"
  | "behaviorally-narrowing"
  | "breaking";

export type CompatibilityChange = {
  path: string;
  kind: string;
  classification: Exclude<CompatibilityClassification, "no-change">;
  oldValue: Json | "<absent>";
  newValue: Json | "<absent>";
};

const PROFILE_META_SCHEMA =
  "https://contracts.anvilkit.dev/schemas/meta/anvilkit-2020-12.schema.json";
const UTC_MILLIS_PATTERN =
  "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$";
const DECIMAL_STRING_PATTERN = "^-?(0|[1-9][0-9]*)(\\.[0-9]+)?$";
const INTEGER_STRING_PATTERN = "^-?(0|[1-9][0-9]*)$";
const SAFE_INTEGER = 9_007_199_254_740_991;
const MAX_REFERENCE_DEPTH = 32;

const ALLOWED_FORMATS = new Set([
  "uuid",
  "date-time",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "duration",
]);

const ALLOWED_VOCABULARIES = new Set([
  "https://json-schema.org/draft/2020-12/vocab/core",
  "https://json-schema.org/draft/2020-12/vocab/applicator",
  "https://json-schema.org/draft/2020-12/vocab/validation",
  "https://json-schema.org/draft/2020-12/vocab/unevaluated",
  "https://json-schema.org/draft/2020-12/vocab/format-annotation",
  "https://json-schema.org/draft/2020-12/vocab/format-assertion",
  "https://json-schema.org/draft/2020-12/vocab/meta-data",
  "https://json-schema.org/draft/2020-12/vocab/content",
]);

const ALLOWED_KEYWORDS = new Set([
  "$schema", "$id", "$ref", "$dynamicRef", "$anchor", "$dynamicAnchor", "$vocabulary",
  "$comment", "$defs", "type", "enum", "const", "multipleOf", "maximum", "exclusiveMaximum",
  "minimum", "exclusiveMinimum", "maxLength", "minLength", "pattern", "format",
  "contentEncoding", "contentMediaType", "contentSchema", "maxItems", "minItems", "uniqueItems",
  "maxContains", "minContains", "contains", "items", "prefixItems", "maxProperties",
  "minProperties", "required", "dependentRequired", "properties", "patternProperties",
  "additionalProperties", "propertyNames", "dependentSchemas", "unevaluatedItems",
  "unevaluatedProperties", "allOf", "anyOf", "oneOf", "not", "if", "then", "else",
  "title", "description", "default", "deprecated", "readOnly", "writeOnly", "examples",
  "x-anvilkit-contract", "x-anvilkit-nullSemantics", "x-anvilkit-omittedSemantics",
  "x-anvilkit-extensionMap", "x-anvilkit-decimalString", "x-anvilkit-integerString",
]);

const EXECUTABLE_MEDIA_TYPES = new Set([
  "application/javascript",
  "text/javascript",
  "application/wasm",
  "application/vnd.npm.package",
  "application/x-executable",
]);

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 } as const;
const CLASSIFICATION_ORDER: Record<CompatibilityClassification, number> = {
  "no-change": 0,
  "documentation-only": 1,
  "compatible-additive": 2,
  "behaviorally-narrowing": 3,
  "breaking": 4,
};

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function stableFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((left, right) =>
    SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] ||
    compareUtf8(left.code, right.code) ||
    compareUtf8(left.instancePath, right.instancePath) ||
    compareUtf8(left.schemaPath, right.schemaPath) ||
    compareUtf8(left.message, right.message)
  );
}

function finding(
  code: string,
  instancePath: string,
  schemaPath: string,
  message: string,
  retryability: Finding["retryability"] = "never",
): Finding {
  return { code, severity: "error", instancePath, schemaPath, message, retryability };
}

function isObject(value: Json | undefined): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapePointer(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function typesOf(schema: JsonObject): string[] {
  if (typeof schema.type === "string") return [schema.type];
  if (Array.isArray(schema.type)) return schema.type.filter((item): item is string => typeof item === "string");
  return [];
}

export function isPortableRegex(pattern: string): boolean {
  if (Buffer.byteLength(pattern, "utf8") > 256) return false;
  if (pattern.includes("(?")) return false;
  if (/\\[1-9]/.test(pattern)) return false;
  if (/(?:\+|\*|\{[0-9]+,?[0-9]*\})\)(?:\+|\*|\{)/.test(pattern)) return false;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function referenceSyntaxFinding(ref: string, path: string): Finding | undefined {
  if (ref.startsWith("#")) return undefined;
  if (ref.startsWith("./") || ref.startsWith("../") || ref.startsWith("/")) {
    return finding("AK-REF-008", path, "/properties/$ref", "relative references and graph escapes are forbidden");
  }
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("file:") || ref.startsWith("data:")) {
    return finding("AK-REF-001", path, "/properties/$ref", "network, file, and embedded-data references are forbidden");
  }
  if (!ref.startsWith("anvilkit://schema/")) {
    return finding("AK-REF-001", path, "/properties/$ref", "reference scheme is outside the closed AnvilKit resolver");
  }
  if (/@(?:latest|main|stable|current)(?:[?#]|$)/.test(ref)) {
    return finding("AK-REF-002", path, "/properties/$ref", "mutable reference selectors are forbidden");
  }
  const immutable = /^anvilkit:\/\/schema\/[a-z0-9]+(?:[.-][a-z0-9]+)*\.v[1-9][0-9]*@[1-9][0-9]*\.[0-9]+\.[0-9]+\?digest=sha256:[0-9a-f]{64}(?:#(?:\/.*)?)?$/;
  if (!/[?&]digest=sha256:[0-9a-f]{64}(?:#|&|$)/.test(ref)) {
    return finding("AK-REF-003", path, "/properties/$ref", "logical reference requires a lowercase SHA-256 digest");
  }
  if (!immutable.test(ref)) {
    return finding("AK-REF-002", path, "/properties/$ref", "logical reference must pin component major and semantic version");
  }
  return undefined;
}

export function lintSchema(root: JsonObject): Finding[] {
  const findings: Finding[] = [];
  const metadata = isObject(root["x-anvilkit-contract"])
    ? root["x-anvilkit-contract"] as JsonObject
    : undefined;
  const identityFields = new Set(
    Array.isArray(metadata?.identityFields)
      ? metadata.identityFields.filter((item): item is string => typeof item === "string")
      : [],
  );

  if (root.$schema !== PROFILE_META_SCHEMA) {
    findings.push(finding("AK-SRC-001", "/$schema", "/properties/$schema/const", "schema must declare the AnvilKit Draft 2020-12 meta-schema"));
  }
  const requiredMetadata = [
    "logicalId", "semanticVersion", "componentName", "owner", "stability",
    "identityFields", "maximumSerializedBytes", "compatibilityPolicy", "descriptions",
  ];
  if (!metadata) {
    findings.push(finding("AK-SRC-002", "/x-anvilkit-contract", "/required", "AnvilKit contract metadata is required"));
  } else {
    for (const key of requiredMetadata) {
      if (!(key in metadata)) {
        findings.push(finding("AK-SRC-002", `/x-anvilkit-contract/${escapePointer(key)}`, "/$defs/contractMetadata/required", `contract metadata field ${key} is required`));
      }
    }
    if (typeof root.$id !== "string" || !/^https:\/\/contracts\.anvilkit\.dev\/schemas\/v[1-9][0-9]*\/[a-z0-9]+(?:-[a-z0-9]+)*\.schema\.json$/.test(root.$id)) {
      findings.push(finding("AK-SRC-002", "/$id", "/properties/$id/pattern", "schema ID must be an immutable AnvilKit versioned schema ID"));
    }
    const logicalId = metadata.logicalId;
    const semanticVersion = metadata.semanticVersion;
    const componentName = metadata.componentName;
    const owner = metadata.owner;
    const stability = metadata.stability;
    const maximumSerializedBytes = metadata.maximumSerializedBytes;
    const compatibilityPolicy = metadata.compatibilityPolicy;
    const descriptions = metadata.descriptions;
    if (typeof logicalId !== "string" || !/^[A-Z][A-Za-z0-9]+V[1-9][0-9]*$/.test(logicalId)) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/logicalId", "/$defs/contractMetadata/properties/logicalId", "logicalId must be a versioned PascalCase contract family"));
    }
    if (typeof semanticVersion !== "string" || !/^[1-9][0-9]*\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(semanticVersion)) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/semanticVersion", "/$defs/contractMetadata/properties/semanticVersion", "semanticVersion must be an immutable nonzero-major semantic version"));
    }
    if (typeof componentName !== "string" || !/^anvilkit\.[a-z0-9]+(?:[.-][a-z0-9]+)*\.v[1-9][0-9]*$/.test(componentName)) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/componentName", "/$defs/contractMetadata/properties/componentName", "componentName must be a governed versioned logical name"));
    }
    if (typeof owner !== "string" || owner.length < 3 || owner.length > 128) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/owner", "/$defs/contractMetadata/properties/owner", "owner must name an accountable role"));
    }
    if (typeof stability !== "string" || !new Set(["experimental", "p0-freeze-candidate", "stable", "deprecated"]).has(stability)) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/stability", "/$defs/contractMetadata/properties/stability", "stability is outside the governed lifecycle"));
    }
    if (
      !Number.isInteger(maximumSerializedBytes) ||
      typeof maximumSerializedBytes !== "number" ||
      maximumSerializedBytes < 64 || maximumSerializedBytes > 1_048_576
    ) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/maximumSerializedBytes", "/$defs/contractMetadata/properties/maximumSerializedBytes", "maximumSerializedBytes must be an explicit bounded integer"));
    }
    if (typeof compatibilityPolicy !== "string" || !new Set(["frozen-major", "compatible-additive", "registry-append-only"]).has(compatibilityPolicy)) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/compatibilityPolicy", "/$defs/contractMetadata/properties/compatibilityPolicy", "compatibilityPolicy is outside the governed set"));
    }
    if (
      !Array.isArray(descriptions) || descriptions.length > 8 ||
      descriptions.some((item) => typeof item !== "string" || !/^contracts\/(?:openapi|asyncapi)\/v[1-9][0-9]*\/[a-z0-9.-]+\.(?:json|yaml)$/.test(item)) ||
      new Set(descriptions.map(String)).size !== descriptions.length
    ) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/descriptions", "/$defs/contractMetadata/properties/descriptions", "descriptions must be unique repository-local OpenAPI or AsyncAPI paths"));
    }
    const identityPointers = Array.isArray(metadata.identityFields) ? metadata.identityFields : [];
    if (
      identityPointers.length === 0 || identityPointers.length > 128 ||
      identityPointers.some((item) => typeof item !== "string" || !/^\/(?:[^~/]|~0|~1)+(?:\/(?:[^~/]|~0|~1)+)*$/.test(item)) ||
      new Set(identityPointers.map(String)).size !== identityPointers.length
    ) {
      findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/identityFields", "/$defs/contractMetadata/properties/identityFields", "identityFields must be unique non-root RFC 6901 pointers"));
    }
    if (
      typeof root.$id === "string" && typeof semanticVersion === "string" &&
      typeof logicalId === "string" && typeof componentName === "string"
    ) {
      const major = semanticVersion.split(".")[0];
      if (!root.$id.includes(`/v${major}/`) || !logicalId.endsWith(`V${major}`) || !componentName.endsWith(`.v${major}`)) {
        findings.push(finding("AK-SRC-002", "/x-anvilkit-contract/semanticVersion", "/profile/majorIdentity", "schema ID, logical ID, component name, and semantic major must agree"));
      }
    }
  }

  const visit = (schema: JsonObject, schemaPath: string, instancePath: string): void => {
    for (const key of Object.keys(schema)) {
      if (!ALLOWED_KEYWORDS.has(key)) {
        findings.push(finding("AK-SRC-003", `${schemaPath}/${escapePointer(key)}`, "/allowedKeywords", `unsupported schema keyword ${key}`));
      }
    }
    if (isObject(schema.$vocabulary)) {
      for (const vocabulary of Object.keys(schema.$vocabulary)) {
        if (!ALLOWED_VOCABULARIES.has(vocabulary)) {
          findings.push(finding("AK-SRC-003", `${schemaPath}/$vocabulary/${escapePointer(vocabulary)}`, "/$vocabulary", `unsupported vocabulary ${vocabulary}`));
        }
      }
    }

    const types = typesOf(schema);
    if (types.includes("object")) {
      const extensionMap = schema["x-anvilkit-extensionMap"] === true;
      const closed = schema.unevaluatedProperties === false || schema.additionalProperties === false;
      if (!closed && !extensionMap) {
        findings.push(finding("AK-SRC-004", schemaPath, "/profile/closedObjects", "object schemas are closed by default"));
      }
      if (
        typeof schema.minProperties !== "number" ||
        typeof schema.maxProperties !== "number"
      ) {
        findings.push(finding("AK-SRC-006", schemaPath, "/profile/objectBounds", "object schemas require minProperties and maxProperties"));
      }
      if (extensionMap && (!isObject(schema.additionalProperties) || typeof schema.maxProperties !== "number")) {
        findings.push(finding("AK-SRC-004", schemaPath, "/profile/extensionMap", "extension maps require a bounded additionalProperties schema"));
      }
      if (isObject(schema.properties)) {
        const required = new Set(
          Array.isArray(schema.required)
            ? schema.required.filter((item): item is string => typeof item === "string")
            : [],
        );
        const omitted = isObject(schema["x-anvilkit-omittedSemantics"])
          ? schema["x-anvilkit-omittedSemantics"] as JsonObject
          : {};
        for (const [property, child] of Object.entries(schema.properties)) {
          if (!required.has(property) && typeof omitted[property] !== "string") {
            findings.push(finding("AK-SRC-009", `${schemaPath}/properties/${escapePointer(property)}`, "/profile/omittedSemantics", `optional property ${property} requires explicit omission semantics`));
          }
          if (isObject(child)) {
            visit(
              child,
              `${schemaPath}/properties/${escapePointer(property)}`,
              `${instancePath}/${escapePointer(property)}`,
            );
          }
        }
      }
    }
    if (types.includes("array")) {
      if (typeof schema.minItems !== "number" || typeof schema.maxItems !== "number") {
        findings.push(finding("AK-SRC-006", schemaPath, "/profile/arrayBounds", "array schemas require minItems and maxItems"));
      }
    }
    if (types.includes("string") && !("const" in schema) && !Array.isArray(schema.enum)) {
      if (typeof schema.minLength !== "number" || typeof schema.maxLength !== "number") {
        findings.push(finding("AK-SRC-005", schemaPath, "/profile/stringBounds", "string schemas require minLength and maxLength"));
      }
    }
    if (types.includes("number") || types.includes("integer")) {
      const lower = typeof schema.minimum === "number" || typeof schema.exclusiveMinimum === "number";
      const upper = typeof schema.maximum === "number" || typeof schema.exclusiveMaximum === "number";
      if (!lower || !upper) {
        findings.push(finding("AK-SRC-007", schemaPath, "/profile/numberBounds", "numeric schemas require finite lower and upper bounds"));
      }
      if (identityFields.has(instancePath)) {
        const minimum = typeof schema.minimum === "number" ? schema.minimum : schema.exclusiveMinimum;
        const maximum = typeof schema.maximum === "number" ? schema.maximum : schema.exclusiveMaximum;
        const safeInteger =
          types.length === 1 && types[0] === "integer" &&
          typeof minimum === "number" && typeof maximum === "number" &&
          Number.isSafeInteger(minimum) && Number.isSafeInteger(maximum) &&
          minimum >= -SAFE_INTEGER && maximum <= SAFE_INTEGER;
        if (!safeInteger) {
          findings.push(finding("AK-SRC-014", schemaPath, "/profile/identityNumbers", "identity-bearing numbers must be proven safe bounded integers or encoded as strings"));
        }
      }
    }
    const nullable = types.includes("null") ||
      (Array.isArray(schema.anyOf) && schema.anyOf.some((item) => isObject(item) && typesOf(item).includes("null")));
    if (nullable && typeof schema["x-anvilkit-nullSemantics"] !== "string") {
      findings.push(finding("AK-SRC-008", schemaPath, "/profile/nullSemantics", "nullable schemas require explicit null semantics"));
    }
    if (typeof schema.format === "string") {
      if (!ALLOWED_FORMATS.has(schema.format)) {
        findings.push(finding("AK-SRC-010", `${schemaPath}/format`, "/profile/formats", `unsupported asserted format ${schema.format}`));
      }
      if (
        schema.format === "date-time" &&
        (schema.pattern !== UTC_MILLIS_PATTERN || schema.minLength !== 24 || schema.maxLength !== 24)
      ) {
        findings.push(finding("AK-SRC-011", schemaPath, "/profile/timestamps", "date-time requires exact YYYY-MM-DDTHH:mm:ss.SSSZ bounds and pattern"));
      }
    }
    if (typeof schema.pattern === "string" && !isPortableRegex(schema.pattern)) {
      findings.push(finding("AK-SRC-012", `${schemaPath}/pattern`, "/profile/portableRegex", "regular expression is outside the portable bounded subset"));
    }
    if (
      schema["x-anvilkit-decimalString"] === true &&
      (types.length !== 1 || types[0] !== "string" || schema.pattern !== DECIMAL_STRING_PATTERN)
    ) {
      findings.push(finding("AK-SRC-015", schemaPath, "/profile/decimalString", "decimal strings require the exact portable no-leading-zero decimal pattern"));
    }
    if (
      schema["x-anvilkit-integerString"] === true &&
      (types.length !== 1 || types[0] !== "string" || schema.pattern !== INTEGER_STRING_PATTERN)
    ) {
      findings.push(finding("AK-SRC-015", schemaPath, "/profile/integerString", "integer strings require the exact portable no-leading-zero integer pattern"));
    }
    if (schema["x-anvilkit-decimalString"] === true && schema["x-anvilkit-integerString"] === true) {
      findings.push(finding("AK-SRC-015", schemaPath, "/profile/numericStrings", "a string cannot declare both decimal and integer profiles"));
    }
    if (typeof schema.contentMediaType === "string" && EXECUTABLE_MEDIA_TYPES.has(schema.contentMediaType)) {
      findings.push(finding("AK-SRC-013", `${schemaPath}/contentMediaType`, "/profile/declarativeContent", `executable content type ${schema.contentMediaType} is forbidden`));
    }
    if (typeof schema.$ref === "string") {
      const refFinding = referenceSyntaxFinding(schema.$ref, `${schemaPath}/$ref`);
      if (refFinding) findings.push(refFinding);
    }

    for (const key of ["items", "contains", "additionalProperties", "propertyNames", "contentSchema", "not", "if", "then", "else", "unevaluatedItems", "unevaluatedProperties"] as const) {
      if (isObject(schema[key])) visit(schema[key] as JsonObject, `${schemaPath}/${key}`, instancePath);
    }
    for (const key of ["allOf", "anyOf", "oneOf", "prefixItems"] as const) {
      if (Array.isArray(schema[key])) {
        schema[key].forEach((child, index) => {
          if (isObject(child)) visit(child, `${schemaPath}/${key}/${index}`, instancePath);
        });
      }
    }
    for (const key of ["$defs", "patternProperties", "dependentSchemas"] as const) {
      if (isObject(schema[key])) {
        for (const [name, child] of Object.entries(schema[key] as JsonObject)) {
          if (isObject(child)) visit(child, `${schemaPath}/${key}/${escapePointer(name)}`, instancePath);
        }
      }
    }
  };

  visit(root, "", "");
  return stableFindings(findings);
}

export type ReferenceDocument = {
  logicalUri: string;
  bytes: Uint8Array;
  schema: JsonObject;
};

function externalRefs(schema: JsonObject): string[] {
  const refs: string[] = [];
  const walk = (node: Json): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!isObject(node)) return;
    if (typeof node.$ref === "string" && !node.$ref.startsWith("#")) refs.push(node.$ref);
    Object.values(node).forEach(walk);
  };
  walk(schema);
  return refs.sort(compareUtf8);
}

export function resolveClosedReferences(
  roots: ReferenceDocument[],
  maximumDepth = MAX_REFERENCE_DEPTH,
): Finding[] {
  const findings: Finding[] = [];
  const byUri = new Map(roots.map((document) => [document.logicalUri, document]));
  const visit = (document: ReferenceDocument, stack: string[], depth: number): void => {
    if (depth > maximumDepth) {
      findings.push(finding("AK-REF-006", document.logicalUri, "/profile/referenceDepth", `reference graph exceeds depth ${maximumDepth}`));
      return;
    }
    for (const ref of externalRefs(document.schema)) {
      const syntax = referenceSyntaxFinding(ref, `${document.logicalUri}#/$ref`);
      if (syntax) {
        findings.push(syntax);
        continue;
      }
      const withoutFragment = ref.split("#", 1)[0];
      const digest = /[?&]digest=(sha256:[0-9a-f]{64})/.exec(withoutFragment)?.[1];
      const target = byUri.get(withoutFragment);
      if (!target) {
        findings.push(finding("AK-REF-005", ref, "/profile/closedReferences", "reference target is absent from the closed graph"));
        continue;
      }
      const actual = `sha256:${createHash("sha256").update(target.bytes).digest("hex")}`;
      if (digest !== actual) {
        findings.push(finding("AK-REF-004", ref, "/profile/referenceDigest", "reference digest does not match target bytes"));
        continue;
      }
      if (stack.includes(target.logicalUri)) {
        findings.push(finding("AK-REF-007", ref, "/profile/referenceCycles", "reference cycle is not approved"));
        continue;
      }
      visit(target, [...stack, target.logicalUri], depth + 1);
    }
  };
  for (const root of [...roots].sort((a, b) => compareUtf8(a.logicalUri, b.logicalUri))) {
    visit(root, [root.logicalUri], 0);
  }
  return stableFindings(findings);
}

export function validateRegistrySet(set: RegistrySet): Finding[] {
  const findings: Finding[] = [];
  const registryIds = new Set<string>();
  const retryability = new Set(
    set.registries.find((registry) => registry.registryId === "retryability")?.entries
      .map((entry) => entry.wireValue) ?? [],
  );
  for (const registry of [...set.registries].sort((a, b) => compareUtf8(a.registryId, b.registryId))) {
    const registryPath = `/registries/${escapePointer(registry.registryId)}`;
    if (registryIds.has(registry.registryId)) {
      findings.push(finding("AK-REG-001", registryPath, "/registryId", "duplicate registry ID"));
    }
    registryIds.add(registry.registryId);
    if (registry.compatibilityPolicy !== "append-only") {
      findings.push(finding("AK-REG-003", `${registryPath}/compatibilityPolicy`, "/compatibilityPolicy", "registry compatibility policy must be append-only"));
    }
    const symbols = new Map<string, string>();
    const entries = new Map(registry.entries.map((entry) => [entry.wireValue, entry]));
    for (const entry of registry.entries) {
      const entryPath = `${registryPath}/entries/${escapePointer(entry.wireValue)}`;
      for (const symbol of [entry.wireValue, ...entry.aliases]) {
        const existing = symbols.get(symbol);
        if (existing) {
          findings.push(finding("AK-REG-001", entryPath, "/entries/unique", `registry symbol ${symbol} collides with ${existing}`));
        } else {
          symbols.set(symbol, entry.wireValue);
        }
      }
      if (entry.aliases.includes(entry.wireValue)) {
        findings.push(finding("AK-REG-004", entryPath, "/aliases", "entry cannot alias its own wire value"));
      }
      if (entry.replacement !== null) {
        if (entry.replacement === entry.wireValue || !entries.has(entry.replacement)) {
          findings.push(finding("AK-REG-005", `${entryPath}/replacement`, "/replacement", "replacement must name a different existing wire value"));
        }
      }
      if ((entry.status === "deprecated" || entry.status === "revoked") && entry.replacement === null) {
        findings.push(finding("AK-REG-005", `${entryPath}/replacement`, "/replacement", `${entry.status} entries require an explicit replacement`));
      }
      if (entry.retryability !== undefined && !retryability.has(entry.retryability)) {
        findings.push(finding("AK-REG-005", `${entryPath}/retryability`, "/retryability", "problem retryability is not governed"));
      }
    }
  }
  return stableFindings(findings);
}

export function compareRegistrySets(
  previous: RegistrySet,
  candidate: RegistrySet,
  deprecationAuthorization?: string,
): Finding[] {
  const findings = validateRegistrySet(candidate);
  const candidateRegistries = new Map(candidate.registries.map((registry) => [registry.registryId, registry]));
  for (const oldRegistry of previous.registries) {
    const nextRegistry = candidateRegistries.get(oldRegistry.registryId);
    if (!nextRegistry) {
      findings.push(finding("AK-REG-002", `/registries/${escapePointer(oldRegistry.registryId)}`, "/appendOnly", "registry was removed"));
      continue;
    }
    if (oldRegistry.owner !== nextRegistry.owner || oldRegistry.compatibilityPolicy !== nextRegistry.compatibilityPolicy) {
      findings.push(finding("AK-REG-003", `/registries/${escapePointer(oldRegistry.registryId)}`, "/immutableRegistryMetadata", "registry owner or compatibility meaning changed"));
    }
    const nextEntries = new Map<string, RegistryEntry>();
    for (const entry of nextRegistry.entries) {
      if (!nextEntries.has(entry.wireValue)) nextEntries.set(entry.wireValue, entry);
    }
    for (const oldEntry of oldRegistry.entries) {
      const nextEntry = nextEntries.get(oldEntry.wireValue);
      const path = `/registries/${escapePointer(oldRegistry.registryId)}/entries/${escapePointer(oldEntry.wireValue)}`;
      if (!nextEntry) {
        findings.push(finding("AK-REG-002", path, "/appendOnly", "registry entry was removed"));
        continue;
      }
      if (
        oldEntry.meaning !== nextEntry.meaning ||
        oldEntry.owner !== nextEntry.owner ||
        oldEntry.introducedIn !== nextEntry.introducedIn ||
        oldEntry.retryability !== nextEntry.retryability
      ) {
        findings.push(finding("AK-REG-003", path, "/immutableEntryMeaning", "existing registry entry meaning or ownership changed"));
      }
      for (const alias of oldEntry.aliases) {
        if (!nextEntry.aliases.includes(alias)) {
          findings.push(finding("AK-REG-004", `${path}/aliases`, "/appendOnlyAliases", `existing alias ${alias} was removed`));
        }
      }
      if (oldEntry.status !== nextEntry.status && !deprecationAuthorization) {
        findings.push(finding("AK-REG-006", `${path}/status`, "/deprecationAuthorization", "status transition requires authorization evidence"));
      }
      if (oldEntry.replacement !== nextEntry.replacement && !deprecationAuthorization) {
        findings.push(finding("AK-REG-006", `${path}/replacement`, "/deprecationAuthorization", "replacement transition requires authorization evidence"));
      }
    }
  }
  return stableFindings(findings);
}

function jsonEqual(left: Json, right: Json): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function classifyConstraint(
  key: string,
  oldValue: Json | undefined,
  newValue: Json | undefined,
): Exclude<CompatibilityClassification, "no-change"> {
  if (newValue === undefined) return "compatible-additive";
  if (oldValue === undefined) return "behaviorally-narrowing";
  if (typeof oldValue !== "number" || typeof newValue !== "number") return "breaking";
  const lowerBound = key.startsWith("min") || key === "minimum" || key === "exclusiveMinimum";
  if (lowerBound) return newValue > oldValue ? "behaviorally-narrowing" : "compatible-additive";
  return newValue < oldValue ? "behaviorally-narrowing" : "compatible-additive";
}

function pushChange(
  changes: CompatibilityChange[],
  path: string,
  kind: string,
  classification: Exclude<CompatibilityClassification, "no-change">,
  oldValue: Json | undefined,
  newValue: Json | undefined,
): void {
  changes.push({
    path: path || "/",
    kind,
    classification,
    oldValue: oldValue === undefined ? "<absent>" : oldValue,
    newValue: newValue === undefined ? "<absent>" : newValue,
  });
}

export function compareSchemas(previous: JsonObject, candidate: JsonObject): {
  classification: CompatibilityClassification;
  changes: CompatibilityChange[];
} {
  if (jsonEqual(previous, candidate)) return { classification: "no-change", changes: [] };
  const changes: CompatibilityChange[] = [];
  const annotations = new Set(["title", "description", "$comment", "examples"]);
  const constraints = new Set([
    "minLength", "maxLength", "minItems", "maxItems", "minProperties", "maxProperties",
    "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minContains", "maxContains",
  ]);

  const compare = (oldValue: Json | undefined, newValue: Json | undefined, path: string, oldParent?: JsonObject): void => {
    if (oldValue !== undefined && newValue !== undefined && jsonEqual(oldValue, newValue)) return;
    const segments = path.split("/").filter(Boolean);
    const key = segments.at(-1) ?? "";
    const parentKey = segments.at(-2) ?? "";
    if (annotations.has(key)) {
      pushChange(changes, path, "annotation", "documentation-only", oldValue, newValue);
      return;
    }
    if (key === "semanticVersion") {
      pushChange(changes, path, "version-metadata", "documentation-only", oldValue, newValue);
      return;
    }
    if (key === "required" && Array.isArray(oldValue) && Array.isArray(newValue)) {
      const oldSet = new Set(oldValue.filter((item): item is string => typeof item === "string"));
      const newSet = new Set(newValue.filter((item): item is string => typeof item === "string"));
      for (const item of newSet) if (!oldSet.has(item)) pushChange(changes, `${path}/${escapePointer(item)}`, "required-added", "breaking", undefined, item);
      for (const item of oldSet) if (!newSet.has(item)) pushChange(changes, `${path}/${escapePointer(item)}`, "required-removed", "compatible-additive", item, undefined);
      return;
    }
    if (key === "enum" && Array.isArray(oldValue) && Array.isArray(newValue)) {
      for (const item of oldValue) if (!newValue.some((candidateItem) => jsonEqual(item, candidateItem))) pushChange(changes, path, "enum-removed", "breaking", item, undefined);
      for (const item of newValue) if (!oldValue.some((previousItem) => jsonEqual(item, previousItem))) pushChange(changes, path, "enum-added", "compatible-additive", undefined, item);
      return;
    }
    if (constraints.has(key)) {
      pushChange(changes, path, "constraint", classifyConstraint(key, oldValue, newValue), oldValue, newValue);
      return;
    }
    if (key === "pattern" || key === "format") {
      pushChange(changes, path, key, oldValue === undefined ? "behaviorally-narrowing" : "breaking", oldValue, newValue);
      return;
    }
    if (parentKey === "properties") {
      if (oldValue === undefined) {
        const extensionMap = oldParent?.["x-anvilkit-extensionMap"] === true;
        pushChange(changes, path, "optional-property-added", extensionMap ? "compatible-additive" : "breaking", oldValue, newValue);
      } else if (newValue === undefined) {
        pushChange(changes, path, "property-removed", "breaking", oldValue, newValue);
      } else {
        compareObjects(oldValue, newValue, path);
      }
      return;
    }
    if (parentKey === "$defs" && oldValue === undefined) {
      pushChange(changes, path, "unused-definition-added", "compatible-additive", oldValue, newValue);
      return;
    }
    if (isObject(oldValue) && isObject(newValue)) {
      compareObjects(oldValue, newValue, path);
      return;
    }
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      pushChange(changes, path, "array-semantics", "breaking", oldValue, newValue);
      return;
    }
    if (key === "default" || key === "$id" || key === "type" || path.includes("/identityFields")) {
      pushChange(changes, path, "wire-or-identity-semantics", "breaking", oldValue, newValue);
      return;
    }
    pushChange(changes, path, "unclassified-semantic-change", "breaking", oldValue, newValue);
  };

  const compareObjects = (oldObjectValue: Json, newObjectValue: Json, path: string): void => {
    if (!isObject(oldObjectValue) || !isObject(newObjectValue)) {
      compare(oldObjectValue, newObjectValue, path);
      return;
    }
    const keys = new Set([...Object.keys(oldObjectValue), ...Object.keys(newObjectValue)]);
    for (const key of [...keys].sort(compareUtf8)) {
      compare(
        oldObjectValue[key],
        newObjectValue[key],
        `${path}/${escapePointer(key)}`,
        oldObjectValue,
      );
    }
  };

  compareObjects(previous, candidate, "");
  const classification = changes.reduce<CompatibilityClassification>(
    (highest, change) =>
      CLASSIFICATION_ORDER[change.classification] > CLASSIFICATION_ORDER[highest]
        ? change.classification
        : highest,
    "no-change",
  );
  changes.sort((left, right) =>
    compareUtf8(left.path, right.path) ||
    compareUtf8(left.kind, right.kind)
  );
  return { classification, changes };
}

export function sha256(bytes: Uint8Array): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function compatibilityRank(classification: CompatibilityClassification): number {
  return CLASSIFICATION_ORDER[classification];
}
