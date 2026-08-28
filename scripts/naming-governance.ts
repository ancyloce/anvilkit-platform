// Enforces capability-based naming across the repository's governed source
// surface. A milestone, work-package, phase, or gate label in a file name,
// directory, identifier, test name, comment, script, evidence name, metric, or
// configuration key binds the code to a delivery schedule that stops being true
// the moment the schedule moves, so the label has to go before the schedule
// does.
//
// Scope. Every Git-tracked path is name-scanned. Contents are scanned for code
// and configuration only: Markdown under docs/ is governance prose whose plan
// identifiers, ADR numbers, and milestone references are authority this
// repository records rather than naming it owns, and ADR-023 keeps the
// non-ADR half of it local-only in any case. The Agent Service submodule
// carries the same scan in its own boundary check, over its own tree.
//
// Exceptions are exact names at exact paths -- see canonicalScopeNames and
// governedLocations below. There is no allowance that applies to the tree as a
// whole, because a name readable everywhere is not an exception, it is a
// second vocabulary.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

// The label set, written entirely from character classes so this file's own
// source cannot match it. The separator set is the punctuation naming uses --
// hyphen, underscore, dot, or nothing -- and deliberately not a space, because
// a space-separated "phase 2" is a sentence describing a step, not a label.
export const LABELS = "([Mm][0-9]+|[Ww][Pp][0-9]+|[Pp][0-9]+"
  + "|[Ww][Oo][Rr][Kk][-_.]?[Pp][Aa][Cc][Kk][Aa][Gg][Ee][-_.]?[0-9]+"
  + "|[Mm][Ii][Ll][Ee][Ss][Tt][Oo][Nn][Ee][-_.]?[0-9]+"
  + "|[Pp][Hh][Aa][Ss][Ee][-_.]?[0-9]+"
  + "|[Gg][Aa][Tt][Ee][-_.]?[0-9]+)";

// Boundaries require the label to stand alone between non-alphanumerics, which
// is what keeps the scan off the base64 and hex digests that fill lockfiles and
// signed contract material: a run of random characters is not a name.
const deliveryLabel = new RegExp("(^|[^A-Za-z0-9])" + LABELS + "([^A-Za-z0-9]|$)", "g");

// The same set restricted to labels beginning with a capital, which is the only
// form a camel-case hump can take. It catches a label buried mid-identifier,
// where no separator precedes it. Requiring the capital is what keeps it off
// ordinary names: item0Total carries no hump, so it is a name, not a label.
const CAPITAL_LABELS = "(M[0-9]+|W[Pp][0-9]+|P[0-9]+"
  + "|W[Oo][Rr][Kk][-_.]?[Pp][Aa][Cc][Kk][Aa][Gg][Ee][-_.]?[0-9]+"
  + "|M[Ii][Ll][Ee][Ss][Tt][Oo][Nn][Ee][-_.]?[0-9]+"
  + "|P[Hh][Aa][Ss][Ee][-_.]?[0-9]+"
  + "|G[Aa][Tt][Ee][-_.]?[0-9]+)";
const deliveryCamel = new RegExp("([a-z0-9])" + CAPITAL_LABELS + "([^a-z0-9]|$)", "g");

// deliveryIdentifier is the text scan with the trailing boundary loosened to
// admit an uppercase letter, so a label that opens an identifier is caught
// whatever case it is written in. Source files can afford that looseness
// because the digests and signed material that would trip it live in JSON and
// YAML, which this pattern is never applied to.
const deliveryIdentifier = new RegExp("(^|[^A-Za-z0-9])" + LABELS + "([^a-z0-9]|$)", "g");

// measurementNames are not delivery labels. They are the latency percentiles a
// metric reports under -- measurement vocabulary with a fixed meaning no
// schedule can move -- so they are readable anywhere, exactly as written.
export const measurementNames = ["p999", "p99", "p95", "p90", "p50"];

// canonicalScopeNames are the exact names ADR-018 established for the canonical
// contract profile and the scope it governs. This repository does not own the
// freedom to rename them: they are the profile artifact's own name, the scope
// identity quoted throughout the canonical contract descriptions it governs,
// and the accepted ADR that established both.
//
// They are readable only at the exact paths governedLocations names. That path
// scoping is the whole point: a bare allowance for these names would let any
// file anywhere spell a delivery label and call it canonical, which is exactly
// the bypass this gate exists to close.
export const canonicalScopeNames = ["p0-kernel-profile", "p0-kernel", "P0-Kernel", "P0"];

// requirementNames are product requirement identifiers frozen inside released
// artifacts: PRDs are read-only product authority, so these are identifiers
// this repository records rather than names it owns. They are readable only at
// the exact released artifacts that already carry them.
const requirementNames = ["P1-001", "P1-008"];

// canonicalLockPath is the ADR-018 lock's own repository-relative path. The
// lock is the authority on what the canonical contract set is, so the contract
// half of the location set is derived from it rather than listed by hand: a
// hand-kept list drifts, and a directory prefix would readmit the bypass.
const canonicalLockPath = "contracts/agent/lock/contracts.lock.json";

// governedLocations maps an exact repository-relative path to the exact
// governed names that path may spell, in its own name or in its contents.
//
// Everything outside the derived contract set is spelled out here with its
// reason, because each one is a governance decision rather than a way past a
// failure. A missing or unreadable lock yields no contract locations at all,
// so the scan gets stricter when the authority is absent, never looser.
export function governedLocations(repositoryRoot: string = root): Map<string, string[]> {
  const locations = new Map<string, string[]>([
    // The accepted ADR that established the canonical profile. Accepted ADRs
    // are not renamed.
    ["docs/adr/ADR-018-canonical-agent-contract-refactor-and-p0-kernel-profile.md", canonicalScopeNames],
    // The generator that writes the profile artifact and the linter that
    // enforces its stability vocabulary: both necessarily spell the canonical
    // names they produce and validate.
    ["packages/contracts-codegen/check-agent-profile.ts", canonicalScopeNames],
    ["packages/contracts-codegen/source-lint.ts", canonicalScopeNames],
    // This gate itself, which cannot define the allowance without spelling it.
    ["scripts/naming-governance.ts", [...canonicalScopeNames, ...requirementNames]],
    // Released artifacts frozen under ADR-001 that cite a PRD requirement.
    ["contracts/artifact/v1/artifact-manifest.schema.json", requirementNames],
    ["infra/alerts/export-worker-rules.yaml", requirementNames],
  ]);
  let lock: any;
  try {
    lock = JSON.parse(readFileSync(join(repositoryRoot, canonicalLockPath), "utf8"));
  } catch {
    return locations;
  }
  locations.set(canonicalLockPath, canonicalScopeNames);
  if (typeof lock?.profile?.path === "string") locations.set(lock.profile.path, canonicalScopeNames);
  for (const source of Object.keys(lock?.sources ?? {})) locations.set(source, canonicalScopeNames);
  return locations;
}

function allowlist(names: string[]): RegExp {
  const ordered = [...names].sort((left, right) => right.length - left.length);
  const quoted = ordered.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("(" + quoted.join("|") + ")", "gi");
}

const ordinaryAllowlist = allowlist(measurementNames);
const allowlistCache = new Map<string, RegExp>();

// allowlistFor returns the allowlist one path is judged under: measurement
// vocabulary everywhere, plus the exact governed names a governance-owned path
// is entitled to spell.
export function allowlistFor(file: string, locations: Map<string, string[]>): RegExp {
  const governed = locations.get(file);
  if (!governed) return ordinaryAllowlist;
  const key = governed.join(" ");
  let cached = allowlistCache.get(key);
  if (!cached) {
    cached = allowlist([...measurementNames, ...governed]);
    allowlistCache.set(key, cached);
  }
  return cached;
}

// findLabel reports the first delivery label the allowlist does not account
// for. A label is excused only when it lies wholly inside an occurrence of a
// governed name, so the same characters inside an ordinary identifier fail.
export function findLabel(text: string, governed: RegExp, marker: RegExp = deliveryLabel): string {
  governed.lastIndex = 0;
  const spans = [...text.matchAll(governed)].map((match) => [match.index!, match.index! + match[0].length]);
  marker.lastIndex = 0;
  for (const match of text.matchAll(marker)) {
    const start = match.index! + match[1].length;
    const end = start + match[2].length;
    if (spans.some(([from, to]) => from <= start && end <= to)) continue;
    return match[2];
  }
  return "";
}

export const pathScan = (value: string, governed: RegExp = ordinaryAllowlist): string => findLabel(value, governed);
export const contentScan = (value: string, governed: RegExp = ordinaryAllowlist): string => findLabel(value, governed);

// sourceScan adds the camel-case pass. It is reserved for source files because
// signed contract material and dependency digests live in JSON and YAML, and a
// random run of base64 can carry a capital where an identifier carries a hump.
export const sourceScan = (value: string, governed: RegExp = ordinaryAllowlist): string =>
  findLabel(value, governed)
  || findLabel(value, governed, deliveryIdentifier)
  || findLabel(value, governed, deliveryCamel);

// Code and configuration carry names; prose carries authority. Only the former
// is content-scanned.
const SCANNED_CONTENT = /(\.(go|ts|tsx|js|mjs|cjs|sh|ya?ml|json|toml)$|(^|\/)(Makefile|Dockerfile)[^/]*$)/;
// Source files carry identifiers, so they get the camel-case pass as well.
const SOURCE = /(\.(go|ts|tsx|js|mjs|cjs|sh)$|(^|\/)(Makefile|Dockerfile)[^/]*$)/;
// Lockfiles are generated dependency digests, not names anyone chose.
const GENERATED = /(^|\/)(bun\.lock|go\.sum|package-lock\.json)$/;

// A verification run materialises the committable tree and runs from it
// (scripts/clean-checkout.sh), and that tree is deliberately not a repository,
// so the enumerator cannot be git alone or the scan would be unrunnable
// exactly where reproducibility is being proven. What the tooling writes into
// such a tree while the run is in progress is not committable content and is
// named here; everything else in it is, by construction.
const UNCOMMITTABLE = new Set(["node_modules", ".git", ".turbo", "dist", "target", "__pycache__", ".evidence", ".venv"]);

// git never lists a submodule's contents from the superproject, and neither
// may the walk: each service carries this same scan in its own boundary check,
// under its own governed locations, and judging its files by this tree's
// allowlist would fail the names its own governance grants it.
function submodulePaths(repositoryRoot: string): Set<string> {
  const declaration = join(repositoryRoot, ".gitmodules");
  if (!existsSync(declaration)) return new Set();
  const declared = readFileSync(declaration, "utf8").matchAll(/^\s*path\s*=\s*(.+)$/gm);
  return new Set([...declared].map((match) => match[1].trim()));
}

function treePaths(directory: string, prefix: string, submodules: Set<string>): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) {
      if (UNCOMMITTABLE.has(entry.name) || submodules.has(path)) continue;
      paths.push(...treePaths(join(directory, entry.name), path + "/", submodules));
    } else if (entry.isFile()) {
      paths.push(path);
    }
  }
  return paths;
}

// committablePaths lists what a commit of this tree would carry. In a
// repository that is git's answer: the working tree is the subject, not the
// index, so a file renamed but not yet staged is judged by the name it now
// has and a newly written one is judged before it is ever committed, while
// ignored paths stay out — which is what keeps ADR-023's local-only
// documentation out of scope.
export function committablePaths(repositoryRoot: string = root): string[] {
  let repository = true;
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: repositoryRoot, stdio: "ignore" });
  } catch {
    repository = false;
  }
  if (!repository) return treePaths(repositoryRoot, "", submodulePaths(repositoryRoot)).sort();
  const listed = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: repositoryRoot, encoding: "utf8" });
  return [...new Set(listed.split(/\r?\n/).filter(Boolean))].filter((file) => existsSync(join(repositoryRoot, file))).sort();
}

function main(): number {
  const files = committablePaths();
  const locations = governedLocations();
  const failures: string[] = [];
  for (const file of files) {
    const governed = allowlistFor(file, locations);
    const named = pathScan(file, governed);
    if (named !== "") failures.push(`${file}: delivery-stage naming is forbidden in the path (${named})`);
    if (!SCANNED_CONTENT.test(file) || GENERATED.test(file)) continue;
    let body: string;
    try {
      body = readFileSync(join(root, file), "utf8");
    } catch {
      continue;
    }
    const scan = SOURCE.test(file) ? sourceScan : contentScan;
    const lines = body.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const found = scan(lines[index], governed);
      if (found !== "") failures.push(`${file}:${index + 1}: delivery-stage naming is forbidden (${found})`);
    }
  }
  if (failures.length > 0) {
    console.error("naming governance FAILED:");
    for (const failure of failures) console.error(`  ${failure}`);
    return 1;
  }
  console.log(`naming governance passed: ${files.length} committable paths, capability-based names only`);
  return 0;
}

if (import.meta.main) process.exit(main());
