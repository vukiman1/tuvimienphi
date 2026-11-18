#!/usr/bin/env bash
set -euo pipefail

readonly BASE_REF="${1:?usage: has-code-changes.sh <base-ref>}"
readonly CONTENT_ONLY_PATTERN='^(apps/frontend/src/features/kien-thuc/content/|docs/)|\.md$'

changed_files="$(git diff --name-only "$BASE_REF"...HEAD)"
code_files="$(grep -vE "$CONTENT_ONLY_PATTERN" <<< "$changed_files" || true)"

if [ -n "$code_files" ]; then
  echo "code=true"
else
  echo "code=false"
fi
