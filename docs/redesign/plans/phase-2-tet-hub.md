# Phase 2 — Tết 2027 hub: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship "Tử vi 2027 theo tuổi" under Kiến thức: 1 hub, 12 con giáp pages and 61 birth-year pages (1950–2010, nam and nữ on one page), each built from engine facts and AI prose generated once, prerendered, and live by 2026-12-01.

**Architecture:**

- **Facts:** pure functions in `@org/shared-tu-vi` (`src/tuoi-nam/`) compute every fact from the birth lunar year and the view year. The frontend calls them at render time for the summary, so facts never drift from the prose.
- **Prose:** a developer-run backend script builds a year-level brief and asks the AI through the existing `AiClient` port and the luận giải retry loop. Each output is checked by new validators and a similarity gate, then written as one JSON file per page into the frontend, with a manifest.
- **Pages:** new TanStack routes under `/kien-thuc/tu-vi-2027` lazy-load their own JSON. The manifest feeds `getSeoRoutes()`, so every page is in the sitemap and prerendered.

**Tech Stack:** TypeScript, Jest (backend, shared packages, frontend), NestJS application context for the script, React + TanStack Router file routes, Vite `import.meta.glob`, Playwright prerender.

**Spec:** [docs/redesign/tet-2027-hub-design.md](../tet-2027-hub-design.md)

## Global Constraints

- No code comments anywhere: TS, YAML, shell, JSON fixtures (project `CLAUDE.md`). Sources for folk tables go in commit bodies and in the "Cách chúng tôi tính" copy.
- No `any`; explicit param and return types; `SCREAMING_SNAKE_CASE` module constants; string enums for closed sets; named `Error` subclasses.
- View year `2027` (Đinh Mùi, nạp âm Thiên Hà Thủy). Birth years `1950`–`2010` inclusive (61 pages).
- Paths: hub `/kien-thuc/tu-vi-2027`, con giáp `/kien-thuc/tu-vi-2027/tuoi-{chi}`, birth year `/kien-thuc/tu-vi-2027/tuoi-{can}-{chi}-{năm}`. Slugs are lower-case ASCII (đ → d), hyphenated.
- Tuổi is tuổi mụ (`ageInYear`). The birth year is a lunar year.
- Title, verbatim template: `Tử vi tuổi {Can Chi} {năm} năm 2027: sao chiếu mệnh, hạn, Tam tai (nam & nữ)`.
- CTA copy, verbatim: `Tuổi chỉ cho biết nét chung. Nhập ngày giờ sinh để xem vận hạn 2027 theo lá số của riêng bạn.` The CTA never pre-fills the birth year; it sets `viewYear=2027` and, inside a gender subsection, `gender`.
- No AI call at request time. Each page loads only its own JSON; no article lands in the shared bundle.
- Chapter 06 and `/van-han` behaviour unchanged. Existing public URLs unchanged.
- UI tasks (10–12) use the Phase 1 primitives from `@/design-system` (`PageHero`, `Panel`, `RibbonTitle`, `Chip`, `CtaButton`, `Tile`, `ReadingZone`). If Phase 1 has not merged by 2026-11-26, build them on the current components and swap later (design.md rule); the facts, content and routes do not change.
- Gate before declaring a task done: `pnpm nx affected -t lint typecheck test`.
- **One branch, one merge.** Merging into `dev` deploys to production, so every task commits to `feat/tet-2027-hub` (cut from `dev`) and nothing merges until Task 13, after Kim An has reviewed the content. Test fixtures never live in `apps/frontend/src/features/tet-hub/content/`; that folder holds reviewed content only.

## Review Focus

1. **Same can chi, sixty years apart** (1950 and 2010 are both Canh Dần): slugs must differ and the pages must not read alike. Pinned in Task 4 (slug uniqueness) and Task 8 (similarity gate counts them as neighbours).
2. **Lunar-year facts** for a birth year: the 1986 page is Bính Dần, 42 tuổi in 2027, whatever month people were born in. Pinned in Task 4.
3. **The AI swaps nam and nữ facts** (writes the nữ sao inside the nam subsection). Pinned in Task 6.
4. **An unknown slug** under `/kien-thuc/tu-vi-2027/` renders the not-found state with `noindex`, never a crash. Pinned in Task 10.
5. **A route collision**: no Kiến thức article slug equals `tu-vi-2027`, and `getSeoRoutes()` has no duplicates. Pinned in Task 12.

---

### Task 1: Chi relations — phạm Thái tuế and tuổi xông đất

**Files:**

- Create: `packages/shared/tu-vi/src/tuoi-nam/thai-tue.ts`, `packages/shared/tu-vi/src/tuoi-nam/xong-dat.ts`
- Modify: `packages/shared/tu-vi/src/index.ts` (export both)
- Test: `packages/shared/tu-vi/src/tuoi-nam/thai-tue.spec.ts`, `packages/shared/tu-vi/src/tuoi-nam/xong-dat.spec.ts`

**Interfaces:**

- Produces:
  - `enum ThaiTueRelation { Truc = 'trực', Xung = 'xung', Hinh = 'hình', Hai = 'hại', Pha = 'phá' }`
  - `phamThaiTue(birthChi: number, viewYearChi: number): readonly ThaiTueRelation[]`, in enum order, empty when none. Chi index 0 = Tý.
  - `interface XongDat { readonly hop: readonly number[]; readonly tranh: readonly number[] }` (chi indexes, ascending)
  - `tuoiXongDat(houseChi: number, viewYearChi: number): XongDat`
- Tables (standard): lục xung = +6; tam hình Dần–Tỵ–Thân, Sửu–Tuất–Mùi, Tý–Mão, tự hình Thìn, Ngọ, Dậu, Hợi; lục hại Tý–Mùi, Sửu–Ngọ, Dần–Tỵ, Mão–Thìn, Thân–Hợi, Dậu–Tuất; lục phá Tý–Dậu, Sửu–Thìn, Dần–Hợi, Mão–Ngọ, Tỵ–Thân, Mùi–Tuất.
- Xông đất rule: `tranh` = chi that xung, hình or hại the house chi. `hop` = tam hợp (`tamHopIndexes`) and lục hợp (`nhiHopIndex`) of the house chi, minus `tranh`, minus any chi that xung, hình or hại the view year.

- [ ] **Step 1: Write the failing tests**

```ts
it.each([
  [7, [ThaiTueRelation.Truc]],
  [1, [ThaiTueRelation.Xung, ThaiTueRelation.Hinh]],
  [10, [ThaiTueRelation.Hinh, ThaiTueRelation.Pha]],
  [0, [ThaiTueRelation.Hai]],
  [2, []],
])('birth chi %i against Mùi 2027', (birthChi, expected) =>
  expect(phamThaiTue(birthChi, 7)).toEqual(expected),
);

it('a self-punishing chi in its own year is both trực and hình', () =>
  expect(phamThaiTue(4, 4)).toEqual([ThaiTueRelation.Truc, ThaiTueRelation.Hinh]));

it('Tý and Mão punish each other without breaking', () =>
  expect(phamThaiTue(3, 0)).toEqual([ThaiTueRelation.Hinh]));

it('picks first-footers for a Dần house in a Mùi year', () =>
  expect(tuoiXongDat(2, 7)).toEqual({ hop: [6, 11], tranh: [5, 8] }));
```

- [ ] **Step 2: Run** `pnpm nx test shared-tu-vi --testPathPatterns='thai-tue|xong-dat'`. Expected: FAIL, modules missing.
- [ ] **Step 3: Implement both files** from the tables above.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(tu-vi): compute phạm Thái tuế and tuổi xông đất`. Body names the tables' source.

---

### Task 2: Year-level folk facts — Tam tai year, Kim lâu kind, Hoang ốc, mệnh vs năm, life stage

**Files:**

- Create: `packages/shared/tu-vi/src/tuoi-nam/kim-lau.ts`, `hoang-oc.ts`, `menh-voi-nam.ts`, `giai-doan-tuoi.ts`
- Modify: `packages/shared/tu-vi/src/dan-gian.ts` (add `tamTaiNamThu`), `packages/shared/tu-vi/src/index.ts`
- Create: `packages/shared/tu-vi/src/tuoi-nam/hoang-oc.fixture.ts` (sourced reference values)
- Test: one `*.spec.ts` beside each new file, plus `dan-gian.spec.ts`

**Interfaces:**

- Produces:
  - `tamTaiNamThu(birthYearChi: number, viewYearChi: number): 1 | 2 | 3 | null` in `dan-gian.ts`, reusing `TAM_TAI_FIRST_CHI_BY_GROUP`; `isTamTai` becomes `tamTaiNamThu(...) !== null`.
  - `enum KimLau { Than = 'thân', The = 'thê', Tu = 'tử', LucSuc = 'lục súc' }`, `kimLau(tuoi: number): KimLau | null`. Remainders of `tuoi % 9`: 1 → Thân, 3 → Thê, 6 → Tử, 8 → Lục súc. `isKimLau` stays and agrees.
  - `enum HoangOc { NhatCat = 'Nhất Cát', NhiNghi = 'Nhì Nghi', TamDiaSat = 'Tam Địa Sát', TuTanTai = 'Tứ Tấn Tài', NguThoTu = 'Ngũ Thọ Tử', LucHoangOc = 'Lục Hoang Ốc' }`, `hoangOc(tuoi: number): HoangOc`, `isHoangOcTot(cung: HoangOc): boolean` (true for Nhất Cát, Nhì Nghi, Tứ Tấn Tài).
  - `HOANG_OC_TRUYEN_THONG: string`: one Vietnamese sentence naming the tradition the fixture follows, shown to readers in Task 10's "Cách chúng tôi tính".
  - `enum MenhVoiNam { BinhHoa = 'bình hòa', NamSinhMenh = 'năm sinh mệnh', MenhSinhNam = 'mệnh sinh năm', NamKhacMenh = 'năm khắc mệnh', MenhKhacNam = 'mệnh khắc năm' }`, `menhVoiNam(menh: NguHanh, nam: NguHanh): MenhVoiNam`, derived from `theSinhKhac`.
  - `enum GiaiDoanTuoi { LapNghiep = 'lập nghiệp', XayDung = 'xây dựng', TrungNien = 'trung niên', VeHuu = 'về hưu', TuoiGia = 'tuổi già' }`, `giaiDoanTuoi(tuoi: number): GiaiDoanTuoi`. Bands: ≤ 30, 31–45, 46–60, 61–75, ≥ 76.

- [ ] **Step 1: Collect Hoang ốc reference values.** From two widely read Vietnamese sites, record the cung for tuổi 18, 25, 33, 42, 47, 50, 56, 61, 64, 70, 73, 78 in `hoang-oc.fixture.ts` as `{ tuoi, cung, source }` entries. Where the two sources disagree, keep the majority tradition and say so in the commit body. Done when the fixture covers all six cung.
- [ ] **Step 2: Write the failing tests**

```ts
it.each([
  [3, 7, 3],
  [2, 7, null],
  [11, 5, 1],
  [0, 7, null],
])('tam tai year for birth chi %i in view chi %i', (b, v, n) => expect(tamTaiNamThu(b, v)).toBe(n));
it.each([
  [37, KimLau.Than],
  [39, KimLau.The],
  [42, KimLau.Tu],
  [44, KimLau.LucSuc],
  [40, null],
])('kim lâu at %i', (tuoi, kind) => expect(kimLau(tuoi)).toBe(kind));
it.each(HOANG_OC_FIXTURE)('hoang ốc at $tuoi follows $source', ({ tuoi, cung }) =>
  expect(hoangOc(tuoi)).toBe(cung),
);
it('Thiên Hà Thủy overcomes Lư Trung Hỏa', () =>
  expect(menhVoiNam('Hỏa', 'Thủy')).toBe(MenhVoiNam.NamKhacMenh));
it.each([
  [30, GiaiDoanTuoi.LapNghiep],
  [31, GiaiDoanTuoi.XayDung],
  [45, GiaiDoanTuoi.XayDung],
  [46, GiaiDoanTuoi.TrungNien],
  [61, GiaiDoanTuoi.VeHuu],
  [76, GiaiDoanTuoi.TuoiGia],
])('life stage at %i', (tuoi, stage) => expect(giaiDoanTuoi(tuoi)).toBe(stage));
```

- [ ] **Step 3: Run** `pnpm nx test shared-tu-vi --testPathPatterns='dan-gian|kim-lau|hoang-oc|menh-voi-nam|giai-doan'`. Expected: FAIL on the new cases only.
- [ ] **Step 4: Implement.** Hoang ốc candidate: decades start at Nhất Cát for 10 and advance one cung per decade, then count the units digit forward, wrapping every six. Keep it only if it matches the fixture; otherwise implement the fixture tradition's rule.
- [ ] **Step 5: Run the same command.** Expected: PASS, existing `isTamTai`/`isKimLau` cases included.
- [ ] **Step 6: Commit** `feat(tu-vi): add Tam tai year, Kim lâu kind, Hoang ốc and life stage`.

---

### Task 3: Bát hạn

**Files:**

- Create: `packages/shared/tu-vi/src/tuoi-nam/bat-han.ts`, `bat-han.fixture.ts`
- Modify: `packages/shared/tu-vi/src/index.ts`
- Test: `packages/shared/tu-vi/src/tuoi-nam/bat-han.spec.ts`

**Interfaces:**

- Produces: `BAT_HAN = ['Huỳnh Tuyền', 'Tam Kheo', 'Ngũ Mộ', 'Thiên Tinh', 'Tán Tận', 'Thiên La', 'Địa Võng', 'Diêm Vương'] as const`, `type BatHan = (typeof BAT_HAN)[number]`, `batHan(tuoi: number, gender: Gender): BatHan`. `Gender` from `van-han.ts`. Also `BAT_HAN_TRUYEN_THONG: string`, one Vietnamese sentence naming the chosen tradition, shown in Task 10's "Cách chúng tôi tính".

- [ ] **Step 1: Collect reference values.** From two widely read sites, record hạn for nam and nữ at 18 ages from 18 to 78 in `bat-han.fixture.ts` (`{ tuoi, gender, han, source }`), covering all eight hạn for each gender. Pick the majority tradition and say which in the commit body.
- [ ] **Step 2: Write the failing test** `it.each(BAT_HAN_FIXTURE)('hạn at $tuoi for $gender', …)` asserting `batHan(tuoi, gender)` equals `han`, plus one test that every value `batHan` returns for tuổi 1–100 is a member of `BAT_HAN`.
- [ ] **Step 3: Run** `pnpm nx test shared-tu-vi --testPathPatterns=bat-han`. Expected: FAIL.
- [ ] **Step 4: Implement** as a per-gender lookup the way `saoChieuMenh` is built, matching the fixture tradition.
- [ ] **Step 5: Run the same command.** Expected: PASS.
- [ ] **Step 6: Commit** `feat(tu-vi): compute Bát hạn by age and gender`.

---

### Task 4: Page facts and slugs

**Files:**

- Create: `packages/shared/tu-vi/src/tuoi-nam/tuoi-nam-facts.ts`, `tuoi-nam-slug.ts`
- Modify: `packages/shared/tu-vi/src/index.ts`
- Test: `tuoi-nam-facts.spec.ts`, `tuoi-nam-slug.spec.ts`

**Interfaces:**

- Consumes: Tasks 1–3, `getYearPillar`, `getYearCanChi`, `getNapAm`, `viewYearPillar`, `ageInYear`, `saoChieuMenh`.
- Produces:
  - `TET_HUB_VIEW_YEAR = 2027`, `TUOI_NAM_FIRST_BIRTH_YEAR = 1950`, `TUOI_NAM_LAST_BIRTH_YEAR = 2010`, `tuoiNamBirthYears(): readonly number[]`
  - `interface TuoiNamGenderFacts { readonly sao: CuuDieu; readonly han: BatHan }`
  - `interface TuoiNamFacts { readonly birthYear: number; readonly viewYear: number; readonly canChi: string; readonly chi: number; readonly tuoi: number; readonly menh: NapAm; readonly menhNam: NapAm; readonly menhVoiNam: MenhVoiNam; readonly tamTai: 1 | 2 | 3 | null; readonly thaiTue: readonly ThaiTueRelation[]; readonly kimLau: KimLau | null; readonly hoangOc: HoangOc; readonly xongDat: XongDat; readonly giaiDoan: GiaiDoanTuoi; readonly nam: TuoiNamGenderFacts; readonly nu: TuoiNamGenderFacts }`
  - `tuoiNamFacts(birthYear: number, viewYear: number): TuoiNamFacts`
  - `tuoiNamSlug(birthYear: number): string`, `conGiapSlug(chi: number): string`, `findTuoiNamBySlug(slug: string): number | undefined`, `findConGiapBySlug(slug: string): number | undefined`

- [ ] **Step 1: Write the failing tests**

```ts
it('describes Bính Dần 1986 in 2027', () =>
  expect(tuoiNamFacts(1986, 2027)).toMatchObject({
    canChi: 'Bính Dần',
    chi: 2,
    tuoi: 42,
    menh: { name: 'Lư Trung Hỏa' },
    menhNam: { name: 'Thiên Hà Thủy' },
    menhVoiNam: MenhVoiNam.NamKhacMenh,
    tamTai: null,
    thaiTue: [],
    kimLau: KimLau.Tu,
    giaiDoan: GiaiDoanTuoi.XayDung,
    nam: { sao: 'Vân Hớn' },
    nu: { sao: 'La Hầu' },
  }));
it('names pages by can chi and year', () => {
  expect(tuoiNamSlug(1986)).toBe('tuoi-binh-dan-1986');
  expect(tuoiNamSlug(1950)).toBe('tuoi-canh-dan-1950');
  expect(tuoiNamSlug(2010)).toBe('tuoi-canh-dan-2010');
  expect(conGiapSlug(2)).toBe('tuoi-dan');
});
it('gives every birth year in range its own slug', () => {
  const slugs = tuoiNamBirthYears().map(tuoiNamSlug);
  expect(slugs).toHaveLength(61);
  expect(new Set(slugs).size).toBe(61);
});
it('reads a slug back to its birth year and rejects strangers', () => {
  expect(findTuoiNamBySlug('tuoi-binh-dan-1986')).toBe(1986);
  expect(findTuoiNamBySlug('tuoi-binh-dan-1987')).toBeUndefined();
  expect(findConGiapBySlug('tuoi-dan')).toBe(2);
});
```

- [ ] **Step 2: Run** `pnpm nx test shared-tu-vi --testPathPatterns=tuoi-nam`. Expected: FAIL.
- [ ] **Step 3: Implement.** The slug strips diacritics with `normalize('NFD')`, maps `đ` to `d` and joins with `-`.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(tu-vi): assemble the facts and slugs for a Tết hub page`.

---

### Task 5: Content contracts and a reusable retry loop

**Files:**

- Create: `packages/shared/contracts/src/tuoi-nam.ts`; modify `packages/shared/contracts/src/index.ts`
- Modify: `apps/backend/src/api/luan-giai/generation/sinh-voi-kiem.ts` and its callers in `generation/chapter-generator.ts`
- Test: `apps/backend/src/api/luan-giai/generation/sinh-voi-kiem.spec.ts` (create if absent)

**Interfaces:**

- Produces in `@org/shared-contracts`:
  - `interface TuoiNamFaq { readonly question: string; readonly answer: string }`
  - `interface TuoiNamArticle { readonly slug: string; readonly birthYear: number; readonly viewYear: number; readonly tongQuan: readonly string[]; readonly saoHanNam: readonly string[]; readonly saoHanNu: readonly string[]; readonly menh: readonly string[]; readonly cuoiNha: readonly string[]; readonly loiKhuyen: readonly string[]; readonly faq: readonly TuoiNamFaq[]; readonly model: string; readonly generatedAt: string }`
  - `interface ConGiapArticle { readonly slug: string; readonly chi: number; readonly viewYear: number; readonly tongQuan: readonly string[]; readonly tamTai: readonly string[]; readonly thaiTue: readonly string[]; readonly xongDat: readonly string[]; readonly model: string; readonly generatedAt: string }`
  - `interface TetHubManifest { readonly viewYear: number; readonly conGiap: readonly string[]; readonly tuoiNam: readonly string[] }`
- Produces in the backend: `CachSinh<T>` loses `brief` and `toBai` and gains `readonly check: (value: T) => readonly string[]`. Luận giải callers pass `check: (value) => checkParagraphs(toBai(value), brief)`. `sinhVoiKiem` keeps its name, signature otherwise and errors.

- [ ] **Step 1: Write the failing test** `retries with the violations the check reports, then returns the first clean value`: a fake `AiClient` answers `"bad"` then `"good"`, `check` returns `['xấu']` for `"bad"` and `[]` for `"good"`. Assert the result value is `"good"`, `attempts` is 2, and the second request's last message contains `xấu`.
- [ ] **Step 2: Run** `pnpm nx test @org/backend --testPathPatterns=sinh-voi-kiem`. Expected: FAIL (`check` is not a field).
- [ ] **Step 3: Implement** the field change and update the luận giải call sites.
- [ ] **Step 4: Run** `pnpm nx test @org/backend --testPathPatterns='sinh-voi-kiem|luan-giai'`. Expected: PASS, including `luan-giai.characterization.spec.ts` unchanged.
- [ ] **Step 5: Commit** `refactor(luan-giai): let the retry loop take any check` and `feat(contracts): add Tết hub content types`.

---

### Task 6: Year-page brief, prompt and validators

**Files:**

- Create in `apps/backend/src/content-gen/tuoi-nam/`: `tuoi-nam.brief.ts`, `tuoi-nam.prompt.ts`, `tuoi-nam.schema.ts`, `check-tuoi-nam.ts`
- Test: `check-tuoi-nam.spec.ts`, `tuoi-nam.brief.spec.ts`

**Interfaces:**

- Consumes: `TuoiNamFacts` (Task 4), `TuoiNamArticle` (Task 5), `CUU_DIEU`, `BAT_HAN`, `CUU_DIEU_LOI`.
- Produces:
  - `interface TuoiNamBrief { readonly facts: TuoiNamFacts; readonly claims: readonly TuoiNamClaim[] }`, `interface TuoiNamClaim { readonly section: TuoiNamSection; readonly keyword: string }`, `enum TuoiNamSection { TongQuan = 'tongQuan', SaoHanNam = 'saoHanNam', SaoHanNu = 'saoHanNu', Menh = 'menh', CuoiNha = 'cuoiNha', LoiKhuyen = 'loiKhuyen' }`
  - `buildTuoiNamBrief(facts: TuoiNamFacts): TuoiNamBrief` — one claim per fact in its section: sao and hạn names in their gender section, the mệnh relation label in `menh`, the Kim lâu kind or its absence and the Hoang ốc cung in `cuoiNha`, the life stage in `tongQuan` and `loiKhuyen`.
  - `TUOI_NAM_SYSTEM_PROMPT: string`, `buildTuoiNamMessages(brief, daThu)`, `TUOI_NAM_SCHEMA: AiSchema`, `parseTuoiNamDraft(text: string): TuoiNamDraft` where `TuoiNamDraft` is `TuoiNamArticle` without `slug`, `birthYear`, `viewYear`, `model`, `generatedAt`.
  - `checkTuoiNam(draft: TuoiNamDraft, brief: TuoiNamBrief): readonly string[]` — Vietnamese violation messages, empty when clean.
- Prompt rules (in `TUOI_NAM_SYSTEM_PROMPT`): write only from the brief; calm, practical tone; no rituals for sale; 2–4 paragraphs per section; FAQ of 3–5 questions including "Nam {năm} năm 2027 sao gì chiếu mệnh?" and "Nữ {năm} năm 2027 gặp hạn gì?"; do not explain Tam tai, Thái tuế or xông đất (the page links to the con giáp page for those).

- [ ] **Step 1: Write the failing tests** in `check-tuoi-nam.spec.ts`, each building a draft from a clean fixture and breaking one thing:
  - `accepts a draft that states every claim in its section` → `[]`.
  - `rejects a star the brief did not compute` (a section names `Kế Đô` when neither gender has it) → one violation naming `Kế Đô`.
  - `rejects the nữ sao inside the nam subsection` (`saoHanNam` names `La Hầu` for 1986) → one violation.
  - `rejects a missing claim` (`cuoiNha` omits the Hoang ốc cung) → one violation naming the cung.
  - `rejects fear and sales language` (`loiKhuyen` contains `đại họa` or `phải cúng`) → one violation per phrase; reuse the `LOI_DOA` list from `luan-giai/validate/check-forbidden-phrases.ts` by exporting it.
  - `rejects a section outside 2–4 paragraphs` and `rejects fewer than 3 FAQ entries`.
    And in `tuoi-nam.brief.spec.ts`: `puts each gender's sao and hạn in its own section` for 1986.
- [ ] **Step 2: Run** `pnpm nx test @org/backend --testPathPatterns=tuoi-nam`. Expected: FAIL.
- [ ] **Step 3: Implement** the four files. Star and hạn detection matches whole names from `CUU_DIEU` and `BAT_HAN` case-insensitively.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): brief, prompt and checks for Tết hub year pages`.

---

### Task 7: Generation script

**Files:**

- Create: `apps/backend/src/content-gen/tet-hub-gen.module.ts`, `apps/backend/src/content-gen/generate-tet-hub.ts`, `apps/backend/src/content-gen/tet-hub-writer.ts`, `apps/backend/src/content-gen/con-giap/` (brief, prompt, schema, check — same shape as Task 6, sections `tongQuan`, `tamTai`, `thaiTue`, `xongDat`)
- Modify: `apps/backend/package.json` (nx target `generate-tet-hub`)
- Test: `apps/backend/src/content-gen/tet-hub-writer.spec.ts`, `apps/backend/src/content-gen/con-giap/check-con-giap.spec.ts`

**Interfaces:**

- Consumes: Tasks 4–6, `AiClient`, `sinhVoiKiem`.
- Produces:
  - Output directory `apps/frontend/src/features/tet-hub/content/2027/`, one `{slug}.json` per page (`TuoiNamArticle` or `ConGiapArticle`) and `manifest.json` (`TetHubManifest`, slugs sorted).
  - `writeTetHubPage(dir: string, article: TuoiNamArticle | ConGiapArticle): Promise<void>` and `writeTetHubManifest(dir: string, manifest: TetHubManifest): Promise<void>`, writing pretty-printed JSON with a trailing newline.
  - `hub.json` (`{ "intro": string[] }`): a draft hub introduction from a short prompt describing the hub's scope, written only when the file does not exist yet (Kim An edits it by hand afterwards).
  - CLI: `pnpm nx run @org/backend:generate-tet-hub` generates every missing page; `-- --only=tuoi-binh-dan-1986` generates one page if it is missing; `-- --only=tuoi-binh-dan-1986 --force` regenerates that page over an existing file (`--force` alone is rejected, so hand-edited pages are never overwritten in bulk). Pages run one at a time with a 30 s pause between AI calls (the local key rate-limits parallel calls). Each page gets a 120 s budget.
  - The nx target has `dependsOn: ['^build']` (the script resolves `@org/shared-tu-vi` and `@org/shared-contracts` from their built `dist`) and runs `ts-node -P apps/backend/tsconfig.app.json apps/backend/src/content-gen/generate-tet-hub.ts`, which boots `NestFactory.createApplicationContext(TetHubGenModule)` with `ConfigModule`, `DatabaseModule` and `AiModule`.
- Con giáp prompt rules: the full write-up of Tam tai, Thái tuế and tuổi xông đất for the chi in 2027, from `tamTaiNamThu`, `phamThaiTue` and `tuoiXongDat`; the same tone and forbidden phrases.

- [ ] **Step 1: Write the failing tests:** `writes one JSON file per page and a sorted manifest` (temp dir; read back and compare), and the con giáp check cases mirroring Task 6 (unknown xông đất chi, missing Tam tai year claim, fear language).
- [ ] **Step 2: Run** `pnpm nx test @org/backend --testPathPatterns='tet-hub-writer|con-giap'`. Expected: FAIL.
- [ ] **Step 3: Implement** the module, writer, con giáp generation and CLI.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Smoke run** with Postgres and the local AI provider up: `pnpm nx run @org/backend:generate-tet-hub -- --only=tuoi-binh-dan-1986`. Expected: `apps/frontend/src/features/tet-hub/content/2027/tuoi-binh-dan-1986.json` exists and passes `checkTuoiNam`.
- [ ] **Step 6: Commit** `feat(content-gen): generate Tết hub pages into the frontend` (code only, not the smoke-run JSON).

---

### Task 8: Similarity gate

**Files:**

- Create: `apps/backend/src/content-gen/similarity.ts`
- Modify: `apps/backend/src/content-gen/generate-tet-hub.ts` (run the gate after a batch)
- Test: `apps/backend/src/content-gen/similarity.spec.ts`

**Interfaces:**

- Produces:
  - `shingleSimilarity(a: string, b: string, size?: number): number` — Jaccard over word shingles (default size 5), 0–1.
  - `tuoiNamNeighbours(birthYear: number): readonly number[]` — same chi in range, and ±1 year in range.
  - `findTooSimilar(articles: readonly TuoiNamArticle[], threshold: number): readonly { readonly a: string; readonly b: string; readonly score: number }[]`
  - `TUOI_NAM_SIMILARITY_THRESHOLD`, set after the first batch (start at `0.35`, tune in Task 13).
- The CLI exits non-zero and prints the pairs when `findTooSimilar` returns any.

- [ ] **Step 1: Write the failing tests:** identical texts score 1; disjoint texts score 0; `tuoiNamNeighbours(1986)` equals `[1950, 1962, 1974, 1985, 1987, 1998, 2010]`; `tuoiNamNeighbours(1950)` contains `2010` and `1951` and not `1949`; `findTooSimilar` reports a pair built from one paragraph repeated and ignores a pair of different texts.
- [ ] **Step 2: Run** `pnpm nx test @org/backend --testPathPatterns=similarity`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(content-gen): fail a Tết hub batch whose neighbours read alike`.

---

### Task 9: Birth form hand-off

**Files:**

- Modify: `apps/frontend/src/routes/_site/index.tsx` (add `validateSearch`), `apps/frontend/src/features/home/pages/home-page.tsx`, `apps/frontend/src/features/home/components/hero-section.tsx`, `apps/frontend/src/features/la-so/components/birth-form.tsx`
- Test: `apps/frontend/src/features/la-so/components/birth-form.spec.tsx` (create if absent)

**Interfaces:**

- Produces:
  - Home search schema `{ gender?: Gender; viewYear?: number }`, validated with the existing `MIN_VIEW_YEAR`/`MAX_VIEW_YEAR`. Invalid values are dropped, not errors.
  - `BirthForm({ initialGender, viewYear }: { readonly initialGender?: Gender; readonly viewYear?: number })`. `initialGender` seeds `gender`; `viewYear` is added to the `/la-so/detail` search on submit. Every other field still starts from `EMPTY_BIRTH_FORM`, the year included.

- [ ] **Step 1: Write the failing tests:** `starts on the gender it was given and leaves the year empty`; `opens the chart on the view year it was given` (submit a full form and assert the navigate call's `search.viewYear` is `2027`).
- [ ] **Step 2: Run** `pnpm nx test @org/frontend --testPathPatterns=birth-form`. Expected: FAIL.
- [ ] **Step 3: Implement** and thread the props from the home route through `HomePage` and `HeroSection`.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(la-so): let a link pre-set the gender and view year of the birth form`.

---

### Task 10: Birth-year page

**Files:**

- Create in `apps/frontend/src/features/tet-hub/`: `tet-hub-content.ts`, `components/TuoiNamSummary.tsx`, `components/TuoiNamArticleView.tsx`, `components/TuoiNamFaq.tsx`, `components/TuoiNamRelated.tsx`, `components/HowWeCount.tsx`, `pages/tuoi-nam-page.tsx`, `tuoi-nam-head.ts`
- Create: `apps/frontend/src/routes/_site/kien-thuc.tu-vi-2027.$slug.tsx`
- Test: `apps/frontend/src/features/tet-hub/pages/tuoi-nam-page.spec.tsx`, `apps/frontend/src/features/tet-hub/tuoi-nam-head.spec.ts`

**Interfaces:**

- Consumes: Task 4 facts and slugs, Task 5 contracts, Task 7 JSON, Task 9 `BirthForm` link params, Phase 1 primitives.
- Produces:
  - `loadTuoiNamArticle(slug: string): Promise<TuoiNamArticle | undefined>` and `loadConGiapArticle(slug: string): Promise<ConGiapArticle | undefined>` in `tet-hub-content.ts`, built on `import.meta.glob('./content/2027/*.json')` (lazy, one chunk per page).
  - `tuoiNamHead(facts: TuoiNamFacts, article: TuoiNamArticle)` returning the `seo()` result plus `Article`, `BreadcrumbList` and `FAQPage` JSON-LD via `jsonLdMeta`.
  - The `$slug` route resolves a birth-year slug (Task 4 `findTuoiNamBySlug`) to this page, a con giáp slug to Task 11's page, and anything else to the not-found state with `noindex`. Its `loader` loads the JSON and computes the facts; `head` reads `loaderData`, so the prerendered HTML carries the title and the FAQ JSON-LD.
  - `HowWeCount` copy states that tuổi âm is tuổi mụ, that the birth year is the lunar year so people born before Tết belong to the previous year, and shows `BAT_HAN_TRUYEN_THONG` and `HOANG_OC_TRUYEN_THONG`.
- Page order: breadcrumb `Kiến thức › Tử vi 2027 › Tuổi {Chi} › {Can Chi} {năm}`; `TuoiNamSummary` (tuổi âm, mệnh, Tam tai, Thái tuế, then Nam mạng and Nữ mạng rows with sao and hạn); article sections in the spec's order with anchors `#nam-mang` and `#nu-mang`; the fixed one-to-two-sentence Tam tai, Thái tuế and xông đất verdicts built from facts with a link to the con giáp page; the CTA (copy in Global Constraints) linking `/` with `{ viewYear: 2027 }` and hash `lap-la-so`, plus a gendered CTA inside each gender subsection; `HowWeCount`; `TuoiNamFaq`; `TuoiNamRelated` (±1, ±2 years in range, the con giáp page, the hub). On a phone the summary is first; from `lg` it sits sticky in a right column.

- [ ] **Step 1: Write the failing tests:**
  - `answers the query before the article` — for 1986, the summary shows `Bính Dần 1986`, `42`, `Lư Trung Hỏa`, `Vân Hớn` under Nam mạng and `La Hầu` under Nữ mạng, and it precedes the first article heading in document order.
  - `links the CTA to the form with the view year and no birth year` — parse the main CTA's `href` with `new URL(href, 'https://x')`: `searchParams.get('viewYear')` is `'2027'`, `searchParams.has('year')` is false, and the hash is `#lap-la-so`.
  - `shows the not-found state for an unknown slug` (`tuoi-binh-dan-1987`) with a `robots` `noindex` meta.
  - In `tuoi-nam-head.spec.ts`: the title equals `Tử vi tuổi Bính Dần 1986 năm 2027: sao chiếu mệnh, hạn, Tam tai (nam & nữ) | Tử Vi Miễn Phí`; the canonical is `https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-binh-dan-1986`; a `FAQPage` entry has one `Question` per FAQ item.
- [ ] **Step 2: Run** `pnpm nx test @org/frontend --testPathPatterns='tuoi-nam'`. Expected: FAIL.
- [ ] **Step 3: Implement.** Tests read a fixture at `apps/frontend/src/features/tet-hub/__fixtures__/tuoi-binh-dan-1986.json` (the Task 7 smoke output is fine), injected through the loader, never from `content/`.
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(tet-hub): birth-year page`.

---

### Task 11: Con giáp page and hub

**Files:**

- Create: `apps/frontend/src/features/tet-hub/pages/con-giap-page.tsx`, `pages/tet-hub-page.tsx`, `content/2027/hub.json`, `apps/frontend/src/routes/_site/kien-thuc.tu-vi-2027.index.tsx`
- Test: `apps/frontend/src/features/tet-hub/pages/con-giap-page.spec.tsx`, `pages/tet-hub-page.spec.tsx`

**Interfaces:**

- Consumes: Tasks 4, 5, 7, 10 (`$slug` route dispatch, `tet-hub-content.ts`).
- Produces:
  - `hub.json` shape `{ "intro": string[] }`, drafted by Task 7's script and edited by Kim An in Task 13.
  - Heads: both pages use `seo()` with `Article` and `BreadcrumbList` JSON-LD. Con giáp title: `Tử vi tuổi {Chi} năm 2027: Tam tai, Thái tuế, tuổi xông đất`; hub title: `Tử vi 2027 theo tuổi: sao chiếu mệnh, hạn, Tam tai cho 12 con giáp`.
  - Con giáp page: the `ConGiapArticle` sections plus a `Tile` per birth year of that chi in range, each linking to its page with its Nam/Nữ sao chips.
  - Hub: the intro, 12 con giáp tiles, and links to `/van-han` and the birth form.

- [ ] **Step 1: Write the failing tests:** `lists every Dần year in range` (1950, 1962, 1974, 1986, 1998, 2010 link to their slugs); `the hub links all twelve con giáp`; `the con giáp head is canonical to its own path` (`/kien-thuc/tu-vi-2027/tuoi-dan`).
- [ ] **Step 2: Run** `pnpm nx test @org/frontend --testPathPatterns='con-giap-page|tet-hub-page'`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run the same command.** Expected: PASS.
- [ ] **Step 5: Commit** `feat(tet-hub): con giáp pages and the hub`.

---

### Task 12: SEO routes, internal links and preview listing

**Files:**

- Modify: `apps/frontend/tools/seo-routes.mjs`, `apps/frontend/src/features/kien-thuc/pages/kien-thuc-page.tsx`, `apps/frontend/src/features/home/pages/home-page.tsx`, `apps/frontend/src/features/van-han/pages/van-han-page.tsx`
- Create: `apps/frontend/tools/seo-routes.spec.ts` (if the frontend Jest config does not reach `tools/`, add it to `tsconfig.spec.json` as the analytics-beacon spec did), `apps/frontend/tools/tet-hub-preview.mjs`
- Modify: `apps/frontend/package.json` (target `tet-hub-preview`)

**Interfaces:**

- Produces:
  - `getSeoRoutes()` also returns `/kien-thuc/tu-vi-2027` and every slug in `src/features/tet-hub/content/2027/manifest.json`, read as JSON.
  - `pnpm nx run @org/frontend:tet-hub-preview` writes `tmp/tet-hub-preview.html` (git-ignored): every year page's summary facts and full article, one after another, with its slug as a heading.

- [ ] **Step 1: Write the failing tests:** `lists the hub and every manifest slug`; `has no duplicate routes`; `no Kiến thức article uses the hub's slug` (`getArticleSlugs()` excludes `tu-vi-2027`).
- [ ] **Step 2: Run** `pnpm nx test @org/frontend --testPathPatterns=seo-routes`. Expected: FAIL.
- [ ] **Step 3: Implement,** and add links to the hub from the Kiến thức list, the home page and `/van-han`.
- [ ] **Step 4: Run the same command,** then `pnpm nx build @org/frontend && grep -c tu-vi-2027 apps/frontend/dist/sitemap.xml`. Expected: PASS, and the count equals the manifest's pages plus one.
- [ ] **Step 5: Commit** `feat(tet-hub): list the hub in the sitemap and link to it`.

---

### Task 13 (with Kim An): Generate, review, publish

Not a code task; it runs on `feat/tet-2027-hub` once Tasks 1–12 are committed there and green.

- [ ] **Step 1:** `pnpm nx run @org/backend:generate-tet-hub` for all 61 year pages and 12 con giáp pages, plus the hub draft. Expected: every page passes its check and the similarity gate. If pairs fail the gate, tune `TUOI_NAM_SIMILARITY_THRESHOLD` or the prompt, record the chosen value, and regenerate the failing pages with `--only`.
- [ ] **Step 2:** Kim An reads 10 year pages (spread across chi, ages and good/bad years) and all 13 pillar pages; edits the con giáp JSON and `hub.json` by hand; skims the rest in `tmp/tet-hub-preview.html`. Pages that read badly are regenerated with `--only`.
- [ ] **Step 3:** Commit the content `content(tet-hub): generate Tử vi 2027 pages`, open the one PR from `feat/tet-2027-hub` into `dev` (code and content together), and merge when Kim An asks. Target: merged by 2026-12-01.
- [ ] **Step 4:** After deploy: `curl -s https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-binh-dan-1986 | grep -c '<h1'` prints `1`; Lighthouse mobile on that page meets the design.md gates; resubmit the sitemap in Search Console and request indexing for the hub and the 12 con giáp pages.
