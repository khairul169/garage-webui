#!/usr/bin/env bash
#
# Start a disposable Garage server for local development.
#
# This runs in the foreground. In another terminal, run scripts/garage-setup.sh
# once the admin API is reachable, or just use scripts/dev.sh which starts
# Garage, provisions it, and runs both the API and Vite.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v garage >/dev/null 2>&1; then
  echo "error: garage is not installed; run 'nix develop' first" >&2
  exit 1
fi

mkdir -p .dev/garage/meta .dev/garage/data

exec garage -c dev/garage.toml server
