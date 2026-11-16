# Kiến thức 1 — Content pipeline and content: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the file-only toolchain that briefs, checks and approves every Kiến thức lesson and reference entry, and use it to fill `apps/frontend/src/features/kien-thuc/content/`, with Claude Code subagents writing the drafts in session and Kim An reviewing them. No AI API is called. The work covers:

- the content DTOs;
- a small shared library with the engine facts each page needs, the content plan as data (18 lessons, 31 stars, 12 cung, 15 terms) and the sample chart;
- a `brief` command that prints everything a writer needs for one page;
- a validator that rejects drafts which contradict the engine and lists every claim it could not check;
- a drafts folder under the git-ignored `tmp/`, and an `approve` command that is the only way into `content/`;
- the batch-by-batch writing and review.

Nothing user-facing ships. Pages are plan 2 and sign-in sync is plan 3.

**Architecture:** Four layers, each in the package that owns that kind of code.

- **`packages/shared/contracts/src/kien-thuc.ts`** holds the file shapes (`LessonFile`, `EntryFile`, `KienThucManifest`, `KienThucSearchItem`), the kind and group enums, the content file layout and the slug rules. The frontend loader (plan 2) and the backend tools both import them.
- **`packages/shared/tu-vi`** (the engine) gains only two functions for the chòm and barrel exports of four symbols it already has. It stays a chart engine with no editorial data.
- **`packages/shared/kien-thuc`** (new lib, nx project `shared-kien-thuc`, depends on contracts and the engine) holds what both sides compute from the engine and must agree on: sao facts, cung facts, the content plan and the sample chart for lesson 6.3. The frontend facts block (plan 2) and the backend brief and validator call the same functions, so the page and the prose cannot disagree.
- **`apps/backend/src/content-gen/kien-thuc/`** holds the tools: briefs and the writing guide, the validator, the stores, the indexes, four file-only commands (`brief`, `approve`, `check`, `preview`) and the CLI. It reuses the shared core of `content-gen` (`check-text.ts` with `forbiddenPhraseViolations`, `affirms`, `isAffirmedAt` and `mentions`; `shingle-similarity.ts`; `schema-guards.ts`; `write-json-file.ts`). It imports nothing from `ai/`, no Nest, no database.

The flow for one page:

1. A subagent runs `brief <kind>/<slug>`.
2. It writes the draft JSON to `tmp/kien-thuc/drafts/<kind>/<slug>.json` (git-ignored through the root `tmp` rule).
3. It runs `check --only=<kind>/<slug>` until the draft passes.
4. Kim An reads the generated HTML preview, then runs `approve <kind>/<slug>`. That command re-validates the draft, assembles the page from the plan and the draft's prose, stamps `reviewedAt`, computes `readingMinutes`, writes the page into `content/`, and rebuilds `manifest.json` and `search-index.json` from what is on disk.

**Tech Stack:** a plain TypeScript CLI run with `ts-node` through an nx target (no Nest context, no database, no env, no AI API), Claude Code subagents as writers, Jest, TypeScript strict.

**Spec:** [kien-thuc-design.md](../kien-thuc-design.md), sections "Content v1", "Content files", "Information architecture" (slugs and reserved segments), "The path", "Approaches" (where the content lives, files plus one seam) and Delivery item 1.

## Decisions (approved by Kim An's delegation, 2026-11-14; review changes approved 2026-11-15)

1. **Where things live.** As in Architecture.
   - DTOs go in `shared-contracts`.
   - The content plan, sao facts, cung facts and the sample chart go in `shared-kien-thuc`.
   - The tools go in `apps/backend/src/content-gen/kien-thuc/` (Decision 27).
   - The plan cannot sit in contracts, because it needs `SaoName` and `CungName` and the engine imports contracts.
   - It does not sit in the engine, because it is editorial data (titles, aliases, owned concepts) that Kim An edits during review.
   - Plan 2's frontend needs it twice: to fail the build on a link to a page that is not planned, and to map an entry slug to its engine star or cung for the facts block.
2. **Content layout.** One folder per kind under `apps/frontend/src/features/kien-thuc/content/`: `bai/<slug>.json` for lessons, `sao/<slug>.json`, `cung/<slug>.json`, `thuat-ngu/<slug>.json`, plus `manifest.json` and `search-index.json` at the top. The folder names are the link kinds, so `[[sao/thien-co|…]]` names its file. Only `approve` writes here.
3. **Drafts.**
   - **Location.** `tmp/kien-thuc/drafts/<kind>/<slug>.json`. The root `.gitignore` already ignores `tmp`, so no new rule is needed. Drafts sit outside the frontend source, so no `import.meta.glob` in plan 2 can pick one up. The path names the page.
   - **Shape.** A draft holds only `summary`, `sections`, `writtenBy: 'claude-code'` and `writtenAt` (ISO time). Any other key is a malformed draft, so a writer cannot set a plan field. `approve` strips the metadata. JSON over Markdown: a hand edit stays in the file's final shape. Reading happens in the preview, not in the JSON.
   - **Keeping drafts safe.**
     - A hand-edited draft is approved in the same session.
     - Nobody removes the worktree or runs `git clean -fdX` while `tmp/kien-thuc/drafts/` holds edits.
     - Losing unedited drafts costs only a re-dispatch.
4. **The writer writes prose only.** A draft has `summary` and `sections`. Title, aliases, step, order, kind, group and `learnInLesson` come from the content plan; `readingMinutes` and `reviewedAt` come from `approve`. Nothing a page links or sorts by is chosen by the writer.
5. **Manifest shape.** Lean, because the hub imports it: all six steps in path order, each with its approved lessons in order (slug, order, title, readingMinutes, reviewedAt), and the approved entries in plan order (kind, group, slug, title, learnInLesson, reviewedAt). No summaries and no aliases. `approve` writes it from the files on disk, never by patching the previous one.
6. **Search index.** `approve` also writes `search-index.json`: slug, kind, title, aliases and summary for every approved page, lessons included (76 items when complete). The spec wants it fetched lazily on first focus and reused by the term popovers; producing it with the manifest keeps "only `approve` writes `content/`" true. Plan 2 only loads it.
7. **Lesson slugs.** The 18 slugs are in Task 4. The eight legacy slugs keep their URLs; lesson 2.3 takes `tam-hop-xung-chieu`; `tam-hop-luc-xung` becomes a term entry; `chon-huong-ban-lam-viec` is not in the plan (plan 2 redirects it).
8. **Phụ tinh v1 set.** All 13 the spec lists (Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt, Lộc Tồn, Kình Dương, Đà La, Địa Không, Địa Kiếp, Hỏa Tinh, Linh Tinh). The spec allowed a subset; every one of them is on most boards, and nine have ratings in the engine.
9. **Terms (15).** The five hành, plus `can`, `chi`, `cuc`, `nap-am`, `ban-menh`, `tam-hop-luc-xung`, `vo-chinh-dieu`, `vong-trang-sinh`, `lai-nhan-cung` and `can-luong`. Mệnh chủ / Thân chủ is left out: it would compete with lesson 2.2 for the same reader. The concepts a lesson owns (miếu–hãm, Tuần–Triệt, đại vận, tiểu vận, tam hợp between palaces, cung Mệnh and Thân, tứ hóa, the two chòm, Thái Tuế and lưu niên) get no term entry, and a spec enforces it.
10. **Length and shape thresholds.** Lengths count **âm tiết**: whitespace-separated tokens holding a letter or digit, counted on the prose with link markup reduced to its label. The summary is not counted.
    - Lessons: 600–1,000 âm tiết, 3–6 sections, 2–4 paragraphs per section, at least 3 distinct link targets.
    - Chính tinh and cung entries: 450–800 âm tiết. They carry the most search demand and gate plan 2.
    - Other entries (tứ hóa, phụ tinh, terms): 300–700 âm tiết.
    - All entries: 3–5 sections, 1–3 paragraphs per section, at least 2 distinct link targets.
    - Summary: 60–160 characters, one or two sentences, no link markup. It doubles as the meta description and the popover text.
    - Headings: at most 70 characters, unique on the page, no link markup, not equal to the page title.
11. **Reading time.** `readingMinutes = Math.ceil(syllables / 180)`. That gives 4–6 minutes for a lesson and 3–5 for a chính tinh entry.
12. **`reviewedAt`.** An ISO date `YYYY-MM-DD` in `Asia/Ho_Chi_Minh` at the moment of `approve`. It is the page's "Cập nhật" date and a valid sitemap `lastmod`.
13. **Similarity.** Measured on the Tết hub's 73 pages, which share a fact sheet: median Jaccard 0.04, p99 0.19, max 0.25. A name-swapped template scores 0.59. Three rules:
    - **Jaccard:** 5-shingle Jaccard (`shingleSimilarity`), reject at `0.2` for every pair of pages.
    - **Containment:** between an entry and a lesson, also reject at `0.3` for shingles shared over the shingles of the shorter page (`shingleContainment`). Jaccard misses an entry that copies half of a long lesson: 150 shared out of 300 and 1,000 shingles is 0.13.
    - **Warning:** a pair in the same group at Jaccard `0.10` or above gets a preview warning, not a rejection.

    `check --only` compares the page with every other draft and content file, so the writer is told which page it repeats. `check` reports the whole corpus. Kim An can move the thresholds after the first batch; the preview prints each page's closest neighbour and score.

14. **Fact checks are engine-driven and report what they skip.** The checkers read the engine, not the brief, and apply to every page, lessons included. The binding rules (Tasks 8 and 9) are heuristics over clauses: when a clause is ambiguous, it is skipped rather than guessed. Every clause that holds claim vocabulary (bậc words, hành, chòm, cát/hung, relation words, `luôn`, `không bao giờ`, health and money words) is listed by `check --only` and in the preview as **checked** or **skipped** with the reason, so Kim An reads the skipped ones first.
15. **Star names are case-sensitive.** "Tử Vi" is the star, "tử vi" is the art. The writing guide requires that, the checkers match engine names exactly, and `checkWording` rejects the capitalised art (`môn Tử Vi`, `lá số Tử Vi`, `xem Tử Vi`, `học Tử Vi`, `Tử Vi Đẩu Số`). Chòm mentions ("chòm Tử Vi", "chòm Thiên Phủ") are not star mentions.
16. **Rating vocabulary and binding.**
    - **Vocabulary.** The writing guide names positions only with `miếu`, `vượng`, `đắc địa`, `bình hòa` and `hãm`. The checker maps them to `M`, `V`, `Đ`, `B`, `H`, and ignores `thịnh vượng` and `hưng vượng`.
    - **Scale name.** Two or more rating words in a row, separated only by commas, spaces, `và`, `hay`, `hoặc`, `/` or `–`, name the scale and are not a claim ("miếu hãm", "miếu, vượng hay hãm").
    - **Set rule.** In a clause, a chi is a violation only when the engine's bậc there matches **none** of the affirmed rating words in that clause. Contrast sentences such as "hãm ở Dần nhưng sang Thìn lại miếu" pass, and "Thiên Cơ miếu ở Dần" still fails.
    - **What counts as a mention.**
      - A chi after `cung ` is not a chi, and `Thân` before ` cư` is not a chi.
      - A star name after `cung ` or `chòm ` is not a star, and neither is a phụ tinh that shares a palace name (`Phúc Đức`).
      - A pair alias from the plan (`Không Kiếp`, `Hỏa Linh`, `Xương Khúc`, `Tả Hữu`, `Khôi Việt`) counts as its two stars, so the clause is skipped instead of reading `Không` as a negation.
17. **Spelling.** Reject old-style tone marks on open syllables (`oà oá oả oã oạ`, `oè oé oẻ oẽ oẹ`, `uỳ uý uỷ uỹ uỵ` at the end of a syllable and not after `q`), so `Hoá`, `Hoả`, `Thuỷ` fail while `hoàn`, `toán`, `khoảng`, `Huỳnh` and `Quý` pass. Reject `Tỵ`: the engine and the board write `Tị`.
18. **Forbidden phrases.** `forbiddenPhraseViolations` (which covers `LOI_DOA`, `đại họa`, selling and "how this was written" phrases) plus three the spec names for Kiến thức: `đại hạn`, `chết`, `khó tránh`. Lessons say "đại vận", never "đại hạn". Hung tinh, Tật Ách and Vòng Tràng Sinh are hard to describe without those words, so the writing guide offers calmer phrasings for them (Task 11) instead of leaving the writer to find one by trial.
19. **Links.** `[[<kind>/<slug>|<label>]]` with kind `bai`, `sao`, `cung` or `thuat-ngu`. The target must be in the content plan (published or not), must not be the page itself, and the label is 1–40 characters. Malformed markup is a violation. A repeated link to the same target is not a violation: `readDraft` keeps the first and reduces the rest to their labels before the checks run, and `approve` writes the reduced text.
20. **Writers are Claude Code subagents in session.** No AI API is called, so there is no provider, no pacing, no time budget and no per-call cost; the cost is session usage.
    - Per page, the orchestrating session dispatches one fresh subagent with the page's brief.
    - The subagent writes its draft file, runs `check --only=<ref>`, and fixes until it passes, at most 5 rounds. After that it reports the remaining violations instead of looping.
    - A Kim An rejection re-dispatches a fresh subagent with the brief, the old draft and Kim An's note.
    - Rounds and violations per page go in the SDD ledger (Tasks 14 and 15).
    - An API `generate` command can be added later, behind the same `brief` and validator, if content must be produced without a session.
21. **One CLI, four file-only commands.** nx target `@org/backend:kien-thuc` with `brief`, `approve`, `check` and `preview`. Every command names pages by ref (`<kind>/<slug>`), never by path.
    - `brief <ref>` prints the page's brief as Markdown to stdout (Task 11); its output is deterministic. `brief --batch=<name>` prints the batch's refs, one per line, for the orchestrator. `brief` with neither is an error.
    - `approve <ref> [more refs]` approves the drafts of those pages.
    - `check --only=<ref>` validates one page (its draft, or its content file when it has no draft) against every other page. It prints the violations, then the claim clauses, skipped first, and exits 1 on any violation.
    - `check` without `--only` validates every draft and every content file. It also reports similar pairs, plan-owned fields in content that no longer equal the plan, and a `manifest.json` or `search-index.json` that differs from a rebuild from disk.
    - `preview [--batch=<name>]` writes the HTML preview.
    - Batches are the six steps (`step-01` … `step-06`), the chính tinh in two lots of seven (`chinh-tinh-1`, `chinh-tinh-2`), and `cung`, `tu-hoa`, `phu-tinh`, `ngu-hanh`, `thuat-ngu`. That makes 13 batches, derived from the plan.
22. **`approve` re-validates, with no override, and owns the plan fields.** A hand-edited draft goes through the same validator. If it fails, nothing moves and the violations print. An override flag would be the one path for a wrong fact into `content/`, which the spec ranks worse than no entry. Plan-owned fields are copied from the plan; drafts cannot carry them. A plan edit after the draft is written therefore needs no rewrite.
23. **Hóa entries carry the can table.** The four hóa have no ratings, so their only engine facts would be hành and hung. Their brief and facts also list which star takes that hóa for each can (`anTuHoa`), the one domain fact that makes the four pages differ. The validator checks those claims.
24. **Engine exports.** `an-chinh-tinh.ts` gains a string enum `ChinhTinhChom { TuVi = 'Tử Vi', ThienPhu = 'Thiên Phủ' }`, `chinhTinhChom(name)` and `chomMembers(chom)`, derived from `VONG_TU_VI` and `VONG_THIEN_PHU`, which stay private (their step offsets are placement detail). The barrel also exports four existing symbols the new lib and the briefs read: `ratingOf` and `phuTinhRatingOf` (`an-vong-trang-sinh.ts`), `VONG_TRANG_SINH` (`bang-tra-data.ts`) and `CUC_BY_ELEMENT` (`dia-ban.ts`, `export` keyword only). No table changes.
25. **Sample chart.** Lesson 6.3 reads a chart cast by `castNatal` from `SAMPLE_BIRTH = { year: 1987, month: 3, day: 22, hour: 8, gender: Gender.Nam }`.
    - **What it gives the lesson** (engine, 2026-11-15): Đinh Mão, Kim Tứ Cục. Mệnh at Hợi with Thái Âm (M) and Hóa Lộc. Thân cư Tài Bạch, vô chính diệu, borrowing Thiên Đồng and Cự Môn. Quan Lộc has Thái Dương and Thiên Lương (V), Thiên Di has Thiên Cơ (V) and Hóa Khoa. That is a chart with something bright to read and one borrowing to teach.
    - **What the spec pins:** a Mệnh whose chính tinh are all M, V or Đ; no Kình Dương, Đà La, Địa Không or Địa Kiếp in Mệnh; Thân outside Mệnh; a vô chính diệu cung in Mệnh's tam phương.
    - **Rejected:** the first candidate, 1992-03-08, put hãm stars across the whole tam phương of Mệnh and was dropped for that reason.
    - Plan 2 can render the same board from the same export.
26. **`content-gen` splits into a shared core and per-generator folders.** Kiến thức reuses four files of `content-gen`, and one of them (`similarity.ts`) mixes generic and Tết-only code. Left as it is, the root would hold twelve flat Tết files beside a `kien-thuc/` folder. One refactor commit, with no behaviour change, does this:
    - the atomic `writeJsonFile` (private in `tet-hub-writer.ts`) moves to `write-json-file.ts`, because Kiến thức's content store is the second module that needs an atomic write;
    - `similarity.ts` splits into the generic `shingle-similarity.ts` (`shingleSimilarity`, `SimilarPair`) and `tet-hub/tuoi-nam-similarity.ts`;
    - every Tết-only file moves into `content-gen/tet-hub/` with its name unchanged, including `tet-hub-gen.module.ts`, `ai-call-pacer.ts` and `rejected-attempts.ts`, which Kiến thức no longer uses.

    A second commit adds `src/content-gen/**/*.ts` to the `AI_PORT_ONLY` lint rule.

27. **The tools live in `apps/backend/src/content-gen/kien-thuc/`.** Nothing in them needs Nest or the AI port, but the validator reuses `content-gen`'s shared text checks. `check-text.ts` reads `LOI_DOA` from `api/luan-giai`, so luận giải, the Tết hub and Kiến thức share one list of forbidden phrases. A separate nx project would first have to move `check-text.ts`, `shingle-similarity.ts` and `schema-guards.ts` out of the backend, and `shared-kien-thuc` is the wrong home because the frontend imports it. The nx target runs plain `ts-node`: no application context, no database, no `.env`.
28. **Approved content stays checked.** A backend spec runs the fact checks (not similarity) over `content/**`. A later engine table change then fails `nx affected -t test` on exactly the pages whose prose it contradicts, which lists the pages to rewrite.

## Global Constraints

- **No comments anywhere.** Not in TypeScript, specs or JSON. Existing comments in files you touch stay as they are.
- **Types.**
  - No `any`.
  - `as` only when narrowing `unknown` from `JSON.parse`. Every file read goes through a type guard (`isLessonFile`, `isEntryFile`, `isDraftFile`) and throws a named error on failure.
  - Explicit parameter and return types on every function.
  - `readonly` on every property and array that is not mutated.
  - String enums for closed sets (`ContentKind`, `EntryGroup`, `SaoKind`, `ChinhTinhChom`, `ClaimStatus`, `CheckedSource`, `KienThucCommandName`, `KienThucBatch`).
  - Discriminated unions for facts (`SaoFacts` on `kind`), plan entries (on `kind`) and CLI commands (on `name`). Facts types never use the content enum `EntryGroup`.
  - `SCREAMING_SNAKE_CASE` constants at the top of each file; no magic numbers (every threshold in Decisions is a named constant in the file that uses it).
- **Errors.** Named `Error` subclasses with `name` set and the offending input in the message: `UnknownPageRefError`, `UnknownBatchError`, `InvalidKienThucArgumentError`, `MissingBriefTargetError`, `MissingDraftError`, `MalformedDraftError`, `MalformedContentFileError`, `UnplannedContentError`. No `try/catch` that swallows; `approve` catches `MissingDraftError` and `MalformedDraftError` per ref only to report that ref as rejected and go on.
- **Boundaries.** `content-gen/kien-thuc/**` imports nothing from `ai/`, no Nest module and no TypeORM. `AI_PORT_ONLY` in `apps/backend/eslint.config.mjs` covers `src/content-gen/**` from Task 5 on. Kiến thức may reuse `content-gen/check-text.ts`, which reads `LOI_DOA` from `api/luan-giai`.
- **Engine.** No domain data is added to `shared-tu-vi`. Task 2 adds two functions, an enum and four barrel exports; everything else reads existing tables. Facts use the engine's star names from `sao-names.ts` and `tu-hoa.ts`, which are new-style ("Hóa Lộc"). Never put `TheSinhKhac` values or `luan/bang/*` phrases into a brief: several are old-style (see "Spec vs code").
- **Content.** Only `approve` writes `content/`. A writing subagent writes only its own draft file. `brief`, `check` and `preview` write nothing outside `tmp/`.
- **Worktree.** Task 0 installs dependencies in the worktree. Prefix every nx command, the subagents' included, with `NX_WORKSPACE_ROOT_PATH=/Users/anvu-neli/Workspaces/Projects/tuvimienphi/.claude/worktrees/kien-thuc-design`, or it runs the main checkout's code. Never stop the dev servers on 4200 and 3000.
- **Tests run as:** `pnpm nx test shared-contracts`, `pnpm nx test shared-tu-vi -- an-chinh-tinh`, `pnpm nx test shared-kien-thuc`, `pnpm nx test @org/backend -- content-gen`.
- **Gate:** `pnpm nx affected -t lint typecheck test`. If backend typecheck fails with TS6305 everywhere, delete `apps/backend/dist/tsconfig.app.tsbuildinfo` and `apps/backend/out-tsc/jest/tsconfig.spec.tsbuildinfo` (never `apps/backend/dist`).
- **Commits.** Each task names its intended commit subject. Nothing is committed or pushed until Kim An says "tạo pull". The code lands as one PR on `dev`; approved content lands in one PR per review batch (Task 16).

## Review Focus

1. **A wrong fact cannot reach `content/`.**
   - Every fact checker has a test where prose contradicts the engine and is rejected, and one where the same prose with the engine's value passes.
   - Covered: a rating at a chi, a rating claim for a star without ratings (Tả Phù, the 4 hóa), a cell the engine leaves empty (Địa Kiếp at Tý, Văn Xương at Mão), hành, chòm, cát/hung for phụ tinh, đối cung and tam hợp for cung and chi, lục hợp for chi, hóa by can, and placements in the sample chart.
   - "lá số tử vi" never binds to the star Tử Vi; "chòm Thiên Phủ" never binds to the star Thiên Phủ; "cung Phúc Đức" never binds to the star Phúc Đức.
   - `approve` runs the same validator on a hand-edited draft and refuses it.
   - `approved-content.spec.ts` fails when committed content contradicts the engine.
2. **Correct Vietnamese is not rejected, and what is not checked is visible.**
   - `golden-sentences.spec.ts` (Task 9) holds correct sentences that every fact check must pass, including contrasts, scale names with `hay`, `Thân cư`, pair aliases, non-copular `hung tinh` and lists of all four tam hợp groups.
   - Every claim clause appears in `check --only` and in the preview as checked or skipped with its reason.
3. **The review gate is real.**
   - A draft cannot carry plan fields; `approve` is the only writer of `content/`; it takes refs, copies plan fields from the plan, and rebuilds the manifest and search index from disk; a content file that is not in the plan fails the rebuild.
   - `brief`, `check` and `preview` leave `content/` byte-for-byte unchanged (asserted in `check.spec.ts` and `preview.spec.ts`).
   - `check` reports plan-field and manifest drift.
   - The drafts folder is git-ignored (`git check-ignore` in Task 13).
   - Each batch PR lists which pages Kim An read and which only passed the validator.
4. **The content plan.**
   - 18 lessons in six steps of three; 14 + 4 + 13 stars; 12 cung in `CUNG_NAMES` order; 15 terms.
   - The eight legacy slugs are lessons; `tam-hop-xung-chieu` is lesson 2.3; `tam-hop-luc-xung` is a term; `chon-huong-ban-lam-viec` is absent.
   - No lesson slug is `sao`, `cung`, `thuat-ngu` or `tu-vi-<4 digits>`.
   - Every `learnInLesson` is a planned lesson; no term entry duplicates a concept a lesson owns.
   - Aliases are Kim An's to check in batch review (Task 16), since they are domain wording.
5. **A brief a writer can follow, and a strict check that does not waste rounds.**
   - `brief` output is deterministic and carries the guide, the facts, the limits for the page's group, the link targets, the file path, the draft shape and the check command.
   - Duplicate links are reduced, not rejected.
   - Violation messages are Vietnamese, name the section and the claim, and say what the engine has, so a writer can fix the draft from the message alone.
   - The dry run (Task 14) covers every checker on seven pages and records rounds per page; a check that rejects correct prose twice is fixed test-first (a new golden sentence) before the batches start.
6. **Boundaries and reuse.**
   - `content-gen/kien-thuc/**` imports nothing from `ai/`; lint holds `content-gen/**` to `ai/port`.
   - Reused, not copied: `shingleSimilarity`, `forbiddenPhraseViolations`, `affirms`, `isAffirmedAt`, `mentions`, `normalize`, `splitSentences`, `isRecord`, `isStringArray`, `writeJsonFile`.
   - The only edits outside the new folders are:
     - Decision 26's refactor and lint commits.
     - Decision 24's engine exports.
     - The `isAffirmedAt` export (Task 6) and `shingleContainment` (Task 10).
     - The index barrels.
     - The `shared-kien-thuc` dependency in `apps/backend/package.json`.
     - The nx target.
   - No comments, no `any`, no `as` outside JSON narrowing.

---

### Task 0: Ground check

- [ ] **Step 0: Make the worktree runnable.** Run `pnpm install --frozen-lockfile` in the worktree (it has no `node_modules`, so `@org/*` would not resolve). Run `pnpm nx test shared-tu-vi` once and confirm the output paths contain the worktree path.
- [ ] **Step 1:** `git -C <worktree> status` shows only the spec and this plan as untracked. Run `pnpm nx test @org/backend -- content-gen` and `pnpm nx test shared-tu-vi`. Expected: green. Record the counts in the SDD ledger. Nothing in this plan needs Postgres, `.env` or an AI key.

### Task 1: Content contracts

**Files:**

- Create: `packages/shared/contracts/src/kien-thuc.ts`
- Modify: `packages/shared/contracts/src/index.ts` (`export * from './kien-thuc.js';`)
- Test: `packages/shared/contracts/src/kien-thuc.spec.ts`

**Interfaces:**

```ts
export enum ContentKind {
  Bai = 'bai',
  Sao = 'sao',
  Cung = 'cung',
  ThuatNgu = 'thuat-ngu',
}
export type EntryKind = ContentKind.Sao | ContentKind.Cung | ContentKind.ThuatNgu;
export enum EntryGroup {
  ChinhTinh = 'chinh-tinh',
  TuHoa = 'tu-hoa',
  PhuTinh = 'phu-tinh',
  Cung = 'cung',
  NguHanh = 'ngu-hanh',
  ThuatNgu = 'thuat-ngu',
}
export const ENTRY_GROUPS_BY_KIND: Readonly<Record<EntryKind, readonly EntryGroup[]>>;
export type PageRef = `${ContentKind}/${string}`;

export interface ContentSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}
export interface LessonFile {
  /* exactly the spec's fields */
}
export interface EntryFile {
  /* exactly the spec's fields */
}

export interface ManifestLesson {
  readonly slug: string;
  readonly order: number;
  readonly title: string;
  readonly readingMinutes: number;
  readonly reviewedAt: string;
}
export interface ManifestStep {
  readonly step: number;
  readonly title: string;
  readonly lessons: readonly ManifestLesson[];
}
export interface ManifestEntry {
  readonly kind: EntryKind;
  readonly group: EntryGroup;
  readonly slug: string;
  readonly title: string;
  readonly learnInLesson: string;
  readonly reviewedAt: string;
}
export interface KienThucManifest {
  readonly steps: readonly ManifestStep[];
  readonly entries: readonly ManifestEntry[];
}
export interface KienThucSearchItem {
  readonly kind: ContentKind;
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly summary: string;
}

export const KIEN_THUC_MANIFEST_FILE = 'manifest.json';
export const KIEN_THUC_SEARCH_INDEX_FILE = 'search-index.json';
export const CONTENT_SLUG_MAX_LENGTH = 80;
export const RESERVED_LESSON_SEGMENTS: readonly string[];
export function contentFilePath(kind: ContentKind, slug: string): string;
export function pageRef(kind: ContentKind, slug: string): PageRef;
export function parsePageRef(
  text: string,
): { readonly kind: ContentKind; readonly slug: string } | null;
export function isContentSlug(slug: string): boolean;
export function isReservedLessonSlug(slug: string): boolean;
```

`RESERVED_LESSON_SEGMENTS` is `['sao', 'cung', 'thuat-ngu']`; `isReservedLessonSlug` also matches `/^tu-vi-\d{4}$/`. The year pattern is wider than `TET_HUB_VIEW_YEAR` on purpose: contracts cannot import the engine (the engine imports contracts), and every future Tết hub year stays reserved. `isContentSlug` is the kebab-case and length rule plan 3's `learning` module also needs. `parsePageRef` is how the CLI reads a ref.

- [ ] **Step 1: Write the failing tests** in `kien-thuc.spec.ts`:
  - `files a lesson under bai and an entry under its kind`: `contentFilePath(ContentKind.Bai, 'tu-vi-la-gi')` is `bai/tu-vi-la-gi.json`; `contentFilePath(ContentKind.ThuatNgu, 'can')` is `thuat-ngu/can.json`.
  - `reserves the index segments and every Tết hub year`: `sao`, `cung`, `thuat-ngu`, `tu-vi-2027` and `tu-vi-2031` are reserved; `tu-vi-la-gi` and `12-cung-tu-vi` are not.
  - `accepts kebab-case slugs up to 80 characters`: `tam-hop-xung-chieu` and `12-cung-tu-vi` pass; `Tam-hop`, `tam_hop`, `-tam`, `tam--hop`, `thiên-cơ` and an 81-character slug fail.
  - `lists the groups each entry kind sorts by`: `sao` → chính tinh, tứ hóa, phụ tinh in that order; `cung` → cung; `thuat-ngu` → ngũ hành, thuật ngữ.
  - `joins a kind and a slug into a page ref and reads it back`: `pageRef(ContentKind.Sao, 'thien-co')` is `sao/thien-co`; `parsePageRef('sao/thien-co')` gives kind `sao` and slug `thien-co`; `parsePageRef('ghi-chu/x')`, `parsePageRef('sao/Thien')` and `parsePageRef('sao')` are null.
- [ ] **Step 2: Run them.** Expected: FAIL (module missing).
- [ ] **Step 3: Implement.** Pure constants and functions; the interfaces copy the spec's shapes field for field.
- [ ] **Step 4: Run them again.** Expected: PASS. `pnpm nx typecheck shared-contracts` passes.
- [ ] **Step 5: Commit** `feat(contracts): add the kiến thức content file shapes and slug rules`.

### Task 2: Expose the chòm and the tables the content lib reads

**Files:**

- Modify: `packages/shared/tu-vi/src/an-chinh-tinh.ts`, `packages/shared/tu-vi/src/dia-ban.ts` (`export` on `CUC_BY_ELEMENT`), `packages/shared/tu-vi/src/index.ts`
- Test: `packages/shared/tu-vi/src/an-chinh-tinh.spec.ts` (new cases)

**Interfaces:**

```ts
export enum ChinhTinhChom {
  TuVi = 'Tử Vi',
  ThienPhu = 'Thiên Phủ',
}
export function chinhTinhChom(name: ChinhTinhName): ChinhTinhChom;
export function chomMembers(chom: ChinhTinhChom): readonly ChinhTinhName[];
```

`VONG_TU_VI` and `VONG_THIEN_PHU` stay private; both functions derive from them. `index.ts` adds `export { ratingOf, phuTinhRatingOf } from './an-vong-trang-sinh.js';` and `export { VONG_TRANG_SINH } from './bang-tra-data.js';`. `CUC_BY_ELEMENT` gets only the `export` keyword, and `dia-ban.ts` is already in the barrel. No value and no existing comment changes.

- [ ] **Step 1: Write the failing tests:**
  - `puts six stars in chòm Tử Vi and eight in chòm Thiên Phủ`: `chomMembers(TuVi)` is Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh; `chomMembers(ThienPhu)` is Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, Phá Quân.
  - `assigns every chính tinh to exactly one chòm`: over `CHINH_TINH_NAMES`, the two member lists are disjoint and together equal the 14 names.
  - `finds the chòm of a star`: `chinhTinhChom('Liêm Trinh')` is `TuVi`, `chinhTinhChom('Phá Quân')` is `ThienPhu`.
- [ ] **Step 2: Run** `pnpm nx test shared-tu-vi -- an-chinh-tinh`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run again.** Expected: PASS, and the existing `an-chinh-tinh` cases still pass unedited. `pnpm nx typecheck shared-tu-vi` passes.
- [ ] **Step 5: Commit** `feat(tu-vi): expose the star circles and the tables kiến thức reads`.

### Task 3: The `shared-kien-thuc` lib with sao and cung facts

**Files:**

- Create: `packages/shared/kien-thuc/` through the `nx-generate` skill (invoke it first). Use an `@nx/js:library` named `@org/shared-kien-thuc` with nx name `shared-kien-thuc`, tags `scope:shared` and `type:lib`, and the same `package.json` exports (`@org/source` condition), Jest and tsconfig setup as `shared-tu-vi`. Dependencies are `@org/shared-contracts` and `@org/shared-tu-vi` (`workspace:*`).
- Create: `packages/shared/kien-thuc/src/sao-facts.ts`, `src/cung-facts.ts`, `src/index.ts`
- Modify: `apps/backend/package.json` (dependency `@org/shared-kien-thuc: workspace:*`), then `pnpm install`
- Test: `src/sao-facts.spec.ts`, `src/cung-facts.spec.ts`

**Interfaces:**

```ts
export enum SaoKind {
  ChinhTinh = 'chinh-tinh',
  PhuTinh = 'phu-tinh',
  TuHoa = 'tu-hoa',
}
export interface SaoRatingCell {
  readonly chi: number;
  readonly rating: Rating;
}
interface SaoFactsBase {
  readonly name: SaoName;
  readonly hanh: NguHanh;
  readonly ratings: readonly SaoRatingCell[];
}
export interface ChinhTinhFacts extends SaoFactsBase {
  readonly kind: SaoKind.ChinhTinh;
  readonly name: ChinhTinhName;
  readonly chom: ChinhTinhChom;
}
export interface PhuTinhFacts extends SaoFactsBase {
  readonly kind: SaoKind.PhuTinh;
  readonly name: PhuTinhName;
  readonly isHung: boolean;
}
export interface TuHoaByCan {
  readonly can: number;
  readonly star: SaoName;
}
export interface TuHoaFacts extends SaoFactsBase {
  readonly kind: SaoKind.TuHoa;
  readonly name: HoaName;
  readonly isHung: boolean;
  readonly byCan: readonly TuHoaByCan[];
}
export type SaoFacts = ChinhTinhFacts | PhuTinhFacts | TuHoaFacts;
export function saoFacts(name: SaoName): SaoFacts;
export function ratingAt(name: SaoName, chi: number): Rating | null;

export interface CungFacts {
  readonly name: CungName;
  readonly doiCung: CungName;
  readonly tamHop: readonly [CungName, CungName];
}
export function cungFacts(name: CungName): CungFacts;
```

- `ratings` holds only the cells the engine has. A null cell (`phuTinhRatingOf`) and a star with no row both yield no cell. The engine does not say which nulls are unreachable, so the facts do not either.
- `ratingAt` is `ratingOf` for a chính tinh and `phuTinhRatingOf` otherwise.
- `cungFacts` applies `xungChieuIndex` and `tamHopIndexes` to the palace's index in `CUNG_NAMES`. That is valid because palaces are counted thuận by chi from Mệnh, so a palace offset is a chi offset.

- [ ] **Step 1: Write the failing tests.**
  - `sao-facts.spec.ts`:
    - `gives a chính tinh its hành, its chòm and all twelve ratings`: `saoFacts('Thiên Cơ')` has kind chính tinh, hành `Mộc`, chòm `TuVi`, 12 cells, and the cell at Dần (2) is `H`.
    - `keeps only the rated cells of a partial phụ tinh row`: `saoFacts('Địa Kiếp').ratings` is exactly `[{ chi: 2, rating: 'Đ' }]`; `saoFacts('Văn Xương').ratings` has 10 cells and none at Mão (3) or Dậu (9); `saoFacts('Kình Dương').ratings` has no cell at Dần, Tị, Thân or Hợi.
    - `gives no ratings to stars the tables leave out`: Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt and the four hóa have `ratings` of length 0.
    - `marks hung phụ tinh from the engine list`: Kình Dương and Địa Không are hung; Lộc Tồn, Tả Phù and Văn Khúc are not.
    - `groups the four hóa apart and lists their star for every can`: `saoFacts('Hóa Kỵ')` has kind tứ hóa, `isHung` true, 10 `byCan` rows, and the Giáp row (can 0) is Thái Dương. `saoFacts('Hóa Lộc').byCan[0].star` is Liêm Trinh.
    - `reads ratings by chi and returns null where the engine has none`: `ratingAt('Thái Dương', 5)` is `M`, `ratingAt('Địa Kiếp', 0)` is null, `ratingAt('Tả Phù', 2)` is null.
  - `cung-facts.spec.ts`:
    - `pairs Mệnh with Thiên Di and Tài Bạch, Quan Lộc`: `cungFacts('Mệnh')` has đối cung Thiên Di and tam hợp Quan Lộc and Tài Bạch.
    - `pairs Phu Thê with Quan Lộc and Phúc Đức, Thiên Di`.
    - `makes đối cung symmetric for all twelve palaces`: for every name, `cungFacts(cungFacts(n).doiCung).doiCung` is `n`.
    - `closes every tam hợp group`: for every name, each tam hợp partner lists the other two of the group.
- [ ] **Step 2: Run** `pnpm nx test shared-kien-thuc`. Expected: FAIL.
- [ ] **Step 3: Implement** as pure lookups over the engine's barrel: `ratingOf`, `phuTinhRatingOf`, `CHINH_TINH_NGU_HANH`, `PHU_TINH_NGU_HANH`, `isHungTinh`, `chinhTinhChom`, `anTuHoa` (can 0–9), `HOA_NAMES`, `CUNG_NAMES`, `xungChieuIndex` and `tamHopIndexes`.
- [ ] **Step 4: Run again.** Expected: PASS. `pnpm nx lint shared-kien-thuc` and `pnpm nx typecheck shared-kien-thuc` pass.
- [ ] **Step 5: Commit** `feat(kien-thuc): add the shared lib with the facts a star or palace page shows`.

### Task 4: The content plan and the sample chart

**Files:**

- Create: `packages/shared/kien-thuc/src/content-plan.ts`, `src/sample-chart.ts`
- Modify: `packages/shared/kien-thuc/src/index.ts`
- Test: `src/content-plan.spec.ts`, `src/sample-chart.spec.ts`

**Interfaces:**

```ts
export interface PlannedStep {
  readonly step: number;
  readonly title: string;
}
export interface PlannedLesson {
  readonly kind: ContentKind.Bai;
  readonly slug: string;
  readonly step: number;
  readonly order: number;
  readonly title: string;
  readonly ownedConcepts: readonly string[];
}
interface PlannedEntryBase {
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly learnInLesson: string;
}
export interface PlannedStarEntry extends PlannedEntryBase {
  readonly kind: ContentKind.Sao;
  readonly group: EntryGroup.ChinhTinh | EntryGroup.TuHoa | EntryGroup.PhuTinh;
  readonly star: SaoName;
}
export interface PlannedCungEntry extends PlannedEntryBase {
  readonly kind: ContentKind.Cung;
  readonly group: EntryGroup.Cung;
  readonly cung: CungName;
}
export interface PlannedTermEntry extends PlannedEntryBase {
  readonly kind: ContentKind.ThuatNgu;
  readonly group: EntryGroup.NguHanh | EntryGroup.ThuatNgu;
  readonly hanh: NguHanh | null;
}
export type PlannedEntry = PlannedStarEntry | PlannedCungEntry | PlannedTermEntry;
export type PlannedPage = PlannedLesson | PlannedEntry;

export const KIEN_THUC_STEPS: readonly PlannedStep[];
export const KIEN_THUC_LESSONS: readonly PlannedLesson[];
export const KIEN_THUC_ENTRIES: readonly PlannedEntry[];
export function plannedPage(ref: PageRef): PlannedPage | undefined;
export function plannedRefOf(page: PlannedPage): PageRef;
export function lessonsOfStep(step: number): readonly PlannedLesson[];

export const SAMPLE_BIRTH: {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly gender: Gender;
};
export function castSampleChart(): NatalChart;
```

**The data.** Titles, slugs and steps below are the plan's values; titles of steps and lessons are the spec's starting set.

| Step | Title                 | Lessons (slug — title — owned concepts)                                                                                                                                                                                   |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Tử vi là gì           | `tu-vi-la-gi` — Tử vi là gì · `la-so-tu-vi-gom-nhung-gi` — Một lá số gồm những gì · `am-duong-ngu-hanh-co-ban` — Âm dương, ngũ hành cơ bản (âm dương)                                                                     |
| 2    | Mười hai cung         | `12-cung-tu-vi` — 12 cung trong lá số · `cung-menh-va-cung-than` — Cung Mệnh và cung Thân (cung Mệnh, cung Thân) · `tam-hop-xung-chieu` — Tam hợp, xung chiếu giữa các cung (tam hợp, xung chiếu, đối cung)               |
| 3    | Chính tinh            | `y-nghia-chinh-tinh` — Ý nghĩa chính tinh (chính tinh) · `chom-tu-vi-va-chom-thien-phu` — Chòm Tử Vi và chòm Thiên Phủ (chòm Tử Vi, chòm Thiên Phủ) · `mieu-vuong-dac-binh-ham` — Miếu, vượng, đắc, bình, hãm (miếu, hãm) |
| 4    | Phụ tinh và Tứ hóa    | `phu-tinh-thuong-gap` — Phụ tinh thường gặp (phụ tinh) · `tu-hoa-la-gi` — Tứ hóa là gì (tứ hóa) · `tuan-va-triet` — Tuần và Triệt (Tuần, Triệt)                                                                           |
| 5    | Đại vận và tiểu vận   | `cach-xem-dai-van` — Cách xem đại vận (đại vận) · `tieu-van-hang-nam` — Tiểu vận hằng năm (tiểu vận) · `sao-thai-tue` — Sao Thái Tuế là gì? Thái Tuế và lưu niên (Thái Tuế, lưu niên)                                     |
| 6    | Ứng dụng vào đời sống | `ung-dung-tu-vi-cong-viec` — Tử vi trong công việc · `phong-thuy-va-tu-vi` — Phong thủy và tử vi · `doc-la-so-cua-chinh-ban` — Đọc lá số của chính bạn                                                                    |

Entries, in plan order (which is also index and "related entries" order):

- **Chính tinh** (title `Sao <name>`, `learnInLesson: 'y-nghia-chinh-tinh'`), in `CHINH_TINH_NAMES` order: `tu-vi`, `thien-co`, `thai-duong`, `vu-khuc`, `thien-dong`, `liem-trinh`, `thien-phu`, `thai-am`, `tham-lang`, `cu-mon`, `thien-tuong`, `thien-luong`, `that-sat`, `pha-quan`. Aliases: none.
- **Tứ hóa** (`learnInLesson: 'tu-hoa-la-gi'`), in `HOA_NAMES` order: `hoa-loc`, `hoa-quyen`, `hoa-khoa`, `hoa-ky` (alias `Hóa Kị`).
- **Phụ tinh** (`learnInLesson: 'phu-tinh-thuong-gap'`), in pairs: `ta-phu`, `huu-bat` (alias `Tả Hữu` on both), `van-xuong`, `van-khuc` (`Xương Khúc`), `thien-khoi`, `thien-viet` (`Khôi Việt`), `loc-ton`, `kinh-duong` (`Dương Nhận`), `da-la`, `dia-khong`, `dia-kiep` (`Không Kiếp` on both), `hoa-tinh`, `linh-tinh` (`Hỏa Linh` on both). An alias on two entries is a pair alias for the checkers (Decision 16).
- **Cung** (title `Cung <name>`, `learnInLesson: '12-cung-tu-vi'`), in `CUNG_NAMES` order: `menh`, `phu-mau` (`cung cha mẹ`), `phuc-duc`, `dien-trach` (`cung nhà đất`), `quan-loc` (`cung sự nghiệp`, `cung công danh`), `no-boc` (`cung Giao Hữu`, `cung bạn bè`), `thien-di`, `tat-ach` (`cung sức khỏe`), `tai-bach` (`cung tiền bạc`), `tu-tuc` (`cung con cái`), `phu-the` (`cung vợ chồng`), `huynh-de` (`cung anh em`).
- **Ngũ hành** (title `Hành <name>`, `learnInLesson: 'am-duong-ngu-hanh-co-ban'`): `hanh-kim`, `hanh-moc`, `hanh-thuy`, `hanh-hoa`, `hanh-tho`, each with its `hanh`.
- **Thuật ngữ** (alphabetical by title in the index; plan 2 sorts):
  - `can` — Thiên can (`can`, `can năm`) → `la-so-tu-vi-gom-nhung-gi`
  - `chi` — Địa chi (`chi`, `mười hai con giáp`) → `la-so-tu-vi-gom-nhung-gi`
  - `cuc` — Cục (`cục số`) → `la-so-tu-vi-gom-nhung-gi`
  - `nap-am` — Nạp âm → `la-so-tu-vi-gom-nhung-gi`
  - `ban-menh` — Bản mệnh → `la-so-tu-vi-gom-nhung-gi`
  - `can-luong` — Cân lượng (`cân xương`) → `la-so-tu-vi-gom-nhung-gi`
  - `tam-hop-luc-xung` — Tam hợp, lục xung giữa các tuổi (`tuổi hợp`, `tuổi xung`) → `tam-hop-xung-chieu`
  - `vo-chinh-dieu` — Vô chính diệu → `tam-hop-xung-chieu`
  - `vong-trang-sinh` — Vòng Tràng Sinh → `phu-tinh-thuong-gap`
  - `lai-nhan-cung` — Lai nhân cung → `cung-menh-va-cung-than`

- [ ] **Step 1: Write the failing tests.**
  - `content-plan.spec.ts`:
    - `lays out six steps of three lessons`: 6 steps numbered 1–6 with the spec's titles; `lessonsOfStep(n)` returns 3 lessons with orders 1, 2, 3 for every step; 18 lessons in all.
    - `keeps the eight legacy article slugs as lessons`: `tu-vi-la-gi`, `12-cung-tu-vi`, `y-nghia-chinh-tinh`, `cach-xem-dai-van`, `tieu-van-hang-nam`, `sao-thai-tue`, `phong-thuy-va-tu-vi` and `ung-dung-tu-vi-cong-viec` are lesson slugs; `sao-thai-tue` is step 5, order 3.
    - `moves tam hợp between palaces to its own slug and keeps the tuổi query as a term`: `tam-hop-xung-chieu` is lesson 2.3; `plannedPage('thuat-ngu/tam-hop-luc-xung')` is a term; `plannedPage('bai/tam-hop-luc-xung')` and `plannedPage('bai/chon-huong-ban-lam-viec')` are undefined.
    - `never gives a lesson a reserved segment`: no lesson slug passes `isReservedLessonSlug`, and every planned slug passes `isContentSlug`.
    - `plans the 14 chính tinh, the 4 hóa and the 13 phụ tinh of v1`: the star entries by group are `CHINH_TINH_NAMES` in order, `HOA_NAMES` in order, and exactly the spec's 13 names; each `star` is an engine name.
    - `plans the twelve cung in board order`: the cung entries' `cung` values equal `CUNG_NAMES`.
    - `plans the five hành first and fifteen terms in all`: the five ngũ hành entries carry `Kim`, `Mộc`, `Thủy`, `Hỏa`, `Thổ`; 15 term entries; 58 entries in total.
    - `keeps slugs unique within each kind`: no duplicate `pageRef` across the plan.
    - `points every entry at a planned lesson`: each `learnInLesson` is a lesson slug.
    - `makes no term entry for a concept a lesson owns`: no term title or alias, normalised to lower case NFC, equals an `ownedConcepts` item.
    - `resolves refs both ways`: `plannedPage(plannedRefOf(page))` is `page` for every planned page; an unknown ref is undefined.
  - `sample-chart.spec.ts`:
    - `gives the sample Mệnh a bright chính tinh`: the Mệnh cung has at least one chính tinh, and every chính tinh there is rated `M`, `V` or `Đ`.
    - `keeps the four sát tinh out of the sample Mệnh`: none of Kình Dương, Đà La, Địa Không, Địa Kiếp is in the Mệnh's `phuTinh`.
    - `keeps Thân apart from Mệnh`: `thanIndex !== menhIndex`.
    - `puts a vô chính diệu cung in the Mệnh's tam phương`: one of the đối cung and the two tam hợp cung has `isVoChinhDieu`.
- [ ] **Step 2: Run** `pnpm nx test shared-kien-thuc`. Expected: FAIL.
- [ ] **Step 3: Implement** the data as `as const satisfies` literals typed by the interfaces above, and `castSampleChart` as `castNatal` over `SAMPLE_BIRTH` (a `new Date(year, month - 1, day)` built inside the function, never a shared `Date`). If a sample-chart case fails, change the date, not the test, and record the new date in the commit body.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(kien-thuc): add the content plan and the sample chart`.

### Task 5: Split `content-gen` into a shared core and `tet-hub/`

**Files:**

- Create: `apps/backend/src/content-gen/write-json-file.ts`, `shingle-similarity.ts`
- Move into `apps/backend/src/content-gen/tet-hub/` with `git mv`, names and specs unchanged: `generate-tet-hub.ts`, `run-tet-hub-generation.ts`, `tet-hub-cli-options.ts`, `tet-hub-files.ts`, `tet-hub-gen.module.ts`, `tet-hub-pages.ts`, `tet-hub-reader.ts`, `tet-hub-writer.ts`, `hub-intro.ts`, `chi-verdicts.ts`, `ai-call-pacer.ts`, `rejected-attempts.ts`, `con-giap/`, `tuoi-nam/`. The Tết part of `similarity.ts` becomes `tet-hub/tuoi-nam-similarity.ts`.
- Stay at the root as the shared core: `check-text.ts`, `schema-guards.ts`, `write-json-file.ts`, `shingle-similarity.ts`
- Modify: `apps/backend/package.json` (`generate-tet-hub` command path), `apps/backend/eslint.config.mjs` (second commit)
- Test: `write-json-file.spec.ts` (the three generic write cases move here from `tet-hub-writer.spec.ts`, which keeps its Tết-specific cases), `shingle-similarity.spec.ts` (the `shingleSimilarity` cases move here from `similarity.spec.ts`)

**Interfaces:**

```ts
export function writeJsonFile(directory: string, fileName: string, value: unknown): Promise<void>;
export interface SimilarPair {
  readonly a: string;
  readonly b: string;
  readonly score: number;
}
export function shingleSimilarity(a: string, b: string, size?: number): number;
```

- [ ] **Step 1: Move the tests first.** `write-json-file.spec.ts`: `pretty-prints with a trailing newline`, `creates the output directory when it does not exist` and `keeps the existing file whole when a write stops halfway` (the same assertions as today's writer spec). `shingle-similarity.spec.ts`: today's `shingleSimilarity` cases unchanged. Run: FAIL (modules missing).
- [ ] **Step 2: Move the code.** Bodies move unchanged; only import paths change. `tuoi-nam-similarity.ts` keeps `TUOI_NAM_SIMILARITY_THRESHOLD`, `tuoiNamNeighbours` and `findTooSimilar` and imports the generic part. The `generate-tet-hub` target's command becomes `ts-node -P apps/backend/tsconfig.app.json apps/backend/src/content-gen/tet-hub/generate-tet-hub.ts`.
- [ ] **Step 3: Run** `pnpm nx test @org/backend -- content-gen`. Expected: every Tết spec passes with only its import paths edited. `pnpm nx lint @org/backend` and `pnpm nx typecheck @org/backend` pass. Running the target with a flag its parser rejects reaches the parser's error, which proves the path without booting Nest.
- [ ] **Step 4: Commit** `refactor(content-gen): split a shared core from the Tết hub generator`. Body: Kiến thức reuses the text checks, the shingle similarity and the atomic writer, so they stay at the root and the Tết files move to `tet-hub/`.
- [ ] **Step 5: Lint boundary.** In `apps/backend/eslint.config.mjs`, add `'src/content-gen/**/*.ts'` to the `files` of the `AI_PORT_ONLY` block. Run `pnpm nx lint @org/backend`. Expected: green (the Tết files import only `ai/port/*` and `ai/ai.module`). Commit `chore(backend): hold content-gen to the ai/port boundary`.

### Task 6: Text tools — link markup, syllables, reading time, clauses, names

**Files:**

- Create: `apps/backend/src/content-gen/kien-thuc/text/link-markup.ts`, `.../text/syllable-count.ts`, `.../text/clauses.ts`, `.../text/find-names.ts`
- Modify: `apps/backend/src/content-gen/check-text.ts` (export `isAffirmedAt` unchanged)
- Test: one `*.spec.ts` beside each new file, plus a case in `check-text.spec.ts`

**Interfaces:**

```ts
export interface ContentLink {
  readonly ref: PageRef;
  readonly label: string;
}
export interface LinkScan {
  readonly links: readonly ContentLink[];
  readonly malformed: readonly string[];
}
export function scanLinks(text: string): LinkScan;
export function toPlainText(text: string): string;
export function keepFirstLinkPerTarget(
  sections: readonly ContentSection[],
): readonly ContentSection[];

export const SYLLABLES_PER_MINUTE = 180;
export function countSyllables(text: string): number;
export function readingMinutes(syllables: number): number;

export function splitClauses(text: string): readonly string[];

export interface NameHit<N extends string> {
  readonly name: N;
  readonly index: number;
}
export function findNames<N extends string>(
  clause: string,
  names: readonly N[],
): readonly NameHit<N>[];

export function isAffirmedAt(sentence: string, index: number): boolean;
```

`findNames` is case-sensitive on NFC text, matches whole words only (`(?<!\p{L})…(?!\p{L})`), prefers the longest name at a position, and returns hits in text order. Clauses are sentences (`splitSentences`) split again on `;`. `isAffirmedAt` expects `normalize`d text and an index into it, as today.

- [ ] **Step 1: Write the failing tests.**
  - `link-markup.spec.ts`:
    - `reads kind, slug and label from a link`: `Có [[thuat-ngu/can|can]] và [[bai/tuan-va-triet|Tuần, Triệt]].` gives two links with refs `thuat-ngu/can` and `bai/tuan-va-triet`, and no malformed markup.
    - `reports markup that is not a whole link`: `[[sao/thien co|x]]`, `[[sao/thien-co]]`, `[[ghi-chu/x|y]]`, `[[sao/thien-co|]]` and a lone `[[` are each reported in `malformed`.
    - `reduces links to their labels`: `toPlainText` of the first sentence is `Có can và Tuần, Triệt.`
    - `keeps only the first link to each target`: two sections linking `sao/thien-co` twice end with one link in the first section and the bare label in the second; other links are untouched.
  - `syllable-count.spec.ts`:
    - `counts tokens that hold a letter or digit`: `Thiên Cơ – sao số 2.` is 5 âm tiết.
    - `counts a link as its label`: `[[sao/thien-co|Thiên Cơ]] hay` is 3 âm tiết.
    - `rounds reading time up at 180 âm tiết a minute`: 600 → 4, 1,000 → 6, 450 → 3, 180 → 1, 181 → 2.
  - `clauses.spec.ts`: `splits sentences and semicolons but not commas`: `Thiên Cơ miếu ở Thìn, Tuất; hãm ở Dần. Hết.` gives 3 clauses.
  - `find-names.spec.ts`:
    - `matches star names case-sensitively`: in `lá số tử vi có sao Tử Vi`, `findNames(…, CHINH_TINH_NAMES)` returns one hit, at the second occurrence.
    - `prefers the longer name at the same place`: with names `['Hóa Lộc', 'Lộc Tồn']`, `Hóa Lộc gặp Lộc Tồn` gives both, in order, and no overlap.
  - `check-text.spec.ts`: `tells a negated position from an affirmed one`: in `normalize('Tả Phù không miếu, Thiên Cơ miếu')`, `isAffirmedAt` is false at the first `miếu` and true at the second.
- [ ] **Step 2: Run** `pnpm nx test @org/backend -- kien-thuc/text check-text`. Expected: FAIL.
- [ ] **Step 3: Implement.** The link pattern is a named constant: `/\[\[([a-z-]+)\/([a-z0-9-]+)\|([^\]|]{1,40})\]\]/gu`. Any `[[` left after removing whole links is malformed. A link whose kind is not a `ContentKind` value is malformed. In `check-text.ts`, only the `export` keyword is added.
- [ ] **Step 4: Run again.** Expected: PASS, with every existing `check-text` case unedited.
- [ ] **Step 5: Commit** `feat(content-gen): parse kiến thức link markup and count âm tiết`.

### Task 7: Validator — form checks

**Files:**

- Create: `apps/backend/src/content-gen/kien-thuc/validate/check-shape.ts`, `check-length.ts`, `check-links.ts`, `check-wording.ts`
- Test: one `*.spec.ts` beside each

**Interfaces:**

```ts
export interface PageDraftBody {
  readonly summary: string;
  readonly sections: readonly ContentSection[];
}
export interface PageLimits {
  readonly minSyllables: number;
  readonly maxSyllables: number;
  readonly minSections: number;
  readonly maxSections: number;
  readonly minParagraphs: number;
  readonly maxParagraphs: number;
  readonly minLinkTargets: number;
}
export const LESSON_LIMITS: PageLimits;
export const CORE_ENTRY_LIMITS: PageLimits;
export const ENTRY_LIMITS: PageLimits;
export function limitsFor(page: PlannedPage): PageLimits;

export const KIEN_THUC_FORBIDDEN: readonly string[];
export const ART_WRITTEN_AS_STAR: readonly string[];
export function checkShape(
  body: PageDraftBody,
  title: string,
  limits: PageLimits,
): readonly string[];
export function checkLength(body: PageDraftBody, limits: PageLimits): readonly string[];
export function checkLinks(
  body: PageDraftBody,
  self: PageRef,
  limits: PageLimits,
): readonly string[];
export function checkWording(body: PageDraftBody): readonly string[];
```

- `CORE_ENTRY_LIMITS` (450–800 âm tiết) applies to the chính tinh and cung groups. `ENTRY_LIMITS` (300–700) applies to every other entry.
- `checkWording` combines, over the summary, headings and paragraphs as plain text:
  - `forbiddenPhraseViolations`;
  - `KIEN_THUC_FORBIDDEN = ['đại hạn', 'chết', 'khó tránh']`;
  - the old-style tone-mark rule and the `Tỵ` rule (Decisions 17 and 18);
  - `ART_WRITTEN_AS_STAR = ['môn Tử Vi', 'lá số Tử Vi', 'xem Tử Vi', 'học Tử Vi', 'Tử Vi Đẩu Số']`, matched case-sensitively (Decision 15).

  The writing guide (Task 11) prints the same constants, so the guide and the check cannot drift.

- [ ] **Step 1: Write the failing tests.** Each spec builds a valid body from a small fixture helper (`validLessonBody()`, `validEntryBody()`), asserts it yields no violations, then breaks one thing per case:
  - `check-shape.spec.ts`: `rejects a lesson with two sections or seven`, `rejects a section with too few or too many paragraphs` (names the heading), `rejects a summary under 60 or over 160 characters`, `rejects link markup in the summary or a heading`, `rejects a repeated heading and a heading equal to the title`, `rejects a heading over 70 characters`.
  - `check-length.spec.ts`:
    - `rejects a lesson under 600 or over 1,000 âm tiết` (the message carries the count).
    - `rejects a chính tinh or cung entry under 450 or over 800 âm tiết`.
    - `rejects another entry under 300 or over 700 âm tiết`: a 400-âm-tiết Tả Phù entry passes, and the same body as a Thiên Cơ entry fails.
    - `does not count the summary`.
  - `check-links.spec.ts`: `rejects a link to a page the plan does not have` (names `thuat-ngu/tuan-triet`), `rejects a link to the page itself`, `rejects malformed markup`, `accepts a link to a planned page that has no file yet`, `rejects a lesson with two link targets`, `counts distinct targets, not links`.
  - `check-wording.spec.ts`:
    - `rejects the phrases the luận giải and Tết checks forbid` (`tai họa`, `đại họa`, `phải cúng`, `dữ kiện`).
    - `rejects đại hạn, chết and khó tránh`.
    - `rejects old-style tone marks` (`Hoá Lộc`, `hành Hoả`, `Thuỷ`, `hoà hợp`).
    - `keeps new-style words and closed syllables` (`Hóa Lộc`, `hoàn toàn`, `toán`, `Huỳnh`, `Quý`, `khoảng` pass).
    - `rejects Tỵ and keeps Tị`.
    - `rejects Tử Vi capitalised for the art` (`xem Tử Vi`, `Tử Vi Đẩu Số`), with `keeps the star and its circle` (`sao Tử Vi`, `chòm Tử Vi`, `môn tử vi` pass).
- [ ] **Step 2: Run** `pnpm nx test @org/backend -- kien-thuc/validate`. Expected: FAIL.
- [ ] **Step 3: Implement.** Messages are Vietnamese and name the place: `mục "<heading>": có 5 đoạn, cần từ 2 đến 4 đoạn`, `bài có 540 âm tiết, cần từ 600 đến 1000 âm tiết`, `liên kết tới "thuat-ngu/tuan-triet" không có trong danh mục`, `viết "Hoá" theo kiểu cũ, viết "Hóa"`, `viết "tử vi" thường khi nói về môn học`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): check the shape, length, links and wording of kiến thức drafts`.

### Task 8: Validator — star claims

**Files:**

- Create: `apps/backend/src/content-gen/kien-thuc/validate/facts/fact-subject.ts`, `clause-mentions.ts`, `check-ratings.ts`, `check-hanh.ts`, `check-chom.ts`, `check-cat-hung.ts`
- Test: one `*.spec.ts` beside `clause-mentions.ts` and each checker

**Interfaces:**

```ts
export type FactSubject =
  | { readonly kind: ContentKind.Sao; readonly star: SaoName }
  | { readonly kind: ContentKind.Cung; readonly cung: CungName }
  | null;
export function factSubjectOf(page: PlannedPage): FactSubject;

export enum ClaimStatus {
  Checked = 'checked',
  Skipped = 'skipped',
}
export interface ClaimClause {
  readonly clause: string;
  readonly status: ClaimStatus;
  readonly reason: string | null;
}
export interface FactCheckResult {
  readonly violations: readonly string[];
  readonly claims: readonly ClaimClause[];
}
export type FactCheck = (plainText: string, subject: FactSubject) => FactCheckResult;

export function starsIn(clause: string): readonly NameHit<SaoName>[];
export function chisIn(clause: string): readonly NameHit<string>[];

export const checkRatings: FactCheck;
export const checkHanh: FactCheck;
export const checkChom: FactCheck;
export const checkCatHung: FactCheck;
```

- **Mentions** (Decision 16):
  - `starsIn` is `findNames(clause, ALL_STAR_NAMES)`, where `ALL_STAR_NAMES` is every engine chính tinh and phụ tinh. It drops a hit preceded by `chòm ` or `cung ` and drops a phụ tinh whose name is also in `CUNG_NAMES`. It adds the two stars of a pair alias, an alias shared by two entries of `KIEN_THUC_ENTRIES`, at the alias's index.
  - `chisIn` reads `CHI` names, drops a chi preceded by `cung ` and drops `Thân` followed by ` cư`.
- **Binding, shared by all four:**
  - Per clause, one star → that star. None → the page subject if it is a star, else skip. Two or more → skip, except where a checker says otherwise.
  - A claim the clause negates (`isAffirmedAt` false at the claim word) is skipped.
  - Each checker returns a `ClaimClause` for every clause holding its vocabulary: `Checked` when it bound and compared, `Skipped` with the reason (`hai sao`, `phủ định`, `tên thang bậc`, `quá nhiều tên`) otherwise.
- **Ratings:** rating words and scale names per Decision 16. If the star has ratings, each chi in the clause must have an engine bậc equal to one of the affirmed rating words in the clause. A null engine cell is a violation of its own ("không có bậc tại <chi>"). If the star has no ratings at all, any affirmed rating word bound to it is a violation, even with no chi.
- **Hành:** `(thuộc|mang|là sao|có) hành <X>`, or `<star>( thuộc)? hành <X>`, with one hành in the clause. It must equal the star's hành. A clause with two hành (a star and a palace) is skipped.
- **Chòm:** a clause with exactly one of `chòm Tử Vi` / `chòm Thiên Phủ`, not negated before the mention. Every chính tinh named in it must belong to that chòm. This is the one checker that reads lists ("Chòm Tử Vi gồm Tử Vi, Thiên Cơ, …"). With no star named, the subject must belong.
- **Cát/hung:** only the copular form `<star> (là|thuộc|được xếp vào)( nhóm| một| một trong các)? (hung tinh|cát tinh|sao hung|sao cát)`, or the same with the subject when the clause names no star, bound to one phụ tinh or hóa, must agree with `isHung`. A clause that says `hung tinh` or `cát tinh` any other way is skipped. Chính tinh are not checked: the engine does not classify them.

- [ ] **Step 1: Write the failing tests.**
  - `clause-mentions.spec.ts`:
    - `does not read cung Phúc Đức as the star`: `starsIn('Cung Phúc Đức gặp hung tinh')` is empty.
    - `reads a pair alias as its two stars`: `starsIn('Không Kiếp đắc địa ở Dần')` gives Địa Không and Địa Kiếp.
    - `does not read Thân cư or cung Thân as the chi`: `chisIn('Thân cư Mệnh, cung Thân sáng, ở Thân thì vượng')` gives one hit.
  - `check-ratings.spec.ts`:
    - `accepts the engine's ratings in a list`: `Thiên Cơ miếu ở Thìn, Tuất, Mão, Dậu và hãm ở Dần, Hợi.` passes (lesson subject null).
    - `accepts a contrast in one clause`: `Thiên Cơ hãm ở Dần nhưng sang Thìn lại miếu.` passes.
    - `rejects a rating the engine contradicts`: `Thiên Cơ miếu ở Dần.` fails with a violation naming `Thiên Cơ`, `Dần`, and the engine's `hãm`.
    - `binds to the entry's star when the clause names none`: subject Thiên Cơ, `Sao này miếu ở Dần.` fails.
    - `rejects any rating claim for a star the tables leave out`: subject Tả Phù, `Tả Phù miếu ở Thìn.` and `Tả Phù đắc địa thì tốt.` fail; `Tả Phù không miếu cũng không hãm.` passes.
    - `reads the scale's name as a name, not a claim`: subject Tả Phù, `Tả Phù không có bậc miếu hãm.`, `Tả Phù không có bậc miếu hay hãm.` and `Miếu, vượng, đắc địa, bình hòa, hãm là năm bậc.` pass.
    - `rejects a cell the engine leaves empty`: `Địa Kiếp hãm ở Tý.` fails with "không có bậc tại Tý"; `Địa Kiếp đắc địa ở Dần.` passes.
    - `never binds the art to the star`: `Trong lá số tử vi, miếu ở Dần là điều đáng mừng.` passes with subject null.
    - `ignores thịnh vượng, cung Thân and Thân cư`: subject Thái Dương, `Cuộc sống thịnh vượng ở Tý.`, `Thái Dương miếu, cung Thân sáng.` and `Lá số có Thân cư Mệnh, Thái Dương miếu thì càng sáng.` pass.
    - `skips a clause that names two stars and says why`: `Thiên Cơ và Thái Âm miếu ở Dần.` passes and returns one `Skipped` claim with reason `hai sao`.
  - `check-hanh.spec.ts`: `accepts Thiên Cơ hành Mộc`, `rejects Thiên Cơ thuộc hành Kim` (names Mộc), `binds to the entry's star` (subject Hóa Lộc, `Sao này thuộc hành Thủy.` fails, engine Mộc), `skips a clause comparing a star's hành with a palace's`.
  - `check-chom.spec.ts`: `accepts the six stars of chòm Tử Vi in a list`, `rejects Thất Sát in chòm Tử Vi`, `does not read chòm Thiên Phủ as the star Thiên Phủ`, `accepts a negated membership` (`Thất Sát không thuộc chòm Tử Vi.`), `binds to the entry's star` (subject Phá Quân, `Sao này đứng trong chòm Tử Vi.` fails).
  - `check-cat-hung.spec.ts`:
    - `rejects calling Kình Dương a cát tinh`.
    - `rejects calling Lộc Tồn a hung tinh` (`Lộc Tồn là hung tinh.`).
    - `accepts Hóa Kỵ as a hung tinh`.
    - `reads only the copular form`: `Gặp Lộc Tồn, hung tinh bớt phần nào sức phá.` and `Thiên Khôi đi cùng hung tinh vẫn giữ được vai quý nhân.` pass and come back `Skipped`.
    - `does not judge chính tinh` (`Thất Sát là hung tinh.` passes).
- [ ] **Step 2: Run** `pnpm nx test @org/backend -- kien-thuc/validate/facts`. Expected: FAIL.
- [ ] **Step 3: Implement** over `splitClauses`, `starsIn`, `chisIn`, `isAffirmedAt`, `saoFacts` and `ratingAt`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): reject kiến thức prose that contradicts a star's engine facts`.

### Task 9: Validator — relation claims, sample chart, required mentions and golden sentences

**Files:**

- Create: `.../validate/facts/check-relations.ts`, `check-tu-hoa-by-can.ts`, `check-sample-chart.ts`, `.../validate/check-required-mentions.ts`
- Test: one `*.spec.ts` beside each, plus `.../validate/facts/golden-sentences.spec.ts`

**Interfaces:**

```ts
export const checkRelations: FactCheck;
export const checkTuHoaByCan: FactCheck;
export function checkSampleChart(plainText: string, chart: NatalChart): FactCheckResult;
export function checkRequiredMentions(
  body: PageDraftBody,
  mentions: readonly string[],
): readonly string[];
```

- **Relations:**
  - **Vocabulary.** Relation words are `đối cung`, `xung chiếu`, `lục xung`, `tương xung` (xung); `tam hợp` (tam hợp); `lục hợp`, `nhị hợp` (nhị hợp). A clause with words from more than one relation is skipped. The checker then reads palace names (`CUNG_NAMES`, case-sensitive) and, separately, chi names (`chisIn`).
  - **Xung:** checked only when the clause names exactly two of a kind; they must be a xung pair (`xungChieuIndex`). Any other count is skipped.
  - **Tam hợp:** checked only when the clause names two or three of a kind; every pair named must share a group (`tamHopIndexes`). More than three (a list of all four groups) is skipped.
  - **Nhị hợp:** checked only when the clause names exactly two chi; they must pair under `nhiHopIndex`.
  - On a cung entry, a clause that names one palace binds it to the subject.
- **Hóa by can:** a clause naming one can (case-sensitive `CAN`) and at least one hóa. Each hóa binds to the nearest non-hóa star before it, else the first after. The pair must match `anTuHoa(can)`.
- **Sample chart:** only lesson `doc-la-so-cua-chinh-ban` runs it, and only for chính tinh and the four hóa.
  - In a clause, each of those binds to the nearest palace name before it. It must sit in that palace of the sample chart: in `chinhTinh` (or `phuTinh` for a hóa), or in `chinhTinhMuon` when the clause also says `mượn`.
  - A palace name directly followed by ` chủ` (`Mệnh chủ`, `Thân chủ`) is not a palace. A phụ tinh named like a palace is never a star here.
  - A star with no palace before it is skipped.
- **Required mentions:** each string must appear (`mentions`) in the plain text of the body. The brief supplies the list (Task 11).
- **Golden sentences:** correct prose that every fact check (all six, with the stated subject) must pass. Kim An and the writing rounds add sentences whenever a correct one is rejected. The seed:

  | Subject    | Sentence                                                                             |
  | ---------- | ------------------------------------------------------------------------------------ |
  | null       | Thiên Cơ miếu ở Thìn, Tuất, Mão, Dậu và hãm ở Dần, Hợi.                              |
  | null       | Thiên Cơ hãm ở Dần nhưng sang Thìn lại miếu.                                         |
  | Thiên Cơ   | Sao này hãm tại Dần, Hợi, còn tới Tị, Thân thì vượng.                                |
  | Thiên Cơ   | Tại Dần và Hợi, sao này hãm.                                                         |
  | null       | Người sinh năm Thân có Thiên Cơ ở Mệnh thường miếu vượng.                            |
  | Thiên Cơ   | Đi cùng Cự Môn ở Mão, sao này miếu địa.                                              |
  | Tả Phù     | Tả Phù không có bậc miếu hay hãm.                                                    |
  | Tả Phù     | Tả Phù không mang bậc miếu, vượng hay hãm như chính tinh.                            |
  | Tả Phù     | Không như Thiên Cơ có lúc miếu lúc hãm, Tả Phù không có bậc.                         |
  | null       | Lá số có Thân cư Mệnh, Thái Dương miếu thì càng sáng.                                |
  | Địa Kiếp   | Không Kiếp đắc địa ở Dần, Thân, Tị, Hợi.                                             |
  | Lộc Tồn    | Gặp Lộc Tồn, hung tinh bớt phần nào sức phá.                                         |
  | Thiên Khôi | Thiên Khôi đi cùng hung tinh vẫn giữ được vai quý nhân.                              |
  | null       | Cung Phúc Đức gặp hung tinh thì nên đọc kỹ các sao đi kèm.                           |
  | Kình Dương | Kình Dương là hung tinh.                                                             |
  | Văn Xương  | Văn Xương là cát tinh, chủ về chữ nghĩa.                                             |
  | null       | Bốn nhóm tam hợp là Thân Tý Thìn, Dần Ngọ Tuất, Tị Dậu Sửu và Hợi Mão Mùi.           |
  | null       | Mệnh tam hợp với Tài Bạch và Quan Lộc.                                               |
  | null       | Mệnh, Tài Bạch, Quan Lộc là một bộ tam hợp, còn Phụ Mẫu, Tật Ách, Tử Tức là bộ khác. |

- [ ] **Step 1: Write the failing tests.**
  - `check-relations.spec.ts`:
    - `accepts Mệnh, Tài Bạch, Quan Lộc as one tam hợp`.
    - `rejects Mệnh in tam hợp with Phu Thê`.
    - `accepts Mệnh đối cung Thiên Di and rejects Mệnh đối cung Tật Ách`.
    - `binds a cung entry's clause to its palace`: subject Phu Thê, `Đối cung là Quan Lộc.` passes and `Đối cung là Tài Bạch.` fails.
    - `checks chi relations for the tuổi term`: `Thân, Tý, Thìn tam hợp.` passes; `Tý lục xung Ngọ.` passes; `Tý lục xung Mùi.` fails; `Tý nhị hợp Sửu.` passes.
    - `skips a list longer than one relation holds`: `Các cặp lục xung là Tý Ngọ, Sửu Mùi, Dần Thân.` passes and comes back `Skipped`.
    - `skips a clause mixing relations`.
  - `check-tu-hoa-by-can.spec.ts`:
    - `accepts the Giáp row in one clause`: `Năm Giáp, Liêm Trinh Hóa Lộc, Phá Quân Hóa Quyền, Vũ Khúc Hóa Khoa, Thái Dương Hóa Kỵ.` passes.
    - `rejects a wrong star for a can`: `Năm Ất, Hóa Lộc ở Tử Vi.` fails, and the message names Thiên Cơ.
    - `ignores hóa named without a can`.
  - `check-sample-chart.spec.ts`:
    - `places the Mệnh's star where the chart has it`: build two sentences from `castSampleChart()` itself, one that puts the Mệnh's first chính tinh in cung Mệnh (passes) and one that puts it in the đối cung (fails). The test computes the names from the chart and hard-codes none.
    - `does not read Mệnh chủ as cung Mệnh`: a sentence naming the chart's `chuMenh` after `Mệnh chủ là` passes.
  - `check-required-mentions.spec.ts`: `lists each missing mention`, `accepts a mention inside a link label`.
  - `golden-sentences.spec.ts`: `passes every correct sentence through every fact check`, one `it.each` row per table row, each expecting no violations.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run again.** Expected: PASS, golden sentences included.
- [ ] **Step 5: Commit** `feat(content-gen): check palace, chi and tứ hóa claims in kiến thức drafts`.

### Task 10: Similarity, claims and the composed validator

**Files:**

- Create: `.../validate/check-similarity.ts`, `.../validate/facts/claim-clauses.ts`, `.../validate/validate-page.ts`
- Modify: `apps/backend/src/content-gen/shingle-similarity.ts` (add `shingleContainment`)
- Test: `check-similarity.spec.ts`, `claim-clauses.spec.ts`, `validate-page.spec.ts`, a case in `shingle-similarity.spec.ts`

**Interfaces:**

```ts
export function shingleContainment(a: string, b: string, size?: number): number;

export const KIEN_THUC_SIMILARITY_THRESHOLD = 0.2;
export const ENTRY_LESSON_CONTAINMENT_THRESHOLD = 0.3;
export const SAME_GROUP_WARNING_THRESHOLD = 0.1;
export interface CorpusPage {
  readonly ref: PageRef;
  readonly group: EntryGroup | null;
  readonly plainText: string;
}
export interface Neighbour {
  readonly ref: PageRef;
  readonly score: number;
}
export function closestNeighbour(
  ref: PageRef,
  plainText: string,
  corpus: readonly CorpusPage[],
): Neighbour | null;
export function checkSimilarity(page: CorpusPage, corpus: readonly CorpusPage[]): readonly string[];
export function similarityWarnings(
  page: CorpusPage,
  corpus: readonly CorpusPage[],
): readonly string[];
export function findTooSimilarPages(corpus: readonly CorpusPage[]): readonly SimilarPair[];

export const CLAIM_WORDS: readonly string[];
export function claimClausesOf(
  plainText: string,
  results: readonly FactCheckResult[],
): readonly ClaimClause[];

export interface PageValidationContext {
  readonly page: PlannedPage;
  readonly requiredMentions: readonly string[];
  readonly corpus: readonly CorpusPage[];
}
export interface PageValidation {
  readonly violations: readonly string[];
  readonly claims: readonly ClaimClause[];
  readonly warnings: readonly string[];
}
export function bodyPlainText(body: PageDraftBody): string;
export function validatePage(body: PageDraftBody, context: PageValidationContext): PageValidation;
```

- **`shingleContainment`:** shared shingles over the shingle count of the shorter text.
- **`checkSimilarity`:** rejects Jaccard ≥ 0.2 against any page, and containment ≥ 0.3 between an entry and a lesson.
- **`similarityWarnings`:** reports a same-group pair at Jaccard ≥ 0.1.
- **`claimClausesOf`:**
  - A clause holding any `CLAIM_WORDS` item that a checker reported is listed with that checker's status.
  - A clause holding a claim word that no checker read is listed as `Skipped` with reason `không checker nào đọc mệnh đề này`.
  - Skipped clauses come first. `CLAIM_WORDS` is the rating words, `hành`, `chòm`, the cát/hung words, the relation words, `luôn`, `không bao giờ`, `bệnh`, `sức khỏe`, `tiền`, `tài sản`.
- **`validatePage`:**
  - Runs in order: shape, length, links, wording, required mentions, the six fact checks with `factSubjectOf(page)` (plus `checkSampleChart` for lesson 6.3), then similarity.
  - The corpus never contains the page's own ref.
  - `SimilarPair` is reused from `content-gen/shingle-similarity.ts`.

- [ ] **Step 1: Write the failing tests.**
  - `shingle-similarity.spec.ts`: `measures containment against the shorter text`: a text inside a text twice its length scores 1 by containment and about 0.5 by Jaccard.
  - `check-similarity.spec.ts`:
    - `rejects a draft that repeats another page`: a corpus page whose text equals the draft's gives one violation naming its ref and a score of `1.00`.
    - `catches an entry that copies half a lesson by containment`: an entry built from half of a lesson's sentences plus new ones scores under 0.2 by Jaccard and is still rejected, with a message naming the lesson and the containment score.
    - `does not apply containment between two entries`.
    - `ignores the page's own earlier version`: a corpus page with the same ref is skipped.
    - `warns, without rejecting, on a same-group pair at 0.10`.
    - `reports each too-similar pair once, highest first`.
  - `claim-clauses.spec.ts`: `lists a clause no checker read as skipped`, `orders skipped clauses before checked ones`.
  - `validate-page.spec.ts`:
    - `passes a clean entry for Thiên Cơ`: a fixture body written to the engine's facts gives no violations.
    - `collects violations from every check in one pass`: a body with a wrong rating, `Hoá`, a link to an unplanned page and too few âm tiết returns at least one violation from each.
    - `lists every claim clause as checked or skipped`.
    - `runs the sample-chart check only on the last lesson`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): compare kiến thức drafts with every other page and list their claims`.

### Task 11: The page brief and the writing guide

**Files:**

- Create: `.../kien-thuc/brief/page-brief.ts`, `build-page-brief.ts`, `lesson-outlines.ts`, `lesson-facts.ts`, `sao-brief.ts`, `cung-brief.ts`, `term-brief.ts`, `writing-guide.ts`, `render-brief.ts`
- Test: `lesson-facts.spec.ts`, `build-page-brief.spec.ts`, `writing-guide.spec.ts`, `render-brief.spec.ts`

**Interfaces:**

```ts
export interface LinkTarget {
  readonly ref: PageRef;
  readonly title: string;
}
export interface PageBrief {
  readonly page: PlannedPage;
  readonly limits: PageLimits;
  readonly factLines: readonly string[];
  readonly mustCover: readonly string[];
  readonly requiredMentions: readonly string[];
  readonly linkTargets: readonly LinkTarget[];
  readonly ownedElsewhere: readonly LinkTarget[];
  readonly previous: LinkTarget | null;
  readonly next: LinkTarget | null;
  readonly teachingLesson: LinkTarget | null;
}
export function buildPageBrief(page: PlannedPage): PageBrief;

export interface LessonOutline {
  readonly mustCover: readonly string[];
  readonly requiredMentions: readonly string[];
}
export const LESSON_OUTLINES: Readonly<Record<string, LessonOutline>>;
export function lessonFactLines(lesson: PlannedLesson): readonly string[];

export interface WritingRule {
  readonly heading: string;
  readonly lines: readonly string[];
}
export const CALMER_PHRASINGS: readonly { readonly avoid: string; readonly write: string }[];
export function writingGuideFor(page: PlannedPage): readonly WritingRule[];

export function renderBrief(brief: PageBrief): string;
```

`renderBrief` produces the Markdown the `brief` command prints. It is a pure function of the plan and the engine: no clock, no file system, lists in plan order. Its sections, in order:

1. the page's title, ref and kind;
2. the writing guide;
3. length and shape for the page's group, from `limitsFor(page)`;
4. the engine facts;
5. must-cover points and required mentions;
6. previous and next lesson (lessons) or the teaching lesson (entries), and the concepts other lessons own;
7. the allowed link targets;
8. the file to write (`tmp/kien-thuc/drafts/<kind>/<slug>.json`) with the draft JSON shape: `summary`, `sections[{ heading, paragraphs }]`, `writtenBy: "claude-code"`, `writtenAt`;
9. the self-check: run `pnpm nx run @org/backend:kien-thuc -- check --only=<ref>`, fix every violation, at most 5 rounds, read the skipped claims once more, never edit another file.

**What each brief carries.** Fact lines are Vietnamese sentences built from engine values. They are never copied from `luan/bang/*`.

- **Star:**
  - **Fact lines:** hành; chòm (chính tinh) or hung / not hung (phụ tinh, hóa); the ratings by chi grouped by bậc ("miếu ở Thìn, Tuất, …").
  - **Without bậc:** a star with no ratings gets the line that it has no bậc table here and the rule not to claim miếu or hãm.
  - **Partial row:** a star with a partial row (Địa Kiếp, Văn Xương, Văn Khúc, Lộc Tồn, Kình Dương, Đà La) gets the line "bảng ở đây chỉ ghi bậc tại <chi list>; không nêu bậc ở cung khác, không suy từ sao cặp".
  - **Hóa:** a hóa gets its star for each can, plus the engine's note that the Canh row differs between schools.
  - **Required mentions:** the star's name, `hành <X>`, and for chính tinh `chòm <X>`.
- **Cung:** its position counted from Mệnh, its đối cung, its tam hợp. Required mentions: the palace name, the đối cung and both tam hợp partners.
- **Term:** the engine lists that exist for it: `CAN`, `CHI` with `CHI_NGU_HANH`, the five cục from `CUC_BY_ELEMENT`, the 30 `NAP_AM_NAMES`, `VONG_TRANG_SINH`, the sinh and khắc cycle derived from `theSinhKhac` (written in new style, never echoing the enum values), and the v1 stars of each hành. Required mention: the term's title.
- **Lesson:** `LESSON_OUTLINES[slug].mustCover` and `lessonFactLines`:

  | Lesson                         | Engine facts in the brief                                                                                                                                                            | Must cover                                                                                                                    |
  | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
  | `tu-vi-la-gi`                  | counts: 12 cung, 14 chính tinh, `PHU_TINH_NAMES.length` phụ tinh                                                                                                                     | what a lá số is drawn from (date and hour of birth); what it is for and not for; the path ahead                               |
  | `la-so-tu-vi-gom-nhung-gi`     | `CUNG_NAMES`; the parts of `NatalChart` a board shows (bản mệnh, cục, Mệnh chủ, Thân chủ, cân lượng, đại vận ages)                                                                   | the địa bàn, the middle box, stars in a cung, where to look first                                                             |
  | `am-duong-ngu-hanh-co-ban`     | the five hành, the sinh and khắc cycles, `CHI_NGU_HANH`                                                                                                                              | âm dương; five hành; sinh and khắc; why a star's hành meets a palace's                                                        |
  | `12-cung-tu-vi`                | `CUNG_NAMES` in board order                                                                                                                                                          | each cung in one line; the order around the board                                                                             |
  | `cung-menh-va-cung-than`       | the six palaces Thân can sit in, computed from `anCungMenh` and `anCungThan` over all months and hours                                                                               | Mệnh vs Thân; why Thân only lands in six; Thân cư Mệnh                                                                        |
  | `tam-hop-xung-chieu`           | `cungFacts` for all 12                                                                                                                                                               | tam hợp; đối cung; reading a palace with its partners; one sentence on vô chính diệu with the link `[[thuat-ngu/vo-chinh-dieu | …]]`, not a section |
  | `y-nghia-chinh-tinh`           | the 14 chính tinh with hành                                                                                                                                                          | what a chính tinh is; one line per star, no ratings                                                                           |
  | `chom-tu-vi-va-chom-thien-phu` | `chomMembers` of both                                                                                                                                                                | the two circles; how Thiên Phủ mirrors Tử Vi                                                                                  |
  | `mieu-vuong-dac-binh-ham`      | the five bậc and their letters; Thái Dương's and Thái Âm's rows                                                                                                                      | what the five bậc mean; how to read the letter beside a star; that some stars have no bậc                                     |
  | `phu-tinh-thuong-gap`          | the 13 v1 phụ tinh with hành and hung                                                                                                                                                | the pairs; cát vs hung; why phụ tinh colour a palace                                                                          |
  | `tu-hoa-la-gi`                 | the four hóa, hung for Hóa Kỵ, the full can table                                                                                                                                    | what the hóa attach to; that they follow the can of the year                                                                  |
  | `tuan-va-triet`                | `anTriet` for each can; how `anTuan` follows the year pillar                                                                                                                         | what Tuần and Triệt block; reading a palace under them                                                                        |
  | `cach-xem-dai-van`             | the five cục values as the starting age; 10-year spans                                                                                                                               | where the first đại vận starts; reading a vận as a palace                                                                     |
  | `tieu-van-hang-nam`            | from `anTieuHan`: the cung where tiểu hạn starts for each tam hợp group of year chi, and its direction for nam and nữ                                                                | the yearly palace; how it differs from đại vận                                                                                |
  | `sao-thai-tue`                 | `LUU_TINH_NAMES`; the `ThaiTueRelation` kinds `phamThaiTue` reports                                                                                                                  | what Thái Tuế is; lưu niên stars; calm framing                                                                                |
  | `ung-dung-tu-vi-cong-viec`     | none                                                                                                                                                                                 | Quan Lộc and its partners; using a reading as reflection, not orders                                                          |
  | `phong-thuy-va-tu-vi`          | none                                                                                                                                                                                 | how they differ; what each can and cannot say                                                                                 |
  | `doc-la-so-cua-chinh-ban`      | from `castSampleChart()`: Mệnh's chi and stars with ratings, Thân's palace, cục, bản mệnh, the four hóa and their palaces, the đối cung and tam hợp stars, the borrowing in Tài Bạch | a step-by-step read of the sample; then "lập lá số của bạn"                                                                   |

  Lesson required mentions are the owned concepts plus, for 6.3, the Mệnh's chính tinh, the cục name and Thân's palace. The two lessons with no engine facts (6.1, 6.2) are the ones Kim An reads most closely.

**The writing guide** (`writingGuideFor`, in Vietnamese, in the Tết prompts' voice). The wording is the implementer's; it must say:

- **Audience:** write for a beginner who knows nothing; explain a term the first time it appears.
- **Facts:**
  - Write only from the facts given; claim no bậc, hành, chòm or relation they do not list.
  - Say nothing about miếu or hãm for a star the facts mark as without bậc, and nothing about a cell a partial row leaves out.
  - Name positions only with miếu, vượng, đắc địa, bình hòa, hãm, written "tại" or "ở" plus the chi.
  - Call a star hung or cát only as "<sao> là hung tinh / cát tinh".
- **Names and spelling:**
  - Write "Tử Vi" for the star and "tử vi" for the art. The guide prints `ART_WRITTEN_AS_STAR` as forms never to use.
  - Follow the spelling rules (Hóa, Hỏa, Thủy, Tị).
- **Links:** write terms as `[[kind/slug|nhãn]]`, choosing only from the target list; link the lessons that own a concept rather than explaining it at length; link each target once.
- **Tone:**
  - No fear, no promises, no selling, no talk of how the text was written.
  - The guide prints `KIEN_THUC_FORBIDDEN` and the phrases `forbiddenPhraseViolations` rejects.
  - For hung tinh, Tật Ách and Vòng Tràng Sinh, use `CALMER_PHRASINGS`. The seed list is: "dễ va chạm, nên cẩn trọng khi đi lại" instead of tai nạn; "nên giữ gìn sức khỏe" instead of bệnh nặng; "giai đoạn lắng xuống của vòng" for Tử, Mộ, Tuyệt.
- **Summary:** one or two sentences, 60–160 characters, for a search result and a popover, no links.

- [ ] **Step 1: Write the failing tests.**
  - `lesson-facts.spec.ts`:
    - `lists the six palaces Thân can sit in`: Mệnh, Phúc Đức, Quan Lộc, Thiên Di, Tài Bạch, Phu Thê.
    - `gives every planned lesson an outline`: `LESSON_OUTLINES` has exactly the 18 lesson slugs, and each has at least two must-cover points.
    - `writes the sinh cycle in new-style spelling`: no fact line of `am-duong-ngu-hanh-co-ban` matches the old-style rule from Task 7.
    - `gives tiểu vận and Thái Tuế engine facts`: `lessonFactLines` of `tieu-van-hang-nam` names a starting cung for each of the four tam hợp groups; that of `sao-thai-tue` names every `LUU_TINH_NAMES` item.
    - `keeps vô chính diệu a link in lesson 2.3`: `tam-hop-xung-chieu`'s must-cover names the link `thuat-ngu/vo-chinh-dieu` and no point is about vô chính diệu alone.
  - `build-page-brief.spec.ts`:
    - `briefs Thiên Cơ with its engine facts`: the fact lines mention `Mộc`, `chòm Tử Vi` and `hãm`; the required mentions include `Thiên Cơ`, `hành Mộc` and `chòm Tử Vi`.
    - `tells a star without bậc not to claim one`: Tả Phù's brief has no rating line and has the no-bậc line.
    - `tells a star with a partial row which cells it has`: Địa Kiếp's brief names Dần as its only cell and carries "không suy từ sao cặp".
    - `briefs Phu Thê with its partners`: required mentions include Quan Lộc, Phúc Đức and Thiên Di.
    - `offers every planned page but itself as a link target`: 75 targets for any page.
    - `links a lesson to its neighbours in the path`: `tam-hop-xung-chieu` has previous `cung-menh-va-cung-than` and next `y-nghia-chinh-tinh`; `tu-vi-la-gi` has no previous, and `doc-la-so-cua-chinh-ban` has no next.
    - `points an entry at the lesson that teaches it`: `sao/thien-co` has teaching lesson `y-nghia-chinh-tinh`.
  - `writing-guide.spec.ts`: `prints every forbidden phrase and art form the validator rejects` (each item of `KIEN_THUC_FORBIDDEN` and `ART_WRITTEN_AS_STAR` appears), `offers the calmer phrasings`.
  - `render-brief.spec.ts`:
    - `prints the same brief every time`: two renders of `buildPageBrief` for `sao/thien-co` are equal, and the output holds no date.
    - `gives Thiên Cơ its facts, range, targets, file and check`: the Markdown holds `hành Mộc`, `chòm Tử Vi`, `450–800 âm tiết`, 75 link-target lines, `tmp/kien-thuc/drafts/sao/thien-co.json`, `check --only=sao/thien-co` and `"writtenBy": "claude-code"`.
    - `gives an entry outside the core groups the 300–700 range`: Tả Phù's brief holds `300–700 âm tiết`.
    - `gives a lesson its neighbours and owned concepts`: `bai/tam-hop-xung-chieu`'s brief names both neighbour lessons and the concepts other lessons own.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): brief kiến thức writers from engine facts and the writing guide`.

### Task 12: Stores, indexes and `approve`

Depends on Task 11: `approve` rebuilds each page's brief to get its required mentions.

**Files:**

- Create: `.../kien-thuc/store/kien-thuc-paths.ts`, `draft-file.ts`, `draft-store.ts`, `content-store.ts`
- Create: `.../kien-thuc/indexes/build-manifest.ts`, `build-search-index.ts`
- Create: `.../kien-thuc/commands/approve.ts`, `reviewed-at.ts`
- Test: `draft-file.spec.ts`, `draft-store.spec.ts`, `content-store.spec.ts`, `build-manifest.spec.ts`, `build-search-index.spec.ts`, `reviewed-at.spec.ts`, `approve.spec.ts`

**Interfaces:**

```ts
export const KIEN_THUC_CONTENT_DIRECTORY = 'apps/frontend/src/features/kien-thuc/content';
export const KIEN_THUC_DRAFTS_DIRECTORY = 'tmp/kien-thuc/drafts';
export interface KienThucDirectories {
  readonly content: string;
  readonly drafts: string;
}
export function draftPath(directories: KienThucDirectories, ref: PageRef): string;

export const DRAFT_AUTHOR = 'claude-code';
export interface DraftMetadata {
  readonly writtenBy: typeof DRAFT_AUTHOR;
  readonly writtenAt: string;
}
export type DraftFile = PageDraftBody & DraftMetadata;
export function isDraftFile(value: unknown): value is DraftFile;

export interface StoredDraft {
  readonly ref: PageRef;
  readonly draft: DraftFile;
}
export function readDraft(directories: KienThucDirectories, ref: PageRef): Promise<DraftFile>;
export function draftExists(directories: KienThucDirectories, ref: PageRef): boolean;
export function readAllDrafts(directories: KienThucDirectories): Promise<readonly StoredDraft[]>;

export interface ContentFiles {
  readonly lessons: readonly LessonFile[];
  readonly entries: readonly EntryFile[];
}
export function readContent(directory: string): Promise<ContentFiles>;
export function contentExists(directory: string, ref: PageRef): boolean;
export function writeContentPage(directory: string, page: LessonFile | EntryFile): Promise<void>;
export function writeIndexes(directory: string, files: ContentFiles): Promise<void>;

export function buildManifest(files: ContentFiles): KienThucManifest;
export function buildSearchIndex(files: ContentFiles): readonly KienThucSearchItem[];
export function reviewedAtOf(now: Date): string;

export interface ApproveResult {
  readonly approved: readonly PageRef[];
  readonly rejected: readonly { readonly ref: PageRef; readonly violations: readonly string[] }[];
}
export function approvePages(
  refs: readonly PageRef[],
  directories: KienThucDirectories,
  now: Date,
): Promise<ApproveResult>;
```

- `isDraftFile` accepts exactly `summary`, `sections`, `writtenBy` and `writtenAt`; any other key fails it. `readDraft` throws `MissingDraftError` or `MalformedDraftError` (naming the file and the offending key), then applies `keepFirstLinkPerTarget`.
- `approvePages`, for each ref in turn:
  - Look up the plan page (`UnknownPageRefError`) and read its draft. A missing or malformed draft is reported as rejected with the error's message.
  - Build the file from every plan-owned field (`slug`, `kind`, `group`, `title`, `aliases`, `step`, `order`, `learnInLesson`) and the draft's `summary` and `sections`.
  - Run `validatePage` with the brief's required mentions and the corpus of all content and drafts minus itself.
  - On success: add `readingMinutes` for lessons, stamp `reviewedAt`, write the page to `content/`, delete the draft.
  - After the loop, `writeIndexes` from `readContent` once.
  - A rejected draft stays in the drafts folder, untouched.
- `buildManifest` lists all six `KIEN_THUC_STEPS` (a step with no approved lesson has an empty `lessons`) and orders everything by the plan. A file whose ref is not planned throws `UnplannedContentError`.

- [ ] **Step 1: Write the failing tests** (every fs test in an `mkdtemp` directory, like the Tết runner spec):
  - `reviewed-at.spec.ts`: `stamps the Việt Nam date`: `2026-11-14T18:30:00Z` gives `2026-11-15`, and `2026-11-14T16:59:00Z` gives `2026-11-14`.
  - `draft-file.spec.ts`: `accepts prose with writtenBy claude-code`, `refuses a draft that carries a plan field` (a `title` key fails), `refuses another author`.
  - `draft-store.spec.ts`: `reads a draft by ref from its kind folder`, `lists every draft with its ref`, `throws MissingDraftError for a ref with no file`, `throws MalformedDraftError naming the file for a draft without sections`, `reduces a repeated link on read`.
  - `content-store.spec.ts`: `reads lessons and entries by folder`, `throws MalformedContentFileError for a lesson without reviewedAt`.
  - `build-manifest.spec.ts`:
    - `lists all six steps and only the approved lessons in order`: with lessons 1.2 and 1.1 approved (given in that order), step 1 lists 1.1 then 1.2, and steps 2–6 have empty `lessons`.
    - `orders entries by the plan`: Thiên Cơ before Hóa Lộc before Tả Phù before cung Mệnh before Hành Kim before Thiên can.
    - `carries no summaries or aliases`: the serialised manifest contains neither key.
    - `refuses a file the plan does not know`: `UnplannedContentError` naming the ref.
  - `build-search-index.spec.ts`: `indexes lessons and entries with their aliases and summaries`.
  - `approve.spec.ts`:
    - `moves a valid draft into content and stamps it`: the content file carries the plan's title and aliases, `reviewedAt` from `now`, `readingMinutes` equal to `readingMinutes(countSyllables(...))`, and no `writtenBy` or `writtenAt`. The draft is gone, and `manifest.json` and `search-index.json` list the page.
    - `refuses a draft that breaks a fact and leaves it in drafts`: a Thiên Cơ draft edited to `miếu ở Dần` is rejected with that violation; `content/` is unchanged.
    - `reports a ref with no draft and goes on`: `MissingDraftError`'s message is in `rejected`, and the other refs are approved.
    - `replaces an approved page with its rewritten draft`: an existing content file is overwritten, and the manifest still lists the page once.
    - `approves the valid drafts of a batch even when one fails`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** All writes use `writeJsonFile`. `reviewedAtOf` uses `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })`, with the time zone as a named constant.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): approve reviewed kiến thức drafts into content`.

### Task 13: `brief`, `check`, `preview`, the CLI and the nx target

**Files:**

- Create: `.../kien-thuc/batches.ts`, `cli-options.ts`, `kien-thuc-cli.ts`, `commands/brief.ts`, `commands/check.ts`, `commands/preview.ts`, `approved-content.spec.ts`
- Modify: `apps/backend/package.json` (nx target `kien-thuc`)
- Test: `batches.spec.ts`, `cli-options.spec.ts`, `brief.spec.ts`, `check.spec.ts`, `preview.spec.ts`

**Interfaces:**

```ts
export enum KienThucBatch {
  Step01 = 'step-01',
  Step02 = 'step-02',
  Step03 = 'step-03',
  Step04 = 'step-04',
  Step05 = 'step-05',
  Step06 = 'step-06',
  ChinhTinh1 = 'chinh-tinh-1',
  ChinhTinh2 = 'chinh-tinh-2',
  Cung = 'cung',
  TuHoa = 'tu-hoa',
  PhuTinh = 'phu-tinh',
  NguHanh = 'ngu-hanh',
  ThuatNgu = 'thuat-ngu',
}
export function pagesOfBatch(batch: KienThucBatch): readonly PlannedPage[];

export enum KienThucCommandName {
  Brief = 'brief',
  Approve = 'approve',
  Check = 'check',
  Preview = 'preview',
}
export type BriefTarget = { readonly ref: PageRef } | { readonly batch: KienThucBatch };
export type KienThucCommand =
  | { readonly name: KienThucCommandName.Brief; readonly target: BriefTarget }
  | { readonly name: KienThucCommandName.Approve; readonly refs: readonly PageRef[] }
  | { readonly name: KienThucCommandName.Check; readonly only: PageRef | null }
  | { readonly name: KienThucCommandName.Preview; readonly batch: KienThucBatch | null };
export function parseKienThucCommand(args: readonly string[]): KienThucCommand;

export function briefOutput(target: BriefTarget): string;

export enum CheckedSource {
  Draft = 'draft',
  Content = 'content',
}
export interface PageCheck {
  readonly ref: PageRef;
  readonly source: CheckedSource;
  readonly validation: PageValidation;
  readonly neighbour: Neighbour | null;
}
export function checkOnePage(ref: PageRef, directories: KienThucDirectories): Promise<PageCheck>;
export function renderPageCheck(check: PageCheck): string;

export interface PlanDrift {
  readonly ref: PageRef;
  readonly fields: readonly string[];
}
export interface ContentCheckReport {
  readonly pages: readonly PageCheck[];
  readonly similarPairs: readonly SimilarPair[];
  readonly planDrift: readonly PlanDrift[];
  readonly staleIndexes: readonly string[];
}
export function checkKienThucContent(directories: KienThucDirectories): Promise<ContentCheckReport>;

export function renderPreview(
  drafts: readonly StoredDraft[],
  content: ContentFiles,
  corpus: readonly CorpusPage[],
): string;
```

- **Brief** (`commands/brief.ts`). For a ref, `renderBrief(buildPageBrief(page))`. For a batch, the batch's refs, one per line, in plan order.
- **Check** (`commands/check.ts`).
  - `checkOnePage` validates the page's draft (or its content file when there is no draft) against every other draft and content file.
  - `renderPageCheck` prints, in Vietnamese: the violations, the closest neighbour and score, the warnings, then the claim clauses, skipped first.
  - `checkKienThucContent` does that for every draft and content file. It also finds too-similar pairs, lists the plan-owned fields of each content file that no longer equal the plan, and names `manifest.json` or `search-index.json` when it differs from `buildManifest` or `buildSearchIndex` over `readContent`.
- **CLI.** `kien-thuc-cli.ts` parses, runs the command and prints to stdout. Exit code 1 when `check` found a violation, drift or a too-similar pair, or when `approve` rejected a ref. No Nest context.
- **Preview** (`commands/preview.ts`). One HTML file at `tmp/kien-thuc-preview.html`, every value escaped. Per draft:
  - title, summary, âm tiết count and reading time, `writtenBy` and `writtenAt`;
  - the facts table (`saoFacts` / `cungFacts`, exactly what plan 2's page will show, with `—` for a cell a partial row leaves out);
  - the claim clauses, skipped first with their reasons;
  - sections with each link shown as its label plus its target, marked "chưa có" when unpublished;
  - for a page that already has a content file, the sections that changed against it;
  - the closest neighbour and score, and every similarity warning.
- **nx target:** `kien-thuc` with `dependsOn: ['^build']`, `ts-node --transpile-only -P apps/backend/tsconfig.app.json apps/backend/src/content-gen/kien-thuc/kien-thuc-cli.ts`. It skips type-checking at run time because subagents call `check --only` many times; the gate type-checks.
- **Approved content spec** (`approved-content.spec.ts`, Decision 28): reads `KIEN_THUC_CONTENT_DIRECTORY` (resolved from the workspace root) and runs the fact checks of `validatePage` on every file, without similarity.

- [ ] **Step 1: Write the failing tests.**
  - `batches.spec.ts`: `splits the plan into thirteen batches that cover every page once`, `orders a step batch by lesson order`, `puts seven chính tinh in each lot in plan order`.
  - `cli-options.spec.ts`:
    - `reads brief for one page and for a batch`.
    - `rejects brief with neither` (`MissingBriefTargetError`).
    - `reads approve with several refs and rejects approve with none or with a path`.
    - `reads check with and without --only`.
    - `reads preview with and without a batch`.
    - `rejects an unknown batch, an unknown ref and an unknown flag`, naming each.
  - `brief.spec.ts`: `prints a page's brief`, `lists a batch's refs in plan order`.
  - `check.spec.ts`:
    - `checks one draft against every other page`: a draft that repeats a content file is reported with that ref.
    - `checks the content file when the page has no draft`.
    - `prints skipped claims after the violations`.
    - `reports a content file that breaks a fact`.
    - `reports similar pairs across drafts and content`.
    - `reports a content title that no longer equals the plan`.
    - `reports a manifest that differs from a rebuild`.
    - `passes a clean folder and leaves content untouched`: the bytes under `content/` are equal before and after.
  - `preview.spec.ts`: `escapes prose`, `shows the engine facts for a star draft with a dash for an empty cell`, `lists skipped claims before checked ones`, `shows what changed against the approved version`, `marks a link to an unpublished page`, `writes nothing under content`.
  - `approved-content.spec.ts`: `finds no fact violation in approved content` (passes on an empty folder, and on a temporary copy with one wrong rating it fails, which is asserted through the helper it shares with `check`).
- [ ] **Step 2: Run** `pnpm nx test @org/backend -- kien-thuc`. Expected: FAIL.
- [ ] **Step 3: Implement**, then add the nx target.
- [ ] **Step 4: Run again.** Expected: PASS. Then run the gate, `pnpm nx affected -t lint typecheck test`. Expected: green, with every Tết spec passing.
- [ ] **Step 5: Prove the boundaries.**
  - `git check-ignore tmp/kien-thuc/drafts/bai/x.json` prints the path.
  - `rg -n "content-gen/kien-thuc" apps/backend/src --glob '!**/content-gen/**'` returns nothing.
  - `rg -n "from '(\.\./)+ai/|@nestjs|typeorm" apps/backend/src/content-gen/kien-thuc` returns nothing.
  - `pnpm nx lint @org/backend` passes with `AI_PORT_ONLY` covering `src/content-gen/**`.
  - `pnpm nx run @org/backend:kien-thuc -- brief sao/thien-co` prints the brief with no database or `.env` present.
- [ ] **Step 6: Commit** `feat(content-gen): brief, check and preview kiến thức drafts from one CLI`.

### Task 14: Dry run on seven pages

The orchestrating session runs Task 15's flow on seven pages that cover every checker: `bai/tam-hop-xung-chieu`, `sao/thien-co`, `sao/dia-kiep`, `sao/hoa-ky`, `cung/phuc-duc`, `thuat-ngu/tam-hop-luc-xung`, `bai/doc-la-so-cua-chinh-ban`.

- [ ] **Step 1:** For each of the seven refs, dispatch one writing subagent with Task 15's prompt, one at a time. Expected: seven drafts in `tmp/kien-thuc/drafts/`, each passing `check --only`. Record per page in the SDD ledger: rounds, each round's violations, the skipped claims, and whether the subagent stopped at 5 rounds.
- [ ] **Step 2:** `pnpm nx run @org/backend:kien-thuc -- check`. Expected: exit 0.
- [ ] **Step 3:** `pnpm nx run @org/backend:kien-thuc -- preview` and open `tmp/kien-thuc-preview.html`.
  - Expected: all seven pages read as finished prose for a beginner.
  - Expected: the facts tables match the engine; every link resolves to a planned page; no closest-neighbour score reaches 0.2.
- [ ] **Step 4: Calibrate.**
  - If a page needed 3 or more rounds, or a check rejected prose that was correct, find out which.
  - When a check is wrong: add the real sentence to `golden-sentences.spec.ts` (failing), then fix the check. When the brief is unclear: fix the writing guide or the brief, test-first.
  - Record the change and the reason, then re-dispatch that page.
  - If the âm tiết range is missed in every round, fix the guide, not the range.
- [ ] **Step 5:** Show Kim An the preview, with the ledger's rounds per page. Do not run `approve`: that is Kim An's step in Task 16. The seven drafts stay and enter their batches.
- [ ] **Step 6: Commit** any calibration as `fix(content-gen): <what was loosened or tightened>`, one commit per change.

### Task 15: Writing with subagents, batch by batch

This task writes no code. It fills `tmp/kien-thuc/drafts/` for one batch, which Task 16 then reviews.

**Order.**

1. `step-01`, `step-02`, `step-03`, `step-04`, `step-05`, `step-06`;
2. `chinh-tinh-1`, `chinh-tinh-2`;
3. `cung`;
4. `tu-hoa`;
5. `phu-tinh`;
6. `ngu-hanh`, then `thuat-ngu`.

Each batch is written after the previous one is approved, so its similarity check sees every earlier page. Batches 1–3 gate plan 2 and are approved by **2026-12-15**, so plan 2 can meet design.md's 2027-01-15. Batches 4–6 can follow in later content PRs.

**The writing subagent's prompt** (fresh subagent per page, with the worktree path and the `NX_WORKSPACE_ROOT_PATH` prefix spelled out):

> Run `pnpm nx run @org/backend:kien-thuc -- brief <ref>` and read the whole brief. Write the draft JSON to the path the brief names, in the shape it shows, and touch no other file. Run `check --only=<ref>`, fix every violation it prints, and run it again. Stop after 5 rounds even if violations remain. Report: rounds used, the last violations (if any), and the skipped claims you are unsure of.

**Per batch:**

- [ ] **List the pages:** `pnpm nx run @org/backend:kien-thuc -- brief --batch=<batch>`.
- [ ] **Dispatch** one writing subagent per page: one at a time by default, at most three at once. After each draft lands, run `check` for the whole corpus. Pages in the same batch see each other only through that check, so a page whose similarity a later page broke is re-dispatched.
- [ ] **Record** per page in the SDD ledger: rounds, violations per round, skipped claims reported, and any page that stopped at 5 rounds. A page that stops at 5 rounds goes to Kim An with its remaining violations; it does not get a sixth round.
- [ ] **Hand off:** `check` exits 0 except for pages listed as stopped. Then `preview --batch=<batch>` and send Kim An the file path (Task 16).
- [ ] **Re-dispatch after a Kim An rejection:** a fresh subagent gets the same prompt plus the old draft and Kim An's note, and rewrites the draft at the same path. After two rejections for the same reason, stop and fix the writing guide or the brief (test-first where a check is involved) before re-dispatching.

### Task 16: Review with Kim An, batch by batch

This task writes no code. Each batch is previewed, read, approved, and then committed on its own after "tạo pull".

**Once, before the first star batch:** Kim An compares the facts tables of the 14 chính tinh and the 9 rated phụ tinh with the book he reads from, since the engine's tables come from tuvi.vn (`bang-tra-data.ts:5`, `:87`). A disagreement is recorded and raised as engine follow-up work; it does not block the batch.

**Before `tu-hoa`:** Kim An confirms the hành of the four hóa in the engine (Hóa Lộc Mộc, Hóa Quyền Thủy, Hóa Khoa Thủy, Hóa Kỵ Thủy in `sao-ngu-hanh-data.ts`).

**Per batch:**

- [ ] **Kim An reads every page in the preview, skipped claims first, checking:**
  1. **Facts.** Every bậc, hành, chòm, hung mark, đối cung and tam hợp in the prose matches the facts table on the same preview card. No miếu or hãm talk for a star the table shows without bậc or for a `—` cell.
  2. **Beyond the engine.** Claims the checks cannot see, starting with the skipped clauses: invented placements, "always" and "never", meanings that sound wrong to Kim An's reading of tử vi.
  3. **Tone.** Calm and plain for a beginner; terms explained at first use; no fear, no promises, no selling.
  4. **One query per page.** It answers its title's question. An entry does not re-teach the lesson that owns a concept, and the closest-neighbour score is low.
  5. **Links.** Each label fits its target; nothing important is left unlinked.
  6. **Summary.** It works alone as a search snippet and a popover.
  7. **Plan fields.** Title and aliases (the alias lists in Task 4 are Kim An's to confirm on the first star and cung batches). These are changed in `content-plan.ts` with a spec run, never in the draft; `approve` picks them up without a rewrite.
  8. **Lessons only.** It follows from the previous lesson and leads into the next. In 6.3, the walk-through matches the sample board.
  9. **Rewritten pages.** Read the changed sections the preview marks, not the whole page again.
- [ ] **For each page, one of three outcomes:**
  - **Approve:** `pnpm nx run @org/backend:kien-thuc -- approve <kind>/<slug> [more refs]`.
  - **Edit and approve:** Kim An edits the draft's prose in place, then runs `approve` for that ref in the same session. `approve` re-validates, and prints the violations if an edit trips a check.
  - **Reject:** Kim An writes a note; the page is re-dispatched (Task 15), then previewed and read again.
- [ ] **Drafts.** Keep hand-edited drafts until approved; do not remove the worktree or run `git clean -fdX` while `tmp/kien-thuc/drafts/` holds edits.
- [ ] **Close the batch:** `pnpm nx run @org/backend:kien-thuc -- check` exits 0. `git status` shows only files under `content/` (and `manifest.json`, `search-index.json`).
- [ ] **On "tạo pull":** one PR per batch into `dev`, commit `feat(kien-thuc): add the reviewed <batch> pages`. The body lists:
  - the pages, split into **read by Kim An** and **validator only**;
  - the rewrites and their notes;
  - any plan field Kim An changed.

### Task 17: Verification

- [ ] **Step 1: Gate.** `pnpm nx affected -t lint typecheck test`. Expected: green, `approved-content.spec.ts` included.
- [ ] **Step 2: Boundaries.**
  - `pnpm nx lint @org/backend` passes with `AI_PORT_ONLY` covering `src/content-gen/**`.
  - `rg -n "from '(\.\./)+ai/|@nestjs|typeorm" apps/backend/src/content-gen/kien-thuc` returns nothing.
  - `rg -n "//|/\*" apps/backend/src/content-gen/kien-thuc packages/shared/kien-thuc/src packages/shared/contracts/src/kien-thuc.ts` returns nothing, apart from `//` inside URL or regex literals, checked by eye.
  - `rg -n "\bany\b|as unknown as"` over the same three paths returns nothing.
- [ ] **Step 3: The engine is unchanged in value.**
  - `git diff origin/dev -- packages/shared/tu-vi/src` shows only these changes:
    - in `an-chinh-tinh.ts`, the new enum and two functions;
    - in `dia-ban.ts`, the `export` keyword on `CUC_BY_ELEMENT`;
    - in `index.ts`, the barrel lines.
  - No table or existing comment changed.
- [ ] **Step 4: Content invariants,** once batches have landed: `check` exits 0, which covers facts, similarity, plan drift and stale indexes; no file under `content/` lacks `reviewedAt`.
- [ ] **Step 5: Final review** by a fresh reviewer on the code PR with this Review Focus. Fix Critical and Important findings test-first.

## Spec vs code

- The spec says spelling "follows the engine: Hóa, Hỏa, Thủy". Engine star names do (`sao-names.ts`, `tu-hoa.ts`), but other engine strings are old-style:
  - `chi-ngu-hanh.ts:38` (`TiHoa = 'tị hoà'`);
  - `luan/the-cung.ts:14` (`'toạ thủ'`);
  - `luan/bang/the-cuc.ts:51-75` (`Hoá Lộc`, `Hoá Quyền`, `Hoá Khoa`, `Hoá Kỵ`);
  - phrases in `luan/bang/phu-the/*`.

  Briefs must not echo them (Global Constraints, Engine). Fixing them changes luận giải output and is out of scope.

- The spec says feature code talks to AI only through `ai/port`. Kiến thức talks to no AI at all. It does reach into `api/luan-giai` through `check-text.ts:1` (`LOI_DOA`), which keeps one forbidden list. Task 5 extends `AI_PORT_ONLY` to `src/content-gen/**`; that rule restricts only `ai/` imports, so the import stays allowed.
- The spec says no domain data is added to the engine. Task 2 adds no data, but it does export four existing symbols from the barrel (`ratingOf`, `phuTinhRatingOf`, `VONG_TRANG_SINH`, `CUC_BY_ELEMENT`), because the facts now live in `shared-kien-thuc` and the package exports only its barrel.
