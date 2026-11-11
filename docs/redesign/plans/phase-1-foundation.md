# Phase 1 — Foundation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the D3 "Khoảnh khắc" design system (tokens, fonts, geometry kit, motion helpers, story primitives, a lint guard and the new logo), then rebuild the shared shell on it, so the home story and every later page are assembled from parts.

**Architecture:**

- **One folder.** Everything brand-specific lives in `apps/frontend/src/design-system/`:
  - Tailwind v4 tokens in `tokens.css` and self-hosted fonts in `fonts.css`;
  - the geometry kit in `geometry/`;
  - scroll and motion helpers in `motion/`;
  - the story primitives, exported from `index.ts`.
- **Behavioural components stay put.** `src/components/ui` keeps its components and picks up the new look through the semantic tokens (`--primary`, `--background`…), which are remapped in Task 8.
- **Lint guard.** A local ESLint rule blocks hex colours and arbitrary px sizes in migrated files.

**Tech Stack:** React 19, Tailwind v4 (`@theme`), TanStack Router, Vite, Jest + Testing Library, ESLint flat config, `@fontsource` packages.

**Spec:** [docs/redesign/design.md](../design.md), sections "Visual identity — D3", "Asset kit", "Architecture" and "Phases → 1". Reference sketch: [docs/redesign/home-story-sketch.html](../home-story-sketch.html).

## Global Constraints

- **Palette** (verbatim from the spec): night `#0E1222`, deep `#1B2A4A`, dusk `#6B3A4D`, ember `#D9623B`, dawn `#F2C879`, day `#F7F2E7`, ink `#15131A`, gold `#F2B441`, ink soft `#5B5458`, day soft `#C9C2B4`. No other hues, except the chart data colours.
- **Contrast:**
  - Night, Deep and Dusk take Day text; Gold text is allowed on them.
  - Ember takes Ink text only.
  - Dawn and Day take Ink text. Gold is never text on them, only a fill with Ink text.
- **Type:**
  - Display is Inter Tight: 600–800 for headings, 300 for giant numerals.
  - Emphasis is Playfair Display Italic 600, at most once per heading.
  - Everything else is Be Vietnam Pro 400–700.
  - Heading line height is never below 1.15.
  - No Chinese characters anywhere.
- **Motion:**
  - Native scroll only. Animate only `transform`, `opacity` and `stroke-dashoffset`.
  - Every word is present and visible in the prerendered HTML.
  - Under `prefers-reduced-motion`, everything shows its final state.
- **Code rules:**
  - No code comments, no `any`, explicit types.
  - `SCREAMING_SNAKE_CASE` constants. Component files match their component names.
  - Never edit `routeTree.gen.ts`. Never `pkill` dev servers.
- **Dependencies:**
  - `@fontsource/inter-tight` and `@fontsource/playfair-display` need Kim An's explicit OK before `pnpm add`.
  - Keep only the new packages' hunks in `pnpm-lock.yaml`. A local `pnpm add` also strips `libc` fields, which must be restored.
- **Process:**
  - Branch `feat/redesign-phase-1-foundation`, cut from `dev`.
  - Commit, push and open a PR only when Kim An says "tạo pull". That PR is then merged once CI is green, so every PR is a production deploy.
  - No co-author trailer.
- **PR split:**
  - PR 1 = Tasks 1–6. It changes nothing visible.
  - PR 2 = Tasks 7–8, after Kim An approves the logo. It changes the whole site's look at once.
- **Gate:** `pnpm nx run-many -t lint typecheck test -p @org/frontend`. After PR 2, `/` and `/la-so` must not score below the Phase 0 baseline in `docs/redesign/baseline.md`.

## Review Focus

1. **Content hidden from crawlers and no-JS readers.** The prerender captures the DOM after the app ran, so a reveal that starts at `opacity: 0` ships hidden text. Test in Task 4.
2. **Reduced motion.** Scroll progress must report the final state and reveals must not hide anything. Tests in Task 4.
3. **Header and rail text on the wrong tone.** Day text over Ember, or Ink over Night, as the reader scrolls. Test in Task 6, checked by eye in Task 8.
4. **Long Vietnamese words in tight display tracking at 320 px.** "LẬP LÁ SỐ CỦA BẠN" must not clip or overflow. Test in Task 6 (`leading`); `scrollWidth === 320` in Task 8.
5. **Keyboard users.** Rail dots and the sticky CTA must be reachable, labelled and visibly focused. Tests in Task 6.

---

### Task 1: Self-hosted display fonts

**Files:**

- Modify: `apps/frontend/package.json` and `pnpm-lock.yaml`, via `pnpm --filter @org/frontend add @fontsource/inter-tight @fontsource/playfair-display` once Kim An has approved it
- Modify: `apps/frontend/src/design-system/fonts.css` (Be Vietnam Pro is already there from #182)

**Interfaces:**

- Produces:
  - the font families `'Inter Tight'` (300, 600, 700, 800) and `'Playfair Display'` (600 italic), with `font-display: swap`, in the Latin, Latin Extended and Vietnamese subsets only.

- [ ] **Step 1:** Ask Kim An to approve the two packages, then add them.
- [ ] **Step 2: Implement.** Import only the Latin, Latin Extended and Vietnamese subset files of each listed weight, for example `@fontsource/inter-tight/vietnamese-800.css` and `@fontsource/playfair-display/latin-600-italic.css`.
- [ ] **Step 3: Verify.** Build, then check that `dist/assets` has Inter Tight `latin`, `latin-ext` and `vietnamese` woff2 files and no `cyrillic` or `greek` ones, and that `dist/index.html` has no `fonts.googleapis`.
- [ ] **Step 4:** No preload yet. Nothing renders Inter Tight before the home story, so a preload now only wastes early bytes. The home page task in Phase 3 adds a preload for the face its heading uses and measures FCP with and without it.
- [ ] **Step 5: Commit** `perf(frontend): self-host Inter Tight and Playfair Display`.

### Task 2: D3 tokens and the contrast guard

**Files:**

- Modify: `apps/frontend/src/design-system/tokens.css` (replace the D2 values on the branch)
- Keep: `apps/frontend/src/design-system/contrast.ts`
- Modify: `apps/frontend/src/design-system/tokens.spec.ts`
- Modify: `apps/frontend/src/styles.css`. Import the tokens and delete the `.dark` blocks and `@custom-variant dark`. The semantic `:root` values stay as they are until Task 8.
- Modify: `apps/frontend/src/components/ui/button.tsx` and `input.tsx`, to remove their `dark:` utilities

**Interfaces:**

- Produces Tailwind utilities from `@theme` in `tokens.css`:
  - **Palette:** `--color-night`, `--color-deep`, `--color-dusk`, `--color-ember`, `--color-dawn`, `--color-day`, `--color-ink`, `--color-gold`, `--color-ink-soft`, `--color-day-soft`, plus `--color-day-200: #EDE6D6` for muted surfaces.
  - **Chart data:** `--color-hanh-kim`, `--color-hanh-moc`, `--color-hanh-thuy`, `--color-hanh-hoa`, `--color-hanh-tho`, `--color-chart-block`, each tuned to pass AA on Day.
  - **Fonts:** `--font-sans` for Be Vietnam Pro, `--font-display: 'Inter Tight', 'Be Vietnam Pro', sans-serif`, and `--font-emphasis: 'Playfair Display', serif`.
  - **Reading:** `--text-reading: 1.0625rem`, `--leading-reading: 1.7`, `--container-reading: 68ch`.
  - **Display tracking:** `--tracking-display: -0.045em`.
- Produces `contrastRatio(foreground: string, background: string): number` (already on the branch).

- [ ] **Step 1: Write the failing tests in `tokens.spec.ts`.**
  - `keeps the palette exactly as specified`: every value in Global Constraints.
  - `dark chapters take day text`: Day on Night, Deep and Dusk is ≥ 4.5.
  - `ember takes ink, never day`: Ink on Ember is ≥ 4.5, and Day on Ember is < 4.5.
  - `light chapters take ink`: Ink on Dawn and on Day is ≥ 4.5.
  - `gold is a fill on light surfaces, never text`: Gold on Day is < 3, and Ink on Gold is ≥ 4.5.
  - `muted text passes AA`: Ink soft on Day, on Day-200 and on Dawn, and Day soft on Night, Deep and Dusk, are all ≥ 4.5.
  - `every chart data colour passes AA on day`: six tokens, each ≥ 4.5.
  - Keep the existing `contrastRatio` tests.
- [ ] **Step 2:** Run `pnpm nx test @org/frontend -- --testPathPatterns=design-system/tokens`. Expected: FAIL.
- [ ] **Step 3:** Implement the token values and the `styles.css` and `ui` changes.
- [ ] **Step 4: Verify.** Run the full frontend gate. Expected: PASS, and the site looks exactly as before, because nothing uses the new utilities yet.
- [ ] **Step 5: Commit** `feat(design-system): add D3 tokens with a contrast guard`.

### Task 3: Lint guard against ad-hoc colours and sizes

Already implemented on the branch and unchanged by the move to D3.

**Files:** `apps/frontend/eslint-rules/no-ad-hoc-style.mjs`, `no-ad-hoc-style.spec.ts`, `apps/frontend/eslint.config.mjs`.

**Interfaces:**

- Produces the rule `local/no-ad-hoc-style`. It reports every string literal or template piece in a migrated file that contains a Tailwind arbitrary value with a hex colour or a px size (`text-[#fff]`, `ring-[3px]`, `shadow-[0_0_0_3px_#fff]`), and every string that is a bare hex colour (`'#f5f0e6'`). Hoisted class constants, `cva` calls and lookup maps are covered.
- Produces `MIGRATED_FILES`, which starts empty; the config block is skipped while it is empty. `src/design-system/**` is always exempt. Task 8 adds `src/components/layout/**` and `src/components/ui/**`.

- [ ] **Step 1:** Re-run `pnpm nx test @org/frontend -- --testPathPatterns=no-ad-hoc-style`. Expected: PASS.
- [ ] **Step 2: Commit** `chore(frontend): add a lint guard against ad-hoc colours and px sizes`.

### Task 4: Motion helpers

**Files:**

- Create in `apps/frontend/src/design-system/motion/`:
  - `scroll-progress.ts`
  - `active-chapter.ts`
  - `use-section-progress.ts`
  - `use-prefers-reduced-motion.ts`
  - `motion.spec.ts`
- Modify: `apps/frontend/src/components/reveal.tsx` and `apps/frontend/src/styles.css`
- Modify: `apps/frontend/src/main.tsx`, which sets `document.documentElement.dataset.motion = 'ready'` before rendering
- Modify: `apps/frontend/tools/prerender.mjs`, which removes `data-motion` from `<html>` before capture
- Test: `apps/frontend/src/components/reveal.spec.tsx`

**Interfaces:**

- Produces:
  - `sectionProgress(top: number, height: number, viewportHeight: number): number`. This is `-top / (height - viewportHeight)`, clamped to 0..1, and returns 1 when `height <= viewportHeight`.
  - `chapterIndexAt(chapters: readonly ChapterBounds[], probeLine: number): number | null`, with `ChapterBounds` being `{ top, bottom }`. It returns the chapter whose span contains `probeLine` (px from the viewport top; a shared edge belongs to the lower chapter), and null above the first chapter or below the last one. Callers choose the line, so the header and the rail each probe the chapter actually under them.
  - `usePrefersReducedMotion(): boolean`, which follows the media query live.
  - `useSectionProgress(ref: RefObject<HTMLElement | null>): number`. It returns 1 until the first scroll or resize, so markup captured by the prerender shows the final state. After that it follows the scroll, throttled to one update per animation frame. It always returns 1 under reduced motion.
  - A Tailwind custom variant `motion-ready`, matching `html[data-motion=ready] &`. `Reveal` applies its hidden state only through this variant.

- [ ] **Step 1: Write the failing tests.**
  - `sectionProgress`:
    - `(0, 2000, 1000)` gives 0;
    - `(-500, 2000, 1000)` gives 0.5;
    - `(-3000, 2000, 1000)` gives 1;
    - `(200, 2000, 1000)` gives 0;
    - `(0, 800, 1000)` gives 1.
  - `chapterIndexAt` over spans `[-900,-100)`, `[-100,700)`, `[700,1500)`: line 384 gives 1, line 700 gives 2, line -950 and line 1600 give null.
  - `useSectionProgress` returns 1 when `matchMedia('(prefers-reduced-motion: reduce)')` matches, returns 1 before any scroll, and returns 0.5 after a scroll with the section at top −500 and 1000 px of scroll distance.
  - `chart-anatomy-section.spec.tsx`: every home feature card has `motion-ready:opacity-0` and no bare `opacity-0`. Both it and `Reveal` take their classes from `src/components/reveal-classes.ts`.
  - `reveal.spec.tsx`, `keeps content visible in prerendered HTML`: the rendered class list of a not-yet-revealed `Reveal` contains no bare `opacity-0`, only `motion-ready:opacity-0`.
  - A prerender spec, in the style of `strip-modulepreload-links.spec.ts`, for `stripMotionReady(html: string): string`: `<html lang="vi" data-motion="ready">` becomes `<html lang="vi">`.
- [ ] **Step 2:** Run `pnpm nx test @org/frontend -- --testPathPatterns="design-system/motion|reveal|strip-motion"`. Expected: FAIL.
- [ ] **Step 3:** Implement. `stripMotionReady` lives in `apps/frontend/tools/strip-motion-ready.mjs` and is applied in `prerender.mjs` beside the other strip functions.
- [ ] **Step 4: Verify.**
  - Re-run the tests. Expected: PASS.
  - Build and prerender, then `grep -c 'data-motion' apps/frontend/dist/kien-thuc/index.html`. Expected: `0`.
- [ ] **Step 5: Commit** `feat(design-system): add scroll and motion helpers that never hide prerendered content`.

### Task 5: Geometry kit

**Files:**

- Create in `apps/frontend/src/design-system/geometry/`:
  - `points-on-circle.ts`
  - `Orbit.tsx`
  - `GiantNumeral.tsx`
  - `geometry.spec.tsx`

**Interfaces:**

- Produces:
  - `interface CirclePoint { readonly x: number; readonly y: number }`
  - `pointsOnCircle(count: number, radius: number, startAngleDeg = -90): readonly CirclePoint[]`, with the centre at `(0, 0)`, going clockwise.
  - `Orbit({ rings = 3, points = 0, className }: { readonly rings?: number; readonly points?: number; readonly className?: string })`. It renders an inline `<svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">` with concentric circles and optional dots on the outer ring. All strokes and fills use `currentColor`.
  - `GiantNumeral({ value, label, className }: { readonly value: string; readonly label: string; readonly className?: string })`. It renders `value` in Inter Tight 300 with `aria-label={label}`, for example value `12 · 03 · 1995` and label `12 tháng 03 năm 1995`.

- [ ] **Step 1: Write the failing tests.**
  - `pointsOnCircle(4, 10)` gives `(0, -10), (10, 0), (0, 10), (-10, 0)`, within 1e-9.
  - `pointsOnCircle(12, 50)` has 12 points, all at distance 50.
  - `an orbit is hidden from assistive technology`: the root has `aria-hidden="true"` and `focusable="false"`.
  - `an orbit draws the requested rings and points`: `rings={2} points={12}` gives 2 circles without a fill and 12 filled dots.
  - `an orbit takes its colour from text colour only`: no `fill` or `stroke` attribute matches `/#[0-9a-f]{3,8}/i`.
  - `a giant numeral is announced by its label`: `getByLabelText('12 tháng 03 năm 1995')`.
- [ ] **Step 2:** Run `pnpm nx test @org/frontend -- --testPathPatterns=design-system/geometry`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run. Expected: PASS.
- [ ] **Step 5: Commit** `feat(design-system): add the geometry kit`.

### Task 6: Story primitives

**Files:**

- Create in `apps/frontend/src/design-system/`:
  - `chapter-tone.ts`
  - `StoryProvider.tsx`
  - `StoryChapter.tsx`
  - `ChapterRail.tsx`
  - `StickyCta.tsx`
  - `Eyebrow.tsx`
  - `DisplayTitle.tsx`
  - `TextLink.tsx`
  - `Tile.tsx`
- Modify: `CtaButton.tsx`, `Chip.tsx`, `ReadingZone.tsx` and `index.ts`
- Delete: the D2-only `Panel.tsx` and `RibbonTitle.tsx` from the branch
- Modify: `apps/frontend/src/design-system/primitives.spec.tsx`

**Interfaces:**

- Produces, all exported from `@/design-system`:
  - `enum ChapterTone { Night = 'night', Deep = 'deep', Dusk = 'dusk', Ember = 'ember', Dawn = 'dawn', Day = 'day' }`.
  - `CHAPTER_TONE_CLASS: Readonly<Record<ChapterTone, string>>`, the background and text pair per tone, following the contrast rules.
  - `isDarkTone(tone: ChapterTone): boolean`, which is true for Night, Deep and Dusk.
  - `StoryProvider({ children })`, a registry of chapters in document order.
  - `type ChapterAnchor = (viewportHeight: number) => number`, `VIEWPORT_CENTRE: ChapterAnchor`, and `useChapterAt(anchor: ChapterAnchor): ChapterSummary | null`, where `ChapterSummary` is `{ id, label, tone }`. Each caller measures on its own scroll and resize listeners, so the provider adds none.
  - `FOCUS_RING_CLASS`: a two-tone ring (an Ink outline outside a Day ring) that stays visible on every tone. It is used by `CtaButton`, `TextLink`, `StickyCta` and the rail links.
  - `StoryChapter({ id, tone, label, children, className }: { readonly id: string; readonly tone: ChapterTone; readonly label: string; readonly children: ReactNode; readonly className?: string })`. It renders `<section id={id} data-tone={tone}>` with the tone classes, and registers with the provider when one exists.
  - `ChapterRail()`, probing `VIEWPORT_CENTRE`. It renders `<nav aria-label="Các chương">` with one link per registered chapter (`href="#id"`, `aria-label` set to the chapter label, `aria-current="location"` on the active one). It is hidden below 900 px. Its dots use Day on dark tones and Ink on light tones; the active dot is Gold on dark tones and Ink on light ones. It sits at `z-40`, below dialogs.
  - `StickyCta({ to, children }: { readonly to: LinkProps['to']; readonly children: ReactNode })`. It is a gold fixed link, bottom-right, at `z-40`, hidden below 768 px (`md`), where the mobile nav bar's centre button takes its place.
  - `Eyebrow({ children })`: uppercase, 12 px, wide tracking.
  - `DisplayTitle({ as = 'h2', size, children }: { readonly as?: 'h1' | 'h2' | 'h3'; readonly size: DisplaySize; readonly children: ReactNode })`, with `enum DisplaySize { Hero = 'hero', Chapter = 'chapter', Card = 'card' }`. It sets `font-display`, `tracking-display`, a fluid size, and a line height of at least 1.15.
  - `Emphasis({ children })`: Playfair Display Italic 600.
  - `enum CtaTone { Gold = 'gold', Outline = 'outline' }` with `CtaButton(props: CtaButtonProps)`, where `CtaButtonProps` keeps the link-or-button union already on the branch.
  - `TextLink({ to, children })`, an underlined, 44 px tall link.
  - `Chip({ children })`, an outline pill in `currentColor`.
  - `Tile({ title, caption, isActive = false }: { readonly title: string; readonly caption?: string; readonly isActive?: boolean })`. It sets `aria-current="true"` when active.
  - `ReadingZone({ children })`, unchanged.

- [ ] **Step 1: Write the failing tests in `primitives.spec.tsx`.**
  - `a chapter renders a section with its id and tone`.
  - `every tone pairs a background with readable text`: `CHAPTER_TONE_CLASS[ChapterTone.Ember]` contains `text-ink`, and each dark tone contains `text-day`.
  - `the rail lists registered chapters as labelled links and marks the active one`: render a provider with three chapters; the rail has three links named by their labels, and exactly one has `aria-current="location"`.
  - `the rail switches to ink dots over a light chapter`: with an active Day chapter, the rail's class contains `text-ink`.
  - `the sticky CTA is a link that is reachable by keyboard and shows a focus ring`.
  - `a display title never sets line height below 1.15`: no `leading-none`, `leading-[1]` or `leading-[1.1]`.
  - `a display title renders the requested heading level`.
  - `a CTA with a destination is a link, without one it is a button` (kept from the branch).
  - `the active tile is marked current and the others are not`.
- [ ] **Step 2:** Run `pnpm nx test @org/frontend -- --testPathPatterns=design-system/primitives`. Expected: FAIL.
- [ ] **Step 3:** Implement using token utilities only.
- [ ] **Step 4: Verify.**
  - Re-run. Expected: PASS.
  - Render a temporary kit page, using the method in the ledger, with three chapters (Night, Ember, Day) and every primitive. Use real copy: "Lập lá số tử vi", "LẬP LÁ SỐ CỦA BẠN", "Câu chuyện của bạn bắt đầu từ đây".
  - Check `scrollWidth === 320` at a 320 px viewport, and show Kim An the screenshots. Delete the temporary page.
- [ ] **Step 5: Commit** `feat(design-system): add the D3 story primitives`.

### Task 7 (Kim An approves): New logo and brand icons

**Files:**

- Create:
  - `apps/frontend/src/design-system/brand/Logo.tsx`
  - `apps/frontend/src/design-system/brand/LogoMark.tsx`
  - `apps/frontend/public/brand/icon.svg`
  - `icon-180.png`, `icon-192.png`, `icon-512.png` and `og-default.png` (1200×630), all in `public/brand/`
- Modify:
  - `apps/frontend/index.html` (icon links)
  - `apps/frontend/src/config/media.ts` (`brand.logo` and `brand.icon`)
  - `apps/frontend/src/lib/seo.ts` (`DEFAULT_OG_IMAGE`, `logo`)
  - `apps/frontend/src/features/tet-hub/tet-hub-json-ld.ts` and `apps/frontend/src/routes/_site/kien-thuc.$slug.tsx` (JSON-LD logo URLs)
- Test: `apps/frontend/src/design-system/brand/Logo.spec.tsx`

**Interfaces:**

- Produces:
  - `Logo({ tone, className }: { readonly tone: LogoTone; readonly className?: string })`, with `enum LogoTone { OnDark = 'on-dark', OnLight = 'on-light' }`. It renders `<span role="img" aria-label="Tử Vi Miễn Phí">` containing the mark and the wordmark in Inter Tight 800.
  - `LogoMark({ className })`: the mark only, `aria-hidden`, drawn from the geometry kit.
- The wordmark in `icon.svg` and the PNGs is outlined to paths, because favicons do not load web fonts.

- [ ] **Step 1: Draft 3 options.** Each is the wordmark with a different mark: a ring with one point, a crescent, and a 12-point orbit. Show them on Night and on Day, at 24 px and 120 px tall.
- [ ] **Step 2: Kim An picks one.** Iterate until signed off.
- [ ] **Step 3: Write the failing test.** `the logo is announced once as the site name`: `getByRole('img', { name: 'Tử Vi Miễn Phí' })`, and the mark is not announced separately.
- [ ] **Step 4: Implement the components and export the icon files** with `pnpm dlx sharp-cli`. `og-default.png` is the logo on Night with an orbit, at most 120 KB.
- [ ] **Step 5: Verify.** Run the test, then build. Expected: `dist/index.html` references `/brand/icon.svg` and `/brand/icon-180.png`, and no longer references `logo.png`, `logo.webp` or `icon.png`. The old files are deleted in Phase 4.
- [ ] **Step 6: Commit** `feat(brand): add the D3 logo, favicon and default share image`.

### Task 8: Shared shell in D3

**Files:**

- Modify in `apps/frontend/src/components/layout/`:
  - `site-header.tsx`
  - `site-footer.tsx`
  - `mobile-nav-bar.tsx`
  - `page-placeholder.tsx`
  - `navigation-progress.tsx`
- Modify:
  - `apps/frontend/src/components/ui/page-loader.tsx`
  - `apps/frontend/index.html` (splash markup and styles)
  - `apps/frontend/src/styles.css`: the semantic `:root` mapping and the re-measured `--site-header-height`
  - `apps/frontend/src/components/layout/site-layout.tsx` (new; the `_site` layout, wrapped in `StoryProvider` so a page's chapters reach the header)
  - `apps/frontend/src/components/ui/**`, fixing the 59 violations in 16 files that the Task 3 rule reports under `src/components`
  - `apps/frontend/eslint.config.mjs` (add `src/components/layout/**` and `src/components/ui/**` to `MIGRATED_FILES`)
- Test: `apps/frontend/src/components/layout/site-header.spec.tsx` (create)

**Interfaces:**

- Consumes: `Logo`, `useChapterAt` (the header probes the line at its own bottom edge; Ember keeps full Ink; no chapter under it means Ink), `isDarkTone`, `CtaButton` and the tokens.
- Semantic mapping in `:root`:
  - `--background` is Day; `--foreground`, `--card-foreground` and `--accent-foreground` are Ink; `--card` is Day;
  - `--primary` is Ink and `--primary-foreground` is Day (gold text on light surfaces is 1.65:1, and two dozen pages still use `text-primary`);
  - `--secondary` is Night and `--secondary-foreground` is Day;
  - `--muted` is Day-200 and `--muted-foreground` is Ink soft;
  - `--accent` is Dawn;
  - `--ring` is Ink (gold focus is invisible on Day);
  - `--destructive` is `--color-danger: #B42318`, which passes AA on Day and Day-200;
  - `--border` and `--input` are Ink at 18%.
- Produces the restyled shell. Nav items, routes and behaviour are unchanged.

- [ ] **Step 1: Write the failing tests in `site-header.spec.tsx`.**
  - `the header marks the current section with aria-current="page"`.
  - `the header shows the site name once to assistive technology`.
  - `the header uses day text over a dark chapter and ink text over a light one`.
- [ ] **Step 2:** Run `pnpm nx test @org/frontend -- --testPathPatterns=layout/site-header`. Expected: FAIL.
- [ ] **Step 3: Restyle the shell.**
  - **Header:** transparent and fixed, following the active chapter's tone. Outside a story it is a solid Day bar with Ink text.
  - **Footer:** Day with Ink.
  - **Mobile nav bar:** a Day bar with Ink-soft items, the active item in Ink with a Gold dot, and a raised Gold centre button "Lập lá số".
  - **Splash:** a Night field, the new logo and a Gold progress bar.
  - Use tokens only, and fix every lint violation. Re-measure the header at 390, 768 and 1440 px.
- [ ] **Step 4: Verify.**
  - Run the full frontend gate.
  - On a local build, check `document.documentElement.scrollWidth === 320` at 320×640 on `/`, `/la-so`, `/ngay-tot` and `/kien-thuc`.
  - Run Lighthouse mobile three times each on `/` and `/la-so`. Expected: every category at or above its baseline, and CLS < 0.1.
- [ ] **Step 5: Commit** `feat(frontend): rebuild the shared shell in D3`.

---

Out of this phase:

- The header decides story mode at runtime, after chapters register, so a story page shifts by the header height on load. The home story in Phase 3 must decide it per route (route `staticData` or a header prop) and measure in a layout effect, and must pass the CLS gate.

- The home page's seven chapters are Phase 3's first page. They are built from the sketch with these primitives, plus a decorative 12-cung board that lives in `features/home`.
- Painted illustrations follow the asset-kit rule in the design. They are added only after a page passes its gates without them.
