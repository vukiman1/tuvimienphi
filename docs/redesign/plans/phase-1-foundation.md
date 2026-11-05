# Phase 1 — Foundation: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the D2 design system: tokens, fonts, the ornament kit, brand primitives, the new logo, a lint guard and the illustration pipeline. Then rebuild the shared shell (header, footer, mobile nav, splash) on it, so the Tết hub and every later page can be built from parts.

**Architecture:**

- **One folder.** Everything brand-specific lives in `apps/frontend/src/design-system/`:
  - Tailwind v4 tokens in `tokens.css`;
  - self-hosted fonts in `fonts.css`;
  - ornaments and Han glyphs as typed TSX/SVG components;
  - the brand primitives.
- **Behavioural components stay put.** `src/components/ui` keeps its components and picks up the new look through the semantic tokens (`--primary`, `--background`…), which now map onto the D2 palette.
- **Lint guard.** A local ESLint rule blocks hex colours and arbitrary px sizes in migrated files.

**Tech Stack:** React 19, Tailwind v4 (`@theme`), TanStack Router, Vite, Jest + Testing Library, ESLint flat config, `@fontsource` packages.

**Spec:** [docs/redesign/design.md](../design.md), sections "Visual identity", "Asset kit", "Architecture" and "Phases → 1".

## Global Constraints

- **Palette** (verbatim from the spec):
  - son `#b3282d`
  - gold `#f4c542`
  - jade `#1f6f64`
  - cream `#fff6dc`
  - ink `#3a1d14`
  - deep red `#7d1a1e`

  Tints are allowed. New hues are not, except the chart data colours.

- **Contrast:**
  - Gold on son is only for display text ≥ 24 px (or ≥ 19 px bold).
  - Body text is ink on cream, or cream on son or jade, at WCAG AA (4.5:1).
- **Type:** display is Phudu, weights 700–900. Everything else is Be Vietnam Pro, weights 400–700. Han characters come from SVG only, never from a CJK web font.
- **Ornament:** flat fills, clear outlines, palette colours only. No gradients, except subtle paper texture on cream.
- **Zones:**
  - Showcase zones use full colour and ornament.
  - Reading zones use a cream surface and ink text, with ornament on the title only.
  - Reading copy is 17–18 px, line height about 1.7, with lines of 60–75 characters.
- **Asset acceptance:** palette colours only, flat fills, clear outlines, matches the reference hand, within its size budget, and signed off by Kim An.
- **Licensing:** never upload licensed pack files to ChatGPT or any other AI tool.
- **Code rules:**
  - No code comments.
  - No `any`.
  - Explicit types.
  - `SCREAMING_SNAKE_CASE` constants.
  - Component files match their component names.
  - Never edit `routeTree.gen.ts`.
  - Never `pkill` dev servers.
- **Dependencies:** adding the two `@fontsource` packages needs Kim An's explicit OK before `pnpm add`.
- **Process:**
  - Branch `feat/redesign-phase-1-foundation`, cut from `dev`.
  - Commit steps run only once Kim An has authorised commits.
  - No co-author trailer.
- **Gate:** `pnpm nx affected -t lint typecheck test`. In addition, `/` and `/la-so` must not score below the Phase 0 baseline in `docs/redesign/baseline.md` after the shell ships.

## Review Focus

1. **Long Vietnamese words in Phudu.**
   - Uppercase display text with stacked marks ("LẬP LÁ SỐ CỦA BẠN", "TỬ VI MIỄN PHÍ") must not collide or clip at the tight line height Phudu invites.
   - Test lives in Task 6 (primitives render with `leading` no tighter than 1.15) and in the Task 8 visual check.
2. **Narrow phones (320 px).**
   - The header, the mobile nav bar and the ribbon titles must not overflow horizontally.
   - Verified in Task 8 with `document.documentElement.scrollWidth === 320`.
3. **Keyboard and screen-reader users.**
   - Ornaments and decorative seals must be hidden from assistive technology.
   - CTAs must be real links or buttons with a visible focus ring on red.
   - Tests live in Task 5 and Task 6.
4. **Fonts that fail to load or load slowly.**
   - `font-display: swap` plus metric-compatible fallbacks keep the shell from shifting.
   - CLS < 0.1 on `/`, checked in Task 8.
5. **A future contributor pasting `text-[#c9a15c]` into a migrated file.**
   - The lint guard must fail the build.
   - Test lives in Task 4.

---

### Task 1 (Kim An + builder): Choose and license the ornament pack

**Files:**

- Create: `docs/redesign/asset-license.md`

- [ ] **Step 1: Shortlist.** The builder shortlists 3 packs on Freepik or Envato and shows them to Kim An as screenshots in the visual companion. Each pack must:
  - be by one author;
  - be vector (AI, EPS or SVG);
  - cover tường vân clouds, hồi văn fret borders, a scroll, a round frame, a lantern, seal frames and ribbon banners;
  - have a licence allowing commercial use on a website.
- [ ] **Step 2: Kim An picks one and buys it.** The source files stay outside the repo.
- [ ] **Step 3: Record the licence.** Write `asset-license.md` with:
  - pack title, author and URL;
  - purchase date and the licence type and ID;
  - the licence's attribution requirement, if any;
  - the line "Never upload these files to AI tools."
- [ ] **Step 4: Commit** with message `docs(redesign): record the ornament pack licence`.

---

### Task 2: Self-hosted fonts

**Files:**

- Modify: `apps/frontend/package.json`, via `pnpm add` once Kim An has approved it
- Modify: `apps/frontend/index.html`, to remove the Google Fonts `<link>` and both `preconnect` tags
- Modify: `apps/frontend/src/styles.css`
- Create: `apps/frontend/src/design-system/fonts.css`

**Interfaces:**

- Produces: the font families `'Be Vietnam Pro'` (400, 500, 600, 700, plus 400 italic) and `'Phudu'` (700, 800, 900), loaded from the bundle with `font-display: swap`.

- [ ] **Step 1: Ask Kim An to approve the dependencies.** Then run `pnpm --filter @org/frontend add @fontsource/be-vietnam-pro @fontsource/phudu`.
- [ ] **Step 2: Write `fonts.css`.** It imports only the listed weight files (for example `@fontsource/phudu/800.css`). `styles.css` imports `./design-system/fonts.css`.
- [ ] **Step 3: Update the splash.** Point its `font-family` in `index.html` at `'Phudu'` for the label and at `'Be Vietnam Pro'` for the hint.
- [ ] **Step 3b: Preload the above-the-fold faces.**
  - Preload only the Vietnamese and Latin `woff2` files for Phudu 800 and Be Vietnam Pro 400.
  - Inject `<link rel="preload" as="font" type="font/woff2" crossorigin>` tags at build time with the hashed URLs; the mechanism is the builder's choice.
  - No other face is preloaded.
- [ ] **Step 4: Verify.**

  Run `pnpm nx build @org/frontend`, then `grep -c "fonts.googleapis" apps/frontend/dist/index.html`.

  Expected:
  - The grep prints `0`.
  - `grep -c 'rel="preload" as="font"' apps/frontend/dist/index.html` prints `2`.
  - In the dev server, `[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)` includes both families.
  - The Network tab shows no request to `fonts.gstatic.com`.

- [ ] **Step 5: Commit** with message `perf(frontend): self-host Be Vietnam Pro and Phudu`.

---

### Task 3: Design tokens and the contrast guard

**Files:**

- Create: `apps/frontend/src/design-system/tokens.css`
- Create: `apps/frontend/src/design-system/contrast.ts`
- Modify: `apps/frontend/src/styles.css`
  - Import the tokens.
  - Map the semantic variables onto the palette.
  - Delete the `.dark` block and `@custom-variant dark`.
- Test: `apps/frontend/src/design-system/tokens.spec.ts`

**Interfaces:**

- Produces Tailwind utilities from `@theme` in `tokens.css`:
  - **Palette:** `--color-son`, `--color-son-deep`, `--color-gold`, `--color-jade`, `--color-cream`, `--color-ink`, plus tints named `--color-<hue>-<n>` where needed.
  - **Chart data:** `--color-hanh-kim`, `--color-hanh-moc`, `--color-hanh-thuy`, `--color-hanh-hoa`, `--color-hanh-tho`, `--color-chart-block`. Start from the hues in `features/la-so/chart-colors.ts`. Darken Kim (`#8a8578`) and Thổ (`#b8860b`) until they pass on cream.
  - **Fonts:** `--font-sans: 'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif` and `--font-display: 'Phudu', 'Be Vietnam Pro', sans-serif`.
  - **Reading:** `--text-reading: 1.0625rem`, `--leading-reading: 1.7`, `--container-reading: 68ch`.
- Produces `contrastRatio(foreground: string, background: string): number`, for `#rrggbb` input, following WCAG 2.x relative luminance.
- Semantic mapping in `:root`:
  - `--background` is cream;
  - `--foreground` and `--card-foreground` are ink;
  - `--primary` is son;
  - `--primary-foreground` is cream;
  - `--secondary` is jade;
  - `--secondary-foreground` is cream;
  - `--ring` is gold;
  - `--border` and `--input` are an ink tint at about 18%.

- [ ] **Step 1: Write the failing tests.** `tokens.spec.ts` reads `tokens.css` with `fs` and parses `--color-*: #xxxxxx` pairs.
  - `contrastRatio('#000000', '#ffffff')` is `21`, and `contrastRatio('#777777', '#ffffff')` is about `4.48`.
  - `keeps the six palette colours exactly as specified`: the parsed son, gold, jade, cream, ink and son-deep equal the spec values.
  - `reading text passes AA`: ink on cream ≥ 4.5.
  - `text on brand surfaces passes AA`: cream on son and cream on jade, both ≥ 4.5.
  - `gold on son is large-text only`: the ratio is ≥ 3 and < 4.5. This documents why the rule exists.
  - `every chart data colour passes AA on cream`: each `--color-hanh-*` and `--color-chart-block` vs cream is ≥ 4.5.
- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm nx test @org/frontend --testPathPattern=design-system/tokens`
  Expected: FAIL

- [ ] **Step 3: Implement** `contrast.ts`, `tokens.css` and the `styles.css` changes.
- [ ] **Step 4: Verify**

  Run the tests above, then `pnpm nx run-many -t lint typecheck test -p @org/frontend`.
  Expected: PASS. In the dev server, every page's background turns cream and nothing else breaks. Dark mode is gone.

- [ ] **Step 5: Commit** with message `feat(design-system): add D2 tokens with a contrast guard`.

---

### Task 4: Lint guard against ad-hoc colours and sizes

**Files:**

- Create: `apps/frontend/eslint-rules/no-ad-hoc-style.mjs`
- Modify: `apps/frontend/eslint.config.mjs`
- Test: `apps/frontend/eslint-rules/no-ad-hoc-style.spec.ts`

**Interfaces:**

- Produces the ESLint rule `local/no-ad-hoc-style`. It reports:
  - **in `className`:** hex colours (`#[0-9a-fA-F]{3,8}`) and arbitrary px values (`\[-?\d+(\.\d+)?px\]`) inside string literals, template literals, and string arguments of calls such as `cn(…)`;
  - **in `style={{…}}`:** hex colours in object literals.
- Produces `MIGRATED_FILES`, a glob array in `eslint.config.mjs`. The rule is applied to these files only.
  - It starts empty.
  - Task 8 adds `src/components/layout/**` and `src/components/ui/**` once their violations are fixed.
  - Each Phase 3 page PR adds its feature folder.
  - `src/design-system/**` is always exempt.

- [ ] **Step 1: Write the failing `RuleTester` cases.**
  - Valid:
    - `className="bg-son text-cream"`
    - `className="max-w-[68ch]"`
    - `className={cn('p-4', active && 'text-gold')}`
    - `style={{ width: BOARD_WIDTH }}`
  - Invalid:
    - `className="text-[#b3282d]"`
    - `className="text-[13px]"`
    - ``className={`p-2 ${x ? 'bg-[#fff]' : ''}`}``
    - `className={cn('mt-[3px]')}`
    - `style={{ color: '#b3282d' }}`
- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm nx test @org/frontend --testPathPattern=no-ad-hoc-style`
  Expected: FAIL

- [ ] **Step 3: Implement and register the rule.** Register it as plugin `local`, at `error` level, in a config block with `files: MIGRATED_FILES` and `ignores: ['src/design-system/**']`.
- [ ] **Step 4: Verify**

  Run the tests, then `pnpm nx lint @org/frontend`.

  Expected:
  - The tests PASS.
  - Lint stays green, because `MIGRATED_FILES` is empty.
  - Temporarily add `src/components/**` to `MIGRATED_FILES` and run lint once to list the existing violations for Task 8. Revert that addition before committing.

- [ ] **Step 5: Commit** with message `chore(frontend): add a lint guard against ad-hoc colours and px sizes`.

---

### Task 5: Ornament kit and Han glyphs

**Files:**

- Create in `apps/frontend/src/design-system/ornaments/`:
  - `ornament-name.ts`
  - `Ornament.tsx`
  - one component file per piece, for example `TuongVanCloud.tsx`
- Create in `apps/frontend/src/design-system/glyphs/`:
  - `han-glyph.ts`
  - `han-glyph-paths.ts`
  - `HanGlyph.tsx`
- Test: `apps/frontend/src/design-system/ornaments/Ornament.spec.tsx`

**Interfaces:**

- Consumes: the Task 1 pack. Convert each chosen piece to SVG in a vector editor, optimise it with `pnpm dlx svgo`, and port it to TSX.
- Produces:
  - `enum OrnamentName { Cloud = 'cloud', CloudSmall = 'cloud-small', FretBorder = 'fret-border', RoundFrame = 'round-frame', Scroll = 'scroll', Lantern = 'lantern', SealFrame = 'seal-frame', Ribbon = 'ribbon' }`
  - `Ornament({ name, className }: { readonly name: OrnamentName; readonly className?: string }): JSX.Element`. It renders an inline `<svg aria-hidden="true" focusable="false">`.
  - Colours come only from `currentColor` and `var(--color-*)`.
  - `enum HanGlyph` has members `Ty, Suu, Dan, Mao, Thin, Ti, Ngo, Mui, Than, Dau, Tuat, Hoi, Cat, Nhat`. They map to 子丑寅卯辰巳午未申酉戌亥吉日.
  - `HanGlyph({ glyph, title, className })` renders a path from `han-glyph-paths.ts`.
    - With a `title`, it has `role="img"` and an `aria-label`.
    - Without one, it is `aria-hidden`.
  - The paths are converted once from Noto Serif SC Black (OFL). Record the licence line in `asset-license.md`.
- Budget: ≤ 8 KB per ornament file, and ≤ 1.5 KB per glyph path.

- [ ] **Step 1: Write the failing tests**
  - `every ornament is hidden from assistive technology`: render each `OrnamentName`, and the root is `aria-hidden="true"` with `focusable="false"`.
  - `ornaments take their colours from tokens only`: no `fill` or `stroke` attribute in any rendered ornament matches `/#[0-9a-f]{3,8}/i`.
  - `a titled Han glyph is announced, an untitled one is not`.
  - `every HanGlyph has a path`: `Object.values(HanGlyph)` all exist in the paths map.
- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm nx test @org/frontend --testPathPattern=design-system/(ornaments|glyphs)`
  Expected: FAIL

- [ ] **Step 3: Port the pieces and glyphs.** Show the recoloured set to Kim An in the visual companion before moving on.
- [ ] **Step 4: Verify.**

  Run the tests. Then run `wc -c apps/frontend/src/design-system/ornaments/*.tsx` and check that every file is ≤ 8192 bytes.

  Expected: PASS, and Kim An has signed off on the set.

- [ ] **Step 5: Commit** with message `feat(design-system): add the ornament kit and Han glyphs`.

---

### Task 6: Brand primitives

**Files:**

- Create in `apps/frontend/src/design-system/`:
  - `PageHero.tsx`
  - `Panel.tsx`
  - `RibbonTitle.tsx`
  - `Chip.tsx`
  - `CtaButton.tsx`
  - `Seal.tsx`
  - `Tile.tsx`
  - `ReadingZone.tsx`
  - `index.ts`
- Test: `apps/frontend/src/design-system/primitives.spec.tsx`

**Interfaces:**

- Consumes: the tokens from Task 3 and `Ornament` and `HanGlyph` from Task 5.
- Produces, all exported from `@/design-system`:
  - `PageHero({ eyebrow, title, children, art }: { readonly eyebrow?: string; readonly title: string; readonly children?: ReactNode; readonly art?: ReactNode })` renders a showcase `<section>` on son, with the `<h1>` in Phudu gold and clouds from the kit.
  - `enum PanelTitleStyle { Ribbon = 'ribbon', Pill = 'pill' }`
  - `Panel({ title, titleStyle = PanelTitleStyle.Pill, headingLevel = 2, children }: { readonly title?: string; readonly titleStyle?: PanelTitleStyle; readonly headingLevel?: 2 | 3; readonly children: ReactNode })` renders a cream surface with a gold border. Its title is a real heading at `headingLevel`.
  - `RibbonTitle({ children, as = 'h2' }: { readonly children: ReactNode; readonly as?: 'h1' | 'h2' | 'h3' })`
  - `enum ChipTone { Jade = 'jade', Gold = 'gold', Son = 'son' }` and `Chip({ tone = ChipTone.Jade, children })`
  - `enum CtaTone { GoldOnSon = 'gold-on-son', SonOnCream = 'son-on-cream' }`
  - `CtaButton(props: CtaButtonProps)`, where `type CtaButtonProps = { readonly tone: CtaTone; readonly children: ReactNode } & ({ readonly to: LinkProps['to']; readonly search?: LinkProps['search'] } | { readonly onClick: () => void; readonly type?: 'button' | 'submit' })`. It renders a TanStack `<Link>` when `to` is given and a `<button>` otherwise, with a `focus-visible` ring in a contrasting token.
  - `Seal({ glyph, label }: { readonly glyph: HanGlyph; readonly label?: string })`
  - `Tile({ glyph, title, caption, isActive = false }: { readonly glyph?: HanGlyph; readonly title: string; readonly caption?: string; readonly isActive?: boolean })` is the hour and year tile that the Ngày tốt page and the Tết hub use.
    - At rest it is jade with a gold glyph.
    - When active it is gold with a son glyph, and it sets `aria-current="true"`.
  - `ReadingZone({ children }: { readonly children: ReactNode })` renders cream with ink text, `text-reading`, `leading-reading` and `max-w-reading`.

- [ ] **Step 1: Write the failing tests**
  - `a panel title is a heading at the requested level`: `<Panel title="Giờ hoàng đạo" headingLevel={3}>` gives `getByRole('heading', { level: 3, name: 'Giờ hoàng đạo' })`.
  - `the page hero exposes exactly one h1`.
  - `a CTA with a destination is a link, without one it is a button`.
  - `a CTA shows a visible focus ring`: the class list contains `focus-visible:ring`.
  - `display text never sets line-height below 1.15`: the hero title and ribbon title have no `leading-none` or `leading-[1]` class. This pins Review Focus 1.
  - `a decorative seal is hidden, a labelled seal is announced`.
  - `the active tile is marked current and the others are not`.
- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm nx test @org/frontend --testPathPattern=design-system/primitives`
  Expected: FAIL

- [ ] **Step 3: Implement the primitives** using only token utilities. `design-system/` is exempt from the lint guard, but use tokens anyway.
- [ ] **Step 4: Verify**

  Run the tests. Then show Kim An a kit screen in the visual companion that renders every primitive with real Vietnamese copy, for example "LẬP LÁ SỐ CỦA BẠN", "Giờ hoàng đạo" and "Tử vi 2027 tuổi Ất Hợi".
  Expected: PASS and Kim An's OK.

- [ ] **Step 5: Commit** with message `feat(design-system): add the D2 brand primitives`.

---

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
  - `apps/frontend/src/routes/_site/kien-thuc.$slug.tsx` (JSON-LD logo URL)
- Test: `apps/frontend/src/design-system/brand/Logo.spec.tsx`

**Interfaces:**

- Produces:
  - `Logo({ tone, className }: { readonly tone: LogoTone; readonly className?: string })`, with `enum LogoTone { OnSon = 'on-son', OnCream = 'on-cream' }`. It renders a link-free `<span role="img" aria-label="Tử Vi Miễn Phí">` containing the mark and the wordmark.
  - `LogoMark({ className })` is the mark only, `aria-hidden`.
- The wordmark in `icon.svg` and the PNGs is outlined to paths, because favicons do not load web fonts.

- [ ] **Step 1: Draft 3 logo options.** Each one is the wordmark "Tử Vi Miễn Phí" in Phudu with a flat mark (a seal with 吉, a flat âm dương, and one more). Show them in the visual companion on son and on cream, at 24 px and at 120 px tall.
- [ ] **Step 2: Kim An picks one.** Iterate until signed off.
- [ ] **Step 3: Write the failing test.** `the logo is announced once as the site name`: `getByRole('img', { name: 'Tử Vi Miễn Phí' })`, and the mark inside is not separately announced.
- [ ] **Step 4: Implement the components and export the icon files.**
  - Generate the PNGs from `icon.svg` with `pnpm dlx sharp-cli`.
  - `og-default.png` is the logo on son with clouds from the kit, ≤ 120 KB.
- [ ] **Step 5: Verify**

  Run `pnpm nx test @org/frontend --testPathPattern=brand/Logo`, then `pnpm nx build @org/frontend`.

  Expected: PASS. `dist/index.html` references `/brand/icon.svg` and `/brand/icon-180.png`. The old `logo.png` and `icon.png` are no longer referenced; they are deleted in Phase 4.

- [ ] **Step 6: Commit** with message `feat(brand): add the D2 logo, favicon and default share image`.

---

### Task 8: Shared shell in D2

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
  - `apps/frontend/src/styles.css` (`--site-header-height` values, re-measured)
  - `apps/frontend/src/components/ui/**`, fixing every violation listed in Task 4
  - `apps/frontend/eslint.config.mjs` (add `src/components/layout/**` and `src/components/ui/**` to `MIGRATED_FILES`)
- Test: `apps/frontend/src/components/layout/site-header.spec.tsx` (create)

**Interfaces:**

- Consumes: `Logo`, `Ornament`, `CtaButton` and the tokens.
- Produces the restyled shell. Nav items, routes and behaviour are unchanged.

- [ ] **Step 1: Write the failing tests**
  - `the header marks the current section with aria-current="page"`.
  - `the header shows the site name once to assistive technology`.
- [ ] **Step 2: Run them to verify they fail**

  Run: `pnpm nx test @org/frontend --testPathPattern=layout/site-header`
  Expected: FAIL

- [ ] **Step 3: Restyle the shell.**
  - Header: jade bar, gold logo and nav, son active indicator.
  - Footer: son with gold.
  - Mobile nav bar: cream with son for the active item.
  - Splash: son field, the new logo, and a gold progress bar.

  Use tokens only, and fix every violation the lint guard reported in Task 4. Then re-measure the header height at 390, 768 and 1440 px and update `--site-header-height`.

- [ ] **Step 4: Verify**

  - Run the tests, then `pnpm nx run-many -t lint typecheck test -p @org/frontend`.
  - On the dev server, at a 320×640 viewport, check `document.documentElement.scrollWidth === 320` on `/`, `/la-so`, `/ngay-tot` and `/kien-thuc`.
  - Run Lighthouse mobile on a preview build for `/` and `/la-so`.

  Expected: PASS. The scroll width is 320 on all four routes. Each Lighthouse category is ≥ its baseline in `docs/redesign/baseline.md`, and CLS is < 0.1.

- [ ] **Step 5: Commit** with message `feat(frontend): rebuild the shared shell in D2`.

---

### Task 9 (Kim An generates, builder processes): Illustration guide and the first con giáp

**Files:**

- Create:
  - `docs/redesign/illustration-guide.md`
  - `apps/frontend/public/illustrations/con-giap/ty.webp`

**Interfaces:**

- Produces `illustration-guide.md`, containing:
  - the palette hex list;
  - style rules: flat fills, ink outline of uniform weight, no gradients, glow, photorealism or text, a transparent or cream background, 3–4 palette colours per image;
  - composition rules: a centred subject with 8% padding, square;
  - **the fixed prompt template**, with `{subject}` as the only variable;
  - post-processing: recolour to the palette, export WebP 512×512 at quality 80 with a budget of ≤ 60 KB (hero ≤ 150 KB at 1600 px wide), and `pnpm dlx sharp-cli` command lines;
  - the rule "never upload licensed pack files".

- [ ] **Step 1: Write the guide and the prompt template.** Show them to Kim An.
- [ ] **Step 2: Kim An generates con giáp Tý.** Iterate until approved against the asset acceptance list.
- [ ] **Step 3: Post-process and add the file.** Check it with `ls -l apps/frontend/public/illustrations/con-giap/ty.webp`; it must be ≤ 61 440 bytes.
- [ ] **Step 4: Record the approved image as the reference** for every later illustration, in the guide.
- [ ] **Step 5: Commit** with message `docs(redesign): add the illustration guide and the reference con giáp`.
