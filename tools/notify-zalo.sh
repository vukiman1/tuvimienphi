#!/usr/bin/env bash
set -euo pipefail

readonly API_BASE='https://bot-api.zaloplatforms.com'
readonly MAX_MESSAGE_CHARS=2000

export LC_ALL=C.UTF-8

parse_mode=''
case "${1:-}" in
  '') ;;
  --markdown) parse_mode='markdown' ;;
  *)
    echo "usage: $0 [--markdown] < message" >&2
    exit 2
    ;;
esac

token="${ZALO_BOT_TOKEN:-}"
chat="${ZALO_CHAT_ID:-}"

if [ -z "$token" ] || [ -z "$chat" ]; then
  echo "notify-zalo: ZALO_BOT_TOKEN or ZALO_CHAT_ID is unset, nothing sent" >&2
  exit 0
fi

message="$(tr -d '\000-\010\013\014\016-\037')"
if [ -z "${message//[[:space:]]/}" ]; then
  echo 'notify-zalo: refusing to send an empty message' >&2
  exit 1
fi

message="${message:0:MAX_MESSAGE_CHARS}"

json_string() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  printf '"%s"' "$value"
}

payload="{\"chat_id\":$(json_string "$chat"),\"text\":$(json_string "$message")"
if [ -n "$parse_mode" ]; then
  payload+=",\"parse_mode\":$(json_string "$parse_mode")"
fi
payload+='}'

response="$(curl --silent --show-error --fail-with-body --max-time 20 \
  --header 'Content-Type: application/json' \
  --data-binary "$payload" \
  "${API_BASE}/bot${token}/sendMessage")" || {
  echo "notify-zalo: sendMessage request failed: ${response:-no response}" >&2
  exit 1
}

if [[ "$response" != *'"ok":true'* ]]; then
  echo "notify-zalo: Zalo rejected the message: $response" >&2
  exit 1
fi
