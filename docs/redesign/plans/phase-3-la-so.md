# Phase 3 — Lá số in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Lá số pages from the old hex palette and raster ornaments to D3. That covers the lá số page (`/la-so/detail`: the board and the luận giải reading view) and `/la-so` (the "Lá số đã xem" history list). The board gets a mobile-first layout that keeps today's palace highlighting. No copy, URL, head tag or luận giải behaviour changes.

**Architecture:** Both pages are ordinary Day-header pages, not story pages: no chapter rail and no sticky CTA. Each opens with a Night `PageHero`. On the lá số page the hero is followed by the board on Day, then a Deep showcase band for luận giải (title, chapter tabs, motto), with the chapter itself set in a Day `ReadingZone`. The board keeps one state owner (`LaSoBoard`) and gains a pure highlight model shared by two layouts. The **full** layout is today's 812 px board scaled to fit. The **compact** layout, for containers under 640 px, is a fluid 4×4 board with a panel below it that shows the picked cung in full. Every raster image on these pages is dropped, including the per-cung paintings (`CUNG_ILLUSTRATIONS`).

**Tech Stack:** React 19, TanStack Router and Query, Tailwind v4 tokens from `design-system/tokens.css`, Jest + Testing Library.

**Spec:** [design.md](../design.md), "Visual identity — D3" (two zones per page), "Asset kit" (per-cung paintings dropped, not replaced), "Non-goals" (board restyled mobile-first, tap-to-explain out of scope) and the quality gates.

## Decisions (approved by Kim An's delegation, 2026-11-13)

1. **Scope.** This phase covers `/la-so/detail` and `/la-so`. design.md lists "lá số history" under the last step, but `/la-so` _is_ the history page: it is the nav target and it is indexable, so it moves now (Task 7). The birth form is already D3 (#186) and only lives on the home page. **No form is added to `/la-so`.** Since #196/#197 the mobile nav's centre "Lập lá số" action opens the birth form at `/#lap-la-so`, so `/la-so` stays a history list and its "Lập lá số mới" link keeps pointing at the home page.
2. **Phone board.** When the board's container is under 640 px, it renders a **compact** board: a fluid 4×4 grid whose cells show only can chi, cung name (with `<THÂN>`), chính tinh (or "vô chính diệu") and the Tiểu hạn tag, plus the Tuần/Triệt labels and the tam hợp/xung chiếu lines. Under the board, a panel shows the picked cung's full cell at natural size (every star, no new labels), followed by the full thiên bàn. From 640 px up, the board is today's 812 px board, scaled to fit.
3. **Highlighting on touch.** On the compact board the spotlight follows the tapped cung, because touch has no hover. The full board keeps today's hover/focus spotlight. On both boards the picked cung gets an ink ring; today it has no visual mark at all.
4. **Board colours from existing tokens only.**
   - Cells are `bg-day`. Spotlit cells (focused and related) are `bg-gold/10`. That is the strongest tint that keeps every `hanh-*` colour at or above 4.5:1. `gold/15` or any dawn tint fails Kim and Thổ.
   - The focused cung has a gold inset ring, rules are `ink/20`, tam hợp lines are `deep` and the xung chiếu line is `ember` (3.11:1 on the tint, which clears the 3:1 bar for graphics).
   - Board text moves onto Tailwind's 10/12/14 px steps.
   - No new tokens. A new `hanh-*` or `chart-block*` token would break the count in an existing `tokens.spec.ts` case.
5. **Luận giải.**
   - The Deep band holds the serif h2 "Luận giải lá số", the six chapter tabs and the motto.
   - Each chapter is a Day reading zone: 68ch, 17 px at 1.7 line height, left-aligned instead of justified. Chapter numerals sit in a code-drawn Night disc.
   - The chapter icons, the seal, the luopan watermark, the seam clouds, the title ornaments and the taiji are dropped. The motto separator becomes a small `Orbit`.
6. **One motion kept in the reading zone.** The staggered reveal of a freshly written article stays, because an existing spec pins it. It runs once, is opacity/transform only and is off under reduced motion. The skeleton's sweep stays too, because it moves placeholder blocks, not reading text.
7. **Media and contract clean-up.**
   - Delete `CUNG_ILLUSTRATIONS`, `luan-giai-media.ts`, `ImagePlaceholder`, `laSoIconUrl` and every `MEDIA.laSo` entry left without a consumer.
   - Remove `illustrationUrl` and `sealUrl` from `LuanGiaiArticle` in `shared-contracts`. They are presentation-only and the backend never sets them.
   - Keep `decorLeft`, `decorRight`, `luopan`, `illustrationCrane` and `sealSmall`: kiến thức and vận hạn still use them.
   - The files under `public/la-so/` stay until Phase 4 deletes unused assets.
8. **Heroes.**
   - The lá số page's hero has no breadcrumb. Its eyebrow is today's "âm dương · bản mệnh" line, moved up with no new copy, and the year picker sits in the hero.
   - The history hero has no eyebrow and keeps its h1, lead and "Lập lá số mới" link.
   - `PageHero` therefore gets an optional `breadcrumb` and an optional `eyebrow`.
   - Neither page gets a painting in this PR.
9. **History cards.** Day tiles without the bagua image. The remove button grows from 36 to 44 px.

## Global Constraints

- **Tokens only.** No hex values, no `[Npx]` and no comments. `src/features/la-so/**` replaces the two la-so file entries in `MIGRATED_FILES` (Task 7), so the `local/no-ad-hoc-style` guard proves it.
- **Content is frozen.** Every heading, label, button name, aria-label and line of copy stays byte-identical. That includes `Lá Số Tử Vi`, `Đang chọn cung …`, `Cung <name>`, `Xem luận giải`, `Các mục luận giải`, `Chưa mở`, the motto and `Lá số đã xem`. Head tags in `la-so.detail.tsx` and `la-so.index.tsx` are untouched.
- **Existing specs pass without edits.** That covers `birth-form`, `view-year-picker`, `luan-giai-article`, `luan-giai-chapter-content`, `luan-giai-skeleton`, `history-list`, `board-layout`, `to-chart-view` and `tokens`. New tests only add cases or files.
  - `luan-giai-article.spec.tsx` reads `style.animationDelay` from the paragraph found by its text. The reveal must therefore stay on the `<p>` itself, not on a wrapper.
- **Fonts.** Introduce no weight or face that the home page does not already use:
  - Be Vietnam Pro at `font-normal`, `font-semibold` and `font-bold`; `font-bold` renders at 600;
  - Inter Tight only through `DisplayTitle` Sans or an explicit `font-display font-extrabold` (800, preloaded);
  - Playfair only through `TitleFace.Serif` (700) and `Emphasis` or `font-emphasis italic font-semibold` (600 italic, preloaded).
  - Today's code uses `font-medium` (`thien-ban.tsx:14`, `la-so-board.tsx:66`) and Be Vietnam Pro italic (`luan-giai-article.tsx:131,134`). Both go.
  - Every extra weight cost about 4 Lighthouse points on the Tết hub.
- **No images on either page.** No paintings and no raster ornaments. Ornament is the geometry kit (`Orbit`), `aria-hidden`.
- **No new motion**, no `backdrop-blur` anywhere, and no scroll-driven entrances.
- **AA contrast** for every text/background pair used, including star colours on each cell surface. Graphics that carry meaning (lines, rings, progress fill) reach 3:1. Pairs not already in `tokens.spec.ts` get a test.
- **Worktrees:** prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>`, or it runs the main checkout's code. Never stop the dev servers on 4200 and 3000.
- **Gate:** `pnpm nx affected -t lint typecheck test`. This is not just `@org/frontend`, because Task 6 touches `shared-contracts`. Then the local Lighthouse A/B (Task 8). After deploy, both pages must be at or above their Task 0 production score, with Accessibility 100, CLS 0, and SEO 100 on `/la-so`.

## Review Focus

1. **The board at 320, 390, 639 and 640 px.**
   - Compact: no horizontal overflow, cung names and chính tinh wrap inside the cell, and the panel shows every star of the busiest cung.
   - Full: the busiest cung still fits its 258 px row with the Tailwind-scale sizes.
   - Both: the Tuần/Triệt labels still sit on the shared edge.
   - Covered by tests in Tasks 2–3 and screenshots in Task 8.
2. **Palace-highlighting parity.** On the full board, hover or keyboard focus still spotlights the cung with its tam hợp, xung chiếu and nhị hợp and dims the rest, and the lines follow. Leaving returns to a flat board, with lines on the picked cung. On the compact board, a tap does the same without hover. The chi labels still brighten for related cung (Task 2–3 tests).
3. **Every luận giải state in D3 without a layout jump:**
   - skeleton (reading), skeleton (writing, with progress), prompt, pending and unavailable;
   - article (fresh and stored), the 402 top-up path and the plain error.
   - The skeleton mirrors the new card header (disc and title block), so swapping states does not shift the page.
4. **Keyboard and focus.**
   - `FOCUS_RING_CLASS` is on every cung button and stays visible above its neighbours (`focus-visible:z-30`). It is also on every tab, the scroll arrows, the accordion toggles, the year picker (on Night), the history cards and the remove buttons.
   - The ring shows on Day, Deep and Night.
5. **Fonts and LCP.**
   - Neither page requests a font file that `/` does not.
   - `/la-so/detail` requests no image at all.
   - The LCP element is text (the h1 or board text), never an image.
   - `/la-so` is prerendered: its h1 and lead are in the HTML.

---

### Task 0: Baseline

- [ ] **Step 1: Measure production before any change.** Run Lighthouse mobile, 5 runs each, using the Phase 0 command (`pnpm dlx lighthouse@12 … --chrome-flags="--headless=new"`), on `https://www.xemtuvimienphi.top/la-so` and on `/la-so/detail?day=12&month=3&year=1995&calendar=duong&hour=Ng%E1%BB%8D&gender=nam` (the baseline.md sample). Record the median Performance, Accessibility, Best Practices, LCP, CLS and LCP element in the SDD ledger.
  - Expected: numbers recorded. The 2026-11-06 baseline was 75 / 72; this run is the binding one.
  - The Phase 0 cast counter deduplicates by `birthKey` per day, so the repeated detail runs add one cast at most.
- [ ] **Step 2: Build the "A" side.** From a separate worktree at the current `origin/dev`, run `pnpm nx build @org/frontend` and keep its `dist/apps/frontend` for the A/B in Task 8.

### Task 1: Design-system additions

**Files:**

- Modify: `apps/frontend/src/design-system/PageHero.tsx`, `apps/frontend/src/design-system/contrast.ts`
- Test: `apps/frontend/src/design-system/primitives.spec.tsx`, `apps/frontend/src/design-system/tokens.spec.ts`

**Interfaces:**

- Produces:

  ```ts
  interface PageHeroProps {
    readonly breadcrumb?: ReactNode;
    readonly eyebrow?: string;
    readonly title: ReactNode;
    readonly lead?: string;
    readonly painting?: PagePainting;
    readonly children?: ReactNode;
  }
  export function blendOver(colour: string, base: string, alpha: number): string;
  ```

- [ ] **Step 1: Write the failing tests.**
  - In `primitives.spec.tsx`, `page hero renders the title alone when it has no breadcrumb or eyebrow`: `<PageHero title="Lá Số Tử Vi" />` has one h1, no `nav` and no `p`.
  - In `tokens.spec.ts`, with `const SPOTLIGHT_TINT_ALPHA = 0.1`:
    - `blendOver mixes a colour over its base`: `blendOver('#000000', '#ffffff', 0.5)` is `'#808080'`.
    - `every chart data colour passes AA on the spotlight tint`: each `hanh-*` token against `blendOver(token('gold'), token('day'), SPOTLIGHT_TINT_ALPHA)` is ≥ 4.5.
    - `board lines and the picked ring stay visible on every cung surface`: `deep`, `ember` and `ink` are each ≥ 3 against both `day` and the tint.
    - `progress fill is visible on the skeleton track`: `dusk` on `day-200` is ≥ 3.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- primitives tokens`. Expected: the PageHero case and the `blendOver` cases FAIL (type error or missing export). The contrast cases fail until `blendOver` exists.
- [ ] **Step 3: Implement.**
  - `PageHero` renders `breadcrumb` and the `Eyebrow` wrapper only when given. Nothing else changes: the existing PageHero cases must still pass.
  - `blendOver` does per-channel `round(colour × alpha + base × (1 − alpha))` and returns lowercase hex. Name its constants; the file already uses `HEX_RADIX` and similar.
- [ ] **Step 4: Run the tests again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(design-system): let the page hero drop its breadcrumb and eyebrow, and blend colours for contrast checks`.

### Task 2: Board colours and the full board

**Files:**

- Modify: `features/la-so/chart-colors.ts`, `components/cung-card.tsx`, `components/thien-ban.tsx`, `components/la-so-board.tsx`
- Create: `components/cung-cell-content.tsx` (everything inside today's cung button)
- Test: `components/la-so-board.spec.tsx` (new)

**Interfaces:**

- Produces:
  - `CUNG_SURFACE_CLASS = { base: 'bg-day', spotlight: 'bg-gold/10' } as const`.
  - `CUNG_STATE_CLASS = { focused: 'ring-2 ring-inset ring-gold', picked: 'ring-2 ring-inset ring-ink' } as const`.
  - `CHART_RULE_CLASS = { border: 'border-ink/20', fill: 'bg-ink/20', blockLabel: 'bg-chart-block text-day' } as const`.
  - `CHART_LINE_CLASS = { tamHop: 'stroke-deep', xungChieu: 'stroke-ember' } as const`.
  - `SAO_ELEMENT_CLASS: Readonly<Record<NguHanh, string>>` mapping onto `text-hanh-kim | -moc | -thuy | -hoa | -tho`.
  - `CungCellContent({ cung, isDimmed }): ReactElement`, built from `span`s only, so it is valid inside a `<button>`.
- Spec helper: `observeWidth(width: number): void` installs a `ResizeObserver` stub that reports `width`. ResizeObserver is a browser boundary, so stubbing it is allowed. Every case in this task calls `observeWidth(1024)`.

- [ ] **Step 1: Write the failing tests** in `la-so-board.spec.tsx`. The chart comes from `toChartView({ ...SAMPLE_BIRTH, viewYear: 2026 })`, with the baseline.md sample birth.
  - `paints every star with its hành token`: for the Mệnh cung, each star in the chart data has the matching `text-hanh-*` class on its element.
  - `marks only the picked cung with an ink ring`: the `aria-pressed="true"` button has `ring-ink`, and no other button does.
  - `spotlights the hovered cung with its tam hợp, xung chiếu and nhị hợp`: after `mouseEnter` on a cung, that button has `ring-gold` and `bg-gold/10`. The 4 related buttons have `bg-gold/10`, and every other cell's content has `opacity-30`.
  - `returns to a flat board when the pointer leaves`: after `mouseLeave`, no element has `bg-gold/10`.
  - `draws the tam hợp triangle in deep and the xung chiếu line in ember`: the board's `svg` has 3 `line.stroke-deep` and 1 `line.stroke-ember`.
  - `sets Tuần and Triệt on the chart-block surface`: `getByText('Tuần')` and `getByText('Triệt')` both have `bg-chart-block` and `text-day`.
  - `gives every cung the two-tone focus ring above its neighbours`: each `Cung …` button's class contains the `FOCUS_RING_CLASS` tokens and `focus-visible:z-30`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- la-so-board`. Expected: FAIL (hex classes, no picked ring).
- [ ] **Step 3: Restyle.**
  - **Cells:** split `CungCard` into the button (state, handlers, aria) and `CungCellContent`. Replace `div`/`ul`/`li` inside the button with `span`s carrying `block`/`flex`. Map sizes onto the scale:
    - 14 px → `text-sm`, 13 and 12 px → `text-xs`, 11 and 10 px → `text-2xs`;
    - leading `leading-4`/`leading-5`, paddings `px-1 py-3`.
  - **Cell colours:** can chi, element and month in `text-ink font-bold`, the cung name in `text-dusk font-bold`, `<THÂN>` in `text-ink`, "vô chính diệu" in `text-ink-soft` (not italic), the footer row in `text-ink font-semibold`.
  - **Highlighting:** base `bg-day`; spotlight `bg-gold/10`; focused adds `ring-gold`; picked adds `ring-ink`, which wins over gold. Dimmed stays `opacity-30`.
  - **Thiên bàn:** title `text-dusk font-bold text-xl`, labels `text-ink-soft font-semibold w-24`, values `text-ink` (no `font-medium`), surface `bg-day`.
  - **Board:** the grid fill becomes `CHART_RULE_CLASS.fill`. The block labels use `CHART_RULE_CLASS.blockLabel` with `px-2.5 text-2xs leading-4`. Chi labels are `text-2xs` (`text-dusk font-bold` when active, `text-ink-soft font-semibold` otherwise). The lines use `CHART_LINE_CLASS` with `stroke="currentColor"` dropped. `TAM_HOP_STROKE` and `XUNG_CHIEU_STROKE` go.
- [ ] **Step 4: Run the la-so tests.** `pnpm nx test @org/frontend -- la-so`. Expected: all pass; `board-layout.spec` and `view-year-picker.spec` are unedited.
- [ ] **Step 5: Commit** `feat(la-so): restyle the board with chart tokens and mark the picked cung`.

### Task 3: The compact board for phones

**Files:**

- Create: `features/la-so/board-fit.ts`, `features/la-so/board-highlights.ts`, `components/compact-cung-cell.tsx`, `components/cung-detail.tsx`, `apps/frontend/src/hooks/use-element-width.ts`
- Modify: `components/la-so-board.tsx`
- Delete: `apps/frontend/src/hooks/use-fit-scale.ts` (its only consumer moves to `useElementWidth`)
- Test: `features/la-so/board-fit.spec.ts`, `features/la-so/board-highlights.spec.ts` (new), `components/la-so-board.spec.tsx` (new cases)

**Interfaces:**

- Produces:

  ```ts
  export enum BoardVariant {
    Compact = 'compact',
    Full = 'full',
  }
  export const FULL_BOARD_MIN_WIDTH = 640;
  export function boardVariantFor(containerWidth: number): BoardVariant;
  export function boardScaleFor(containerWidth: number): number;

  export interface BoardSegment {
    readonly from: BoardPoint;
    readonly to: BoardPoint;
  }
  export interface BoardHighlights {
    readonly related: ReadonlySet<number>;
    readonly tamHopEdges: readonly BoardSegment[];
    readonly xungChieu: BoardSegment;
    readonly tuan: readonly [number, number] | null;
    readonly triet: readonly [number, number] | null;
  }
  export function boardHighlights(chart: ChartView, focusedIndex: number): BoardHighlights;

  export function useElementWidth<T extends HTMLElement>(): {
    readonly ref: RefObject<T | null>;
    readonly width: number | null;
  };

  export function CompactCungCell(props: {
    readonly cung: CungView;
    readonly isPicked: boolean;
    readonly isRelated: boolean;
    readonly isDimmed: boolean;
    readonly onSelect: (cungIndex: number) => void;
  }): ReactElement;
  export function CungDetail({ cung }: { readonly cung: CungView }): ReactElement;
  ```

  `BoardPoint` is the `{ x, y }` that `centerAnchor` already returns, exported as a named interface from `board-layout.ts`.

- [ ] **Step 1: Write the failing tests.**
  - `board-fit.spec.ts`:
    - `uses the compact board below 640 px of container`: `boardVariantFor(639)` is `Compact` and `boardVariantFor(640)` is `Full`.
    - `scales the full board down to fit and never up`: `boardScaleFor(406)` is `0.5` and `boardScaleFor(1600)` is `1`.
  - `board-highlights.spec.ts`:
    - `relates a cung to its tam hợp, xung chiếu and nhị hợp`: for Tý (0), `related` equals `{4, 8, 6, 1}`.
    - `closes the tam hợp triangle`: 3 edges, with the last ending where the first starts.
    - `finds both blocked pairs on a real chart`: on the sample chart, `tuan` and `triet` are each a pair of adjacent cung indexes.
  - `la-so-board.spec.tsx`, using `observeWidth(360)`:
    - `shows the compact board on a phone-width container`: there are 12 `Cung …` buttons, and no element has an inline `transform` with `scale(`.
    - `spotlights the tapped cung without hover`: after `click` on a non-Mệnh cung, it has `aria-pressed="true"` and `ring-ink`, and its tam hợp buttons have `bg-gold/10`. No `mouseEnter` is fired.
    - `shows every star of the picked cung in a panel below the board`: `getByRole('region', { name: 'Cung Mệnh' })` contains every name in `catTinh`, `hungTinh` and `chinhTinh`, plus each `luuTinh` name with its `L.` prefix.
    - `follows the picked cung in the panel`: after a click on another cung, the region's name becomes `Cung <that name>`.
    - `keeps the full thiên bàn after the panel`: `getByText('Lai nhân cung:')` follows the region in document order.
    - `shows the scaled board and no panel on a wide container`: with `observeWidth(1024)`, there is no `region` and the board wrapper has an inline `transform: scale(1)`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- board-fit board-highlights la-so-board`. Expected: the new cases FAIL; the Task 2 cases still pass.
- [ ] **Step 3: Implement.**
  - `useElementWidth` observes with `ResizeObserver` in a layout effect, like `useFitScale` did, so the first paint already has the right layout.
  - `LaSoBoard` owns the `hoveredIndex` state and takes `focusedIndex` as follows:
    - full board: `hoveredIndex ?? selectedIndex`, with the spotlight shown only while `hoveredIndex !== null`, as today;
    - compact board: `selectedIndex`, with the spotlight always on.
  - Before the first measure (`width === null`), `LaSoBoard` renders only the measuring wrapper.
  - The full layout is today's board, reading `boardScaleFor(width)` and `boardHighlights(...)`.
  - The compact layout is a fluid `grid grid-cols-4` on `CHART_RULE_CLASS.fill` with `gap-px`, placed through `CUNG_GRID_POSITIONS`.
    - Cells are `CompactCungCell`: can chi `text-2xs text-ink-soft`, name `text-xs font-bold text-dusk`, chính tinh `text-xs font-semibold` in hành colours, and the Tiểu hạn tag.
    - The 2×2 centre holds an `aria-hidden` `Orbit` and the same SVG lines. The Tuần/Triệt labels stay; the chi labels are left out, because each cell shows its can chi.
  - Under the board on compact: `CungDetail` (`<section aria-label="Cung …">` around `CungCellContent` at natural size, `max-w-sm mx-auto`), then `ThienBan`.
  - Delete `use-fit-scale.ts`.
- [ ] **Step 4: Run the la-so tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(la-so): give phones a compact board with the picked cung shown in full`.

### Task 4: Lá số page shell

**Files:**

- Create: `components/la-so-hero.tsx`
- Modify: `components/view-year-picker.tsx`, `pages/la-so-page.tsx`
- Test: `components/la-so-hero.spec.tsx`, `pages/la-so-page.spec.tsx` (new)

**Interfaces:**

- Consumes: `PageHero` (no breadcrumb), `FOCUS_RING_CLASS`.
- Produces: `LaSoHero({ meta, birthYear, viewYear, onViewYearChange }): ReactElement`.
- Page spec helper: `renderLaSoPage(search: string): void` builds a tree with root → pathless `_site` → `la-so` (`validateSearch: birthSearchSchema`) → `detail` (`component: LaSoPage`). That reproduces the `/_site/la-so/detail` id that `getRouteApi` reads. `@/lib/http-request` is mocked as in `luan-giai-chapter-content.spec.tsx`.

- [ ] **Step 1: Write the failing tests.**
  - `la-so-hero.spec.tsx`:
    - `opens with a Night hero holding the only h1`: h1 `Lá Số Tử Vi` is inside the closest `section.bg-night`.
    - `shows âm dương and bản mệnh as the eyebrow`: the text `${meta.amDuong} · ${meta.banMenh}` is inside that section.
    - `keeps the year picker in the hero on a Day pill`: the combobox `Năm xem` is inside the section and has `bg-day`, `text-ink` and the `FOCUS_RING_CLASS` tokens. Its visible label has `text-day-soft`.
  - `la-so-page.spec.tsx`:
    - `stacks the hero, the board and luận giải in that order`: the h1 precedes the first `Cung …` button, which precedes the h2 `Luận giải lá số`.
    - `names the picked cung under the board, Mệnh first`: `/Đang chọn cung Mệnh/` is present, and after clicking another cung it names that cung.
    - `drops the decor paintings beside the board`: every `img` still on the page sits inside the closest `section` of the h2 `Luận giải lá số`. Task 5 empties that section of images too.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- la-so-hero la-so-page`. Expected: FAIL.
- [ ] **Step 3: Restyle.**
  - `LaSoHero` is `PageHero` with the eyebrow and h1 above, and the `ViewYearPicker` as children.
  - `ViewYearPicker`: the label is `text-sm text-day-soft`; the select is `rounded-full bg-day px-4 py-2 text-sm font-semibold text-ink` with `FOCUS_RING_CLASS`. It no longer imports `CUNG_SURFACE_CLASS`.
  - `LaSoPage` drops `FULL_BLEED`, `DECOR_CLASS`, `FADE_TOWARD_BOARD` and both decor images. Its layout is a fragment of three full-width siblings, so nothing needs `100vw`:
    - `LaSoHero`;
    - a `bg-day` section with an inner `mx-auto max-w-6xl px-4 py-8 md:px-6` holding the board and the picked-cung line (`text-sm text-ink-soft`, name in `font-semibold text-ink`);
    - `LuanGiaiSection`.
- [ ] **Step 4: Run the la-so tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(la-so): open the lá số page with a night hero over the board`.

### Task 5: Luận giải reading view

**Files:**

- Modify: `components/luan-giai-section.tsx`, `luan-giai-chapters.tsx`, `luan-giai-card.tsx`, `luan-giai-article.tsx`, `luan-giai-accordion.tsx`, `luan-giai-prompt.tsx`, `luan-giai-pending.tsx`, `luan-giai-skeleton.tsx`, `rich-text.tsx`, `luan-giai-chapter-content.tsx`, `features/la-so/luan-giai-data.ts`
- Test: `components/luan-giai-section.spec.tsx`, `components/rich-text.spec.tsx` (new); `luan-giai-article.spec.tsx`, `luan-giai-chapter-content.spec.tsx`, `pages/la-so-page.spec.tsx` (new cases only)

**Interfaces:**

- Consumes: `ReadingZone`, `DisplayTitle` with `TitleFace.Serif`, `CtaButton` with `CtaTone.Gold`, `Orbit`, `FOCUS_RING_CLASS`.
- Produces:
  - `LuanGiaiChapter` loses `iconUrl`.
  - `LuanGiaiCardHeader({ order, title, eyebrow? })` draws the numeral disc in code.
  - `LuanGiaiChapterContent` passes `data.article` straight through, with no `articleMedia`.

- [ ] **Step 1: Write the failing tests.**
  - `luan-giai-section.spec.tsx` (QueryClient plus the mocked `httpRequest`):
    - `opens luận giải on a Deep band with a serif title`: the h2 `Luận giải lá số` has `font-emphasis`, and its closest `section` has `bg-deep`.
    - `marks the chosen chapter tab in gold`: there are 6 `tab`s; the `aria-selected="true"` one has `bg-gold text-ink`, and the others have `text-day`.
    - `sets the chapter on Day inside the reading zone`: the chapter `article` is inside an element with `max-w-reading`, and that element sits in a `bg-day` container.
    - `keeps both motto lines`: both `LUAN_GIAI_MOTTO` strings are present.
    - `draws no raster images`: no `img`.
  - `luan-giai-article.spec.tsx` (new cases):
    - `sets the quote in the preloaded Playfair italic`: the `blockquote` has `font-emphasis`, `italic` and `font-semibold`.
    - `reads body copy left-aligned`: no paragraph has `text-justify`.
    - `numbers the chapter in a Night disc`: the element with text `02` has `bg-night` and `text-dawn`.
    - `ships no painting and no seal`: no `img`, even when `sourceCung` is `Mệnh`.
  - `rich-text.spec.tsx`:
    - `marks keywords in ink bold`: `**Tử Vi**` renders a `strong` with `font-bold text-ink`.
    - `marks key phrases on a dawn wash`: `==ý chính==` renders a `mark` with `bg-dawn/60 text-ink`.
    - `never renders markup from the text`: `<b>x</b>` renders as literal text.
  - `luan-giai-chapter-content.spec.tsx` (new case): `the request button is a gold CTA`: the button `Xem luận giải` has `bg-gold`.
  - `la-so-page.spec.tsx` (new case): `renders no images`: `container.querySelectorAll('img')` is empty.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- luan-giai rich-text`. Expected: the new cases FAIL and the old cases pass.
- [ ] **Step 3: Restyle.**
  - **Section:**
    - A `bg-deep text-day` band with `mx-auto max-w-6xl px-4 py-12 md:px-6`.
    - The title is a `DisplayTitle as="h2" size={DisplaySize.Card} face={TitleFace.Serif}`, centred, not uppercase.
    - The tabs sit under the title, and below the band a `bg-day` block holds `ReadingZone` → `LuanGiaiChapterContent` (the key is unchanged).
    - The motto closes the Deep band in `text-sm text-day-soft`, with a small `aria-hidden` `Orbit` (`text-gold/60`, `size-8`) as the separator.
    - `SeamCloud`, `TitleOrnament` and `FULL_BLEED` go.
  - **Tabs:**
    - The track is `rounded-2xl border border-day/20 bg-night/40 p-2`, and the scroll and snap behaviour stays.
    - Each tab is `min-w-44 rounded-xl px-3 py-2` with `FOCUS_RING_CLASS`. The numeral is in `font-display font-extrabold text-xs tracking-widest`, and the title is `text-sm font-semibold`.
    - The active tab is `bg-gold text-ink`; the rest are `text-day hover:bg-night/60`. `ImagePlaceholder` goes.
    - The two edge-fade gradients go, because gradients are allowed in three places only. The arrows become `size-11 rounded-full border border-day/20 bg-night text-day` with `FOCUS_RING_CLASS`.
  - **Card:** an `article` with `rounded-3xl border border-ink/10 bg-day px-5 py-8 md:px-10`, with no double frame and no luopan.
  - **Card header:**
    - The disc is `flex size-16 items-center justify-center rounded-full bg-night text-dawn font-display font-extrabold text-2xl md:size-20 md:text-3xl`, with `shadow-glow-gold`.
    - The eyebrow uses `Eyebrow` in `text-ink-soft`. The h3 is a `DisplayTitle as="h3" size={DisplaySize.Card} face={TitleFace.Serif}`, not uppercase.
  - **Article:**
    - The quote is in `font-emphasis italic font-semibold text-xl text-ink`, and the rule beside it is `bg-ink/15`.
    - The h4 is `text-xl font-bold text-ink`. Paragraphs are `mt-4`, with size and line height inherited from `ReadingZone`. The staggered reveal stays on each `<p>`.
    - The figure and `INK_WASH_MASK` go.
    - The summary is `rounded-2xl bg-day-200 px-6 py-5`, left-aligned.
    - In the footer, `closingLabel` is `text-sm text-ink-soft` and `closing` is `font-emphasis italic font-semibold text-xl text-dusk`. The seal goes.
  - **Accordion:**
    - Entries are `rounded-xl border border-ink/15 bg-day`. Toggles get `FOCUS_RING_CLASS`, the title is `text-lg font-bold text-ink`, meta is `text-sm text-ink-soft`, the badge is `bg-night text-day`, the rule is `bg-ink/15` and the chevron is `text-ink`.
    - "Mở tất cả" becomes `text-sm font-semibold text-ink underline-offset-4 hover:underline` with `FOCUS_RING_CLASS`.
  - **Prompt:** the copy is `text-ink-soft`, the button is `CtaButton tone={CtaTone.Gold}` with the `Eye` icon `aria-hidden` and the label unchanged, and the error is `text-danger`. Keep `min-h-72`.
  - **Pending:** an `Orbit` (`size-24 text-ink/20`, `aria-hidden`) replaces the icon image. The title is `text-xl font-semibold text-ink`, and the body is `text-ink-soft` with `Thân cư` in `font-semibold text-ink`. Keep `min-h-75`.
  - **Skeleton:**
    - Blocks are `rounded bg-day-200`, the track is `bg-day-200` and the fill is `bg-dusk`. The copy is `text-ink-soft`.
    - The header placeholder becomes a `size-16 md:size-20 rounded-full` disc, to mirror the new header. `px` sizes move onto the scale.
  - **RichText:** `strong` is `font-bold text-ink`; `mark` is `bg-dawn/60 px-1 font-semibold text-ink decoration-clone`.
  - Drop `iconUrl` from `LUAN_GIAI_CHAPTERS`.
- [ ] **Step 4: Run the la-so tests.** `pnpm nx test @org/frontend -- la-so`. Expected: all pass.
- [ ] **Step 5: Commit** `feat(la-so): set luận giải as a deep band over a day reading zone`.

### Task 6: Drop the lá số paintings and ornaments

**Files:**

- Delete: `features/la-so/luan-giai-media.ts`, `components/image-placeholder.tsx`
- Modify: `apps/frontend/src/config/media.ts`, `packages/shared/contracts/src/luan-giai.ts`

- [ ] **Step 1: Remove the dead entries.**
  - In `media.ts`, delete `CUNG_ILLUSTRATIONS` and `laSoIconUrl`, and the `MEDIA.laSo` keys `cungIllustrations`, `seal`, `cloudDivider`, `headerOrnament`, `taiji` and `badge`. The `history*` keys go in Task 7, together with their consumer.
  - Keep `decorLeft`, `decorRight`, `illustrationCrane`, `luopan` and `sealSmall`: `kien-thuc-data.ts`, `kien-thuc-hero.tsx`, `article-card.tsx` and `van-han-detail.tsx` use them.
  - In `luan-giai.ts`, remove `illustrationUrl`, `sealUrl` and the doc sentence about them.
- [ ] **Step 2: Prove nothing still points at them.** `rg "cungIllustrations|laSoIconUrl|illustrationUrl|sealUrl|ImagePlaceholder|luan-giai-media" apps packages` returns nothing.
- [ ] **Step 3: Run the gate.** `pnpm nx affected -t lint typecheck test`. Expected: green, including `@org/backend`, which imports the contract.
- [ ] **Step 4: Commit** `refactor(la-so): drop the per-cung paintings and raster ornaments`. The body says the files under `public/la-so/` stay for Phase 4.

### Task 7: History page and the lint guard

**Files:**

- Modify: `pages/la-so-history-page.tsx`, `history/components/history-card.tsx`, `history/components/history-list.tsx`, `apps/frontend/src/config/media.ts`, `apps/frontend/eslint.config.mjs`
- Delete: `history/components/history-ornaments.tsx`
- Test: `pages/la-so-history-page.spec.tsx` (new), `history/components/history-list.spec.tsx` (new cases only)

**Interfaces:**

- Consumes: `PageHero` (title and lead, no breadcrumb and no eyebrow), `CtaButton` with `CtaTone.Gold`, `FOCUS_RING_CLASS`.

- [ ] **Step 1: Write the failing tests.**
  - `la-so-history-page.spec.tsx` (memory router, as in `history-list.spec.tsx`):
    - `opens with a Night hero holding the only h1`: h1 `Lá số đã xem` and the lead `Những lá số bạn đã lập hoặc mở gần đây.` share the closest `section.bg-night`.
    - `the new-chart link is a gold CTA to the home page`: the link `Lập lá số mới` has `href="/"` and `bg-gold`.
    - `keeps the motto footer without raster art`: `THIÊN THỜI · ĐỊA LỢI · NHÂN HÒA` is present, and there is no `img`.
  - `history-list.spec.tsx` (new cases):
    - `shows each chart as a Day tile with the focus ring`: the card link has `bg-day`, `border-ink/15` and the `FOCUS_RING_CLASS` tokens.
    - `gives the remove button a 44 px target`: the button `Xoá lá số Nguyễn Văn A khỏi lịch sử` has `size-11` and the `FOCUS_RING_CLASS` tokens.
    - `shows no icon image on a card`: no `img` inside the list.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- la-so-history history-list`. Expected: the new cases FAIL and the old cases pass.
- [ ] **Step 3: Restyle.**
  - **Page:** the `PageHero` takes the `CtaButton` as children (with the `Plus` icon `aria-hidden`). Below it, a `bg-day` section with `mx-auto max-w-6xl px-4 py-10 md:px-6` holds the `HistoryList`. The footer motto is `text-sm tracking-widest text-ink-soft` beside a small `Orbit`. `PARCHMENT`, `FULL_BLEED`, `FADE_INWARD`, both paintings, `TitleFlourish` and `GoldWave` go.
  - **Card:** `rounded-2xl border border-ink/15 bg-day p-5 pr-14 hover:border-gold`, with `FOCUS_RING_CLASS`. The name is `text-2xl font-bold text-ink`, the meta is `text-sm text-ink-soft`, the `│` separators are `text-ink/30`, and the viewed-at line is `text-xs text-ink-soft`. The bagua image goes.
  - **Remove button:** `size-11 rounded-full border border-ink/15 bg-day text-danger hover:bg-day-200`, with `FOCUS_RING_CLASS`.
  - **Empty state:** `text-ink-soft`.
  - Delete `history-ornaments.tsx` and the `historyCraneSun`, `historyPavilionPine` and `historyBagua` keys.
  - In `MIGRATED_FILES`, replace the `birth-form.tsx` and `calendar-toggle.tsx` entries with `'src/features/la-so/**'`.
- [ ] **Step 4: Run the gate.** `pnpm nx affected -t lint typecheck test`. Expected: lint has 0 errors, meaning the guard finds no hex and no `[Npx]` left in `features/la-so`, and every test passes.
- [ ] **Step 5: Commit** `feat(la-so): restyle the history page and put the lá số feature under the style guard`.

### Task 8: Verification

- [ ] **Step 1: Build and prerender.** Run `pnpm nx build @org/frontend`.
  - Expected: `dist/apps/frontend/la-so/index.html` contains `Lá số đã xem` and the lead.
  - Expected: its `<title>`, description, canonical and OG tags are byte-identical to the Task 0 "A" build. Diff the two `<head>`s.
- [ ] **Step 2: Visual check** in the dev server (reuse the running one) at 320, 390, 639, 640, 1024×700 and 1440×900. Cover `/la-so` (empty, and with two entries) and the detail sample. Find the busiest cung by scanning a few sample charts for the longest `catTinh` or `hungTinh` column.
  - Expected: `document.documentElement.scrollWidth === innerWidth` at every width.
  - Expected: the busiest cung fits its cell on the full board, and the panel shows it whole on compact.
  - Expected: at 390 px a tap moves the spotlight, the lines and the panel; at 1440 px hover spotlights and leaving restores the flat board.
  - Expected: every luận giải state renders, the 402 path forced through DevTools request blocking or a stubbed response.
  - Screenshots go to the scratchpad for Kim An.
- [ ] **Step 3: Fonts and images.** Open DevTools Network on `/`, `/la-so` and the detail sample.
  - Expected: the woff2 files requested by either lá số page are a subset of those requested by `/`.
  - Expected: the detail page requests no `image/*` other than the logo.
- [ ] **Step 4: Local Lighthouse A/B.** Serve the "A" build and this branch's build side by side with `vite preview`, each on its own port (never 4200; check `--help` for the flags). Then run Lighthouse mobile, 5 runs each and interleaved A, B, A, B, on `/la-so` and the detail sample, on the same machine in one sitting. Report the medians.
  - Expected: B's Performance ≥ A's, CLS 0, Accessibility 100 and Best Practices ≥ A's.
  - Expected: SEO 100 on `/la-so`.
  - Expected: the LCP element is text on both pages.
  - If B is lower, find the cause (a new font file, a long task in the board) before going further.
- [ ] **Step 5: Final review** by a fresh reviewer on the whole branch, with this Review Focus. Fix Critical and Important findings test-first.

After "tạo pull" and the merge: run the Task 0 measurement again on production and report both numbers next to the A/B.
