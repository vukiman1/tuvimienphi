# Phase 3 — Vận hạn in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Vận hạn pages from the old hex palette, gradients and raster ornaments to D3. That covers the list page (`/van-han`), the con giáp page (`/van-han/$slug`) and the con giáp page of a given year (`/van-han/$year/$slug`): the con giáp picker, the year switch, the yearly overview (Lưu niên), the four aspects with their star ratings, the per-birth-year readings and the not-published state. No copy, URL, head tag, canonical, sitemap entry or loader behaviour changes.

**Architecture:** Ordinary Day-header pages, not story pages: no chapter rail and no sticky CTA. Each page opens with a Night `PageHero`. On the list page the hero holds the h1, the existing lead and the Tết hub link, and a Day zone below holds the picker. On a con giáp page the hero holds the way back, the h1, the facts line (tuổi, năm, năm sinh), the Tết hub link and the year switch. Below it, one Day zone holds the overview in a `ReadingZone`, the aspect cards, the birth-year cards and, last, the picker. Both con giáp routes keep rendering the same `VanHanZodiacPage`. The picker reuses the gold con giáp emblems the Tết hub already ships. Every other raster image on the pages goes: the hand-painted hero PNGs (which carry a Chinese seal), the nine coins, the cloud and the zodiac PNGs. `StarRating` moves from `features/ngay-tot` into `design-system/`, because vận hạn is its second feature. The mệnh-to-element lookup moves out of `van-han-theme.ts` into a pure module, and the theme file is deleted.

**Tech Stack:** React 19, TanStack Router and Query, Tailwind v4 tokens from `design-system/tokens.css`, lucide icons, Jest + Testing Library.

**Spec:** [design.md](../design.md), "Visual identity — D3" (two zones per page, geometry kit, no raster ornaments, no Chinese characters as text or artwork), "Asset kit" (paintings optional, shipped only after the page passes the gates without them; icons stay code) and the quality gates. The 2026-11-06 baseline for `/van-han` in [baseline.md](../baseline.md): Performance 77, Accessibility 96, LCP 4.7 s, about 3.9 MB transferred. The con giáp pages (#177, #179) postdate the baseline and have none.

## Decisions (approved by Kim An's delegation, 2026-11-14)

1. **Scope.** One PR for all three routes, since they share every component. No new copy. The pages gain no JSON-LD in this PR: `BreadcrumbList` and an `Article` block need head changes, so they go on the follow-up list with the other SEO work.
2. **List page hero.**
   - A Night `PageHero` with no breadcrumb, no eyebrow and no painting.
   - The h1 is `Vận <Emphasis isAccent>Hạn</Emphasis>`. Its text stays "Vận Hạn", and it uses only the Inter Tight 800 and Playfair 600 italic files that every page preloads.
   - The lead is unchanged. The `Tử vi 2027 theo tuổi` link becomes a `TextLink` in the hero's children.
3. **Con giáp picker: reuse the Tết emblems.**
   - One `ZodiacPicker` on all three pages. Each of the 12 links is a tile with the existing gold emblem from `public/tet/emblem/<slug>-128.webp` (about 3 KB each, 37 KB for all 12) drawn at 48 px, then the chi name. The emblem is decorative (`alt=""`), lazy, with `width`/`height` set.
   - No new asset is drawn. The emblems are already in the approved kit, and they match the geometry kit (gold line art and 12 points on a Night disc).
   - The grid is 4 columns on phones, 6 from `sm` and 12 from `lg`. Six columns, today's layout, do not fit 48 px emblems at 320 px.
   - The tile being read is `bg-gold/10 inset-ring-2 inset-ring-ink` with `aria-current="page"`. The ring carries the state, not the tint.
   - The 12 zodiac PNGs, the red CSS filter and the sparkles go.
4. **Con giáp page layout.**
   - **Hero (Night):** the `← Vận hạn 12 con giáp` link as the breadcrumb, the h1 (the published title, plain, with no `Emphasis`, because the text comes from the admin console), then the facts line `Tuổi Tý · Vận hạn năm Bính Ngọ 2026 · Sinh năm: …`, the Tết hub link and the year switch.
   - **Day zone:** "Lưu Niên Vận Thế" and the overview in a `ReadingZone`, then "Vận Thế Luận Giải" with the aspect cards, then "Vận Hạn Từng Tuổi" with the birth-year cards, and **the picker last**.
   - The picker moves below the reading because a reader who landed on a con giáp page came for that reading. Today the picker pushes the overview about 150 px down on a phone, and with emblems it would be 250 px.
   - Vận hạn takes `conGiapEmblem` and `conGiapPainting` from `features/tet-hub/tet-hub-paintings.ts` as they are. They are pure URL helpers, not components, so the import does not couple the two pages' looks the way sharing `StarRating` would (Decision 10).
   - The facts move from the old hero card into the page hero, so the hero is taller than its h1 and the h1 stays the LCP element.
5. **Year switch.**
   - It moves into the hero. "Năm khác:" is `text-day-soft`. Each other year is a pill link, `min-h-11 rounded-full border border-day/30 px-4 text-day`, with `FOCUS_RING_CLASS`.
   - The year shown stays a `<span aria-current="true">`, as the existing spec pins. It is a filled `bg-gold text-ink` pill, so it differs from the outlined links in shape as well as colour.
   - It still hides when fewer than two years are published.
6. **Aspects: how good and bad are marked.**
   - The rating is the only good/bad signal the data has (0–5). It stays as five lucide stars through `StarRating`: filled gold with an Ink outline, or an empty `ink-soft` outline. The `aria-label` "`n` trên 5 sao" is unchanged. No green, no red, no opacity.
   - All four aspects share one card style: a Day tile with an `ink/15` border. The four coins and the four label colours go; the h3 label names the aspect.
   - The `»` bullets become a `list-disc` with `marker:text-ink-soft`.
   - "Xem chi tiết ›" / "Thu gọn" keep their text. The button grows to 44 px, gets `FOCUS_RING_CLASS` and gains `aria-expanded`. Today it has neither a visible focus ring nor an expanded state.
7. **Birth-year cards.**
   - Day tiles. The can chi is `font-display font-extrabold text-2xl text-ink`, "Sinh năm …" is `text-ink-soft`, and the element is a `bg-day-200 text-ink` pill with its text (Kim, Mộc…).
   - The ngũ hành coins, their pulsing glow, the 360° hover spin and the five violet/green/sky/orange/amber themes go. The `hanh-*` tokens are **not** used: design.md keeps chart data colours inside chart components, and the element's name already says which one it is.
   - Nam and Nữ get the same Ink disc with the lucide `User` icon. The labels carry the difference, so the rose colour on Nữ goes. The CSS `uppercase` goes, as it did on Lá số and Ngày tốt.
8. **Headings.** "Lưu Niên Vận Thế", "Vận Thế Luận Giải" and "Vận Hạn Từng Tuổi" are `<p>` today, so the page has an h1 and nothing under it. They become serif `DisplayTitle` h2s (`TitleFace.Serif`, `DisplaySize.Card`), and each aspect label becomes an h3. The `❖`, `◆` and `»` glyphs and the gradient rules are ornament, not copy, and go.
9. **No motion.** The staggered fade-and-slide entrance on every card (`CARD_ENTER`), the pulsing glow, the spin and the hover shadows go. The entrance starts the overview at opacity 0, which can only delay its paint. No spec pins it.
10. **`StarRating` moves to `design-system/`.** Ngày tốt and vận hạn both need it. Importing one feature's component from another would couple them, and the design system is where shared visual primitives live. The Ngày tốt call sites change their import path only.
11. **Painting on the con giáp pages: reuse the Tết hub's, in a separate last step.**
    - The con giáp pages get the Tết hub's painting of the same con giáp (`conGiapPainting`, 768 and 1536 px WebP) through `PageHero`'s `painting` prop. It shows only from 768 px, as a lazy `<img>` that phones never fetch.
    - Design.md says a painting is added only after the page passes the gates without it. So it lands in Task 7, after the Task 6 A/B, and only if the desktop check there shows the h1 is still the LCP element. Otherwise it is dropped and reported.
    - The list page gets no painting.
12. **Media clean-up.**
    - Delete `van-han-theme.ts`, the unused `VanHanDetailLoader`, `vanHanHeroUrl`, `vanHanCoinUrl`, `zodiacIconPath`, `zodiacIconUrl` and `normalizeChi`. None has a caller left.
    - Keep `MEDIA.vanHan.decorCloud` (the settings profile card uses it) and `MEDIA.laSo.luopan` (kiến thức uses it).
    - The files under `public/van-han/` and `public/zodiac/` stay until Phase 4.
    - `lib/zodiac-icons.ts` is left holding only `ZODIAC_CHI` and `ZodiacChi`, so its name no longer fits. It is **not** renamed here, because `van-han-paths.spec.ts` imports it and existing specs stay unedited. The rename goes on the follow-up list.
13. **The mệnh lookup keeps its behaviour.** `elementOfMenh` moves to `features/van-han/menh-element.ts` unchanged, including its fallback to Thổ. A mệnh spelled with the old-style accent ("Thuỷ" instead of "Thủy") falls back to Thổ and shows the wrong element. That is a pre-existing data risk, reported rather than fixed here.

## Global Constraints

- **Tokens only.** No hex values, no `[Npx]`, no inline `style`, no gradient and no comments. Use the palette tokens (`bg-day`, `text-ink`, `text-ink-soft`…), not the shadcn semantic ones (`text-foreground`, `text-muted-foreground`). `min-h-[240px]` becomes `min-h-60`. `src/features/van-han/**` joins `MIGRATED_FILES` (Task 5), so the `local/no-ad-hoc-style` guard proves it.
- **Content is frozen.** Every visible string stays byte-identical:
  - the h1 `Vận Hạn`, the lead `Chọn con giáp để xem sao chiếu mệnh và vận hạn trong năm theo tuổi.`, `Tử vi 2027 theo tuổi`, the picker label `Chọn con giáp` and the 12 chi names;
  - `← Vận hạn 12 con giáp`, the published title, `Tử vi 2027 tuổi {chi}`, `Năm khác` and its colon, the years;
  - `Tuổi {chi}`, `Vận hạn năm {canChi} {year}`, `Sinh năm: {years}`, `Lưu Niên Vận Thế` and the overview paragraphs;
  - `Vận Thế Luận Giải`, the aspect labels, `n trên 5 sao`, every point, `Xem chi tiết ›`, `Thu gọn`;
  - `Vận Hạn Từng Tuổi`, `Khám phá vận hạn chi tiết theo từng năm sinh của tuổi {chi}`, each can chi, `Sinh năm {year}`, the element, `Nam`, `Nữ` and both readings;
  - the not-published title `Tuổi {chi}` and `Vận hạn của tuổi {chi} chưa được cập nhật. Vui lòng quay lại sau.`.

  The route files under `routes/_site/van-han.*`, `van-han-zodiac-head.ts`, `van-han-paths.ts`, `van-han-view.ts`, `map-van-han.ts`, `load-van-han-year-page.ts`, `services/van-han-service.ts`, `tools/seo-routes.mjs` and `tools/van-han-years.mjs` are not touched. The only new attribute values are `aria-expanded` on the aspect toggle and `aria-current="page"` on the picked tile, which TanStack's `Link` already sets.

- **Existing specs pass without edits:** `van-han-zodiac-page`, `van-han-paths`, `van-han-view`, `van-han-zodiac-head`, `load-van-han-year-page`, `van-han-routes`, every `ngay-tot` spec (after the `StarRating` move), `tet-hub-page`, `mobile-nav-bar`, `site-layout`, `tokens`, `primitives` and `font-weights`. New tests only add files or cases. New cases in `van-han-zodiac-page.spec.tsx` reuse its `renderZodiacPage` helper and the `__fixtures__/van-han-current.ts` fixture, whose year 2026 is Bính Ngọ.
- **Fonts.** Introduce no weight or face that `/` does not already use:
  - Be Vietnam Pro at `font-normal`, `font-semibold` and `font-bold`. `font-bold` renders at 600, so weight cannot carry a state.
  - Inter Tight only as `DisplayTitle` Sans or `font-display font-extrabold` (800, preloaded).
  - Playfair only as `TitleFace.Serif` / `font-emphasis font-bold`, or as `Emphasis`.
  - Today's `font-medium` (`van-han-page.tsx:14`, `van-han-zodiac-page.tsx:39`, `van-han-year-switch.tsx:32`) goes.
- **Images.** The pages request no image other than the logo and the 12 emblems, until Task 7 adds the painting from 768 px. Ornament is the geometry kit, `aria-hidden`. Icons are lucide components. No Chinese character appears as text or inside an image.
- **Contrast.** Text is never dimmed with opacity (`text-*/NN`, `opacity-*` on text). Every text/background pair is ≥ 4.5:1 and every graphic that carries meaning is ≥ 3:1. The pairs this plan uses are already pinned in `tokens.spec.ts` (ink, ink-soft on `day` and `day-200`; ink on gold; ink on the `gold/10` spotlight tint; day, day-soft and dawn on night). Any new pair gets a case there first.
- **State marks** use `inset-ring-*`. A plain `ring-*` on an element that also has `FOCUS_RING_CLASS` is erased by the focus ring (#203). No state is colour-only.
- **No motion**, no `backdrop-blur`, no scroll-driven entrance and no hover transform.
- **No focus code.** The pages have no hash targets. If one is added later, `src/app/focus-hash-target-on-render.ts` already focuses it once.
- **Mobile bar.** The bottom bar is 68 px plus the safe area, and `SiteLayout` reserves it. The picker (last on a con giáp page) and the picker (on the list page) must end above it at 320 × 568.
- **Prerender.** A published year gets its pages and sitemap entries only at the next frontend build, from `tools/van-han-years.mjs` reading `/van-han/years`. Both A/B builds must read the same API, so their route lists match.
- **Worktrees:** prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>`, or it runs the main checkout's code. Never stop the dev servers on 4200 and 3000.
- **Gate:** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx affected -t lint typecheck test`. Task 3 moves `StarRating`, which Ngày tốt imports. Then the local Lighthouse A/B (Task 6). After deploy, both pages must be at or above their Task 0 production medians, with Accessibility ≥ 95, SEO 100 and CLS 0.

## Review Focus

1. **Layout at 320, 390, 640, 1024 × 700 and 1440 × 900**, on the list page, a con giáp page with three published years and the not-published state.
   - No horizontal overflow. The long h1 (`Vận hạn tuổi Tuất năm Bính Ngọ 2026`) wraps without hyphen clipping, and the facts line wraps between items, not inside them.
   - The picker is 4 / 6 / 12 columns and every tile is at least 44 px.
   - Birth-year cards stack below `md` and put Nam and Nữ side by side from `md`.
2. **Every state reads without colour alone, and no text is faded:** the picked con giáp (inset ring and `aria-current`), the year shown (filled pill vs outlined links, `aria-current`), star ratings (filled vs outlined), the aspect toggle (`aria-expanded` and its text) and Nam / Nữ (labels). Each has a test that asserts its non-colour mark.
3. **Content and SEO are frozen.**
   - The prerendered `index.html` of `/van-han`, `/van-han/tuoi-ty` and `/van-han/<year>/tuoi-ty` holds every string from the content list, with byte-identical `<head>`s against the A build.
   - The sitemap's vận hạn entries are identical, and `/van-han/tuoi-*` stays canonical to the year path while a year is published.
4. **Images and LCP.**
   - Today a con giáp page loads a 350–420 KB hero PNG with a Chinese seal, up to nine 150–170 KB coins (one per aspect and per birth year) and a cloud. After this PR it loads the logo and 37 KB of emblems.
   - The mobile LCP element is the h1 on every page. After Task 7, at 1440 × 900, it is still the h1, not the painting.
   - No woff2 that `/` does not request.
5. **Keyboard.** Tab reaches the way back, the Tết link, every year, every aspect toggle and all 12 tiles, with the two-tone ring visible on Night and on Day. The picked tile's inset ring and the toggle stay visible while focused.

---

### Task 0: Baseline

- [ ] **Step 1: Measure production before any change.** Use `npx -y lighthouse@12.8.2`, not the globally installed 13.x, whose scores are not comparable with baseline.md. Measure two URLs: `/van-han` and the canonical con giáp page of the current year, `/van-han/<year>/tuoi-ngo` (take `<year>` from the live sitemap):

  ```
  npx -y lighthouse@12.8.2 https://www.xemtuvimienphi.top/van-han --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=<scratchpad>/lh-van-han-a-<n>.json --chrome-flags="--headless=new"
  ```

  Run each 10 times and record the median Performance, Accessibility, Best Practices, SEO, LCP, CLS, TBT and bytes transferred in the SDD ledger. Also record the LCP element and the failing accessibility audits by id.
  - Expected: numbers recorded. The 2026-11-06 baseline for `/van-han` was 77 / 96 / LCP 4.7 s; this run is the binding one.

- [ ] **Step 2: Build the "A" side.** From a separate worktree at the current `origin/dev`, run `NX_WORKSPACE_ROOT_PATH=<a-worktree> pnpm nx build @org/frontend` against the production API, and keep its `dist/apps/frontend` for the A/B in Task 6. Record the list of `van-han/**/index.html` files it prerendered.

### Task 1: List page and the con giáp picker

**Files:**

- Modify: `features/van-han/pages/van-han-page.tsx`, `features/van-han/components/zodiac-picker.tsx`
- Test: `features/van-han/pages/van-han-page.spec.tsx` (new), `features/van-han/components/zodiac-picker.spec.tsx` (new)

**Interfaces:**

- Consumes: `PageHero` (no breadcrumb, no eyebrow, no painting), `Emphasis`, `TextLink`, `FOCUS_RING_CLASS`, and `conGiapEmblem(chi: number): string` from `features/tet-hub/tet-hub-paintings.ts`. The chi index is the position in `ZODIAC_CHI`, which runs Tý → Hợi like `CHI`.
- Produces: `ZodiacPicker({ year?: number }): ReactElement`, signature unchanged.

  ```ts
  const EMBLEM_SIZE = 48;
  const PICKED_TILE_CLASS = 'bg-gold/10 inset-ring-2 inset-ring-ink';
  ```

- Spec helper, both files: `renderAt(path: string, ui: ReactElement): void` mounts `ui` under a memory router with `/van-han`, `/van-han/$slug` and `/van-han/$year/$slug` routes, the way `van-han-zodiac-page.spec.tsx` does.

- [ ] **Step 1: Write the failing tests.**
  - `van-han-page.spec.tsx`:
    - `opens with a Night hero holding the only h1`: there is one h1, its text content is `Vận Hạn`, and its closest `section` has `bg-night`. The lead is inside that section.
    - `accents Hạn in the h1`: the h1's `.italic` child has the text `Hạn` and the class `text-dawn`.
    - `links the Tết hub from the hero`: the link `Tử vi 2027 theo tuổi` is inside the hero section, points at `/kien-thuc/tu-vi-2027`, and has `min-h-11` and the `FOCUS_RING_CLASS` tokens.
    - `lists the 12 con giáp on a Day zone below the hero`: the navigation `Chọn con giáp` has 12 links, its closest `section` has `bg-day`, and the hero section does not contain it.
  - `zodiac-picker.spec.tsx`:
    - `shows each con giáp's gold emblem, decoratively`: 12 `img`s, each with `alt=""`, `loading="lazy"`, `width="48"` and `height="48"`. The first `src` ends with `/tet/emblem/tuoi-ty-128.webp` and the last with `/tet/emblem/tuoi-hoi-128.webp`.
    - `marks the con giáp being read with a ring, not colour alone`: at `/van-han/tuoi-ty`, the `Tý` link has `aria-current="page"`, `inset-ring-2` and `inset-ring-ink`. No other link has `aria-current` or `inset-ring-2`.
    - `keeps the ring under keyboard focus`: the picked link's class has no plain `ring-2` token, so `FOCUS_RING_CLASS`'s `ring-4` cannot replace it.
    - `gives every con giáp a 44 px target and the focus ring`: every link has `min-h-11` and the `FOCUS_RING_CLASS` tokens.
    - `draws no zodiac PNG and no CSS filter`: no `img` `src` contains `/zodiac/`, and no element has a `style` attribute.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- van-han-page zodiac-picker`. Expected: FAIL (no Night section, zodiac PNGs, inline filter).
- [ ] **Step 3: Implement.**
  - **Page:** `<main className="w-full bg-day">`, then `PageHero` with `title={<>Vận <Emphasis isAccent>Hạn</Emphasis></>}`, the lead, and the `TextLink` as its child. Then `<section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">` holding the picker.
  - **Picker:** `<ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">`. Each link is `flex min-h-11 flex-col items-center gap-2 rounded-xl px-1 py-3 text-sm font-semibold text-ink no-underline hover:bg-day-200` with `FOCUS_RING_CLASS`, plus `PICKED_TILE_CLASS` through the `Link` render prop's `isActive`. The emblem is `size-12 rounded-full`.
  - `SPARKLE_POSITIONS`, `Sparkle`, the `RED_ICON_STYLE` import and the `zodiacIconPath` import go.
- [ ] **Step 4: Run the tests again, plus the existing `van-han-zodiac-page` spec.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(van-han): open the list page with a night hero and gold con giáp emblems`.

### Task 2: Con giáp page shell and the year switch

**Files:**

- Create: `features/van-han/components/van-han-facts.tsx`
- Modify: `features/van-han/pages/van-han-zodiac-page.tsx`, `features/van-han/components/van-han-year-switch.tsx`, `features/van-han/components/van-han-detail.tsx` (the `HeroCard` facts move out; the rest is Task 3)
- Test: `features/van-han/pages/van-han-zodiac-page.spec.tsx` (new cases only)

**Interfaces:**

- Produces:

  ```ts
  export function VanHanFacts(props: {
    readonly chi: ZodiacChi;
    readonly year: number;
    readonly birthYears: readonly number[];
  }): ReactElement;
  export function VanHanDetail(props: {
    readonly chi: ZodiacChi;
    readonly fortune: VanHanFortune;
  }): ReactElement;
  ```

  `VanHanDetail` loses `currentYear`, which only fed the facts. `VanHanFacts` renders the three existing strings as three `<p>`s in a `flex flex-wrap gap-x-3 gap-y-1` row, separated by `aria-hidden` `·` spans. `Tuổi {chi}` is `font-display font-extrabold text-dawn`; the other two are `text-day-soft`.

- `VanHanYearSwitch` keeps its signature and its `null` below two years.

  ```ts
  const YEAR_LINK_CLASS =
    'inline-flex min-h-11 items-center rounded-full border border-day/30 px-4 text-sm font-semibold text-day no-underline hover:border-gold';
  const SHOWN_YEAR_CLASS =
    'inline-flex min-h-11 items-center rounded-full bg-gold px-4 text-sm font-bold text-ink';
  ```

- [ ] **Step 1: Write the failing tests** in `van-han-zodiac-page.spec.tsx`, under a new `describe('in D3', …)`:
  - `opens with a Night hero holding the title, the way back and the Tết link`: the h1's closest `section` has `bg-night`, and the links `← Vận hạn 12 con giáp` and `Tử vi 2027 tuổi Tý` are inside it. Both have the `FOCUS_RING_CLASS` tokens.
  - `states the con giáp, the year and the birth years in the hero`: `Tuổi Tý`, `Vận hạn năm Bính Ngọ 2026` and `Sinh năm: 1972, 1984, 1996, 2008, 2020` are inside the hero section, and each appears once on the page.
  - `switches years from pills in the hero`: with `publishedYears: [2028, 2027, 2026]`, the navigation `Năm khác` is inside the hero. Its two links have `min-h-11` and `border`. The `2026` element has no `href`, has `bg-gold` and `text-ink`, and keeps `aria-current="true"`.
  - `sets the reading on a Day zone below the hero`: the heading `Lưu Niên Vận Thế`'s closest `section` has `bg-day`, and the hero does not contain it.
  - `puts the con giáp picker after the readings`: the navigation `Chọn con giáp` follows the heading `Vận Hạn Từng Tuổi` (`compareDocumentPosition` has `DOCUMENT_POSITION_FOLLOWING`).
  - `keeps the not-published note on the Day zone with no facts in the hero`: with `current: null, publishedYears: []`, `chưa được cập nhật` is inside a `bg-day` section, the hero holds no `Sinh năm`, and there is no `Năm khác` navigation.
  - `loads no image but the con giáp emblems`: every `img` `src` contains `/tet/emblem/`.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- van-han-zodiac-page`. Expected: the new cases FAIL; the seven existing ones still pass.
- [ ] **Step 3: Implement.**
  - **Page:** `<main className="w-full bg-day">`. `PageHero` gets `breadcrumb` = the back `TextLink`, `title` = `vanHanZodiacTitle(chi, current)`, and as children: `VanHanFacts` when `view` exists, the Tết `TextLink`, and `VanHanYearSwitch` when `current` exists.
  - Then `<section className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">` holding `VanHanDetail` or `VanHanDetailEmpty`, then `ZodiacPicker year={yearInPath}`.
  - **Year switch:** `flex flex-wrap items-center gap-2`. "Năm khác:" is `text-sm text-day-soft`. The shown year is a `span` with `SHOWN_YEAR_CLASS` and `aria-current="true"`; the others are `Link`s with `YEAR_LINK_CLASS` and `FOCUS_RING_CLASS`.
  - Delete `HeroCard` from `van-han-detail.tsx`. Its overview part moves into `VanHanDetail` in Task 3.
- [ ] **Step 4: Run the van-han tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(van-han): put the title, facts and year switch in a night hero`.

### Task 3: Overview, aspects and the shared star rating

**Files:**

- Move: `features/ngay-tot/components/star-rating.tsx` → `design-system/StarRating.tsx`, exported from `design-system/index.ts`
- Modify: `features/ngay-tot/components/hour-quality-list.tsx`, `features/ngay-tot/components/hour-detail-dialog.tsx` (import path only), `features/van-han/components/van-han-detail.tsx`
- Test: `features/van-han/components/van-han-detail.spec.tsx` (new), `design-system/primitives.spec.tsx` (new case)

**Interfaces:**

- Produces: `StarRating({ rating, className }: { readonly rating: number; readonly className?: string }): ReactElement`, unchanged apart from its file. It keeps its own `MAX_RATING` rather than importing `VAN_HAN_MAX_RATING`, because Ngày tốt's ratings are not vận hạn data.
- Spec fixture: `LONG_ASPECT_ENTRY = { ...TY_ENTRY, luanGiai: [{ aspect: 'Tài Vận', rating: 2, body: 'Tiền vào đều. Nên giữ tiền. Tránh cho vay. Cuối năm khá hơn. Đầu tư nhỏ.' }] }`, rendered with `<VanHanDetail chi="Tý" fortune={toVanHanFortune(LONG_ASPECT_ENTRY)} />`. The default case renders `toVanHanFortune(TY_ENTRY)`.

- [ ] **Step 1: Write the failing tests.**
  - `primitives.spec.tsx`: `rates by shape, not by opacity`: `<StarRating rating={3} />` has the image name `3 trên 5 sao`, three stars with `fill-gold text-ink`, two with `fill-transparent text-ink-soft`, and no class containing `opacity` or `/`.
  - `van-han-detail.spec.tsx`:
    - `titles the three sections with serif h2s`: the h2s, in order, are `Lưu Niên Vận Thế`, `Vận Thế Luận Giải` and `Vận Hạn Từng Tuổi`, and each has `font-emphasis`.
    - `sets the yearly overview in the reading zone`: both overview paragraphs are inside an element with `max-w-reading` and `text-reading`.
    - `names each aspect in an h3 with its rating`: the h3 `Công danh` is in the same card as the image `4 trên 5 sao`.
    - `shows three points, then the rest behind a toggle that says whether it is open`: with `LONG_ASPECT_ENTRY`, the card has 3 `listitem`s and a button `Xem chi tiết ›` with `aria-expanded="false"`, `min-h-11` and the `FOCUS_RING_CLASS` tokens. After a click it has 5 `listitem`s and the button reads `Thu gọn` with `aria-expanded="true"`.
    - `gives every aspect the same card, without coins or gradients`: there is no `img`, and no class starts with `bg-gradient`, `bg-linear` or `text-[`.
    - `does not animate the cards in`: no class contains `animate-`, `fade-in` or `slide-in`, and no element has a `style` attribute.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- van-han-detail primitives`. Expected: the detail cases FAIL; the primitive case fails until the move.
- [ ] **Step 3: Implement.**
  - Move `StarRating` with `git mv` and fix the two Ngày tốt imports.
  - **Overview:** `<section>` with a serif `DisplayTitle` h2 `Lưu Niên Vận Thế`, then `ReadingZone` holding the paragraphs with `flex flex-col gap-4`.
  - **Aspects:** a serif h2, then `grid gap-4 md:grid-cols-2`. Each card is `<article className="flex flex-col gap-3 rounded-2xl border border-ink/15 bg-day p-5">`: a header row with the h3 (`font-display text-xl font-extrabold text-ink`) and `StarRating`, a `<ul className="list-disc pl-5 marker:text-ink-soft">` of `text-base leading-relaxed text-ink` points, and the toggle (`inline-flex min-h-11 items-center rounded-full border border-ink/30 px-4 text-sm font-semibold text-ink hover:border-ink` with `FOCUS_RING_CLASS` and `aria-expanded`).
  - `SectionTitle`, `AspectRating`, `CARD_ENTER`, `CARD_STAGGER_MS` and the `aspectTheme` import go.
- [ ] **Step 4: Run the van-han and ngay-tot tests.** Expected: all pass, the Ngày tốt ones unedited.
- [ ] **Step 5: Commit** `feat(van-han): set the overview and aspects on day with shape-marked ratings`. The body says why `StarRating` moved.

### Task 4: Birth-year cards, the empty state and the mệnh lookup

**Files:**

- Create: `features/van-han/menh-element.ts`
- Modify: `features/van-han/components/van-han-detail.tsx`
- Test: `features/van-han/menh-element.spec.ts` (new), `features/van-han/components/van-han-detail.spec.tsx` (new cases)

**Interfaces:**

- Produces:

  ```ts
  export const MENH_ELEMENTS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'] as const;
  export type MenhElement = (typeof MENH_ELEMENTS)[number];
  export function elementOfMenh(menh: string): MenhElement;
  ```

  The behaviour is `van-han-theme.ts:86-90` unchanged: the last word if it names an element, otherwise Thổ. The `as ElementName` cast becomes a type guard, `isMenhElement(value: string): value is MenhElement`.

- [ ] **Step 1: Write the failing tests.**
  - `menh-element.spec.ts`:
    - `reads the element from the last word of the mệnh`: `Hải Trung Kim` → `Kim`, `Thiên Hà Thủy` → `Thủy`, `Lư Trung Hỏa` → `Hỏa`.
    - `falls back to Thổ for a mệnh it cannot read`: `''` → `Thổ` and `Thiên Hà Thuỷ` → `Thổ`. This pins today's behaviour; the second case documents the accent risk in Decision 13.
  - `van-han-detail.spec.tsx`:
    - `heads each birth year with its can chi, year and element`: `Giáp Tý` has `font-display` and `font-extrabold`, `Sinh năm 1984` is present, and `Kim` has `bg-day-200` and `text-ink`.
    - `tells Nam and Nữ apart by their labels, in the same ink`: `Nam` and `Nữ` both have `text-ink`. No class in the card contains `rose`, `violet`, `green`, `sky`, `orange`, `amber` or `uppercase`.
    - `keeps both readings in full`: `Nam mạng gặp sao Kế Đô.` and `Nữ mạng gặp sao Thái Dương.` are present.
    - `titles the empty state with the con giáp and says when to come back`: `<VanHanDetailEmpty chi="Tý" />` shows `Tuổi Tý` with `font-emphasis` and the full sentence, on a `bg-day-200` tile with `min-h-60`, and no `❖`.
- [ ] **Step 2: Run them.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- menh-element van-han-detail`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Birth-year card:** `<article className="flex flex-col gap-4 rounded-2xl border border-ink/15 bg-day p-5 md:flex-row md:gap-6">`. The lead block is `md:w-60 md:shrink-0` with the can chi, `Sinh năm …` in `text-sm text-ink-soft` and the element pill `rounded-full bg-day-200 px-2.5 py-0.5 text-xs font-semibold text-ink`.
  - **Gender column:** `flex-1 md:border-l md:border-ink/15 md:pl-5`. The label row is an `aria-hidden` `size-6 rounded-full bg-ink text-day` disc with `User`, then the label in `text-sm font-bold text-ink`. The reading is `text-base leading-relaxed text-ink`.
  - **Empty state:** `flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl bg-day-200 px-4 py-12`, with `Tuổi {chi}` in `font-emphasis text-2xl font-bold text-ink` and the sentence in `text-center text-base text-ink`.
  - Delete `VanHanDetailLoader`, which nothing renders.
- [ ] **Step 4: Run the van-han tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(van-han): restyle the birth-year readings without element colours`.

### Task 5: Media clean-up and the lint guard

**Files:**

- Delete: `features/van-han/van-han-theme.ts`
- Modify: `apps/frontend/src/config/media.ts`, `apps/frontend/src/lib/zodiac-icons.ts`, `apps/frontend/eslint.config.mjs`
- Test: `features/van-han/van-han-fonts.spec.ts` (new)

- [ ] **Step 1: Write the test.** `van-han-fonts.spec.ts` walks every non-spec `.ts`/`.tsx` under `features/van-han`, the way `ngay-tot-fonts.spec.ts` does.
  - `uses only the weights the home page loads`: no string literal contains `font-medium`, `font-light` or `font-black`, or `font-extrabold` without `font-display`.
  - `sets italics only in the preloaded Playfair`: every string literal containing `italic` also contains `font-emphasis`.
  - `takes images only from the Tết hub kit`: no file imports `@/config/media` or names `zodiacIconPath`, and no string literal ends in `.png`.
  - `writes no Chinese characters`: no file matches `/\p{Script=Han}/u`.
- [ ] **Step 2: Run it.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx test @org/frontend -- van-han-fonts`. Expected: it FAILS on `van-han-theme.ts` (`HAN_BY_CHI`, `@/config/media`), which proves it bites.
- [ ] **Step 3: Remove the dead code.**
  - Delete `van-han-theme.ts`.
  - In `media.ts`, delete `vanHanHeroUrl`, `vanHanCoinUrl` and `zodiacIconUrl`. Keep `MEDIA.vanHan.decorCloud` (`settings/components/profile-card.tsx:34`) and `MEDIA.laSo.luopan` (`kien-thuc-data.ts:53,133`, `kien-thuc-hero.tsx:43`).
  - In `zodiac-icons.ts`, delete `zodiacIconPath`, `normalizeChi`, `CHI_ALIASES` and the `media` import. `ZODIAC_CHI` and `ZodiacChi` stay.
  - Add `'src/features/van-han/**'` to `MIGRATED_FILES`.
- [ ] **Step 4: Prove nothing still points at them.** `rg "van-han-theme|vanHanHeroUrl|vanHanCoinUrl|zodiacIconUrl|zodiacIconPath|normalizeChi|RED_ICON_STYLE|HAN_BY_CHI|VanHanDetailLoader" apps/frontend/src` returns nothing.
- [ ] **Step 5: Run the gate.** `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx affected -t lint typecheck test`. Expected: lint has 0 errors, so the guard finds no hex and no `[Npx]` in `features/van-han`. Typecheck and every test pass, including the unedited van-han, ngay-tot, tet-hub and layout specs.
- [ ] **Step 6: Commit** `refactor(van-han): drop the painted heroes and coins and put the pages under the style guard`. The body says the files under `public/van-han/` and `public/zodiac/` stay for Phase 4, and that `lib/zodiac-icons.ts` keeps its name because an existing spec imports it.

### Task 6: Verification without the painting

- [ ] **Step 1: Build and prerender.** Run `NX_WORKSPACE_ROOT_PATH=<worktree> pnpm nx build @org/frontend` against the same API as Task 0.
  - Expected: the list of `dist/apps/frontend/van-han/**/index.html` files equals the A build's.
  - Expected: `van-han/index.html` contains `Vận`, `Hạn`, the lead and the 12 chi names. `van-han/<year>/tuoi-ty/index.html` contains the title, `Lưu Niên Vận Thế`, the overview's first sentence, every aspect label and every can chi.
  - Expected: each `<head>` is byte-identical to the A build's. Diff them. The vận hạn lines of `sitemap.xml` are identical too.
- [ ] **Step 2: Visual check** in the dev server (reuse the running one) at 320, 390, 640, 1024 × 700 and 1440 × 900, on the list page and a con giáp page of a published year. The not-published state shows on `/van-han/tuoi-ty` only while the backend has no published year; if the local database has one, the Task 2 spec is its only check, and the report says so.
  - Expected: `document.documentElement.scrollWidth === innerWidth` at every width.
  - Expected: every state in Review Focus 2 is distinguishable in a greyscale screenshot (DevTools → Rendering → Emulate vision deficiency → Achromatopsia).
  - Expected: Tab order follows Review Focus 5, with the ring visible on Night and on Day.
  - Expected: at 320 × 568 the picker ends above the bottom bar.
  - Screenshots go to the scratchpad for Kim An.
- [ ] **Step 3: Fonts and images.** Open DevTools Network on `/`, `/van-han` and a con giáp page.
  - Expected: the woff2 files each vận hạn page requests are a subset of those `/` requests.
  - Expected: no `image/*` other than the logo and the 12 emblems.
- [ ] **Step 4: Local Lighthouse A/B.** Serve the A build and this branch's build side by side with `vite preview`, each on its own port (never 4200; check `--help` for the flags). `vite preview` serves a prerendered page only with a trailing slash, so measure `/van-han/` and `/van-han/<year>/tuoi-ngo/`. Run `npx -y lighthouse@12.8.2` mobile on each, 10 runs interleaved A, B, A, B, on the same machine in one sitting. Report the medians.
  - Expected: B's Performance ≥ A's, CLS 0, SEO 100, Best Practices ≥ A's, and Accessibility ≥ 95 and ≥ A's.
  - Expected: the LCP element is the h1 on both pages, and B transfers less than half of A's bytes on the con giáp page.
  - Also run one desktop pass (`--preset=desktop`) of each page on B, for Task 7's comparison.
  - If B is lower on Performance, find the cause (a font file, a long task) before going further.
- [ ] **Step 5: Final review** by a fresh reviewer on the whole branch, with this Review Focus. Fix Critical and Important findings test-first.

### Task 7: The con giáp painting (only if Task 6 passes)

**Files:**

- Modify: `features/van-han/pages/van-han-zodiac-page.tsx`
- Test: `features/van-han/pages/van-han-zodiac-page.spec.tsx` (new case)

**Interfaces:**

- Consumes: `conGiapPainting(chi: number): PagePainting` from `features/tet-hub/tet-hub-paintings.ts`, and `PageHero`'s `painting` prop, which already renders the image only from `md`, lazy, with `fetchPriority="low"` and a Night wash.

- [ ] **Step 1: Write the failing test.** `paints the con giáp behind the hero from tablet up`: the hero holds one `img` whose `srcset` contains `/tet/con-giap/tuoi-ty-768.webp 768w` and `/tet/con-giap/tuoi-ty-1536.webp 1536w`, with `alt=""`, `loading="lazy"` and the class `hidden md:block`.
- [ ] **Step 2: Run it.** Expected: FAIL. The Task 2 case `loads no image but the con giáp emblems` now fails too; widen it in this commit to allow `/tet/con-giap/`, and say so in the commit body. It is a test this PR added, not an existing one.
- [ ] **Step 3: Implement.** Pass `painting={conGiapPainting(orderOfChi(chi) - 1)}`. `orderOfChi` (`van-han-view.ts:10`) is already exported and 1-based; reusing it avoids a third copy of the `ZODIAC_CHI` lookup without touching `van-han-paths.ts`.
- [ ] **Step 4: Measure.** Rebuild, then run the desktop pass of Task 6 Step 4 on `/van-han/<year>/tuoi-ngo/` 10 times.
  - Expected: the LCP element is still the h1, Performance within 2 points of the Task 6 desktop median, CLS 0. At 390 px the painting is not requested.
  - Text over the painting is checked by sampling its 90th-percentile pixel behind the h1 and the facts line: at least 4.5:1 for the facts, 3:1 for the h1.
  - If any check fails, drop this commit and report the numbers to Kim An.
- [ ] **Step 5: Commit** `feat(van-han): paint each con giáp behind its hero from tablet up`.

After "tạo pull" and the merge: run the Task 0 measurement again on production (10 runs each, `lighthouse@12.8.2`) and report both medians next to the A/B. Then check that a year published after the deploy appears only after the next frontend build, as before.

## Follow-ups (not in this PR)

- `BreadcrumbList` JSON-LD on the con giáp pages and an `Article` block, with the head changes they need.
- Rename `lib/zodiac-icons.ts` to `lib/zodiac-chi.ts` and update `van-han-paths.spec.ts` with it.
- Accept both accent spellings of Thủy/Hỏa in `elementOfMenh`, or have the admin console normalise mệnh on save.
- `ngay-tot-fonts.spec.ts` and `van-han-fonts.spec.ts` share their walker. A third feature guard should extract it.
