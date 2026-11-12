# Phase 3: Home entrance motion plan

> **Status: shelved by Kim An on 2026-11-12, after a prototype.** What the prototype taught:
>
> - `animation-timeline: view()` attaches to the nearest scroll container. Any ancestor with `overflow: hidden` is one, so the animation never runs. Use `overflow: clip`.
> - Elements inside pinned chapters (2, 3 and 4) stop moving relative to the viewport while pinned, so their entrance freezes half-done. Entrances must be off in pinned chapters, or limited to layouts that are not pinned.
> - A range of `entry 0–70%` is measured in the element's own height. On short rows it finishes in about 50 px of scrolling, which nobody sees. Use pixel ranges (about 240 px on desktop and 140 px on mobile), so the last element on the page can still finish.

**Goal:** Components on `/` enter with short, layered motion as they scroll into view: slide in from the left or right, fade up, scale in, or draw their lines. Motion must not slow the page, hide content, or shift the layout.

**Architecture:** Use pure CSS and no new JavaScript. Elements that enter on scroll use **scroll-driven animations** (`animation-timeline: view()`). The browser computes each element's progress from its position in the viewport, so nothing waits on an IntersectionObserver or React state. The hero animates once on load with an ordinary time-based `animation`. Every effect lives in one design-system stylesheet as a small set of `enter-*` classes. A chapter only adds a class and, where it needs one, a delay.

**Spec:** [design.md](../design.md), "Visual identity — D3", motion rules. Layout: [home-layout.md](../home-layout.md).

## Global constraints

- **Motion only enhances, it never gates content.** An `enter-*` class takes effect only when all three of these hold:
  - `html[data-motion='ready']` is set (the prerender strips it);
  - `@media (prefers-reduced-motion: no-preference)` matches;
  - `@supports (animation-timeline: view())` passes.

  In every other case the element is shown in its final state. So the prerendered HTML, readers with reduced motion, and Firefox (which does not yet support `view()`) all get the full static page.

- **The LCP stays the hero h1.** The h1 never animates `opacity`. It only rises a short distance with `translate`. Chrome records LCP at the h1's first paint, and a transform does not delay that paint.
- **Animate only `opacity`, `translate`, `scale`, `rotate`, `clip-path` and `stroke-dashoffset`.** Never animate `width`, `height`, `top`, `margin` or anything else that triggers layout. This keeps CLS at 0.
- **Elements already on screen at load start in their final state.** The animation range is `entry 0% entry 80%`. An element that has already entered the viewport is past that range, so it shows no flash.
- Each animation lasts 0.5–0.9 s and uses one easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint). The largest movement is 2rem (32 px). Staggers are 60–120 ms between siblings.
- Use tokens only and write no comments. The `local/no-ad-hoc-style` lint guard still applies to `features/home`.

## Motion vocabulary

All classes live in `design-system/motion/enter.css`, which `styles.css` imports.

| Class         | Start state, animated to the natural state              | Use for                                             |
| ------------- | ------------------------------------------------------- | --------------------------------------------------- |
| `enter-up`    | `opacity: 0; translate: 0 2rem`                         | Titles, cards, form panel                           |
| `enter-left`  | `opacity: 0; translate: -2.5rem 0`                      | Left-hand columns (chapter titles)                  |
| `enter-right` | `opacity: 0; translate: 2.5rem 0`                       | Right-hand lists (statements, articles, assurances) |
| `enter-scale` | `opacity: 0; scale: 0.94`                               | Board, featured card, icon badges                   |
| `enter-draw`  | `stroke-dashoffset: 100%` (with `pathLength="1"`)       | Orbit rings, board lines, eyebrow rules             |
| `enter-rise`  | `translate: 0 1.5rem`, no opacity change, plays on load | Hero h1 and the hero group                          |

Stagger: set a `--enter-delay` custom property (for example `[--enter-delay:120ms]`). Scroll-driven animations have no real delay, so the delay shifts the start of `animation-range` instead: `entry calc(0% + var(--enter-delay-pct))`. Pin the exact formula down in Task 1 and test it.

## Choreography by chapter

| Chapter                  | What moves                                                                                                                                                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 Khởi đầu** (on load) | The painting zooms out slowly from 1.06 to 1 over 2.4 s, Ken Burns style. The eyebrow, h1, subtitle and CTA rise in sequence, 0 / 80 / 160 / 240 ms (`enter-rise`, no fade). The constellation lines in the painting stay still. The `→` on the CTA nudges right on hover. |
| **2 Khoảnh khắc**        | The ellipse orbit draws itself (`enter-draw`), then its 12 points appear one by one in a clockwise ring. The digits keep their existing scroll assembly. The caption fades up.                                                                                             |
| **3 Lá số**              | The title column slides in from the left. The board scales in, then its gold frame lights up as a light sweeps around the border once (a conic-gradient pass). The 6 statements slide in from the right, 80 ms apart, and each icon badge scales in after its text.        |
| **4 Nhận thức**          | The two gold eyebrow rules grow outward from the centre (`scale-x` 0 → 1). The words keep their existing brighten-as-you-scroll.                                                                                                                                           |
| **5 Ba sự thật**         | The title slides in from the left. The 3 cards rise 120 ms apart, and each numeral 1/2/3 turns from −8° to 0 as it lands. On hover a card lifts 4 px and its gold border glows.                                                                                            |
| **6 Kiến thức**          | The intro column slides in from the left. The featured card scales in, and its thumbnail zooms to 1.05 on hover. The article rows slide in from the right 60 ms apart, and each `›` nudges right on hover.                                                                 |
| **7 Câu chuyện của bạn** | The title slides in from the left. The form panel rises. The gold orbit behind the form turns very slowly (one turn per 90 s, motion allowed only). The 4 assurance pills slide in from the right 80 ms apart. On hover, a light sheen sweeps across the submit button.    |

Hover micro-interactions do not depend on scroll support, so they also run in Firefox. Each one is wrapped in `motion-safe:`.

## Tasks

### Task 1: The `enter-*` vocabulary

- Create `design-system/motion/enter.css` with the keyframes and classes from the table above, the three-way gate (`data-motion`, reduced motion, `@supports`), and the `--enter-delay` stagger.
- Export the class names as a `const` map, `ENTER`, in `design-system/motion/enter.ts`, so chapters never hand-write the strings.
- Tests (Jest, against the CSS text and the map):
  - every `enter-*` rule sits inside the reduced-motion media query and the `@supports` block;
  - only the allowed properties appear in the keyframes;
  - `enter-rise` never sets `opacity`.

### Task 2: Hero on load

- Add `enter-rise` with staggered delays to the eyebrow, h1, subtitle and CTA. Add the Ken Burns zoom to the hero painting.
- Test that the h1 has no opacity animation.
- Verify with Lighthouse that the LCP element and the LCP time are unchanged against the current build.

### Task 3: Chapters 2–7

- Apply the choreography table.
- Draw lines with `pathLength="1"` on the `Orbit` ellipses, the `BoardCompass` circles and the eyebrow rules.
- Run the border light sweep on the board once, as a conic-gradient mask.

### Task 4: Hover micro-interactions

- CTA arrow nudge, card lift and glow, thumbnail zoom, row chevron nudge, submit button sheen.

### Verification

- **Playwright, at 390 and 1440:**
  - with motion on, scroll through the page, wait 1 s at each chapter, and assert that every text node has a computed `opacity` of 1 and no `translate`, so nothing stays stuck mid-animation;
  - with `reducedMotion: 'reduce'`, assert that every element is in its final state with no scrolling at all.
- **Local Lighthouse:** CLS 0, LCP element still the h1, LCP and TBT no worse than the current build.
- **Manual check:** Chrome, Safari 26+, and Firefox (static fallback).

## Review focus

1. Text that stays at `opacity: 0` because its animation range never completes (for example, the last element on the page cannot scroll far enough).
2. A fade on the hero h1 that would delay LCP.
3. Jank on low-end Android: too many elements animating at once. Keep it to 8 or fewer per viewport.
4. Firefox and older Safari must show the full static page.
5. Readers with reduced motion get no movement at all, including the slow orbit rotation and the Ken Burns zoom.
