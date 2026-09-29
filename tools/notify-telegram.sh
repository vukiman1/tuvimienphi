#!/usr/bin/env bash
set -euo pipefail

readonly API_BASE='https://api.telegram.org'
readonly MAX_MESSAGE_BYTES=4000

token="${TELEGRAM_BOT_TOKEN:-}"
chat="${TELEGRAM_CHAT_ID:-}"

if [ -z "$token" ] || [ -z "$chat" ]; then
  echo "notify-telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is unset, nothing sent" >&2
  exit 0
fi

message="$(cat)"
if [ -z "${message//[[:space:]]/}" ]; then
  echo 'notify-telegram: refusing to send an empty message' >&2
  exit 1
fi

message="$(printf '%s' "$message" | head -c "$MAX_MESSAGE_BYTES")"

curl --silent --show-error --fail-with-body --max-time 20 \
  --output /dev/null \
  --data-urlencode "chat_id=${chat}" \
  --data-urlencode "text=${message}" \
  --data 'disable_web_page_preview=true' \
  "${API_BASE}/bot${token}/sendMessage"
