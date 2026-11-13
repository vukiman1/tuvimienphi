# Phase 3 — Tết hub in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the 74 Tết 2027 hub pages (`/kien-thuc/tu-vi-2027`, 12 con giáp pages, 61 tuổi năm pages) from the old hex palette to D3, without changing a word of their content, their URLs or their head tags.

**Architecture:** The hub pages are articles, not story pages. They keep the ordinary Day header, with no chapter rail and no sticky CTA. Each page opens with a Night **page hero** (breadcrumb, eyebrow, h1, ornament), a new design-system primitive. The body is a Day reading zone. Two showcase pieces stay dark: the tuổi năm summary panel and the CTA panel. Only `className`s and a few wrappers change. Data, routes, loaders, JSON-LD and copy stay as they are.

**Tech Stack:** React 19, TanStack Router, Tailwind v4 tokens from `design-system/tokens.css`, Jest + Testing Library.

**Spec:** [design.md](../design.md), "Visual identity — D3" (two zones per page, asset kit) and [tet-2027-hub-design.md](../tet-2027-hub-design.md), "Visual design".

## Global Constraints

- Tokens only. No hex values, no `text-[Npx]`, and no comments. `src/features/tet-hub/**` joins `MIGRATED_FILES` in `apps/frontend/eslint.config.mjs`, so the `local/no-ad-hoc-style` guard proves it.
- Content is frozen. Every h1, h2, paragraph, link label, anchor id (`tong-quan`, `nam-mang`, `nu-mang`, …), breadcrumb and JSON-LD stays byte-identical. The existing page specs are the proof and must pass **without edits**.
- The h1 is the LCP element. It uses the Sans face (Inter Tight 800) and, where it has one, an `Emphasis` (Playfair 600 italic). Both are preloaded on every page. Never put the h1 in `TitleFace.Serif`: Playfair 700 is not preloaded.
- No paintings in this PR. design.md allows illustrations only after a page passes its gates without them. The hero ornament is the existing `Orbit` SVG, `aria-hidden`.
- No motion. Reading zones have none, and the hero is static.
- AA contrast for every text/background token pair used. Pairs not already in `tokens.spec.ts` get a test.
- **Gate:** `pnpm nx run-many -t lint typecheck test -p @org/frontend`, then a local Lighthouse run (Task 5). After deploy, the hub and a tuổi năm page must be at or above their pre-migration production score (measured in Task 0), with Accessibility 100, SEO 100 and CLS 0.

## Review Focus

1. **The longest h1 at 320 px** ("Tử vi tuổi Canh Thìn 2000 năm 2027" in `DisplaySize.Chapter`): no horizontal overflow and no word broken mid-syllable. Pinned by a test in Task 1 and a screenshot in Task 5.
2. **Deep links to `#nam-mang` / `#nu-mang`** from search results. The section must land below the Day header, not under it. Covered by `scroll-mt` and checked in Task 5.
3. **The sticky summary at 1024×700.** Taller than the viewport, it must not hide its last rows. Sticky only when it fits (Task 4).
4. **A con giáp or tuổi năm page whose article is missing** renders `TetHubNotFound` in D3 and keeps `noindex`. Covered by the existing not-found specs, restyled in Task 2.
5. **Keyboard focus on every tile and link**, on both the Night and Day surfaces. `FOCUS_RING_CLASS` is applied and the ring stays visible on Night (Task 2 test).

---

### Task 0: Baseline

- [ ] **Step 1: Measure production before any change**

Run Lighthouse mobile, 5 runs each, on `https://tuvimienphi.com/kien-thuc/tu-vi-2027` and `/kien-thuc/tu-vi-2027/tuoi-binh-dan-1986`. Record the median Performance, LCP, CLS and the LCP element in the SDD ledger.
Expected: numbers recorded. The memory says about 81 / LCP 4.1 s after #182; this run is the binding baseline.

### Task 1: Design-system additions

**Files:**

- Create: `apps/frontend/src/design-system/PageHero.tsx`
- Modify: `apps/frontend/src/design-system/TextLink.tsx`, `apps/frontend/src/design-system/index.ts`
- Test: `apps/frontend/src/design-system/primitives.spec.tsx`, `apps/frontend/src/design-system/tokens.spec.ts`

**Interfaces:**

- Produces:

  ```ts
  interface PageHeroProps {
    readonly breadcrumb: ReactNode;
    readonly eyebrow: string;
    readonly title: ReactNode;
    readonly lead?: string;
    readonly children?: ReactNode;
  }
  export function PageHero(props: PageHeroProps): ReactElement;
  ```

  `TextLink` gains `readonly search?: LinkProps['search']`, passed through to `Link`.

- [ ] **Step 1: Write the failing tests** in `primitives.spec.tsx`:
  - `page hero renders a Night band with the title as the only h1`: `getByRole('banner'…)` is not used (the site header owns `banner`). Instead the wrapper `<section>` has `bg-night` and `text-day`, and `getAllByRole('heading', { level: 1 })` has length 1 with the given title.
  - `page hero ornament is hidden from assistive tech`: the `svg` inside has `aria-hidden="true"`.
  - `page hero title uses the preloaded sans face`: the h1 has `font-display` and not `font-emphasis`.
  - `page hero keeps the longest hub title inside 320 px`: the h1 has `text-balance` and `break-words`, and the content wrapper has `min-w-0`. jsdom has no layout, so the real width is checked in Task 5.
  - `text link forwards search params`: `<TextLink to="/" search={{ gender: 'nam' }}>` renders an `href` containing `gender=nam`.
- [ ] **Step 2: Write the failing contrast tests** in `tokens.spec.ts`, using `contrastRatio`: `day-soft` on `night` ≥ 4.5, `dawn` on `night` ≥ 4.5, `ink-soft` on `day-200` ≥ 4.5, `day` on `deep` ≥ 4.5. Skip any pair that the spec already covers.
- [ ] **Step 3: Run them** with `pnpm nx test @org/frontend -- primitives tokens`. Expected: the PageHero and TextLink tests FAIL (module or prop missing). Contrast tests may already pass, since they only pin values.
- [ ] **Step 4: Implement `PageHero`.**
  - Full-bleed `<section className="bg-night text-day">` with an inner `mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16`.
  - Order: breadcrumb, `Eyebrow` in `text-dawn`, then `DisplayTitle as="h1" size={DisplaySize.Chapter}` (Sans), `lead` in `text-day-soft text-lg`, then `children`.
  - On the right from `md`, an `Orbit` with the same props as the wide variant in `MomentChapter`, in `text-gold/40` and `aria-hidden`.
  - `DisplayTitle` gains no new prop. Wrap it in a `min-w-0 break-words` div.
  - Add `search` to `TextLink` and export `PageHero` from `index.ts`.
- [ ] **Step 5: Run the tests again.** Expected: PASS.
- [ ] **Step 6: Commit** `feat(design-system): add the page hero and let text links carry search params`.

### Task 2: Shared hub pieces and the hub page

**Files:**

- Modify: `features/tet-hub/components/TetHubBreadcrumb.tsx`, `TetHubTile.tsx`, `TetHubCta.tsx`, `TetHubNotFound.tsx`, `ConGiapTiles.tsx`, `pages/tet-hub-page.tsx`
- Create: `features/tet-hub/tet-hub-eyebrow.ts`
- Test: `features/tet-hub/pages/tet-hub-page.spec.tsx` (new cases only)

**Interfaces:**

- Consumes: `PageHero`, `TextLink` with `search`, `CtaButton`, `CtaTone`, `Chip`, `FOCUS_RING_CLASS`.
- Produces:
  - `export const TET_HUB_EYEBROW: string`, equal to `` `Tết ${TET_HUB_VIEW_YEAR} · năm ${getYearCanChi(TET_HUB_VIEW_YEAR)}` ``.
  - `enum TileSurface { Night = 'night', Day = 'day' }` and `TetHubTile({ to, title, subtitle?, surface, children? })`.
  - `TetHubBreadcrumb` is styled for Night only, because it always sits in a hero.

- [ ] **Step 1: Write the failing tests** in `tet-hub-page.spec.tsx`:
  - `opens with a Night hero holding the breadcrumb and the h1`: the h1 and the `nav[aria-label="Đường dẫn"]` share the closest `section.bg-night`.
  - `puts the con giáp tiles on the Night hero`: the 12 tile links are inside that same section.
  - `every hub tile shows the focus ring class`: each tile link's class contains the `FOCUS_RING_CLASS` tokens.
  - `the form CTA is a gold CTA button`: the "Lập lá số của bạn" link has `bg-gold`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- tet-hub-page`. Expected: the new cases FAIL and the old cases pass.
- [ ] **Step 3: Restyle.**
  - **Breadcrumb:** `text-sm text-day-soft`, `›` separators, ancestor links `hover:text-dawn` with `FOCUS_RING_CLASS`, the current item `text-day font-semibold`.
  - **TetHubTile:**
    - Night: `border-day/20 text-day hover:border-gold`, subtitle `text-day-soft`.
    - Day: `border-ink/15 bg-day text-ink hover:border-gold`, subtitle `text-ink-soft`.
    - Both: `rounded-2xl`, title `font-display font-bold text-lg`, `FOCUS_RING_CLASS`.
  - **TetHubCta:** a `rounded-2xl bg-deep text-day` panel holding the copy and a `CtaButton tone={CtaTone.Gold}` with `to="/"`, `search` and `hash` unchanged. `TetHubGenderCta` becomes a `TextLink` with the same `search` and `hash`, label and `→`.
  - **TetHubNotFound:**
    - Day, `DisplayTitle as="h1" size={DisplaySize.Card} face={TitleFace.Serif}`. This h1 is not an LCP that matters, because the page is `noindex`.
    - Description in `text-ink-soft`, and a `TextLink` back to Kiến thức.
  - **Hub page:**
    - `PageHero` with the breadcrumb, `TET_HUB_EYEBROW` and the h1 `TET_HUB_LINK_LABEL`. Its children are `ConGiapTiles` with Night tiles, and the "Chọn con giáp của bạn" h2 in `text-xl font-bold`.
    - Below it, a Day `ReadingZone` with the intro paragraphs, the Vận hạn sentence (its link becomes a `TextLink`) and `TetHubCta`.
- [ ] **Step 4: Run the hub spec and the full hub folder.** `pnpm nx test @org/frontend -- tet-hub`. Expected: everything passes, and the pre-existing cases are unedited.
- [ ] **Step 5: Commit** `feat(tet-hub): open the hub with a night hero and restyle its tiles and CTA`.

### Task 3: Con giáp page

**Files:**

- Modify: `features/tet-hub/components/ArticleSection.tsx`, `ConGiapYearTiles.tsx`, `HowWeCount.tsx`, `pages/con-giap-page.tsx`
- Delete: `features/tet-hub/components/TetHubChip.tsx`, replaced by the design-system `Chip`
- Test: `features/tet-hub/pages/con-giap-page.spec.tsx` (new cases only)

**Interfaces:**

- Consumes: `PageHero`, `TetHubTile` with `TileSurface.Day`, `TET_HUB_EYEBROW`, `Chip`, `ReadingZone`, `DisplayTitle`.

- [ ] **Step 1: Write the failing tests:**
  - `emphasises the con giáp in the h1`: the h1's text is unchanged, and its `.italic` child's text is the chi name.
  - `sets the article in the reading zone`: the `article` element is inside an element with `max-w-reading`.
  - `section titles use the serif face`: each article h2 has `font-emphasis`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- con-giap-page`. Expected: the new cases FAIL.
- [ ] **Step 3: Restyle.**
  - `PageHero` with title `Tử vi tuổi <Emphasis isAccent>{chiName}</Emphasis> năm {year}`.
  - The article becomes a borderless `ReadingZone` on `bg-day`.
  - `ArticleSection` uses `DisplayTitle as="h2" size={DisplaySize.Card} face={TitleFace.Serif}` and keeps `scroll-mt-6`.
  - Year tiles use `TileSurface.Day`, with the design-system `Chip` for the Nam and Nữ sao.
  - `HowWeCount` is a `rounded-2xl bg-day-200` panel with `dt` in `text-ink font-bold` and `dd` in `text-ink-soft`.
- [ ] **Step 4: Run the hub folder.** `pnpm nx test @org/frontend -- tet-hub`. Expected: all pass.
- [ ] **Step 5: Commit** `feat(tet-hub): restyle the con giáp pages as a night hero over a reading zone`.

### Task 4: Tuổi năm page and the lint guard

**Files:**

- Modify: `features/tet-hub/components/TuoiNamSummary.tsx`, `TuoiNamArticleView.tsx`, `TuoiNamFaq.tsx`, `TuoiNamRelated.tsx`, `pages/tuoi-nam-page.tsx`, `apps/frontend/eslint.config.mjs`
- Test: `features/tet-hub/pages/tuoi-nam-page.spec.tsx` (new cases only)

**Interfaces:**

- Consumes: everything above.

- [ ] **Step 1: Write the failing tests:**
  - `emphasises the can chi and birth year in the h1`: the `.italic` child's text is `Bính Dần 1986`, and the h1's full text is unchanged.
  - `shows the summary as a Night panel`: the `aside` has `bg-night`, `text-day` and `border-gold/40`.
  - `keeps the summary sticky only on tall desktop screens`: the `aside` class contains `tall-lg:sticky` and no bare `lg:sticky`.
  - `related links are Day tiles with a focus ring`: every link under "Xem thêm" has `FOCUS_RING_CLASS`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- tuoi-nam-page`. Expected: the new cases FAIL.
- [ ] **Step 3: Restyle.**
  - `PageHero` with title `Tử vi tuổi <Emphasis isAccent>{canChi} {birthYear}</Emphasis> năm {viewYear}`.
  - The body grid stays `lg:grid-cols-[minmax(0,1fr)_20rem]`, with the summary first in DOM order.
  - **Summary:**
    - `rounded-2xl border border-gold/40 bg-night text-day shadow-glow-gold`, labels in `text-dawn`.
    - Gender groups `border-gold/30 bg-deep/60`, row dividers `border-day/15`.
    - Sticky through a new custom variant, `@custom-variant tall-lg (@media (width >= 64rem) and (height >= 50rem))` in `tokens.css`, as `tall-lg:sticky tall-lg:top-6 tall-lg:self-start`.
  - **Article:** a `ReadingZone` with serif h2 (via `ArticleSection`) and gender h3 in `font-display font-bold text-xl`. Verdicts become a `dl` with `dt` in `font-bold`. The "Xem đầy đủ…" link becomes a `TextLink`.
  - **FAQ:** a serif `DisplayTitle` h2 in `Card` size, questions in `font-bold text-ink`, answers in `text-ink-soft`.
  - **Related:** Day `TetHubTile`s without subtitles. The title `Xem thêm` becomes `text-xl font-bold`.
  - Add `'src/features/tet-hub/**'` to `MIGRATED_FILES`.
- [ ] **Step 4: Run the gate.** `pnpm nx run-many -t lint typecheck test -p @org/frontend`. Expected: lint 0 errors (the guard finds no hex and no `[Npx]` left in the hub), and all tests pass.
- [ ] **Step 5: Commit** `feat(tet-hub): restyle the tuổi năm pages and put the hub under the style guard`.

### Task 5: Verification

- [ ] **Step 1: Build and prerender.** `pnpm nx build @org/frontend`. Expected: 74 hub HTML files under `dist/apps/frontend/kien-thuc/tu-vi-2027/`. Grep three of them for one paragraph each from their JSON: every match is present.
- [ ] **Step 2: Visual check** in the dev server, at 320, 390, 1024×700, 1440×900, on the hub, `tuoi-dan`, and `tuoi-canh-thin-2000`.
  - Expected: no horizontal scroll, and the h1 fits.
  - Expected: `/…/tuoi-binh-dan-1986#nu-mang` lands with the "Nữ mạng" heading fully below the header.
  - Expected: at 1024×700 the summary scrolls with the page.
  - Screenshots go to the scratchpad for Kim An.
- [ ] **Step 3: Local Lighthouse**, mobile, median of 5, on the hub and `tuoi-binh-dan-1986` in the preview build. Expected: CLS 0, Accessibility 100, SEO 100, the LCP element is the h1, and Performance at or above the Task 0 baseline.
- [ ] **Step 4: Final review** by a fresh reviewer on the whole branch, with this Review Focus. Fix Critical and Important findings test-first.

After "tạo pull" and the merge: run the Task 0 measurement again on production and report both numbers.
