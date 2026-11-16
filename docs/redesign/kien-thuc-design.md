# Kiến thức — Design

Status: approved by Kim An on 2026-11-15. Date: 2026-11-14. Parent design: [design.md](design.md), Phase 3 ("Kiến thức (list, article)"). Mockups (AI-generated; layout and style only, the text inside them is placeholder and has domain errors): [the hub](mockups/kien-thuc/hub-desktop.jpg) (E), [a lesson on a phone](mockups/kien-thuc/lesson-mobile.jpg) (F) and [a lesson on desktop](mockups/kien-thuc/lesson-desktop.jpg) (D), chosen by Kim An on 2026-11-14.

## Intent

Kiến thức is today a blog stub. Ten articles of three paragraphs each, invented view counts, a "hot topics" list that links nowhere, a hard-coded quote, social buttons that go nowhere, and the D2 look with Chinese characters. All of it lives in one file, `features/kien-thuc/kien-thuc-data.ts`.

Kim An's read of the audience: most visitors know nothing about tử vi and only want to understand it. They need to be led: what to read first, where to look, how the pieces fit. Search engines need the opposite: many specific pages, each answering one query ("sao Thiên Cơ là gì", "cung Phu Thê nói gì").

The new Kiến thức serves both with two layers:

- **Lộ trình (the path).** Six steps, about three short lessons each, read in order. It sets the reading order, where the eye goes, and how understanding builds. This is the front door.
- **Tra cứu (the reference).** One page per star, palace and term. Lessons link into it. It carries the long-tail search traffic, and it is the content the lá số board's tap-to-explain needs later.

Reading is free and indexable. Signing in only keeps what the reader has earned: their progress, on every device.

## Goals

1. **A beginner knows where to start and what comes next** on every Kiến thức page, including one they landed on from Google in the middle of the path.
2. **Real content, no fake data.** Every number on the page is true: lesson counts, reading time, the last-updated date. Nothing is invented.
3. **Pages that rank.** Each lesson and each reference entry answers one query, with content that differs materially from its neighbours.
4. **The D3 look,** consistent with Home, Lá số, Ngày tốt and Vận hạn.
5. **Lead to the product.** Lessons end with the next lesson and a way to cast a lá số. The last lesson applies everything to the reader's own chart.
6. **Earn sign-ins honestly.** A reader who has made progress is offered a way to keep it.

## Success measures

- Search Console: impressions and clicks on `/kien-thuc/*` lessons and entries, weekly from launch.
- Cloudflare Web Analytics: views per lesson. Lesson 1 → lesson 2 continuation is the path's health signal.
- Search Console: the share of `/kien-thuc/*` entries that sit in "Crawled – currently not indexed" or "Discovered – currently not indexed". If more than half of the published entries are there six weeks after they ship, content batches 4–6 stop until the depth of the entries is looked at again.
- Not measured in v1: sign-ins that start from the progress card. Nothing records an auth source today (`funnel` counts only casts and unlocks), and adding one is follow-up work.
- The design.md quality gates on the hub, one lesson and one entry: CWV green, Lighthouse SEO 100, Accessibility ≥ 95, CLS 0.

## Non-goals

- Rewards for finishing the path (credits or anything else). Kim An ruled it out for now.
- An admin editor for this content. Content is files in the repo (see Approaches).
- Quizzes, comments, ratings, newsletters.
- Phụ tinh beyond the set in "Content v1". More come in later batches through the same pipeline.
- Tap-to-explain on the lá số board. Entry URLs are designed so the board can link to them later.
- Paintings. Pages ship without them, per design.md's asset rule.
- Changes to the Tết 2027 hub under `/kien-thuc/tu-vi-2027`.

## Anti-goals

These would make the project a failure even if it shipped:

- **Gating reading behind sign-in.** It kills indexing and drives beginners away on their first click.
- **Interrupting the reader.** No blocking modal on arrival, no popup mid-article, no "click bait" button that promises content and opens a login form. Google One Tap's small non-blocking prompt, which every page already shows (`routes/__root.tsx`), is not changed here.
- **Fake signals.** No invented views, readers, ratings or dates.
- **Thin or near-duplicate pages** written from a template with names swapped.
- **Fear-mongering copy** ("đại hạn", "chết", "tai hoạ khó tránh"). The forbidden-phrase checks that guard luận giải and the Tết hub apply here too.
- **Wrong domain facts.** An entry that says a star is miếu where the engine says hãm is worse than no entry.

## Approaches

**Where the content lives** (the main how-question):

1. **Drafts written from engine facts by Claude Code subagents in session, reviewed by Kim An, committed as JSON files.** _Chosen._
   - **How a draft is made.** A file-only CLI in `apps/backend/src/content-gen` prints a brief for each page: engine facts, the writing rules and the link targets. A subagent writes the draft from that brief. The same validator as the Tết hub's pipeline then gates the draft: fact contradictions, forbidden phrases, similarity, links and length. Only the review step writes JSON into the frontend feature.
   - **Cost.** No AI API is called, so the only cost is session usage.
   - **Later option.** An API `generate` command can be added behind the same brief and validator, if content ever has to be produced without a session.
   - **Delivery.** Pages are prerendered, which is best for SEO. A correction is a commit and a deploy, which is fine for content that rarely changes.
2. **Database plus an admin editor.** Edits need no deploy. But it needs a schema, an API, an editor screen in the dashboard and a rebuild hook for the prerender and sitemap, for content Kim An does not plan to edit often. It does not remove deploys for SEO either: like Vận hạn, a new page reaches the prerender and the sitemap only at the next frontend build. Rejected for now.
3. **Hand-written content only.** Most accurate, but about 90 pages is weeks of writing. Subagent drafts plus review give the same control at a fraction of the time.

**Keeping the move to a database cheap.** Kim An asked whether files will hold up as Kiến thức grows. The split is:

- **Editorial content** (lessons, entries) lives in files. Each page is its own lazily loaded chunk through `import.meta.glob`, the way the Tết hub loads its 75 files, so the app's bundle does not grow with the number of pages. Only the build's prerender time grows, linearly.
- **User data** (progress, and anything per-user later) lives in the database from day one: the `learning` module.
- **One seam.** The file shapes (`LessonFile`, `EntryFile`, the manifest) are DTOs in `packages/shared/contracts`, and pages read content only through one `kien-thuc-content.ts` loader. Moving to an API later means a table with the same shape, an import script from the files, and a new loader body. Pages and components do not change.
- **When to move.** Any one of these: someone other than Kim An edits content, content changes weekly or more, the content passes about 500 pages (prerender time), or a page needs data that changes without a deploy.

**How the path and the reference combine:**

1. **Path first, reference second, on one hub.** _Chosen_ (Kim An, 2026-11-14). Mockup E.
2. **Reference first (mockup A).** Better for returning readers, but beginners face a map with no starting point.
3. **Path only (mockup B).** Leaves the long-tail pages without a home.

**Sign-in:** reading free, progress kept on the device, and an offer to sign in to keep it everywhere. _Chosen_ (Kim An, 2026-11-14) over gating lessons behind sign-in, for the reasons in Anti-goals.

## Information architecture

| Page         | URL                           | Content                                                                        |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| Hub          | `/kien-thuc`                  | Hero, Lộ trình, Tra cứu, the Tết hub link, a closing CTA                       |
| Lesson       | `/kien-thuc/<lesson-slug>`    | One lesson in the path                                                         |
| Star index   | `/kien-thuc/sao`              | Every star entry, grouped: Chính tinh, Tứ hóa, Phụ tinh (each group an anchor) |
| Star entry   | `/kien-thuc/sao/<slug>`       | 14 chính tinh, the 4 hóa, and the v1 phụ tinh                                  |
| Palace index | `/kien-thuc/cung`             | The 12 cung in board order                                                     |
| Palace entry | `/kien-thuc/cung/<slug>`      | One cung                                                                       |
| Term index   | `/kien-thuc/thuat-ngu`        | Ngũ hành, then the glossary A–Z. Carries the `DefinedTermSet`                  |
| Term entry   | `/kien-thuc/thuat-ngu/<slug>` | One term or hành                                                               |
| Tết hub      | `/kien-thuc/tu-vi-<year>/...` | Unchanged                                                                      |

The three index pages are explicit routes, so they win over the lesson route's `$slug` (today `/kien-thuc/sao` would fall into it and get the noindex shell). The six hub tiles link to them: Chính tinh, Tứ hóa and Phụ tinh to the star index's anchors, 12 cung to the palace index, Ngũ hành and Thuật ngữ to the term index's two sections.

Lessons stay at the flat `/kien-thuc/<slug>` path, so existing article URLs keep working where the topic and the search intent carry over. Of today's ten slugs:

- Eight become lessons on the same query: `tu-vi-la-gi`, `12-cung-tu-vi`, `y-nghia-chinh-tinh`, `cach-xem-dai-van`, `tieu-van-hang-nam`, `sao-thai-tue` (lesson 5.3, titled around "Sao Thái Tuế là gì"), `phong-thuy-va-tu-vi`, `ung-dung-tu-vi-cong-viec`.
- `tam-hop-luc-xung` is about compatibility between tuổi, not palaces. It gets a 301 to the term entry `/kien-thuc/thuat-ngu/tam-hop-luc-xung`, which keeps that query; lesson 2.3 about palaces takes the new slug `tam-hop-xung-chieu`.
- `chon-huong-ban-lam-viec` gets a 301 to `phong-thuy-va-tu-vi`.

Redirects go in `apps/frontend/public/_redirects`, which Workers Static Assets apply before the worker (the worker runs only on `/api/*` and on asset misses, `wrangler.jsonc`), beside the existing `public/_headers`, and in the frontend nginx config. The first segments `sao`, `cung`, `thuat-ngu` and anything matching `tu-vi-<year>` (from `TET_HUB_VIEW_YEAR`) can never be lesson slugs, and a spec enforces it.

## The path

Six steps, three lessons each. The titles are the starting set; the content plan may adjust them.

| Step | Title                 | Lessons                                                                          |
| ---- | --------------------- | -------------------------------------------------------------------------------- |
| 01   | Tử vi là gì           | Tử vi là gì · Một lá số gồm những gì · Âm dương, ngũ hành cơ bản                 |
| 02   | Mười hai cung         | 12 cung trong lá số · Cung Mệnh và cung Thân · Tam hợp, xung chiếu giữa các cung |
| 03   | Chính tinh            | Ý nghĩa chính tinh · Chòm Tử Vi và chòm Thiên Phủ · Miếu, vượng, đắc, bình, hãm  |
| 04   | Phụ tinh và Tứ hóa    | Phụ tinh thường gặp · Tứ hóa là gì · Tuần và Triệt                               |
| 05   | Đại vận và tiểu vận   | Cách xem đại vận · Tiểu vận hằng năm · Sao Thái Tuế và lưu niên                  |
| 06   | Ứng dụng vào đời sống | Tử vi trong công việc · Phong thủy và tử vi · Đọc lá số của chính bạn            |

The path suggests an order. It does not lock one: every lesson opens for everyone.

"Đọc lá số của chính bạn" walks through one sample chart, cast by the engine from a fixed birth date, and ends by sending the reader to cast their own. It does not read the reader's saved charts.

## Content v1

Lengths count âm tiết (whitespace-separated tokens), which is how Vietnamese text is measured here.

- 18 lessons, 600–1,000 âm tiết each, about 4–6 minutes.
- Reference entries, about 58 in all. Chính tinh and cung entries run 450–800 âm tiết, because they carry the most search demand and gate the launch. Every other entry runs 300–700 âm tiết:
  - 14 chính tinh, the 4 hóa (Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ) and 13 common phụ tinh (Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt, Lộc Tồn, Kình Dương, Đà La, Địa Không, Địa Kiếp, Hỏa Tinh, Linh Tinh);
  - the 12 cung;
  - about 15 terms: the five hành, plus concepts no lesson owns, such as can, chi, cục, nạp âm, bản mệnh and tam hợp lục xung (between tuổi). The content plan fixes the list.
- **One page per query.** When a lesson is about exactly one concept (miếu–hãm, Tuần and Triệt, đại vận, tiểu vận, tam hợp between palaces, cung Mệnh and Thân), the lesson owns that query and no term entry is made for it. Term links to such a concept point at the lesson, and the popover shows the lesson's summary. The similarity check compares each entry with the lessons as well as with its neighbours.
- **Facts come from the engine, prose from the writer.** Each entry page shows a facts block computed from `shared-tu-vi`, through the small shared lib `shared-kien-thuc` that also holds the content plan. The writer does not write it. The brief hands the same facts to the writer, and the validator rejects a draft that contradicts them. This is what makes each page differ for real, and what keeps facts right. What the engine has today:
  - star ratings by địa chi (Tý…Hợi): `CHINH_TINH_RATINGS` and `PHU_TINH_RATINGS` in `bang-tra-data.ts`. Some stars have none (Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt, the 4 hóa) and several have partial rows (Địa Kiếp; Văn Xương and Văn Khúc at Mão and Dậu; Lộc Tồn in six cells; Kình Dương at the four tứ sinh and Đà La at the four tứ chính, where they cannot sit). An empty cell means no claim either way;
  - a star's hành (`sao-ngu-hanh-data.ts`), and hung / not hung for phụ tinh (`sao-cat-hung.ts`);
  - chòm Tử Vi / chòm Thiên Phủ, held in private constants in `an-chinh-tinh.ts`, which this project exposes through two functions (`chinhTinhChom`, `chomMembers`);
  - đối cung and tam hợp for a palace: `xungChieuIndex` and `tamHopIndexes` in `chi.ts`.

  A facts block shows only what the engine has. For a star without ratings, the block omits the row, and the validator rejects prose that claims a miếu or hãm position for it. No domain data is added to the engine in this project; filling the gaps needs sourced tables and is follow-up work.

- **Term links inside text.** Lesson and entry prose marks terms as `[[thuat-ngu/can|can]]` or `[[bai/tuan-va-triet|Tuần, Triệt]]`. A link to a page that is not published yet renders as plain text. A spec fails the build if a link names a page that does not exist in the content plan at all.
- **Spelling** follows the engine's star names and the existing copy: Hóa, Hỏa, Thủy, not Hoá, Hoả, Thuỷ. A few engine strings still use the old style (`chi-ngu-hanh.ts`, `luan/the-cung.ts`, `luan/bang/the-cuc.ts`); briefs avoid quoting them, and fixing them is out of scope.
- **Review gate.**
  - **Drafts.** Writers put drafts in the git-ignored `tmp/kien-thuc/drafts/`, never into `content/`. A draft holds only the prose.
  - **Approve.** A CLI command `approve <kind>/<slug>` re-validates a draft Kim An has read, assembles the page from the content plan and the prose, writes it into `content/` and stamps `reviewedAt`. Rewriting a page only touches the drafts folder.
  - **What the gate guarantees.** Every committed file has passed the validator and been approved, and the app needs no runtime filter.
  - **What it does not.** It cannot prove a page was read. Each content PR therefore lists which pages Kim An read and which only passed the validator.
  - The page shows "Cập nhật {reviewedAt}", and the sitemap uses it as `lastmod`. The Tết hub has no such gate (its files carry only `generatedAt`); this one is new.

### Content files

Under `apps/frontend/src/features/kien-thuc/content/`, one JSON file per page plus a manifest. The types live in `packages/shared/contracts` (see "Keeping the move to a database cheap"), and only `kien-thuc-content.ts` reads the files:

```ts
interface LessonFile {
  readonly slug: string;
  readonly step: number;
  readonly order: number;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  }[];
  readonly readingMinutes: number;
  readonly reviewedAt: string;
}

interface EntryFile {
  readonly kind: EntryKind;
  readonly group: EntryGroup;
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly summary: string;
  readonly sections: readonly {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  }[];
  readonly learnInLesson: string;
  readonly reviewedAt: string;
}
```

`EntryKind` is `sao | cung | thuat-ngu`. `EntryGroup` sorts entries inside an index page: `chinh-tinh | tu-hoa | phu-tinh` for stars, `cung` for palaces, `ngu-hanh | thuat-ngu` for terms. Facts are not stored in the file; the page computes them from the engine at render time. `learnInLesson` is the lesson that teaches the entry, which powers "Học trong Bước 3" on the entry page. `readingMinutes` is computed by `approve` from the âm tiết count, not chosen by the writer.

`manifest.json` lists the steps, the lesson order and the entries. It feeds the hub, the next / previous links, the sitemap and the search index.

## Pages

All three page types use the D3 rules from design.md: tokens only, the fonts already loaded by `/`, no text dimmed with opacity, state marks with `inset-ring-*`, no Chinese characters, no new motion. The feature joins `MIGRATED_FILES`. The old widgets (featured carousel, category chips, hot topics, handbook, quote, social buttons, hero birds and stars) and `kien-thuc-data.ts` are deleted.

### Hub — mockup E

```
[Night] HỌC TỬ VI TỪ ĐẦU
        Đọc lá số trong 6 bước          (one gold italic phrase)
        Mỗi bước vài bài ngắn, đọc theo thứ tự…
        [Bắt đầu bước 1 →]  /  [Học tiếp: Bước 2 · Mười hai cung →]
        ( Hoặc tra nhanh: sao, cung, thuật ngữ…  )
[Day]   Lộ trình
        01  Tử vi là gì          3 bài · 15 phút     ✓ Đã đọc
        02▌ Mười hai cung        3 bài · 14 phút     Đang học 1/3
        03 … 06
        Tra cứu — Khi đã quen, tra từng sao, từng cung.
        [Chính tinh · 14] [Tứ hóa · 4] [Phụ tinh · 13] [12 cung] [Ngũ hành] [Thuật ngữ A–Z]
        Tử vi 2027 theo tuổi →
[Night] Áp vào lá số của bạn                     [Lập lá số]
```

- Step rows link to the step's first unread lesson. "Đã đọc" is an Ink check on a gold disc plus the words (gold on Day is 1.65:1, so it is only ever a fill under Ink, design.md); "Đang học" is a gold `inset-ring` left bar plus the words. Neither is colour alone.
- Counts and minutes come from the manifest. A tile shows only when its kind has entries.
- Tile icons are drawn in code from the geometry kit.
- The step rows' progress marks and the hero button's label depend on local progress, which the prerender cannot know. They render the no-progress state first and switch after mount, keeping the same box sizes so CLS stays 0.
- The progress card (see Sign-in) sits directly after the path at every width, with no column reserved for it (Kim An's delegation, 2026-11-16).

### Lesson — mockups F (phone) and D (desktop)

- **Night hero:** a pill "Bước 3/6 · Chính tinh", the h1, "Bài 1/3 · 5 phút đọc · Cập nhật 10/11/2026", and a six-point step track (done / current / ahead marked by fill and shape).
- **Reading zone** (`ReadingZone`): sections with Playfair h2s. From `lg`, a sticky "Trong bài" table of contents on the left, with the current section marked by a gold `inset-ring` bar.
- **Terms:** a dotted gold underline on a real `<button>` that discloses a panel. The panel is in the prerendered DOM while closed (`hidden`) and already holds a real `<a href>` "Xem mục {title} →", so crawlers get the internal link; the entry's summary arrives on first open. It is a popover on desktop and a bottom sheet below `md`. Escape and an outside click close it, and focus returns to the term.
- **End of lesson:** a "Bài tiếp theo" card (or "Bước tiếp theo" at the end of a step), the progress card when it applies, then a Night card "Áp vào lá số của bạn" with "Lập lá số".
- The last lesson of step 06 replaces "Bài tiếp theo" with "Lập lá số và đọc theo những gì đã học".

### Entry

- **Night hero:** breadcrumb "Kiến thức › Chính tinh", the h1 ("Sao Thiên Cơ"), the summary.
- **Facts block** from the engine, as a Day-200 table, showing only rows the engine has: for a star its hành, its chòm or hung mark, and its rating at each địa chi; for a palace its đối cung and tam hợp. In a partial rating row, an empty cell shows "—" (no claim), never a blank that reads as missing.
- **Prose sections**, the same term links as lessons.
- **"Học trong Bước 3: Chính tinh →"** back into the path, then related entries (same kind, by manifest order), then the Lập lá số card.

### Search box

- One field in the hub hero. It searches lesson titles, entry titles and aliases.

### Index pages

- Night `PageHero` with the kind's title ("Các sao trong tử vi", "Mười hai cung", "Thuật ngữ tử vi") and a one-line lead, then a Day zone listing every published entry of that kind as tiles (title and summary), grouped by `EntryGroup` with an h2 per group.
- The term index lists ngũ hành first, then the glossary alphabetically with a letter strip.

### Search

- The index (slug, kind, title, aliases, summary, about 76 items) is a small JSON fetched lazily on first focus, not shipped in the hub's initial bundle. The term popovers use the same index.
- Matching ignores diacritics and case (`thien co` finds Thiên Cơ, `d` matches `đ`).
- ARIA combobox with a listbox. Arrow keys move, Enter opens. "Không tìm thấy" offers the path's first lesson.

## Progress and sign-in

### Progress

- A lesson counts as read when its end (the "Bài tiếp theo" card) scrolls into view, not when the page opens.
- Signed out, progress is a set of lesson slugs in `localStorage`, under a versioned key.
- Signed in, progress is stored on the server and merged with the device's (a set union) on every sign-in.
- Signing out clears the device's progress. The account keeps it on the server, so nothing is lost, and the next person on a shared device does not inherit it.
- Progress unlocks nothing. It only drives the marks on the hub, "Học tiếp" and the step track.

### The progress card (the sign-in offer)

```
Bạn đã đọc 4/18 bài.
Đăng nhập để giữ tiến độ và học tiếp trên mọi thiết bị.
[Đăng nhập]                                  Để sau
```

- **When:** signed out, at least 2 lessons read, at the end of a lesson (never mid-article), and not dismissed in the last 7 days. It can also appear on the hub, after the path, under the same rule.
- **What it does:** "Đăng nhập" opens the existing lazily-loaded auth modal, where Google sign-in and email already live. "Để sau" hides it for 7 days.
- **The reader stays on the lesson.** Today a successful Google sign-in navigates to `/` (`use-google-one-tap.ts`, shared by the modal's Google button), while email sign-in stays put. That would throw the reader out of the lesson they just finished. Plan 3 starts with a separate small PR that makes Google sign-in stay on the current page, site-wide, matching email. It changes shared auth behaviour, so it ships and is reviewed on its own.
- **Copy rule:** it says exactly what signing in does. It promises nothing else.

### Server side

A new backend module `learning` stores read lessons per user:

- Table `learning_progress(user_id, lesson_slug, read_at)`, primary key `(user_id, lesson_slug)`.
- `GET /api/learning/progress` returns the user's slugs. `PUT /api/learning/progress` takes a list of slugs and upserts them; it is idempotent and used for both single reads and the merge after sign-in. Both need a signed-in user.
- The backend does not know the lesson list, which lives in frontend content. It validates the slug shape (kebab-case, at most 80 characters), caps a request at 50 slugs and a user at 200 rows, and ignores duplicates.
- It is a new module, so it follows the `ai/` hexagonal template (port, adapter, service), per CLAUDE.md's migration rule.

## SEO

- Each lesson and entry keeps today's head pattern (`seo()` with title, description, canonical, OG) and adds JSON-LD: `Article` plus `BreadcrumbList` for lessons and entries, and `DefinedTerm` (in a `DefinedTermSet` for the glossary) for term entries.
- `tools/seo-routes.mjs` reads the manifest instead of `kien-thuc-data.ts`, so every reviewed lesson and entry is prerendered and in the sitemap.
- The hub's title and description change to describe the path and the reference. This is the one head change to an existing URL. Kim An approves the wording in the plan.
- Lessons and entries link each other richly (term links, "Học trong…", related entries, next / previous). That internal linking is a large part of the SEO value.
- The redirects for `chon-huong-ban-lam-viec` and `tam-hop-luc-xung` are 301s.
- **How the page was made ("Cách soạn bài").** A short methodology block on every lesson and entry, in the manner of the Tết hub's "Cách chúng tôi tính" (Kim An's delegation, 2026-11-16):
  - the facts table is computed by the site's engine (only where the page has one);
  - the text was drafted with AI help from those facts (always shown);
  - the text was read and approved on {reviewedAt} (only on pages Kim An read).

  The review line shows only on pages Kim An actually read: each batch PR adds those refs to `OWNER_READ_REFS` (`features/kien-thuc/owner-read-refs.ts`), since the content files carry no such field. Validator-only pages show no review claim, since that would be a fake signal. This follows Google's Who/How/Why guidance on automation.

- **Author and reviewer byline.** Kim An's call (2026-11-15): the pages are signed by the site's admin, not by a real name. The visible byline reads "Biên soạn: Admin", and `Article.author` is an `Organization` (the site) rather than a `Person`. This gives up the named-expert E-E-A-T signal, which the methodology block and the engine facts partly make up for.
- **OG images:** one designed D3 share image per page type (hub, lesson, star, palace, term, plus one per index page reusing its type's), not one per page. design.md asks for a designed image per page; per-page images for about 90 pages are a separate pipeline and are follow-up work.

## Delivery

Three plans, in this order, each its own PR or PRs on `dev`:

1. **Content pipeline and content.**
   - **The toolchain.** `content-gen` gets a file-only Kiến thức CLI with four commands: `brief` (engine facts and the writing guide for one page), `check` (the validator: fact contradictions, forbidden phrases, similarity, link targets, âm tiết counts), `preview`, and `approve`.
   - **Writing.** Drafts are written by Claude Code subagents in session, one page per subagent. Each subagent writes from the page's brief and fixes its draft until `check` passes. No AI API is called.
   - **Review.** Drafts are written in batches (step by step, then entries by kind). Kim An reviews each batch behind the same validator gate.
   - An API `generate` command can be added later if content must be produced without a session.
   - Nothing user-facing ships.
2. **Pages.** Hub, lessons, index pages, entries, search, term popover and local progress, the redirects, `seo-routes`, the OG images, and the deletion of the old data and widgets. It ships when all 18 lessons, the 14 chính tinh, the 12 cung and the term `tam-hop-luc-xung` are reviewed: the hub never shows an empty step, and the 301 from the old article never points at a missing page (the build fails if it would). The 4 hóa, the phụ tinh and the other terms can follow in later content PRs: until an entry exists, links to it render as plain text and its tile stays hidden. design.md's target for this page is 2027-01-15.
3. **Sign-in sync.** First the separate "stay on the page after Google sign-in" PR, then the `learning` module and migration, the merge on sign-in, the clear on sign-out, and the progress card.

## Questions Claude answered on Kim An's delegation (2026-11-14)

1. **Who writes the content?** Claude Code subagents in session, from engine facts, gated by the validator, reviewed by Kim An, committed as files. It costs no API spend, is best for prerendering, and the content rarely changes.
2. **What happens to today's articles?** Eight slugs become lessons on the same query, so their URLs survive. Two get 301s: `tam-hop-luc-xung` to its term entry, `chon-huong-ban-lam-viec` to the feng-shui lesson. Their current text is not kept, because it is too thin.
3. **Must lessons be read in order?** No. The path suggests an order, and every lesson stays open. Locking hurts search visitors who land in the middle.
4. **When is a lesson "read"?** When its end scrolls into view. Opening a page is not reading it.
5. **Does sign-in need a backend?** Yes. The card promises progress on every device, so the server must store it. It is a small module.
6. **When does the sign-in offer appear?** After two lessons, at a lesson's end, at most once a week if dismissed. Two lessons is enough for progress to be worth keeping, and it never interrupts reading.
7. **Search on the server or the client?** The client. About 76 items fit in a small JSON, and nothing needs ranking.
8. **Term explanations on a phone?** A bottom sheet. A popover under a finger covers the text.
9. **Show dates and view counts?** Only the real review date. No view counts.
10. **How deep is the reference in v1?** Stars that every chart has (chính tinh, tứ hóa, the common phụ tinh), the 12 cung and the core terms. Other phụ tinh come in later batches.
11. **Paintings?** Not in v1, per design.md. The pages must pass the gates without them first.
12. **The Tết hub?** It keeps its link on the hub, below the reference.
13. **Tie-in with the reader's chart?** For now, the end-of-lesson CTA and the last lesson, which uses a sample chart. Linking stars on the board to their entries is the follow-up this content enables.

After the builder check (same day):

14. **Where do the reference tiles and breadcrumbs lead?** To three index pages, `/kien-thuc/sao`, `/cung` and `/thuat-ngu`, with groups as anchors. A breadcrumb needs a real parent, and the glossary's `DefinedTermSet` needs a page.
15. **Terms that duplicate a lesson?** The lesson owns the query, and no term entry is made. Two pages on one query compete with each other and read as thin.
16. **Stars the engine has no data for?** Their facts block shows only what exists, and the validator forbids prose claims about their positions. Adding domain tables needs sourced data, so it is not done here.
17. **How is "reviewed" enforced?** Drafts never enter `content/`. Only `approve <kind>/<slug>` writes a page there, after re-validating it, and stamps `reviewedAt`. Whether Kim An read the page is recorded per batch, not enforced.
18. **Shared devices?** Signing out clears local progress. The server keeps the account's copy.
19. **Google sign-in sends readers to `/`?** A separate small PR keeps them on the page, site-wide, before the progress card ships.
20. **Measuring sign-ins from the card?** Not in v1: no auth source is recorded anywhere today.
21. **Launch all at once?** Lessons, chính tinh, cung and the redirect target `thuat-ngu/tam-hop-luc-xung` together; the other entries follow in content PRs.
22. **OG images?** One per page type in v1.

## Left to the builder

- Exact component split, file names and test names, following the Ngày tốt and Vận hạn plans.
- Exact copy of microtext (empty states, aria labels), in the established voice, approved in the plan.
- The brief and writing-guide wording, and the validator's thresholds.
- Which phụ tinh make the v1 set, within the list above.
