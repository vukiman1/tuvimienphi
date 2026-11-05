# Public site redesign — Design

Status: draft for Kim An's approval. Date: 2026-11-03. Research behind every decision here: [research.md](research.md).

## Intent

The public site (`apps/frontend`) is the face of Tử Vi Miễn Phí, and today it reads as AI-generated. There are 198 distinct hex colours and 25 distinct px font sizes hard-coded in components. Gold gradients, ornamental corner frames and soft ink-wash cranes, mountains and clouds sit on almost every section, each in a different hand. Nothing ties the pages together, so every section looks invented on the spot.

The redesign gives the site one identity, **D2 "Quốc triều rực rỡ"**, built from a single design system and a single asset kit. It also fixes the web fundamentals that decide whether anyone finds the site: speed, accessibility and SEO.

The positioning it serves: **the cleanest, most trustworthy tử vi site in Vietnamese**. That means no ads, no clickbait, honest pricing, an interactive lá số that works on a phone, and readings that are pleasant to read for twenty minutes.

## Goals

1. **One visual identity.** Every public page uses D2 through shared tokens, components and assets, with no one-off colours, sizes or illustrations.
2. **Readable long-form.** Luận giải chapters and kiến thức articles read comfortably on a phone.
3. **Web fundamentals.** The quality gates below pass on every redesigned page before it ships.
4. **Catch the Tết 2027 search season.** The design system lands early enough that the Tết per-age hub (Phase 2) ships in the new look before demand peaks.
5. **Measurable outcome.** Measurement is in place before the first redesigned page ships, so the before/after comparison is real.

## Success measures

Measured from Phase 0 onward. Numeric targets are set after about two weeks of baseline data, because any number set today would be a guess.

1. **North star: lá số cast per week.** This is the core free action and the entry to everything else.
2. **Organic clicks from Google** (Search Console). For the Tết hub specifically: pages indexed by mid-December and in the top 10 for a set of per-age queries before Tết (2027-02-06).
3. **Paid conversion:** the share of users who cast a chart and then unlock a paid luận giải chapter.
4. **Quality gates** (a page that misses one does not ship):
   - Core Web Vitals green on mobile: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
   - Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
   - WCAG AA contrast for all body text.
   - No hex colour or arbitrary px size outside the design tokens.

## Non-goals

- Redesigning the admin console (`apps/dashboard`). Kim An wants it rebuilt to look professional, but it is a separate project with its own design document, started after Tết 2027. It needs a dense, neutral internal-tool style, not D2, and it affects neither users nor the Tết season. The only admin change in this redesign is the Phase 0 funnel card, built in the console's current style.
- Backend behaviour, the chart engine, and luận giải content or prompts.
- Dark mode. The `.dark` tokens in `styles.css` are dropped, not redesigned.
- New product features, other than the Tết hub in Phase 2, which gets its own design document. In particular, tap-to-explain on the lá số board needs new star and palace content, so it is a follow-up feature. The redesign restyles the board and gives it a mobile-first layout, keeping today's palace highlighting.
- Changing public URLs. Every indexed path keeps its address.

## Anti-goals

The redesign fails, even if it technically works, if:

- **It still looks AI-generated.** Mixed illustration styles, glossy gradients, soft ink-wash stock art, or an asset that is not from the approved kit.
- **It looks like cheap superstition.** Clickbait headlines, scare-tactic countdowns, ads, fake discounts.
- **It is slower than today** on a mid-range phone.
- **It loses search traffic** through changed URLs, missing metadata or broken prerendering.
- **Vietnamese text is hard to read.** Stacked diacritics collide, or there is long copy on saturated red.

## Visual identity — D2 "Quốc triều rực rỡ"

Chosen by Kim An from mockups on 2026-11-03, after rejecting minimal, type-led directions as still looking templated.

**Colour.** One palette, defined once as tokens:

| Role     | Value     | Notes                                                  |
| -------- | --------- | ------------------------------------------------------ |
| Son red  | `#b3282d` | Lead colour: hero fields, primary surfaces             |
| Gold     | `#f4c542` | Display text on red, borders, clouds, primary CTA fill |
| Jade     | `#1f6f64` | Secondary surfaces: nav, chips, hour tiles             |
| Cream    | `#fff6dc` | Panels, reading surfaces, text on red                  |
| Ink      | `#3a1d14` | Body text on cream                                     |
| Deep red | `#7d1a1e` | Shadows and pressed states                             |

The builder may add tints of these for hover, muted text and borders. All of them live in the token file, and no new hues are allowed.

The one exception is a separate group of **chart data colours** for the ngũ hành star colours (Kim, Mộc, Thủy, Hỏa, Thổ) and the Tuần/Triệt labels on the lá số. Tử vi readers read these colours as meaning, so they keep the familiar hues (grey, green, black, red, bronze). They are re-tuned to pass AA on the board surface and may only be used inside chart components. This is my call.

Contrast rules:

- **Gold on red** measures about 4:1, so it is allowed only for display text of 24 px and above (or 19 px bold).
- **Body text** is always ink on cream or cream on red/jade.

**Type.**

- **Display:** Phudu, weights 700–900. Used for headings, numerals, CTAs and ribbon titles.
- **Everything else:** Be Vietnam Pro, weights 400–700.
- **Han characters** (the 12 chi, 吉, 日…) come from SVG assets, never from a CJK web font, because a CJK font would cost megabytes.

**Ornament.**

- One kit, used consistently: tường vân clouds, hồi văn fret borders, scrolls, round frames, ribbon/pill titles and seals.
- Fills are flat, with clear outlines. No gradients except subtle paper texture on cream surfaces.

**Two zones per page.**

- **Showcase zones** (hero, page headers, chapter openers, the Tết hub) use the full red, gold and jade palette with ornament.
- **Reading zones** (luận giải body, kiến thức articles, settings, forms) use a cream surface with ink text. Ornament there is limited to the zone's title. Body copy is 17–18 px with a line height of about 1.7 and a line length of 60–75 characters.

The mockups are kept in `.superpowers/brainstorm/` as the reference for mood. Their hand-drawn SVG assets are placeholders only, not part of the kit.

## Asset kit

The current ~346 images (about 60 MB in `apps/frontend/public`) are replaced page by page. Nothing outside the approved kit ships.

1. **Ornament vectors.** These come from a licensed 国潮 vector pack (Freepik or Envato, one month of subscription; Kim An has approved the spend). Choose one pack from one author that covers clouds, fret borders, scrolls, frames, lanterns and seals. Recolour every piece to the palette tokens. Ship them as optimised SVG, either as a sprite or inline components. The licence text and the source URL are kept in the repo.
   - **Never upload licensed pack files to ChatGPT or any other AI tool.** Envato's licence and several Freepik tiers forbid it.
2. **Large illustrations.** The complete list:
   - the home hero scene, which replaces `hero-video.mp4`;
   - 12 con giáp;
   - 6 luận giải chapter openers;
   - Tết hub art.

   How they are made:
   - **Generated with ChatGPT** by Kim An, from a written style guide (palette, flat fills, outline weight, composition). The licensed pack files themselves are never uploaded.
   - **One at a time.** The first con giáp is iterated until approved, then used as the reference image for the other eleven and for every later illustration.
   - **Fixed prompt.** Every image uses the same prompt template and palette, kept in this folder. The template is written once the pack is bought.
   - **Post-processing.** Each image is recoloured to the palette and exported as AVIF/WebP with a fixed size budget.

3. **Hand-built in code.** The lá số board, data tables and icons stay as code or icon-font components, not images, so they stay crisp and accessible.

**A new logo in D2** (Kim An's decision). It replaces `/brand/logo.png` and `/brand/icon.png` everywhere: header, footer, splash, page loader, favicon and default OG image. It is the wordmark "Tử Vi Miễn Phí" set in Phudu, paired with a flat mark (seal or âm dương), and built as SVG in code. The first version is drawn in Phase 1 and needs Kim An's sign-off before the shared shell ships. The favicon and app icon are derived from the mark.

**Shipping without an illustration is valid.** A page whose illustration has not been approved by its deadline ships with ornament only (clouds, frames, seal) and gains the illustration in a later PR. Old images are never kept as a stopgap.

The per-cung paintings inside luận giải (`CUNG_ILLUSTRATIONS` in `src/config/media.ts`) are dropped, not replaced. They sit in a reading zone, where ornament is limited to the title. The chapter openers above take their place.

An asset is accepted only if it:

- uses palette colours only,
- has flat fills and clear outlines,
- matches the reference hand,
- fits its size budget,
- and Kim An has signed it off.

## Architecture

- **Design-system code lives in its own folder, `apps/frontend/src/design-system/`** (my call, per Kim An's wish for a dedicated folder). It holds the tokens (Tailwind v4 `@theme` values), the font setup, the asset kit and the brand primitives (ribbon title, panel, seal, cloud divider, page hero, CTA).
  - Existing behavioural components in `src/components/ui` (dialog, input, select…) stay where they are, restyled to use tokens only.
  - It is not an Nx library: there is one consumer, and the admin console is out of scope.
- **Lint guard.** An ESLint rule rejects hex colours and arbitrary `[Npx]` values in `className` and `style` outside `design-system/`. Each migrated page is checked under this rule; the rule becomes global when the last page migrates.
- **Fonts.**
  - Self-host Phudu and Be Vietnam Pro, subset to Latin and Vietnamese, with `font-display: swap`.
  - Preload only the faces above the fold.
  - This replaces the Google Fonts `<link>`, cutting a third-party round trip.
- **SEO plumbing that stays:** `src/lib/seo.ts`, the prerender step and `tools/seo-routes.mjs`. Each redesigned page keeps its title, description, canonical and Open Graph tags. Pages gain JSON-LD where it fits (`Article` on kiến thức, `BreadcrumbList` site-wide, `FAQPage` where real Q&A exists). Each page also gets a designed OG image in the D2 style.
- **Measurement (Phase 0).**
  - **Google Search Console** for search.
  - **Cloudflare Web Analytics** for traffic: cookie-less and free, which fits the privacy positioning. This is my call, chosen over GA4.
  - **Funnel numbers** come from the backend's own records, not a client tracker. Charts are cast in the browser, so a cast has to be inferred from a request the backend already sees:
    - **Lá số cast** = distinct `birthKey` values per day on the public `GET /luan-giai/:birthKey` that the detail page already makes. Reloads of the same chart that day count once. No client change and no cookie.
    - **Chapter unlocks** = distinct `birthKey`s per day that had a chapter generated, counted once for any source and once more when it was paid with a credit (as opposed to the free daily quota).
    - **Paid conversion** = paid unlocks ÷ charts cast over the same period, measured as a same-day funnel. In practice a reader unlocks in the session where they cast the chart, and a same-day funnel needs only daily totals.

    These definitions are my call. The backend does not record a cast today, so Phase 0 adds the counter.

    A `birthKey` is personal data: it encodes birth date, hour and gender. The counter never stores it raw:
    - Deduplication uses a keyed hash, computed with a key derived from the server secret, so dictionary attacks over all possible birth dates do not work.
    - The hashes live only in Redis, with a two-day expiry.
    - Postgres keeps only the daily totals.

## Phases

Dates assume work starts 2026-11-04. Each phase ships behind the quality gates and lands on `dev` as its own PRs.

| Phase                 | Scope                                                                                                                                                                                                                                                                                                                                                                                                       | Target                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **0. Measure**        | Search Console, Cloudflare Web Analytics and a backend count of charts cast. Record a baseline Lighthouse/CWV report for every public page.                                                                                                                                                                                                                                                                 | 2026-11-07                                       |
| **1. Foundation**     | Buy the vector pack. Build the tokens, fonts, asset pipeline, brand primitives and lint guard. Draw the new logo and get it approved. Rebuild the shared shell (header, footer, mobile nav bar, splash) in D2. Generate and approve the first con giáp illustration and lock the prompt template. Primitives the Tết hub needs come first: page hero, panel with ribbon title, chips, CTA, hour/year tiles. | 2026-11-21                                       |
| **2. Tết 2027 hub**   | Per-age × gender pages for 2027, built on the new system. Its design document is brainstormed with Kim An and written by 2026-11-14, so the build can start 2026-11-17 and overlap the end of Phase 1. That document must answer how each page carries content that differs materially from its neighbours, drawn from our own engine. Near-duplicate pages get treated as thin content and do not rank.    | Indexed by 2026-12-10                            |
| **3. Page migration** | In order: Home → Lá số (form, board, luận giải) → Ngày tốt → Vận hạn → Kiến thức (list, article) → auth dialogs and user dashboard. One page per PR.                                                                                                                                                                                                                                                        | Home and Lá số by 2026-12-20; rest by 2027-01-15 |
| **4. Clean-up**       | Delete the unused old assets and the old tokens. Make the lint guard global.                                                                                                                                                                                                                                                                                                                                | 2027-01-22                                       |

**The Tết hub outranks everything else in this plan.** A late Tết hub loses the season for a year; a late page redesign costs a couple of weeks nobody notices. If the foundation is not finished by 2026-12-01, the hub ships on whatever tokens and primitives exist by then, and the rest of the redesign moves back.

Home and Lá số go first in Phase 3 because Tết hub visitors land on them next. The "auth dialogs and user dashboard" step also covers the remaining routes: credits, 404, lá số history and sessions.

The Lighthouse SEO = 100 gate applies to indexable pages only. Noindex routes (la-so/detail, dashboard, auth) are held to the other gates.

## What is left to the builder

- The exact tint scale, spacing scale and radius values, within the palette and the zone rules above.
- Which vector pack to buy, as long as it is one author and one consistent hand.
- Component APIs and file layout inside `design-system/`.
- How the lint guard is implemented.
- Whether to add visual-regression screenshots to `frontend-e2e`.
- Per-page layouts, within the identity, zones, asset rules and quality gates.
- How OG images are produced (a template is expected).
