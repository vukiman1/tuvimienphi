#!/usr/bin/env bash
set -euo pipefail

readonly WORKFLOW_DIR="${1:-.github/workflows}"
readonly BOOTSTRAP_SECRETS=(GITHUB_TOKEN VPS_HOST VPS_SSH_KEY VPS_SSH_KNOWN_HOSTS SOPS_AGE_KEY)

used_secrets="$(grep -ohE '(^|[^-[:alnum:]_./])secrets\.[[:alnum:]_]+' "$WORKFLOW_DIR"/*.yml | sed -E 's/.*secrets\.//' | sort -u)"
unexpected_secrets="$(comm -23 <(printf '%s\n' "$used_secrets") <(printf '%s\n' "${BOOTSTRAP_SECRETS[@]}" | sort -u))"

if [ -n "$unexpected_secrets" ]; then
  echo "workflows read secrets outside the bootstrap layer; move these values into prod.enc.env:" >&2
  sed 's/^/  /' <<< "$unexpected_secrets" >&2
  exit 1
fi

echo "workflows only read bootstrap secrets"
