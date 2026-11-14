# Lá số workspace — Design

Status: approved by Kim An's delegation, 2026-11-14. Builds on Phase 3 (`docs/redesign/plans/phase-3-la-so.md`, shipped as #200, #201, #203).

## Intent

On `/la-so/detail` the board sits in the middle of the page. Tapping a cung changes one line of text under the board ("Đang chọn cung …"), so the reader gets almost nothing back for the tap. Kim An wants the page to be a place where people explore their chart: board on the left, and on the right whatever the picked cung means, with room for "Hỏi AI" later. Visually the page should feel like the home page: night tones, gold geometry and a painted hero.

Kim An picked the direction from five AI mockups on 2026-11-14: the dark board from mock B and the cream detail panel from mock A, with the UX fixes from mock D/E. The mockups are in the session scratchpad (`mock-d-dark-board-panel.png`, `mock-e-dark-board-chat.png`).

## Competitor reference (aituvi.com, studied 2026-11-14)

- Tapping a cung **leaves the chart** for a generic star dictionary page. The AI chat is **a separate page**. The board is **unreadable on a phone**, with text around 9 px. This design fixes all three.
- Worth borrowing:
  - a **"Vì sao nói vậy"** line that names the stars behind each claim;
  - **AI questions pre-written from the context**, shown at the end of each reading (phase 2);
  - **contextual meanings** ("Thất Sát hãm ở Tử Tức") rather than a generic dictionary.
- Not borrowed: palace scores, the radar chart, fake purchase toasts, strike-through prices and Chinese characters on the board.

## Goals

1. Tapping or keyboard-selecting a cung shows a detail panel **without leaving the board**. On desktop it sits beside the board; below 1280 px it is a bottom sheet.
2. The panel explains the cung from **content that already exists**, plus two small new tables:
   - facts (đại vận, tam hợp, xung chiếu, nhị hợp, Tuần/Triệt, tiểu hạn);
   - the chính tinh with their brightness;
   - a short **luận nhanh** (one thuận and one nghịch claim, with the stars behind each);
   - every phụ tinh, grouped;
   - a link to the matching paid chapter.
3. A **Gọn** density (key stars only) with a remembered **Đủ sao** toggle. Both densities keep the familiar tall board: a Gọn cell reserves the height its Đủ sao content needs (Kim An, 2026-11-14).
4. Night look. Dark board on `night`, gold rules and glow, a painted hero, and luận giải unchanged below.
5. Every quality gate from `docs/redesign/design.md` still holds: Lighthouse, AA contrast, CLS 0, no new font weights.

## Non-goals

- **Hỏi AI** (phase 2, its own spec): endpoint, quota and credits, chat UI. Phase 1 adds no AI placeholder, button or stub.
- New luận claims for the six cung without a table (Huynh Đệ, Điền Trạch, Phúc Đức, Thiên Di, Tật Ách, Nô Bộc).
- The past-years "Đúng với tôi / Chưa đúng" validation block (phase 2, because it needs AI per chart).
- Luận giải section behaviour, backend and the history page `/la-so`.

## Anti-goals

- The board stops being readable: a star or cung name rendering below 10 px **on screen** (after the board's `zoom`), or a star colour under 4.5:1 on its cell. Tags (`Tuần`, `Triệt`, `Tiểu hạn`, ratings) are `text-2xs` and may render down to 9 px.
- Tapping a cung moves the page, jumps scroll or shifts layout (CLS stays 0).
- The free panel gives away the paid chapter. Luận nhanh shows **one** thuận and **one** nghịch claim, never the chapter's full set.
- A painting becomes the LCP element, or a phone downloads it.

## Approaches considered

1. **Side panel ≥ 1280 px, bottom sheet below (chosen).** A single `CungPanel` renders in two containers. The board stays fully visible on every size, and phase 2 can grow the sheet into a chat.
2. **Panel inline under the board on every size.** Simplest to build, but on a phone the panel sits below a 4×4 board and the thiên bàn, so every tap means scrolling away from the board. This is today's compact behaviour, and the reason the page feels dead.
3. **Separate route per cung** (aituvi's way). Good for SEO, but the chart is `noindex`, and leaving the board is the problem we are fixing.

## Layout

| Width (viewport) | Board                                                                           | Detail                                                                                   |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| ≥ 1280           | Left column, `minmax(0,1fr)`; full board scaled to fit (about 780 px)           | Sticky right column, 26rem, full height below the header, scrolls inside                 |
| 680–1279         | Full board, centred, up to 812 px                                               | Bottom sheet (Radix Dialog), opened by tapping a cung, max 85dvh, prev/next cung buttons |
| < 680            | Compact board (unchanged since #200: name and chính tinh only), thiên bàn below | Same bottom sheet                                                                        |

- The workspace container widens from `max-w-6xl` to `max-w-7xl`, so the board keeps about 780 px next to the 26rem panel.
- On load at ≥ 1280 px the panel shows the picked cung (Mệnh by default). Below 1280 px the sheet opens only on a tap, never on load.
- The sheet replaces today's inline `CungDetail` on phones.
- The compact breakpoint moves from 640 to 680 px container width. At 680 the full board's scale is 0.837, so `text-xs` (12 px) star names still render at 10 px or more.
- The board keeps the proportions of today's lá số in both densities (about 784×1325 at 1440 for the sample chart); the sticky panel, not a shorter board, keeps the detail in view.

## Board (dark)

- **Surfaces.**
  - The section is `bg-night`.
  - Cells are `bg-night` and rules are `gold/25`.
  - Spotlit cells (hovered, plus tam hợp, xung chiếu and nhị hợp) are `gold/12` over night.
  - The **picked** cung gets a 2 px gold inset ring and `shadow-glow-gold-strong`. The **hovered** cung gets a 2 px dawn ring.
- **Lines.** Tam hợp is gold with `drop-shadow-glow-gold`. Xung chiếu is ember (5.11:1 on night, which clears 3:1 for graphics).
- **Text.**
  - Cung name: dawn.
  - Can chi, month and age: day-soft.
  - Thiên bàn: day and day-soft.
  - Chi labels: day-soft, or dawn when lit.
  - The Tuần/Triệt and Tiểu hạn tags become `bg-day text-night`, because `chart-block` is invisible on night.
- **Star colours on night** use five new tokens. Measured contrast is on night and on the `gold/12` tint:

  | Token                | Value     | On night | On tint |
  | -------------------- | --------- | -------- | ------- |
  | `hanh-kim-on-night`  | `#d6d0c4` | 12.12    | 9.86    |
  | `hanh-moc-on-night`  | `#6fd69a` | 10.42    | 8.48    |
  | `hanh-thuy-on-night` | `#9fc2ff` | 10.31    | 8.39    |
  | `hanh-hoa-on-night`  | `#ff9a8f` | 9.10     | 7.41    |
  | `hanh-tho-on-night`  | `#e8b85c` | 10.14    | 8.25    |

  Thủy turns blue on night: cream would read the same as Kim. These are chart data colours, which design.md already keeps outside the ten-colour palette. The light `hanh-*` set stays for the cream panel.

- **Density.** The `Gọn` / `Đủ sao` toggle sits above the board on the right. The choice is stored in `localStorage` under `la-so.board-density`; the default is `Gọn`. It applies to the full board only, since the compact board is already minimal.
  - **Gọn** keeps:
    - chính tinh;
    - the key phụ tinh: Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt, Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp, Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ, Lộc Tồn and Thiên Mã;
    - the same names in the lưu and đại vận layers;
    - Tuần/Triệt, tiểu hạn, the đại vận age, trường sinh and the cung tags.
  - **Đủ sao** is today's cell.
  - Every star is still listed in the panel, so Gọn hides nothing.
- **Keyboard.** Arrow keys move focus around the ring, following the grid. Enter or Space picks the focused cung. Each cung stays a button.
- **URL.** The picked cung is stored in a `cung` search param holding a cung-name slug (`menh`, `phu-mau`, `quan-loc` …), updated with `replace: true`. The route's head tags and `noindex` stay unchanged.

## Detail panel (`CungPanel`)

The panel is a cream card (`bg-day text-ink`, a `gold/40` border and `rounded-2xl`, plus `shadow-glow-gold` on desktop). It holds, in order:

1. **Header.**
   - An h2 in Playfair 700: `Cung {name}`, with `· {chi}` in ink-soft.
   - A `THÂN` tag when the cung holds the Thân.
   - A `Tiểu hạn {viewYear}` tag when it is the tiểu hạn.
2. **Fact chips.** `Đại vận {a}–{a+9} tuổi`, `Tam hợp: {X} · {Y}`, `Xung chiếu: {Z}`, `Nhị hợp: {W}`, and `Tuần` / `Triệt` when present.
3. **What the cung governs.** One sentence from a new 12-entry table, `CUNG_Y_NGHIA` in `shared-tu-vi`.
4. **Chính tinh.**
   - One row per star: a ngũ hành dot, the name, and the brightness written out (Miếu, Vượng, Đắc, Bình, Hãm).
   - A vô chính diệu cung instead reads "Vô chính diệu", followed by the borrowed stars and the cung they come from.
5. **Luận nhanh.** Shown only for Mệnh, Phụ Mẫu, Phu Thê, Quan Lộc, Tài Bạch and Tử Tức, the cung that already have a claim table. It shows:
   - the highest-weight thuận claim and the highest-weight nghịch claim, from `buildMenhBrief` / `buildCungBrief`;
   - the claims are shown as written in the tables, with the first letter capitalised and a full stop added. They sit under two labels, `Nét thuận` and `Cần để ý`. There is no sentence template and no new copy;
   - under each claim, a line "Vì sao:" naming the stars in its `do`, with their brightness;
   - a link "Đọc luận giải chương {title}" that selects that chapter and scrolls to the luận giải section. Mệnh links to 02, Quan Lộc to 03 and Tài Bạch to 04. Phu Thê, Phụ Mẫu and Tử Tức link to 05, because chapter 05 reads Phụ Mẫu and Tử Tức as its Cha mẹ and Con cái mục.

   The claims come from the base brief (`buildMenhBrief` / `buildCungBrief`), not the mục briefs: the panel teases the cung, and the paid mục goes deeper.

   The section is absent when the brief is `null` or the cung has no table.

6. **Phụ tinh.** Every star, in three groups:
   - **Cát tinh** and **Hung tinh** (natal);
   - **Năm {viewYear}** (lưu tinh), plus **Đại vận** (đại vận tinh) when present.

## Content added

- `CUNG_Y_NGHIA`: twelve one-line definitions of what each cung governs. Drafted in the plan and marked unreviewed, like every other table in `luan/bang`.
- The luận nhanh claims are the existing seed tables. They are already marked "chưa soát" and already feed the paid chapters, so showing one of each kind for free adds no new risk.

## Assets

- **L1 — lá số hero painting.** A starry night with a faint gold wheel of twelve star points on the right third, above low ridges and a sea of mist. Generated with `gpt-image-2` from the illustration-guide style block, using `story/night-1536.webp` as the reference.
  - Variant 1 is chosen.
  - Size is 47 KB at 1536 and 13 KB at 768, both within budget.
  - It ships through `PageHero`'s existing `painting` prop: md and up, lazy, `fetchPriority="low"`, never on phones.
  - Its scene line is added to `illustration-guide.md`.
- **No other raster.** The board backdrop is plain `night`, with `Orbit` in the thiên bàn.

## Constraints

- Tokens only. No hex values outside `tokens.css`, no arbitrary px and no code comments. The `local/no-ad-hoc-style` guard covers `features/la-so/**`.
- **Fonts:** only what `/` already loads.
- **Motion:**
  - The sheet slides in on transform and opacity, and has no motion under reduced-motion.
  - No `backdrop-blur`. The sheet overlay is a flat `night/60`.
- **Bundle:** the luận tables (about 80 KB of source) load through a dynamic `import()` of the luận nhanh module. That way they never enter the route's initial chunk. Verify with the build's chunk list.
- **Tests:**
  - every new outcome has a test, including the vô chính diệu panel, a cung without a table, and density persistence;
  - existing specs change only where they assert removed copy ("Đang chọn cung …") or old colours.

## Left to the builder

- Exact spacing inside the panel, and its skeleton for luận nhanh while the chunk loads. The skeleton must not shift the layout.
- Chip wrapping on narrow sheets.
- Whether prev/next in the sheet follow the ring or the 12-cung order. The plan says ring order, matching the arrow keys.
