#!/usr/bin/env bash
set -euo pipefail

readonly DEPLOY_PATH="${1:-/opt/tuvimienphi}"
readonly COMPOSE_FILE_NAME='docker-compose.prod.yml'
readonly STATE_FILE="${DEPLOY_PATH}/.watch-state"
readonly WATCHED_SERVICES=(backend worker db redis)
readonly NOTIFIER="${DEPLOY_PATH}/tools/notify-zalo.sh"

fail() {
  echo "watch-containers: $1" >&2
  exit 1
}

cd "$DEPLOY_PATH" || fail "$DEPLOY_PATH does not exist"
[ -f "$COMPOSE_FILE_NAME" ] || fail "$DEPLOY_PATH/$COMPOSE_FILE_NAME is missing"
[ -x "$NOTIFIER" ] || fail "$NOTIFIER is missing or not executable"

export COMPOSE_FILE="$COMPOSE_FILE_NAME"

read_env_value() {
  local key="$1"
  [ -f .env ] || return 0
  sed -n "s/^${key}=//p" .env | tail -1
}

ZALO_BOT_TOKEN="${ZALO_BOT_TOKEN:-$(read_env_value ZALO_BOT_TOKEN)}"
ZALO_CHAT_ID="${ZALO_CHAT_ID:-$(read_env_value ZALO_CHAT_ID)}"
export ZALO_BOT_TOKEN ZALO_CHAT_ID

defined_services="$(docker compose config --services)"

service_state() {
  local service="$1" container health running

  container="$(docker compose ps -q "$service" 2>/dev/null || true)"
  if [ -z "$container" ]; then
    printf 'missing 0'
    return
  fi

  running="$(docker inspect -f '{{.State.Running}}' "$container")"
  health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container")"
  restarts="$(docker inspect -f '{{.RestartCount}}' "$container")"

  if [ "$running" != true ]; then
    printf 'stopped %s' "$restarts"
  elif [ "$health" = none ]; then
    printf 'running %s' "$restarts"
  else
    printf '%s %s' "$health" "$restarts"
  fi
}

previous_field() {
  local service="$1" field="$2"
  [ -f "$STATE_FILE" ] || return 0
  sed -n "s/^${service} //p" "$STATE_FILE" | tail -1 | cut -d' ' -f"$field"
}

styled_line() {
  local icon="$1" color="$2" text="$3"
  printf -- '- %s {%s}*%s*{/%s}\n' "$icon" "$color" "$text" "$color"
}

service_line() {
  local text="$1" state="$2" restarted="$3"

  if [ "$state" != healthy ] && [ "$state" != running ] && [ "$state" != starting ]; then
    styled_line '🚫' red "$text"
  elif [ "$restarted" = true ] || [ "$state" = starting ]; then
    styled_line '⚠️' orange "$text"
  else
    styled_line '✅' green "$text"
  fi
}

change_count=0
problem_count=0
lines=()
next_state=()

for service in "${WATCHED_SERVICES[@]}"; do
  grep -qx "$service" <<< "$defined_services" || continue

  read -r state restarts <<< "$(service_state "$service")"
  next_state+=("$service $state $restarts")

  [ "$state" = healthy ] || [ "$state" = running ] || problem_count=$((problem_count + 1))

  was_state="$(previous_field "$service" 1)"
  was_restarts="$(previous_field "$service" 2)"
  text="$service: $state"
  restarted=false

  if [ -n "$was_state" ] && [ "$state" != "$was_state" ]; then
    text="$service: $was_state → $state"
    change_count=$((change_count + 1))
  elif [ -n "$was_restarts" ] && [ "$restarts" -gt "$was_restarts" ]; then
    text="$service: khởi động lại ($was_restarts → $restarts lần), hiện $state"
    restarted=true
    change_count=$((change_count + 1))
    problem_count=$((problem_count + 1))
  fi

  lines+=("$(service_line "$text" "$state" "$restarted")")
done

first_run=false
[ -f "$STATE_FILE" ] || first_run=true

printf '%s\n' "${next_state[@]}" > "$STATE_FILE"

if [ "$first_run" = true ]; then
  headline='👀 Bắt đầu theo dõi container trên VPS'
elif [ "$change_count" -eq 0 ]; then
  exit 0
elif [ "$problem_count" -gt 0 ]; then
  headline='🔴 Container trên VPS có vấn đề'
else
  headline='🟢 Container trên VPS đã trở lại bình thường'
fi

{
  printf '**%s**\n' "$headline"
  printf '%s\n' "${lines[@]}"
} | "$NOTIFIER" --markdown
