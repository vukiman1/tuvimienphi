ARG PNPM_VERSION=10.28.0

FROM node:26-alpine AS builder

ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /workspace

RUN npm install -g pnpm@${PNPM_VERSION}

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm nx run @org/backend:docker-build

RUN awk '/^onlyBuiltDependencies:/{p=1;print;next} p&&/^[^ #]/{p=0} p' pnpm-workspace.yaml \
  > apps/backend/dist/pnpm-workspace.yaml

FROM node:26-alpine AS runner

ARG PNPM_VERSION
ENV NODE_ENV=production
ENV PORT=3000
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

RUN npm install -g pnpm@${PNPM_VERSION}

COPY --from=builder /workspace/apps/backend/dist ./

# typeorm pulls ts-node as a peer, which drags in two TypeScript copies and @swc/core — 77MB of
# compiler nothing here runs. Migrations shipped in this image are compiled JavaScript, and
# ormconfigs picks the .js migrations when it is not itself running under ts-node.
RUN pnpm install --prod --frozen-lockfile \
  && rm -rf node_modules/.pnpm/typescript@* \
            node_modules/.pnpm/ts-node@* \
            node_modules/.pnpm/@swc+core* \
  # The content-addressable store is only an install-time cache, and it holds a second copy of
  # every package. Same layer as the install, or the files stay in the image regardless.
  && rm -rf "$PNPM_HOME"

USER node

EXPOSE 3000

CMD ["node", "main.js"]
