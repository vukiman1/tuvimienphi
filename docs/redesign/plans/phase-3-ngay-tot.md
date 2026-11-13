# Phase 3 — Ngày tốt in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Ngày tốt page (`/ngay-tot`) from the old hex palette, gradients and raster ornaments to D3. That covers the month calendar, the day detail, the three schools (Hiệp Kỷ, Phi Tinh, Nhị Thập Bát Tú), the giờ xuất hành slots, the giờ hoàng đạo / hắc đạo cards and their detail dialog. No copy, URL, head tag or calculation changes.

**Architecture:** An ordinary Day-header page, not a story page: no chapter rail and no sticky CTA. It opens with a Night `PageHero` holding the h1, the existing lead and the school tabs. Below it, one Day tool zone holds the calendar and the active school's panel side by side from `lg`, then the hour cards. The day detail is the one showcase piece inside that zone: a Night panel. Everything else is Day or `day-200` with Ink text. Every raster image on the page is dropped, including the zodiac PNGs on the hour cards. The hour cards get a code-drawn 12-point dial from the geometry kit in their place. Calendar state stays in `NgayTotPage`. Day-cell logic moves into a pure module so it can be tested without rendering.

**Tech Stack:** React 19, Tailwind v4 tokens from `design-system/tokens.css`, Radix Dialog through `components/ui/dialog`, lucide icons, Jest + Testing Library.

**Spec:** [design.md](../design.md), "Visual identity — D3" (two zones per page, geometry kit, no raster ornaments), "Asset kit" (illustrations optional, shipped only after the gates pass without them) and the quality gates. The page's 2026-11-06 baseline is in [baseline.md](../baseline.md): Performance 68, Accessibility 96, LCP 10.1 s.

## Decisions (approved by Kim An's delegation, 2026-11-13)

1. **Scope.** This PR covers `/ngay-tot` only: all three school tabs and the hour dialog. The calendar gets **no good/bad-day marking**. Today's page computes hoàng đạo / hắc đạo per hour, not per day, so adding it would be a new feature. It goes on the follow-up list. The meta description already promises "ngày hoàng đạo, hắc đạo".
2. **Hero.**
   - A Night `PageHero` with no breadcrumb and no eyebrow. Inventing an eyebrow would add copy.
   - The h1 is `Ngày <Emphasis isAccent>Tốt</Emphasis>`. Its text stays "Ngày Tốt", and it uses the Inter Tight 800 and Playfair 600 italic files that every page preloads.
   - The lead is unchanged. The three school tabs move into the hero as its children, the way the Lá số hero holds the year picker.
   - No painting. The `sceneTop` backdrop goes; today it is the likely LCP element.
3. **Two zones.** Below the hero there is one Day tool zone, `max-w-6xl` like the other migrated pages. It does not use `ReadingZone`, because the content is a grid, not prose. The day detail card is the only dark surface in the zone: a Night panel, without the gradient.
4. **Calendar on phones.**
   - The same 7 × 6 grid, with fluid square cells (about 41 px at 320 px wide).
   - The header puts the month title first in the DOM, then the group ‹ · Hôm nay · ›. Below `sm` the two sit on separate rows; from `sm` they share a row, with the title on the left. Visual order then matches DOM order at every width.
   - The month buttons grow from 28 to 44 px, and "Hôm nay" gets a 44 px height.
5. **Day states without colour alone, and no text dimmed with opacity.**
   - **Selected:** gold fill plus a 2 px inset Ink ring. Gold on Day is only 1.65:1, so the ring is what carries the state.
   - **Today:** a 1 px inset Ink ring with no fill. `aria-current="date"` stays.
   - **Days in the shown month:** a `day-200` tile.
   - **Days from the neighbouring months:** no tile, with `text-ink-soft`.
   - **Mùng 1 and rằm:** the lunar label is `font-bold text-dusk`. Weight is the non-colour cue, and mùng 1 already shows `1/<tháng>`.
   - **Sunday:** the date stays red as `text-danger`. The "CN" header and the column position already say Sunday.
6. **Hour cards.**
   - The zodiac PNGs (both variants) are replaced by `HourDial`. It is 12 points on a circle with Tý at the top, and the hour's chi drawn larger in gold with an Ink outline. The dialog uses the same dial.
   - Hoàng đạo cards are Day with a 2 px gold border. Hắc đạo cards are `day-200` with an `ink/15` border. Both keep the text label, so no card goes dark.
   - The range moves from the floating gradient plate into the card's first line, in `font-display font-extrabold`.
   - The stars become lucide `Star` icons: filled gold with an Ink outline, or an Ink-soft outline left empty. The difference is shape, not opacity. The `aria-label` "`n` trên 5 sao" is unchanged.
   - The current hour's card gets a 2 px Ink ring next to its "Bây giờ" badge.
   - The 1.04 scale on hover becomes the CTA's `-translate-y-0.5` lift, off under reduced motion.
   - Every card gets `FOCUS_RING_CLASS`. Today the cards have none (see Review Focus 4).
7. **Headings.**
   - "Giờ Hoàng đạo" and "Giờ Hắc đạo" become `h3`s between `ink/15` hairlines. The label plates, the sun and moon icons, and the pine and crane paintings go.
   - "Giờ tốt xấu trong ngày" is a serif `DisplayTitle` h2.
   - "Giờ Xuất Hành", "Cửu Cung Phi Tinh" and "Nhị Thập Bát Tú" are serif h2s at `text-2xl`. The last two are `<p>` today, so the Phi Tinh and Nhị Thập Bát Tú tabs have no h2.
   - Text is unchanged. The CSS `uppercase` goes, as it did on Lá số.
8. **Xuất hành.**
   - The six Lục Diệu icons go, with nothing in their place.
   - Good slots are Day tiles with a gold border, and their badge is `bg-gold text-ink` with `Check`. Bad slots are `day-200` tiles, and their badge is `bg-ink text-day` with `X`.
   - The words "Giờ tốt" / "Giờ xấu" and the icons carry the meaning, so there is no green or red.
9. **Phi Tinh good stars.**
   - They stay red, as `text-hanh-hoa`. These boards are chart components, which is where design.md allows chart colours.
   - They gain a 1 px inset ring and a visually hidden ` (sao tốt)`. **This is the only new string in the PR.** Today a screen-reader user cannot tell good stars from bad ones. If Kim An prefers no new string, drop the `sr-only` span and keep only the ring.
   - The picked board gets an Ink ring on a `gold/10` tint.
10. **Nhị Thập Bát Tú.**
    - The pillars sit on `day-200`, and "Sao …" becomes a `bg-gold text-ink` pill.
    - The verses move from Be Vietnam Pro italic to Playfair 600 italic, which is preloaded. No new face is fetched.
11. **Dialog.**
    - The shared `components/ui/dialog` is not changed. Only the content changes: `HourDial`, the title in `font-display font-extrabold`, and `StarRating`.
    - The Tinh / Nghi / Kỵ tags become `day-200`/Ink, `gold`/Ink and `ink`/Day. The words carry the meaning, so there is no green or red.
12. **Media clean-up.**
    - Delete `corner-brackets.tsx` (ornamental frames are what D3 removes) and `xuatHanhIconUrl`.
    - Delete these `MEDIA.ngayTot` keys: `calendarFoot`, `decorPine`, `labelPlateDark`, `labelPlateLight`, `labelIconMoon` and `labelIconSun`. Also delete `lichBackground`, `barWood` and `barMarble`, which already have no consumer.
    - Keep `sceneTop` and `decorCrane`, which kiến thức still uses.
    - `zodiacIconPath` loses its only `'gold'` caller, so the `variant` parameter goes. Vận hạn uses the default.
    - The files under `public/ngay-tot/` and `public/zodiac/*-gold.png` stay until Phase 4.
13. **Tabs keep their behaviour.** They are restyled only. Arrow-key roving and `aria-controls` on unrendered panels stay as they are, and go on the follow-up list. Task 7 checks whether Lighthouse flags them.

## Global Constraints

- **Tokens only.** No hex values, no `[Npx]`, no inline gradient `style` and no comments. Use the palette tokens (`bg-day`, `text-ink`, `text-ink-soft`…), not the shadcn semantic ones (`bg-card`, `text-primary`, `text-muted-foreground`, `text-foreground`, `text-destructive`). `src/features/ngay-tot/**` joins `MIGRATED_FILES` (Task 6), so the `local/no-ad-hoc-style` guard proves it. Grid tracks move to rem (`lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]`).
- **Content is frozen.** Every visible string stays byte-identical:
  - the h1 text `Ngày Tốt`, the lead, the tab labels and `Trường phái luận giải`;
  - `Tháng {m}, {y}`, `Hôm nay`, `Tháng trước`, `Tháng sau`, the weekday labels;
  - the day detail lines, `Giờ Xuất Hành`, `Giờ tốt` / `Giờ xấu`;
  - `Giờ tốt xấu trong ngày` and its subline, the count chips, `Bây giờ`, `Hoàng đạo` / `Hắc đạo`, `n trên 5 sao`;
  - `Lưu ý:` and its sentence, the Tinh / Nghi / Kỵ rows;
  - `Cửu Cung Phi Tinh`, `Phi tinh {label}`, `Luận giải chi tiết đang được xây dựng.`, `Bấm vào từng bảng Phi Tinh để xem chi tiết.`, and every Nhị Thập Bát Tú string.

  The DOM ids `tab-*` and `panel-*` stay. The head tags in `routes/_site/ngay-tot.tsx` are untouched. The only addition is the `sr-only` ` (sao tốt)` from Decision 9.

- **Existing specs pass without edits:** `gio-hoang-dao`, `gio-xuat-hanh`, `phi-tinh`, `nhi-thap-bat-tu`, `site-header`, `mobile-nav-bar`, `site-layout`, `van-han-paths`, `tokens`, `primitives` and `font-weights`. The feature has no component spec today, so every new test adds a file or a case.
- **The clock is a boundary.** Specs that render the page or the hour list fix it with `jest.useFakeTimers({ now: FIXED_NOW, doNotFake: [...] })`, faking only `Date`. Check the installed Jest's `FakeTimersConfig` before writing the list. `FIXED_NOW = new Date(2026, 7, 11, 9)`. That day is Đinh Tị and lunar 29/6, the date the lib specs already pin. At 9h the current chi is Tị (index 5), whose hour is "Ất Tị", a hắc đạo hour.
- **Fonts.** Introduce no weight or face that `/` does not already use:
  - Be Vietnam Pro at `font-normal`, `font-semibold` and `font-bold`. `font-bold` renders at 600.
  - Inter Tight only as `DisplayTitle` Sans or `font-display font-extrabold` (800, preloaded). `font-weights.spec.ts` already rejects `font-display` with `font-bold`.
  - Playfair only as `TitleFace.Serif` / `font-emphasis font-bold` (700), or as `Emphasis` / `font-emphasis italic font-semibold` (600 italic, preloaded).
  - Today's code uses `font-medium` (`month-calendar.tsx:73,140`, `hour-quality-list.tsx:188,192`, `day-detail-card.tsx:81`) and Be Vietnam Pro italic (`nhi-thap-bat-tu-panel.tsx:43`). Both go.
  - Every extra weight cost about 4 Lighthouse points on the Tết hub.
- **No images on the page.** No painting, no raster ornament and no icon image. Ornament is the geometry kit (`Orbit`, `pointsOnCircle`), `aria-hidden`. Icons are lucide components.
- **Contrast.** Text is never dimmed with opacity (`text-*/NN`, `opacity-*` on text). Emphasis comes from tints, rings, weight or non-text marks. Every text/background pair is ≥ 4.5:1, and every graphic that carries meaning is ≥ 3:1. Pairs not already in `tokens.spec.ts` get a test (Task 1).
- **No new motion**, no `backdrop-blur`, no scroll-driven entrance and no text-dimming transition. The hover lift is transform-only and off under `motion-reduce`.
- **No focus code.** The page has no hash targets. If one is added later, it needs no `onClick`, because `src/app/focus-hash-target-on-render.ts` focuses hash targets once.
- **Mobile bar.** The bottom tab bar is 68 px plus the safe area, and `SiteLayout` already reserves it. The last element (the "Lưu ý" note on Hiệp Kỷ, the panel on the other tabs) must end above the bar. The dialog must stay fully visible above it at 320 × 568.
- **Worktrees:** prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>`, or it runs the main checkout's code. Never stop the dev servers on 4200 and 3000.
- **Gate:** `pnpm nx affected -t lint typecheck test`. Task 6 touches `lib/zodiac-icons.ts`, which vận hạn imports. Then the local Lighthouse A/B (Task 7). After deploy, `/ngay-tot` must be at or above its Task 0 production median, with Accessibility ≥ 95 and not below A, SEO 100 and CLS 0.

## Review Focus

1. **The calendar at 320, 390, 640 and 1024 × 700.**
   - No horizontal overflow, and the header wraps as Decision 4 says.
   - Every day cell is at least 40 px and keeps both the solar and the lunar line, with `1/12` fitting.
   - From `lg`, the calendar and the panel start on the same line.
   - Covered by the Task 2 tests and the Task 7 screenshots.
2. **Every state reads without colour alone, and no text is faded:** selected, today, today-and-selected, other-month days, mùng 1 and rằm, Sunday, hoàng đạo / hắc đạo cards, the current hour, xuất hành good / bad, Phi Tinh good stars and the picked board. Each one has a test that asserts its non-colour mark. The new contrast pair is pinned in `tokens.spec.ts`.
3. **Tabs and state.**
   - Switching schools keeps the calendar, the shown month and the selected day.
   - The hour cards show only on Hiệp Kỷ.
   - `aria-selected`, `aria-controls` and the `tab-*`/`panel-*` ids are unchanged.
   - The focus ring shows on every tab over Night.
4. **Hour cards and dialog.**
   - Today the cards have `focus-visible:outline-none` with nothing in its place (`hour-quality-list.tsx:104`). After this PR, each card shows the two-tone ring.
   - The dial lights the right chi: Tý at the top, Ngọ at the bottom.
   - "Bây giờ" shows only when the selected day is today.
   - The dialog opens on click or Enter. It shows the same dial and stars, and at 320 × 568 it fits above the bottom bar with its close button reachable.
5. **LCP, fonts and prerender.**
   - The LCP element is the h1, never an image.
   - `/ngay-tot` requests no `image/*` other than the logo, and no woff2 that `/` does not.
   - `dist/apps/frontend/ngay-tot/index.html` still holds the h1, the lead and the tab labels.
   - The page is prerendered with the build day selected, and `createRoot` replaces it with today on load (see Task 7, Step 2). That swap must not move anything inside the first mobile viewport: CLS stays 0.

---

### Task 0: Baseline

- [ ] **Step 1: Measure production before any change.** Use `npx -y lighthouse@12.8.2`, not the globally installed 13.0.1, whose scores are not comparable with baseline.md:

  ```
  npx -y lighthouse@12.8.2 https://www.xemtuvimienphi.top/ngay-tot --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=<scratchpad>/lh-ngay-tot-a-<n>.json --chrome-flags="--headless=new"
  ```

  Run it 10 times and record the median Performance, Accessibility, Best Practices, LCP, CLS and TBT in the SDD ledger. Also record the LCP element and the failing accessibility audits by id.
  - Expected: numbers recorded. The 2026-11-06 baseline was 68 / 96 / LCP 10.1 s; this run is the binding one.
  - The accessibility audit list is the before-picture for Decision 13 and Review Focus 2.

- [ ] **Step 2: Build the "A" side.** From a separate worktree at the current `origin/dev`, run `pnpm nx build @org/frontend` and keep its `dist/apps/frontend` for the A/B in Task 7.

### Task 1: Page shell, hero and school tabs

**Files:**

- Create: `features/ngay-tot/components/school-tabs.tsx`
- Modify: `features/ngay-tot/pages/ngay-tot-page.tsx`
- Test: `features/ngay-tot/pages/ngay-tot-page.spec.tsx` (new), `apps/frontend/src/design-system/tokens.spec.ts` (new case)

**Interfaces:**

- Consumes: `PageHero` (no breadcrumb, no eyebrow, no painting), `Emphasis`, `FOCUS_RING_CLASS`.
- Produces:

  ```ts
  export const PAGE_TABS: readonly [
    { readonly id: 'hiep-ky'; readonly label: 'Hiệp Kỷ' },
    { readonly id: 'phi-tinh'; readonly label: 'Phi Tinh' },
    { readonly id: 'nhi-thap-bat-tu'; readonly label: 'Nhị Thập Bát Tú' },
  ];
  export type PageTabId = (typeof PAGE_TABS)[number]['id'];
  export function SchoolTabs(props: {
    readonly activeTab: PageTabId;
    readonly onSelect: (tab: PageTabId) => void;
  }): ReactElement;
  ```

  The `PAGE_TABS` literal, the ids and the ARIA wiring move into this file unchanged from `ngay-tot-page.tsx:15-21,88-107`.

- Page spec helper: `renderPage(): ReturnType<typeof render>` renders `<NgayTotPage />` directly. The page uses no router API. The clock is fixed at `FIXED_NOW` in `beforeEach`, and real timers are restored in `afterEach`.

- [ ] **Step 1: Write the failing tests.**
  - `ngay-tot-page.spec.tsx`:
    - `opens with a Night hero holding the only h1`: there is one h1, its text content is `Ngày Tốt`, and its closest `section` has `bg-night`. The lead `Xem lịch âm dương trong tháng, ngày mùng 1 và ngày rằm.` is inside that section.
    - `accents Tốt in the h1`: the h1's `.italic` child has the text `Tốt` and the class `text-dawn`.
    - `puts the school tabs in the hero with Hiệp Kỷ chosen`: the `tablist` named `Trường phái luận giải` is inside the hero section and holds 3 `tab`s. `Hiệp Kỷ` has `aria-selected="true"`, `bg-gold` and `text-ink`. The other two have `text-day`. All three have `min-h-11` and the `FOCUS_RING_CLASS` tokens.
    - `sets the calendar and the panel on a Day zone`: the closest `section` of the `Tháng trước` button has `bg-day`, and the hero section does not contain it.
    - `keeps the calendar and the picked day while switching schools`:
      - click the day button whose name matches `/^20\b/` (2026-08-20; lunar labels come second in the name);
      - click `Phi Tinh`;
      - the `tabpanel` (labelled by `tab-phi-tinh`) holds the h2 `Cửu Cung Phi Tinh`;
      - `Tháng 8, 2026` is still shown, and that button keeps `aria-pressed="true"`;
      - the h2 `Giờ tốt xấu trong ngày` is gone.
    - `shows the hour cards only on Hiệp Kỷ`: the h2 `Giờ tốt xấu trong ngày` is present at first, and absent after clicking `Nhị Thập Bát Tú`.
    - `renders no images`: `container.querySelectorAll('img')` is empty.
  - `tokens.spec.ts`: `mùng 1 and rằm labels read dusk on the day tile`: `dusk` on `day-200` is ≥ 4.5. Every other pair this plan uses is already pinned (ink, ink-soft and danger on `day`/`day-200`; ink on gold; day-soft, dawn and gold on night; `hanh-*` on the `gold/10` tint).
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- ngay-tot-page tokens`. Expected: the page cases FAIL (no Night section, a gradient tab). The token case may already pass, since it only pins values.
- [ ] **Step 3: Implement.**
  - **`SchoolTabs`:** a `flex flex-wrap gap-2` tablist. Each tab is `min-h-11 rounded-full border px-5 text-sm font-semibold whitespace-nowrap` with `FOCUS_RING_CLASS`. The active tab is `border-transparent bg-gold text-ink`; the others are `border-day/30 text-day hover:border-gold`.
  - **Page:**
    - `<main className="w-full bg-day">`.
    - `PageHero` with `title={<>Ngày <Emphasis isAccent>Tốt</Emphasis></>}`, the lead, and `SchoolTabs` as children.
    - Then a `<section>` with `mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12`. It holds the existing grid with rem tracks, then the hour list on Hiệp Kỷ.
    - `BACKDROP_FADE`, `BACKDROP_MASK`, the backdrop `img` and the `MEDIA` import go.
    - State and handlers are unchanged.
- [ ] **Step 4: Run the tests again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(ngay-tot): open the page with a night hero holding the school tabs`.

### Task 2: Month calendar

**Files:**

- Create: `features/ngay-tot/calendar-day.ts`
- Modify: `features/ngay-tot/components/month-calendar.tsx`
- Test: `features/ngay-tot/calendar-day.spec.ts`, `features/ngay-tot/components/month-calendar.spec.tsx` (new)

**Interfaces:**

- Produces:

  ```ts
  export const CALENDAR_CELL_COUNT = 42;
  export interface CalendarDayContext {
    readonly viewYear: number;
    readonly viewMonth: number;
    readonly selectedDate: Date;
    readonly today: Date;
  }
  export interface CalendarDay {
    readonly date: Date;
    readonly isInViewMonth: boolean;
    readonly isToday: boolean;
    readonly isSelected: boolean;
    readonly isSunday: boolean;
    readonly isSpecialLunarDay: boolean;
    readonly lunarLabel: string;
  }
  export function buildCalendarDays(context: CalendarDayContext): readonly CalendarDay[];
  ```

  `buildCalendarDates` and `isSameDay` move here from `month-calendar.tsx:20-35` unchanged. Today's colour ternaries (`month-calendar.tsx:112-125`) become a class lookup in the component:

  ```ts
  const DAY_CELL_CLASS = {
    inMonth: 'bg-day-200',
    selected: 'bg-gold ring-2 ring-inset ring-ink',
    today: 'ring-1 ring-inset ring-ink',
  } as const;
  ```

- [ ] **Step 1: Write the failing tests.**
  - `calendar-day.spec.ts`, with `CONTEXT = { viewYear: 2026, viewMonth: 8, selectedDate: new Date(2026, 7, 11), today: new Date(2026, 7, 11) }`:
    - `starts the grid on the Monday on or before the 1st`: 42 days. The first is 2026-07-27, because 2026-08-01 is a Saturday, and the last is 2026-09-06.
    - `marks only the days of the shown month as in view`: 31 days have `isInViewMonth`.
    - `labels mùng 1 with its lunar month and other days with the day alone`: find the first day with lunar day 1 using `convertSolarToLunar`. Its `lunarLabel` is `1/<month>`, and 2026-08-11's label is `29`.
    - `flags mùng 1 and rằm as special lunar days`: every day with `isSpecialLunarDay` has lunar day 1 or 15, and there are at least two such days in the grid.
    - `marks today and the selected day independently`: with `selectedDate` 2026-08-20, only 08-11 has `isToday` and only 08-20 has `isSelected`.
  - `month-calendar.spec.tsx`, rendering `MonthCalendar` with that context and `jest.fn()` handlers (the props are the component's boundary):
    - `marks the selected day with a gold fill and an ink ring`: with `selectedDate` 2026-08-20, the `aria-pressed="true"` button's name matches `/^20\b/`, and it has `bg-gold`, `ring-2` and `ring-ink`. No other button has `bg-gold`.
    - `rings today without filling it`: the `aria-current="date"` button has `ring-1` and `ring-ink`, and not `bg-gold`.
    - `sets other months' days apart without fading their text`: the 2026-07-27 button has no `bg-day-200`, and both its spans have `text-ink-soft`. No element in the calendar has a class matching `/^text-[\w-]+\/\d+$/` or starting with `opacity-`.
    - `shows mùng 1 and rằm in bold dusk`: the lunar span of the first lunar-1 day has `font-bold` and `text-dusk`.
    - `keeps Sunday red under the CN header`: the `CN` header and the 2026-08-02 date span both have `text-danger`.
    - `gives the month buttons a 44 px target and the focus ring`: `Tháng trước` and `Tháng sau` have `size-11`, `Hôm nay` has `min-h-11`, and every button (42 days plus 3 controls) has the `FOCUS_RING_CLASS` tokens.
    - `puts the month title before its controls`: `Tháng 8, 2026` precedes `Tháng trước` in document order.
    - `steps the month and returns to today`: clicking `Tháng sau` calls `onStepMonth(1)`, `Tháng trước` calls it with `-1`, and `Hôm nay` calls `onGoToday`.
    - `draws no images and no corner brackets`: no `img`, and only the two chevron `svg`s.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- calendar-day month-calendar`. Expected: FAIL (module missing, hex classes).
- [ ] **Step 3: Restyle.**
  - **Card:** `relative flex h-full flex-col rounded-2xl border border-ink/15 bg-day p-3 md:p-5`. `pb-[36%]`, `CornerBrackets`, the `calendarFoot` image and the `MEDIA` import go.
  - **Header:**
    - `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`.
    - The title `<p>` comes first, in `font-display font-extrabold text-xl text-ink`, centred below `sm`.
    - The controls follow in a `flex items-center justify-center gap-2` group: prev, `Hôm nay`, next.
    - The month buttons are `flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-day-200` with `FOCUS_RING_CLASS`.
    - `Hôm nay` is `min-h-11 rounded-full border border-ink/15 px-4 text-xs font-semibold text-ink hover:border-gold` with `FOCUS_RING_CLASS`.
  - **Weekdays:** `text-xs font-semibold text-ink-soft`, with `CN` in `text-danger`.
  - **Grid:** `grid grid-cols-7 gap-1 content-between`, mapped over `buildCalendarDays(...)`.
  - **Day buttons:**
    - Base: `mx-auto flex aspect-square w-full max-w-12 flex-col items-center justify-center rounded-xl` with `FOCUS_RING_CLASS`.
    - Add `DAY_CELL_CLASS.inMonth` when in view, `.today` when today and not selected, and `.selected` when selected.
    - Hover is `hover:ring-1 hover:ring-inset hover:ring-ink/40`. That ring is decorative, not a state.
    - The solar span is `text-sm font-semibold`: `text-ink` when selected, `text-ink-soft` out of month, `text-danger` on Sunday, `text-ink` otherwise.
    - The lunar span is `text-2xs leading-4`: `font-bold text-dusk` for special days in view, `text-ink` when selected, `text-ink-soft` otherwise.
    - `aria-current` and `aria-pressed` are unchanged.
- [ ] **Step 4: Run the ngay-tot tests.** `pnpm nx test @org/frontend -- ngay-tot calendar-day month-calendar`. Expected: all pass.
- [ ] **Step 5: Commit** `feat(ngay-tot): restyle the month calendar with ring-marked day states`.

### Task 3: Day detail and giờ xuất hành

**Files:**

- Modify: `features/ngay-tot/components/day-detail-card.tsx`, `features/ngay-tot/components/xuat-hanh-hours.tsx`
- Test: `features/ngay-tot/components/day-detail-card.spec.tsx`, `features/ngay-tot/components/xuat-hanh-hours.spec.tsx` (new)

**Interfaces:**

- Consumes: nothing new from the design system; neither component is interactive. `getGioXuatHanh` is the fixture source.
- Produces: no new exports. `ICON_SLUGS` and the `xuatHanhIconUrl` import go from `xuat-hanh-hours.tsx`.

- [ ] **Step 1: Write the failing tests.**
  - `day-detail-card.spec.tsx`, with `DATE = new Date(2026, 7, 11)`:
    - `shows the day on a Night panel without a gradient`: the root has `bg-night` and `text-day`, and no inline `background-image`.
    - `sets the day numeral in the preloaded Inter Tight 800`: the element with text `11` has `font-display`, `font-extrabold` and `text-gold`.
    - `keeps the năm, tháng and ngày can chi`: the labels `Năm`, `Tháng` and `Ngày` have `text-day-soft`. The can of `getDayCanChi(DATE)` (its first word) is in `text-dawn`.
    - `keeps the lunar date and the solar term`: `Âm lịch: ngày 29 tháng 6` and `/^Tiết /` are present.
    - `notes mùng 1 on a gold rule in dawn`: for the first lunar-1 date after `DATE`, the note matching `/Ngày mùng 1 âm lịch — ngày lễ quan trọng trong tháng/` has `border-gold/40` and `text-dawn`, and no `bg-` class.
    - `draws no corner brackets`: the only `svg` is the moon icon.
  - `xuat-hanh-hours.spec.tsx`, with `getGioXuatHanh({ day: 29, month: 6, year: 2026, isLeapMonth: false })`:
    - `titles the slots with a serif h2`: the h2 `Giờ Xuất Hành` has `font-emphasis` and `font-bold`, and not `uppercase`.
    - `says good and bad in words and icons, not colour alone`: the `Đại An` item holds `Giờ tốt` and an `svg`, and the `Xích Khẩu` item holds `Giờ xấu` and an `svg`.
    - `sets good slots on a gold badge and bad slots on an ink badge`: the `Giờ tốt` badge has `bg-gold` and `text-ink`, and the `Giờ xấu` badge has `bg-ink` and `text-day`.
    - `rings good slots in gold and lays bad slots on day-200`: the `Đại An` item has `border-gold`, and the `Xích Khẩu` item has `bg-day-200`.
    - `ships no Lục Diệu images`: no `img`.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- day-detail-card xuat-hanh-hours`. Expected: FAIL.
- [ ] **Step 3: Restyle.**
  - **Day detail:**
    - Root: `rounded-2xl bg-night p-4 text-day md:p-5`. `CARD_BACKGROUND`, the inline style and `CornerBrackets` go.
    - The left column's rule is `sm:border-day/20`.
    - The month line is `text-xs font-bold tracking-widest text-dawn uppercase`. It uses the Eyebrow tracking without the `Eyebrow` `<p>`, because it already is one.
    - The numeral is `font-display font-extrabold text-6xl leading-none text-gold md:text-7xl`.
    - The weekday is `text-xs font-semibold tracking-widest text-day-soft uppercase`.
    - In `CanChiColumn`, the label is `text-2xs font-semibold tracking-widest text-day-soft uppercase`, the can is `text-lg font-bold text-dawn` and the chi is `text-lg font-semibold text-day`. The dividers are `divide-day/20`.
    - The lunar box is `rounded-xl border border-day/20 px-4 py-3`, with the moon icon in `text-dawn`, the lunar line in `text-sm font-semibold text-day` and the tiết in `text-xs text-day-soft`.
    - The special-day note is `rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-dawn`.
  - **Xuất hành:**
    - Root: `rounded-2xl border border-ink/15 bg-day p-4 md:p-5`.
    - The title is an h2 in `font-emphasis font-bold text-2xl text-ink`, with `ink/15` hairlines on both sides. `TitleRule` and the diamonds go.
    - A good item is `rounded-xl border-2 border-gold bg-day p-3`; a bad item is `rounded-xl border border-ink/15 bg-day-200 p-3`.
    - The name is `text-sm font-bold text-ink uppercase` and the hours are `text-xs text-ink-soft`.
    - Good badges are `bg-gold text-ink`, bad badges `bg-ink text-day`. `Check` and `X` stay `aria-hidden`.
- [ ] **Step 4: Run the ngay-tot tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(ngay-tot): set the day detail on night and the xuất hành slots on day`.

### Task 4: Hour cards and the hour dialog

**Files:**

- Create: `features/ngay-tot/components/hour-dial.tsx`, `features/ngay-tot/components/star-rating.tsx`
- Modify: `features/ngay-tot/components/hour-quality-list.tsx`, `features/ngay-tot/components/hour-detail-dialog.tsx`
- Test: `features/ngay-tot/components/hour-dial.spec.tsx`, `features/ngay-tot/components/hour-quality-list.spec.tsx` (new)

**Interfaces:**

- Consumes: `pointsOnCircle`, `DisplayTitle` with `TitleFace.Serif`, `Chip`, `FOCUS_RING_CLASS`, lucide `Star`.
- Produces:

  ```ts
  export function HourDial(props: {
    readonly chiIndex: number;
    readonly className?: string;
  }): ReactElement;
  export function StarRating({ rating }: { readonly rating: number }): ReactElement;

  enum DetailTone {
    Neutral = 'neutral',
    Good = 'good',
    Bad = 'bad',
  }
  ```

  - `HourDial` is an `aria-hidden` SVG holding `pointsOnCircle(CHI_COUNT, DIAL_RADIUS)`. Index 0 starts at the top, so Tý is at the top and Ngọ at the bottom. The lit point is `fill-gold stroke-ink` at `LIT_POINT_RADIUS`; the rest are `fill-ink-soft` at `POINT_RADIUS`; the ring is `stroke-ink/20`. All radii are named constants.
  - `chiIndex` is the card's index in `items`, because `getGioHoangDao` returns the hours in chi order from Tý. Nothing parses the can chi string.
  - The card and its dialog share both marks. That is why `StarRating` and `HourDial` get their own files with only two call sites: the dialog must mirror the card.
  - `StarRating` keeps `role="img"` and `aria-label={`${rating} trên ${MAX_RATING} sao`}`. Filled stars are `fill-gold text-ink`, empty ones `fill-transparent text-ink-soft`. Each is `size-3.5`, and all are `aria-hidden`.
  - `DetailTone` replaces the `'neutral' | 'good' | 'bad'` union in `hour-detail-dialog.tsx`, with a `DETAIL_TONE_CLASS` record: Neutral `bg-day-200 text-ink`, Good `bg-gold text-ink`, Bad `bg-ink text-day`.

- [ ] **Step 1: Write the failing tests.**
  - `hour-dial.spec.tsx`:
    - `places Tý at the top of the dial and Ngọ at the bottom`: with `chiIndex={0}`, the larger circle's `cy` is < 0 and its `cx` is about 0. With `chiIndex={6}`, its `cy` is > 0.
    - `lights exactly one of the twelve points`: 12 point circles, of which exactly one has `fill-gold`.
    - `is hidden from assistive tech`: the `svg` has `aria-hidden="true"`.
  - `hour-quality-list.spec.tsx`, with `items = getGioHoangDao(new Date(2026, 7, 11))` and the clock fixed at `FIXED_NOW`:
    - `groups the hours under Hoàng đạo and Hắc đạo headings`: the h3s `Giờ Hoàng đạo` and `Giờ Hắc đạo` exist, and each is followed by a list of 6 buttons. The chips `6 giờ Hoàng đạo` and `6 giờ Hắc đạo` are present.
    - `titles the section with a serif h2`: the h2 `Giờ tốt xấu trong ngày` has `font-emphasis`, and not `uppercase`.
    - `gives every hour card the two-tone focus ring`: all 12 card buttons have the `FOCUS_RING_CLASS` tokens, and none has `focus-visible:outline-none`.
    - `rings hoàng đạo cards in gold and lays hắc đạo cards on day-200`: the `Bính Ngọ` card (Thanh Long, hoàng đạo) has `border-gold`, and the `Canh Tý` card (Bạch Hổ, hắc đạo) has `bg-day-200`. Both still show their `Hoàng đạo` / `Hắc đạo` text.
    - `rates with filled and outline stars, never faded ones`: inside the `Bính Ngọ` card, the `img` named `4 trên 5 sao` holds 4 `svg.fill-gold` and 1 `svg.fill-transparent`. No element in the section has an `opacity-` class.
    - `marks the current hour only when the day is today`: with `isToday`, the `Ất Tị` card holds `Bây giờ` and has `ring-2` and `ring-ink`. Rerendered with `isToday={false}`, there is no `Bây giờ`.
    - `opens the hour's detail with the same marks`:
      - click the `Bính Ngọ` card;
      - the `dialog` is named `Bính Ngọ` and holds `11h - 13h · Hoàng đạo`, the `img` `4 trên 5 sao` and an `svg[aria-hidden]` with 12 point circles;
      - the `Nghi` tag has `bg-gold`, and the `Kỵ` tag has `bg-ink` and `text-day`.
    - `ships no zodiac, plate or painting images`: no `img` in the section or in the open dialog.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- hour-dial hour-quality-list`. Expected: FAIL.
- [ ] **Step 3: Restyle.**
  - **Section:**
    - Root: `rounded-2xl border border-ink/15 bg-day px-4 py-6 md:px-8 md:py-8`. Both decor images go.
    - The h2 is `DisplayTitle as="h2" size={DisplaySize.Card} face={TitleFace.Serif}`, centred, with the subline in `text-sm text-ink-soft`.
    - The count chips are `Chip` in `text-ink`, with an `aria-hidden` `size-2 rounded-full` dot: `bg-gold` for Hoàng đạo, `bg-ink` for Hắc đạo.
  - **Group label:** an `h3` in `font-emphasis font-bold text-xl text-ink` between two `h-px flex-1 bg-ink/15` rules. `GroupLabel` loses `isDark`, and the plates and icons go.
  - **Card:**
    - The button is `block w-full min-w-0 rounded-xl transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0` with `FOCUS_RING_CLASS`.
    - Inside: `flex flex-col items-center gap-2 rounded-xl px-2 py-4`, with `border-2 border-gold bg-day` for hoàng đạo or `border border-ink/15 bg-day-200` for hắc đạo. Add `ring-2 ring-ink` when `isNow`.
    - Content order:
      - the range in `font-display font-extrabold text-sm text-ink tabular-nums`;
      - `HourDial` at `size-12`;
      - the can chi in `text-base font-bold text-ink`;
      - `Bây giờ` as `rounded-full bg-gold px-2 py-0.5 text-2xs font-bold text-ink`, or the hoàng / hắc label in `text-xs text-ink-soft`;
      - `StarRating`;
      - the chevron in `text-ink`.
    - `zodiacIcon`, `CornerBrackets` and the `isDark` branches go.
  - **Note:** `rounded-xl bg-day-200 px-4 py-3`, with the `Info` icon in `text-ink`, `Lưu ý:` in `font-semibold text-ink` and the rest in `text-ink-soft`.
  - **Dialog:**
    - The header is `HourDial` (`size-16`) inside a `rounded-full bg-day-200 p-2` disc. `DialogTitle` gets `font-display font-extrabold text-2xl text-ink`, and `DialogDescription` gets `text-ink-soft`.
    - The stars are `StarRating`.
    - The rows sit in `rounded-lg bg-day-200 px-4 py-3`, with each `DetailRow` tag in `text-2xs font-bold tracking-wide uppercase` plus its `DETAIL_TONE_CLASS`, and the text in `text-sm text-ink`.
    - `zodiacIconPath` and `MAX_RATING` leave this file.
- [ ] **Step 4: Run the ngay-tot tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(ngay-tot): draw the hour cards with a code dial and shape-coded stars`.

### Task 5: Phi Tinh and Nhị Thập Bát Tú

**Files:**

- Modify: `features/ngay-tot/components/phi-tinh-boards.tsx`, `features/ngay-tot/components/nhi-thap-bat-tu-panel.tsx`
- Test: `features/ngay-tot/components/phi-tinh-boards.spec.tsx`, `features/ngay-tot/components/nhi-thap-bat-tu-panel.spec.tsx` (new)

**Interfaces:**

- Consumes: `FOCUS_RING_CLASS`. The fixtures are `getPhiTinhBoards(new Date(2026, 7, 11), 15)` and `getNhiThapBatTu(new Date(2026, 7, 11), 15)`, the anchors the lib specs pin.
- Produces: `PHI_TINH_CELL_CLASS = { good: 'font-display font-extrabold text-hanh-hoa ring-1 ring-inset ring-hanh-hoa', plain: 'font-semibold text-ink' } as const`.

- [ ] **Step 1: Write the failing tests.**
  - `phi-tinh-boards.spec.tsx`:
    - `titles the boards with a serif h2`: the h2 `Cửu Cung Phi Tinh` has `font-emphasis`.
    - `marks good stars by shape and for screen readers, not colour alone`: in every board, each cell whose `cell.isGood` is true has `ring-1` and `text-hanh-hoa`, and contains an `.sr-only` with ` (sao tốt)`. Every other cell has neither.
    - `rings the picked board in ink on a gold tint`: after clicking the first board, it has `aria-pressed="true"`, `ring-ink` and `bg-gold/10`, and `Phi tinh <label>` is shown.
    - `clears the pick when the same board is clicked again`: a second click sets `aria-pressed="false"` and shows `Bấm vào từng bảng Phi Tinh để xem chi tiết.`.
    - `gives every board the focus ring`: all 4 board buttons have the `FOCUS_RING_CLASS` tokens.
    - `draws no gradients`: no element has a class starting with `bg-gradient` or `bg-linear`.
  - `nhi-thap-bat-tu-panel.spec.tsx`:
    - `titles the panel with a serif h2`: the h2 `Nhị Thập Bát Tú` has `font-emphasis`.
    - `names each pillar's sao on a gold pill`: there are 4 elements matching `/^Sao /`, each with `bg-gold` and `text-ink`.
    - `sets every verse line in the preloaded Playfair italic`: each verse line has `font-emphasis`, `italic` and `font-semibold`.
    - `draws no gradients`: as above.
- [ ] **Step 2: Run them.** `pnpm nx test @org/frontend -- phi-tinh-boards nhi-thap-bat-tu-panel`. Expected: FAIL.
- [ ] **Step 3: Restyle.**
  - **Shared panel frame:** `rounded-2xl border border-ink/15 bg-day p-4 md:p-5`. The title is an h2 in `font-emphasis font-bold text-2xl text-ink`, centred between `h-px max-w-24 flex-1 bg-ink/15` rules, and the gradient rules go. The two panels share only class strings, so no component is extracted until a third consumer exists.
  - **Phi Tinh boards:**
    - Each is `rounded-xl border p-2` with `FOCUS_RING_CLASS`: `border-ink/15 hover:border-ink/40` normally, `border-transparent bg-gold/10 ring-2 ring-inset ring-ink` when picked.
    - The label is `text-xs font-bold tracking-wide text-ink uppercase`.
    - The 3 × 3 grid has `border border-ink/20` and cells with `border-ink/15`. Each cell is `text-lg` plus `PHI_TINH_CELL_CLASS[cell.isGood ? 'good' : 'plain']`, and good cells carry `<span className="sr-only"> (sao tốt)</span>`.
    - The picked note is `rounded-lg border border-dashed border-ink/20 bg-day-200`, with the title in `text-sm font-semibold text-ink` and the body in `text-xs text-ink-soft`. The hint is `text-xs text-ink-soft`.
  - **Nhị Thập Bát Tú:**
    - Pillars are `rounded-lg bg-day-200 px-2 py-3`. The label is `text-2xs font-bold tracking-wide text-ink-soft uppercase`, the value `font-display font-extrabold text-2xl text-ink` and the can chi `text-sm font-semibold text-ink`.
    - The pill is `rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-ink`, and the element · animal line is `text-xs text-ink-soft`.
    - Verses are `rounded-lg border border-ink/15 bg-day px-4 py-3`. The full name is `text-base font-bold text-ink uppercase`, the subtitle `text-xs text-ink-soft` and the lines `font-emphasis italic font-semibold text-base leading-relaxed text-ink`.
- [ ] **Step 4: Run the ngay-tot tests.** Expected: all pass.
- [ ] **Step 5: Commit** `feat(ngay-tot): restyle phi tinh and nhị thập bát tú with shape-marked good stars`.

### Task 6: Media clean-up and the lint guard

**Files:**

- Delete: `features/ngay-tot/components/corner-brackets.tsx`
- Modify: `apps/frontend/src/config/media.ts`, `apps/frontend/src/lib/zodiac-icons.ts`, `apps/frontend/eslint.config.mjs`
- Test: `features/ngay-tot/ngay-tot-fonts.spec.ts` (new)

- [ ] **Step 1: Write the failing test.** `ngay-tot-fonts.spec.ts` reads every non-spec `.tsx` under `features/ngay-tot` the way `font-weights.spec.ts` walks the tree.
  - `uses only the weights the home page loads`: no file contains `font-medium`, `font-light`, `font-black`, or `font-extrabold` without `font-display` in the same class string.
  - `sets italics only in the preloaded Playfair`: every class string containing `italic` also contains `font-emphasis`.
  - `references no raster media`: no file imports `@/config/media` or `@/lib/zodiac-icons`.
- [ ] **Step 2: Run it.** `pnpm nx test @org/frontend -- ngay-tot-fonts`. Expected: it PASSES if Tasks 1–5 were followed. It is the guard against a later regression, so check that it fails by temporarily adding `font-medium` to one class, then revert.
- [ ] **Step 3: Remove the dead entries.**
  - Delete `corner-brackets.tsx`.
  - In `media.ts`, delete `xuatHanhIconUrl` and these `MEDIA.ngayTot` keys: `lichBackground`, `barWood`, `barMarble`, `calendarFoot`, `decorPine`, `labelPlateDark`, `labelPlateLight`, `labelIconMoon` and `labelIconSun`. Keep `sceneTop` and `decorCrane` (`kien-thuc-data.ts:101,117,149` and `kien-thuc-hero.tsx:70`).
  - In `zodiac-icons.ts`, drop the `variant` parameter and the `-gold` suffix. `zodiac-picker.tsx:62` and `van-han-detail.tsx:268` already call it with one argument.
  - Add `'src/features/ngay-tot/**'` to `MIGRATED_FILES`.
- [ ] **Step 4: Prove nothing still points at them.** `rg "CornerBrackets|xuatHanhIconUrl|calendarFoot|decorPine|labelPlate|labelIcon|lichBackground|barWood|barMarble|'gold'\)" apps/frontend/src` returns nothing.
- [ ] **Step 5: Run the gate.** `pnpm nx affected -t lint typecheck test`. Expected: lint has 0 errors, meaning the guard finds no hex and no `[Npx]` in `features/ngay-tot`. Typecheck and every test pass, including the unedited lib, layout and vận hạn specs.
- [ ] **Step 6: Commit** `refactor(ngay-tot): drop the raster ornaments and put the page under the style guard`. The body says the files under `public/ngay-tot/` and `public/zodiac/*-gold.png` stay for Phase 4.

### Task 7: Verification

- [ ] **Step 1: Build and prerender.** Run `pnpm nx build @org/frontend`.
  - Expected: `dist/apps/frontend/ngay-tot/index.html` contains `Ngày`, `Tốt`, the lead, `Hiệp Kỷ`, `Phi Tinh` and `Nhị Thập Bát Tú`.
  - Expected: its `<title>`, description, canonical and OG tags are byte-identical to the Task 0 "A" build. Diff the two `<head>`s.
- [ ] **Step 2: Prerender swap.** Serve the B build. Throttle to "Slow 4G" with 4× CPU in DevTools, and record a Performance trace at 390 × 844. The prerendered build day is replaced by today when the script runs.
  - Expected: no layout shift inside the first viewport. The hero and the calendar keep their height, because the grid is always 42 cells.
  - If the special-day note or the selected-day change moves visible content, report it. Do not patch it silently.
- [ ] **Step 3: Visual check** in the dev server (reuse the running one) at 320, 390, 640, 1024 × 700 and 1440 × 900, on all three tabs. Pick a month whose grid holds a mùng 1, a rằm, today and a Sunday from the neighbouring month.
  - Expected: `document.documentElement.scrollWidth === innerWidth` at every width.
  - Expected: every state in Review Focus 2 is distinguishable in a greyscale screenshot (DevTools → Rendering → Emulate vision deficiency → Achromatopsia).
  - Expected: Tab reaches every tab, day, control, hour card and board with the ring visible. Enter opens the dialog, and Escape closes it with focus back on the card.
  - Expected: at 320 × 568 the dialog and the last content sit above the bottom bar.
  - Screenshots go to the scratchpad for Kim An.
- [ ] **Step 4: Fonts and images.** Open DevTools Network on `/` and `/ngay-tot`.
  - Expected: the woff2 files `/ngay-tot` requests are a subset of those `/` requests.
  - Expected: no `image/*` other than the logo, before and after opening the dialog.
- [ ] **Step 5: Local Lighthouse A/B.** Serve the "A" build and this branch's build side by side with `vite preview`, each on its own port (never 4200; check `--help` for the flags). Run `npx -y lighthouse@12.8.2` mobile on `/ngay-tot` of each, 10 runs interleaved A, B, A, B, on the same machine in one sitting. Report the medians.
  - Expected: B's Performance ≥ A's, CLS 0, SEO 100, Best Practices ≥ A's, and Accessibility ≥ 95 and ≥ A's.
  - Expected: the LCP element is the h1.
  - Compare B's failing accessibility audits with Task 0's. If any names the tablist (`aria-valid-attr-value` on `aria-controls`, for example), report it to Kim An as the follow-up from Decision 13, with the score it costs.
  - If B is lower on Performance, find the cause (a new font file, a long task) before going further.
- [ ] **Step 6: Final review** by a fresh reviewer on the whole branch, with this Review Focus. Fix Critical and Important findings test-first.

After "tạo pull" and the merge: run the Task 0 measurement again on production (10 runs, `lighthouse@12.8.2`) and report both medians next to the A/B.
