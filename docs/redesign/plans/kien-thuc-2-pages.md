# Kiến thức 2 — Pages: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Kiến thức blog stub with the path and the reference, in D3. The work covers:

- the hub `/kien-thuc`;
- the 18 lesson pages at `/kien-thuc/<slug>`;
- the three index pages and the entry pages under `/kien-thuc/{sao,cung,thuat-ngu}`;
- client search, the term popovers and local reading progress;
- the two 301s, `seo-routes` reading the manifest, head tags and JSON-LD, one OG image per page type;
- deleting `kien-thuc-data.ts` and the old widgets.

Sign-in sync and the progress card are plan 3. This plan only leaves the slot for the card.

**Architecture:**

- **One seam.** `features/kien-thuc/kien-thuc-content.ts` is the only file that reads `content/`. Route loaders import it dynamically, like the Tết hub's `tet-hub-content.ts`.
  - Everything else depends on the `KienThucContentSource` interface, so specs run on `__fixtures__/` and never on real content.
  - The manifest is an eager glob, so a missing file reads as the empty manifest. Lessons, entries and the search index are lazy chunks.
- **Published = in the manifest.** A step with no published lesson, a tile or index group with no entry, and a link to an unpublished page all disappear or degrade to plain text. Every count is computed from the manifest.
- **Pure logic in plain modules:** path progress, next in path, related entries, entry facts, search matching, popover alignment and the reviewed date. Components render what those modules return.
- **Pages.** Each page is a Night `PageHero` followed by a Day zone.
  - Lessons and entries use `ReadingZone`; the hub and index pages use a `max-w-6xl` grid zone.
  - All of them end with the same Night "Áp vào lá số của bạn" card.
- **Facts come from the engine at render time,** through `shared-kien-thuc` (`saoFacts`, `cungFacts`, `plannedPage`, `castSampleChart`).
- **Progress.** Local progress is a `useSyncExternalStore` hook over a guarded `localStorage` store. Its interface is fixed with plan 3.
- **Hosting.** Redirects live in `public/_redirects`, read by Workers Static Assets beside the existing `_headers`, and in `nginx.conf`. `tools/seo-routes.mjs` lists the published pages and fails the build on manifest drift.

**Tech Stack:** React 19, TanStack Router file routes (`autoCodeSplitting`), Vite `import.meta.glob`, Tailwind v4 tokens from `design-system/tokens.css`, lucide icons, `@org/shared-contracts`, `@org/shared-kien-thuc`, `@org/shared-tu-vi`, Jest + Testing Library, Playwright (prerender and OG cards), Cloudflare Workers Static Assets, nginx.

**Spec:** [kien-thuc-design.md](../kien-thuc-design.md): "Information architecture", "The path", "Pages", "Search", "Progress", "SEO", Delivery item 2.

- Contracts and libs: [kien-thuc-1-content.md](kien-thuc-1-content.md), Task 1 (`LessonFile`, `EntryFile`, `KienThucManifest`, `KienThucSearchItem`, `ContentKind`, `EntryGroup`, `PageRef`, `contentFilePath`, `pageRef`, `parsePageRef`, `isReservedLessonSlug`) and Tasks 3–4 (`saoFacts`, `cungFacts`, `plannedPage`, `KIEN_THUC_STEPS`, `KIEN_THUC_ENTRIES`, `SAMPLE_BIRTH`, `castSampleChart`). This plan uses them and redefines nothing.
- D3 rules and quality gates: [design.md](../design.md).
- Baseline ([baseline.md](../baseline.md), 2026-11-06):
  - `/kien-thuc`: Performance 69, Accessibility 87, LCP 15.2 s.
  - `/kien-thuc/tu-vi-la-gi`: Performance 71, Accessibility 95, LCP 6.2 s.

## Decisions (approved by Kim An's delegation, 2026-11-16)

1. **Base and dependency.**
   - Plan 1's code PR (contracts, `shared-kien-thuc`, `content-gen/kien-thuc`) is merged on `dev` before Task 1.
   - `apps/frontend/package.json` gains `@org/shared-kien-thuc: workspace:*`.
   - The PR merges only when the launch set is approved and in `content/`: the 18 lessons, the 14 chính tinh, the 12 cung and `thuat-ngu/tam-hop-luc-xung` (Decision 6).
2. **The seam.**
   - `kien-thuc-content.ts` holds the four globs and exports `loadManifest`, `loadLesson`, `loadEntry` and `loadSearchIndex`. Its module namespace satisfies `KienThucContentSource`.
   - Route files never import it statically. `import.meta.glob` does not exist under Jest, and `tet-hub-routes.spec.ts` loads every route file.
   - The search index reaches components through `search/load-search-index.ts`, a one-line dynamic import passed down as a prop.
   - No runtime type guards. Files are build inputs that only `approve` writes. `content-files.spec.ts` (Task 2) checks every committed file instead, the way the Tết hub trusts its glob.
3. **What "published" drives.**
   - Positions and counts come from published lessons. "Bài 2/3" is the index among the step's published lessons; "Bước 3/6" counts `manifest.steps`.
   - A step with no published lesson has no hub row, and "next in path" skips it. It keeps its point on the step track, because the path still has six steps.
   - A link whose ref is not in the manifest renders as its label in plain text.
   - The cung and term facts link a partner only when it is published.
4. **Terms are disclosures with a crawlable panel.**
   - The term is a `<button aria-expanded aria-controls>`. Its panel is a sibling `<span>` that is in the prerendered DOM with `hidden`. It already holds the title and a real `<a href>` "Xem mục {title} →", or "Đọc bài {title} →" for a lesson.
   - The spec counts term links as internal linking (`kien-thuc-design.md:285`). A button whose link exists only after a click would give crawlers none.
   - The summary arrives from the lazy search index on the first open.
   - From `md` the panel is an absolute popover under the term, aligned to the start, or to the end when it would cross the viewport edge (`popoverAlignment`). Below `md` it is a fixed bottom sheet above the mobile bar.
   - Only one term is open at a time. Escape, an outside click and the "Đóng" button close it, and focus returns to the term. There is no animation and no backdrop.
5. **Reading progress.**
   - A lesson is read when its end card is at least half visible: `READ_VISIBILITY_RATIO = 0.5` on an `IntersectionObserver`.
   - The store caps the set at `LOCAL_PROGRESS_LIMIT = 200`, the server's per-account cap in plan 3, dropping the oldest slug past it, and keeps only slugs that pass `isContentSlug` (an invalid item is dropped, not the whole set). Plan 3's merge sends the set in requests of at most 50.
   - Storage access is guarded the way `features/la-so/history/local-history-store.ts` guards it: a store that cannot be read reads as empty, and a failed write keeps the in-memory snapshot for the session.
   - **Hub row states.** `Read` when every published lesson of the step is read. `Current` for the first step that is not fully read, once any lesson anywhere is read. `Unread` otherwise.
   - **Step track states.** `Read`, `Current` (the lesson's own step) and `Unread`.
   - **Hero button.**
     - Nothing read: "Bắt đầu bước 1" to the first lesson.
     - Some read: "Học tiếp: Bước n · {title}" to the current step's first unread lesson.
     - All read: "Đọc lại từ bước 1".
6. **Redirects.**
   - `public/_redirects` holds the two 301s. Workers Static Assets apply it before the worker, which runs only on `/api/*` and on asset misses (`wrangler.jsonc:13`, `worker/index.ts:21-27`). The repo already serves `public/_headers` the same way.
   - `nginx.conf` gets the same two rules as `location =` blocks.
   - The table lives in `tools/legacy-redirects.mjs`. A spec keeps both files equal to it.
   - `getSeoRoutes` fails the build when a redirect target is not published. That is why `thuat-ngu/tam-hop-luc-xung`, one of plan 1's dry-run pages, joins the launch set: a 301 that browsers cache must never point at a missing page.
7. **Hub head** (the one head change to an existing URL; Kim An approves the wording in Task 12, Step 4, before the spec is final):
   - title `Học tử vi từ đầu: lộ trình 6 bước và tra cứu sao, cung`;
   - description `Học đọc lá số tử vi qua 6 bước ngắn, đọc theo thứ tự, rồi tra từng sao, từng cung và thuật ngữ. Miễn phí, không cần đăng nhập.`;
   - `6` comes from `KIEN_THUC_STEPS.length`.

   Lesson and entry heads use the page's own title and its summary as the description.

8. **"Cách soạn bài" and the byline.**
   - The block shows on every lesson and entry.
   - Its facts line ("Bảng dữ kiện được tính bằng bộ máy an sao của trang.") shows only where a facts block exists.
   - Its AI line ("Phần chữ được soạn với sự hỗ trợ của AI, từ chính những dữ kiện đó.") always shows.
   - Its review line ("Nội dung đã được đọc và duyệt ngày {date}.") shows only for refs in `OWNER_READ_REFS` (`features/kien-thuc/owner-read-refs.ts`). Each content PR adds the refs it lists as read by Kim An.
   - Disclosing AI help on every page is the honest reading of Google's guidance, and the review claim never appears where it is not true. The design says the same (`kien-thuc-design.md:287-292`).
   - The visible byline is "Biên soạn: Admin" at the end of the hero meta line. `Article.author` is the `Organization` `SITE_NAME`.
9. **Lesson layout.**
   - Section ids are `muc-1` … `muc-n`. Headings are Vietnamese, and positional ids stay stable when a heading is reworded.
   - The TOC "Trong bài" shows from `lg` as a sticky left column. The current section gets `aria-current="location"`, `font-bold` and a gold left bar (`StateBar`, Task 5). The active section is the last one whose top has passed `SECTION_PROBE_REM` (`activeSectionIndex`).
   - The end card is one of three variants:
     - "Bài tiếp theo";
     - "Bước tiếp theo" when the next published lesson is in another step;
     - at the end of the path, "Lập lá số và đọc theo những gì đã học".
   - A previous lesson, when one exists, adds `TextLink` "← Bài trước: {title}" under the end card.
   - The order at the end is: end card, `LessonEndSlot` (empty here), "Cách soạn bài", Night CTA.
10. **Sample board (lesson 6.3, `doc-la-so-cua-chinh-ban`).**
    - The board renders after the first section, inside a `figure` with the caption "Lá số mẫu: nam, sinh ngày 22/3/1987 dương lịch, giờ Thìn". The caption is formatted from `SAMPLE_BIRTH`.
    - It reuses `LaSoBoard`.
      - The board takes a `ChartView` from `toChartView(BirthInput)`, not plan 1's `NatalChart`. `sampleChartView()` maps `SAMPLE_BIRTH` onto a `BirthInput`: solar calendar, the `BIRTH_HOURS` key whose `hour` is 8 (`Thìn`), and `Gender.Nam` → `Gender.Male`.
      - `viewYear` is `SAMPLE_VIEW_YEAR = 2027`. `luuTinh` and `daiVanTinh` are emptied, so the board shows the natal chart the lesson reads.
      - A spec pins it to `castSampleChart()`.
    - It loads with `React.lazy`, so the la-so board code stays out of every other lesson. The Suspense fallback reserves the board's square box.
    - Mệnh starts selected, and selecting another cung behaves as on Lá số.
11. **Shared pieces leave the Tết hub** (one refactor commit, no behaviour change).
    - `TetHubBreadcrumb` becomes `design-system/Breadcrumb.tsx` (`Breadcrumb`, `BreadcrumbItem`).
    - `breadcrumbJsonLd` and `SeoHead` move to `lib/seo.ts`.
    - `KIEN_THUC_PATH` moves to `features/kien-thuc/kien-thuc-paths.ts`.
    - Kiến thức is the second consumer of each, and a Kiến thức page rendering `TetHubBreadcrumb` would lie about what it is.
    - `articleJsonLd` stays in the Tết hub. It pins `TET_HUB_PUBLISHED_AT`, and Kiến thức dates by `reviewedAt`.
12. **Facts block.**
    - It is a `dl` on `day-200`.
    - **Stars:**
      - "Hành" for every star;
      - "Chòm" for chính tinh;
      - "Hung tinh" with "Có" or "Không" for phụ tinh and tứ hóa;
      - "Bậc theo địa chi" when the star has at least one rated cell;
      - "Hóa theo can năm" for the four hóa (plan 1, Decision 23).
    - **Rating grid.**
      - Twelve cells, `grid-cols-6` below `sm` and `grid-cols-12` from `sm`. Each cell holds the chi name and the full word from `RATING_LABEL` ("Miếu", "Vượng", "Đắc", "Bình", "Hãm").
      - A cell the engine leaves empty shows an `aria-hidden` "—" plus an `sr-only` "không có trong bảng".
      - `RATING_LABEL` is imported from `features/la-so/components/cung-panel.constants.ts` where it is. Moving it would touch four la-so files (`cung-panel-stars.tsx`, `board-legend.tsx`, `quick-luan-section.tsx`, `cung-panel.spec.tsx`) for no behaviour.
    - **Cung:** "Đối cung" and "Tam hợp", each partner a link when published.
    - Terms have no facts block.
13. **Index pages.**
    - **Groups.** One h2 per `EntryGroup` that has entries. The h2 has `id` equal to the group value and `tabIndex={-1}`, so `focusHashTargetOnRender` can focus it. A kind with one group (cung) renders no group h2.
    - **Tiles** carry the title and the summary from the search index. The manifest has no summaries (plan 1, Decision 5), so the index loader also loads the index.
    - **Term index.** Ngũ hành come first in plan order. The glossary follows, sorted with `localeCompare(…, 'vi')`, with a letter strip "Theo chữ cái" that links only to letters with entries. Letter ids are `chu-<letter>`, and `Đ` is `chu-dd`.
    - A kind with no published entry renders `KienThucNotFound` with a noindex head, and `seo-routes` leaves its path out.
14. **Related entries.** Up to `RELATED_ENTRY_COUNT = 6` entries of the same kind: the ones after this entry in manifest order, wrapping around to the start, and never the entry itself.
15. **Search.**
    - `normalizeForSearch` decomposes to NFD, strips `\p{M}`, maps `đ`/`Đ` to `d`, lower-cases and collapses whitespace.
    - A query matches when its normalised form is a substring of the normalised title or of an alias.
    - **Ranking:** title prefix, then title substring, then alias. Ties keep index order. At most `MAX_SEARCH_RESULTS = 8` results.
    - **Loading.** The index loads on the input's first focus, and the promise is cached per page. The term popovers reuse the same loader.
    - Each option shows its kind label: "Bài học", "Sao", "Cung" or "Thuật ngữ".
16. **OG images.** `tools/kien-thuc-og.mjs` (nx target `kien-thuc-og`) renders five 1200×630 JPEGs to `public/og/kien-thuc/{hub,bai,sao,cung,thuat-ngu}.jpg`.
    - **Card style.** Night, the logo mark, an Inter Tight 800 title with one Playfair 600 italic phrase in dawn, and a code-drawn orbit. No painting.
    - **Where they sit.** Index pages reuse their kind's image. The folder sits outside `/kien-thuc/`, so no asset ever holds a first segment that could be a lesson slug.
    - **Code.** The script copies the font-face block from `tet-hub-og.mjs` instead of extracting a shared module, since there are only two call sites.
    - Kim An signs off the five images and their text in Task 15, Step 4.
17. **File names** are kebab-case, like the rest of `features/kien-thuc` and the latest migrated feature, `features/ngay-tot`.
18. **Microcopy** (Kim An approves it in Task 0, Step 4, before the page specs assert it; anything not listed is the spec's own wording):

    | Where              | Text                                                                                                                                                                                                                                                                             |
    | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Hub hero           | eyebrow `Học tử vi từ đầu`; h1 `Đọc lá số trong` + accent `6 bước`; lead `Mỗi bước vài bài ngắn, đọc theo thứ tự: từ lá số là gì đến đọc lá số của chính bạn.`                                                                                                                   |
    | Search             | label (sr-only) `Tra cứu kiến thức tử vi`; placeholder `Hoặc tra nhanh: sao, cung, thuật ngữ…`; loading `Đang tải mục lục…`; empty `Không tìm thấy mục nào.` + `Bắt đầu với bài {title} →`                                                                                       |
    | Hub path           | h2 `Lộ trình`; row meta `{n} bài · {m} phút`; `Đã đọc`; `Đang học {read}/{total}`                                                                                                                                                                                                |
    | Hub reference      | h2 `Tra cứu`; lead `Khi đã quen, tra từng sao, từng cung.`; tiles `Chính tinh · {n}`, `Tứ hóa · {n}`, `Phụ tinh · {n}`, `{n} cung`, `Ngũ hành`, `Thuật ngữ A–Z`                                                                                                                  |
    | Closing card       | `Áp vào lá số của bạn` + button `Lập lá số`                                                                                                                                                                                                                                      |
    | Lesson hero        | pill `Bước {n}/{total} · {step title}`; meta `Bài {i}/{n} · {m} phút đọc · Cập nhật {dd/mm/yyyy} · Biên soạn: Admin`; track label `Lộ trình`, item sr text `Bước {n}: {title}, {đã đọc / đang xem / chưa đọc}`                                                                   |
    | Lesson end         | `Trong bài`; `Bài tiếp theo`; `Bước tiếp theo`; `Lập lá số và đọc theo những gì đã học`; `← Bài trước: {title}`                                                                                                                                                                  |
    | Term panel         | `Xem mục {title} →`; `Đọc bài {title} →`; close `Đóng`                                                                                                                                                                                                                           |
    | Entry              | meta `Cập nhật {dd/mm/yyyy} · Biên soạn: Admin`; `Học trong Bước {n}: {step title} →`; h2 `Mục liên quan`; facts h2 `Dữ kiện từ lá số`                                                                                                                                           |
    | Index leads        | sao `Mỗi sao một trang: hành, nhóm sao và bậc ở từng địa chi.`; cung `Mười hai cung theo thứ tự trên lá số, mỗi cung một trang.`; thuật ngữ `Ngũ hành và những từ hay gặp khi đọc lá số.`                                                                                        |
    | Index descriptions | sao `Tra cứu từng sao trong lá số tử vi: hành, nhóm sao và bậc ở từng địa chi theo bảng an sao.`; cung `Mười hai cung trong lá số tử vi: cung đối, tam hợp và ý nghĩa của từng cung.`; thuật ngữ `Ngũ hành và các thuật ngữ tử vi thường gặp, mỗi từ một trang giải thích ngắn.` |
    | Not found          | the current strings `Không tìm thấy bài viết` / `Bài viết bạn tìm không tồn tại hoặc đã được đổi tên.` / `← Về trang Kiến Thức`                                                                                                                                                  |

19. **Out of scope, reported as follow-ups.**
    - The home page's Kiến thức chapter shows invented dates and titles (`features/home/home-content.ts:151-178`), and one link that could now point at `tuan-va-triet`. It is the home page's PR to fix.
    - Plan 3 fills the two empty slots this plan renders: `LessonEndSlot` after the end card and `HubProgressSlot` directly after the step list, at every width (no reserved column). Both take no props here; plan 3 adds the props it needs and passes them from the two pages.

## Global Constraints

- **Tokens only.** No hex, no `[Npx]`, no inline gradient `style`.
  - Use palette tokens (`bg-day`, `bg-day-200`, `text-ink`, `text-ink-soft`, `text-day-soft`, `text-dawn`, `bg-gold`), never the shadcn semantic ones.
  - `src/features/kien-thuc/**` joins `MIGRATED_FILES` in Task 16, so `local/no-ad-hoc-style` proves it.
  - Grid tracks use rem (`lg:grid-cols-[14rem_minmax(0,1fr)]`).
- **No comments anywhere:** TypeScript, specs, JSON, `.mjs`, `_redirects`, `nginx.conf`. Existing comments in touched files stay.
- **Types.**
  - No `any`.
  - `as` only to narrow `unknown` from `JSON.parse` in specs and tools.
  - Explicit parameter and return types.
  - `readonly` everywhere.
  - String enums for closed sets: `KienThucPageStatus`, `StepStatus`, `NextInPathKind`, `ResumeKind`, `ProseNodeKind`, `PopoverAlign`, `KienThucPageType`, `EntryFactsKind`.
  - Discriminated unions for page data, next-in-path, resume and prose nodes.
  - `SCREAMING_SNAKE_CASE` constants at the top of each file.
  - Named errors with the input in the message: `KienThucManifestError`, `KienThucContentFileError` and `LegacyRedirectError` in the tools.
- **Fonts.** Introduce no weight or face that `/` does not load.
  - Be Vietnam Pro at `font-normal`, `font-semibold` and `font-bold` (600).
  - Inter Tight only as `DisplayTitle` Sans or `font-display font-extrabold`.
  - Playfair only as `TitleFace.Serif` / `font-emphasis font-bold`, or `Emphasis` / `font-emphasis italic font-semibold`.
  - No `font-medium` and no non-Playfair italics. Task 16's `kien-thuc-fonts.spec.ts` proves it.
- **Contrast.**
  - No text dimmed with opacity: no `text-*/NN`, and no `opacity-*` on anything holding text.
  - State marks are `inset-ring-*` plus words or a shape, never colour alone.
  - Gold on Day is 1.65:1 (design.md), so on Day a gold mark is always paired with Ink: the "Đã đọc" check is an Ink `Check` on a gold disc, and "Đang học" and the TOC's current item pair their gold `StateBar` with words and weight.
  - Pairs not already in `tokens.spec.ts` get a case.
- **No new motion.** No animation on the popover or the sheet, no `backdrop-blur` (the sheet is fixed), no scroll-driven entrance. `CtaButton`'s existing lift is the only movement.
- **No images** except the logo, and the board on 6.3, which is code. Ornament is the geometry kit, `aria-hidden`.
- **Prerender.**
  - Every word, every term panel link and every next / previous link is in the prerendered HTML.
  - State that depends on local progress renders its no-progress form first, inside boxes that do not change size when it switches, so CLS stays 0.
- **Content.** Nothing in this plan writes `content/`; only plan 1's `approve` does. Specs use `features/kien-thuc/__fixtures__/`, whose refs must be planned pages (Task 2).
- **Mobile bar.** It is 68 px plus the safe area at `z-50`. The term sheet sits at `z-60`, and the last element of every page ends above the bar at 320 × 568.
- **Worktrees.** Prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>` (recorded in Task 0), or it runs the main checkout's code. Never stop the dev servers on 4200 and 3000. `routeTree.gen.ts` is regenerated by the router plugin, never edited.
- **Tests run as** `pnpm nx test @org/frontend -- <pattern>`.
- **Gate:** `pnpm nx affected -t lint typecheck test`, then the Lighthouse A/B (Task 17).
- **Commits.** Each task names its commit subject. Nothing is committed or pushed until Kim An says "tạo pull". One PR on `dev`.

## Review Focus

1. **The seam holds under partial content.**
   - Only `kien-thuc-content.ts` uses `import.meta.glob` on `content/`, and no route file imports it statically.
   - With the fixtures (steps 3–5 empty, no tứ hóa, unpublished link targets):
     - the hub hides those rows and the tile;
     - "next in path" skips the empty steps;
     - links degrade to text;
     - "Học trong…" disappears when its lesson is unpublished;
     - an empty index kind is not found.
   - `seo-routes` lists exactly the published pages and fails on drift or an unpublished redirect target.
2. **Progress is honest and costs no CLS.**
   - A lesson is marked only when its end card is half visible, never on open.
   - Prerendered HTML shows no "Đã đọc", "Đang học" or "Học tiếp".
   - Status boxes and the hero button keep their size across states.
   - The store and the hook match plan 3's interface byte for byte.
   - Broken or blocked storage never throws into a page.
3. **Interactive accessibility.**
   - The search is an ARIA combobox: arrow keys, Enter, Escape and `aria-activedescendant`.
   - Each term is a disclosure: Escape and outside click close it, and focus returns to the term.
   - The TOC marks the current section with `aria-current`.
   - Every link and button has `FOCUS_RING_CLASS`, and every state is readable in greyscale.
   - The sheet sits fully above the bottom bar at 320 × 568.
4. **SEO.**
   - Titles, descriptions, canonicals and OG per page type.
   - JSON-LD: `Article` + `BreadcrumbList` on lessons and entries, `DefinedTerm` on terms, `DefinedTermSet` on the term index. Breadcrumb JSON-LD equals the visible breadcrumb.
   - Term panels hold real `<a href>`.
   - Both 301s answer on the Cloudflare preview and in nginx.
   - Sitemap `lastmod` is `reviewedAt`.
   - `/kien-thuc/sao` beats `$slug`, and the reserved-segment spec covers every static route segment.
   - No review claim on validator-only pages.
5. **D3 and weight.**
   - Tokens, fonts, `inset-ring` states, no motion, no images.
   - The LCP element is the h1.
   - The hub's initial chunks hold neither the search index, nor lesson bodies, nor the la-so board.
   - The old widgets, `kien-thuc-data.ts`, the `kt-*` CSS and the dead media keys are gone, and `features/kien-thuc/**` is under the style guard.

---

### Task 0: Ground check and baseline

- [ ] **Step 1: Worktree.**
  - Branch from `origin/dev` once plan 1's code PR is merged.
  - Run `pnpm install --frozen-lockfile`.
  - Record the worktree path for `NX_WORKSPACE_ROOT_PATH`.
  - Run `pnpm nx test @org/frontend` and `pnpm nx test shared-kien-thuc`. Expected: green, with output paths inside the worktree. Record the counts in the SDD ledger.
- [ ] **Step 2: Production baseline.** Run `npx -y lighthouse@12.8.2 <url> --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=<scratchpad>/lh-kt-a-<page>-<n>.json --chrome-flags="--headless=new"` ten times each on `https://xemtuvimienphi.top/kien-thuc` and `https://xemtuvimienphi.top/kien-thuc/tu-vi-la-gi`.
  - Record the medians of Performance, Accessibility, Best Practices, SEO, LCP, CLS and TBT, the LCP element, and the failing accessibility audits by id.
  - Use 12.8.2, not the global 13.x, whose scores are not comparable with baseline.md.
- [ ] **Step 3: "A" build.** In a separate worktree at `origin/dev`, run `pnpm nx build @org/frontend` and keep its `apps/frontend/dist` (Vite's `outDir` is `./dist` under the app) for Task 17.
- [ ] **Step 4: Microcopy approval.** Show Kim An the Decision 18 table and wait for his OK. Write any change into the table before Task 5; every page spec after that asserts these strings.

### Task 1: Lift the breadcrumb, breadcrumb JSON-LD and the Kiến thức path out of the Tết hub

**Files:**

- Create:
  - `apps/frontend/src/design-system/Breadcrumb.tsx` (body moved from `features/tet-hub/components/TetHubBreadcrumb.tsx`);
  - `apps/frontend/src/features/kien-thuc/kien-thuc-paths.ts`.
- Delete: `features/tet-hub/components/TetHubBreadcrumb.tsx`, `features/tet-hub/breadcrumb-item.ts`
- Modify:
  - `design-system/index.ts`;
  - `lib/seo.ts`;
  - `features/tet-hub/tet-hub-json-ld.ts`, `tet-hub-paths.ts`, `tet-hub-breadcrumb.ts`, `con-giap-breadcrumb.ts`, `tuoi-nam-breadcrumb.ts`, `components/TetHubNotFound.tsx`;
  - every Tết page that renders the breadcrumb (`rg -l "TetHubBreadcrumb|breadcrumb-item|KIEN_THUC_PATH" apps/frontend/src`).
- Test: `design-system/primitives.spec.tsx` (new case), `lib/seo.spec.ts` (new file)

**Interfaces:**

```ts
export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}
export function Breadcrumb(props: { readonly items: readonly BreadcrumbItem[] }): ReactElement;
export type SeoHead = ReturnType<typeof seo>;
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): Record<string, unknown>;
export const KIEN_THUC_PATH = '/kien-thuc';
```

`BreadcrumbItem` and `breadcrumbJsonLd` live in `lib/seo.ts`; `design-system/Breadcrumb.tsx` imports the type from `@/lib/seo`, as other primitives already import from `@/lib`, so `lib/` never depends on `design-system/`. `tet-hub-paths.ts` re-imports `KIEN_THUC_PATH` and no longer defines it.

- [ ] **Step 1: Write the failing tests.**
  - `primitives.spec.tsx`, `marks the last breadcrumb item as the current page`: with items Kiến thức → `Tử vi 2027`, there is a `nav` named `Đường dẫn`, `Kiến thức` is a link to `/kien-thuc`, and the `li` holding `Tử vi 2027` has `aria-current="page"` and no link.
  - `seo.spec.ts`, `numbers breadcrumb items from one with absolute urls`: `breadcrumbJsonLd([{ name: 'Kiến thức', path: '/kien-thuc' }, { name: 'Sao', path: '/kien-thuc/sao' }])` has `@type` `BreadcrumbList`, positions 1 and 2, and `item` `https://xemtuvimienphi.top/kien-thuc/sao`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- primitives seo`. Expected: FAIL (module missing).
- [ ] **Step 3: Move the code.** Bodies move unchanged; only names and import paths change.
- [ ] **Step 4: Run** `pnpm nx test @org/frontend -- tet-hub primitives seo`, then `pnpm nx typecheck @org/frontend`. Expected: every Tết spec passes with only import lines edited.
- [ ] **Step 5: Commit** `refactor(frontend): share the breadcrumb and its JSON-LD beyond the Tết hub`. Body: Kiến thức is the second consumer, and a component named after the Tết hub would mislabel its pages.

### Task 2: The content seam, paths and fixtures

**Files:**

- Modify: `apps/frontend/package.json` (`@org/shared-kien-thuc: workspace:*`, then `pnpm install`), `features/kien-thuc/kien-thuc-paths.ts`
- Create:
  - `features/kien-thuc/content-source.ts`, `kien-thuc-content.ts`, `published-pages.ts`, `owner-read-refs.ts`;
  - `search/load-search-index.ts`;
  - `__fixtures__/fixture-source.ts` plus the JSON fixtures below.
- Test: `kien-thuc-paths.spec.ts`, `published-pages.spec.ts`, `__fixtures__/fixtures.spec.ts`, `content-files.spec.ts`

**Fixtures** (flat names, because `tsconfig.spec.json` includes only `src/**/__fixtures__/*.json`; placeholder prose, every ref a planned page):

- `manifest.json` has all six steps:
  - step 1: `tu-vi-la-gi`, `la-so-tu-vi-gom-nhung-gi`, `am-duong-ngu-hanh-co-ban`;
  - step 2: `12-cung-tu-vi` only;
  - steps 3–5: none;
  - step 6: `doc-la-so-cua-chinh-ban` only.
- The manifest's entries, in plan order as `approve` writes them: `sao/thien-co` (chính tinh), `sao/ta-phu` and `sao/dia-kiep` (phụ tinh), `cung/menh` and `cung/thien-di`, `thuat-ngu/hanh-kim` (ngũ hành), `thuat-ngu/can` and `thuat-ngu/cuc` (thuật ngữ). No tứ hóa.
- One `bai-<slug>.json`, `sao-<slug>.json`, `cung-<slug>.json` or `thuat-ngu-<slug>.json` per manifest page, and `search-index.json` with one item per page.
- `bai-tu-vi-la-gi.json` links `[[sao/thien-co|Thiên Cơ]]` (published), `[[sao/tu-vi|Tử Vi]]` (unpublished) and `[[bai/12-cung-tu-vi|12 cung]]` (a lesson).

**Interfaces:**

```ts
export interface KienThucContentSource {
  readonly loadManifest: () => KienThucManifest;
  readonly loadLesson: (slug: string) => Promise<LessonFile | undefined>;
  readonly loadEntry: (kind: EntryKind, slug: string) => Promise<EntryFile | undefined>;
  readonly loadSearchIndex: () => Promise<readonly KienThucSearchItem[]>;
}
export type SearchIndexLoader = KienThucContentSource['loadSearchIndex'];
export const EMPTY_MANIFEST: KienThucManifest;

export function lessonPath(slug: string): string;
export function entryPath(kind: EntryKind, slug: string): string;
export function indexPath(kind: EntryKind): string;
export function refPath(ref: PageRef): string;
export enum KienThucPageType {
  Hub = 'hub',
  Lesson = 'bai',
  Star = 'sao',
  Palace = 'cung',
  Term = 'thuat-ngu',
}
export function shareImagePath(type: KienThucPageType): string;

export interface PublishedLesson extends ManifestLesson {
  readonly step: number;
  readonly stepTitle: string;
  readonly position: number;
  readonly stepLessonCount: number;
}
export function publishedLessons(manifest: KienThucManifest): readonly PublishedLesson[];
export function publishedLesson(
  manifest: KienThucManifest,
  slug: string,
): PublishedLesson | undefined;
export function stepsWithLessons(manifest: KienThucManifest): readonly ManifestStep[];
export function isPublished(manifest: KienThucManifest, ref: PageRef): boolean;
export function publishedTitle(manifest: KienThucManifest, ref: PageRef): string | undefined;
export function entriesOfKind(
  manifest: KienThucManifest,
  kind: EntryKind,
): readonly ManifestEntry[];
export function groupsWithEntries(
  manifest: KienThucManifest,
  kind: EntryKind,
): readonly EntryGroup[];

export const OWNER_READ_REFS: readonly PageRef[];
export const FIXTURE_SOURCE: KienThucContentSource;
export function loadKienThucSearchIndex(): Promise<readonly KienThucSearchItem[]>;
```

- `kien-thuc-content.ts` keys every glob through `./content/${contentFilePath(kind, slug)}`. The manifest glob is `{ eager: true, import: 'default' }` and falls back to `EMPTY_MANIFEST`. `loadSearchIndex` caches its promise at module level.
- `OWNER_READ_REFS` starts empty; each content PR fills it.

- [ ] **Step 1: Write the failing tests.**
  - `kien-thuc-paths.spec.ts`:
    - `puts lessons at the top level and entries under their kind`: `lessonPath('tu-vi-la-gi')` is `/kien-thuc/tu-vi-la-gi`, `entryPath(ContentKind.ThuatNgu, 'can')` is `/kien-thuc/thuat-ngu/can`, `refPath('bai/tuan-va-triet')` is `/kien-thuc/tuan-va-triet`, and `indexPath(ContentKind.Sao)` is `/kien-thuc/sao`.
    - `serves share images outside the kiến thức path`: `shareImagePath(KienThucPageType.Star)` is `/og/kien-thuc/sao.jpg`.
  - `published-pages.spec.ts`, over the fixture manifest:
    - `numbers lessons within the published lessons of their step`: `12-cung-tu-vi` has step 2, position 1, `stepLessonCount` 1; `la-so-tu-vi-gom-nhung-gi` has position 2 of 3.
    - `drops steps with no published lesson`: `stepsWithLessons` gives steps 1, 2 and 6.
    - `knows which refs are published`: `sao/thien-co` and `bai/12-cung-tu-vi` are published; `sao/tu-vi`, `sao/hoa-loc` and `bai/y-nghia-chinh-tinh` are not.
    - `lists the groups that have entries, in contract order`: `sao` gives chính tinh, phụ tinh; `thuat-ngu` gives ngũ hành, thuật ngữ; with `EMPTY_MANIFEST`, every kind gives none.
  - `fixtures.spec.ts`: `uses only planned pages`: every fixture ref passes `plannedPage`. `orders entries as approve does`: the manifest's entries follow `KIEN_THUC_ENTRIES` order. `lists each fixture file once in the manifest and the index`: the manifest's refs, the JSON fixtures and the search index's refs are the same set. The three cases keep the fixtures honest.
  - `content-files.spec.ts`, which reads the real `content/` with `fs` and passes when the folder or the manifest does not exist:
    - `lists every content file in the manifest and nothing else`: the manifest refs equal the files on disk, and each manifest title equals its file's title.
    - `indexes every content file once`: `search-index.json` holds one item per file, with the file's summary.
    - `links only to planned pages with whole link markup`: after `parseProse` (Task 6; until then, the plan-1 link pattern copied into the spec), no paragraph keeps a `[[`, and every link ref passes `plannedPage`. This is the spec the design names for "a link to a page that does not exist in the content plan".
    - `holds no Chinese characters`: no file matches `/\p{Script=Han}/u`.
    - `marks only planned refs as read by Kim An`: every `OWNER_READ_REFS` item passes `plannedPage`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- kien-thuc-paths published-pages fixtures content-files`. Expected: FAIL.
- [ ] **Step 3: Implement.** `kien-thuc-content.ts` has no spec, since Jest cannot evaluate `import.meta.glob`. Task 17's prerender is its test.
- [ ] **Step 4: Run again.** Expected: PASS. `pnpm nx typecheck @org/frontend` passes.
- [ ] **Step 5: Commit** `feat(kien-thuc): read lessons and entries through one content seam`.

### Task 3: Local progress

**Files:**

- Create: `features/kien-thuc/progress/local-progress-store.ts`, `use-lesson-progress.ts`, `use-mark-read-on-view.ts`, `lesson-end-slot.tsx`, `hub-progress-slot.tsx`; `src/test-utils/stub-intersection-observer.ts`
- Test: `progress/local-progress-store.spec.ts`, `progress/use-lesson-progress.spec.tsx`, `progress/use-mark-read-on-view.spec.tsx`

**Interfaces** (the first two files are fixed with plan 3; use exactly):

```ts
export const LOCAL_PROGRESS_KEY = 'kien-thuc-progress-v1';
export const LOCAL_PROGRESS_LIMIT = 200;
export function readLocalProgress(): ReadonlySet<string>;
export function markLessonRead(slug: string): void;
export function clearLocalProgress(): void;
export function subscribeLocalProgress(listener: () => void): () => void;

export function useLessonProgress(): {
  readonly readSlugs: ReadonlySet<string>;
  readonly markRead: (slug: string) => void;
};

export const READ_VISIBILITY_RATIO = 0.5;
export function useMarkReadOnView(slug: string): RefCallback<HTMLElement>;
export function LessonEndSlot(): null;
export function HubProgressSlot(): null;

export function stubIntersectionObserver(): {
  readonly reveal: (element: Element, ratio: number) => void;
  readonly restore: () => void;
};
```

- `readLocalProgress` returns the same `Set` instance while the stored string is unchanged, because `useSyncExternalStore` needs a stable snapshot.
- `subscribeLocalProgress` also listens to the `storage` event, so other tabs stay in sync.
- The hook's `getServerSnapshot` returns a module-level empty set.
- `useMarkReadOnView` marks the slug once, when an observed entry reaches `READ_VISIBILITY_RATIO`, and then disconnects.

- [ ] **Step 1: Write the failing tests.**
  - `local-progress-store.spec.ts` (real jsdom `localStorage`, cleared in `beforeEach`):
    - `stores read lessons under the versioned key`: after `markLessonRead('tu-vi-la-gi')`, `localStorage.getItem('kien-thuc-progress-v1')` parses to `['tu-vi-la-gi']`, and `readLocalProgress()` has it.
    - `keeps each lesson once`: marking the same slug twice leaves one entry.
    - `reads a broken or hand-edited store as empty`: with the key set to `{`, to `42` or to `["Bad Slug", 7]`, `readLocalProgress().size` is 0, and no error is thrown.
    - `returns the same snapshot until the store changes`: two reads are `===`; after a mark they are not.
    - `notifies subscribers on a mark, a clear and another tab's write`: a listener runs after `markLessonRead`, after `clearLocalProgress`, and after a dispatched `StorageEvent` with the key. After unsubscribing it runs no more.
    - `keeps the session's marks when storage refuses the write`: with `Storage.prototype.setItem` mocked to throw `QuotaExceededError` (a browser boundary), `markLessonRead('x-y')` does not throw, and `readLocalProgress()` has `x-y`.
    - `caps the set at 200 slugs`: after 201 distinct marks, the size is 200 and the first slug is gone.
  - `use-lesson-progress.spec.tsx`: `re-renders with a lesson marked elsewhere`: a probe component shows `readSlugs.size`. It shows 0, and after `act(() => markLessonRead('can'))` it shows 1.
  - `use-mark-read-on-view.spec.tsx` (with `stubIntersectionObserver`):
    - `marks the lesson when its end is half visible`: `reveal(card, 0.4)` leaves the store empty; `reveal(card, 0.6)` stores the slug.
    - `does not mark on mount`: after render, the store is empty.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- progress`. Expected: FAIL.
- [ ] **Step 3: Implement.** The guarded `readRaw` / `writeRaw` follow `local-history-store.ts`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): keep reading progress on the device`.

### Task 4: Path progress, next in path, related entries and entry facts

**Files:**

- Create: `features/kien-thuc/path-progress.ts`, `related-entries.ts`, `entry-facts.ts`, `reviewed-date.ts`
- Test: one `*.spec.ts` beside each

**Interfaces:**

```ts
export enum StepStatus {
  Read = 'read',
  Current = 'current',
  Unread = 'unread',
}
export interface StepProgress {
  readonly step: ManifestStep;
  readonly status: StepStatus;
  readonly readCount: number;
  readonly lessonCount: number;
  readonly minutes: number;
  readonly targetSlug: string;
}
export enum ResumeKind {
  Start = 'start',
  Continue = 'continue',
  Review = 'review',
}
export type Resume =
  | { readonly kind: ResumeKind.Start | ResumeKind.Review; readonly lesson: PublishedLesson }
  | {
      readonly kind: ResumeKind.Continue;
      readonly step: ManifestStep;
      readonly lesson: PublishedLesson;
    };
export function pathProgress(
  manifest: KienThucManifest,
  readSlugs: ReadonlySet<string>,
): readonly StepProgress[];
export function resumePoint(
  manifest: KienThucManifest,
  readSlugs: ReadonlySet<string>,
): Resume | null;
export function stepTrack(
  manifest: KienThucManifest,
  currentStep: number,
  readSlugs: ReadonlySet<string>,
): readonly { readonly step: ManifestStep; readonly status: StepStatus }[];

export enum NextInPathKind {
  Lesson = 'lesson',
  Step = 'step',
  End = 'end',
}
export type NextInPath =
  | { readonly kind: NextInPathKind.Lesson; readonly lesson: PublishedLesson }
  | { readonly kind: NextInPathKind.Step; readonly lesson: PublishedLesson }
  | { readonly kind: NextInPathKind.End };
export function nextInPath(manifest: KienThucManifest, slug: string): NextInPath;
export function previousInPath(
  manifest: KienThucManifest,
  slug: string,
): PublishedLesson | undefined;

export const RELATED_ENTRY_COUNT = 6;
export function relatedEntries(manifest: KienThucManifest, ref: PageRef): readonly ManifestEntry[];

export enum EntryFactsKind {
  Sao = 'sao',
  Cung = 'cung',
  None = 'none',
}
export type EntryFacts =
  | { readonly kind: EntryFactsKind.Sao; readonly facts: SaoFacts }
  | { readonly kind: EntryFactsKind.Cung; readonly facts: CungFacts }
  | { readonly kind: EntryFactsKind.None };
export function entryFacts(ref: PageRef): EntryFacts;

export function formatReviewedAt(isoDate: string): string;
```

`formatReviewedAt` splits the `YYYY-MM-DD` string and never builds a `Date`, so no time zone can move the day.

- [ ] **Step 1: Write the failing tests** (fixture manifest from Task 2).
  - `path-progress.spec.ts`:
    - `starts at the first lesson when nothing is read`: `resumePoint(m, new Set())` is `Start` at `tu-vi-la-gi`. Every step is `Unread`, and step 1 has `lessonCount` 3 and `minutes` equal to the sum of its lessons' `readingMinutes`.
    - `continues at the first unread lesson of the first unfinished step`: with step 1 read, step 1 is `Read`, step 2 is `Current` with `readCount` 0 and `targetSlug` `12-cung-tu-vi`, and `resumePoint` is `Continue` at step 2.
    - `marks no step current before anything is read`: with nothing read, no step is `Current`.
    - `offers a review from the start when every lesson is read`: `resumePoint` is `Review` at `tu-vi-la-gi`.
    - `has no resume point without lessons`: with `EMPTY_MANIFEST`, it is null.
    - `tracks all six steps with this lesson's step current`: `stepTrack(m, 2, readStep1)` has 6 items, with step 1 `Read`, step 2 `Current`, and steps 3–6 `Unread`.
    - `goes to the next lesson in the step`: `nextInPath(m, 'tu-vi-la-gi')` is `Lesson` with `la-so-tu-vi-gom-nhung-gi`.
    - `crosses into the next step at a step's end`: from `am-duong-ngu-hanh-co-ban`, it is `Step` with `12-cung-tu-vi`.
    - `skips steps that have no published lesson`: from `12-cung-tu-vi`, it is `Step` with `doc-la-so-cua-chinh-ban`.
    - `ends the path after the last published lesson`: from `doc-la-so-cua-chinh-ban`, it is `End`.
    - `finds the previous lesson across steps`: `previousInPath(m, '12-cung-tu-vi')` is `am-duong-ngu-hanh-co-ban`, and for `tu-vi-la-gi` it is undefined.
  - `related-entries.spec.ts`:
    - `lists the following entries of the same kind, wrapping`: for `sao/ta-phu` it is `dia-kiep`, then `thien-co`.
    - `never lists the entry itself or another kind`: no `cung` or `thuat-ngu` entry appears for a star.
    - `stops at six`: with a manifest of 10 star entries, the result has length 6.
  - `entry-facts.spec.ts`:
    - `gives a star its engine facts`: `entryFacts('sao/thien-co')` is `Sao`, with `facts.name` `Thiên Cơ`.
    - `gives a cung its partners`: `entryFacts('cung/menh')` is `Cung` with đối cung `Thiên Di`.
    - `gives a term none`: `entryFacts('thuat-ngu/can')` is `None`.
    - `links cung partners by the board's slugs`: for every planned cung entry, `CUNG_SLUGS[entry.cung]` (`features/la-so/cung-slug.ts`) equals `entry.slug`, so the facts block can link a partner with the existing table.
  - `reviewed-date.spec.ts`: `writes the review date day first`: `formatReviewedAt('2026-11-10')` is `10/11/2026`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- path-progress related-entries entry-facts reviewed-date`. Expected: FAIL.
- [ ] **Step 3: Implement** as pure functions over the manifest and `shared-kien-thuc`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): work out progress, the next lesson and related entries`.

### Task 5: Shared page pieces

**Files:**

- Create:
  - `features/kien-thuc/components/kien-thuc-cta.tsx`, `methodology-note.tsx`, `group-glyph.tsx`, `entry-tile.tsx`, `state-bar.tsx`, `kien-thuc-not-found.tsx`, `kien-thuc-labels.ts`;
  - `src/test-utils/render-at-route.tsx`.
- Test: `components/kien-thuc-cta.spec.tsx`, `components/methodology-note.spec.tsx`, `components/group-glyph.spec.tsx`, `components/state-bar.spec.tsx`

**Interfaces:**

```ts
export const GROUP_LABEL: Readonly<Record<EntryGroup, string>>;
export const KIND_INDEX_TITLE: Readonly<Record<EntryKind, string>>;
export const KIND_SEARCH_LABEL: Readonly<Record<ContentKind, string>>;
export function KienThucCta(): ReactElement;
export function MethodologyNote(props: {
  readonly hasFacts: boolean;
  readonly reviewedAt: string;
  readonly isOwnerRead: boolean;
}): ReactElement;
export function GroupGlyph(props: { readonly group: EntryGroup }): ReactElement;
export function StateBar(): ReactElement;
export function EntryTile(props: {
  readonly kind: EntryKind;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
}): ReactElement;
export function KienThucNotFound(): ReactElement;
export function renderAtRoute(options: {
  readonly path: string;
  readonly routePath: string;
  readonly element: ReactElement;
  readonly head?: () => SeoHead;
}): Promise<RenderResult>;
```

- `GroupGlyph` is `pointsOnCircle(GLYPH_POINTS[group])`: 14, 4, 8, 12 and 5 points. Thuật ngữ gets three ruled lines instead. It is `aria-hidden`, in `stroke-ink`.
- `StateBar` is the left bar the design asks for on the hub's "Đang học" row and the TOC's current item: an `aria-hidden` `span`, `absolute inset-y-2 left-0 w-1 rounded-full inset-ring-2 inset-ring-gold`, inside a `relative` parent. An inset ring on a 0.25rem-wide box fills it, so the mark stays an `inset-ring` and changes no box size. The words or weight beside it carry the state.
- `renderAtRoute` mounts `HeadContent` + `Outlet` in a memory router, the way `tet-hub-page.spec.tsx:30-50` does, for the page specs that follow.

- [ ] **Step 1: Write the failing tests.**
  - `kien-thuc-cta.spec.tsx`: `ends on a Night card that leads to the birth form`: the root has `bg-night` and `text-day`, the heading is `Áp vào lá số của bạn`, and the link `Lập lá số` has `href` `/#lap-la-so` and the `FOCUS_RING_CLASS` tokens.
  - `methodology-note.spec.tsx`:
    - `discloses AI help on every page`: the h2 `Cách soạn bài` and the AI line are present.
    - `credits the engine only when a facts table is shown`: the facts line is present only with `hasFacts`.
    - `claims a review only for pages Kim An read`: with `isOwnerRead` false there is no `đã được đọc và duyệt`; with true, `Nội dung đã được đọc và duyệt ngày 10/11/2026.` is present.
  - `group-glyph.spec.tsx`: `draws one point per glyph count and hides from assistive tech`: chính tinh has 14 circles and cung 12; the `svg` has `aria-hidden="true"`.
  - `state-bar.spec.tsx`: `draws a gold bar at the start that assistive tech skips`: the span has `aria-hidden="true"`, `left-0`, `w-1`, `inset-ring-2` and `inset-ring-gold`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `KienThucCta` is `rounded-2xl bg-night px-6 py-8 text-day` with a `DisplayTitle` Card Serif h2 and a `CtaButton` Gold to `/` with `hash={BIRTH_FORM_ANCHOR}`.
  - `MethodologyNote` is a `rounded-2xl bg-day-200` section in the shape of `HowWeCount`.
  - `EntryTile` is a `Link` with `rounded-xl border border-ink/15 bg-day p-4 hover:inset-ring-2 hover:inset-ring-ink` and `FOCUS_RING_CLASS`. It holds the title in `font-bold text-ink` and the summary in `text-sm text-ink-soft`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): add the closing card, the methodology note and tiles`.

### Task 6: Prose and term popovers

**Files:**

- Create: `features/kien-thuc/prose/parse-prose.ts`, `prose-context.tsx`, `prose-paragraph.tsx`, `term-button.tsx`, `popover-alignment.ts`
- Test: `prose/parse-prose.spec.ts`, `prose/popover-alignment.spec.ts`, `prose/term-button.spec.tsx`

**Interfaces:**

```ts
export enum ProseNodeKind {
  Text = 'text',
  Link = 'link',
}
export type ProseNode =
  | { readonly kind: ProseNodeKind.Text; readonly text: string }
  | { readonly kind: ProseNodeKind.Link; readonly ref: PageRef; readonly label: string };
export function parseProse(text: string): readonly ProseNode[];

export interface ProseContextValue {
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}
export function ProseProvider(
  props: ProseContextValue & { readonly children: ReactNode },
): ReactElement;
export function ProseParagraph(props: { readonly text: string }): ReactElement;
export function TermButton(props: { readonly ref: PageRef; readonly label: string }): ReactElement;

export enum PopoverAlign {
  Start = 'start',
  End = 'end',
}
export const TERM_PANEL_WIDTH_REM = 20;
export function popoverAlignment(
  termLeft: number,
  viewportWidth: number,
  panelWidth: number,
): PopoverAlign;
```

- `parseProse` uses the same pattern plan 1 validates (`[[kind/slug|label]]`) and reads the ref with `parsePageRef`. Anything that does not form a whole link stays text.
- `ProseProvider` also owns the one-open-at-a-time state.
- The panel is a `<span id hidden={!isOpen}>` directly after the button, holding:
  - the title (`publishedTitle`);
  - the summary, once the index has loaded;
  - the link;
  - the "Đóng" button.
- Panel classes, split like `cung-sheet.tsx:45` so the content keeps its padding above the safe area: the outer `span` is `fixed inset-x-0 bottom-0 z-60 rounded-t-2xl bg-day pb-[env(safe-area-inset-bottom)] text-ink inset-ring-1 inset-ring-ink/15 md:absolute md:inset-x-auto md:bottom-auto md:top-full md:mt-2 md:w-80 md:rounded-2xl md:pb-0` plus `md:left-0` or `md:right-0` from `popoverAlignment`; an inner `span` is `block p-6`.
- The button is `underline decoration-gold decoration-dotted decoration-2 underline-offset-4 text-ink` with `FOCUS_RING_CLASS`.

- [ ] **Step 1: Write the failing tests.**
  - `parse-prose.spec.ts`:
    - `splits text and links in order`: `Có [[thuat-ngu/can|can]] và [[bai/tuan-va-triet|Tuần, Triệt]].` gives text, link (`thuat-ngu/can`, `can`), text, link (`bai/tuan-va-triet`, `Tuần, Triệt`), text.
    - `keeps markup that is not a whole link as text`: `[[ghi-chu/x|y]]` and a lone `[[` come back as one text node each.
  - `popover-alignment.spec.ts`: `aligns to the start when the panel fits` (term at 100, viewport 1024, panel 320); `aligns to the end when it would cross the right edge` (term at 800).
  - `term-button.spec.tsx` (inside `ProseProvider` with the fixture manifest and a `jest.fn` loader resolving the fixture index):
    - `puts a crawlable link in the closed panel`: in `ProseParagraph` of the `bai-tu-vi-la-gi` first paragraph, the button `Thiên Cơ` has `aria-expanded="false"` and `aria-controls` naming an element that has `hidden`. That element holds a link `Xem mục Sao Thiên Cơ →` with `href` `/kien-thuc/sao/thien-co`.
    - `renders a link to an unpublished page as plain text`: `Tử Vi` is present, and there is no button or link named `Tử Vi`.
    - `words a lesson link as a lesson`: the panel of `12 cung` links `Đọc bài 12 cung trong lá số →` to `/kien-thuc/12-cung-tu-vi`.
    - `shows the summary from the search index on open and loads it once`: click `Thiên Cơ`. Then `aria-expanded` is `true`, the panel is not `hidden`, and the fixture's `thien-co` summary appears. Opening a second term leaves the loader called once.
    - `keeps one term open at a time`: opening `12 cung` closes `Thiên Cơ`.
    - `closes on Escape and returns focus to the term`: after Escape, the panel is `hidden` and `document.activeElement` is the button.
    - `closes on an outside click and on Đóng`: `pointerDown` on `document.body` closes it, and so does clicking `Đóng`.
    - `marks the term by a dotted underline, not by colour alone`: the button has `decoration-dotted`, `underline`, `text-ink` and the `FOCUS_RING_CLASS` tokens.
    - `is a bottom sheet below md and a popover from md`: the panel has `fixed`, `bottom-0`, `z-60`, `pb-[env(safe-area-inset-bottom)]` and `md:absolute`, its first child has `p-6`, and no class starts with `backdrop-` or `animate-`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- prose`. Expected: FAIL.
- [ ] **Step 3: Implement.** Swap the copied pattern in `content-files.spec.ts` for `parseProse`.
- [ ] **Step 4: Run again,** together with `content-files`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): render term links as popovers that keep a real link`.

### Task 7: Lesson page

**Files:**

- Create:
  - `features/kien-thuc/pages/lesson-page.tsx`;
  - `components/step-track.tsx`, `lesson-toc.tsx`, `next-in-path-card.tsx`;
  - `active-section.ts`, `use-active-section.ts`;
  - `route-data/lesson-route.ts`, `head/kien-thuc-json-ld.ts`, `head/lesson-head.ts`.
- Modify: `routes/_site/kien-thuc.$slug.tsx`
- Test: `active-section.spec.ts`, `route-data/lesson-route.spec.ts`, `head/lesson-head.spec.ts`, `pages/lesson-page.spec.tsx`

**Interfaces:**

```ts
export enum KienThucPageStatus {
  Found = 'found',
  NotFound = 'not-found',
}
export type LessonPageData =
  | {
      readonly status: KienThucPageStatus.Found;
      readonly lesson: LessonFile;
      readonly manifest: KienThucManifest;
    }
  | { readonly status: KienThucPageStatus.NotFound };
export function loadLessonPage(
  slug: string,
  source: KienThucContentSource,
): Promise<LessonPageData>;

export function kienThucArticleJsonLd(input: {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  readonly reviewedAt: string;
  readonly image: string;
}): Record<string, unknown>;
export function lessonHead(slug: string, data: LessonPageData | undefined): SeoHead;

export const SECTION_PROBE_REM = 6;
export function activeSectionIndex(sectionTops: readonly number[], probeLine: number): number;
export function useActiveSection(sectionIds: readonly string[]): number;
export function sectionId(index: number): string;

export function LessonPage(props: {
  readonly lesson: LessonFile;
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}): ReactElement;
```

- `kienThucArticleJsonLd` returns `Article` with:
  - `datePublished` and `dateModified` both `reviewedAt`;
  - `inLanguage` `vi`;
  - `author` `{ '@type': 'Organization', name: SITE_NAME, url: SITE_URL }`;
  - `publisher` with the logo;
  - `image` absolute.
- The lesson breadcrumb is `[Kiến thức, lesson]`.
- The route file only wires the pieces:
  - `loader: ({ params }) => import('@/features/kien-thuc/kien-thuc-content').then((source) => loadLessonPage(params.slug, source))`;
  - `head: ({ params, loaderData }) => lessonHead(params.slug, loaderData)`;
  - the component renders `LessonPage` with `loadKienThucSearchIndex`, or `KienThucNotFound`.
- `loadLessonPage` returns `NotFound` for a reserved slug without loading anything.

- [ ] **Step 1: Write the failing tests.**
  - `active-section.spec.ts`: `picks the last section whose top has passed the probe`: tops `[0, 500, 1200]` with probe 600 give 1; probe −10 gives 0; probe 5000 gives 2.
  - `lesson-route.spec.ts` (with `FIXTURE_SOURCE`):
    - `finds a published lesson`: `tu-vi-la-gi` is `Found`.
    - `does not find an unpublished, unknown or reserved slug`: `y-nghia-chinh-tinh`, `khong-co` and `sao` are `NotFound`.
  - `lesson-head.spec.ts`:
    - `titles the lesson by its own title and summary`: the `<title>` is `Tử vi là gì | Tử Vi Miễn Phí`; the description is the fixture summary; the canonical is `https://xemtuvimienphi.top/kien-thuc/tu-vi-la-gi`; `og:type` is `article`; `og:image` ends with `/og/kien-thuc/bai.jpg`.
    - `describes the lesson as an article by the site`: the `Article` JSON-LD has `datePublished` and `dateModified` equal to `reviewedAt`, `author['@type']` `Organization`, and `author.name` `Tử Vi Miễn Phí`. The `BreadcrumbList` has 2 items.
    - `keeps a missing lesson out of the index`: `robots` is `noindex, nofollow`, and the title is `Không tìm thấy bài viết | Tử Vi Miễn Phí`.
  - `lesson-page.spec.tsx` (`renderAtRoute` at `/kien-thuc/$slug`, fixture data, storage cleared, `stubIntersectionObserver`):
    - `opens with a Night hero holding the pill, the h1 and the meta line`: there is one h1 with the lesson title, and its closest `section` has `bg-night`. The hero holds `Bước 1/6 · Tử vi là gì` and the meta line `Bài 1/3 · {m} phút đọc · Cập nhật {dd/mm/yyyy} · Biên soạn: Admin`. A `time` has `dateTime` equal to `reviewedAt`.
    - `draws six track points with this lesson's step current`: the list named `Lộ trình` has 6 items. Item 1 has `data-status="current"` with `inset-ring-2` and `inset-ring-gold`; the others have `unread` with `inset-ring-1` and no `bg-gold`. Each item has an `sr-only` text ending in `đang xem` or `chưa đọc`.
    - `marks finished steps on the track after mount`: with step 1's slugs stored, rendering `12-cung-tu-vi` gives item 1 `read` with `bg-gold`, and item 2 `current`.
    - `sets each section under a serif h2 with a stable anchor`: one h2 per section, each with `font-emphasis`, ids `muc-1`… on their sections, and `scroll-mt-6`.
    - `lists the sections in "Trong bài" from lg`: the `nav` named `Trong bài` has `hidden` and `lg:block`, its links point to `#muc-1`…, and only the first link has `aria-current="location"`, `font-bold` and a `StateBar`.
    - `offers the next lesson`, `offers the next step at a step's end` and `ends the path with the cast-your-chart call`: these use `tu-vi-la-gi`, `am-duong-ngu-hanh-co-ban` and `doc-la-so-cua-chinh-ban`. They show `Bài tiếp theo` with a link to `/kien-thuc/la-so-tu-vi-gom-nhung-gi`; `Bước tiếp theo` with `Bước 2 · Mười hai cung`; and `Lập lá số và đọc theo những gì đã học` linking to `/#lap-la-so` with no `Bài tiếp theo`.
    - `links back to the previous lesson`: `la-so-tu-vi-gom-nhung-gi` shows the link `← Bài trước: Tử vi là gì`.
    - `marks the lesson read only when its end card is half in view`: after render, `readLocalProgress()` is empty. After `reveal(endCard, 0.6)` it holds `tu-vi-la-gi`.
    - `closes with the methodology and the Night card after the end card`: in document order come the end card, `Cách soạn bài` (no facts line, no review line) and `Áp vào lá số của bạn`.
    - `renders term links through the prose renderer`: the button `Thiên Cơ` exists, and `Tử Vi` is plain text.
    - `renders no images`: there is no `img`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- active-section lesson-route lesson-head lesson-page`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Hero:** `PageHero` with `Chip`, a meta `<p className="text-sm text-day-soft">` and `StepTrack` as children.
  - **Step track points:**
    - Read: `size-3 rounded-full bg-gold`.
    - Current: `size-4 rounded-full inset-ring-2 inset-ring-gold`.
    - Unread: `size-2 rounded-full inset-ring-1 inset-ring-day-soft`.
    - They are joined by `h-px flex-1 bg-day/20` rules.
  - **Body:** `<section className="px-4 py-10 md:px-6 md:py-14">` with `lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 max-w-6xl mx-auto`.
  - **TOC:** `sticky top-6`. Each item is `relative pl-4`; the current one adds `font-bold` and a `StateBar`.
  - **Reading zone:** `ReadingZone` holds the sections, then `NextInPathCard` (with `useMarkReadOnView`), the previous link, `LessonEndSlot`, `MethodologyNote` and `KienThucCta`.
  - **Section h2s:** `DisplayTitle` Panel Serif.
- [ ] **Step 4: Run again.** Expected: PASS. `tet-hub-routes.spec.ts` still resolves `/kien-thuc/tu-vi-la-gi` to `/_site/kien-thuc/$slug`.
- [ ] **Step 5: Commit** `feat(kien-thuc): build the lesson page with its step track and next lesson`.

### Task 8: The sample board in "Đọc lá số của chính bạn"

**Files:**

- Create: `features/kien-thuc/sample-chart-view.ts`, `components/sample-chart-board.tsx`
- Modify: `pages/lesson-page.tsx`
- Test: `sample-chart-view.spec.ts`, `pages/lesson-page.spec.tsx` (new cases)

**Interfaces:**

```ts
export const SAMPLE_CHART_LESSON_SLUG = 'doc-la-so-cua-chinh-ban';
export const SAMPLE_VIEW_YEAR = 2027;
export function sampleBirthInput(): BirthInput;
export function sampleChartView(): ChartView;
export function sampleChartCaption(): string;
export function SampleChartBoard(): ReactElement;
```

- [ ] **Step 1: Write the failing tests.**
  - `sample-chart-view.spec.ts`:
    - `casts the board from the lesson's sample birth`: `sampleBirthInput()` is 22/3/1987, solar, hour `Thìn`, `Gender.Male`.
    - `places the same chính tinh as the chart the lesson was written from`: for every cung index `i`, the `chinhTinh` star names in `sampleChartView().cungs[i]` equal those of `castSampleChart().cung[i]` (read the field names from plan 1's `NatalChart`).
    - `shows no yearly or decade stars`: every cung has empty `luuTinh` and `daiVanTinh`.
    - `captions the birth the board was cast from`: `sampleChartCaption()` is `Lá số mẫu: nam, sinh ngày 22/3/1987 dương lịch, giờ Thìn`.
  - `lesson-page.spec.tsx`:
    - `shows the sample board after the first section of lesson 6.3`: for `doc-la-so-cua-chinh-ban`, a `figure` with that `figcaption` follows the `muc-1` section. It resolves after the lazy import, and its fallback box has `aspect-square`.
    - `shows no board on other lessons`: for `tu-vi-la-gi`, there is no `figure`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `SampleChartBoard` holds `selectedIndex`, starting at the Mệnh index, and renders `LaSoBoard`.
  - The lesson page lazy-loads it with `lazy(() => import('../components/sample-chart-board'))` inside `<Suspense fallback={<div className="aspect-square w-full rounded-2xl bg-day-200" />}>`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): show the sample chart board in the last lesson`.

### Task 9: Entry pages

**Files:**

- Create:
  - `features/kien-thuc/pages/entry-page.tsx`;
  - `components/facts-block.tsx`;
  - `route-data/entry-route.ts`, `head/entry-head.ts`;
  - `routes/_site/kien-thuc.sao.$slug.tsx`, `kien-thuc.cung.$slug.tsx`, `kien-thuc.thuat-ngu.$slug.tsx`.
- Test: `route-data/entry-route.spec.ts`, `head/entry-head.spec.ts`, `components/facts-block.spec.tsx`, `pages/entry-page.spec.tsx`

**Interfaces:**

```ts
export type EntryPageData =
  | {
      readonly status: KienThucPageStatus.Found;
      readonly entry: EntryFile;
      readonly manifest: KienThucManifest;
    }
  | { readonly status: KienThucPageStatus.NotFound };
export function loadEntryPage(
  kind: EntryKind,
  slug: string,
  source: KienThucContentSource,
): Promise<EntryPageData>;
export function entryBreadcrumb(entry: EntryFile): readonly BreadcrumbItem[];
export function definedTermJsonLd(input: {
  readonly name: string;
  readonly description: string;
  readonly path: string;
}): Record<string, unknown>;
export function entryHead(kind: EntryKind, slug: string, data: EntryPageData | undefined): SeoHead;
export function FactsBlock(props: {
  readonly facts: EntryFacts;
  readonly manifest: KienThucManifest;
}): ReactElement | null;
export function EntryPage(props: {
  readonly entry: EntryFile;
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}): ReactElement;
```

- The breadcrumb is `[Kiến thức /kien-thuc, GROUP_LABEL[group] indexPath(kind), title entryPath]`. The same list feeds `Breadcrumb` and `breadcrumbJsonLd`.
- `definedTermJsonLd` adds `inDefinedTermSet: absoluteUrl('/kien-thuc/thuat-ngu')`.
- The share image follows the kind: `sao` → Star, `cung` → Palace, `thuat-ngu` → Term.

- [ ] **Step 1: Write the failing tests.**
  - `entry-route.spec.ts`: `finds a published entry of its kind only`: `sao/thien-co` is `Found`; `cung/thien-co`, `sao/tu-vi` and `sao/khong-co` are `NotFound`.
  - `entry-head.spec.ts`:
    - `titles the entry and dates it by its review`: the title is `Sao Thiên Cơ | Tử Vi Miễn Phí`, `og:image` ends with `/og/kien-thuc/sao.jpg`, and the `Article` dates are `reviewedAt`.
    - `breadcrumbs the entry through its group`: the `BreadcrumbList` names are `Kiến thức`, `Chính tinh`, `Sao Thiên Cơ`, and item 2 is `/kien-thuc/sao`.
    - `defines a term inside the glossary set`: `thuat-ngu/can` has a `DefinedTerm` whose `inDefinedTermSet` ends with `/kien-thuc/thuat-ngu`; `sao/thien-co` has none.
  - `facts-block.spec.tsx`:
    - `gives a chính tinh its hành, chòm and twelve bậc`: for `entryFacts('sao/thien-co')`, `Hành` reads `Mộc` and `Chòm` reads `Tử Vi`. There are 12 rating cells, the `Dần` cell reads `Hãm`, and there is no `Hung tinh` row.
    - `shows a dash, not a blank, where a partial row has no bậc`: for `sao/dia-kiep`, `Hung tinh` reads `Có` and the `Dần` cell reads `Đắc`. The other 11 cells each hold an `aria-hidden` `—` and the `sr-only` `không có trong bảng`.
    - `omits the bậc row for a star the tables leave out`: `sao/ta-phu` has `Hành` and `Hung tinh` and no `Bậc theo địa chi`.
    - `lists the star each can turns into Hóa Kỵ`: for `{ kind: Sao, facts: saoFacts('Hóa Kỵ') }`, `Hóa theo can năm` has 10 rows, and the `Giáp` row reads `Thái Dương`.
    - `links a cung's partners when they are published`: for `cung/menh`, `Đối cung` is a link `Thiên Di` to `/kien-thuc/cung/thien-di`, and `Tam hợp` holds `Quan Lộc` and `Tài Bạch` as plain text.
    - `draws no facts for a term`: `entryFacts('thuat-ngu/can')` renders nothing.
    - `sits on day-200 and fades no text`: the root has `bg-day-200`, and no descendant has `opacity-` or a `text-*/NN` class.
  - `entry-page.spec.tsx`:
    - `opens with the breadcrumb, the h1 and the summary`: the `nav` `Đường dẫn` holds `Kiến thức`, then `Chính tinh` linking to `/kien-thuc/sao`, then the current `Sao Thiên Cơ`. The h1 is `Sao Thiên Cơ`, the lead is the summary, and the meta line is `Cập nhật {dd/mm/yyyy} · Biên soạn: Admin`.
    - `leads back to the lesson that teaches the entry when it is published`: `cung/menh` shows `Học trong Bước 2: Mười hai cung →` linking to `/kien-thuc/12-cung-tu-vi`; `sao/thien-co`, whose lesson is unpublished, shows no `Học trong`.
    - `lists related entries of the same kind`: under the h2 `Mục liên quan`, `sao/thien-co` links `Sao Tả Phù` then `Sao Địa Kiếp` (fixture titles) and nothing from `cung`.
    - `credits the engine on pages with facts only`: `sao/thien-co` has the methodology facts line; `thuat-ngu/can` does not.
    - `renders no images`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the three route files the same way as the lesson route, each passing its `ContentKind`. The `day-200` facts table is a `dl` whose rating grid uses `CHI` from the engine and `RATING_LABEL` from `cung-panel.constants.ts`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): build entry pages with engine facts`.

### Task 10: Index pages

**Files:**

- Create:
  - `features/kien-thuc/pages/index-page.tsx`;
  - `components/letter-strip.tsx`;
  - `route-data/index-route.ts`, `head/index-head.ts`, `glossary-order.ts`;
  - `routes/_site/kien-thuc.sao.index.tsx`, `kien-thuc.cung.index.tsx`, `kien-thuc.thuat-ngu.index.tsx`.
- Test: `glossary-order.spec.ts`, `route-data/index-route.spec.ts`, `head/index-head.spec.ts`, `pages/index-page.spec.tsx`

**Interfaces:**

```ts
export interface IndexTile {
  readonly entry: ManifestEntry;
  readonly summary: string;
}
export type IndexPageData =
  | {
      readonly status: KienThucPageStatus.Found;
      readonly kind: EntryKind;
      readonly groups: readonly {
        readonly group: EntryGroup;
        readonly tiles: readonly IndexTile[];
      }[];
    }
  | { readonly status: KienThucPageStatus.NotFound };
export function loadIndexPage(
  kind: EntryKind,
  source: KienThucContentSource,
): Promise<IndexPageData>;
export function glossaryLetter(title: string): string;
export function letterAnchor(letter: string): string;
export function sortGlossary(tiles: readonly IndexTile[]): readonly IndexTile[];
export function definedTermSetJsonLd(terms: readonly IndexTile[]): Record<string, unknown>;
export function indexHead(kind: EntryKind, data: IndexPageData | undefined): SeoHead;
export function IndexPage(props: {
  readonly data: Extract<IndexPageData, { readonly status: KienThucPageStatus.Found }>;
}): ReactElement;
```

- [ ] **Step 1: Write the failing tests.**
  - `glossary-order.spec.ts`:
    - `files a term under its first letter, keeping Đ apart from D`: `glossaryLetter('Địa chi')` is `Đ`, and `glossaryLetter('Cục')` is `C`. `letterAnchor('Đ')` is `chu-dd`, and `letterAnchor('C')` is `chu-c`.
    - `sorts the glossary in Vietnamese order`: `Cục`, `Địa chi`, `Thiên can` sort as `Cục`, `Địa chi`, `Thiên can`.
  - `index-route.spec.ts`:
    - `groups published entries with their index summaries`: `sao` gives chính tinh (`thien-co`), then phụ tinh (`ta-phu`, `dia-kiep`), each with the fixture summary.
    - `does not find a kind with no published entry`: a manifest without cung entries makes `cung` `NotFound`.
  - `index-head.spec.ts`:
    - `titles each index by its kind`: `Các sao trong tử vi | Tử Vi Miễn Phí`, `Mười hai cung | …` and `Thuật ngữ tử vi | …`, with the Decision 18 descriptions, the canonicals, and `og:image` from the kind.
    - `publishes the glossary as a defined term set`: the term index has a `DefinedTermSet` whose `hasDefinedTerm` lists `Hành Kim`, `Thiên can`, `Cục` with descriptions and absolute urls.
    - `keeps an empty kind out of the index`: `NotFound` gives `noindex, nofollow`.
  - `index-page.spec.tsx`:
    - `heads each group of stars with a focusable anchor`: the sao index has h2 `Chính tinh` with `id="chinh-tinh"` and `tabIndex` −1, then `Phụ tinh` (`phu-tinh`), and no `Tứ hóa`.
    - `lists each entry as a tile with its summary`: the tile link `Sao Thiên Cơ` has `href` `/kien-thuc/sao/thien-co` and holds the fixture summary.
    - `lists the twelve cung without a group heading`: the cung index has no h2 between the hero and the tiles, and the tiles keep manifest order.
    - `puts ngũ hành before the glossary and strips letters that have entries`: the term index's h2s are `Ngũ hành` then `Thuật ngữ A–Z`. The `nav` `Theo chữ cái` links only `#chu-c` and `#chu-t`, with `Cục` before `Thiên can`.
    - `opens on a Night hero with a one-line lead`: the h1 sits inside `bg-night`, with the Decision 18 lead.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** The loader takes `loadManifest()` and `await loadSearchIndex()`. The zone is `mx-auto max-w-6xl px-4 py-10 md:px-6`, with tiles in `grid gap-3 sm:grid-cols-2 lg:grid-cols-3`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): add the star, palace and term index pages`.

### Task 11: Search

**Files:**

- Create: `features/kien-thuc/search/search-match.ts`, `search/search-box.tsx`
- Test: `search/search-match.spec.ts`, `search/search-box.spec.tsx`

**Interfaces:**

```ts
export const MAX_SEARCH_RESULTS = 8;
export function normalizeForSearch(text: string): string;
export function searchKienThuc(
  index: readonly KienThucSearchItem[],
  query: string,
): readonly KienThucSearchItem[];
export function SearchBox(props: {
  readonly loadSearchIndex: SearchIndexLoader;
  readonly firstLesson: PublishedLesson | undefined;
}): ReactElement;
```

- [ ] **Step 1: Write the failing tests.**
  - `search-match.spec.ts` (over the fixture index):
    - `ignores diacritics and case`: `thien co` and `THIÊN CƠ` both find `Sao Thiên Cơ`.
    - `matches đ with d`: `dia` finds `Sao Địa Kiếp`.
    - `finds an entry by its alias`: with an item aliased `cung vợ chồng`, `vo chong` finds it.
    - `ranks title prefixes, then title matches, then aliases`: a query matching one title at the start, one inside and one alias returns them in that order.
    - `returns nothing for a blank query and at most eight hits`.
  - `search-box.spec.tsx` (in `renderAtRoute`, with a `jest.fn` loader):
    - `is a labelled combobox that owns a listbox`: the input has `role="combobox"`, the name `Tra cứu kiến thức tử vi`, `aria-autocomplete="list"`, `aria-expanded="false"`, and `aria-controls` naming a `listbox`.
    - `loads the index on first focus only`: focus, blur and focus again call the loader once.
    - `lists matches with their kind`: typing `thien` opens the listbox (`aria-expanded="true"`). The option `Sao Thiên Cơ` shows `Sao`.
    - `moves with the arrow keys and opens with Enter`: ArrowDown sets `aria-activedescendant` to the first option's id and `aria-selected="true"` on it. Enter navigates the router to `/kien-thuc/sao/thien-co`.
    - `closes on Escape`: after Escape, `aria-expanded` is `false`.
    - `offers the first lesson when nothing matches`: typing `xyz` shows `Không tìm thấy mục nào.` and a link `Bắt đầu với bài Tử vi là gì →` to `/kien-thuc/tu-vi-la-gi`.
    - `shows a loading line while the index loads`: with a pending loader, `Đang tải mục lục…` is in a `role="status"` region.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The input is `min-h-12 w-full rounded-full bg-day px-5 text-ink inset-ring-1 inset-ring-ink/20` with `FOCUS_RING_CLASS` and a lucide `Search` icon.
  - The listbox is `absolute inset-x-0 top-full mt-2 rounded-2xl bg-day p-2 text-ink inset-ring-1 inset-ring-ink/15`. The active option is `inset-ring-2 inset-ring-ink bg-day-200`.
  - Options call `router.navigate` on click and Enter.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): search lessons and entries without diacritics`.

### Task 12: Hub page

**Files:**

- Create:
  - `features/kien-thuc/pages/hub-page.tsx`;
  - `components/hero-start-button.tsx`, `step-list.tsx`, `reference-tiles.tsx`;
  - `route-data/hub-route.ts`, `head/hub-head.ts`.
- Modify: `routes/_site/kien-thuc.index.tsx`
- Test: `head/hub-head.spec.ts`, `pages/hub-page.spec.tsx`, `design-system/tokens.spec.ts` (case if needed)

**Interfaces:**

```ts
export function loadHubPage(source: KienThucContentSource): KienThucManifest;
export function hubHead(): SeoHead;
export function HubPage(props: {
  readonly manifest: KienThucManifest;
  readonly loadSearchIndex: SearchIndexLoader;
}): ReactElement;
export function HeroStartButton(props: {
  readonly manifest: KienThucManifest;
}): ReactElement | null;
export function StepList(props: { readonly manifest: KienThucManifest }): ReactElement;
export function ReferenceTiles(props: { readonly manifest: KienThucManifest }): ReactElement | null;
```

`ReferenceTiles` maps the six groups to:

- `/kien-thuc/sao` with hash `chinh-tinh`, `tu-hoa` or `phu-tinh`;
- `/kien-thuc/cung`;
- `/kien-thuc/thuat-ngu` with hash `ngu-hanh` or `thuat-ngu`.

It drops groups without entries and returns null when none is left.

- [ ] **Step 1: Write the failing tests.**
  - `hub-head.spec.ts`: `describes the path and the reference`: the title is `Học tử vi từ đầu: lộ trình 6 bước và tra cứu sao, cung | Tử Vi Miễn Phí`, the description is Decision 7's, the canonical is `/kien-thuc`, and `og:image` ends with `/og/kien-thuc/hub.jpg`.
  - `hub-page.spec.tsx` (`renderAtRoute` at `/kien-thuc`, fixture manifest, storage cleared):
    - `opens with the Night hero, one accent and the start button`: the h1 text is `Đọc lá số trong 6 bước`, and its `.italic` child `6 bước` has `text-dawn`. The eyebrow `Học tử vi từ đầu` and the lead are present. The link `Bắt đầu bước 1` points to `/kien-thuc/tu-vi-la-gi`. The combobox sits inside the hero `section`.
    - `lists only the steps that have lessons`: the `Lộ trình` list has rows `01`, `02` and `06`, in `font-display font-extrabold`. Row 01 reads `3 bài · {sum} phút` and links to `/kien-thuc/tu-vi-la-gi`.
    - `renders the no-progress state first`: with empty storage, there is no `Đã đọc`, no `Đang học` and no `Học tiếp`.
    - `marks read and current steps in words and shape`: with step 1's three slugs stored:
      - row 01 shows `Đã đọc` beside an `svg` inside a `bg-gold` disc;
      - row 02 shows `Đang học 0/1` and holds a `StateBar`, which no other row holds, and its link is `/kien-thuc/12-cung-tu-vi`;
      - the hero link is `Học tiếp: Bước 2 · Mười hai cung`.
    - `keeps the status box and the hero button box the same size in every state`: the status cell has the same width class (`w-28`) with and without progress, and the button wrapper has `min-h-20` and `sm:min-h-13` in both.
    - `offers a review once every lesson is read`: with every fixture lesson stored, the hero link is `Đọc lại từ bước 1`.
    - `shows a tile only for groups that have entries`: the links are `Chính tinh · 1` (`/kien-thuc/sao#chinh-tinh`), `Phụ tinh · 2`, `2 cung` (`/kien-thuc/cung`), `Ngũ hành` (`/kien-thuc/thuat-ngu#ngu-hanh`) and `Thuật ngữ A–Z`. There is no `Tứ hóa`. Each tile holds an `aria-hidden` glyph.
    - `drops the reference block when there are no entries`: with the fixture steps and `entries: []`, there is no h2 `Tra cứu`.
    - `keeps the Tết hub link and ends on the Night card`: the link `Tử vi 2027 theo tuổi` points to `/kien-thuc/tu-vi-2027`, and `Áp vào lá số của bạn` is the last section.
    - `renders no images and fades no text`: there is no `img`, and no class is `opacity-*` or `text-*/NN`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Hero:** `PageHero` with `eyebrow`, `title`, `lead`, and as children the `HeroStartButton` wrapper (`min-h-20 sm:min-h-13`), then `SearchBox`.
  - **Day zone:** `mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14`.
    - The `Lộ trình` h2 is `DisplayTitle` Card Serif.
    - `StepList`, then `HubProgressSlot` (empty here) directly after it, at every width.
    - Each row is a `Link` `relative grid grid-cols-[3rem_minmax(0,1fr)_7rem] items-center gap-3 rounded-xl px-4 py-3` with `FOCUS_RING_CLASS`; the current row adds a `StateBar`. The status cell is `w-28`.
    - Then the `Tra cứu` h2 with its lead and `ReferenceTiles` (`grid gap-3 sm:grid-cols-2 lg:grid-cols-3`), then the Tết `TextLink`.
  - **Then** `KienThucCta` in its own `px-4 pb-14`.
- [ ] **Step 4: Hub head approval.** Show Kim An the Decision 7 title and description as they render in `hub-head.spec.ts`, and wait for his OK. A change edits Decision 7 and the spec first.
- [ ] **Step 5: Run again.** Expected: PASS.
- [ ] **Step 6: Commit** `feat(kien-thuc): build the hub with the path, search and reference tiles`.

### Task 13: Route precedence and reserved segments

**Files:**

- Test: `features/kien-thuc/kien-thuc-routes.spec.ts` (new)

- [ ] **Step 1: Write the tests** with `leafRouteId` copied from `tet-hub-routes.spec.ts`:
  - `sends the index paths to their own routes, not to a lesson`: `/kien-thuc/sao`, `/kien-thuc/cung` and `/kien-thuc/thuat-ngu` resolve to `/_site/kien-thuc/sao/`, `/_site/kien-thuc/cung/` and `/_site/kien-thuc/thuat-ngu/`.
  - `sends entry paths to their kind's entry route`: `/kien-thuc/sao/thien-co` resolves to `/_site/kien-thuc/sao/$slug`, and likewise for `cung` and `thuat-ngu`.
  - `still sends a lesson slug to the lesson route`: `/kien-thuc/tam-hop-xung-chieu` resolves to `/_site/kien-thuc/$slug`.
  - `reserves every static segment under kiến thức`: for each `router.routesById` id under `/_site/kien-thuc/`, the first segment after it, when not `$slug` and not empty, passes `isReservedLessonSlug`. So does `TET_HUB_SLUG`.
  - `never publishes a lesson under a reserved segment`: no slug in the real manifest's steps passes `isReservedLessonSlug`. The case passes on an empty manifest.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- kien-thuc-routes tet-hub-routes`. Expected: PASS once Tasks 7, 9 and 10 exist. Check that it can fail: add a throwaway `routes/_site/kien-thuc.ghi-chu.tsx`, see the reserved case fail, and delete it.
- [ ] **Step 3: Commit** `test(kien-thuc): guard route precedence and the reserved segments`.

### Task 14: `seo-routes`, the sitemap and the redirects

**Files:**

- Create: `apps/frontend/tools/legacy-redirects.mjs`, `apps/frontend/public/_redirects`
- Modify: `apps/frontend/tools/seo-routes.mjs`, `apps/frontend/nginx.conf`
- Test: `tools/seo-routes.spec.ts` (Kiến thức cases; the `getArticleSlugs` case is replaced), `tools/legacy-redirects.spec.ts` (new)

**Interfaces:**

```js
export const LEGACY_REDIRECTS = [
  { from: '/kien-thuc/tam-hop-luc-xung', to: '/kien-thuc/thuat-ngu/tam-hop-luc-xung' },
  { from: '/kien-thuc/chon-huong-ban-lam-viec', to: '/kien-thuc/phong-thuy-va-tu-vi' },
];
export class KienThucManifestError extends Error {}
export class KienThucContentFileError extends Error {}
export class LegacyRedirectError extends Error {}
export function getKienThucPages(directory) {}
export function getSeoRoutes({ manifestPath, vanHanYears, kienThucDirectory }) {}
export function getSitemapEntries({ manifestPath, vanHanYears, kienThucDirectory }) {}
```

- `getKienThucPages` returns `{ path, reviewedAt }` for:
  - every manifest lesson, at `/kien-thuc/<slug>`;
  - every manifest entry, at `/kien-thuc/<kind>/<slug>`;
  - each index path whose kind has entries, undated.
- It throws:
  - `KienThucManifestError` for a malformed manifest, a manifest page without a file, a file on disk the manifest does not list, or a lesson slug that `isReservedLessonSlug` rejects;
  - `LegacyRedirectError` when a `to` is not among the pages.
- A missing manifest gives `[]`, as long as no content file exists.
- `isReservedLessonSlug` and `contentFilePath` come from `@org/shared-contracts` through `createRequire`, the way the file already reads the engine.
- `_redirects` has one line per entry: `<from> <to> 301`.
- `nginx.conf` gains one block per entry before `location /`: `location = <from> { return 301 <to>; }`.

- [ ] **Step 1: Write the failing tests.**
  - `seo-routes.spec.ts`, with temporary directories built the way the Tết cases build them:
    - `lists every published lesson, entry and non-empty index`: from a copy of the Task 2 fixtures laid out as `content/`, it lists `/kien-thuc/tu-vi-la-gi`, `/kien-thuc/sao/thien-co`, `/kien-thuc/sao`, `/kien-thuc/cung` and `/kien-thuc/thuat-ngu`. There is no `/kien-thuc/sao/tu-vi`.
    - `lists only the hub when there is no manifest and no file`.
    - `fails naming a manifest page that has no file`.
    - `fails naming a content file the manifest does not list`.
    - `fails naming a redirect whose target is not published`: without `thuat-ngu/tam-hop-luc-xung`, it is `LegacyRedirectError` naming `/kien-thuc/thuat-ngu/tam-hop-luc-xung`.
    - `dates each lesson and entry by its review in the sitemap`: the entry for `/kien-thuc/sao/thien-co` has `lastModified` equal to its `reviewedAt`.
    - `never lists the old articles that now redirect`: neither `from` path is in the routes.
  - `legacy-redirects.spec.ts`:
    - `serves every legacy redirect as a 301 on Cloudflare`: the non-empty lines of `public/_redirects` are exactly one `<from> <to> 301` line per `LEGACY_REDIRECTS` entry, in table order.
    - `serves the same redirects from nginx`: `nginx.conf` contains `location = ${from} {` followed by `return 301 ${to};` for each entry.
    - `redirects only to planned pages and never shadows a lesson`: each `to` resolves through `parsePageRef`/`plannedPage`, and no `from` slug is a planned lesson.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- seo-routes sitemap legacy-redirects`. Expected: FAIL.
- [ ] **Step 3: Implement.** Delete `getArticleSlugs`. `prerender.mjs` is unchanged, since it already reads `getSeoRoutes` and `getSitemapEntries`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): prerender published pages and redirect the two retired articles`. Body: the 301s sit in `public/_redirects`, which Workers Static Assets apply before the worker, and in nginx. The build fails if a target is unpublished, because browsers cache a 301.

### Task 15: OG images

**Files:**

- Create: `apps/frontend/tools/kien-thuc-og.mjs`, `apps/frontend/public/og/kien-thuc/{hub,bai,sao,cung,thuat-ngu}.jpg`
- Modify: `apps/frontend/package.json` (nx target `kien-thuc-og`, shaped like `tet-hub-og`)
- Test: `features/kien-thuc/kien-thuc-share-images.spec.ts`

**The cards** (title with the accent phrase in `<em>`, then the detail line):

| Image       | Title and accent              | Detail line                          |
| ----------- | ----------------------------- | ------------------------------------ |
| `hub`       | `Học tử vi` + `từ đầu`        | `Lộ trình 6 bước, tra cứu sao, cung` |
| `bai`       | `Lộ trình` + `học tử vi`      | `Sáu bước, mỗi bước vài bài ngắn`    |
| `sao`       | `Các` + `sao` + `trong tử vi` | `Chính tinh, tứ hóa, phụ tinh`       |
| `cung`      | `Mười hai` + `cung`           | `Cung đối, tam hợp, ý nghĩa`         |
| `thuat-ngu` | `Thuật ngữ` + `tử vi`         | `Ngũ hành và từ thường gặp`          |

- [ ] **Step 1: Write the failing test.** `ships one share image per page type`: for every `KienThucPageType`, `public${shareImagePath(type)}` exists and is under 120 KB.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement and render.**
  - The script copies `tet-hub-og.mjs`'s font-face list and `escapeHtml`. It draws an inline SVG orbit in place of the painting, and writes JPEG at quality 70.
  - Run `pnpm nx kien-thuc-og @org/frontend`.
  - Copy the five files to the scratchpad.
- [ ] **Step 4: Image approval.** Show Kim An the five images and the card table above, and wait for his OK. A change edits the table, then re-renders.
- [ ] **Step 5: Run the test again.** Expected: PASS.
- [ ] **Step 6: Commit** `feat(kien-thuc): add one share image per page type`.

### Task 16: Delete the old blog and put the feature under the style guard

**Files:**

- Delete:
  - `features/kien-thuc/kien-thuc-data.ts`;
  - `features/kien-thuc/pages/article-page.tsx`, `pages/kien-thuc-page.tsx`;
  - `features/kien-thuc/components/` `article-card`, `carousel-indicator`, `category-nav`, `featured-carousel`, `handbook`, `hero-birds`, `hero-stars`, `kien-thuc-hero`, `panel`, `popular-topics`, `quote-card`, `section-title` and `social-follow` (`.tsx`);
  - `src/hooks/use-hero-parallax.ts` (its only consumer is `kien-thuc-hero.tsx`).
- Modify:
  - `src/styles.css`: remove the Kiến Thức ambient motion block, lines 263–407 (`kt-*`);
  - `src/config/media.ts`: remove `home.readerGalaxy`, `laSo.illustrationCrane`, `laSo.sealSmall` and the whole `ngayTot` group, once `rg` shows no consumer;
  - `apps/frontend/eslint.config.mjs`: add `'src/features/kien-thuc/**'` to `MIGRATED_FILES`.
- Test: `features/kien-thuc/kien-thuc-fonts.spec.ts` (new, the same walker as `ngay-tot-fonts.spec.ts`)

- [ ] **Step 1: Write the test.**
  - `uses only the weights the home page loads`: no `font-medium`, `font-light` or `font-black`, and no `font-extrabold` without `font-display` in the same string.
  - `sets italics only in the preloaded Playfair`.
  - `fades no text`: no string holds `opacity-` or matches `/\btext-[\w-]+\/\d+\b/`.
  - `draws state marks with inset rings`: no class token in a string literal starts with `ring-` (`/(^|\s)ring-/`); state rings are `inset-ring-*`, and the focus ring comes only from `FOCUS_RING_CLASS`.
  - `references no raster media`: no file imports `@/config/media`.
  - `holds no Chinese characters`: no file matches `/\p{Script=Han}/u`.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend -- kien-thuc-fonts`. Expected: FAIL while the old widgets exist.
- [ ] **Step 3: Delete and edit** as listed.
- [ ] **Step 4: Prove nothing points at them.** `rg "kien-thuc-data|findArticle|KienThucPage\b|ArticlePage|use-hero-parallax|kt-(float|drift|flock|bird|spin|twinkle|aura|parallax|paused)|readerGalaxy|illustrationCrane|sealSmall|ngayTot\." apps/frontend/src apps/frontend/tools` returns nothing.
- [ ] **Step 5: Run the gate.** `pnpm nx affected -t lint typecheck test`. Expected: lint has 0 errors, so the guard finds no hex and no `[Npx]` in `features/kien-thuc`, and every spec passes, including the unedited Tết, home and la-so specs.
- [ ] **Step 6: Commit** `refactor(kien-thuc): delete the old blog widgets and put the feature under the style guard`. Body: the files under `public/` stay for Phase 4.

### Task 17: Verification

- [ ] **Step 1: Build and prerender.** Run `pnpm nx build @org/frontend` with the launch set in `content/`.
  - Expected: `apps/frontend/dist/kien-thuc/index.html` holds the h1, the six-step rows that have lessons, the search input and the tiles.
  - Expected: `apps/frontend/dist/kien-thuc/tu-vi-la-gi/index.html` holds every section, each term panel's `<a href>`, the end card, and the `Article` and `BreadcrumbList` JSON-LD.
  - Expected: `apps/frontend/dist/kien-thuc/sao/thien-co/index.html` holds the facts block. `apps/frontend/dist/kien-thuc/sao/index.html` exists.
  - Expected: there is no `apps/frontend/dist/kien-thuc/tam-hop-luc-xung/`, and `sitemap.xml` dates every lesson and entry.
  - Expected: the launch set is complete: `content/manifest.json` lists 18 lessons, the 14 chính tinh, the 12 cung and `thuat-ngu/tam-hop-luc-xung`.
- [ ] **Step 2: Chunks.** Run `ANALYZE=true pnpm nx build @org/frontend` and open `apps/frontend/dist/stats.html`.
  - Expected: `search-index.json`, the lesson JSON and `la-so-board` are each in their own lazy chunk.
  - Expected: the hub route's chunks hold the manifest only.
- [ ] **Step 3: Redirects.** On the PR's Cloudflare preview (#213), `curl -sI <preview>/kien-thuc/tam-hop-luc-xung` answers 301 with `location: /kien-thuc/thuat-ngu/tam-hop-luc-xung`, and the same holds for `chon-huong-ban-lam-viec`. With the Docker image locally, `curl -sI localhost:<port>/kien-thuc/tam-hop-luc-xung` answers 301 too. If Cloudflare ignores `_redirects`, stop and report; do not move the rules into the worker without Kim An.
- [ ] **Step 4: Visual check** in the running dev server at 320, 390, 768, 1024 × 700 and 1440 × 900, on the hub, `tu-vi-la-gi`, `doc-la-so-cua-chinh-ban`, `sao/thien-co`, `sao/dia-kiep`, `cung/menh` and the three index pages.
  - Expected: `document.documentElement.scrollWidth === innerWidth` everywhere, a term popover near the right edge at 768 included.
  - Expected: the sheet sits above the mobile bar at 320 × 568, with "Đóng" reachable.
  - Expected: every state in Review Focus 2 and 3 reads in greyscale (Achromatopsia).
  - Expected: Tab reaches the search, every option, every term, its panel link, the TOC and every tile, each with the ring visible. The hub tile `Phụ tinh` lands on, and focuses, the `phu-tinh` h2.
  - Screenshots go to the scratchpad for Kim An.
- [ ] **Step 5: CLS with progress.** In DevTools, seed `localStorage['kien-thuc-progress-v1']` with step 1's slugs. Record a Performance trace of `/kien-thuc` and of `/kien-thuc/12-cung-tu-vi` at 390 × 844 with Slow 4G and 4× CPU. Expected: no layout shift in the first viewport when the marks and the hero button switch.
- [ ] **Step 6: Fonts and images.** On `/`, `/kien-thuc`, a lesson and an entry, the woff2 files requested are a subset of `/`'s, and no `image/*` except the logo is requested.
- [ ] **Step 7: Lighthouse A/B.** Serve the Task 0 "A" build and this branch's build with `vite preview` on two ports (never 4200; check `--help` for the flags). Run `npx -y lighthouse@12.8.2` mobile 10 times interleaved A, B on `/kien-thuc` and `/kien-thuc/tu-vi-la-gi`, and 10 times on B alone for `/kien-thuc/sao/thien-co` and `/kien-thuc/sao`.
  - Expected: B's Performance ≥ A's and ≥ 90.
  - Expected: Accessibility ≥ 95 and ≥ A's, Best Practices ≥ 95, SEO 100 and CLS 0 on every page.
  - Expected: the LCP element is the h1.
  - If any page misses, find the cause before going further, and report it with the numbers.
- [ ] **Step 8: Final review** by a fresh reviewer on the whole branch with this Review Focus. Fix Critical and Important findings test-first.

After "tạo pull" and the merge, run Task 0, Step 2 again on production, adding `/kien-thuc/sao/thien-co`. Report the medians beside the A/B, and request indexing for the hub, the index pages and the launch set in Search Console.

## Spec vs code

- **Where the redirects go.** The spec put them in "wrangler.jsonc and its worker". The worker only runs on `/api/*` and on asset misses (`wrangler.jsonc:13`, `worker/index.ts:21-27`), and the repo already ships `public/_headers` for the asset layer. Cloudflare's docs say `_redirects` rules are followed whether or not an asset matches, but not on requests the worker serves first, which here is only `/api/*`. The plan uses `public/_redirects` (Decision 6) and checks it on the preview (Task 17, Step 3); the design now says the same (`kien-thuc-design.md:105`).
- **Term buttons versus internal links.** The spec made terms `<button>`s but counted term links as SEO linking (`kien-thuc-design.md:285`). The plan keeps the button and renders the panel's `<a href>` in the DOM while it is closed (Decision 4); the design's Lesson section now says so (`:222`).
- **A redirect target that may not exist yet.** `tam-hop-luc-xung` 301s to a term entry (`kien-thuc-design.md:102`), while terms could ship after the pages. The plan adds that one term to the launch set and fails the build otherwise (Decision 6). The design's Delivery item 2 and plan 1's Task 15 (approved with the `cung` batch) now match.
- **Nowhere to record which pages Kim An read.** The methodology block depends on it (`kien-thuc-design.md:292`), but neither `LessonFile` nor `EntryFile` (`:156-184`) has a field for it. The plan adds `owner-read-refs.ts`, and shows the AI disclosure on every page (Decision 8). The design now says both.
- **Index summaries.** Index tiles show summaries (`kien-thuc-design.md:239`), but the manifest has none (`kien-thuc-1-content.md:52`). Index loaders read `search-index.json` (Decision 13).
- **Sample chart shapes.** Plan 1's `castSampleChart()` returns a `NatalChart` from `castNatal` (`kien-thuc-1-content.md:445-452`). The board needs a `ChartView` from `toChartView(BirthInput)` (`features/la-so/to-chart-view.ts:112`, through `chartFromBirthInput` in `packages/shared/tu-vi/src/from-birth-input.ts:28`, which also adds yearly stars). The contracts and the engine have different `Gender` enums (`contracts/src/birth-input.ts:11`, `tu-vi/src/van-han.ts:5`). Decision 10 maps the two and pins them with a spec.
- **Gold marks on Day.** "Đã đọc is a gold check" sat on Day, where gold is 1.65:1 (`design.md:80`) and below 3:1 for a meaningful graphic. The check is drawn in Ink on a gold disc, and the words carry the state; the design now says so (`kien-thuc-design.md:212`).
- **`KIEN_THUC_PATH` lives in the Tết hub** (`features/tet-hub/tet-hub-paths.ts:3`). Task 1 moves it.
- **Media kept for Kiến thức.** `phase-3-ngay-tot.md` Decision 12 kept `MEDIA.ngayTot.sceneTop` and `decorCrane` for Kiến thức (`config/media.ts:62-63`). With the old widgets gone they have no consumer, and Task 16 deletes them.
- **Invented signals on the home page.** The home page's Kiến thức chapter shows invented dates and article titles (`features/home/home-content.ts:151-178`), against the spec's Goal 2 and its anti-goal "Fake signals". It is out of scope here (Decision 19).
