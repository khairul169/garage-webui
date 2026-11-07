#!/usr/bin/env bash
#
# Provision the local development Garage instance:
#   - assign the node to a layout (first run only)
#   - create the dev-key access key (first run only)
#   - create the dev-bucket bucket and grant dev-key read/write/owner
#   - expose it as the "garage-webui" global alias
#
# Safe to run repeatedly. Requires scripts/garage-dev.sh (or scripts/dev.sh)
# to be running.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CONFIG="${CONFIG_PATH:-$ROOT/dev/garage.toml}"
ADMIN_URL="${API_BASE_URL:-http://127.0.0.1:3903}"
ADMIN_KEY="${API_ADMIN_KEY:-dev-admin-token}"
KEY_NAME="dev-key"
BUCKET_NAME="dev-bucket"
BUCKET_ALIAS="garage-webui"

run_garage() {
  garage -c "$CONFIG" "$@"
}

wait_for_server() {
  local attempts=120
  for ((i = 1; i <= attempts; i++)); do
    if run_garage status >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "error: Garage did not start; see .dev/garage/server.log" >&2
  return 1
}

wait_for_admin() {
  local attempts=120
  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS -H "Authorization: Bearer $ADMIN_KEY" \
      "$ADMIN_URL/v2/ListBuckets" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "error: Garage admin API did not become ready at $ADMIN_URL" >&2
  return 1
}

set_layout() {
  if ! run_garage status 2>/dev/null | grep -q "NO ROLE ASSIGNED"; then
    return 0
  fi

  local node_id
  node_id="$(run_garage status | awk '/NO ROLE ASSIGNED/ { print $1; exit }')"
  if [[ -z "$node_id" ]]; then
    echo "error: could not determine the Garage node ID" >&2
    return 1
  fi

  echo "Assigning node $node_id to the local layout..."
  run_garage layout assign -z dev -c 1G "$node_id" >/dev/null
  run_garage layout apply --version 1 >/dev/null
}

set_key() {
  if run_garage key list | awk 'NR > 1 { print $3 }' | grep -qx "$KEY_NAME"; then
    return 0
  fi

  echo "Creating access key $KEY_NAME..."
  run_garage key create "$KEY_NAME" >/dev/null
}

set_bucket() {
  if ! run_garage bucket info "$BUCKET_NAME" >/dev/null 2>&1; then
    echo "Creating bucket $BUCKET_NAME..."
    run_garage bucket create "$BUCKET_NAME" >/dev/null
  fi

  local key_id
  key_id="$(run_garage key list | awk -v name="$KEY_NAME" '$3 == name { print $1; exit }')"
  run_garage bucket allow --read --write --owner "$BUCKET_NAME" --key "$key_id" >/dev/null
  run_garage bucket alias "$BUCKET_NAME" "$BUCKET_ALIAS" >/dev/null
}

wait_for_server
set_layout
wait_for_admin
set_key
set_bucket

echo
echo "Local Garage is ready:"
echo "  Admin API: $ADMIN_URL"
echo "  S3 API:    ${S3_ENDPOINT_URL:-http://127.0.0.1:3900}"
echo "  Bucket:    $BUCKET_ALIAS (alias for $BUCKET_NAME)"
echo "  Key:       $KEY_NAME"
echo
run_garage key export-env --prefix "" "$KEY_NAME" | sed 's/^/  /'
