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
// Exceptions are exact names, never directories or files -- see
// governedPathNames and governedContentNames below.

import { existsSync, readFileSync } from "node:fs";
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

// governedPathNames are the exact names permitted in a file or directory name:
// the canonical contract profile ADR-018 names, and the directory its scope
// owns. Keeping this tier separate from the content tier is what stops the
// allowlist becoming a licence to create new delivery-labelled files.
export const governedPathNames = ["p0-kernel-profile", "p0-kernel", "P0-Kernel"];

// governedContentNames are additionally readable inside file contents. Each is
// a name this repository is not free to rename:
//   P0        the profile scope identity ADR-018 established, quoted throughout
//             the canonical contract descriptions it governs;
//   Phase0    the same scope under the name the approved load model records it
//             by, which the retained benchmark evidence is keyed on;
//   p50..p999 the latency percentiles a metric reports under;
//   P1-001    a product requirement identifier frozen inside the ADR-001
//   P1-008    export artifact contract and the alert rules that cite the PRD
//             backlog. PRDs are read-only product authority, so these are
//             identifiers this repository records rather than names it owns.
// Every entry is an exact string matched verbatim -- not a directory prefix and
// not a file bypass -- so an entry excuses the name it spells and nothing else.
// Adding one is a governance decision, not a way past a failure.
export const governedContentNames = [...governedPathNames, "P0", "Phase0", "p999", "p99", "p95", "p90", "p50", "P1-001", "P1-008"];

function allowlist(names: string[]): RegExp {
  const ordered = [...names].sort((left, right) => right.length - left.length);
  const quoted = ordered.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp("(" + quoted.join("|") + ")", "gi");
}

const pathAllowlist = allowlist(governedPathNames);
const contentAllowlist = allowlist(governedContentNames);

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

export const pathScan = (value: string): string => findLabel(value, pathAllowlist);
export const contentScan = (value: string): string => findLabel(value, contentAllowlist);

// sourceScan adds the camel-case pass. It is reserved for source files because
// signed contract material and dependency digests live in JSON and YAML, and a
// random run of base64 can carry a capital where an identifier carries a hump.
export const sourceScan = (value: string): string =>
  contentScan(value)
  || findLabel(value, contentAllowlist, deliveryIdentifier)
  || findLabel(value, contentAllowlist, deliveryCamel);

// Code and configuration carry names; prose carries authority. Only the former
// is content-scanned.
const SCANNED_CONTENT = /(\.(go|ts|tsx|js|mjs|cjs|sh|ya?ml|json|toml)$|(^|\/)(Makefile|Dockerfile)[^/]*$)/;
// Source files carry identifiers, so they get the camel-case pass as well.
const SOURCE = /(\.(go|ts|tsx|js|mjs|cjs|sh)$|(^|\/)(Makefile|Dockerfile)[^/]*$)/;
// Lockfiles are generated dependency digests, not names anyone chose.
const GENERATED = /(^|\/)(bun\.lock|go\.sum|package-lock\.json)$/;

function main(): number {
  // The working tree is the subject, not the index: a file renamed but not yet
  // staged must be judged by the name it now has, and a newly written one must
  // be judged before it is ever committed. Ignored paths stay out, which is
  // what keeps ADR-023's local-only documentation out of scope.
  const listed = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" });
  const files = [...new Set(listed.split(/\r?\n/).filter(Boolean))].filter((file) => existsSync(join(root, file))).sort();
  const failures: string[] = [];
  for (const file of files) {
    const named = pathScan(file);
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
      const found = scan(lines[index]);
      if (found !== "") failures.push(`${file}:${index + 1}: delivery-stage naming is forbidden (${found})`);
    }
  }
  if (failures.length > 0) {
    console.error("naming governance FAILED:");
    for (const failure of failures) console.error(`  ${failure}`);
    return 1;
  }
  console.log(`naming governance passed: ${files.length} tracked paths, capability-based names only`);
  return 0;
}

if (import.meta.main) process.exit(main());
