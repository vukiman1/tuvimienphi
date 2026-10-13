#!/usr/bin/env bash
set -euo pipefail

readonly DEPLOY_MANAGED_KEYS=(BACKEND_IMAGE)

[ "$#" -eq 2 ] || { echo "usage: $0 <env example> <rendered env>" >&2; exit 2; }
readonly EXAMPLE_FILE="$1"
readonly RENDERED_FILE="$2"

key_names() {
  sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p' "$1" | sort -u
}

expected_keys="$(key_names "$EXAMPLE_FILE" | grep -vxF -f <(printf '%s\n' "${DEPLOY_MANAGED_KEYS[@]}"))"
missing_keys="$(comm -23 <(printf '%s\n' "$expected_keys") <(key_names "$RENDERED_FILE"))"

if [ -n "$missing_keys" ]; then
  echo "prod env is missing keys that $EXAMPLE_FILE declares:" >&2
  sed 's/^/  /' <<< "$missing_keys" >&2
  exit 1
fi

echo "prod env declares every key of $EXAMPLE_FILE"
