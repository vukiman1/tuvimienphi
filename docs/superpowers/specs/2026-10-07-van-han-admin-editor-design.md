# Vận Hạn Admin Editor — Design

Date: 2026-10-07
Status: Draft — awaiting review

## 1. Goal

Give console admins a page in `apps/dashboard` to view, hand-write, edit and publish the
yearly vận hạn readings stored in `van_han`, so a new year's 12 con giáp can be prepared
ahead of time and corrected after it goes live, without touching the database directly.

## 2. Non-goals

- Bulk import (JSON/CSV) and "clone last year" of the reading text. Content is typed by hand.
- Multi-step review/approval. One admin writes and publishes.
- Version history / diff of a reading. The activity log records who saved or published what, not the old text.
- Changing the public vận hạn page UI or its mock fallback (`VAN_HAN_FORTUNE_BY_CHI`).
- Reshaping `van_han` columns beyond adding the publish state.

## 3. Locked decisions

| Decision          | Choice                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Content source    | Typed by hand in the dashboard, one con giáp at a time                                       |
| Visibility        | Per-row Draft / Published. The public API only returns published rows                        |
| Admin API         | Admin GraphQL (`/api/admin/graphql`), same guards as `users` / `overview` / `activity`       |
| Public write path | `POST /api/van-han` is removed. Closes roadmap item 5 (any logged-in user can write vận hạn) |
| Audit             | Every save / publish / unpublish is recorded in `activity_log`                               |

## 4. Data model

Migration `AddVanHanPublishedAt`:

- `ALTER TABLE van_han ADD COLUMN published_at timestamptz NULL`.
- Backfill `UPDATE van_han SET published_at = updated_at` so rows that are public today stay public.
- No new index: the table holds 12 rows per year and the public query already filters on `year`.

`VanHanEntity` gains `publishedAt: Date | null`. A row is **published** iff `publishedAt IS NOT NULL`.

Save never changes `publishedAt`: a new row starts as draft, and editing a published row
updates the live content in place (the editor warns about this, see §6.3).

`zodiac` is derived on the server from `zodiacOrder` (Tý … Hợi) instead of being accepted
from the client, so the pair can never disagree.

## 5. Backend

### 5.1 Public module (`api/van-han`)

- `VanHanService.findByYear` → `findPublishedByYear`: adds `publishedAt: Not(IsNull())`.
- `VanHanController`: keeps `GET /api/van-han?year=`, drops `POST` and `dto/save-van-han.dto.ts`.
- The public response shape (`VanHanEntry` in `@org/shared-contracts`) does not change; `publishedAt` is not exposed.

### 5.2 Admin module (`api/admin/van-han/`)

Files, following `admin/users` and `admin/activity`:

- `admin-van-han.type.ts` — `VanHanYearSummary`, `AdminVanHanEntry`, `VanHanAspect`, `VanHanAgeReading` object types.
- `dto/save-van-han.input.ts` — `SaveVanHanInput` (`@InputType`, class-validator rules carried over from the deleted DTO).
- `dto/van-han-key.args.ts` — `{ year, zodiacOrder }`.
- `admin-van-han.service.ts` — reads/writes `van_han` and records activity.
- `admin-van-han.resolver.ts` — `@UseGuards(GqlAuthGuard(StrategyKey.JWT.ADMIN), RolesGuard)` + `@RequireRoles(...CONSOLE_ROLES)`.

`VanHanEntity` is added to `AdminModule`'s `TypeOrmModule.forFeature`.

Schema (first `type Mutation` in the admin schema):

```graphql
type VanHanYearSummary {
  year: Int!
  total: Int!
  published: Int!
}

type AdminVanHanEntry {
  zodiac: String!
  zodiacOrder: Int!
  year: Int!
  title: String!
  bornYears: [Int!]!
  luuNien: String!
  luanGiai: [VanHanAspect!]!
  tungTuoi: [VanHanAgeReading!]!
  publishedAt: DateTime
  updatedAt: DateTime!
}

type Query {
  vanHanYears: [VanHanYearSummary!]!
  vanHanEntries(year: Int!): [AdminVanHanEntry!]!
}

type Mutation {
  saveVanHan(input: SaveVanHanInput!): AdminVanHanEntry!
  setVanHanPublished(year: Int!, zodiacOrder: Int!, published: Boolean!): AdminVanHanEntry!
}
```

Rules:

- `saveVanHan` upserts on `(zodiacOrder, year)` and returns the stored row.
- `setVanHanPublished(published: true)` fails with `BadRequest` when the row does not exist or
  `title` / `luuNien` is blank. `published: false` clears `publishedAt`. Both are idempotent.
- Unknown `(year, zodiacOrder)` on publish → `NotFound`.
- Validation errors surface through the existing `formatGraphqlError`.

### 5.3 Activity log

New enum `AdminVanHanEvent` in the admin van-han module:

| Event                       | Metadata                |
| --------------------------- | ----------------------- |
| `admin.van_han.saved`       | `{ year, zodiacOrder }` |
| `admin.van_han.published`   | `{ year, zodiacOrder }` |
| `admin.van_han.unpublished` | `{ year, zodiacOrder }` |

Actor (`userId`, `actorEmail`), IP and user agent come from the GraphQL context `req`,
using the same IP resolution as `AuthAuditService`. Its `clientIp` is a private function in
`auth-audit.service.ts`, so it moves to `api/activity/client-ip.ts` and both callers import it.

## 6. Dashboard

### 6.1 Routes

| Route                         | Page                                       |
| ----------------------------- | ------------------------------------------ |
| `/van-han?year=2027`          | Year overview (replaces `PagePlaceholder`) |
| `/van-han/$year/$zodiacOrder` | Editor for one con giáp in one year        |

`year` search param defaults to the current calendar year.

### 6.2 Year overview

- Year picker: years from `vanHanYears` plus "current year" and "next year" even when empty, so a new year can be started.
- Header shows progress, e.g. `2027 · 7/12 đã xuất bản · 3 nháp · 2 chưa có`.
- Table of all 12 con giáp, always 12 rows (missing rows rendered as "Chưa có"):
  con giáp · title · status tag (Chưa có / Nháp / Đã xuất bản) · updated at · actions (Soạn / Sửa, Xuất bản / Gỡ xuống).
- Publish/unpublish runs inline from the table with an antd `Popconfirm`.

### 6.3 Editor

antd `Form` with `Form.List` for the two arrays:

- Title, lưu niên (textarea, paragraphs split by blank line as today).
- Luận giải: list of `{ aspect, rating (Rate 0–5), body }`, add/remove/reorder.
- Từng tuổi: list of `{ birthYear, canChi, menh, male, female }`.
- `bornYears` is derived from `tungTuoi[].birthYear` on submit instead of being edited separately.

New rows are pre-filled from the **same con giáp in the previous year** when it exists:
`tungTuoi` birth years / can chi / mệnh and `luanGiai` aspect names are copied, all reading
text (`title`, `luuNien`, `body`, `male`, `female`) is left empty. Without a previous year the form starts empty.

Actions: **Lưu** (keeps current status) and **Lưu & xuất bản**. When the row is already
published, an inline `Alert` says saving updates the public page immediately.
Leaving with unsaved changes is blocked by TanStack Router's `useBlocker`.

### 6.4 Data layer

Following `features/admin/data/*`:

- `van-han-years.document.ts` / `.query.ts`, `van-han-entries.document.ts` / `.query.ts`
- `save-van-han.document.ts`, `set-van-han-published.document.ts` + `useMutation` hooks (first mutations in the dashboard).
- Query keys `['admin', 'van-han', 'years']` and `['admin', 'van-han', 'entries', year]`; every mutation invalidates both.
- Pure mappers in `features/admin/van-han/` (form values ⇄ `SaveVanHanInput`, previous-year → prefill, 12-row overview merge) — unit tested.
- `activity-label.ts` gets labels for the three new events.

The code generator is re-run so `schema.gql` and `src/gql/` stay in sync (CI checks this).

## 7. Error handling

- Mutation failures show an antd `message.error` with `errorMessage()` from `lib/api-error`; the form keeps its values.
- Field-level validation errors from the server (nested array paths) are mapped back onto `Form.List` fields where the path is parseable, otherwise shown as one message.
- Publish of an incomplete row is blocked in the UI (button disabled with tooltip) and enforced by the server rule in §5.2.

## 8. Testing

Backend (Jest, existing `*.spec.ts` style):

- `AdminVanHanService`: upsert preserves `publishedAt`; publish rejects blank / missing rows; unpublish clears; year summary counts; activity recorded per event.
- `VanHanService.findPublishedByYear` excludes drafts.
- Resolver guard: non-console role is rejected (same approach as existing admin resolvers).

Dashboard (Jest + Testing Library, existing style):

- Mappers: form ⇄ input, prefill from previous year, 12-row merge with missing con giáp.
- Overview page renders status tags and progress from a mocked query.

## 9. Rollout

1. Backend PR: migration + admin GraphQL + public filter + `POST` removal. The backfill keeps the public page unchanged on deploy.
2. Dashboard PR: overview + editor (depends on the regenerated `schema.gql`).

The prod VPS database currently has no `van_han` rows, so the first real content will be entered through this editor.

## 10. Open questions

- Should the public page stop falling back to the mock when a con giáp has no published row (show "chưa có dữ liệu" instead)? Out of scope here; worth a separate decision once real content exists.
- `source_url` is unused since the scraper was removed. Dropping it is a separate cleanup.
