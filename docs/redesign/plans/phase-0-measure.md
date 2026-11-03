# Phase 0 — Measure: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Before any redesigned page ships, get a baseline to compare against: daily counts of charts cast and chapters unlocked (free and paid), cookie-less traffic analytics, Search Console, and a Lighthouse/CWV baseline for every public page.

**Architecture:**

- **Counter.** A new backend `funnel` module counts distinct charts per UTC day. The key is an HMAC of the `birthKey`, held in Redis for two days for deduplication. Postgres stores only the daily totals in `funnel_daily`.
- **Hooks.** The luận giải controller records a cast. The luận giải service records an unlock after a chapter is generated.
- **Display.** The admin overview exposes the totals as `PeriodMetric`s, and the dashboard shows them as a "Phễu lá số" row.
- **Traffic analytics.** The Cloudflare Web Analytics beacon is injected into `index.html` at build time.

**Tech Stack:** NestJS + TypeORM + ioredis (backend), Nest GraphQL code-first + graphql-codegen (admin), React + antd (dashboard), Vite (frontend), Jest.

**Spec:** [docs/redesign/design.md](../design.md), sections "Success measures" and "Architecture → Measurement".

## Global Constraints

- No code comments anywhere (project `CLAUDE.md`).
- No `any`; explicit param and return types; module-level constants in `SCREAMING_SNAKE_CASE`; string enums for closed sets.
- Never store or log a raw `birthKey` (design: "never stores it raw").
- Redis dedup TTL: 2 days. Postgres keeps daily totals only.
- Day boundary is UTC, matching `SCHEDULER_TIMEZONE` and the admin overview's `to_char` series.
- Recording a metric must never fail or slow down the user's request.
- Never edit generated files: `apps/backend/src/api/admin/schema.gql`, `apps/dashboard/src/gql/**`.
- Work on branch `feat/redesign-phase-0-measure`, cut from `dev`. Commit steps run only once Kim An has authorised commits for the session. Commit format: `<type>(<scope>): <summary>`, with no co-author trailer.
- Gate before declaring done: `pnpm nx affected -t lint typecheck test`.

## Review Focus

1. **Junk `birthKey`s.** `GET /luan-giai/:birthKey` is public, so anyone can request made-up keys. Malformed keys must not be counted. Test lives in Task 2.
2. **Redis down.** A Redis error must be logged with context (metric kind and day, never the key) and swallowed, and the status response must still return. Test lives in Task 2.
3. **The same chart cast twice in one day**, including reloads and two tabs, counts once. The next UTC day it counts again. Test lives in Task 2.
4. **A chapter whose generation fails or is unavailable** is refunded, so it must not count as an unlock. Test lives in Task 3.
5. **The same chart unlocked twice in one day,** for example chapter 01 then chapter 02 paid with credits, counts once for unlocks and once for paid unlocks. Test lives in Task 2.

---

### Task 1: `isBirthKey` guard in shared contracts

**Files:**

- Modify: `packages/shared/contracts/src/birth-input.ts`
- Test: `packages/shared/contracts/src/birth-input.spec.ts` (create if absent)

**Interfaces:**

- Produces: `isBirthKey(value: string): boolean`, exported from `@org/shared-contracts`. It returns true exactly for strings that `birthKey()` can produce: `YYYY-MM-DD-{am|duong}-h{0..12}-{nam|nu}`.

- [ ] **Step 1: Write the failing tests**

```ts
describe('isBirthKey', () => {
  it('accepts every key birthKey() produces', () => {
    for (const hour of BIRTH_HOUR_KEYS) {
      expect(
        isBirthKey(
          birthKey({
            day: 5,
            month: 11,
            year: 1990,
            calendar: CalendarType.Lunar,
            hour,
            gender: Gender.Female,
          }),
        ),
      ).toBe(true);
    }
  });
  it.each([
    '',
    'abc',
    '1990-11-05-am-h13-nu',
    '1990-11-05-xx-h1-nu',
    '1990-11-05-am-h1-other',
    '1990-1-5-am-h1-nu',
    "1990-11-05-am-h1-nu'; drop",
  ])('rejects %p', (value) => expect(isBirthKey(value)).toBe(false));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm nx test shared-contracts --testPathPattern=birth-input`
Expected: FAIL, because `isBirthKey` is not exported.

- [ ] **Step 3: Implement `isBirthKey` next to `birthKey()`**

- Use one anchored `BIRTH_KEY_PATTERN` regex.
- Build the calendar and gender alternations from the `CalendarType` and `Gender` enum values.
- Bound the hour index by `BIRTH_HOURS.length - 1`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm nx test shared-contracts --testPathPattern=birth-input`
Expected: PASS

- [ ] **Step 5: Commit** with message `feat(contracts): add isBirthKey guard`.

---

### Task 2: Backend `funnel` module (hasher, Redis dedup, daily totals)

**Files:**

- Modify: `packages/backend/redis/src/redis.service.ts` to add `setIfAbsent`.
- Create in `apps/backend/src/api/funnel/`:
  - `funnel.constants.ts`
  - `funnel-metric.enum.ts`
  - `funnel-key-hasher.ts`
  - `funnel.service.ts`
  - `funnel.module.ts`
  - `entities/funnel-daily.entity.ts`
- Create: the migration in `apps/backend/src/migrations/`, generated in Step 7.
- Modify: `apps/backend/src/app/app.module.ts`, or wherever feature modules are registered, to import `FunnelModule`.
- Test:
  - `apps/backend/src/api/funnel/funnel-key-hasher.spec.ts`
  - `apps/backend/src/api/funnel/funnel.service.spec.ts`

**Interfaces:**

- Produces:
  - `RedisService.setIfAbsent(key: string, value: string, ttlSeconds: number): Promise<boolean>` runs `SET key value NX EX ttl` and returns true when the key was newly set.
  - `enum FunnelMetric { ChartCast = 'chart_cast', ChapterUnlock = 'chapter_unlock', PaidChapterUnlock = 'paid_chapter_unlock' }`
  - `FunnelKeyHasher.hash(birthKey: string): string` returns 64 lowercase hex characters.
  - `FunnelService.recordCast(birthKey: string, now?: Date): Promise<void>`
  - `FunnelService.recordUnlock(birthKey: string, source: AllowanceSource, now?: Date): Promise<void>`
  - Entity `FunnelDailyEntity` on table `funnel_daily`, with these columns:
    - `day date` as the primary key;
    - `chart_casts int not null default 0`;
    - `chapter_unlocks int not null default 0`;
    - `paid_chapter_unlocks int not null default 0`.
  - `FunnelModule` exports `FunnelService` and `TypeOrmModule.forFeature([FunnelDailyEntity])`.
- Constants (`funnel.constants.ts`):
  - `FUNNEL_DEDUP_TTL_SECONDS = 172_800`
  - `FUNNEL_REDIS_PREFIX = 'funnel'`
  - `FUNNEL_HKDF_INFO = 'tuvi-funnel-birth-key'`
  - `FUNNEL_KEY_BYTES = 32`

- [ ] **Step 1: Write the failing hasher tests**
  - `hash` is deterministic for the same secret and input.
  - Output matches `/^[0-9a-f]{64}$/`.
  - Output differs from `sha256(birthKey)`, so it is keyed.
  - Output differs under a different `crypto.secretKey`.
  - Output never contains the raw `birthKey`.

  Build the hasher with a stub `ConfigService` returning the secret.

- [ ] **Step 2: Write the failing service tests**
  - Use an in-memory fake `RedisService` (a `Map` that honours NX).
  - Use a fake repository that records increments per `(day, column)`.

  Cases:
  - `counts a chart once per UTC day however often it is viewed`: two `recordCast(k, 2026-11-05T01:00Z)` calls give `chart_casts = 1`.
  - `counts the same chart again on the next UTC day`: calls at `2026-11-05T23:59Z` and `2026-11-06T00:01Z` give 1 on each day.
  - `ignores keys that birthKey() cannot produce`: `recordCast('abc')` makes no Redis call and no increment.
  - `counts a free unlock without counting it as paid`: `recordUnlock(k, AllowanceSource.Daily)` gives `chapter_unlocks = 1, paid_chapter_unlocks = 0`.
  - `counts a credit unlock as both unlock and paid unlock, once per day`: two `recordUnlock(k, Credit)` calls give 1 and 1.
  - `never sends the raw birth key to Redis`: every key passed to `setIfAbsent` excludes `k`.
  - `keeps the request alive when Redis fails`: `setIfAbsent` rejects, `recordCast` resolves, there is no increment, and the logger was called with a message containing the metric and the day but not `k`.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm nx test @org/backend --testPathPattern=funnel`
Expected: FAIL, because the modules do not exist.

- [ ] **Step 4: Implement the hasher**

- Derive the key once in the constructor: `hkdfSync('sha256', secretKey, '', FUNNEL_HKDF_INFO, FUNNEL_KEY_BYTES)`.
- `hash` is `createHmac('sha256', key).update(birthKey).digest('hex')`.
- Throw a named `FunnelConfigError` when `crypto.secretKey` is missing.

- [ ] **Step 5: Implement `setIfAbsent` and `FunnelService`**

- **Redis key:** `${FUNNEL_REDIS_PREFIX}:${metric}:${YYYY-MM-DD}:${hash}`, with the UTC date from `now`.
- **Increment:** only when `setIfAbsent` returns true. Use a single parameterised upsert: `INSERT INTO funnel_daily (day, <column>) VALUES ($1, 1) ON CONFLICT (day) DO UPDATE SET <column> = funnel_daily.<column> + 1`.
- **Column name:** comes from a `const` map `FunnelMetric → column`, never from input.
- **Errors:** wrap each record in a `try`/`catch` that logs `warn` with `{ metric, day }` and returns.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm nx test @org/backend --testPathPattern=funnel`
Expected: PASS

- [ ] **Step 7: Generate the migration** with Postgres running via `pnpm bootstrap`

Run: `pnpm db:migration:generate CreateFunnelDaily`. Then `pnpm db:migration:run`.
Expected: one new file in `apps/backend/src/migrations` creating `funnel_daily`, and the run applies it.

- [ ] **Step 8: Commit** with message `feat(funnel): count distinct charts cast and chapters unlocked per day`.

---

### Task 3: Record casts and unlocks from luận giải

**Files:**

- Modify:
  - `apps/backend/src/api/luan-giai/luan-giai.controller.ts`
  - `apps/backend/src/api/luan-giai/luan-giai.service.ts`
  - `apps/backend/src/api/luan-giai/luan-giai.module.ts`
- Test:
  - `apps/backend/src/api/luan-giai/luan-giai.service.spec.ts`
  - `apps/backend/src/api/luan-giai/luan-giai.controller.spec.ts` (create)

**Interfaces:**

- Consumes: `FunnelService.recordCast` and `FunnelService.recordUnlock` (Task 2).

- [ ] **Step 1: Write the failing tests**
  - Controller: `status records a chart cast for the requested key`. Calling `status(k)` calls `recordCast(k)` once and still returns the status map.
  - Service: `records an unlock with the allowance source after a chapter is saved`. A successful generation with source `Credit` calls `recordUnlock(key, AllowanceSource.Credit)`.
  - Service: `does not record an unlock when generation fails or is unavailable`. Two cases: the generator returns null, and the generator throws. Neither calls `recordUnlock`.
  - Service: `does not record an unlock when the chapter was already generated`. `readOrGenerate` returns the cached article without calling `recordUnlock`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm nx test @org/backend --testPathPattern=luan-giai`
Expected: FAIL on the four new cases. Existing cases still pass.

- [ ] **Step 3: Wire it up**
  - Import `FunnelModule` in `LuanGiaiModule` and inject `FunnelService` into the controller and the service.
  - Controller `status`: `void this.funnel.recordCast(birthKey)` before returning.
  - Service `generateAndSave`: `void this.funnel.recordUnlock(key, source)` right after `save` succeeds.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm nx test @org/backend --testPathPattern=luan-giai`
Expected: PASS, including `luan-giai.characterization.spec.ts`.

- [ ] **Step 5: Commit** with message `feat(luan-giai): record funnel casts and unlocks`.

---

### Task 4: Funnel metrics in the admin overview

**Files:**

- Modify:
  - `apps/backend/src/api/admin/overview/admin-overview.type.ts`
  - `apps/backend/src/api/admin/overview/admin-overview.service.ts`
  - `apps/backend/src/api/admin/admin.module.ts` (register `FunnelDailyEntity`)
- Test: `apps/backend/src/api/admin/overview/funnel-metrics.spec.ts`
- Create: `apps/backend/src/api/admin/overview/funnel-metrics.ts`

**Interfaces:**

- Produces:
  - GraphQL fields `AdminOverview.chartCasts`, `AdminOverview.chapterUnlocks` and `AdminOverview.paidChapterUnlocks`, each a `PeriodMetric`.
  - Pure `funnelMetric(rows: readonly FunnelDayRow[], column: FunnelColumn, current: Window, previous: Window): PeriodMetric`.
  - `interface FunnelDayRow { readonly day: string; readonly chartCasts: number; readonly chapterUnlocks: number; readonly paidChapterUnlocks: number }`
  - `type FunnelColumn = 'chartCasts' | 'chapterUnlocks' | 'paidChapterUnlocks'`
  - Move `Window`, `fillDays` and `isoDate` from the service into `funnel-metrics.ts`, or into a shared `overview-window.ts`, and export them for both.

- [ ] **Step 1: Write the failing tests for `funnelMetric`**
  - It sums the column over the current window and over the previous window.
  - Its series covers every day of the current window, with 0 for days that have no row.
  - Rows outside both windows are ignored.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm nx test @org/backend --testPathPattern=funnel-metrics`
Expected: FAIL

- [ ] **Step 3: Implement**

- `funnelMetric` is pure.
- `summarise` loads `funnel_daily` rows for `[previous.start, current.end)` in one query and maps them three times.

- [ ] **Step 4: Run the tests and regenerate the schema**

Run: `pnpm nx test @org/backend --testPathPattern=funnel-metrics`, then `pnpm nx build @org/backend`.
Expected: PASS, and `schema.gql` now lists the three new fields.

- [ ] **Step 5: Commit** with message `feat(admin): expose funnel metrics in the overview`.

---

### Task 5: "Phễu lá số" row in the dashboard

**Files:**

- Modify:
  - `apps/dashboard/src/features/admin/data/admin-overview.document.ts`
  - `apps/dashboard/src/features/admin/pages/overview-page.tsx`
  - `apps/dashboard/src/features/admin/components/stat-tile.tsx`
- Create: `apps/dashboard/src/features/admin/data/paid-conversion.ts`
- Test: `apps/dashboard/src/features/admin/data/paid-conversion.spec.ts`

**Interfaces:**

- Consumes: the three `PeriodMetric` fields from Task 4.
- Produces:
  - `paidConversionPercent(casts: number, paidUnlocks: number): number | undefined`, which is undefined when `casts === 0` and otherwise rounded to 1 decimal.
  - `StatTile` gains `unit?: StatUnit`, with `enum StatUnit { Count = 'count', Percent = 'percent' }`. Percent renders as `12,5%` in the `vi-VN` locale.

- [ ] **Step 1: Write the failing tests for `paidConversionPercent`**

The cases are `(0, 0) → undefined`, `(200, 25) → 12.5`, and `(3, 1) → 33.3`.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm nx test @org/dashboard --testPathPattern=paid-conversion`
Expected: FAIL

- [ ] **Step 3: Implement and wire up**
  - Add the three fields, using `...MetricFields`, to the document.
  - Run `pnpm nx codegen @org/dashboard`.
  - Render a row titled "Phễu lá số" with four tiles:
    - "Lá số được lập", from `chartCasts`;
    - "Mở khoá luận giải", from `chapterUnlocks`;
    - "Mở khoá trả phí", from `paidChapterUnlocks`;
    - "Tỷ lệ trả phí", from `paidConversionPercent`, using `unit={StatUnit.Percent}` and no sparkline.

- [ ] **Step 4: Verify**

Run: `pnpm nx test @org/dashboard --testPathPattern=paid-conversion`, then `pnpm nx typecheck @org/dashboard`.
Expected: PASS. Open the dashboard overview and the row renders. With an empty `funnel_daily` it shows zeros and an empty conversion tile.

- [ ] **Step 5: Commit** with message `feat(dashboard): show the chart funnel on the overview`.

---

### Task 6: Cloudflare Web Analytics beacon

**Files:**

- Modify:
  - `apps/frontend/config/index.ts` (schema)
  - `apps/frontend/config/default.yml`
  - `apps/frontend/config/custom-environment-variables.yml`
  - `apps/frontend/vite.config.mts`
  - `apps/frontend/.env.example`
- Create: `apps/frontend/tools/analytics-beacon.ts`
- Test: `apps/frontend/tools/analytics-beacon.spec.ts`

**Interfaces:**

- Produces:
  - Config key `analytics.cloudflareToken`, a string defaulting to `''`, read from env `VITE_CF_ANALYTICS_TOKEN`.
  - `injectAnalyticsBeacon(html: string, token: string): string`.
  - A Vite plugin, `apply: 'build'`, that calls it from `transformIndexHtml`.

- [ ] **Step 1: Write the failing tests**
  - An empty token returns `html` unchanged.
  - A token inserts exactly one `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"<token>"}'></script>` before `</head>`.
  - A token containing `'`, `"` or `<` is rejected with a named `AnalyticsTokenError`. Cloudflare tokens are hex, so validate `/^[0-9a-f]{32}$/i`.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm nx test @org/frontend --testPathPattern=analytics-beacon`
Expected: FAIL

- [ ] **Step 3: Implement the function, the config key and the plugin**

- [ ] **Step 4: Verify**

Run the tests, then `VITE_CF_ANALYTICS_TOKEN=0123456789abcdef0123456789abcdef pnpm nx build @org/frontend && grep -c cloudflareinsights apps/frontend/dist/index.html`.
Expected: the tests PASS and the grep prints `1`. A build without the env var prints `0`.

- [ ] **Step 5: Commit** with message `feat(frontend): add the Cloudflare Web Analytics beacon`.

- [ ] **Step 6 (Kim An): Turn it on.** In Cloudflare, go to Web Analytics → Add a site → `xemtuvimienphi.top` and copy the token. In Vercel, set `VITE_CF_ANALYTICS_TOKEN` for Production, then redeploy.

---

### Task 7 (Kim An, no code): Google Search Console

- [ ] Add a **Domain** property for `xemtuvimienphi.top`. Verify it with the DNS TXT record in Cloudflare DNS (the domain's DNS is on Cloudflare).
- [ ] Submit `https://xemtuvimienphi.top/sitemap.xml` under Sitemaps.
- [ ] Confirm that URL Inspection on `/` shows "URL is on Google" or "can be indexed".

---

### Task 8: Lighthouse / Core Web Vitals baseline

**Files:**

- Create: `docs/redesign/baseline.md`

- [ ] **Step 1: Run Lighthouse in mobile mode against production** for each public route:
  - `/`
  - `/la-so`
  - `/ngay-tot`
  - `/van-han`
  - `/kien-thuc`
  - `/kien-thuc/<first slug from tools/seo-routes.mjs>`
  - one `/la-so/detail?...` sample

  Run each one three times and keep the median:
  `pnpm dlx lighthouse@12 <url> --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/lh-<route>-<n>.json --chrome-flags="--headless=new"`

- [ ] **Step 2: Record the results** in `docs/redesign/baseline.md`, with one table row per route. Columns: Performance, Accessibility, Best Practices, SEO, LCP (s), CLS, TBT (ms), and total transfer size (KB). Also include the date and the Lighthouse version.
  - If the Chrome UX Report has field data, add the field LCP, CLS and INP from PageSpeed Insights.

- [ ] **Step 3: Commit** with message `docs(redesign): record the pre-redesign performance baseline`.
