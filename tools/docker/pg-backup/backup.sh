#!/bin/sh
set -eu

: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${PGDATABASE:?PGDATABASE is required}"

interval="${BACKUP_INTERVAL_SECONDS:-86400}"
prefix="${BACKUP_PREFIX:-postgres}"
dump=/tmp/dump.pgdump

while true; do
  key="${prefix}/$(date -u '+%Y/%m/%d/%Y%m%dT%H%M%SZ')-${PGDATABASE}.pgdump"

  pg_dump --format=custom --no-owner --no-acl --file="$dump"
  aws s3 cp "$dump" "s3://${BACKUP_BUCKET}/${key}"
  rm -f "$dump"

  echo "uploaded s3://${BACKUP_BUCKET}/${key}, next dump in ${interval}s"
  sleep "$interval"
done
