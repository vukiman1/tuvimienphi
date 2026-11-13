# Mobile nav bar in D3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the notched mobile nav bar with a flat D3 tab bar. It gets four tool tabs and a clear centre "Lập lá số" action that opens the birth form. The header's duplicate link row is removed on phones.

**Architecture:** `components/layout/mobile-nav-bar.tsx` is rewritten. A new `LaSoBoardIcon` (a 12-palace board with a plus) joins the design-system. `site-header.tsx` hides its link row below `md`. Nothing else changes.

**Spec:** [design.md](../design.md), "Visual identity — D3" and "Story system" (below 768 px the mobile nav bar's centre button plays the sticky CTA's role).

**Decided by Kim An (2026-11-13), from prototypes:** variant A, the chart (`ChartSpline`) icon for Vận hạn, and removing the header link row on phones. The prototypes are in the session scratchpad: `nav-proto/A-*.png` and `nav-proto/icon-3-trend.png`.

## What is wrong today

- "Thông báo" links to `/thong-bao`, which has no route (404). Its red unread dot is hard-coded, and the site has no notification feature.
- The centre button is the yin-yang logo, enlarged. It reads as branding, not an action. It links to `/la-so`, the history page, not to the birth form.
- Vận hạn and Ngày tốt, two of the four tools, are missing. "Khám phá" only opens Kiến thức.
- The header already shows "Lá Số · Vận Hạn · Ngày Tốt · Kiến Thức" on phones, which duplicates the bar and costs about 40 px at the top.
- The notch and the raised circle reach 104 px from the bottom.

## Design

| Part          | Decision                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bar           | Fixed bottom, `md:hidden`, `z-50`, height `h-17` (68 px) plus `pb-[env(safe-area-inset-bottom)]`. `bg-day/95`, `border-t border-ink/10`, a soft upward shadow. No notch, no SVG shape, no backdrop-blur.                                                                                                                                                                        |
| Items         | Five equal columns, in order: Trang chủ (`House`, `/`), Vận hạn (`ChartSpline`, `/van-han`), **Lập lá số**, Ngày tốt (`CalendarCheck`, `/ngay-tot`), Lá số của tôi (`Bookmark`, `/la-so`).                                                                                                                                                                                      |
| Tab           | lucide icon `size-5.5`, stroke 1.75, label `text-2xs` (11 px) `font-medium`, `gap-1`, in `text-ink-soft`. Each tab has a 44 px hit area.                                                                                                                                                                                                                                        |
| Active tab    | `text-ink`, label `font-semibold`, a gold bar `w-7 h-0.75 rounded-b` at the top edge, and `aria-current="page"`. Matching: `/` exact; others by prefix (`/la-so` also covers `/la-so/detail`).                                                                                                                                                                                  |
| Centre action | A link to `/` with hash `lap-la-so` (`BIRTH_FORM_ANCHOR`), with `focusHashTarget` like `CtaButton`. It is a `size-13` gold disc (`bg-gold text-ink`) raised half its height above the bar, with `ring-4 ring-day` and `shadow-lg`. It holds `LaSoBoardIcon` at `size-6`, with the label "Lập lá số" below in `font-semibold`. Accessible name: "Lập lá số". `FOCUS_RING_CLASS`. |
| Board icon    | `design-system/brand/LaSoBoardIcon.tsx`: a 24×24 SVG with `stroke="currentColor"`, rounded caps and `aria-hidden`. It draws the outer square, the 12 outer cells (dividers at 7.5 / 12 / 16.5 on each side), an inner 9×9 square, and a plus in the centre. The path is in the prototype `nav-proto/gen.mjs` (`I.board`).                                                       |
| Removed       | "Thông báo" and its fake dot; "Khám phá"; "Cá nhân" (the account stays in the header: "Đăng nhập" or the avatar menu); the notch constants and paths; the logo in the bar.                                                                                                                                                                                                      |
| Header        | The link row in `site-header.tsx` is `hidden md:flex` (or the equivalent on its container), so phones show the logo and the account control only.                                                                                                                                                                                                                               |

## Global Constraints

- No comments, no `any`, explicit return types, named constants, tokens only. `src/components/layout/**` is under the style guard.
- No new font weights: `font-medium` 500 and `font-semibold` 600 are already in use.
- The prerendered HTML must still contain the nav. It is static markup with no state at first paint.
- **Gate:** `pnpm nx run-many -t lint typecheck test -p @org/frontend`.

## Review Focus

1. **The centre action from every page.** From `/kien-thuc/...` it navigates to `/` and focuses the birth form. On `/` it only scrolls and focuses.
2. **Clearance.** Content at the bottom of a page (the footer, the last form button) must not hide behind the bar. Check the bottom padding that layouts reserve for the old 104 px bar and shrink it to the new height. Any other fixed element that clears the old bar must be updated, for example the toast offset on `feat/redesign-toast` (currently `7rem`) and the floating widget at bottom right.
3. **320 px.** Five labels fit without wrapping. "Lá số của tôi" is the longest.
4. **Active state** on nested routes: `/van-han/2027/tuoi-dan` lights Vận hạn, and `/la-so/detail` lights Lá số của tôi.
5. **Safe area** on notched iPhones: the bar's height grows by the inset, and the labels stay above the home indicator.

---

### Task 1: `LaSoBoardIcon`

- [ ] **Test** (`design-system/brand/LaSoBoardIcon.spec.tsx`): it renders an `svg` with `aria-hidden="true"` and `stroke="currentColor"`, and forwards `className`.
- [ ] **Implement**, export from `design-system/index.ts`, and run the test.

### Task 2: The new bar

- [ ] **Failing tests** in `components/layout/mobile-nav-bar.spec.tsx` (create or extend):
  - `links the four tools and the birth form`: hrefs `/`, `/van-han`, `/ngay-tot`, `/la-so`, and the centre link `/#lap-la-so` named "Lập lá số".
  - `has no notification link`: no link to `/thong-bao`, and no "Thông báo" text.
  - `marks the tab of a nested route as current`: at `/van-han/2027/tuoi-dan`, the Vận hạn link has `aria-current="page"`, and Trang chủ does not.
  - `shows the board icon, not the logo, in the centre action`: there is no `img` inside the centre link.
- [ ] **Implement** per the Design table, and delete the notch code.
- [ ] Run the gate.

### Task 3: Header row and clearance

- [ ] **Failing test** in `site-header.spec.tsx`: `keeps the page links out of the phone header`. The container of the "Vận Hạn" header link carries `hidden` and `md:flex`, or equivalent.
- [ ] **Implement.** Find every place that reserves space for the old bar (`grep -rn "pb-\|bottom-" src/components/layout src/design-system`, plus the floating widget) and set it to the new height plus the safe area.
- [ ] **Playwright:**
  - At 320 / 390 / 430 px on `/`, `/kien-thuc`, `/van-han` and `/la-so`, take screenshots. Check that the last element of each page is reachable above the bar.
  - Tap the centre action from `/kien-thuc` and check that the URL becomes `/#lap-la-so` and the form has focus.
  - Save the screenshots to the scratchpad `nav-impl/`.
