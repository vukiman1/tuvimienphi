# Kiến thức 3 — Sign-in sync: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A reader's lesson progress survives sign-in, follows them to every device, and leaves a shared device when they sign out. A signed-out reader who has finished two lessons is offered, at a lesson's end and never mid-article, a way to keep it. The work covers:

- Google sign-in (One Tap and the modal's button) keeps the reader on the page, the way email sign-in does. This is issue #222, shipped first as its own PR.
- A backend module `learning` stores the lessons each account has read.
- On the frontend, device progress merges into the account on sign-in and is cleared on sign-out. `useLessonProgress` reads the account while signed in, and the progress card fills the slots plan 2 leaves.

**Architecture:** Three PRs on `dev`, in this order. Each one is safe to deploy alone, which matters because merging to `dev` deploys production.

1. **`fix/auth-google-sign-in-stays-on-page`** (Task 1). `useGoogleOneTap` ends a successful sign-in with `useAuthModal().finish()`, as `login-form.tsx:38` does, instead of `navigate({ to: '/' })`. Google calls the callback registered the first time (`google-identity.ts:49-56`), and the modal's button relies on that same callback (`google-sign-in-button.tsx:55-56`). So `finish` reads the router's live location at call time, not a render-time closure. When there is no modal and no redirect to finish, it does not navigate. Opening and closing the modal no longer reset the scroll position.
2. **`feat/learning-progress-api`** (Tasks 2–5). `apps/backend/src/api/learning/` follows the `ai/` hexagon:
   - `port/` holds the abstract `LearningProgressStore` (the DI token) and its outcome enum;
   - the domain is a pure save planner, the service and the named error;
   - `adapters/` holds the TypeORM entity and the store, which runs the planner inside one transaction that locks the user's row;
   - the controller and DTO sit at the module root.

   A lint rule keeps everything except `learning.module.ts` and `adapters/` from importing `adapters/`. DTOs go in `shared-contracts`, and the slug rule is plan 1's `isContentSlug`.

3. **`feat/kien-thuc-progress-sync`** (Tasks 6–10). Everything lives in `features/kien-thuc`:
   - a root-mounted `useLearningProgressSync` merges on every transition to signed in and clears on every transition to signed out, like `useSyncLaSoHistoryOnLogin`;
   - `useLessonProgress` keeps plan 2's signature, and while signed in reads account ∪ device;
   - the card's rule is a pure function, its snooze is a tiny localStorage store, and `ProgressCardSlot` is the only component that knows about auth. It takes the manifest as a prop from the page, like every plan 2 component, so nothing here imports the `import.meta.glob` loader.

**Tech Stack:** NestJS 11, TypeORM 1.1.1 on Postgres, class-validator; React 19, TanStack Router 1.170 and Query, zustand auth store, Tailwind v4 tokens, Jest + Testing Library.

**Spec:** [kien-thuc-design.md](../kien-thuc-design.md): "Progress and sign-in" (Progress, The progress card, Server side), Anti-goals ("Interrupting the reader"), Goal 6, "Hub — mockup E" (the card after the path), "Lesson" (end of lesson order) and Delivery item 3. [design.md](../design.md): "Visual identity — D3", "Two zones per page" and the quality gates. GitHub issue #222. Plan 1's contracts (`packages/shared/contracts/src/kien-thuc.ts`, [kien-thuc-1-content.md](kien-thuc-1-content.md) Task 1) and plan 2's progress interface (Task 0 below).

## Decisions (approved by Kim An's delegation, 2026-11-16)

1. **Three PRs, in order.** #222 first, because the card is useless while Google sign-in throws the reader to `/`; it depends on nothing else. The backend comes next and needs only plan 1's code PR (`isContentSlug`, `CONTENT_SLUG_MAX_LENGTH`): its endpoints are unused until the frontend ships, so deploying it alone is safe. The frontend comes last and depends on plan 2 being merged. Each PR runs the gate on its own.
2. **Google sign-in finishes like email.** After `startSession` and the toast, `useGoogleOneTap` calls `finish()`:
   - a guard's `redirect` is honoured (today Google drops it and lands on `/`);
   - otherwise an open modal closes over the same page;
   - with no modal open, nothing navigates, so a One Tap reader is not moved at all.

   `finish` reads `router.state.location.search` from `useRouter()` when it is called. Google keeps the first registered callback forever, so any render-time value it closed over would be stale (see Contradictions).

3. **The modal does not move the page.** `open` and `close` pass `resetScroll: false`. Both are same-path, search-only navigations, and router-core's scroll restoration otherwise scrolls to the top after every navigation (`router-core/dist/esm/scroll-restoration.js`, `shouldResetScroll` defaults to true). Without this, "Đăng nhập" on the lesson-end card would put the reader back at the top behind the modal. Task 1 checks this with a failing test first (verified while planning: router-core 1.171 installs the reset on every client router, `router.js:141`).
4. **Module layout.** It lives in `apps/backend/src/api/learning/` (CLAUDE.md puts HTTP features under `src/api`). The adapter folder is `adapters/`, not `providers/` as in `ai/`: the `ai/` template's `providers/` holds AI vendors, while a database store is an adapter behind a port, and in Nest "provider" already means a DI binding. CLAUDE.md is not edited.
5. **The cap is atomic and its logic is pure.** `planProgressSave(stored, requested, maxRows)` decides what to insert: dedupe, drop slugs already stored, refuse past the cap. The adapter runs it inside one transaction after locking the user's row with TypeORM's `for_no_key_update` lock. Two parallel PUTs therefore cannot both pass 200. That lock does not block the `FOR KEY SHARE` that foreign-key inserts take. The planner gets the unit tests, and the SQL is checked against Postgres in Task 5.
6. **Endpoints.** Both need `AuthGuard(StrategyKey.JWT.USER)` and use `@User()`, as `la-so-history.controller.ts` does.
   - `GET /api/learning/progress` returns 200 with `{ slugs }`, ordered by `read_at` then slug.
   - `PUT /api/learning/progress` takes `{ slugs }` with 1–50 items and answers 204 with no body. The merge then GETs (Decision 10).
   - A body that breaks the shape gets 400 from the global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`). A request that would pass the cap gets 422. A signed-out caller gets 401.
7. **`read_at` is the server time of the first save.** It is `timestamptz NOT NULL DEFAULT now()`, and inserts use `ON CONFLICT DO NOTHING`, so resending a slug keeps its first time. Device read times are not sent: nothing reads them, and a client clock cannot be trusted.
8. **Cap semantics.** The request is refused whole only when its _new_ slugs would take the account past 200. Slugs already stored are always accepted, so the merge stays idempotent at the cap. Nothing is trimmed, because dropping read marks would be data loss. Deleting a user cascades the rows (`FK … ON DELETE CASCADE`).
9. **Contracts.** `packages/shared/contracts/src/learning-progress.ts` holds `LearningProgressResponse`, `SaveLearningProgressPayload` and `LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST = 50`. The slug rule is plan 1's `isContentSlug` and `CONTENT_SLUG_MAX_LENGTH`. The per-user cap `LEARNING_PROGRESS_MAX_ROWS_PER_USER = 200` is backend-only (`learning.constants.ts`), because no client needs it.
10. **The merge.** It runs on every transition to signed in, a restored session included, whenever the device holds slugs:
    - it snapshots the device (plan 2's store already holds only well-formed slugs, at most 200), PUTs them in sorted requests of at most 50, one after another, GETs the account and seeds the query. Sending only the first 50 and then clearing the device would delete the rest;
    - it then clears the device, but only if the device still equals the snapshot. A lesson read while the request was in flight survives for the next merge;
    - so while signed in, the device normally holds nothing, and a session that expires while the tab is closed leaves no progress behind;
    - the hook is mounted in `__root.tsx` so a sign-in or sign-out on any page is seen. It imports no manifest, so the root chunk does not grow with content.
11. **Signing out clears the device.** Every signed-in → signed-out transition calls `clearLocalProgress()`: the menu's sign-out and a failed refresh (`http-request.ts:67`) alike. An anonymous first load is not a transition and clears nothing. The card's snooze is not cleared, because it holds no lesson.
12. **Signed-in reads.**
    - `readSlugs` is the account ∪ the device. The union covers a merge in flight and saves that failed, with no flicker.
    - `markRead` skips a slug the account already holds. Otherwise it PUTs `[slug]` with an optimistic `setQueryData`; on failure it writes the slug to the device for the next merge and logs it.
    - Both requests use `BACKGROUND_REQUEST`, so a reader never gets a server-error toast for progress.
13. **One query key, `['learning-progress']`.** `User` carries no id on the client (`contracts/src/index.ts:34-42`). `startSession` and `endSession` already clear the whole query cache on every identity change (`session.ts:9-17`), which is the same reasoning `laSoHistoryQueryKey` relies on.
14. **The card's rule.** It shows when all of these hold:
    - auth has resolved and nobody is signed in;
    - `countReadLessons(...)` is at least 2. That counts the manifest's lessons in `readSlugs`, plus the current lesson on a lesson page. The card sits after "Bài tiếp theo", so a reader who sees it has finished this lesson. It also means the card's eligibility does not flip when the end scrolls into view and marks the lesson read;
    - it was not snoozed in the last 7 days.

    The total is `publishedLessons(manifest).length` (plan 2's `published-pages.ts`), the same lessons the hub counts. The snooze is an epoch-ms value under `kien-thuc-progress-card-snoozed-at-v1`.

15. **Card look, copy and focus.**
    - An `aside` on `bg-day-200` with an `ink/15` border and Ink text. It is labelled by its first line through `aria-labelledby`, so it adds no new string.
    - The copy is exactly the spec's: "Bạn đã đọc {n}/{total} bài.", "Đăng nhập để giữ tiến độ và học tiếp trên mọi thiết bị.", "Đăng nhập" and "Để sau".
    - "Đăng nhập" is a Gold `CtaButton` that calls `open('login')` and preloads the lazy modal on focus and hover, as `site-header.tsx:153-154` does.
    - "Để sau" is an Ink underlined text button with a 44 px target. After it, focus moves to the slot wrapper (`tabIndex={-1}`), so a keyboard user carries on from where the card was.
16. **Placement.** On a lesson, the card goes in plan 2's `LessonEndSlot`, after "Bài tiếp theo" and before the Night "Áp vào lá số của bạn" card. On the hub it goes in plan 2's `HubProgressSlot`, directly after the step list at every width, with no reserved column (Kim An's delegation, 2026-11-16). Task 10 measures that its mount shifts nothing in the first viewport. Both render the same `ProgressCardSlot` with the page's manifest. Plan 2 keeps the end card, the slot and the Night card inside `ReadingZone` after the last prose section, so the card is never among the sections (`muc-1` … `muc-n`). The prerender never contains it, because auth is still initializing there.
17. **Not in this plan:** measuring sign-ins from the card (spec, Success measures); changing la-so history, which keeps its device mirror after sign-out (see Contradictions); sending the reader to `/` on sign-out (`user-menu.tsx:53`).

## Global Constraints

- **No comments anywhere**, in TypeScript, SQL, YAML or test files (CLAUDE.md). The explanation goes in the commit body and the PR description.
- **TypeScript.** No `any`. Use `as` only to narrow parsed JSON or storage values; test fixtures build real instances (`Object.assign(new UserEntity(), { id })`) instead of casting. Every exported function has explicit parameter and return types. Errors are named subclasses (`LearningProgressLimitError`). Closed sets are string enums, and multi-branch state is a discriminated union. No floating promises: `await` or `void`.
- **UI tokens only.** No hex, no `[Npx]`, no inline style. Use palette tokens (`bg-day-200`, `text-ink`, `border-ink/15`), never the shadcn semantic ones. Text is never dimmed with opacity (`text-*/NN`, `opacity-*`). Any state mark is an `inset-ring-*` plus a word, never colour alone. No new motion, and no font weight or face that `/` does not load. `features/kien-thuc/**` is in `MIGRATED_FILES` from plan 2, so `local/no-ad-hoc-style` checks it. Task 1 touches `features/auth` only in logic, not classes.
- **Reading is never interrupted.** No modal, toast or popup from progress code. The card is in the page flow at the lesson's end, and in the hub's slot.
- **Boundaries.** Validate the PUT body at the DTO and parse storage values in the stores. Trust internal code. No silent `catch`: a failed background request is logged with what was being done, and the device copy is kept.
- **Worktrees.** Prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>`, and check that test output paths contain the worktree. Never stop the dev servers on 4200 and 3000. Anything run for verification uses its own ports (3100, 4300).
- **Backend TS6305.** If typecheck fails with TS6305 everywhere, delete `apps/backend/dist/tsconfig.app.tsbuildinfo` and `apps/backend/out-tsc/jest/tsconfig.spec.tsbuildinfo`, never `apps/backend/dist`. Run `pnpm install` after pulling dependency bumps.
- **Migrations.** Use `pnpm db:migration:generate CreateLearningProgress` from the worktree root and commit the file in `apps/backend/src/migrations`. Never `revert` or drop anything on Kim An's local database without asking.
- **Gate:** `pnpm nx affected -t lint typecheck test` before each PR. Then Task 10's checks for the frontend PR: CLS 0 with seeded progress, and Lighthouse on the hub and one lesson still at or above design.md's gates.

## Review Focus

1. **Privacy on shared devices.**
   - Signing out by the menu and losing the session on a failed refresh both empty `kien-thuc-progress-v1`.
   - After a successful merge the device holds nothing while signed in, so a session that ends without a sign-out leaves nothing behind.
   - An anonymous first load clears nothing.
   - The next person on the device never sees "Bạn đã đọc n/18" built from someone else's reads, and their sign-in never merges them.
   - Covered by the Task 7 tests and the Task 10 walk-through.
2. **Merge races.**
   - A lesson marked read while the merge PUT is in flight is not lost: the device is cleared only if it still equals the snapshot.
   - A signed-in reader sees account ∪ device, so a slow merge causes no flicker.
   - Two tabs, or sign-out mid-merge, leave the account correct, because the PUT is idempotent and runs under the cookie it was sent with.
   - Two parallel PUTs at 199 rows cannot both pass the cap (row lock, Task 5).
3. **Abuse limits.** 50 slugs per request, kebab-case of at most 80 characters, no empty list, no extra property, and at most 200 rows per account. A resend at the cap still succeeds. The user id always comes from the JWT, never the body. Requests stay under the global throttler (60 per minute).
4. **The card never interrupts reading.**
   - It renders only at the lesson's end (after "Bài tiếp theo", after the last prose section) and in the hub slot.
   - Never for a signed-in reader, and never while auth initializes. That includes the prerender.
   - Its eligibility does not change when the end scrolls into view (Decision 14).
   - "Để sau" hides it for 7 days, and it adds no layout shift in the first viewport (CLS 0 at 390 × 844 and 1440 × 900).
5. **Sign-in keeps the reader on the page.**
   - One Tap does not navigate.
   - The modal's Google button closes the modal over the same page, and a guard's redirect is honoured.
   - The callback Google registered at first load still finishes on the page the reader is on now.
   - Opening and closing the modal does not scroll to the top. Email sign-in behaves the same as before.
   - Covered by Task 1 and the Task 10 check.

---

### Task 0: Preconditions

- [ ] **Step 1: Branch each PR from the current `origin/dev`.** PR 1 needs nothing else. PR 2 needs plan 1's code PR merged. PR 3 needs plan 2 merged.
- [ ] **Step 2: Check the fixed interface against the merged code.** Use `rg` and read the files; do not assume.
  - `features/kien-thuc/progress/local-progress-store.ts` exports `LOCAL_PROGRESS_KEY = 'kien-thuc-progress-v1'`, `readLocalProgress(): ReadonlySet<string>`, `markLessonRead(slug: string): void`, `clearLocalProgress(): void` and `subscribeLocalProgress(listener: () => void): () => void`.
  - `features/kien-thuc/progress/use-lesson-progress.ts` exports `useLessonProgress(): { readonly readSlugs: ReadonlySet<string>; readonly markRead: (slug: string) => void }`, built on `useSyncExternalStore` with an empty server snapshot.
  - `features/kien-thuc/progress/lesson-end-slot.tsx` exports `LessonEndSlot(): null`, rendered by `pages/lesson-page.tsx` after the end card; `progress/hub-progress-slot.tsx` exports `HubProgressSlot(): null`, rendered by `pages/hub-page.tsx` directly after the step list. Both pages receive `manifest` as a prop.
  - `features/kien-thuc/published-pages.ts` exports `publishedLessons`; `__fixtures__/fixture-source.ts` exports `FIXTURE_SOURCE`; `src/test-utils/render-at-route.tsx` exports `renderAtRoute`.
  - `packages/shared/contracts/src/kien-thuc.ts` exports `isContentSlug`, `CONTENT_SLUG_MAX_LENGTH` and `KienThucManifest` (PR 2 needs only this item).
  - Expected: all present. If a name or a signature differs, stop and report it. Do not adapt this plan silently.

### Task 1: Google sign-in stays on the page (PR 1, issue #222)

**Files:**

- Modify: `apps/frontend/src/features/auth/use-auth-modal.ts`, `apps/frontend/src/features/auth/use-google-one-tap.ts`
- Test: `features/auth/use-auth-modal.spec.tsx` (new), `features/auth/google-sign-in-stays-on-page.spec.tsx` (new), `features/auth/use-google-one-tap.spec.tsx` (updated)

**Interfaces:**

- `useAuthModal()` keeps its return shape (`view`, `redirect`, `open`, `close`, `finish`).
  - `open` and `close` pass `resetScroll: false`.
  - `finish(): Promise<void>` reads `useRouter().state.location.search` when called. It navigates to an internal `redirect` if there is one, closes when `auth` is set, and otherwise returns without navigating.
- `useGoogleOneTap(): void` drops `useNavigate`. On success it runs `startSession(result.user)`, then `notify.success('Đăng nhập thành công.')`, then `await finish()`. The second-factor branch is unchanged.
- The router specs reuse `auth-modal.spec.tsx`'s `renderAt` pattern: a memory history and a root route with the same `auth` and `redirect` search schema. Routes are `/`, `/kien-thuc/$slug` and `/dashboard/settings`. They mock `@/lib/google-identity`, `authService.googleOneTap` and `./google-sign-in-button` (to `null`). `window.scrollTo` is spied with a no-op implementation.

- [ ] **Step 1: Write the failing tests.**
  - `use-auth-modal.spec.tsx`. A probe component renders three buttons calling `open('login')`, `close()` and `finish()`, at `/kien-thuc/tu-vi-la-gi`:
    - `opens the modal on the same page without scrolling to the top`: after clicking open, `search.auth` is `login`, the pathname is unchanged, and `window.scrollTo` was never called with `expect.objectContaining({ top: 0 })`.
    - `closes the modal without scrolling to the top`: starting at `?auth=login`, close gives `search` equal to `{}` and the same assertion on `scrollTo`.
    - `does nothing when there is no modal or redirect to finish`: a listener from `router.subscribe('onBeforeNavigate', …)` is never called after finish.
  - `google-sign-in-stays-on-page.spec.tsx`. Each case fires the callback from `jest.mocked(ensureGoogleIdentity).mock.calls[0][0].callback`, with `googleOneTap` resolving `{ user: { email: 'reader@example.com' } }`:
    - `keeps a One Tap reader on the lesson they are reading`: at `/kien-thuc/tu-vi-la-gi` the user is set, `router.state.location.href` is unchanged, no `onBeforeNavigate` fires, and `scrollTo` was never called with `top: 0`.
    - `closes the modal over the same lesson after the modal's Google button`: at `/kien-thuc/tu-vi-la-gi?auth=login` the pathname is unchanged, `search` is `{}`, `queryByRole('dialog')` is null, and there is no scroll to the top. The button's credential reaches Google's single registered callback, which is why this case fires that callback with the modal open.
    - `follows a guard's redirect, as the email form does`: at `/?auth=login&redirect=/dashboard/settings` it lands on `/dashboard/settings`.
    - `finishes on the page the reader is on now, not where Google was set up`: mount at `/`, let the callback be captured, call `router.navigate` to `/kien-thuc/tu-vi-la-gi?auth=login`, then fire it. The pathname is `/kien-thuc/tu-vi-la-gi` and `search` is `{}`.
  - `use-google-one-tap.spec.tsx`:
    - add `useRouter: () => ({ state: { location: { search: {} } } })` to the router mock;
    - rename `logs in and navigates home when a credential arrives` to `signs in without leaving the page when a credential arrives`, and assert `mockNavigate` was not called;
    - `does not let a failed sign-in escape…` keeps its assertions;
    - the second-factor case keeps `to: '.'`.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- use-auth-modal google-sign-in-stays-on-page use-google-one-tap`.
  - Expected: FAIL. The One Tap cases land on `/`.
  - The two scroll cases fail too: router-core 1.171 sets up the scroll reset on every client router (`router.js:141` → `scroll-restoration.js`, `onRendered`), memory history included, so today's `open` and `close` call `scrollTo({ top: 0 })`.
- [ ] **Step 3: Implement** the interface above. `login-form.tsx` and `two-factor-step.tsx` already call `finish()` and need no change.
- [ ] **Step 4: Run all auth specs.** `pnpm nx test @org/frontend -- features/auth site-header`. Expected: PASS, with `auth-modal.spec.tsx` and `login-form.spec.tsx` unedited.
- [ ] **Step 5: Gate.** `pnpm nx affected -t lint typecheck test`.
- [ ] **Step 6: Real-app check.**
  - Google refuses origins it does not list, so a worktree frontend on 4300 cannot sign in with Google. Ask Kim An to check on his 4200 dev server with this branch checked out:
    - One Tap on a lesson keeps the URL and the scroll position;
    - the modal's Google button closes the modal over the same scroll position;
    - email sign-in still stays put.
  - Do not switch his checkout yourself.
- [ ] **Step 7: Commit** `fix(auth): keep the reader on the page after Google sign-in`. The body says why `finish` reads the live location (Google keeps the first callback) and why the modal stops resetting scroll, and ends `Closes #222`. Open the PR into `dev` only after "tạo pull".

### Task 2: Contracts, save planner and service (PR 2)

**Files:**

- Create: `packages/shared/contracts/src/learning-progress.ts`; `apps/backend/src/api/learning/learning.constants.ts`, `learning.errors.ts`, `learning-progress-plan.ts`, `learning-progress.service.ts`, `port/learning-progress.store.ts`
- Modify: `packages/shared/contracts/src/index.ts` (`export * from './learning-progress.js';`)
- Test: `apps/backend/src/api/learning/learning-progress-plan.spec.ts`, `learning-progress.service.spec.ts`

**Interfaces:**

```ts
export const LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST = 50;
export interface LearningProgressResponse {
  readonly slugs: readonly string[];
}
export interface SaveLearningProgressPayload {
  readonly slugs: readonly string[];
}

export const LEARNING_PROGRESS_MAX_ROWS_PER_USER = 200;

export enum ProgressSaveKind {
  Insert = 'insert',
  NothingNew = 'nothing-new',
  OverLimit = 'over-limit',
}
export type ProgressSavePlan =
  | { readonly kind: ProgressSaveKind.Insert; readonly slugs: readonly string[] }
  | { readonly kind: ProgressSaveKind.NothingNew }
  | {
      readonly kind: ProgressSaveKind.OverLimit;
      readonly storedCount: number;
      readonly newCount: number;
    };
export function planProgressSave(
  stored: ReadonlySet<string>,
  requested: readonly string[],
  maxRows: number,
): ProgressSavePlan;

export enum ProgressSaveOutcome {
  Saved = 'saved',
  OverLimit = 'over-limit',
}
export abstract class LearningProgressStore {
  abstract listSlugs(userId: string): Promise<readonly string[]>;
  abstract saveWithinLimit(
    userId: string,
    slugs: readonly string[],
    maxRows: number,
  ): Promise<ProgressSaveOutcome>;
}

export class LearningProgressLimitError extends Error {
  constructor(userId: string, maxRows: number);
}

@Injectable()
export class LearningProgressService {
  constructor(store: LearningProgressStore);
  list(userId: string): Promise<readonly string[]>;
  save(userId: string, slugs: readonly string[]): Promise<void>;
}
```

- The planner keeps the first occurrence order of new slugs. The error message names the user id and the cap, never the slugs, and sets `name`.
- `save` passes `LEARNING_PROGRESS_MAX_ROWS_PER_USER` and throws `LearningProgressLimitError` on `OverLimit`.

- [ ] **Step 1: Write the failing tests.**
  - `learning-progress-plan.spec.ts`:
    - `inserts only the slugs the reader has not saved`: stored `{tu-vi-la-gi}`, requested `[tu-vi-la-gi, 12-cung-tu-vi]` gives Insert `[12-cung-tu-vi]`.
    - `ignores a slug repeated in one request`: `[a, a, b]` on an empty set gives Insert `[a, b]`.
    - `has nothing to do when every slug is already saved`: NothingNew.
    - `accepts a resend at the cap`: 200 stored, requesting one of them gives NothingNew.
    - `fills the cap exactly`: 199 stored, 1 new gives Insert.
    - `refuses a request that would pass the cap`: 199 stored, 2 new gives OverLimit with `storedCount` 199 and `newCount` 2.
  - `learning-progress.service.spec.ts`. The port is provided as `{ provide: LearningProgressStore, useValue: { listSlugs: jest.fn(), saveWithinLimit: jest.fn() } }`; the store is the database boundary:
    - `lists the reader's slugs from the store`.
    - `saves within the per-user cap`: `saveWithinLimit` is called with `('user-1', ['a'], 200)`.
    - `turns a full account into LearningProgressLimitError`: `OverLimit` rejects with an instance of `LearningProgressLimitError`.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/backend -- learning`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement.** Then `pnpm nx typecheck shared-contracts`.
- [ ] **Step 4: Run them again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(learning): plan progress saves within a per-account cap`.

### Task 3: Entity, TypeORM store and migration (PR 2)

**Files:**

- Create: `apps/backend/src/api/learning/adapters/learning-progress.entity.ts`, `adapters/typeorm-learning-progress.store.ts`, `apps/backend/src/migrations/<timestamp>-CreateLearningProgress.ts` (generated)
- Modify: `apps/backend/ormconfigs.ts` (add `LearningProgressEntity` to `entities`)

**Interfaces:**

- `LearningProgressEntity` maps `@Entity('learning_progress')`. It does not extend `BaseEntity`: no uuid id and no soft delete.
  - `userId` is a `@PrimaryColumn` named `user_id`, type `uuid`.
  - `lessonSlug` is a `@PrimaryColumn` named `lesson_slug`, `varchar(CONTENT_SLUG_MAX_LENGTH)`. Both primary columns carry `primaryKeyConstraintName: 'PK_learning_progress'`.
  - `readAt` is `read_at`, `timestamptz`, default `now()`.
  - `user` is a `@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })` with `@JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_learning_progress_user_id' })`.
  - TypeORM 1.1.1 is installed. Check its typings for these option names and for the lock mode before using them.
- `TypeormLearningProgressStore extends LearningProgressStore` and injects the `DataSource`.
  - `listSlugs` selects the user's slugs ordered by `readAt`, then `lessonSlug`.
  - `saveWithinLimit` runs one `dataSource.transaction`:
    1. lock the `users` row with `setLock('for_no_key_update')`;
    2. read the stored slugs;
    3. call `planProgressSave`;
    4. on `Insert`, run an `insert().into(LearningProgressEntity).values(...).orIgnore()` without `readAt`, so the database stamps it;
    5. map `Insert` and `NothingNew` to `Saved`, and `OverLimit` to `OverLimit`.

- [ ] **Step 1: Prepare the database.** From the worktree root:
  - if `apps/backend/.env` is missing, copy it from the main checkout;
  - run `pnpm db:migration:show`.
  - Expected: Postgres answers and every committed migration is applied. If not, stop and ask Kim An. Do not run `pnpm bootstrap`, which touches his containers.
- [ ] **Step 2: Implement the entity and the store**, and add the entity to `ormconfigs.ts`.
- [ ] **Step 3: Generate.** `pnpm db:migration:generate CreateLearningProgress`.
  - Expected: one new file whose `up` creates `learning_progress`, with:
    - `user_id uuid NOT NULL`;
    - `lesson_slug character varying(80) NOT NULL`;
    - `read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`;
    - `CONSTRAINT "PK_learning_progress" PRIMARY KEY ("user_id", "lesson_slug")`;
    - `FK_learning_progress_user_id` to `users(id)` `ON DELETE CASCADE`.
  - Its `down` drops the FK and the table.
  - If the file holds statements for any other table (drift between the listed entities and hand-written migrations), delete only those statements. List them in the PR body as drift for a follow-up; do not fix them here.
  - Format it like `1789200000000-CreateFunnelDaily.ts`.
- [ ] **Step 4: Typecheck.** `pnpm nx typecheck @org/backend`. Expected: PASS (see the TS6305 note).
- [ ] **Step 5: Commit** `feat(learning): store read lessons per account in learning_progress`. The body says the cap runs under a row lock and why `read_at` keeps the first save.

### Task 4: Controller, DTO, module and boundary rule (PR 2)

**Files:**

- Create: `apps/backend/src/api/learning/dto/save-learning-progress.dto.ts`, `learning-progress.controller.ts`, `learning.module.ts`
- Modify: `apps/backend/src/app/app.module.ts` (import `LearningModule`), `apps/backend/eslint.config.mjs`
- Test: `dto/save-learning-progress.dto.spec.ts`, `learning-progress.controller.spec.ts`

**Interfaces:**

```ts
export class SaveLearningProgressDto implements SaveLearningProgressPayload {
  slugs!: string[];
}

@Controller('learning/progress')
@UseGuards(AuthGuard(StrategyKey.JWT.USER))
export class LearningProgressController {
  constructor(progress: LearningProgressService);
  list(user: UserEntity): Promise<LearningProgressResponse>;
  save(user: UserEntity, body: SaveLearningProgressDto): Promise<void>;
}

@Module({
  imports: [TypeOrmModule.forFeature([LearningProgressEntity])],
  controllers: [LearningProgressController],
  providers: [
    LearningProgressService,
    { provide: LearningProgressStore, useClass: TypeormLearningProgressStore },
  ],
})
export class LearningModule {}
```

- **DTO.** `slugs` carries `@IsArray()`, `@ArrayMinSize(1)`, `@ArrayMaxSize(LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST)` and `@IsContentSlug({ each: true })`. `IsContentSlug` is a `ValidateBy` decorator in the same file, built on plan 1's `isContentSlug` and accepting only strings. Its message is `'slug không hợp lệ'`.
- **Controller.** `list` is `@Get()` and returns `{ slugs }`. `save` is `@Put()` with `@HttpCode(HttpStatus.NO_CONTENT)`. It catches `LearningProgressLimitError` and throws `UnprocessableEntityException('Tài khoản đã lưu đủ số bài tối đa.')`; any other error propagates. This is the gift-code controller's mapping pattern.
- **Lint.** Add a block for `src/api/learning/**/*.ts` that ignores `src/api/learning/adapters/**` and `src/api/learning/learning.module.ts`. Its `no-restricted-imports` patterns are `AI_PORT_ONLY` and a new `LEARNING_ADAPTERS_HIDDEN` (`regex: '(^|/)adapters/'`, message "Learning code reaches storage only through port/LearningProgressStore."). A later flat-config block replaces the earlier rule's options rather than merging them, so `AI_PORT_ONLY` must be repeated.

- [ ] **Step 1: Write the failing tests.**
  - `save-learning-progress.dto.spec.ts`, running `validate(plainToInstance(SaveLearningProgressDto, body))`:
    - `accepts up to 50 kebab-case slugs`: 50 slugs like `tu-vi-la-gi` and `12-cung-tu-vi` give no errors.
    - `refuses more than 50 slugs`.
    - `refuses an empty list`.
    - `refuses a slug that is not kebab-case or is longer than 80 characters`: `Tu-Vi`, `tu_vi`, `tu vi`, `''` and an 81-character slug each give an error on `slugs`.
    - `refuses items that are not strings`: `[1]`.
    - `refuses a body whose slugs are not a list`: `{ slugs: 'tu-vi-la-gi' }`.
    - `refuses a property it does not declare`: `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }).transform({ slugs: ['a'], userId: 'x' }, { type: 'body', metatype: SaveLearningProgressDto })` rejects with `BadRequestException`.
  - `learning-progress.controller.spec.ts`. The service is a `useValue` of `jest.fn()`s, and the user is `Object.assign(new UserEntity(), { id: 'user-1' })`:
    - `answers only a signed-in reader`: `Reflect.getMetadata(GUARDS_METADATA, LearningProgressController)` equals `[AuthGuard(StrategyKey.JWT.USER)]`.
    - `wraps the slugs in the response the client reads`: `list` resolves `{ slugs: ['tu-vi-la-gi'] }`.
    - `saves for the authenticated reader, never one named in the body`: with a body built as `Object.assign(new SaveLearningProgressDto(), { slugs: ['a'], userId: 'user-2' })`, `save(user, body)` calls the service with `('user-1', ['a'])`.
    - `answers 422 when the account is full`: a `LearningProgressLimitError` from the service rejects with `UnprocessableEntityException`.
    - `lets any other failure through`: an `Error('db down')` rejects with that same error.
- [ ] **Step 2: Run them.** `pnpm nx test @org/backend -- learning`. Expected: FAIL.
- [ ] **Step 3: Implement**, register the module, and add the lint block.
- [ ] **Step 4: Prove the boundary.** Temporarily import `./adapters/typeorm-learning-progress.store` in `learning-progress.service.ts`, then run `pnpm nx lint @org/backend`. Expected: one `no-restricted-imports` error with the new message. Revert, and lint is clean.
- [ ] **Step 5: Gate.** `pnpm nx affected -t lint typecheck test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(learning): serve reading progress at /api/learning/progress`.

### Task 5: Backend verification against Postgres (PR 2)

- [ ] **Step 1: Ask Kim An before running the migration on his local database.** It only adds a table, and `pnpm db:migration:revert` would drop it. Once he agrees, run `pnpm db:migration:run`.
- [ ] **Step 2: Run the worktree backend on its own port.**
  - Run `pnpm nx build @org/backend` in the worktree. That writes the worktree's own `dist`, not the main checkout's.
  - Start it with `PORT=3100 node apps/backend/dist/main.js`, leaving 3000 alone.
  - Sign in on Kim An's 4200 site, then take the auth cookies from DevTools. Localhost cookies are not separated by port, and both servers share the database and JWT secret.
- [ ] **Step 3: Exercise it with curl.** Expected results:
  - GET without cookies gives 401.
  - GET gives `{ data: { slugs: [] } }`.
  - PUT `{ slugs: ['tu-vi-la-gi', 'tu-vi-la-gi', '12-cung-tu-vi'] }` gives 204, and GET then gives both slugs once.
  - Repeating the PUT gives 204, and `read_at` in `psql` is unchanged.
  - PUT with 51 slugs, with `Bad_Slug`, with `[]`, or with an extra `userId` gives 400.
  - Seed the account to 199 rows with `psql`, then send two PUTs in parallel, each with one different new slug. Exactly one gives 204 and the other 422, and the count is 200.
  - At 200 rows, a PUT of a stored slug gives 204, and a new one gives 422.
- [ ] **Step 4: Clean up.** Delete the seeded rows with `psql` and stop the 3100 process by its PID only. The PR body records these results. Open the PR after "tạo pull".

### Task 6: Account service and the device merge (PR 3)

**Files:**

- Create: `apps/frontend/src/services/learning-progress-service.ts`, `features/kien-thuc/progress/learning-progress-query.ts`, `features/kien-thuc/progress/merge-device-progress.ts`
- Test: `features/kien-thuc/progress/merge-device-progress.spec.ts`

**Interfaces:**

```ts
export const learningProgressService: {
  readonly list: () => Promise<LearningProgressResponse>;
  readonly save: (slugs: readonly string[]) => Promise<void>;
};
export const LEARNING_PROGRESS_QUERY_KEY: readonly ['learning-progress'];
export function mergeDeviceProgress(): Promise<ReadonlySet<string>>;
```

- Both service calls use `BACKGROUND_REQUEST` against `/learning/progress`, with `httpRequest.get` and `httpRequest.put`.
- `mergeDeviceProgress` works in four steps:
  1. take a snapshot with `readLocalProgress()`;
  2. sort it and split it into chunks of `LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST`;
  3. `await save(chunk)` for each chunk in turn, then `list`;
  4. call `clearLocalProgress()` only when `readLocalProgress()` still equals the snapshot, and return the account's slugs as a set.

  A failure rejects and leaves the device as it was.

- [ ] **Step 1: Write the failing tests.** The service module is mocked as the HTTP boundary, and localStorage is jsdom's:
  - `sends the device's lessons to the account, then reads the account back`: the device holds `tu-vi-la-gi` and `12-cung-tu-vi`. `save` gets both, `list` is called after `save` resolves, and the result equals `list`'s slugs.
  - `clears the device once the account holds its progress`: afterwards `readLocalProgress().size` is 0.
  - `keeps a lesson read during the merge for the next one`: while `save` is pending, `markLessonRead('cung-menh-va-cung-than')` runs. After it resolves, the device still holds that slug.
  - `leaves the device untouched when saving fails`: `save` rejects, the call rejects with that error, and the device is unchanged.
  - `skips the save when the device holds nothing`: `save` is not called and `list` is.
  - `sends every lesson on the device in requests of at most 50`: with 60 slugs stored through `markLessonRead`, `save` is called twice, with 50 and then 10 slugs, and the device is cleared only after both resolve.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- merge-device-progress`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run them again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): merge device progress into the account`.

### Task 7: Merge on sign-in, clear on sign-out (PR 3)

**Files:**

- Create: `features/kien-thuc/progress/use-learning-progress-sync.ts`
- Modify: `apps/frontend/src/routes/__root.tsx` (call `useLearningProgressSync()` beside `useSyncLaSoHistoryOnLogin()`)
- Test: `features/kien-thuc/progress/use-learning-progress-sync.spec.tsx`

**Interfaces:**

- `useLearningProgressSync(): void` reads `selectIsAuthenticated` and `selectIsInitializing`, and keeps two refs: whether it merged for this sign-in, and whether it saw a signed-in state.
  - It does nothing while initializing.
  - On signed in, it merges once and sets `LEARNING_PROGRESS_QUERY_KEY` to the result. On failure it logs `'Không đồng bộ được tiến độ học sau khi đăng nhập'` with the error and resets the merged ref.
  - On signed out after having seen a signed-in state, it calls `clearLocalProgress()` and resets both refs.
- The spec renders the hook in a `QueryClientProvider`, mocks `./merge-device-progress`, and drives `useAuthStore.setState`.

- [ ] **Step 1: Write the failing tests.**
  - `waits for auth to settle before merging`: with `isInitializing: true` and a user, the merge is not called.
  - `merges once when a reader signs in`: setting a user calls the merge once, and a rerender does not call it again.
  - `merges again after signing out and back in`.
  - `seeds the progress query with the merged lessons`: `queryClient.getQueryData(LEARNING_PROGRESS_QUERY_KEY)` equals the merge's set.
  - `clears the device when the reader signs out`: signed in, then the user set to null, leaves `readLocalProgress().size` at 0.
  - `clears the device when the session ends without a sign-out`: `endSession()` from `features/auth/session` has the same effect.
  - `leaves an anonymous visitor's progress alone on load`: `isInitializing` going true → false with no user keeps the device's slugs.
  - `keeps the device copy and logs when the merge fails`: `console.error` is called with the message, and the device is unchanged.
- [ ] **Step 2: Run them.** Expected: FAIL.
- [ ] **Step 3: Implement and wire it in `__root.tsx`.**
- [ ] **Step 4: Run them again**, plus `pnpm nx test @org/frontend -- sync-on-login`. Expected: PASS, with la-so's specs unedited.
- [ ] **Step 5: Commit** `feat(kien-thuc): sync progress on sign-in and clear it on sign-out`.

### Task 8: `useLessonProgress` reads the account when signed in (PR 3)

**Files:**

- Modify: `features/kien-thuc/progress/use-lesson-progress.ts` (body only; the exported signature is plan 2's), `src/test-utils/render-at-route.tsx` (wrap the router in a `QueryClientProvider` with a fresh `QueryClient` per render, since every plan 2 page spec now reaches `useQuery`)
- Test: `features/kien-thuc/progress/use-lesson-progress.spec.tsx` (plan 2's file, new cases)

**Interfaces:**

- Signature unchanged: `useLessonProgress(): { readonly readSlugs: ReadonlySet<string>; readonly markRead: (slug: string) => void }`.
- The device set still comes from `useSyncExternalStore(subscribeLocalProgress, readLocalProgress, () => EMPTY)`.
- When `selectIsAuthenticated` is true, `useQuery({ queryKey: LEARNING_PROGRESS_QUERY_KEY, queryFn: list → Set, staleTime: Infinity, enabled: isAuthenticated })` provides the account set, and `readSlugs` is the union.
- `markRead` while signed out is plan 2's `markLessonRead`. While signed in:
  - it returns early when the account set has the slug;
  - otherwise it sends `useMutation` → `save([slug])`, with `onMutate` adding the slug to the query data;
  - `onError` calls `markLessonRead(slug)` and logs `'Không lưu được bài đã đọc vào tài khoản'`.
- The union is memoised against the two set references, so consumers keep a stable `readSlugs` between renders. That is a real downstream requirement: plan 2's hub derives its marks from it.

- [ ] **Step 1: Write the failing tests** (service mocked):
  - `reads only the device while signed out, without calling the API`: `list` is not called.
  - `does not call the API while auth is still initializing`.
  - `reads the account's lessons when signed in`: `list` resolves `['tu-vi-la-gi']`, and `readSlugs` has it.
  - `adds device lessons not yet merged while signed in`: device `{12-cung-tu-vi}` and account `{tu-vi-la-gi}` give both.
  - `saves a read to the account when signed in`: `markRead('cung-menh-va-cung-than')` calls `save` with that slug alone, and `readSlugs` has it before `save` resolves.
  - `does not resend a lesson the account already holds`.
  - `keeps a read on the device when the account save fails`: after `save` rejects, `readLocalProgress()` has the slug and `console.error` was called.
  - Plan 2's existing case passes with only a `QueryClientProvider` added around its probe.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- use-lesson-progress`. Expected: the new cases FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run every kien-thuc spec.** `pnpm nx test @org/frontend -- kien-thuc`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): read lesson progress from the account when signed in`.

### Task 9: The progress card (PR 3)

**Files:**

- Create:
  - `features/kien-thuc/progress/read-lesson-count.ts`, `progress/progress-card-rule.ts`, `progress/progress-card-snooze-store.ts`, `progress/use-progress-card.ts`;
  - `features/kien-thuc/components/progress-card.tsx`, `components/progress-card-slot.tsx`.
- Modify: `progress/lesson-end-slot.tsx` and `progress/hub-progress-slot.tsx` (props and body), `pages/lesson-page.tsx` and `pages/hub-page.tsx` (pass them)
- Test: `read-lesson-count.spec.ts`, `progress-card-rule.spec.ts`, `progress-card-snooze-store.spec.ts`, `progress-card.spec.tsx`, `progress-card-slot.spec.tsx`, plus a case in plan 2's lesson page spec and hub spec

**Interfaces:**

```ts
export function countReadLessons(
  readSlugs: ReadonlySet<string>,
  lessonSlugs: ReadonlySet<string>,
  currentLessonSlug: string | null,
): number;

export const PROGRESS_CARD_MIN_READ_LESSONS = 2;
export const PROGRESS_CARD_SNOOZE_MS = 604_800_000;
export interface ProgressCardRuleInput {
  readonly isAuthResolved: boolean;
  readonly isSignedIn: boolean;
  readonly readCount: number;
  readonly snoozedAt: number | null;
  readonly now: number;
}
export function isProgressCardDue(input: ProgressCardRuleInput): boolean;

export const PROGRESS_CARD_SNOOZE_KEY = 'kien-thuc-progress-card-snoozed-at-v1';
export function readProgressCardSnooze(): number | null;
export function snoozeProgressCard(now: number): void;
export function subscribeProgressCardSnooze(listener: () => void): () => void;

export enum ProgressCardStatus {
  Hidden = 'hidden',
  Due = 'due',
}
export type ProgressCardState =
  | { readonly status: ProgressCardStatus.Hidden }
  | {
      readonly status: ProgressCardStatus.Due;
      readonly readCount: number;
      readonly totalCount: number;
      readonly signIn: () => void;
      readonly snooze: () => void;
    };
export function useProgressCard(
  manifest: KienThucManifest,
  currentLessonSlug: string | null,
): ProgressCardState;

export function ProgressCard(props: {
  readonly readCount: number;
  readonly totalCount: number;
  readonly onSignIn: () => void;
  readonly onSnooze: () => void;
}): ReactElement;
export function ProgressCardSlot(props: {
  readonly manifest: KienThucManifest;
  readonly lessonSlug: string | null;
}): ReactElement;
export function LessonEndSlot(props: {
  readonly manifest: KienThucManifest;
  readonly lessonSlug: string;
}): ReactElement;
export function HubProgressSlot(props: { readonly manifest: KienThucManifest }): ReactElement;
```

- **Snooze store.** It guards storage access the way plan 2's `local-progress-store.ts` does. A value that is not a finite number reads as `null`. It notifies subscribers in the same tab and listens to `storage` events from other tabs.
- **`useProgressCard`.**
  - It reads `useLessonProgress().readSlugs`, the auth store and the snooze through `useSyncExternalStore` (server snapshot `null`). The lesson slugs and the total come from `publishedLessons(manifest)`.
  - `now` comes from `useState(() => Date.now())`, so render stays pure.
  - `signIn` is `open('login')` from `useAuthModal`. `snooze` calls `snoozeProgressCard(Date.now())`.
- **`ProgressCard`** is presentational:
  - an `aside` with `aria-labelledby` on the first line, styled `rounded-2xl border border-ink/15 bg-day-200 p-5 text-ink md:p-6`;
  - the first line in `font-display font-extrabold text-xl`, the second in `text-base`;
  - a `CtaButton tone={CtaTone.Gold}` "Đăng nhập" with `onFocus` and `onMouseEnter` calling `preloadAuthModal`;
  - "Để sau" as a `min-h-11 px-2 text-sm font-semibold text-ink underline underline-offset-4` button with `FOCUS_RING_CLASS`.
- **`ProgressCardSlot`** renders a `div` with `tabIndex={-1}` and a ref, holding `ProgressCard` when due. After `snooze` it focuses the `div`. When hidden, the `div` is empty. It reserves no height, so a signed-in reader sees no gap.

- [ ] **Step 1: Write the failing tests.**
  - `read-lesson-count.spec.ts`:
    - `counts only lessons the manifest lists`: an account slug that is no longer a lesson is not counted.
    - `counts the lesson being finished`: `{a}` read, current `b`, gives 2.
    - `does not count the current lesson twice`.
  - `progress-card-rule.spec.ts`:
    - `is due for a signed-out reader with two lessons read`.
    - `waits for one more lesson after the first`: a count of 1 is not due.
    - `never shows to a signed-in reader`.
    - `waits for auth to resolve`.
    - `stays hidden for seven days after Để sau`: `now - snoozedAt` at `PROGRESS_CARD_SNOOZE_MS - 1` is not due, and at `PROGRESS_CARD_SNOOZE_MS` it is due.
  - `progress-card-snooze-store.spec.ts`:
    - `remembers a snooze`.
    - `reads a broken value as no snooze`: `'soon'` gives null.
    - `tells subscribers about a snooze`.
  - `progress-card.spec.tsx`:
    - `says exactly what signing in does`: the texts are `Bạn đã đọc 4/18 bài.` and `Đăng nhập để giữ tiến độ và học tiếp trên mọi thiết bị.`, and no other sentence.
    - `is a complementary region named by its first line`: `getByRole('complementary', { name: 'Bạn đã đọc 4/18 bài.' })`.
    - `offers Đăng nhập and Để sau as buttons with reachable targets`: both are `button`s; `Để sau` has `min-h-11` and the `FOCUS_RING_CLASS` tokens.
    - `calls back on each button`.
    - `fades no text`: no class matches `/^text-[\w-]+\/\d+$/` or starts with `opacity-`.
  - `progress-card-slot.spec.tsx`. It renders through `renderAtRoute` at `/kien-thuc/12-cung-tu-vi` with `FIXTURE_SOURCE.loadManifest()` (specs never read real content), drives the auth store, and seeds the device with `markLessonRead`:
    - `offers sign-in at the end of a second lesson`: device `{tu-vi-la-gi}` and lesson `12-cung-tu-vi` give the text `Bạn đã đọc 2/5 bài.` (the fixture publishes five lessons).
    - `stays hidden after one lesson`.
    - `stays hidden for a signed-in reader`.
    - `stays hidden while auth is initializing`.
    - `opens the sign-in modal without leaving the lesson`: clicking `Đăng nhập` gives `router.state.location.pathname` `/kien-thuc/12-cung-tu-vi` and `search.auth` `login`.
    - `hides for seven days on Để sau and keeps keyboard focus in place`: after the click the card is gone, `document.activeElement` is the slot `div`, and `readProgressCardSnooze()` is a number.
    - `comes back once the week has passed`: a snooze stored 8 days before the fixed `Date.now()` shows the card.
  - In plan 2's lesson page spec:
    - `puts the progress card after Bài tiếp theo and before the Night card`: with progress seeded, the complementary region follows the "Bài tiếp theo" link and precedes the `Lập lá số` CTA in document order;
    - `never among the prose sections`: no `section` whose id starts with `muc-` contains it, and it follows the last one in document order.
  - In plan 2's hub spec, `offers the progress card right after the path`: with progress seeded, the region follows the `Lộ trình` list and precedes the h2 `Tra cứu` in document order.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- read-lesson-count progress-card kien-thuc`. Expected: FAIL.
- [ ] **Step 3: Implement.** `LessonEndSlot` renders `ProgressCardSlot` with its manifest and lesson slug, and `HubProgressSlot` with its manifest and `null`. The lesson page passes `lesson.slug` and `manifest`, the hub page passes `manifest`.
- [ ] **Step 4: Gate.** `pnpm nx affected -t lint typecheck test`. Expected: PASS, and `local/no-ad-hoc-style` is clean on `features/kien-thuc`.
- [ ] **Step 5: Commit** `feat(kien-thuc): offer to keep progress at the end of a lesson`.

### Task 10: Verification (PR 3)

- [ ] **Step 1: Build and prerender.** Run `pnpm nx build @org/frontend`.
  - Expected: the prerendered hub and `/kien-thuc/tu-vi-la-gi` contain neither `Bạn đã đọc` nor `Để sau`.
  - Expected: `rg -l "kien-thuc-progress-card|learning/progress" apps/frontend/dist/assets` lists only chunks the kiến thức routes and the root load. The root's entry chunk contains no manifest content: `rg "\"readingMinutes\"" <entry chunk>` is empty.
- [ ] **Step 2: Real app.** This needs Task 5's backend on 3100 with the migration applied.
  - Run the worktree frontend with `vite` on 4300, its API base pointed at `http://localhost:3100/api`. Read the frontend config loader for the key; do not guess it.
  - Start the backend with `CORS_ORIGINS` including `http://localhost:4300`.
  - Email sign-in is the path to use here, because Google refuses 4300.
  - Walk through, checking `localStorage` and `GET /learning/progress` at each step:
    - Signed out, read two lessons to their ends. The card appears after "Bài tiếp theo" on the second only, and never while scrolling through the text.
    - "Để sau" hides it, and it stays hidden on the next lesson. Set the snooze 8 days back in DevTools, and it returns.
    - "Đăng nhập" opens the modal at the same scroll position. After email sign-in, the modal closes over the same lesson, the account lists both lessons, `kien-thuc-progress-v1` is gone, and the hub shows both as read.
    - Sign out from the menu. `kien-thuc-progress-v1` is absent, and the hub shows no progress.
    - Sign in on a second browser profile. The hub shows the account's progress with no device progress.
  - Screenshots of the card at 320, 390 and 1440 × 900 go to the scratchpad for Kim An.
- [ ] **Step 3: CLS.** With two lessons seeded, record a Performance trace at 390 × 844 (Slow 4G, 4× CPU) and at 1440 × 900, on the hub and on a lesson, scrolling to the end.
  - Expected: CLS 0 in the first viewport, and no shift when the card mounts after auth resolves.
  - If one appears, report it with the trace; do not patch it silently.
- [ ] **Step 4: Lighthouse.** Run `npx -y lighthouse@12.8.2` mobile, 5 runs, on the hub and `/kien-thuc/tu-vi-la-gi` of the 4300 preview build.
  - Expected medians: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100, CLS 0, each at or above plan 2's recorded medians.
  - If Performance drops, find the cause (root chunk size, a new request on load) before going on.
- [ ] **Step 5: Final review** by a fresh reviewer on the whole branch with this Review Focus. Fix Critical and Important findings test-first. Stop the 4300 and 3100 processes by PID. Open the PR after "tạo pull".

## Contradictions and hazards found while planning

- `apps/frontend/src/lib/google-identity.ts:49-56` initializes Google once, with whichever callback arrives first. `google-sign-in-button.tsx:55-56` registers a no-op. `use-google-one-tap.ts:21` waits for auth to finish initializing. On a cold load of `?auth=login`, the modal's button can register first, and Google sign-in from the modal then silently does nothing. The spec's "shared by the modal's Google button" holds only when One Tap registered first. This is outside #222's scope: report it as a separate issue.
- `use-google-one-tap.ts:29-44`: the credential closure Google keeps is the first render's, so a fix that reads render-time state (search, redirect) would act on the page where Google was set up. Decision 2 and the last Task 1 case cover it.
- `use-auth-modal.ts:16-30`: `open` and `close` navigate with the router's default `resetScroll`, which router-core resets after every navigation. The spec's "email sign-in stays put" holds for the URL but not the scroll position. Task 1, Step 2 shows it with a failing test.
- `apps/backend/ormconfigs.ts:69-87`: the comment says every entity must be listed, but `LaSoHistoryEntity`, `ActivityLogEntity` and `LuanGiaiChapterEntity` are not. TypeORM 1.1.1 only diffs the listed tables, so `generate` does not drop them. It does mean the list cannot be trusted as complete. Recent migrations (`1789200000000-CreateFunnelDaily.ts` and the round timestamps before it) are hand-written, unlike CLAUDE.md's "Entity changed: `pnpm db:migration:generate`". Task 3 uses `generate` and keeps only `learning_progress` statements.
- `packages/shared/contracts/src/index.ts:34-42`: the client `User` has no `id`, so query keys cannot be per account. Decision 13 relies on `session.ts:9-17` clearing the cache.
- `features/la-so/history/local-history-store.ts` keeps its device mirror after sign-out (`user-menu.tsx:51` only calls `endSession`). After this plan, kiến thức progress leaves a shared device but chart history does not. It is not in this spec; mention it to Kim An as a follow-up.
