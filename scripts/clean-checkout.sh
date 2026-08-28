#!/usr/bin/env bash
# Prove the repository verifies from a clean checkout.
#
# The tree is materialised from exactly the files a commit would carry —
# tracked files plus untracked files git does not ignore — for the platform
# repository and for every submodule. Anything a check depends on that git
# would not keep (a local node_modules, a generated file someone forgot to
# commit, an ignored fixture) is therefore absent from the copy and fails
# here, which is the defect this gate exists to catch.
#
# The materialised tree is deliberately not a repository: history-dependent
# checks see a tree with no history, exactly as a release archive would.
#
# Usage: scripts/clean-checkout.sh [destination] [-- command...]
#   destination defaults to a temporary directory, removed on exit
#   command     defaults to scripts/kernel-verify.sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

DESTINATION=""
if [ "${1:-}" != "" ] && [ "${1:-}" != "--" ]; then
  DESTINATION="$1"
  shift
fi
[ "${1:-}" = "--" ] && shift

CLEANUP=""
if [ -z "$DESTINATION" ]; then
  DESTINATION="$(mktemp -d)"
  CLEANUP="$DESTINATION"
fi
mkdir -p "$DESTINATION"
trap 'if [ -n "$CLEANUP" ]; then rm -rf "$CLEANUP"; fi' EXIT INT TERM

materialise() { # source-directory destination-directory
  mkdir -p "$2"
  (cd "$1" && git ls-files --cached --others --exclude-standard -z |
    tar --null --files-from=- --create --file=-) | (cd "$2" && tar --extract --file=-)
}

echo "clean-checkout: materialising committable tree in $DESTINATION"
materialise "$ROOT" "$DESTINATION"
git submodule status | sed 's/^[ +-]//' | awk '{print $2}' | while read -r submodule; do
  echo "clean-checkout: + $submodule"
  materialise "$ROOT/$submodule" "$DESTINATION/$submodule"
done

if [ ! -f "$DESTINATION/package.json" ]; then
  echo "clean-checkout: the committable tree has no package.json" >&2
  exit 1
fi

cd "$DESTINATION"
# Version-control stamping has nothing to read in a tree with no history.
GOFLAGS="-buildvcs=false"
export GOFLAGS
if [ "$#" -eq 0 ]; then
  set -- ./scripts/kernel-verify.sh
fi
echo "clean-checkout: running $*"
"$@"
