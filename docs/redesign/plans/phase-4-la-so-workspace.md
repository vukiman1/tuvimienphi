# Phase 4 — Lá số workspace: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/la-so/detail` into a workspace with three parts:

- a dark board on the left with a `Gọn` / `Đủ sao` density toggle;
- a cream detail panel for the picked cung, sticky beside the board from 1280 px and a bottom sheet below that;
- a painted Night hero.

**Architecture:** The pure parts are unit-tested on their own:

- the luận nhanh selector and the cung definitions live in `shared-tu-vi`;
- the cung facts, density filter, keyboard navigation and slugs live in `features/la-so`.

`LaSoPage` owns the picked cung (now in the URL) and the open sheet. `LaSoWorkspace` picks the side-panel or sheet container from one media query. Both containers render the same `CungPanel`. The luận tables load through a lazy `quick-luan` module behind TanStack Query, so they stay out of the route's first chunk.

**Tech Stack:** React 19, TanStack Router and Query, Radix Dialog (`radix-ui`), Tailwind v4 tokens, Jest + Testing Library.

**Spec:** [2026-11-14-la-so-workspace-design.md](../../superpowers/specs/2026-11-14-la-so-workspace-design.md). Previous phase: [phase-3-la-so.md](phase-3-la-so.md).

## Decisions (approved by Kim An's delegation, 2026-11-14)

1. **Detail container.** From `(min-width: 80rem)` (1280 px), a sticky side panel. Below that, a bottom sheet that opens on tap, never on load. The inline `CungDetail` on phones is removed.
2. **The board is dark on every size**, compact included. New star tokens are named `hanh-<x>-night`. The light `hanh-*` set stays for the cream panel.
3. **Density.** The default is `Gọn`, stored under the `localStorage` key `la-so.board-density`. It applies to the full board only.
4. **Luận nhanh** shows one thuận and one nghịch claim, from the existing seed tables, for Mệnh, Phụ Mẫu, Phu Thê, Quan Lộc, Tài Bạch and Tử Tức. Elsewhere the section is absent, with no "coming soon" line.
5. **The picked cung lives in the URL** as `?cung=<slug>`, written with `replace: true`.
6. **Hero.**
   - The h1 becomes `Lá số của <Emphasis>{fullName}</Emphasis>` when a name is given, and stays `Lá Số Tử Vi` otherwise.
   - The painting is L1 variant 1, now `public/la-so/hero-night-{768,1536}.webp` (47 KB / 13 KB).
   - The "Đang chọn cung …" line is removed.
7. **Prev/next in the sheet follow the ring** (index ± 1 mod 12), the same direction as the board's clockwise order.
8. **The 10 px floor counts on-screen size.** `FULL_BOARD_MIN_WIDTH` goes from 640 to 680, so the scaled `text-xs` never drops under 10 px. Tags stay `text-2xs`.
9. **Fit target:** a 1440×900 viewport, once the reader has scrolled past the hero. Rows still grow; nothing is trimmed.
10. **Luận nhanh copy** is the claim as written, capitalised and with a full stop, under the labels `Nét thuận` / `Cần để ý`. Phụ Mẫu, Tử Tức and Phu Thê all link to chapter 05.

## Global Constraints

- **Tokens only.** No hex values outside `tokens.css`, no `[Npx]` and no code comments (CLAUDE.md). `local/no-ad-hoc-style` covers `src/features/la-so/**`.
- **Fonts:** only what `/` already loads, as listed in phase-3-la-so.md "Fonts". The panel h2 uses `TitleFace.Serif`.
- **No `backdrop-blur`.** The sheet overlay is `bg-night/60`. Sheet motion is transform and opacity only, and none under `prefers-reduced-motion`.
- **AA.**
  - Every star colour reaches ≥ 4.5:1 on `night` and on `gold/12` over `night`.
  - Board graphics (rules, lines, rings) reach ≥ 3:1 on both.
- **Painting.** md and up only, lazy, through `PageHero`'s `painting` prop. Never the LCP element.
- **Bundle.** `BANG_*`, `CHINH_TINH_*` and `PHU_TINH_*` must not appear in the `la-so.detail` initial chunk (checked in Task 9).
- **Worktree.** Prefix every nx command with `NX_WORKSPACE_ROOT_PATH=$PWD`. Never stop the dev servers on 4200 and 3000.
- **Gate:** `NX_WORKSPACE_ROOT_PATH=$PWD pnpm nx affected -t lint typecheck test`.

## Review Focus

1. **A vô chính diệu cung.** The panel says "Vô chính diệu", lists the borrowed stars and names the xung chiếu cung. Luận nhanh still renders when the brief exists (Task 1 and Task 6 tests).
2. **A bad `?cung=` value**, such as `?cung=abc`. The page still loads, with Mệnh picked: the schema drops the bad value instead of throwing (Task 5 test).
3. **A corrupt `localStorage` density**, such as `"x"`, or storage that throws (Safari private mode). Falls back to `Gọn` without crashing (Task 3 test).
4. **Resizing across 1280 px with the sheet open.** The sheet closes and the side panel shows the same cung, with no focus lost to `body` (Task 8 test).
5. **The sheet on a 390 px phone with the mobile nav.** The overlay covers the nav bar, and the sheet's last chip clears the home indicator. Reuse whatever safe-area utility the mobile nav already uses (`grep -n safe-area apps/frontend/src/styles.css`); never an arbitrary value. Covered by the Task 9 screenshot.

---

### Task 0: Baseline

- [ ] **Step 1.** Run Lighthouse mobile, 5 runs, with the phase-0 command on `https://www.xemtuvimienphi.top/la-so/detail?day=12&month=3&year=1995&calendar=duong&hour=Ng%E1%BB%8D&gender=nam`. Record the median Performance, Accessibility, LCP, the LCP element and CLS in `.superpowers/sdd/phase-4-la-so-workspace/progress.md`.
  - Expected: the numbers are recorded. This run is the binding baseline.
- [ ] **Step 2.** Build the A side from `origin/dev` in a separate worktree (`pnpm nx build @org/frontend`) and keep `dist/apps/frontend` for Task 9.

### Task 1: Luận nhanh and cung definitions (`shared-tu-vi`)

**Files:**

- Create: `packages/shared/tu-vi/src/luan/quick-cung-luan.ts`, `packages/shared/tu-vi/src/luan/bang/cung-y-nghia.ts`
- Modify: `packages/shared/tu-vi/src/index.ts` (export both)
- Test: `packages/shared/tu-vi/src/luan/quick-cung-luan.spec.ts`, `packages/shared/tu-vi/src/luan/bang/cung-y-nghia.spec.ts`

**Interfaces:**

- Produces:

  ```ts
  export interface QuickCungLuan {
    readonly thuan: LuanDe;
    readonly nghich: LuanDe;
  }
  export const QUICK_LUAN_CUNG: readonly CungName[];
  export function quickCungLuan(chart: NatalChart, cung: CungName): QuickCungLuan | null;
  export const CUNG_Y_NGHIA: Readonly<Record<CungName, string>>;
  ```

  - `QUICK_LUAN_CUNG` is `['Mệnh', 'Phụ Mẫu', 'Phu Thê', 'Quan Lộc', 'Tài Bạch', 'Tử Tức']`.
  - Mệnh goes through `buildMenhBrief`. The other five go through `buildCungBrief` with `BANG_PHU_MAU`, `BANG_PHU_THE`, `BANG_QUAN_LOC`, `BANG_TAI_BACH` and `BANG_TU_TUC`.
  - Each pick is the first claim of that `Sac` in `brief.luan`, which `gopCachCuc` already sorts by weight.
  - The result is `null` when the cung is not in `QUICK_LUAN_CUNG`, when the brief is `null`, or when either kind is missing.

- [ ] **Step 1: Write the failing tests.** Charts come from `castChart` with the baseline sample (12/3/1995, Ngọ, nam) and with a chart whose Mệnh is vô chính diệu (reuse the fixture finder in `luan-giai.characterization.spec.ts`: loop over birth days until `buildMenhBrief(chart)?.laVoChinhDieu`).
  - `picks the strongest thuận and nghịch claim of the cung brief`: for `'Quan Lộc'`, `result.thuan` equals the first `Sac.Thuan` claim of `buildCungBrief(chart, BANG_QUAN_LOC).luan`, and the same holds for nghịch.
  - `reads Mệnh through the Mệnh brief`: `quickCungLuan(chart, 'Mệnh')?.thuan` equals the first thuận of `buildMenhBrief(chart).luan`.
  - `still reads a vô chính diệu Mệnh`: the result is not null for the vô chính diệu fixture.
  - `has nothing to say for a cung without a table`: `quickCungLuan(chart, 'Thiên Di')` is `null`.
  - `every cung has a one-line meaning`: `CUNG_NAMES.every((name) => CUNG_Y_NGHIA[name].length > 0)`, and no entry contains a newline.
- [ ] **Step 2: Run.** `NX_WORKSPACE_ROOT_PATH=$PWD pnpm nx test shared-tu-vi -- quick-cung-luan cung-y-nghia`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement.** `CUNG_Y_NGHIA` carries exactly this copy:

  ```ts
  'Mệnh': 'Bản tính, khí chất và hướng đi chung của cả đời người.',
  'Phụ Mẫu': 'Cha mẹ, bề trên và nếp nhà bạn lớn lên trong đó.',
  'Phúc Đức': 'Phúc phần dòng họ, đời sống tinh thần và sự an ổn trong lòng.',
  'Điền Trạch': 'Nhà cửa, đất đai, của để dành và không khí trong nhà.',
  'Quan Lộc': 'Học hành, công việc, sự nghiệp và cách bạn làm việc.',
  'Nô Bộc': 'Bạn bè, đồng nghiệp, người dưới quyền và các mối quan hệ xã hội.',
  'Thiên Di': 'Con người bạn khi ra ngoài: đi xa, giao tiếp và cơ hội bên ngoài.',
  'Tật Ách': 'Sức khoẻ, bệnh tật và những tai ương cần đề phòng.',
  'Tài Bạch': 'Tiền bạc: cách kiếm, cách giữ và cách tiêu.',
  'Tử Tức': 'Con cái, người dưới và những gì bạn tạo ra.',
  'Phu Thê': 'Tình duyên, hôn nhân và người bạn đời.',
  'Huynh Đệ': 'Anh chị em ruột và những người thân như anh em.',
  ```

  Wire `quickCungLuan` with a `Readonly<Partial<Record<CungName, (chart: NatalChart) => ChapterBrief | null>>>` lookup.
- [ ] **Step 4: Run again.** Expected: PASS. Then `NX_WORKSPACE_ROOT_PATH=$PWD pnpm nx test shared-tu-vi`: all pass.
- [ ] **Step 5: Commit.** `feat(tu-vi): pick a quick thuận and nghịch claim per cung and define what each cung governs`

### Task 2: Night star tokens and the dark board

**Files:**

- Modify: `apps/frontend/src/design-system/tokens.css`, `apps/frontend/src/design-system/tokens.spec.ts`, `apps/frontend/src/features/la-so/chart-colors.ts`, `features/la-so/board-fit.ts` (`FULL_BOARD_MIN_WIDTH = 680`), `board-fit.spec.ts`, `components/cung-card.tsx`, `components/compact-cung-cell.tsx`, `components/cung-cell-content.tsx`, `components/thien-ban.tsx`, `components/la-so-board.tsx`
- Test: `components/la-so-board.spec.tsx`, `design-system/tokens.spec.ts`

**Interfaces:**

- Produces (in `chart-colors.ts`):
  - `CUNG_SURFACE_CLASS = { base: 'bg-night', spotlight: 'bg-gold/12' }`.
  - `CUNG_STATE_CLASS = { picked: 'inset-ring-2 inset-ring-gold shadow-glow-gold-strong', focused: 'inset-ring-2 inset-ring-dawn', related: 'inset-ring-1 inset-ring-gold/60' }`.
  - `CHART_RULE_CLASS = { border: 'border-gold/25', fill: 'bg-gold/25', blockLabel: 'bg-day text-night' }`.
  - `CHART_LINE_CLASS = { tamHop: 'stroke-gold drop-shadow-glow-gold', xungChieu: 'stroke-ember' }`.
  - `SAO_ON_NIGHT_CLASS: Readonly<Record<NguHanh, string>>` maps to `text-hanh-<x>-night`.
  - `SAO_ON_DAY_CLASS` is today's `SAO_ELEMENT_CLASS`, renamed. All board code uses the night map; Task 6 uses the day map.
- `tokens.css` adds: `--color-hanh-kim-night: #d6d0c4`, `--color-hanh-moc-night: #6fd69a`, `--color-hanh-thuy-night: #9fc2ff`, `--color-hanh-hoa-night: #ff9a8f`, `--color-hanh-tho-night: #e8b85c`.

- [ ] **Step 1: Write the failing tests.**
  - `tokens.spec.ts`:
    - Change the existing `hanh` filter to `name.startsWith('hanh-') && !name.endsWith('-night')`, so the light set still counts 5.
    - Add `const NIGHT_SPOTLIGHT_ALPHA = 0.12`.
    - `every night star colour passes AA on night and on its spotlight`: the 5 `-night` tokens are each ≥ 4.5 against `night` and against `compositeOver(token('gold'), NIGHT_SPOTLIGHT_ALPHA, token('night'))`.
    - `night board graphics stay visible`: `gold`, `ember` and `dawn` are each ≥ 3 on both night surfaces.
    - `board text reads on the night cells`: `dawn` and `day-soft` are ≥ 4.5 on both. `night` on `day` is ≥ 4.5, for the tags.
  - `la-so-board.spec.tsx` (keep `observeWidth(1024)`):
    - Update the existing colour assertions: `text-hanh-*` becomes `text-hanh-*-night`, `bg-gold/10` becomes `bg-gold/12`, `ring-ink` becomes `inset-ring-gold`, `bg-chart-block` becomes `bg-day`.
    - New case `lights the picked cung with the gold glow`: the `aria-pressed="true"` button has `shadow-glow-gold-strong`.
  - `board-fit.spec.ts`: `keeps star names at 10 px or more on screen`: `12 * boardScaleFor(FULL_BOARD_MIN_WIDTH) >= 10`. Also `uses the compact board under 680`: `boardVariantFor(679) === BoardVariant.Compact`.
- [ ] **Step 2: Run.** `NX_WORKSPACE_ROOT_PATH=$PWD pnpm nx test @org/frontend -- tokens la-so-board`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Swap the classes above.
  - In cell content: `text-ink` becomes `text-day-soft` (can chi, element, month, age), and `text-dusk` becomes `text-dawn` (cung name).
  - `ChiLabel`: `bg-night`, `text-day-soft`, or `text-dawn` when active.
  - `ThienBan`: `text-day` values with `text-day-soft` labels on `bg-night`.
  - The compact board's centre `Orbit` stays `text-gold/60`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): set the board on night with gold rules and night star colours`

### Task 3: Board density

**Files:**

- Create: `features/la-so/board-density.ts`, `features/la-so/use-board-density.ts`, `components/board-density-toggle.tsx`
- Modify: `components/la-so-board.tsx`
- Test: `board-density.spec.ts`, `use-board-density.spec.tsx`, `components/la-so-board.spec.tsx`

**Interfaces:**

- Produces:

  ```ts
  export enum BoardDensity { Key = 'gon', All = 'du' }
  export const KEY_PHU_TINH: ReadonlySet<PhuTinhName>;
  export function cungForDensity(cung: CungView, density: BoardDensity): CungView;
  export function useBoardDensity(): readonly [BoardDensity, (density: BoardDensity) => void];
  export const BOARD_DENSITY_STORAGE_KEY = 'la-so.board-density';
  export function BoardDensityToggle(props: { readonly value: BoardDensity; readonly onChange: (density: BoardDensity) => void }): ReactElement;
  ```

  - `KEY_PHU_TINH` holds: Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt, Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp, Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ, Lộc Tồn and Thiên Mã. Type it as `satisfies readonly PhuTinhName[]`, so a misspelt name fails typecheck.
  - `cungForDensity` filters `catTinh`, `hungTinh`, `luuTinh` and `daiVanTinh` by name for `Key`, and returns the cung unchanged for `All`.
  - The toggle is two buttons labelled `Gọn` and `Đủ sao`, with `aria-pressed`, inside `role="group"` with `aria-label="Mật độ lá số"`.
  - Row minimum: `FULL_BOARD_MIN_ROW_HEIGHT` becomes `{ [BoardDensity.All]: 258, [BoardDensity.Key]: 176 }`. Rows still grow (#201).

- [ ] **Step 1: Write the failing tests.**
  - `keeps chính tinh and key stars in Gọn`: for the sample chart's busiest cung (the most `catTinh` + `hungTinh`), every remaining star name is in `KEY_PHU_TINH`, and `chinhTinh` is unchanged.
  - `keeps every star in Đủ sao`: `cungForDensity(cung, BoardDensity.All)` is `cung`.
  - `starts in Gọn`, `remembers Đủ sao across renders` (it writes `'du'` to storage and reads it back), `falls back to Gọn on an unknown stored value` (with `'x'` stored), and `falls back to Gọn when storage throws` (with the `getItem` spy throwing). Storage is a browser boundary, so spying on it is allowed.
  - In `la-so-board.spec.tsx`: `hides a non-key phụ tinh in Gọn and shows it in Đủ sao`. Pick a star from the sample's Mệnh that is not in the key set; it is absent, then present after clicking `Đủ sao`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `useBoardDensity` reads in a lazy `useState` initialiser, wrapped in `try`. It validates against the `BoardDensity` values and writes in the setter, also in `try`.
  - The toggle renders above the full board, right-aligned. The compact board renders no toggle.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): show key stars by default with a remembered Đủ sao toggle`

### Task 4: Keyboard navigation on the board

**Files:**

- Create: `features/la-so/board-navigation.ts`
- Modify: `components/la-so-board.tsx`
- Test: `board-navigation.spec.ts`, `components/la-so-board.spec.tsx`

**Interfaces:**

- Produces:

  ```ts
  export enum BoardKey { Up = 'ArrowUp', Down = 'ArrowDown', Left = 'ArrowLeft', Right = 'ArrowRight' }
  export function cungIndexInDirection(from: number, key: BoardKey): number;
  export function ringNeighbour(from: number, step: 1 | -1): number;
  ```

  - `cungIndexInDirection` moves one grid step using `CUNG_GRID_POSITIONS`. It returns `from` when the target is the thiên bàn or off the grid.
  - `ringNeighbour` is `(from + step + 12) % 12`.

- [ ] **Step 1: Write the failing tests.**
  - `moves right along the top row`: Tị (5) → Ngọ (6).
  - `moves down the left column`: Tị (5) → Thìn (4).
  - `stays put when the next cell is the thiên bàn`: Mão (3) + Right → 3.
  - `stays put at the board edge`: Tị (5) + Up → 5.
  - `ring neighbours wrap`: `ringNeighbour(11, 1) === 0` and `ringNeighbour(0, -1) === 11`.
  - In the board spec: `arrow keys move focus between cung`. Focus Tị, press `ArrowRight`, and the Ngọ button has focus.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** `LaSoBoard` keeps `useRef<Map<number, HTMLButtonElement>>`. Both cell components accept a `buttonRef` callback. An `onKeyDown` on the board wrapper handles the four `BoardKey` values with `preventDefault` and focuses the target. Selection stays on Enter or Space (native button).
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): move between cung with the arrow keys`

### Task 5: Picked cung in the URL

**Files:**

- Create: `features/la-so/cung-slug.ts`
- Modify: `features/la-so/birth-input.ts` (`birthSearchSchema`), `pages/la-so-page.tsx`
- Test: `cung-slug.spec.ts`, `birth-input.spec.ts`, `pages/la-so-page.spec.tsx`

**Interfaces:**

- Produces:

  ```ts
  export const CUNG_SLUGS: Readonly<Record<CungName, string>>;
  export function cungNameFromSlug(slug: string | undefined): CungName | null;
  ```

  - The slugs are `menh`, `phu-mau`, `phuc-duc`, `dien-trach`, `quan-loc`, `no-boc`, `thien-di`, `tat-ach`, `tai-bach`, `tu-tuc`, `phu-the` and `huynh-de`.
  - `birthSearchSchema` gains `cung: z.string().optional().catch(undefined)`, so a bad value never throws.

- [ ] **Step 1: Write the failing tests.**
  - `round-trips every cung`.
  - `ignores an unknown slug`: `cungNameFromSlug('abc') === null`.
  - Page spec:
    - `picks the cung named in the URL`: `?…&cung=quan-loc` makes `Cung Quan Lộc` `aria-pressed="true"`.
    - `falls back to Mệnh on a bad slug`.
    - `writes the picked cung into the URL`: after clicking `Cung Tài Bạch`, `router.state.location.search.cung === 'tai-bach'`.
  - Replace the `Đang chọn cung` helper in the existing spec with `aria-pressed` checks. The line itself is removed in Task 8.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `LaSoPage` derives `selectedIndex` from `cungNameFromSlug(search.cung)`, falling back to Mệnh, and drops the `pickedIndex` state.
  - `onSelect` calls `navigate({ search: (prev) => ({ ...prev, cung: CUNG_SLUGS[name] }), replace: true, resetScroll: false })`.
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): keep the picked cung in the URL`

### Task 6: Cung facts and the detail panel

**Files:**

- Create: `features/la-so/cung-facts.ts`, `features/la-so/quick-luan.ts`, `features/la-so/use-quick-luan.ts`, `components/cung-panel.tsx`, `components/cung-panel-stars.tsx`, `components/quick-luan-section.tsx`
- Delete: `components/cung-detail.tsx`
- Test: `cung-facts.spec.ts`, `components/cung-panel.spec.tsx`

**Interfaces:**

- Consumes: `quickCungLuan` and `CUNG_Y_NGHIA` (Task 1), `SAO_ON_DAY_CLASS` (Task 2).
- Produces:

  ```ts
  export interface CungFacts {
    readonly cungName: CungName;
    readonly daiVan: { readonly from: number; readonly to: number };
    readonly tamHop: readonly [string, string];
    readonly xungChieu: string;
    readonly nhiHop: string;
    readonly anNgu: 'Tuần' | 'Triệt' | null;
    readonly muonTu: string | null;
  }
  export function cungFacts(chart: ChartView, index: number): CungFacts;
  export function quickLuanFor(birth: BirthInput, cung: CungName): QuickCungLuan | null;
  export function useQuickLuan(birth: BirthInput, cung: CungName): UseQueryResult<QuickCungLuan | null>;
  export const RATING_LABEL: Readonly<Record<Rating, string>>;
  export const CHAPTER_FOR_CUNG: Readonly<Partial<Record<CungName, string>>>;
  export interface CungPanelProps {
    readonly chart: ChartView;
    readonly index: number;
    readonly birth: BirthInput;
    readonly viewYear: number;
    readonly onReadChapter: (order: string) => void;
  }
  export function CungPanel(props: CungPanelProps): ReactElement;
  ```

  - `muonTu` is the xung chiếu cung's name when the cung is vô chính diệu, and `null` otherwise.
  - `quickLuanFor` calls `chartFromBirthInput(birth)` and then `quickCungLuan`.
  - `useQuickLuan` is `useQuery` with key `['quick-luan', birthKey(birth), cung]`, `staleTime: Infinity`, and `queryFn` doing `(await import('./quick-luan')).quickLuanFor(birth, cung)`. It is skipped (`enabled: false`) for cung outside `QUICK_LUAN_CUNG`.
  - `RATING_LABEL` is `{ M: 'Miếu', V: 'Vượng', Đ: 'Đắc', B: 'Bình', H: 'Hãm' }`.
  - `CHAPTER_FOR_CUNG` is `{ 'Mệnh': '02', 'Quan Lộc': '03', 'Tài Bạch': '04', 'Phu Thê': '05', 'Phụ Mẫu': '05', 'Tử Tức': '05' }`.

- [ ] **Step 1: Write the failing tests.**
  - `cung-facts.spec.ts`:
    - `names the tam hợp, xung chiếu and nhị hợp cung`: Mệnh at Dần in the sample has tam hợp Ngọ and Tuất, by their cung names.
    - `spans ten years of đại vận`: `to - from === 9`.
    - `names where a vô chính diệu cung borrows from`.
  - `cung-panel.spec.tsx`. Render inside `QueryClientProvider`; mock `./quick-luan` with `jest.mock` only in the "loading" case, otherwise use the real module.
    - `titles the panel with the cung and its chi`: heading level 2 `Cung Mệnh · Dần`.
    - `shows the fact chips`: the texts `Đại vận 5–14 tuổi`, `Tam hợp: …` and `Xung chiếu: …`.
    - `says what the cung governs`: `CUNG_Y_NGHIA['Mệnh']` is on screen.
    - `writes brightness in full`: `Thái Dương` shows `Vượng`, or whatever the sample's rating is.
    - `explains a vô chính diệu cung`: `Vô chính diệu` and `mượn từ cung` plus the xung chiếu name.
    - `shows one thuận and one nghịch claim with their stars`: after `findByText(result.thuan.y)`, there are exactly two `Vì sao:` lines.
    - `has no luận nhanh for Thiên Di`: `queryByText('Luận nhanh')` is null.
    - `links Quan Lộc to chapter 03`: clicking `Đọc luận giải chương Công danh Sự nghiệp` calls `onReadChapter('03')`.
    - `links Tử Tức to the Tình duyên Gia đạo chapter`: `onReadChapter('05')`.
    - `lists every phụ tinh in the panel even in Gọn`: every `catTinh` and `hungTinh` name of the busiest cung is present.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Section order and copy, exactly:
  1. h2 via `DisplayTitle as="h2" face={TitleFace.Serif} size={DisplaySize.Card}`: `Cung {name}`, with `· {chi}` in `text-ink-soft`. Then `THÂN` and `Tiểu hạn {viewYear}` tags (`bg-night text-day`, `text-2xs` bold).
  2. `Chip`s: `Đại vận {from}–{to} tuổi`, `Tam hợp: {a} · {b}`, `Xung chiếu: {x}`, `Nhị hợp: {n}`, and `{anNgu}` when set.
  3. `CUNG_Y_NGHIA[name]` as `text-reading`.
  4. `Chính tinh`. Each row: a `size-2 rounded-full` dot in `bg-current`, wrapped in the star's `SAO_ON_DAY_CLASS`, then the name, then `RATING_LABEL`. For vô chính diệu: `Vô chính diệu — mượn {names} từ cung {muonTu}`.
  5. `Luận nhanh`. Two rows, labelled `Nét thuận` and `Cần để ý`. Each is the claim's `y` with its first letter capitalised and a full stop added, followed by `Vì sao: {do joined by ', '}` in `text-ink-soft`. While loading, a two-line skeleton of the same height. Then the chapter link `Đọc luận giải chương {title}` when `CHAPTER_FOR_CUNG` has the cung.
  6. `Cát tinh`, `Hung tinh`, `Năm {viewYear}` (luuTinh with the `L.` prefix dropped) and `Đại vận` (daiVanTinh), each a wrap of small `Chip`s in `SAO_ON_DAY_CLASS`. Empty groups are omitted.

  Each section gets an `h3` (`text-sm font-bold uppercase tracking-wide text-ink-soft`).
- [ ] **Step 4: Run again.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): explain the picked cung in a detail panel with a quick reading`

### Task 7: Hero with the name and the painting

**Files:**

- Modify: `components/la-so-hero.tsx`, `src/config/media.ts`, `docs/redesign/illustration-guide.md`
- Add (already in the worktree, untracked): `apps/frontend/public/la-so/hero-night-768.webp`, `hero-night-1536.webp`
- Test: `components/la-so-hero.spec.tsx`

**Interfaces:**

- Produces: `MEDIA.laSo.heroNight: PagePainting`, and a `LaSoHero` prop `fullName: string`.

- [ ] **Step 1: Write the failing tests.**
  - `names the chart owner in the title`: with `fullName="Nguyễn Văn A"`, the h1 has accessible name `Lá số của Nguyễn Văn A`.
  - `keeps the generic title without a name`: with `''`, the h1 is `Lá Số Tử Vi`.
  - `paints the hero from md up`: an `img` with `loading="lazy"` and `srcset` containing `hero-night-768.webp 768w`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** Pass `painting={MEDIA.laSo.heroNight}`. The title is `<>Lá số của <Emphasis>{fullName}</Emphasis></>` when `fullName.trim()` is non-empty. In `illustration-guide.md`:
  - add the L1 row to the scene lines: "A clear starry night for the header of a page that shows a person's star chart. In the right third of the sky, a large faint circle of twelve small gold star points joined by thin gold lines, like a celestial wheel, partly fading into the sky. Low dark blue mountain ridges with a thin sea of mist fill the bottom fifth. Keep the left 60 percent of the sky dark, smooth and low in detail, so white headline text stays readable there." (reference: `story/night-1536.webp`);
  - add "L1 (variant 1) is 47 KB / 13 KB" to "Shipped so far".
- [ ] **Step 4: Run again.** Expected: PASS. Update the page spec's `findByRole('heading', { level: 1, name: 'Lá Số Tử Vi' })`: the sample URL has no `fullName`, so it stays valid. Confirm.
- [ ] **Step 5: Commit.** `feat(la-so): name the chart in the hero and paint it with the celestial wheel`

### Task 8: Workspace layout and the bottom sheet

**Files:**

- Create: `src/hooks/use-media-query.ts`, `components/la-so-workspace.tsx`, `components/cung-sheet.tsx`
- Modify: `pages/la-so-page.tsx`, `components/la-so-board.tsx` (drop `CungDetail` from the compact board), `components/luan-giai-section.tsx` (`id="luan-giai"`, `tabIndex={-1}` on the h2 wrapper)
- Test: `use-media-query.spec.ts`, `components/la-so-workspace.spec.tsx`, `pages/la-so-page.spec.tsx`

**Interfaces:**

- Consumes: `CungPanel` (Task 6), `ringNeighbour` (Task 4).
- Produces:

  ```ts
  export const DESKTOP_WORKSPACE_QUERY = '(min-width: 80rem)';
  export function useMediaQuery(query: string): boolean;
  export interface LaSoWorkspaceProps {
    readonly chart: ChartView;
    readonly birth: BirthInput;
    readonly viewYear: number;
    readonly selectedIndex: number;
    readonly onSelect: (index: number) => void;
    readonly onReadChapter: (order: string) => void;
  }
  export function LaSoWorkspace(props: LaSoWorkspaceProps): ReactElement;
  export function CungSheet(props: { readonly open: boolean; readonly onOpenChange: (open: boolean) => void; readonly onStep: (step: 1 | -1) => void; readonly children: ReactNode; readonly title: string }): ReactElement;
  ```

  - `useMediaQuery` uses `useSyncExternalStore` over `matchMedia`, and returns `false` when `matchMedia` is missing.
  - Desktop markup: `section.bg-night > div.mx-auto.max-w-7xl.px-4.py-8.md:px-6 > div.grid.gap-8.xl:grid-cols-[minmax(0,1fr)_26rem]`. The panel wrapper is `sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-gold/40 bg-day p-6 text-ink shadow-glow-gold`. Check whether `top-20` matches the header height in `site-header`; use the header's own height token if one exists. `calc` inside a class is allowed by the guard only if other D3 files already use it. If not, add a `--spacing-workspace-panel-max` token in `tokens.css` instead.
  - Sheet: Radix `Dialog.Root`, with an overlay of `fixed inset-0 z-50 bg-night/60`. The content is `fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-day p-6 text-ink`, using the same `max-h` token rule as above. The slide reuses `data-[state=open]:animate-modal-in` only if it is transform-only; otherwise add a `sheet-in` keyframe (translateY) in `styles.css`, beside the existing modal keyframes and under the same reduced-motion rule.
  - The sheet header holds `Dialog.Title` (`Cung {name}`), two icon buttons `aria-label="Cung trước"` / `"Cung sau"` that call `onStep`, and `Dialog.Close` with `aria-label="Đóng"`.
  - `onCloseAutoFocus` focuses the picked cung's button. Pass a `focusCung(index)` from `LaSoBoard` through a `ref` handle (`useImperativeHandle`), or reuse Task 4's button map exposed by `LaSoBoard`.

- [ ] **Step 1: Write the failing tests.** Stub `window.matchMedia` per test, since it is a browser boundary.
  - `shows the panel beside the board on desktop`: with the query true, `CungPanel`'s h2 is visible without any click, and there is no `role="dialog"`.
  - `opens the sheet only after a tap below desktop`: with the query false, there is no dialog at first. After clicking `Cung Quan Lộc`, a `role="dialog"` named `Cung Quan Lộc` appears.
  - `steps to the next cung in the sheet`: clicking `Cung sau` makes the dialog title `Cung` + the ring neighbour's name, and `onSelect` is called with `ringNeighbour(i, 1)`.
  - `returns focus to the cung after closing`: after `Đóng`, `document.activeElement` is the `Cung Quan Lộc` button.
  - `closes the sheet when the screen grows to desktop`: flip the stub and fire its `change` listener. The dialog is gone, and the side panel shows `Cung Quan Lộc`.
  - Page spec:
    - `drops the picked-cung line`: `queryByText(/Đang chọn cung/)` is null.
    - `reading a chapter from the panel selects it and moves focus to luận giải`: on desktop, pick Quan Lộc, then click `Đọc luận giải chương Công danh Sự nghiệp`. Tab `03` is selected and focus is inside `#luan-giai`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - `LaSoPage` renders `LaSoHero`, then `LaSoWorkspace`, then `LuanGiaiSection`.
  - `onReadChapter`: close the sheet, `setActiveChapter(order)`, then `document.getElementById('luan-giai')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })` and focus the h2 wrapper. Use `usePrefersReducedMotion`.
  - The sheet's open state lives in `LaSoWorkspace`. An effect closes it when `useMediaQuery` turns true.
- [ ] **Step 4: Run again.** Expected: PASS. Then run the whole `@org/frontend` test target: PASS.
- [ ] **Step 5: Commit.** `feat(la-so): lay the chart out as a workspace with a side panel and a phone sheet`

### Task 9: Verify, measure, ship

- [ ] **Step 1: Gate.** `NX_WORKSPACE_ROOT_PATH=$PWD pnpm nx affected -t lint typecheck test`. Expected: all green.
- [ ] **Step 2: Bundle check.** Run `pnpm nx build @org/frontend`, then `grep -l "BANG_QUAN_LOC\|gánh việc chung" dist/apps/frontend/assets/*.js`.
  - Expected: the matches are only in a chunk separate from the one that `la-so.detail` loads first. Find it via the route's `import()` in the build manifest, or by loading the page with network capture and confirming the chunk arrives after the panel renders.
- [ ] **Step 3: Screenshots.** Use Playwright from the scratchpad against `vite preview` of the B build, on the sample chart and on a vô chính diệu Mệnh chart. Capture:
  - 320, 390, 768, 1024, 1280 and 1440 wide, at 900 high;
  - with the sheet open at 390 and 1024;
  - `Gọn` and `Đủ sao` at 1440.

  Check:
  - no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`);
  - the busiest cung is not clipped;
  - the sheet clears the mobile nav and the home indicator;
  - at 1440×900 the `Gọn` board's last row is visible after scrolling at most the hero height;
  - at 680, 1024 and 1280 no star name renders under 10 px: `getComputedStyle` font size × the board's `zoom`.
- [ ] **Step 4: Lighthouse A/B.** 5 runs each, on the A and B builds served locally. B Performance must be ≥ A − 2, with Accessibility 100 and CLS 0, and the LCP element must not be the painting.
- [ ] **Step 5: Hand off.** Report the decisions, screenshots and numbers to Kim An. Wait for "tạo pull" before branching, pushing or opening a PR.
- [ ] **Step 6: After deploy.** 5 production Lighthouse runs on the Task 0 URL. Record them next to the baseline. The median must be ≥ the baseline.
