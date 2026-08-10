// PLAN-0003 M3-T01 strict JSON admission reference adapter.
//
// This dependency-free implementation is an unapproved corpus runner used to
// make the byte-level profile executable while DP-008 selects native adapters.
// It is not a production validator or an approved canonicalization library.

export type JsonValue = null | boolean | number | string | JsonValue[] | {
  [key: string]: JsonValue;
};

export type AdmissionReason =
  | "byte-limit"
  | "depth-limit"
  | "duplicate-key"
  | "invalid-bom"
  | "invalid-json"
  | "invalid-unicode"
  | "item-limit"
  | "negative-zero"
  | "number-range"
  | "schema-invalid"
  | "time-limit"
  | "unsafe-integer";

export type ValidationFinding = {
  code: string;
  instancePath: string;
  schemaPath: string;
};

export type StrictJsonLimits = {
  maxBytes: number;
  maxDepth: number;
  maxCollectionItems: number;
  maxTotalValues: number;
  maxStringBytes: number;
  maxMilliseconds: number;
};

export type StrictJsonOptions = {
  limits?: Partial<StrictJsonLimits>;
  now?: () => number;
  validate?: (value: JsonValue) => readonly ValidationFinding[];
};

export type AdmittedJson = {
  bytes: Uint8Array;
  value: JsonValue;
};

const DEFAULT_LIMITS: StrictJsonLimits = {
  maxBytes: 1_048_576,
  maxDepth: 64,
  maxCollectionItems: 100_000,
  maxTotalValues: 200_000,
  maxStringBytes: 1_048_576,
  maxMilliseconds: 1_000,
};

export class StrictJsonError extends Error {
  readonly code: "PARSE_REJECTED" | "VALIDATION_FAILED";
  readonly reason: AdmissionReason;
  readonly byteOffset: number;
  readonly instancePath: string;
  readonly schemaPath: string;

  constructor(
    code: StrictJsonError["code"],
    reason: AdmissionReason,
    message: string,
    byteOffset: number,
    instancePath: string,
    schemaPath = "/profile/strictAdmission",
  ) {
    super(message);
    this.name = "StrictJsonError";
    this.code = code;
    this.reason = reason;
    this.byteOffset = byteOffset;
    this.instancePath = instancePath;
    this.schemaPath = schemaPath;
  }
}

function pointerToken(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

class Parser {
  private index = 0;
  private totalValues = 0;
  private readonly startedAt: number;

  constructor(
    private readonly text: string,
    private readonly limits: StrictJsonLimits,
    private readonly now: () => number,
  ) {
    this.startedAt = now();
  }

  parse(): JsonValue {
    this.checkTime("/");
    this.skipWhitespace();
    const value = this.parseValue("/", 1);
    this.skipWhitespace();
    if (this.index !== this.text.length) {
      this.reject("invalid-json", "trailing bytes after the JSON value", "/");
    }
    return value;
  }

  private parseValue(path: string, depth: number): JsonValue {
    this.checkTime(path);
    if (depth > this.limits.maxDepth) {
      this.reject("depth-limit", "JSON nesting exceeds the configured depth limit", path);
    }
    this.totalValues += 1;
    if (this.totalValues > this.limits.maxTotalValues) {
      this.reject("item-limit", "JSON value count exceeds the configured limit", path);
    }

    switch (this.text[this.index]) {
      case "{": return this.parseObject(path, depth);
      case "[": return this.parseArray(path, depth);
      case "\"": return this.parseString(path);
      case "t": return this.parseLiteral("true", true, path);
      case "f": return this.parseLiteral("false", false, path);
      case "n": return this.parseLiteral("null", null, path);
      default:
        if (this.text[this.index] === "-" || this.isDigit(this.text[this.index])) {
          return this.parseNumber(path);
        }
        this.reject("invalid-json", "expected a JSON value", path);
    }
  }

  private parseObject(path: string, depth: number): { [key: string]: JsonValue } {
    // A null prototype preserves keys such as "__proto__" as ordinary JSON
    // data and prevents admission itself from invoking prototype setters.
    const result: { [key: string]: JsonValue } = Object.create(null) as { [key: string]: JsonValue };
    const keys = new Set<string>();
    let count = 0;
    this.index += 1;
    this.skipWhitespace();
    if (this.text[this.index] === "}") {
      this.index += 1;
      return result;
    }

    while (this.index < this.text.length) {
      this.checkTime(path);
      if (this.text[this.index] !== "\"") {
        this.reject("invalid-json", "object property name must be a JSON string", path);
      }
      const key = this.parseString(path);
      const propertyPath = path === "/" ? `/${pointerToken(key)}` : `${path}/${pointerToken(key)}`;
      if (keys.has(key)) {
        this.reject("duplicate-key", "duplicate property name after escape decoding", propertyPath);
      }
      keys.add(key);
      count += 1;
      if (count > this.limits.maxCollectionItems) {
        this.reject("item-limit", "object property count exceeds the configured limit", path);
      }
      this.skipWhitespace();
      if (this.text[this.index] !== ":") {
        this.reject("invalid-json", "expected ':' after object property name", propertyPath);
      }
      this.index += 1;
      this.skipWhitespace();
      result[key] = this.parseValue(propertyPath, depth + 1);
      this.skipWhitespace();
      if (this.text[this.index] === "}") {
        this.index += 1;
        return result;
      }
      if (this.text[this.index] !== ",") {
        this.reject("invalid-json", "expected ',' or '}' after object property", path);
      }
      this.index += 1;
      this.skipWhitespace();
    }
    this.reject("invalid-json", "unterminated JSON object", path);
  }

  private parseArray(path: string, depth: number): JsonValue[] {
    const result: JsonValue[] = [];
    this.index += 1;
    this.skipWhitespace();
    if (this.text[this.index] === "]") {
      this.index += 1;
      return result;
    }

    while (this.index < this.text.length) {
      const itemPath = path === "/" ? `/${result.length}` : `${path}/${result.length}`;
      if (result.length >= this.limits.maxCollectionItems) {
        this.reject("item-limit", "array item count exceeds the configured limit", path);
      }
      result.push(this.parseValue(itemPath, depth + 1));
      this.skipWhitespace();
      if (this.text[this.index] === "]") {
        this.index += 1;
        return result;
      }
      if (this.text[this.index] !== ",") {
        this.reject("invalid-json", "expected ',' or ']' after array item", path);
      }
      this.index += 1;
      this.skipWhitespace();
    }
    this.reject("invalid-json", "unterminated JSON array", path);
  }

  private parseString(path: string): string {
    this.index += 1;
    let result = "";
    while (this.index < this.text.length) {
      const code = this.text.charCodeAt(this.index);
      if (code === 0x22) {
        this.index += 1;
        if (Buffer.byteLength(result, "utf8") > this.limits.maxStringBytes) {
          this.reject("byte-limit", "decoded string exceeds the configured byte limit", path);
        }
        return result;
      }
      if (code < 0x20) {
        this.reject("invalid-json", "unescaped control character in JSON string", path);
      }
      if (code === 0x5c) {
        this.index += 1;
        const escape = this.text[this.index];
        const simple: Record<string, string> = {
          "\"": "\"", "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t",
        };
        if (escape in simple) {
          result += simple[escape];
          this.index += 1;
          continue;
        }
        if (escape !== "u") {
          this.reject("invalid-json", "invalid JSON string escape", path);
        }
        const first = this.readUnicodeEscape(path);
        if (first >= 0xd800 && first <= 0xdbff) {
          if (this.text[this.index] !== "\\" || this.text[this.index + 1] !== "u") {
            this.reject("invalid-unicode", "high surrogate escape lacks a low surrogate", path);
          }
          this.index += 1;
          const second = this.readUnicodeEscape(path);
          if (second < 0xdc00 || second > 0xdfff) {
            this.reject("invalid-unicode", "high surrogate escape is not followed by a low surrogate", path);
          }
          result += String.fromCodePoint(0x10000 + ((first - 0xd800) << 10) + second - 0xdc00);
          continue;
        }
        if (first >= 0xdc00 && first <= 0xdfff) {
          this.reject("invalid-unicode", "unpaired low surrogate escape is forbidden", path);
        }
        result += String.fromCharCode(first);
        continue;
      }
      if (code >= 0xd800 && code <= 0xdfff) {
        const next = this.text.charCodeAt(this.index + 1);
        if (code > 0xdbff || next < 0xdc00 || next > 0xdfff) {
          this.reject("invalid-unicode", "unpaired Unicode surrogate is forbidden", path);
        }
        result += this.text.slice(this.index, this.index + 2);
        this.index += 2;
        continue;
      }
      result += this.text[this.index];
      this.index += 1;
    }
    this.reject("invalid-json", "unterminated JSON string", path);
  }

  private readUnicodeEscape(path: string): number {
    // The current index points to the 'u'.
    const hex = this.text.slice(this.index + 1, this.index + 5);
    if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
      this.reject("invalid-json", "Unicode escape must contain exactly four hexadecimal digits", path);
    }
    this.index += 5;
    return Number.parseInt(hex, 16);
  }

  private parseNumber(path: string): number {
    const start = this.index;
    if (this.text[this.index] === "-") this.index += 1;
    if (this.text[this.index] === "0") {
      this.index += 1;
      if (this.isDigit(this.text[this.index])) {
        this.reject("invalid-json", "JSON number has a forbidden leading zero", path);
      }
    } else {
      if (!this.isNonZeroDigit(this.text[this.index])) {
        this.reject("invalid-json", "JSON number requires an integer part", path);
      }
      while (this.isDigit(this.text[this.index])) this.index += 1;
    }
    if (this.text[this.index] === ".") {
      this.index += 1;
      if (!this.isDigit(this.text[this.index])) {
        this.reject("invalid-json", "JSON number fraction requires a digit", path);
      }
      while (this.isDigit(this.text[this.index])) this.index += 1;
    }
    if (this.text[this.index] === "e" || this.text[this.index] === "E") {
      this.index += 1;
      if (this.text[this.index] === "+" || this.text[this.index] === "-") this.index += 1;
      if (!this.isDigit(this.text[this.index])) {
        this.reject("invalid-json", "JSON number exponent requires a digit", path);
      }
      while (this.isDigit(this.text[this.index])) this.index += 1;
    }

    const token = this.text.slice(start, this.index);
    const value = Number(token);
    if (!Number.isFinite(value)) {
      this.reject("number-range", "JSON number overflows the interoperable binary64 range", path, start);
    }
    const significand = token.split(/[eE]/, 1)[0].replace(/[-.]/g, "");
    if (value === 0 && /[1-9]/.test(significand)) {
      this.reject("number-range", "JSON number underflows the interoperable binary64 range", path, start);
    }
    if (Object.is(value, -0)) {
      this.reject("negative-zero", "negative zero is forbidden by the AnvilKit profile", path, start);
    }
    if (/^-?[0-9]+$/.test(token) && !Number.isSafeInteger(value)) {
      this.reject("unsafe-integer", "integer is outside the exactly interoperable binary64 range", path, start);
    }
    return value;
  }

  private parseLiteral<T extends null | boolean>(token: string, value: T, path: string): T {
    if (this.text.slice(this.index, this.index + token.length) !== token) {
      this.reject("invalid-json", `invalid JSON literal; expected ${token}`, path);
    }
    this.index += token.length;
    return value;
  }

  private skipWhitespace(): void {
    while (this.text[this.index] === " " || this.text[this.index] === "\t" ||
      this.text[this.index] === "\n" || this.text[this.index] === "\r") {
      this.index += 1;
    }
  }

  private checkTime(path: string): void {
    if (this.now() - this.startedAt > this.limits.maxMilliseconds) {
      this.reject("time-limit", "strict JSON admission exceeded the configured time limit", path);
    }
  }

  private byteOffset(index = this.index): number {
    return Buffer.byteLength(this.text.slice(0, index), "utf8");
  }

  private reject(reason: AdmissionReason, message: string, path: string, index = this.index): never {
    throw new StrictJsonError("PARSE_REJECTED", reason, message, this.byteOffset(index), path);
  }

  private isDigit(value: string | undefined): boolean {
    return value !== undefined && value >= "0" && value <= "9";
  }

  private isNonZeroDigit(value: string | undefined): boolean {
    return value !== undefined && value >= "1" && value <= "9";
  }
}

export function admitStrictJson(input: Uint8Array, options: StrictJsonOptions = {}): AdmittedJson {
  const limits = { ...DEFAULT_LIMITS, ...options.limits };
  if (Object.values(limits).some((limit) => !Number.isSafeInteger(limit) || limit < 0)) {
    throw new TypeError("strict JSON limits must be non-negative safe integers");
  }
  if (input.byteLength > limits.maxBytes) {
    throw new StrictJsonError(
      "PARSE_REJECTED", "byte-limit", "input exceeds the configured byte limit", 0, "/",
    );
  }
  if (input.byteLength >= 3 && input[0] === 0xef && input[1] === 0xbb && input[2] === 0xbf) {
    throw new StrictJsonError("PARSE_REJECTED", "invalid-bom", "UTF-8 BOM is forbidden", 0, "/");
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(input);
  } catch {
    throw new StrictJsonError("PARSE_REJECTED", "invalid-unicode", "input is not valid UTF-8", 0, "/");
  }
  const value = new Parser(text, limits, options.now ?? Date.now).parse();

  if (options.validate) {
    const findings = [...options.validate(value)].sort((left, right) =>
      compareUtf8(left.code, right.code) ||
      compareUtf8(left.instancePath, right.instancePath) ||
      compareUtf8(left.schemaPath, right.schemaPath)
    );
    if (findings.length > 0) {
      const first = findings[0];
      throw new StrictJsonError(
        "VALIDATION_FAILED",
        "schema-invalid",
        `pinned schema validation failed with ${first.code}`,
        0,
        first.instancePath,
        first.schemaPath,
      );
    }
  }

  return { bytes: Uint8Array.from(input), value };
}
