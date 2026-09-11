FROM postgres:17-alpine

RUN apk add --no-cache aws-cli

COPY --chmod=755 backup.sh /usr/local/bin/backup.sh

USER postgres

ENTRYPOINT ["/usr/local/bin/backup.sh"]
