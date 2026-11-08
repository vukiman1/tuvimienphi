# Tết 2027 per-age hub — Design

Status: for Kim An's approval. Date: 2026-11-07. Parent design: [design.md](design.md), Phase 2. Research: [research.md](research.md).

## Intent

Every year from mid-December to Rằm tháng Giêng, Vietnamese searchers type their own birth year into Google: "tử vi tuổi Bính Dần 1986 năm 2027", "1986 năm 2027 sao gì chiếu mệnh", "tam tai 2027". The sites that win this traffic, ngaydep.com above all, have one page per birth year. Nobody has a 2027 hub yet.

This project builds that hub: **"Tử vi 2027 theo tuổi"**, a set of pages inside Kiến thức, one per birth year. Each page answers the searcher's question at once, with facts our own engine computes for exactly that age, for both nam mạng and nữ mạng, and then leads them to cast a full lá số for the reading only their birth date and hour can give: chapter 06, Vận hạn.

A late hub loses the season for a whole year, so this outranks the rest of the redesign (design.md, "Phases").

## Goals

1. **Answer the query in the first screen.** Someone landing from "tuổi X năm 2027" sees their age, mệnh, sao chiếu mệnh and hạn (for their gender), Tam tai and Thái tuế without scrolling on a phone.
2. **Pages that differ for real.** Every page is built from facts that differ by birth year, and its prose is written from those facts. No near-duplicate pages (design.md: thin content does not rank).
3. **Indexed early.** All pages live and in the sitemap by **2026-12-01**, indexed by **2026-12-10**.
4. **Convert to the product.** Each page leads to the birth form with the view year set to 2027, and from the chart to chapter 06.
5. **Reusable next year.** The same machinery produces "Tử vi 2028" by changing the view year and regenerating content.

## Success measures

- Search Console: all hub URLs indexed by 2026-12-10; impressions and clicks per hub page tracked weekly from then until Rằm tháng Giêng (2027-02-20).
- Top 10 for the long, specific queries ("tuổi {can chi} {năm sinh} năm 2027", with or without "nam/nữ mạng") on a meaningful share of pages before Tết (2027-02-06). The broad head terms ("tử vi 2027") are not a target: a young domain will not beat ngaydep.com there this season.
- Cloudflare Web Analytics: page views on `/kien-thuc/tu-vi-2027/*`.
- Known gap: this season cannot tell how many charts are cast from a hub page. The Phase 0 funnel counter counts casts without their source; attributing them is follow-up work.
- The quality gates of design.md apply to every hub page (CWV green, Lighthouse SEO = 100, AA contrast).

## Non-goals

- Month-by-month predictions, anywhere. The hub works from the birth year only, and chapter 06 has no monthly reading either (its own spec lists that as a non-goal). Nothing on these pages promises one.
- Changing chapter 06. It keeps its Dân gian section as it is; adding Bát hạn and the other new facts to it is follow-up work.
- The editorial Vận hạn page (`/van-han`) and its 2027 entries. That feature holds hand-written prose per con giáp in the `van_han` table and stays as it is; filling 2027 there is separate work.
- Birth years outside 1950–2010 in this season.
- Ads, paid content or a paywall on hub pages.
- Translating or localising beyond Vietnamese.

## Anti-goals

These would make the project a failure even if every page ships:

- **Near-duplicate pages.** Pages whose text is the same apart from the year and a star name. Google treats them as scaled content and they do not rank.
- **Invented facts.** Prose naming a star, hạn or verdict the engine did not compute for that age.
- **Fearmongering.** Language that turns a bad hạn into a threat or pushes people to pay for rituals. The tone is calm and practical: what the tradition says, what to be careful about, what to do.
- **A slow or ad-like page.** Anything that fails the quality gates, or looks like the cluttered competitors the site is positioned against.

## Scope and URLs

All pages live under Kiến thức. **One page per birth year, covering nam mạng and nữ mạng together** (Kim An's decision): nam and nữ of the same year differ only in sao chiếu mệnh and hạn, so two pages per year would repeat most of their facts and read as near-duplicates.

The same reasoning sets **where each fact is written up**. Tam tai, Thái tuế and tuổi hợp xông đất depend only on the con giáp, so every birth year of one chi (1962, 1974, 1986, 1998, 2010 for Dần) has the same verdicts. They are written up **once, on the con giáp page**. A birth-year page shows them in its summary with one or two fixed sentences and a link to the con giáp page, and spends its article on what only that year has.

| Page       | Path                                                                            | Count |
| ---------- | ------------------------------------------------------------------------------- | ----- |
| Hub        | `/kien-thuc/tu-vi-2027`                                                         | 1     |
| Con giáp   | `/kien-thuc/tu-vi-2027/tuoi-{chi}` (e.g. `tuoi-dan`)                            | 12    |
| Birth year | `/kien-thuc/tu-vi-2027/tuoi-{can}-{chi}-{nam sinh}` (e.g. `tuoi-binh-dan-1986`) | 61    |

74 pages in total. Slugs are lower-case, ASCII, hyphenated, and carry the can chi and the year because those are what people type. The year in the path (`tu-vi-2027`) is what makes "Tử vi 2028" a sibling, not a rewrite.

The Kiến thức list page, the home page and `/van-han` link to the hub. Existing URLs do not change. `/kien-thuc/tu-vi-2027` must be its own static route so the existing `/kien-thuc/$slug` article route does not catch it, and no Kiến thức article may use the slug `tu-vi-2027`.

## Page anatomy (birth year)

Layout decided with Kim An on mockups: on a phone the summary comes first and the article follows; on a desktop the article is the main column and the same summary sits sticky in a right column. One summary component, placed by breakpoint.

1. **Breadcrumb:** Kiến thức › Tử vi 2027 › Tuổi Dần › Bính Dần 1986.
2. **Summary** (showcase zone, D2 full palette): "Bính Dần 1986 · Năm 2027", tuổi âm, mệnh nạp âm, Tam tai (and which of the three years), Thái tuế relation, then two rows, **Nam mạng** and **Nữ mạng**, each with its sao chiếu mệnh and hạn. This is the answer to the query.
3. **Article** (reading zone, cream surface, 17–18 px body): AI-written prose for this page, built from the facts that belong to this birth year:
   - Tổng quan năm 2027, framed by the life stage of this age
   - Sao chiếu mệnh và hạn, with a **Nam mạng** and a **Nữ mạng** subsection (anchors `#nam-mang`, `#nu-mang`)
   - Mệnh năm sinh và năm Đinh Mùi (Thiên Hà Thủy): sinh hay khắc
   - Cưới hỏi, làm nhà (Kim lâu, Hoang ốc; Tam tai referenced, not re-explained)
   - Lời khuyên cho năm 2027, for this age
   - **Tam tai, Thái tuế, xông đất**: fixed one-to-two-sentence verdicts from the facts, not AI prose, with a link to the con giáp page for the full write-up
4. **CTA:** "Tuổi chỉ cho biết nét chung. Nhập ngày giờ sinh để xem vận hạn 2027 theo lá số của riêng bạn." It leads to the birth form with the view year set to 2027. A CTA inside the Nam mạng or Nữ mạng subsection also sets the gender. The birth year is not pre-filled (see "The birth form hand-off").
5. **"Cách chúng tôi tính"**: a short, shared explanation of the method (tuổi âm is tuổi mụ; birth year is the lunar year, so people born before Tết belong to the previous year; which tradition the tables follow). Builds trust and answers the commonest confusion.
6. **FAQ** (3–5 questions answered from the facts, e.g. "Nam 1986 năm 2027 sao gì chiếu mệnh?", "Nữ 1986 năm 2027 gặp hạn gì?"), emitted as `FAQPage` JSON-LD. The gendered questions carry the "nam mạng / nữ mạng" wording that the title no longer has room for.
7. **Related:** ±1 and ±2 birth years, the con giáp page, the hub.

The con giáp page lists every birth year of that chi in range with each year's summary, plus a richer article about the con giáp in 2027 that carries the full write-up of Tam tai, Thái tuế and tuổi hợp xông đất for that chi. The hub lists the 12 con giáp, explains what the pages cover, and links to Vận hạn and the lá số.

## Facts per page

Inputs are only the birth lunar year and the view year (2027, Đinh Mùi); gender selects between the two rows where a fact depends on it. Everything is computed in `@org/shared-tu-vi`, pure and tested. Tam tai, Thái tuế and xông đất depend only on the chi; every other fact varies with the birth year, which is what keeps same-chi pages apart (even 1950 and 2010, both Canh Dần with the same mệnh, differ in age, sao, hạn, Kim lâu, Hoang ốc and life stage).

| Fact                                      | Depends on gender | Status today                                                      | Work                                                                                                      |
| ----------------------------------------- | ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Can chi of birth year                     | no                | `getYearCanChi` (`lich/lunar-calendar.ts`)                        | reuse                                                                                                     |
| Tuổi âm (tuổi mụ)                         | no                | `ageInYear` (`van-han.ts`)                                        | reuse                                                                                                     |
| Mệnh nạp âm, birth year and 2027          | no                | `getNapAm` + `viewYearPillar`                                     | reuse                                                                                                     |
| Mệnh sinh/khắc between them               | no                | `theSinhKhac` exists but its labels are star-vs-palace            | new year-vs-mệnh relation with its own labels                                                             |
| Sao chiếu mệnh (Cửu Diệu)                 | yes               | `saoChieuMenh(tuoi, gender)` (`dan-gian.ts`), text `CUU_DIEU_LOI` | reuse                                                                                                     |
| Hạn (Bát hạn)                             | yes               | missing                                                           | new table by tuổi and gender                                                                              |
| Tam tai                                   | no                | `isTamTai` is boolean                                             | add which of the three years                                                                              |
| Phạm Thái tuế: trực, xung, hình, hại, phá | no                | only lục xung/hợp exist (`chi.ts`)                                | new chi relations: tam hình, lục hại, lục phá                                                             |
| Kim lâu                                   | no                | `isKimLau` is boolean                                             | add the variant (thân, thê, tử, lục súc)                                                                  |
| Hoang ốc                                  | no                | missing                                                           | new table                                                                                                 |
| Tuổi hợp xông đất                         | no                | missing                                                           | new rule from tam hợp, lục hợp, avoiding xung/hình/hại, and mệnh sinh                                     |
| Life stage of the age in 2027             | no                | missing                                                           | new: an age band (e.g. lập nghiệp, trung niên, về hưu) from tuổi âm, which frames the overview and advice |

Each new table or rule gets unit tests and a code reference to its source tradition. Where traditions disagree, the builder picks the one used by the most widely read Vietnamese sources and cross-checks a sample of ages against at least two competitor sites; the chosen tradition is named in "Cách chúng tôi tính". New facts are added next to the existing ones in `dan-gian.ts` (or files beside it) so chapter 06 and the hub keep calling the same functions for the facts they share.

## Content generation

Every page's article is written by the AI from a deterministic brief, once, before deploy, and committed as static content. Nothing calls the AI when a visitor opens a page.

- **Brief:** a new year-level brief type (not the natal `ChapterBrief`): the facts above with both gender rows, the view year, and for each fact the claims the prose must make (its keyword and tone), reusing the `luan` claim shape where it fits.
- **Generation:** reuse the luận giải machinery where it applies (`AiClient` port, `sinhVoiKiem` retry-with-violations loop, JSON-schema output), behind a script run by a developer, not a user request. No credits, no `luan_giai_chapter` rows. With the local Gemini key, generate sequentially (it rate-limits parallel calls).
- **Validation** before a page is accepted:
  - every claim's keyword appears in its section with the right tone (the existing `checkContent` idea);
  - no star, hạn or verdict is named that is not in the brief, and the nam/nữ subsections each name only their own sao and hạn (stops invented and swapped facts);
  - forbidden phrases, including fear and sales language;
  - length bounds per section;
  - a similarity check across neighbouring pages (same chi, ±1 year) that fails the batch if two pages share too much text. Threshold is the builder's call, tuned on the first batch.
- **Storage:** generated content is committed under the frontend feature as data files (one per page), so pages are prerendered static HTML, diffs are reviewable in a PR, and regenerating one page is a one-file change. Each page loads only its own content; the 74 articles must not land in the shared bundle, or the performance gate fails.
- **Pillar pages:** the hub and the 12 con giáp pages get an AI first draft that Kim An edits by hand.

## Review

Decided with Kim An: the validators are the gate for every page, plus a quick human pass.

- Kim An reads 10 generated year pages chosen across chi and good/bad years, and the 13 pillar pages in full.
- For the other ~50 year pages, a **preview listing** (local only, not deployed) shows every year page's summary and article on one scrollable screen, so Kim An can skim the batch in about 30 minutes.
- Any page that reads badly is regenerated on its own with one command, without touching the others.

## SEO

- Title: "Tử vi tuổi {Can Chi} {năm} năm 2027: sao chiếu mệnh, hạn, Tam tai (nam & nữ)". Description from the summary facts, naming both genders' sao.
- Canonical (`seo()` in `lib/seo.ts`), `Article` and `BreadcrumbList` JSON-LD on every page, `FAQPage` on year pages.
- All 74 routes go into `getSeoRoutes()` (`apps/frontend/tools/seo-routes.mjs`), so they are in the sitemap and prerendered. Hub routes are listed from the data, not from the regex that scans `kien-thuc-data.ts`.
- Internal links as in "Page anatomy", plus links from the Kiến thức list, the home page and `/van-han` to the hub.
- After deploy: resubmit the sitemap in Search Console and request indexing for the hub and the 12 con giáp pages.

## The birth form hand-off

Today the birth form (home hero, `BirthForm`) always starts empty, and `/la-so` only accepts a complete birth. New work: the home route accepts `gender` and `viewYear` search params and passes them as the form's starting values, so the CTA is a link like `/?gender=nam&viewYear=2027#lap-la-so`.

The birth year is deliberately not pre-filled. The page's year is a lunar year and the form defaults to the solar calendar, so someone born in January 1987 (lunar 1986) who came from the 1986 page would get the wrong year filled in, and a chart one year off. They type their own date, which they know.

## Visual design

Built on the redesign's design system (design.md, "Visual identity"): the summary, hero and con giáp tiles are showcase zones; the article is a reading zone. It needs these Phase 1 primitives first: page hero, panel with ribbon title, chips, CTA, year tiles. If Phase 1 is not finished by 2026-12-01, the hub ships on whatever primitives exist by then (design.md rule). Con giáp illustrations follow the asset-kit rules; a page without an approved illustration ships with ornament only.

## Schedule

| Date       | Milestone                                                                         |
| ---------- | --------------------------------------------------------------------------------- |
| 2026-11-14 | This document approved                                                            |
| 2026-11-17 | Build starts: new facts in `shared-tu-vi`, brief and validator, page routes       |
| 2026-11-24 | First generated batch; similarity threshold tuned; Kim An reviews 10 sample pages |
| 2026-11-28 | All 74 pages generated; Kim An skims the preview listing; pillar pages edited     |
| 2026-12-01 | Live, in the sitemap, indexing requested                                          |
| 2026-12-10 | Indexed (target)                                                                  |

## Decisions

Decided by Kim An:

- The hub lives under Kiến thức.
- One page per birth year 1950–2010 covering both genders, plus 12 con giáp pages and a hub.
- Each page's prose is AI-written from engine facts, luận giải-style, generated once and prerendered.
- Layout: summary first on a phone, article with a sticky summary column on a desktop.
- Review: validators for every page, 10 sample pages and the 13 pillar pages read in full, and a skim of the rest on a preview listing.

Claude's calls (check while reading):

- URL scheme and slugs, with the view year in the path.
- The fact list, including the four new ones (Bát hạn, phạm Thái tuế, Hoang ốc, xông đất) and how traditions are chosen.
- Content committed to the repo as data files rather than stored in the database.
- CTA wording ("vận hạn 2027 theo lá số", no monthly promise) and pre-filling only gender and view year.
- Chapter 06 stays unchanged in this project.
- Similarity check against same-chi and ±1-year neighbours.
- Chi-level facts (Tam tai, Thái tuế, xông đất) written up once on the con giáp page; birth-year articles cover only the facts that vary by year, plus a new life-stage fact.
- Title wording "(nam & nữ)", with the gendered wording carried by the FAQ.

## Left to the builder

- The exact brief type, prompt and section schema.
- The similarity metric and threshold.
- Component structure, file layout and how content data files are loaded.
- The choice of tradition for each new table, within the rule above.
- How the generation script gets an `AiClient` (Nest application context or a thin client).
- How the preview listing is served (a dev-only route or a generated HTML file).
