#!/usr/bin/env bash
set -euo pipefail

readonly IMAGE="$1"
readonly COMMIT="$2"
readonly DEPLOY_PATH="$3"
readonly REPOSITORY="$4"
readonly COMPOSE_FILE_NAME='docker-compose.prod.yml'
readonly READINESS_TIMEOUT_SECONDS=180
readonly READINESS_POLL_SECONDS=3
readonly SOURCE_LABEL='org.opencontainers.image.source'

fail() {
  echo "deploy failed: $*" >&2
  exit 1
}

cd "$DEPLOY_PATH" || fail "no deploy directory at $DEPLOY_PATH"
[ -f .env ] || fail "$DEPLOY_PATH/.env is missing; copy .env.prod.example and fill it in first"

echo "==> fetching $COMPOSE_FILE_NAME at $COMMIT"
curl --fail --silent --show-error --location \
  --output "${COMPOSE_FILE_NAME}.next" \
  "https://raw.githubusercontent.com/${REPOSITORY}/${COMMIT}/${COMPOSE_FILE_NAME}"
mv "${COMPOSE_FILE_NAME}.next" "$COMPOSE_FILE_NAME"

echo "==> pinning BACKEND_IMAGE to $IMAGE"
pinned_env="$(awk -v image="$IMAGE" '
  /^BACKEND_IMAGE=/ { print "BACKEND_IMAGE=" image; pinned = 1; next }
  { print }
  END { if (!pinned) print "BACKEND_IMAGE=" image }
' .env)"
printf '%s\n' "$pinned_env" > .env

active_services="$(docker compose config --services)"
services_to_pull=(backend)
if grep -qx db-backup <<< "$active_services"; then
  services_to_pull+=(db-backup)
fi

echo "==> pulling ${services_to_pull[*]} and starting"
docker compose pull --quiet "${services_to_pull[@]}"
docker compose up -d

container="$(docker compose ps -q backend)"
[ -n "$container" ] || fail "compose did not start a backend container"

echo "==> waiting for the backend to report healthy"
deadline=$((SECONDS + READINESS_TIMEOUT_SECONDS))
until [ "$(docker inspect -f '{{.State.Health.Status}}' "$container")" = healthy ]; do
  if ((SECONDS >= deadline)); then
    docker compose logs --tail 100 backend >&2
    fail "backend was not healthy after ${READINESS_TIMEOUT_SECONDS}s"
  fi
  sleep "$READINESS_POLL_SECONDS"
done

running_image="$(docker inspect -f '{{.Config.Image}}' "$container")"
[ "$running_image" = "$IMAGE" ] || fail "backend is running $running_image instead of $IMAGE"

source_repository="$(docker image inspect -f "{{index .Config.Labels \"${SOURCE_LABEL}\"}}" "$IMAGE")"
if [ -n "$source_repository" ]; then
  echo "==> removing images from $source_repository that no container uses"
  docker image prune --all --force --filter "label=${SOURCE_LABEL}=${source_repository}" > /dev/null
fi

echo "==> deployed $IMAGE at $COMMIT"
