#!/usr/bin/env bash
set -euo pipefail

readonly DEPLOY_PATH="${1:-/opt/tuvimienphi}"
readonly STATE_FILE="${DEPLOY_PATH}/.clock-state"
readonly NOTIFIER="${DEPLOY_PATH}/tools/notify-zalo.sh"
readonly MAX_DRIFT_SECONDS=5
readonly REQUEST_TIMEOUT_SECONDS=10
readonly REFERENCE_URLS=(https://www.cloudflare.com https://www.google.com https://www.apple.com)
readonly STATE_OK='ok'
readonly STATE_DRIFT='drift'

fail() {
  echo "watch-clock: $1" >&2
  exit 1
}

cd "$DEPLOY_PATH" || fail "$DEPLOY_PATH does not exist"
[ -x "$NOTIFIER" ] || fail "$NOTIFIER is missing or not executable"

read_env_value() {
  local key="$1"
  [ -f .env ] || return 0
  sed -n "s/^${key}=//p" .env | tail -1
}

ZALO_BOT_TOKEN="${ZALO_BOT_TOKEN:-$(read_env_value ZALO_BOT_TOKEN)}"
ZALO_CHAT_ID="${ZALO_CHAT_ID:-$(read_env_value ZALO_CHAT_ID)}"
export ZALO_BOT_TOKEN ZALO_CHAT_ID

reference_epoch() {
  local url header
  for url in "${REFERENCE_URLS[@]}"; do
    header="$(curl --silent --head --max-time "$REQUEST_TIMEOUT_SECONDS" "$url" \
      | tr -d '\r' | sed -n 's/^[Dd]ate: //p' | head -1)" || continue
    [ -n "$header" ] || continue
    date -u -d "$header" +%s && return 0
  done
  return 1
}

local_before="$(date -u +%s)"
reference="$(reference_epoch)" || fail "no reference clock answered: ${REFERENCE_URLS[*]}"
local_after="$(date -u +%s)"

drift=$(((local_before + local_after) / 2 - reference))
distance="${drift#-}"

state="$STATE_OK"
[ "$distance" -le "$MAX_DRIFT_SECONDS" ] || state="$STATE_DRIFT"

previous_state=''
[ -f "$STATE_FILE" ] && previous_state="$(cat "$STATE_FILE")"
printf '%s\n' "$state" > "$STATE_FILE"

[ "$state" = "$previous_state" ] && exit 0
[ -z "$previous_state" ] && [ "$state" = "$STATE_OK" ] && exit 0

if [ "$state" = "$STATE_DRIFT" ]; then
  direction='chậm'
  [ "$drift" -gt 0 ] && direction='nhanh'
  message="**🔴 Đồng hồ VPS ${direction} ${distance} giây so với giờ chuẩn**
- Mã 2FA (TOTP) sẽ bị từ chối khi lệch quá 30 giây.
- Kiểm tra: \`systemctl status htpdate\`, \`journalctl -u htpdate -n 20\`"
else
  message="**🟢 Đồng hồ VPS đã đúng lại** (lệch ${distance} giây)"
fi

printf '%s\n' "$message" | "$NOTIFIER" --markdown
