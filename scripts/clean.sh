#!/usr/bin/env bash
#
# Remove local development state and build output.
#
#   clean          remove Garage data, build output and Nix results
#   clean --deps   also remove node_modules
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

REMOVE_DEPS=0
for arg in "$@"; do
  case "$arg" in
    --deps | --all) REMOVE_DEPS=1 ;;
    -h | --help)
      echo "usage: clean [--deps]"
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ -f .dev/garage/garage.pid ]]; then
  garage_pid="$(cat .dev/garage/garage.pid)"
  if kill -0 "$garage_pid" 2>/dev/null; then
    echo "Stopping local Garage (pid $garage_pid)..."
    kill "$garage_pid" 2>/dev/null || true
    for _ in {1..20}; do
      kill -0 "$garage_pid" 2>/dev/null || break
      sleep 0.25
    done
  fi
fi

echo "Removing local development state and build output..."
rm -rf .dev .direnv dist backend/tmp
rm -f result result-*

if [[ "$REMOVE_DEPS" == "1" ]]; then
  echo "Removing node_modules..."
  rm -rf node_modules
fi

echo "Clean."
