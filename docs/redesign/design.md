# Public site redesign — Design

Status: approved. Date: 2026-11-03; visual identity changed from D2 to D3 on 2026-11-11. Research behind every decision here: [research.md](research.md).

## Intent

The public site (`apps/frontend`) is the face of Tử Vi Miễn Phí, and today it reads as AI-generated. There are 198 distinct hex colours and 25 distinct px font sizes hard-coded in components. Gold gradients, ornamental corner frames and soft ink-wash cranes, mountains and clouds sit on almost every section, each in a different hand. Nothing ties the pages together, so every section looks invented on the spot.

The redesign gives the site one identity, **D3 "Khoảnh khắc"**, built from a single design system and a single asset kit. It also fixes the web fundamentals that decide whether anyone finds the site: speed, accessibility and SEO.

The positioning it serves: **the cleanest, most trustworthy tử vi site in Vietnamese**. That means no ads, no clickbait, honest pricing, an interactive lá số that works on a phone, and readings that are pleasant to read for twenty minutes.

## Goals

1. **One visual identity.** Every public page uses D3 through shared tokens, components and assets, with no one-off colours, sizes or illustrations.
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

- Redesigning the admin console (`apps/dashboard`). Kim An wants it rebuilt to look professional, but it is a separate project with its own design document, started after Tết 2027. It needs a dense, neutral internal-tool style, not D3, and it affects neither users nor the Tết season. The only admin change in this redesign is the Phase 0 funnel card, built in the console's current style.
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
- **Vietnamese text is hard to read.** Stacked diacritics collide, or there is long copy on Ember or Dusk.
- **The story gets in the way.** A reader who came to cast a chart has to scroll through chapters to reach the form, or motion delays the first paint of text.

## Visual identity — D3 "Khoảnh khắc"

Chosen by Kim An on 2026-11-11 from an AI mockup and the HTML sketch [home-story-sketch.html](home-story-sketch.html), which is the reference for layout, motion and copy. It replaces D2 "Quốc triều rực rỡ" (chosen 2026-11-03), which was dropped after its ornament samples read as too busy.

**Concept.** Visiting the site feels like walking through a story about one person's birth moment. The home page is seven scroll chapters that move from night to day, while the digits of a birth date turn into the geometry of a lá số. Every other page borrows the same chapter system lightly: one showcase chapter at the top, then a reading zone.

**Colour.** One palette, defined once as tokens:

| Token    | Value     | Role                                                |
| -------- | --------- | --------------------------------------------------- |
| Night    | `#0E1222` | Chapter 1, splash, footer on dark pages             |
| Deep     | `#1B2A4A` | Second dark chapter                                 |
| Dusk     | `#6B3A4D` | Third dark chapter                                  |
| Ember    | `#D9623B` | Turning-point chapter                               |
| Dawn     | `#F2C879` | Warm light chapter                                  |
| Day      | `#F7F2E7` | Reading surfaces, forms, light chapters             |
| Ink      | `#15131A` | Text on light surfaces                              |
| Gold     | `#F2B441` | Primary buttons, active states, orbit lines on dark |
| Ink soft | `#5B5458` | Muted text on Day and Dawn                          |
| Day soft | `#C9C2B4` | Muted text on Night, Deep and Dusk                  |

No other hues. The **chart data colours** for the ngũ hành stars and the Tuần/Triệt labels stay a separate group, re-tuned to pass AA on the board surface and used only inside chart components.

Contrast rules, from measured ratios:

- Night, Deep and Dusk take Day text (8.05:1 or more). Gold and dawn text are allowed on them.
- Ember takes Ink text only (5.05:1). Day on Ember is 3.27:1 and is not allowed.
- Dawn and Day take Ink text. Gold is never text on Dawn or Day (1.65:1). It is a fill with Ink text on top (9.98:1).

**Type.**

- **Display:** Inter Tight. Headings at 600–800 with tight tracking; giant numerals at 300.
- **Emphasis:** Playfair Display Italic 600, for at most one emphasised word or phrase per heading.
- **Serif titles:** Playfair Display 700 for chapter and section titles below the hero, and for statement-style sentences (Kim An's mock, 2026-11-12). Page heroes stay Inter Tight. Accent emphasis is dawn gold (#f2c879) and appears only on dark surfaces: Night, Deep and Dusk, or a painting darkened behind the text. On lighter tones it stays ink. Text over a painting is checked by sampling the painting behind the text, and must reach at least 3:1 for large text.
- **Everything else:** Be Vietnam Pro, weights 400–700.
- Heading line height is never below 1.15, so stacked Vietnamese diacritics never collide.
- No Chinese characters anywhere, as text or as artwork.

**Geometry kit.** Ornament is drawn in code, not imported: orbit rings, points on a circle, crosshair lines, ruled grids and giant numerals. Strokes are Gold or Day at reduced opacity on dark chapters and Ink at reduced opacity on light ones. There are no raster ornaments.

Light is part of the kit, as tokens rather than one-off values:

- `shadow-glow-gold` and `shadow-glow-gold-strong` for glowing frames and active cells;
- `drop-shadow-glow-gold` for glowing SVG points.

Gradients appear in three places only:

- the shared gold icon gradient (`GoldIconGradient`), mounted once per page;
- washes and fades over paintings;
- fades that join neighbouring chapters.

**Story system.**

- **Chapters.** A page is a sequence of chapters, each with a tone (Night, Deep, Dusk, Ember, Dawn or Day). The header and the chapter rail switch between light and dark text with the chapter under them.
- **Story header and footer.** On a story page the header is fixed and tinted with the tone of the chapter under it (90% on dark tones). It never uses `backdrop-blur`: re-blurring every frame over a painting stalled WebKit (#189) and costs slow phones the same. The footer is Night.
- **The reader is never forced through the story.** A sticky "Lập lá số" button is visible from the first second, and a "Bỏ qua câu chuyện" link jumps to the form. Below 768 px the mobile nav bar's centre button "Lập lá số" plays the sticky button's role, so the two never overlap.
- **Chapter rail.** On screens 900 px and wider, a numbered rail on the right lists the chapters: a dot per chapter, joined by a line, with its number always shown. The current chapter also shows its name; other names appear on hover or keyboard focus. Long names wrap, and three-column layouts keep a right gutter so the rail never covers content.
- **Motion rules:**
  - Native scrolling only. No scroll-jacking and no snapping.
  - Animate only `transform`, `opacity` and SVG `stroke-dashoffset`. CLS stays at 0.
  - Reveals take 400–800 ms with an ease-out curve. Nothing bounces, and nothing loops on reading text.
  - Every word exists in the prerendered HTML and is readable without JavaScript. Motion only ever hides content after the script has started.
  - Under `prefers-reduced-motion`, every chapter shows its final state, with no pinning and no scroll-linked motion.
  - Pinned chapters are about half as long on mobile. A chapter whose content is taller than the viewport pins only from 64rem wide and 50rem tall (the `pinned` variant).
  - Scroll-driven entrances (slide, fade or scale as an element enters) were tried on the home page on 2026-11-12 and shelved. They need `overflow: clip` instead of `hidden` on every ancestor, and they freeze inside pinned chapters. The plan is kept in `plans/phase-3-home-motion.md`.

**Two zones per page.**

- **Showcase chapters** (heroes, page headers, chapter openers, the Tết hub) use the full palette, the geometry kit and motion.
- **Reading zones** (luận giải body, kiến thức articles, settings, forms) sit on Day with Ink text and no motion. Body copy is 17–18 px with a line height of about 1.7 and a line length of 60–75 characters.

## Asset kit

The current ~346 images (about 60 MB in `apps/frontend/public`) are replaced page by page. Nothing outside the approved kit ships.

1. **Ornament.** The geometry kit above, built as SVG and CSS in `design-system/`. No vector pack is bought, and the OpenAI ornament samples from 2026-11-11 are discarded.
2. **Large illustrations are optional.** Painted night-to-dawn scenes, like the ones in Kim An's AI mockup, are added to a page only after it ships and passes the quality gates without them. Each one:
   - is generated with the OpenAI image API from one fixed prompt template, kept in [illustration-guide.md](illustration-guide.md);
   - is approved by Kim An, and the first approved image becomes the reference for every later one;
   - is WebP at 768 and 1536 px wide, at most 120 KB on desktop and 60 KB on mobile;
   - is decorative (`alt=""`), and is never the LCP element. A painting behind the hero loads with `fetchpriority="low"`; every other painting loads with `loading="lazy"`;
   - gets a tinted wash or a fade wherever text sits on it, checked by sampling the painting behind the text.
3. **Hand-built in code.** The lá số board, data tables and icons stay as code or icon-font components, not images, so they stay crisp and accessible.

**A new logo in D3** (Kim An's decision). It replaces `/brand/logo.png` and `/brand/icon.png` everywhere: header, footer, splash, page loader, favicon and default OG image. It is the wordmark "Tử Vi Miễn Phí" set in Inter Tight 800, paired with a golden yin-yang mark with tường vân clouds. Hand-drawn SVG versions read as plainer than Kim An's mock, so the approved mark was generated from that mock with the OpenAI image API. It ships as raster (`logo-mark-128.webp` and `-256.webp`), and the favicon, app icons and default OG image are derived from it. It is the one place gradients appear inside an asset.

**Shipping without an illustration is valid.** Old images are never kept as a stopgap.

The per-cung ink-wash paintings inside luận giải came back on 2026-11-15 (Kim An's call): one painting per cung, beside the article on the Day reading zone, chosen by the article's `sourceCung`. They are the one exception to the night-landscape style, because they sit on cream and read as illustrations of the text. Six are the original set and six were generated to match it (see illustration-guide L5).

An asset is accepted only if it:

- uses palette colours only,
- fits its size budget,
- and Kim An has signed it off.

## Architecture

- **Design-system code lives in its own folder, `apps/frontend/src/design-system/`** (my call, per Kim An's wish for a dedicated folder). It holds the tokens (Tailwind v4 `@theme` values), the font setup, the geometry kit, the motion helpers and the story primitives (chapter, chapter rail, sticky CTA, display title, CTA, tile, reading zone).
  - Existing behavioural components in `src/components/ui` (dialog, input, select…) stay where they are, restyled to use tokens only.
  - It is not an Nx library: there is one consumer, and the admin console is out of scope.
- **Lint guard.** An ESLint rule rejects hex colours and arbitrary `[Npx]` values in `className` and `style` outside `design-system/`. Each migrated page is checked under this rule; the rule becomes global when the last page migrates.
- **Fonts.**
  - Self-host Inter Tight, Playfair Display Italic 600 and Be Vietnam Pro, subset to Latin and Vietnamese, with `font-display: swap`. Be Vietnam Pro is already self-hosted (#182).
  - Preload the Inter Tight 800 and Playfair Italic 600 files (Latin + Vietnamese) used by the home h1. Both are load-bearing: dropping either regressed CLS or LCP (#187, reverted in #188).
  - This replaces the Google Fonts `<link>`, cutting a third-party round trip.
- **SEO plumbing that stays:** `src/lib/seo.ts`, the prerender step and `tools/seo-routes.mjs`. Each redesigned page keeps its title, description, canonical and Open Graph tags. Pages gain JSON-LD where it fits (`Article` on kiến thức, `BreadcrumbList` site-wide, `FAQPage` where real Q&A exists). Each page also gets a designed OG image in the D3 style.
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

| Phase                 | Scope                                                                                                                                                                                                                                                                                                                                                                                                    | Target                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **0. Measure**        | Search Console, Cloudflare Web Analytics and a backend count of charts cast. Record a baseline Lighthouse/CWV report for every public page.                                                                                                                                                                                                                                                              | 2026-11-07                                       |
| **1. Foundation**     | Build the tokens, fonts, geometry kit, motion helpers, story primitives and lint guard. Draw the new logo and get it approved. Rebuild the shared shell (header, footer, mobile nav bar, splash) in D3. Painted illustrations are not part of this phase.                                                                                                                                                | 2026-11-21                                       |
| **2. Tết 2027 hub**   | Per-age × gender pages for 2027, built on the new system. Its design document is brainstormed with Kim An and written by 2026-11-14, so the build can start 2026-11-17 and overlap the end of Phase 1. That document must answer how each page carries content that differs materially from its neighbours, drawn from our own engine. Near-duplicate pages get treated as thin content and do not rank. | Indexed by 2026-12-10                            |
| **3. Page migration** | In order: Home (the seven-chapter story from the sketch) → Tết hub → Lá số (form, board, luận giải) → Ngày tốt → Vận hạn → Kiến thức (list, article) → auth dialogs and user dashboard. One page per PR.                                                                                                                                                                                                 | Home and Lá số by 2026-12-20; rest by 2027-01-15 |
| **4. Clean-up**       | Delete the unused old assets and the old tokens. Make the lint guard global.                                                                                                                                                                                                                                                                                                                             | 2027-01-22                                       |

**The Tết hub outranks everything else in this plan.** A late Tết hub loses the season for a year; a late page redesign costs a couple of weeks nobody notices. If the foundation is not finished by 2026-12-01, the hub ships on whatever tokens and primitives exist by then, and the rest of the redesign moves back.

Home and Lá số go first in Phase 3 because Tết hub visitors land on them next. The "auth dialogs and user dashboard" step also covers the remaining routes: credits, 404, lá số history and sessions.

The Lighthouse SEO = 100 gate applies to indexable pages only. Noindex routes (la-so/detail, dashboard, auth) are held to the other gates.

## What is left to the builder

- The exact tint scale, spacing scale and radius values, within the palette and the zone rules above.
- How scroll-linked motion is implemented, within the motion rules.
- Component APIs and file layout inside `design-system/`.
- How the lint guard is implemented.
- Whether to add visual-regression screenshots to `frontend-e2e`.
- Per-page layouts, within the identity, zones, asset rules and quality gates.
- How OG images are produced (a template is expected).
