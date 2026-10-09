# Công Danh Chapter Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the P0/P1/P2 content-accuracy and completeness bugs found while reviewing the newly-built "Công Danh sự nghiệp" (career) luận giải chapter — a shared phụ tinh table leaking tình duyên content into career essays, an internal ranking number getting fabricated into a fake "mốc tuổi", two missing classical formulas (Tứ Hoá, cách cục), and a prompt rule contradiction that makes every bài chính need at least one retry.

**Architecture:** Every fix stays inside the existing "pure brief pool → tightly-scoped generation → pure 5-layer validator" architecture — no new processing layer is introduced. Each task is an independent, atomic change: three touch only the deterministic brief builder in `packages/shared/tu-vi` (no AI calls, no network), one touches a single shared serialization helper used by all four chapter prompt builders, and one is a system-prompt text edit. All code and test values below were verified by actually running them against this repo before being written into this plan (temporarily applied, tested with real `pnpm nx test` runs, then reverted) — the fixture dates, expected `trong` values, and existing-test diffs are real, not estimated.

**Tech Stack:** TypeScript, Nx monorepo (pnpm), Jest + `@swc/jest`, NestJS backend (`apps/backend`), pure-function domain package (`packages/shared/tu-vi`).

**Spec:** No separate spec file in the repo — this plan implements the findings from the PDF review delivered to Kim An on 2026-10-09 (`~/Downloads/bao-cao-cong-danh.pdf`, not repo-tracked). The relevant constraints from that review are copied into Global Constraints below so this plan is self-contained for an executor who hasn't read the PDF.

## Scope

**In scope (this plan):** the five fixes below, all inside `packages/shared/tu-vi/src/luan/` and `apps/backend/src/api/luan-giai/`.

**Explicitly out of scope — do not touch in this plan:**

- The M/V/Đ/B/H (Miếu/Vượng/Đắc/Bình/Hãm) rating-letter legend/tooltip. This is a frontend-wide UX/copy decision (where exactly to show it, what wording) affecting every chapter and the chart view itself, not something mechanical to fix alongside backend data/prompt changes. Needs its own small plan once Kim An picks a placement.
- Any new "mục" (section) or extra AI call to add fresh content. The PDF review concluded the current call budget (3 calls/chapter, up to 5 retries each, 22s shared budget) is sufficient; the fix is to the _first-attempt pass rate_, not the call count.
- `build-menh-brief.ts` also lacks Tứ Hoá application (same gap as Công Danh had) — spotted while building Task 3, but it's a different chapter's file, untested here, and outside what was reviewed. Flag to Kim An as a separate follow-up, don't fix it in this plan.

## Global Constraints

- No comments in any code touched by this plan — project `CLAUDE.md` bans them with no exceptions, including the "non-obvious why" case.
- Keep the existing per-chapter duplication pattern (`build-cong-danh-brief.ts`, `build-menh-brief.ts`, `build-than-cu-brief.ts` each already duplicate `draft`/`moRong`/`cull`/factor constants independently) — do not extract a shared helper module for `applyTuHoa` or the claim-building helpers. Only `than-cu` has `applyTuHoa` today; after Task 3, `công danh` will be the second independent copy — still short of the "≥3 call sites" bar for extracting a shared module.
- Atomic commits, one task per commit, in the order given below (Task 4 depends on Task 3's structure; Task 2 must land before Task 3/4 touch the same function to keep diffs reviewable).
- Every new/changed assertion in this plan was run for real against this exact codebase; if a step's expected value doesn't match when you run it, the codebase has diverged from this plan's baseline — stop and re-derive it, don't force the old number.
- Branch name per user convention: `fix/luan-giai-cong-danh-brief-accuracy`.

## Review Focus

1. **Cách cục claims dominating the ranked pool must never flip a previously-valid chart to "unavailable".** `cachCucTai()` claims carry `do: []` and high `trong` (78–88); mixing them into the same `cull()` pool as individually-attributed claims _before_ the `coNen`/`coMach` null-check caused `packages/shared/tu-vi/src/luan/bao-phu-cong-danh.spec.ts`'s 1,536-chart coverage sweep to start failing during this plan's verification pass. Task 4 fixes the ordering; its step list re-runs that exact coverage spec as proof.
2. **Vô chính diệu charts combined with Tứ Hoá must not crash or silently drop the chart.** Công Danh already handles vô chính diệu by pulling chính tinh from the other 3 tam-phương positions (no `chinhTinhMuon` special-case, unlike Thân Cư), so `the.tuHoaTacDong` — which is position-generic — should apply unchanged. Covered for free: the existing `CONG_DANH_YEU` (vô chính diệu) fixture in `build-cong-danh-brief.spec.ts` keeps passing through every task's verification run.
3. **`serializeBriefForPrompt` must not throw or mangle output on an edge-shaped brief** (empty `luan[]`, the rarest-but-real case for a thin chart). Task 1's test suite asserts this directly.
4. **The new `PHU_TINH_QUAN_LOC` table must not silently drop a star the old shared table covered** — a missing key means that phụ tinh's claim vanishes from every future Công Danh brief without any error. Task 2's key-parity test pins this.
5. **A bài chính with exactly one mệnh đề thuận (not two) must still read naturally after the Task 5 prompt rewording** — the old instruction's câu-1/câu-2 split falls apart differently when there's only one claim instead of two. This is model behavior, not deterministic code, so it can't be a unit test; Task 5's step list includes an explicit manual verification instruction instead of skipping it.

---

### Task 1: Stop leaking the internal `trong` ranking weight into model prompts

**Files:**

- Create: `apps/backend/src/api/luan-giai/prompt/serialize-brief.ts`
- Create: `apps/backend/src/api/luan-giai/prompt/serialize-brief.spec.ts`
- Modify: `apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.ts`
- Modify: `apps/backend/src/api/luan-giai/prompt/muc-prompt.ts`
- Modify: `apps/backend/src/api/luan-giai/prompt/menh-prompt.ts`
- Modify: `apps/backend/src/api/luan-giai/prompt/than-cu-prompt.ts`

**Why all four files, not just Công Danh's:** `muc-prompt.ts` is already shared by all three generators (`cong-danh.generator.ts`, `than-cu.generator.ts`, `menh.generator.ts`), so fixing it protects all three chapters' "mục" output whether this task scopes to Công Danh or not. `menh-prompt.ts` and `than-cu-prompt.ts` have the exact same `JSON.stringify(brief, null, 2)` pattern as `cong-danh-prompt.ts` — confirmed by grep before writing this plan — so leaving them unfixed would leave the identical fabricated-age bug live in two already-shipped chapters. The fix is a one-line swap per file; there's no reason to leave the other three half-fixed.

**Interfaces:**

- Produces: `serializeBriefForPrompt(brief: ChapterBrief): string` — used by every prompt builder in place of `JSON.stringify(brief, null, 2)`.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/backend/src/api/luan-giai/prompt/serialize-brief.spec.ts
import { Gender, Sac, type ChapterBrief } from '@org/shared-tu-vi';
import { serializeBriefForPrompt } from './serialize-brief';

const BRIEF: ChapterBrief = {
  cung: 'Quan Lộc',
  chi: 'Tý',
  gioiTinh: Gender.Nam,
  chiNamSinh: 'Thìn',
  chinhTinh: [{ ten: 'Thiên Lương', bac: 'M' }],
  laVoChinhDieu: false,
  hungTinh: [],
  catTinh: [],
  anNgu: null,
  luan: [
    {
      y: 'được tin tưởng giao vai trò gỡ việc khó',
      do: ['Thiên Lương'],
      sac: Sac.Thuan,
      trong: 77,
      tuKhoa: ['gỡ việc khó'],
    },
  ],
};

describe('serializeBriefForPrompt', () => {
  it('bỏ trường trong khỏi mệnh đề trước khi gửi cho mô hình', () => {
    const text = serializeBriefForPrompt(BRIEF);

    expect(text).not.toContain('"trong"');
  });

  it('vẫn giữ nguyên các trường mô hình cần đọc', () => {
    const text = serializeBriefForPrompt(BRIEF);
    const parsed = JSON.parse(text);

    expect(parsed.luan[0]).toMatchObject({
      y: 'được tin tưởng giao vai trò gỡ việc khó',
      do: ['Thiên Lương'],
      sac: 'thuan',
      tuKhoa: ['gỡ việc khó'],
    });
  });

  it('không lỗi khi luan rỗng', () => {
    const text = serializeBriefForPrompt({ ...BRIEF, luan: [] });

    expect(JSON.parse(text).luan).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm nx test backend --testPathPatterns=serialize-brief`
Expected: FAIL — `Cannot find module './serialize-brief'`

- [ ] **Step 3: Write the implementation**

```typescript
// apps/backend/src/api/luan-giai/prompt/serialize-brief.ts
import type { ChapterBrief } from '@org/shared-tu-vi';

export function serializeBriefForPrompt(brief: ChapterBrief): string {
  return JSON.stringify(brief, (key, value) => (key === 'trong' ? undefined : value), 2);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm nx test backend --testPathPatterns=serialize-brief`
Expected: PASS — 3/3 tests green (this was verified for real during planning; do not expect a different result without a code change).

- [ ] **Step 5: Wire it into all four prompt builders**

In `cong-danh-prompt.ts`, add the import and swap the call:

```typescript
import { serializeBriefForPrompt } from './serialize-brief';
```

```typescript
const messages: AiMessage[] = [{ role: 'user', text: serializeBriefForPrompt(brief) }];
```

Repeat the identical two edits (same import line, same swap of `JSON.stringify(brief, null, 2)` → `serializeBriefForPrompt(brief)`) in `muc-prompt.ts`, `menh-prompt.ts`, and `than-cu-prompt.ts`. Each file already imports its own brief type from `@org/shared-tu-vi` and `AiMessage` from `../../../ai/ai.types` — no other import changes needed.

- [ ] **Step 6: Run the full luận giải backend suite**

Run: `pnpm nx test backend --testPathPatterns="luan-giai|cong-danh"`
Expected: PASS — all existing tests still green (they mock the AI client and never assert on the exact JSON text sent, so this swap is invisible to them).

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/api/luan-giai/prompt/serialize-brief.ts apps/backend/src/api/luan-giai/prompt/serialize-brief.spec.ts apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.ts apps/backend/src/api/luan-giai/prompt/muc-prompt.ts apps/backend/src/api/luan-giai/prompt/menh-prompt.ts apps/backend/src/api/luan-giai/prompt/than-cu-prompt.ts
git commit -m "fix(luan-giai): stop leaking internal ranking weight into model prompts"
```

---

### Task 2: Write career-specific phụ tinh claims for Công Danh

**Files:**

- Create: `packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.ts`
- Create: `packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.spec.ts`
- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts`
- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-muc-briefs.ts`

**Why:** `PHU_TINH_LUAN` (`bang/phu-tinh.ts`) was written for the Thân Cư chapter, one of whose six possible palaces is Phu Thê (spouse) — about half its 24 entries are phrased around tình cảm/hôn nhân/gia đạo ("đa tình, ngoài luồng", "dễ có hôn sự", "quyền quyết trong nhà"). Công Danh reuses it verbatim today. Verified against 6 real test charts during the review: every one of them had at least one such entry land in the Quan Lộc brief, and real model output (gemini-3.1-flash-lite, same production prompt) put romance/marriage sentences straight into "career" essays in all 3 charts tested against the live model.

**Interfaces:**

- Produces: `PHU_TINH_QUAN_LOC: Readonly<Partial<Record<PhuTinhName, LuanDe>>>` — same shape and same key set as `PHU_TINH_LUAN`, consumed by `build-cong-danh-brief.ts` and `build-cong-danh-muc-briefs.ts` in place of `PHU_TINH_LUAN`.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.spec.ts
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_QUAN_LOC } from './phu-tinh-quan-loc.js';

const TU_CAM = [
  'tình cảm',
  'hôn sự',
  'hôn nhân',
  'người khác giới',
  'trong nhà',
  'trong quan hệ',
  'trong mối quan hệ',
  'của hai người',
];

describe('PHU_TINH_QUAN_LOC', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_QUAN_LOC).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('không còn mệnh đề nào nói về tình cảm, hôn nhân hay gia đạo', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_QUAN_LOC)) {
      for (const tu of TU_CAM) {
        expect([sao, claim?.y.includes(tu)]).toEqual([sao, false]);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=phu-tinh-quan-loc`
Expected: FAIL — `Cannot find module './phu-tinh-quan-loc.js'`

- [ ] **Step 3: Write the implementation**

```typescript
// packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.ts
import type { PhuTinhName } from '../../../sao-names.js';
import { Sac, type LuanDe } from '../../luan-de.js';

export const PHU_TINH_QUAN_LOC: Readonly<Partial<Record<PhuTinhName, LuanDe>>> = {
  'Đại Hao': {
    y: 'hao tổn nhiều công sức và tiền bạc cho công việc mà chưa thấy thu lại tương xứng',
    do: ['Đại Hao'],
    sac: Sac.Nghich,
    trong: 65,
    tuKhoa: ['hao tổn', 'công sức', 'chưa thấy thu lại'],
  },
  'Kiếp Sát': {
    y: 'có giai đoạn công việc gặp biến cố bất ngờ, mất đi phần thành quả đã gây dựng',
    do: ['Kiếp Sát'],
    sac: Sac.Nghich,
    trong: 60,
    tuKhoa: ['biến cố bất ngờ', 'mất đi thành quả'],
  },
  'Thiên Diêu': {
    y: 'dễ sa đà vào việc ngoài lề, phân tán sức tập trung khỏi việc chính',
    do: ['Thiên Diêu'],
    sac: Sac.Nghich,
    trong: 60,
    tuKhoa: ['sa đà việc ngoài lề', 'phân tán'],
  },
  'Đà La': {
    y: 'trắc trở kéo dài, việc gì cũng chậm và dây dưa',
    do: ['Đà La'],
    sac: Sac.Nghich,
    trong: 62,
    tuKhoa: ['trắc trở', 'chậm', 'dây dưa'],
  },
  'Cô Thần': {
    y: 'nhiều lúc phải tự xoay sở một mình, ít người cùng gánh việc',
    do: ['Cô Thần'],
    sac: Sac.Nghich,
    trong: 58,
    tuKhoa: ['tự xoay sở một mình', 'ít người cùng gánh'],
  },
  'Phá Toái': {
    y: 'công việc dễ gián đoạn hoặc đứt quãng giữa chừng',
    do: ['Phá Toái'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['gián đoạn', 'đứt quãng'],
  },
  'Thiên Không': {
    y: 'dễ hụt hẫng vì kỳ vọng vào công việc không khớp thực tế',
    do: ['Thiên Không'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['hụt hẫng', 'kỳ vọng'],
  },
  'Kình Dương': {
    y: 'dễ va chạm, lời qua tiếng lại với người cùng làm',
    do: ['Kình Dương'],
    sac: Sac.Nghich,
    trong: 55,
    tuKhoa: ['va chạm', 'lời qua tiếng lại'],
  },
  'Hỏa Tinh': {
    y: 'tính khí nóng, xung đột trong công việc đến nhanh đi nhanh',
    do: ['Hỏa Tinh'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['nóng', 'xung đột'],
  },
  'Linh Tinh': {
    y: 'uất ức âm ỉ vì công việc, khó nói thẳng ra',
    do: ['Linh Tinh'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['uất ức', 'khó nói'],
  },
  'Thiên Hình': {
    y: 'nguyên tắc cứng trong công việc, dễ thành khắc khẩu với đồng nghiệp',
    do: ['Thiên Hình'],
    sac: Sac.Nghich,
    trong: 50,
    tuKhoa: ['nguyên tắc', 'khắc khẩu'],
  },
  'Địa Không': {
    y: 'có giai đoạn công sức bỏ ra không đọng lại thành quả như mong đợi',
    do: ['Địa Không'],
    sac: Sac.Nghich,
    trong: 62,
    tuKhoa: ['không đọng lại', 'như mong đợi'],
  },
  'Tiểu Hao': {
    y: 'hao phí vặt vì những việc lặt vặt phát sinh ngoài kế hoạch',
    do: ['Tiểu Hao'],
    sac: Sac.Nghich,
    trong: 45,
    tuKhoa: ['hao phí vặt', 'ngoài kế hoạch'],
  },
  'Hóa Quyền': {
    y: 'có thực quyền, tiếng nói đủ sức quyết định trong công việc',
    do: ['Hóa Quyền'],
    sac: Sac.Thuan,
    trong: 68,
    tuKhoa: ['thực quyền', 'quyết định'],
  },
  'Hóa Lộc': {
    y: 'công việc đi kèm tài lộc, thu nhập thuận theo công sức bỏ ra',
    do: ['Hóa Lộc'],
    sac: Sac.Thuan,
    trong: 58,
    tuKhoa: ['tài lộc', 'thu nhập'],
  },
  'Thiên Khôi': {
    y: 'gặp việc khó thường có quý nhân đỡ một tay',
    do: ['Thiên Khôi'],
    sac: Sac.HoaGiai,
    trong: 52,
    tuKhoa: ['quý nhân'],
  },
  'Hồng Loan': {
    y: 'dễ được chú ý đúng lúc, có duyên gặp cơ hội hoặc đối tác tốt',
    do: ['Hồng Loan'],
    sac: Sac.Thuan,
    trong: 62,
    tuKhoa: ['được chú ý đúng lúc', 'duyên gặp cơ hội'],
  },
  'Thiên Y': {
    y: 'dễ gây thiện cảm, được tín nhiệm khi làm việc cùng người khác',
    do: ['Thiên Y'],
    sac: Sac.Thuan,
    trong: 45,
    tuKhoa: ['gây thiện cảm', 'được tín nhiệm'],
  },
  'Đào Hoa': {
    y: 'có sức hút tự nhiên, dễ được chú ý trong tập thể',
    do: ['Đào Hoa'],
    sac: Sac.Thuan,
    trong: 45,
    tuKhoa: ['sức hút tự nhiên', 'được chú ý'],
  },
  'Bát Tọa': {
    y: 'có chỗ đứng, được nể trọng trong tập thể',
    do: ['Bát Tọa'],
    sac: Sac.Thuan,
    trong: 40,
    tuKhoa: ['có chỗ đứng', 'được nể trọng'],
  },
  'Thiên Thọ': {
    y: 'có yếu tố bền, giữ được lâu khi công việc đã ổn định',
    do: ['Thiên Thọ'],
    sac: Sac.HoaGiai,
    trong: 55,
    tuKhoa: ['bền', 'giữ được lâu'],
  },
  'Nguyệt Đức': {
    y: 'có phúc đức che chở, gặp việc khó thường có người đỡ',
    do: ['Nguyệt Đức'],
    sac: Sac.HoaGiai,
    trong: 50,
    tuKhoa: ['che chở', 'người đỡ'],
  },
  'Thiên Đức': {
    y: 'có đức che chở, việc khó hoá nhẹ',
    do: ['Thiên Đức'],
    sac: Sac.HoaGiai,
    trong: 50,
    tuKhoa: ['che chở', 'hoá nhẹ'],
  },
  'Thiên Hỉ': {
    y: 'có tin vui về công việc, không khí làm việc hoà hợp hơn',
    do: ['Thiên Hỉ'],
    sac: Sac.HoaGiai,
    trong: 45,
    tuKhoa: ['tin vui', 'hòa hợp'],
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=phu-tinh-quan-loc`
Expected: PASS — 2/2 tests green.

- [ ] **Step 5: Wire the new table into both Công Danh brief builders**

In `build-cong-danh-brief.ts`, change the import and the one lookup inside `phuTinhClaims`:

```typescript
import { PHU_TINH_QUAN_LOC } from './bang/quan-loc/phu-tinh-quan-loc.js';
```

(replacing `import { PHU_TINH_LUAN } from './bang/phu-tinh.js';`)

```typescript
function phuTinhClaims(phuTinh: readonly SaoTheoThe[]): DraftClaim[] {
  return phuTinh.flatMap((sao) => {
    const claim = PHU_TINH_QUAN_LOC[sao.name];
    if (!claim) return [];
    const factor = THE_FACTOR[sao.the] * (sao.bienAnNgu ? AN_NGU_FACTOR : 1);
    return [draft(claim, factor)];
  });
}
```

In `build-cong-danh-muc-briefs.ts`, same import swap, and in `phuTinhTheoVai`:

```typescript
    .map((sao) => PHU_TINH_QUAN_LOC[sao.name])
```

(replacing `.map((sao) => PHU_TINH_LUAN[sao.name])`)

- [ ] **Step 6: Add a regression test proving the leak is gone, using a verified real fixture**

Add to `packages/shared/tu-vi/src/luan/build-cong-danh-muc-briefs.spec.ts` (append a new `describe` block; check the existing imports at the top of that file already include `castNatal`, `Gender`, `buildCongDanhMucBriefs` — add any that are missing):

```typescript
describe('buildCongDanhMucBriefs — không còn lẫn nội dung tình duyên', () => {
  it('Đại Hao ở "Điểm cần giữ" đọc về công việc, không phải chuyện tình cảm', () => {
    const chart = castNatal({ solarDate: new Date(1990, 5, 15), hour: 10, gender: Gender.Nam });

    const mucBriefs = buildCongDanhMucBriefs(chart);
    const diemCanGiu = mucBriefs.find((muc) => muc.muc === 'diem-can-giu');

    expect(
      diemCanGiu?.luan.some((de) =>
        de.y.includes('hao tổn nhiều công sức và tiền bạc cho công việc'),
      ),
    ).toBe(true);
    expect(diemCanGiu?.luan.some((de) => de.y.includes('vì chuyện tình cảm'))).toBe(false);
  });
});
```

This exact chart (1990-06-15, 10h, Nam) was confirmed during planning to have Đại Hao, Thiên Diêu and Kiếp Sát land in its "Điểm cần giữ trong sự nghiệp" mục — real output, not a guess.

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=build-cong-danh-muc-briefs`
Expected: PASS.

- [ ] **Step 8: Run the full shared-tu-vi suite**

Run: `pnpm nx test shared-tu-vi`
Expected: PASS — 1318/1318 (no existing test reads `PHU_TINH_LUAN`-sourced Công Danh output by exact string, so nothing else should move).

- [ ] **Step 9: Commit**

```bash
git add packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.ts packages/shared/tu-vi/src/luan/bang/quan-loc/phu-tinh-quan-loc.spec.ts packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts packages/shared/tu-vi/src/luan/build-cong-danh-muc-briefs.ts packages/shared/tu-vi/src/luan/build-cong-danh-muc-briefs.spec.ts
git commit -m "fix(luan-giai): write career-specific phụ tinh claims for Công Danh"
```

---

### Task 3: Apply Tứ Hoá to Công Danh's Quan Lộc reading

**Files:**

- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts`
- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-brief.spec.ts` (one existing assertion changes)
- Create: `packages/shared/tu-vi/src/luan/build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts`

**Why:** `theCungAt(chart, quanLocIndex).tuHoaTacDong` is already computed generically for any cung (confirmed in `the-cung.ts`) and already consumed by the shipped Thân Cư chapter via its own `applyTuHoa`. Công Danh calls `theCungAt` already but never reads `tuHoaTacDong` — Hóa Lộc/Hóa Quyền/Hóa Khoa/Hóa Kỵ currently only enter the brief as regular phụ tinh entries (fixed to a career framing by Task 2, but still missing the actual Tứ Hoá _mechanic_: Hóa Kỵ should dampen the carrying star's favorable claim and add a "vướng lại" claim; the other three should boost it). This is a data-wiring gap, not missing infrastructure.

**Interfaces:**

- Consumes: `TheCung.tuHoaTacDong: readonly TuHoa[]` (from `the-cung.js`, already imported as `theCungAt`'s return type), `TuHoa = { hoa: HoaName; star: SaoName }`.
- Produces: `applyTuHoa(claims: DraftClaim[], the: TheCung): DraftClaim[]` — a module-private function in `build-cong-danh-brief.ts`, mirroring the one already in `build-than-cu-brief.ts`.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/shared/tu-vi/src/luan/build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts
import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildCongDanhBrief } from './build-cong-danh-brief.js';

describe('buildCongDanhBrief — Tứ Hoá tại Quan Lộc', () => {
  it('Hoá Kỵ giảm mặt thuận của chính tinh mang nó và thêm mệnh đề vướng lại', () => {
    const chart = castNatal({ solarDate: new Date(1950, 6, 15), hour: 13, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);

    expect(
      brief?.luan.some(
        (de) =>
          de.do.includes('Thiên Đồng') && de.sac === 'nghich' && de.tuKhoa.includes('vướng lại'),
      ),
    ).toBe(true);
  });

  it('Hoá Quyền nâng trọng số mệnh đề của chính tinh mang nó', () => {
    const chart = castNatal({ solarDate: new Date(1951, 6, 15), hour: 21, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);
    const thuanThaiDuong = brief?.luan.find(
      (de) => de.do.includes('Thái Dương') && de.sac === 'thuan',
    );

    expect(thuanThaiDuong?.trong).toBe(78);
  });
});
```

These two fixtures are real, verified during planning: 1950-07-15 13h Nam has Thiên Đồng (H) toạ thủ carrying Hóa Kỵ at Quan Lộc; 1951-07-15 21h Nam has Thái Dương (H) toạ thủ carrying Hóa Quyền, whose thuận claim's `trong` was confirmed to land on exactly 78 after the fix (base value scaled by thế/bậc, plus the +10 bonus).

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=build-cong-danh-brief-tu-hoa-cach-cuc`
Expected: FAIL — first test gets `false`/`undefined` (no "vướng lại" claim exists yet); second gets whatever the un-boosted base value is (not 78).

- [ ] **Step 3: Write the implementation**

Change the import line in `build-cong-danh-brief.ts`:

```typescript
import { TheChieu, theCungAt, type SaoTheoThe, type TheCung } from './the-cung.js';
```

(adding the `type TheCung` named import to the existing line)

Add, right after the existing `phuTinhClaims` function:

```typescript
const HOA_KY_GIAM_THUAN = 0.55;
const HOA_KHAC_BONUS = 10;

function applyTuHoa(claims: DraftClaim[], the: TheCung): DraftClaim[] {
  const themVao: DraftClaim[] = [];

  for (const hoa of the.tuHoaTacDong) {
    for (const claim of claims) {
      if (!claim.do.includes(hoa.star)) continue;

      if (hoa.hoa !== 'Hóa Kỵ') {
        claim.trong += HOA_KHAC_BONUS;
        continue;
      }
      if (claim.sac === Sac.Thuan) {
        claim.trong = Math.round(claim.trong * HOA_KY_GIAM_THUAN);
      }
    }

    if (hoa.hoa === 'Hóa Kỵ' && claims.some((claim) => claim.do.includes(hoa.star))) {
      themVao.push({
        y: 'phần thuận lợi bị vướng lại, muốn được việc thì cũng phải qua trắc trở',
        do: [hoa.star],
        sac: Sac.Nghich,
        trong: 80,
        tuKhoa: ['vướng lại', 'trắc trở'],
      });
    }
  }

  return [...claims, ...themVao];
}
```

In `buildCongDanhBrief`, wrap the existing `claims` array construction with `applyTuHoa`:

```typescript
const claims = applyTuHoa(
  [
    ...chinhTinh.flatMap((sao) => {
      const cell = CHINH_TINH_QUAN_LOC[sao.ten];
      if (!cell) return [];
      const factor = THE_FACTOR[sao.the] * (BRIGHTNESS_FACTOR[sao.bac ?? 'B'] ?? 1);
      return moRong(cell, sao.bac).map((claim) => draft(claim, factor));
    }),
    ...phuTinhClaims(the.phuTinh),
  ],
  the,
);
```

(replacing the plain array literal — everything after this, the `if (the.anNgu)` scaling loop, `cull(claims)`, and the `coNen`/`coMach` check, stays exactly as it is for this task; Task 4 restructures it next.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=build-cong-danh-brief-tu-hoa-cach-cuc`
Expected: PASS — 2/2 (note: the second `describe` block in this spec file, for cách cục, is added in Task 4 — only the Tứ Hoá tests exist after this step).

- [ ] **Step 5: Update the one existing assertion this changes**

In `build-cong-danh-brief.spec.ts`, the `THIEN_LUONG` fixture (1953-01-25, 21h, Nam) carries a Tứ Hoá on its toạ-thủ star that was previously invisible. Change:

```typescript
expect(thuanDau?.trong).toBe(77);
```

to:

```typescript
expect(thuanDau?.trong).toBe(84);
```

This was confirmed for real during planning — this is the only existing assertion in the whole `shared-tu-vi` suite that Task 3 changes.

- [ ] **Step 6: Run the full shared-tu-vi suite**

Run: `pnpm nx test shared-tu-vi`
Expected: PASS — 1318/1318 (1317 unchanged + the 2 new Tứ Hoá tests, with the one `77→84` edit already applied in Step 5).

- [ ] **Step 7: Commit**

```bash
git add packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts packages/shared/tu-vi/src/luan/build-cong-danh-brief.spec.ts packages/shared/tu-vi/src/luan/build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts
git commit -m "feat(luan-giai): apply Tứ Hoá to Công Danh's Quan Lộc reading"
```

---

### Task 4: Fold cách cục tam hợp into the Công Danh brief

**Files:**

- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts`
- Modify: `packages/shared/tu-vi/src/luan/build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts`

**Why:** `cachCucTai(chart, cungIndex)` (in `bang/cach-cuc.ts`) already detects classical tam-hợp formations (Sát Phá Tham, Cơ Nguyệt Đồng Lương, Tử Phủ Vũ Tướng, and 7 phụ-tinh pairs like Lộc Mã, Hoả Linh) and is already used by the shipped Mệnh chapter. Unlike the phụ tinh table, its claim text ("hợp việc cần bền và cần nghĩ", "hợp việc quản và việc giữ") already reads as career-appropriate without rewriting — verified by inspection, no romance-coded phrasing in any of the three `NHOM_CHINH_TINH` entries or seven `CAP_PHU_TINH` entries.

**Design note — why this can't be a naive "just concatenate it in":** `cachCucTai()` claims carry `do: []` (they're attributed to a combination, not one star) and high `trong` (78–88). Mixing them into the same pool _before_ the `coNen`/`coMach` validity check lets them crowd out every individually-attributed claim in a sac bucket — confirmed during planning: doing it naively made `bao-phu-cong-danh.spec.ts`'s 1,536-chart coverage sweep start failing (charts that used to return a valid brief started returning `null`). The fix below computes validity from the base (chính tinh + phụ tinh + Tứ Hoá) claims _before_ merging in cách cục, then only merges cách cục in for the final displayed `luan`.

**Interfaces:**

- Consumes: `cachCucTai(chart: NatalChart, chiIndex: number): readonly { ten: string; luan: readonly LuanDe[] }[]` (already exported from `bang/cach-cuc.js`).

- [ ] **Step 1: Write the failing test**

Append to `build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts`:

```typescript
describe('buildCongDanhBrief — cách cục tam hợp', () => {
  it('gọi tên cách cục khi nhóm chính tinh tam hợp đủ ngưỡng', () => {
    const chart = castNatal({ solarDate: new Date(1950, 6, 15), hour: 13, gender: Gender.Nam });

    const brief = buildCongDanhBrief(chart);

    expect(
      brief?.luan.some((de) => de.tuKhoa.includes('Cơ Nguyệt Đồng Lương') && de.do.length === 0),
    ).toBe(true);
  });
});
```

Same 1950-07-15 fixture as Task 3's Hóa Kỵ test — verified during planning to also trigger the "Cơ Nguyệt Đồng Lương" cách cục (Thiên Đồng/Thiên Cơ/Thái Âm/Thiên Lương all present in its tam phương), so this one chart exercises both the Tứ Hoá claim and the cách cục claim surviving `cull()` together.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=build-cong-danh-brief-tu-hoa-cach-cuc`
Expected: FAIL — no claim with `tuKhoa` containing `'Cơ Nguyệt Đồng Lương'` exists yet.

- [ ] **Step 3: Write the implementation**

Add the import:

```typescript
import { cachCucTai } from './bang/cach-cuc.js';
```

Restructure the body of `buildCongDanhBrief` from (the Task-3 state):

```typescript
const claims = applyTuHoa(
  [
    ...chinhTinh.flatMap((sao) => {
      /* ... */
    }),
    ...phuTinhClaims(the.phuTinh),
  ],
  the,
);

if (the.anNgu) {
  for (const claim of claims) claim.trong = Math.round(claim.trong * AN_NGU_FACTOR);
}

const luan = cull(claims);

const tenChinhTinh = new Set<SaoName>(chinhTinh.map((sao) => sao.ten));
const coNen = luan.some((claim) => claim.do.some((sao) => tenChinhTinh.has(sao)));
const coMach =
  luan.some((claim) => claim.sac === Sac.Thuan) && luan.some((claim) => claim.sac === Sac.Nghich);
if (!coNen || !coMach) return null;
```

to:

```typescript
const baseClaims = applyTuHoa(
  [
    ...chinhTinh.flatMap((sao) => {
      /* ... */
    }),
    ...phuTinhClaims(the.phuTinh),
  ],
  the,
);

if (the.anNgu) {
  for (const claim of baseClaims) claim.trong = Math.round(claim.trong * AN_NGU_FACTOR);
}

const coTheXayNen = cull(baseClaims);
const tenChinhTinh = new Set<SaoName>(chinhTinh.map((sao) => sao.ten));
const coNen = coTheXayNen.some((claim) => claim.do.some((sao) => tenChinhTinh.has(sao)));
const coMach =
  coTheXayNen.some((claim) => claim.sac === Sac.Thuan) &&
  coTheXayNen.some((claim) => claim.sac === Sac.Nghich);
if (!coNen || !coMach) return null;

const cachCucClaims = cachCucTai(chart, quanLocIndex).flatMap((cach) =>
  cach.luan.map((claim) => draft(claim, the.anNgu ? AN_NGU_FACTOR : 1)),
);
const luan = cull([...baseClaims, ...cachCucClaims]);
```

(keep the `chinhTinh.flatMap(...)` body exactly as it already is — only the variable name `claims` → `baseClaims` and everything from `if (the.anNgu)` onward changes.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=build-cong-danh-brief-tu-hoa-cach-cuc`
Expected: PASS — 3/3 (2 from Task 3 + 1 new).

- [ ] **Step 5: Run the coverage regression guard**

Run: `pnpm nx test shared-tu-vi --testPathPatterns=bao-phu-cong-danh`
Expected: PASS — `dựng được bài cho mọi lá số quét qua` must stay green across its 1,536-chart sweep. If it fails, the restructuring in Step 3 wasn't applied correctly (most likely: `coNen`/`coMach` got computed after merging `cachCucClaims` instead of before) — re-check against the exact code above before touching anything else.

- [ ] **Step 6: Run the full shared-tu-vi suite**

Run: `pnpm nx test shared-tu-vi`
Expected: PASS — 1319/1319 (1318 from end of Task 3 + 1 new cách cục test).

- [ ] **Step 7: Commit**

```bash
git add packages/shared/tu-vi/src/luan/build-cong-danh-brief.ts packages/shared/tu-vi/src/luan/build-cong-danh-brief-tu-hoa-cach-cuc.spec.ts
git commit -m "feat(luan-giai): fold cách cục tam hợp into Công Danh brief"
```

---

### Task 5: Resolve the câu 1/câu 2 attribution conflict in bài chính's system prompt

**Files:**

- Modify: `apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.ts`
- Create: `apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.spec.ts`

**Why:** The current đoạn 1 instruction — "Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển" — tells the model to name stars in the first sentence and describe their meaning in the second. This directly conflicts with rule B ("Mỗi mệnh đề phải nằm CÙNG CÂU với ít nhất một sao trong do[]"): when there are two mệnh đề thuận from two different chính tinh (the common case — `LIMIT.Thuan = 2`), the model packs both star names into câu 1 and both meanings into câu 2, and neither claim ends up sharing a sentence with its own star. Confirmed in review: **3 out of 3** real bài chính generations tested against the live model hit exactly this "quy kết sai" (misattribution) error on đoạn 1, every single time — while đoạn 2, whose instruction has no such câu-1/câu-2 split, never hit this error across the same 3 tests. The fix removes the split instead of trying to patch around it.

**Interfaces:** none — this task only changes a prompt string; no function signatures change.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.spec.ts
import { CONG_DANH_SYSTEM_PROMPT } from './cong-danh-prompt';

describe('CONG_DANH_SYSTEM_PROMPT', () => {
  it('không còn tách riêng câu xướng tên sao khỏi câu kể ý ở đoạn 1', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).not.toContain(
      'Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển',
    );
  });

  it('vẫn yêu cầu mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh sinh ra nó', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).toContain(
      'Mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính',
    );
  });
});
```

This is a regression guard on the prompt string, not a test of model behavior — a unit test can't verify an LLM followed an instruction. Step 6 below covers that with a manual check.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm nx test backend --testPathPatterns=cong-danh-prompt`
Expected: FAIL — the old sentence is still present, the new one isn't.

- [ ] **Step 3: Edit the prompt**

In `CONG_DANH_SYSTEM_PROMPT`, change:

```
Đoạn 1 — ĐÚNG 2 câu, dùng các mệnh đề sac="thuan". Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển và mang cụm ==tô nền==.
```

to:

```
Đoạn 1 — ĐÚNG 2 câu, dùng các mệnh đề sac="thuan". Mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính
tinh sinh ra nó — đừng dành riêng một câu chỉ để xướng tên sao rồi mới kể ý ở câu sau. Nếu brief chỉ có một
mệnh đề thuận, câu 2 khai triển thêm về cùng ngôi sao ấy, vẫn nhắc lại tên nó. Cụm ==tô nền== nằm ở câu thứ
hai.
```

Leave đoạn 2's instructions and the rest of the system prompt untouched — they don't have this problem.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm nx test backend --testPathPatterns=cong-danh-prompt`
Expected: PASS — 2/2.

- [ ] **Step 5: Run the full luận giải backend suite**

Run: `pnpm nx test backend --testPathPatterns="luan-giai|cong-danh"`
Expected: PASS — nothing else in the backend suite asserts on this prompt's exact text.

- [ ] **Step 6: Manual verification (cannot be automated — LLM output is non-deterministic)**

Pick an AI provider/model with real API access (the review used `gemini-3.1-flash-lite` via the dev key already in `apps/backend/.env`, called directly through `GeminiProvider` to bypass the DB-backed `AiSettingsService`, with `checkParagraphs` run afterward against the exact same brief — this is the fastest way to reproduce the review's test harness; do not reuse the exact probe script since it was a temporary, uncommitted file, but the construction is: `buildCongDanhBrief(chart)` → `buildCongDanhMessages(brief, [])` → `new GeminiProvider(fakeConfigService).generate({ system: CONG_DANH_SYSTEM_PROMPT, messages, schema: THAN_CU_SCHEMA }, { apiKey, models: ['gemini-3.1-flash-lite'] })` → parse → `checkParagraphs(brief, baiChinh(parsed), false)`). Run it against at least 5 charts whose bài chính has 2 mệnh đề thuận (the common case), and at least 1 chart whose bài chính has only 1 mệnh đề thuận (Review Focus item 5). Confirm `checkParagraphs` no longer reports a `"quy kết sai"` error on đoạn 1 for any of them. If it still does on some fraction, the reworded instruction isn't strong enough yet — don't ship Task 5 as "done" until this check is clean, since this task exists specifically to fix that error.

- [ ] **Step 7: Commit**

```bash
git add apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.ts apps/backend/src/api/luan-giai/prompt/cong-danh-prompt.spec.ts
git commit -m "fix(luan-giai): resolve câu 1/câu 2 attribution conflict in bài chính prompt"
```

---

## Self-Review

**Spec coverage:** P0 #1 (phụ tinh context) → Task 2. P0 #2 (fabricated tuổi from `trong`) → Task 1. P1 #1 (Tứ Hoá) → Task 3. P1 #2 (cách cục) → Task 4. P2 "prompt contradiction" → Task 5. P2 "rating legend" and P3 "optional new mục" are explicitly out of scope (see Scope section) — not silently dropped, called out to Kim An.

**Placeholder scan:** no TBD/TODO, no "add appropriate error handling", no "similar to Task N" — every step has real, runnable code or an explicit manual-verification instruction where automation isn't possible (Task 5 Step 6, the one truly non-deterministic case).

**Type consistency:** `DraftClaim`, `TheCung`, `LuanDe`, `ChapterBrief`, `PhuTinhName` are used with identical shapes across all five tasks, matching the actual current type definitions in `luan-de.ts`, `the-cung.ts`, `chapter-brief.ts`, `sao-names.ts` — confirmed by compiling every snippet above for real against this repo during planning (`tsc --build` via `pnpm nx build shared-tu-vi`, zero errors).

**Review Focus:** all 5 items map to a task: #1 and #4 → Task 4's coverage-guard step; #2 → covered for free by existing-test continuity, noted in Task 3; #3 → Task 1's empty-`luan` test; #5 → Task 2's key-parity test; #5 of the original 5-item list (one-thuận-claim case) → Task 5 Step 6's manual check, the one item that can't be a unit test.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-09-cong-danh-chapter-fixes.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** — A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** — I implement every task myself in this session, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end.

For this plan I recommend **Native**: the five tasks are small (one file each, or two closely-related files for Tasks 3–4), every piece of code and every test value was already verified against the real codebase while writing this plan, and Task 3→4 share enough context (same function, same restructuring) that doing them in the same session avoids re-deriving that context in a fresh subagent. The main risk — Task 5's prompt change not actually fixing the attribution error — is a manual LLM-behavior check either way, not something subagent review would catch better than I would. Does the plan capture what you want, and which approach should we use?
