#!/usr/bin/env bash
set -euo pipefail

readonly DEPLOY_PATH="${1:-/opt/tuvimienphi}"
readonly COMPOSE_FILE_NAME='docker-compose.prod.yml'
readonly STATE_FILE="${DEPLOY_PATH}/.watch-state"
readonly WATCHED_SERVICES=(backend worker db redis)
readonly NOTIFIER="${DEPLOY_PATH}/tools/notify-telegram.sh"

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

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-$(read_env_value TELEGRAM_BOT_TOKEN)}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-$(read_env_value TELEGRAM_CHAT_ID)}"
export TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID

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

changes=()
next_state=()
problem_count=0

for service in "${WATCHED_SERVICES[@]}"; do
  grep -qx "$service" <<< "$defined_services" || continue

  read -r state restarts <<< "$(service_state "$service")"
  next_state+=("$service $state $restarts")

  [ "$state" = healthy ] || [ "$state" = running ] || problem_count=$((problem_count + 1))

  was_state="$(previous_field "$service" 1)"
  was_restarts="$(previous_field "$service" 2)"

  if [ -z "$was_state" ]; then
    continue
  fi
  if [ "$state" != "$was_state" ]; then
    changes+=("$service: $was_state -> $state")
  elif [ -n "$was_restarts" ] && [ "$restarts" -gt "$was_restarts" ]; then
    changes+=("$service: khoi dong lai ($was_restarts -> $restarts lan), hien $state")
    problem_count=$((problem_count + 1))
  fi
done

first_run=false
[ -f "$STATE_FILE" ] || first_run=true

printf '%s\n' "${next_state[@]}" > "$STATE_FILE"

if [ "$first_run" = true ]; then
  {
    printf 'Bat dau theo doi container tren VPS\n'
    printf '%s\n' "${next_state[@]}"
  } | "$NOTIFIER"
  exit 0
fi

if [ "${#changes[@]}" -eq 0 ]; then
  exit 0
fi

{
  if [ "$problem_count" -gt 0 ]; then
    printf 'Container tren VPS co van de\n'
  else
    printf 'Container tren VPS da tro lai binh thuong\n'
  fi
  printf '%s\n' "${changes[@]}"
} | "$NOTIFIER"
