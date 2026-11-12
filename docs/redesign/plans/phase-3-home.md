# Phase 3 — Home story: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `/` as the seven-chapter night-to-day story from [home-story-sketch.html](../home-story-sketch.html), on the Phase 1 design system.

**Architecture:** The page is a list of `StoryChapter`s inside the `StoryProvider` that `SiteLayout` already provides. Each chapter is one component in `features/home/components/story/`. All copy lives in `features/home/home-content.ts`. The route declares itself a story page through `staticData`, so the header knows it is over a story from the first render.

**Spec:** [docs/redesign/design.md](../design.md), "Visual identity — D3" (story system, motion rules, zones).

## Global Constraints

- Everything Phase 1 lists still applies: tokens only, no comments, no `any`, explicit types, every word present and visible in the prerendered HTML.
- **Motion is decoration, never gating.** A chapter shows its complete, readable state whenever scroll motion is not live: in the prerender, before the first scroll, and under reduced motion. Scroll motion may only emphasise (highlight a statement, brighten words, assemble digits); it never hides a statement.
- **Links stay valid.** The form chapter keeps the id `lap-la-so`, which the Tết hub pages link to.
- **The birth form is reused as is.** It is restyled with the Lá số page. On the home page it sits in a Night panel, because it was designed for a dark surface.
- **Gate:** `pnpm nx run-many -t lint typecheck test -p @org/frontend`. `src/features/home/**` joins `MIGRATED_FILES`. After deploy, `/` must stay at or above Performance 95, Accessibility 100 and CLS 0.

## Review Focus

1. Text hidden or faded in the prerendered HTML, or for reduced-motion readers.
2. Layout shift when the story header turns transparent and fixed.
3. Header and rail contrast on each chapter.
4. Overflow at 320 px, especially the giant numerals and the board.
5. Keyboard access to the hero CTA, the skip link, the rail and the form.

---

### Task 1: Motion and story plumbing

- `useSectionProgress(ref)` returns `{ progress: number; isLive: boolean }`. `isLive` is false under reduced motion and until the first scroll or resize; `progress` is then 1. Tests: live and not-live cases.
- `useChapterAt` measures in a layout effect, so the first paint already has the right tone.
- `CtaButton` (link form) and `StickyCta` accept `hash?: string`.
- `GiantNumeral({ parts, label, partStyles?, className })`: `parts` are joined with spaces; `partStyles` lets a chapter move each part.
- `StaticDataRouteOption.isStoryPage?: boolean`. `SiteLayout` reads it from the route matches and passes `isStoryPage` to `SiteHeader`, which no longer infers story mode from registrations. Tests: a story route's header is `fixed` on the first render; other routes keep the Day bar.

### Task 2: The seven chapters

Files in `features/home/components/story/`: `OpeningChapter`, `MomentChapter`, `MapChapter`, `TurnChapter`, `TruthsChapter`, `KnowledgeChapter`, `YourStoryChapter`, and `story-board.ts` (12 cung positions and per-statement highlights). `home-page.tsx` composes them with `ChapterRail` and `StickyCta`. The old sections (`hero-section`, `chart-anatomy-section`, `understanding-section`, `knowledge-section`, `section-heading`) and their media entries are deleted. `HERO_SECTION_ID` becomes `BIRTH_FORM_ANCHOR` (value `lap-la-so`).

Tests in `home-page.spec.tsx`:

- exactly one `h1`, "Lập lá số tử vi";
- the seven chapters in order, labelled for the rail;
- all six map statements and all three truths are rendered without `hidden`, `opacity-0` or `display: none`;
- the turn sentence has no word below full opacity before scrolling;
- the date numeral is assembled (no transform) before scrolling;
- the hero CTA and the skip link point at `#lap-la-so`, and the form chapter has that id and the birth form;
- article links go to `/kien-thuc/<slug>`, or to `/kien-thuc` when there is no slug, and the Tết hub link is kept.

### Task 3: Heading font preload

Re-add the build plugin that preloads the Latin and Vietnamese Inter Tight 800 files. Keep it only if local Lighthouse on `/` shows FCP or LCP no worse with it.

Measured: without it, the fallback font wraps the hero h1 onto a second line until Inter Tight arrives (CLS 0.046). Preloading Inter Tight 800 leaves 0.0008 from the Playfair "tử vi", so the Playfair 600 italic Latin and Vietnamese files are preloaded too. Result: CLS 0, FCP 5.0 s → 4.7 s locally.

### Verification

Build and prerender; `/` HTML contains every chapter's text with no `data-motion`; `scrollWidth === 320` at 320 px; screenshots at 390 and 1440 px; local Lighthouse on `/`.
