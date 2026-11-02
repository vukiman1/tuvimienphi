<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Commands

- Setup: `pnpm install && pnpm bootstrap` (copies `.env`, starts Postgres + Redis, runs migrations).
- Before claiming done: `pnpm nx affected -t lint typecheck test` (same gate as pre-push, plus tests).
- Single project: `pnpm nx <target> <project>` — apps are `@org/backend`, `@org/frontend`, `@org/dashboard` (plus `-e2e`); libs are `shared-tu-vi`, `shared-contracts`, `frontend-shared`, `backend-*`.
- Entity changed: `pnpm db:migration:generate <Name>`, then commit the file in `apps/backend/src/migrations`.
- Admin GraphQL schema changed (`apps/backend/src/api/admin/schema.gql`): `pnpm nx codegen @org/dashboard` to refresh `apps/dashboard/src/gql`.

# Map

- `apps/backend` — NestJS. HTTP features under `src/api/<feature>`; infra modules (`ai`, `email`, `storage`, `transport`) at `src/` root.
- `apps/frontend` — public React SPA, TanStack Router file routes, feature code in `src/features/<feature>`.
- `apps/dashboard` — admin console, talks to the backend over GraphQL (codegen, not hand-written types).
- `packages/shared/tu-vi` — pure chart engine: casting a lá số (`cast-chart.ts`) and building luận giải briefs (`src/luan`). No I/O; most domain bugs are fixed here.
- `packages/shared/contracts` — DTOs shared by backend and frontend.
- `packages/backend/*` — reusable Nest infrastructure (config, jwt, redis, crypto, filters, ...).

## Luận giải pipeline

A chapter is `chapters/<name>/` in `apps/backend/src/api/luan-giai`: brief from `shared-tu-vi/src/luan/build-<name>-brief.ts` → prompt (`prompt/`) → `generation/chapter-generator.ts` calls the AI port → `validate/` rejects mục that break the rules → `article/` assembles. New chapters register in `generation/chapter-registry.ts` and get an id in `luan-giai.constants.ts`.

## Backend architecture

Moving to hexagonal one module at a time. `src/ai` is the template (`port/`, `providers/`, `settings/`, `usage/`); feature code imports only `ai/port`, enforced by `no-restricted-imports` in `apps/backend/eslint.config.mjs`. Other modules still inject TypeORM repositories directly — don't rewrite them unless asked.

# Gotchas

- The dev servers (`pnpm dev`: frontend 4200, backend 3000, dashboard) are usually already running. Reuse them; never `pkill -f vite` / `pkill -f nx` — it silently kills the user's servers.
- Backend typecheck failing with TS6305 everywhere = stale buildinfo. Delete `apps/backend/dist/tsconfig.app.tsbuildinfo` and `apps/backend/out-tsc/jest/tsconfig.spec.tsbuildinfo`. Never delete `apps/backend/dist` (the dev server serves from it).
- After pulling dependency bumps, run `pnpm install` before trusting any build error.
- Never edit generated files: `routeTree.gen.ts`, `apps/dashboard/src/gql/**`, `schema.gql`.
- `SECRET_KEY` encrypts TOTP secrets at rest; changing it on a database with users locks them out.

# Comments

Do not write comments. Not in TypeScript, not in YAML, Dockerfiles, shell scripts, or env templates.
No exceptions — this overrides the "rare exception" wording in the global rules, including the
non-obvious "why" case that would normally earn one.

Put the explanation in the commit body, the PR description, or a reply in chat. Kim An reads the code
and asks when something is unclear.

# Branching Model

- **`main`** is the stable/release branch. **`dev`** is the integration branch where day-to-day work and dependency bumps land first. `main` lags behind `dev` and only receives merges when cutting a release.
- **Dependabot targets `dev`** (configured in `.github/dependabot.yml` via `target-branch: 'dev'` for every ecosystem: npm, github-actions, docker). All Dependabot PRs base into `dev`, never `main`.
- **Default base branch for new PRs is `dev`**, unless the change is explicitly a hotfix or release-merge into `main`. When in doubt, ask before opening a PR into `main`.
- **Fixing a Dependabot PR**: the fix must land on `dev` (same base as the Dependabot PR), otherwise rebasing the Dependabot PR will not pick it up. After the fix merges into `dev`, comment `@dependabot rebase` on the Dependabot PR to trigger an immediate rebase.
- **Backporting between branches**: if a fix accidentally lands on the wrong base, cherry-pick it onto a branch from the correct base and open a follow-up PR — do not merge `main` → `dev` (or vice versa) just to drag one commit across.

## Useful Dependabot commands (post as PR comments)

- `@dependabot rebase` — rebase the PR against its base branch immediately.
- `@dependabot recreate` — drop the branch and recreate from scratch (use when rebase fails).
- `@dependabot ignore this major version` / `... minor version` / `... dependency` — stop future bumps for the scope.
