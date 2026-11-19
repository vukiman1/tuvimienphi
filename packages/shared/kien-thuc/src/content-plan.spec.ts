import {
  ContentKind,
  EntryGroup,
  isContentSlug,
  isReservedLessonSlug,
} from '@org/shared-contracts';
import { CHINH_TINH_NAMES, CUNG_NAMES, HOA_NAMES } from '@org/shared-tu-vi';
import {
  KIEN_THUC_ENTRIES,
  KIEN_THUC_LESSONS,
  lessonsOfStep,
  plannedPage,
  plannedRefOf,
} from './content-plan.js';
import { KIEN_THUC_STEPS } from './content-steps.js';

const normalize = (text: string): string => text.normalize('NFC').toLowerCase();

describe('kiến thức content plan', () => {
  it('lays out six steps of three lessons', () => {
    expect(KIEN_THUC_STEPS.map((step) => step.step)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(KIEN_THUC_STEPS[0].title).toBe('Tử vi là gì');
    expect(KIEN_THUC_STEPS[5].title).toBe('Ứng dụng vào đời sống');
    for (let step = 1; step <= 6; step += 1) {
      expect(lessonsOfStep(step).map((lesson) => lesson.order)).toEqual([1, 2, 3]);
    }
    expect(KIEN_THUC_LESSONS).toHaveLength(18);
  });

  it('sums up each step in one sentence for the hub', () => {
    KIEN_THUC_STEPS.forEach(({ summary }) => {
      expect(summary).toMatch(/^\S[^.]*\.$/);
    });
    expect(KIEN_THUC_STEPS[2].summary).toBe(
      'Mười bốn chính tinh, hai chòm sao và năm bậc từ miếu tới hãm.',
    );
  });

  it('keeps the eight legacy article slugs as lessons', () => {
    const slugs = new Set(KIEN_THUC_LESSONS.map((lesson) => lesson.slug));
    for (const legacy of [
      'tu-vi-la-gi',
      '12-cung-tu-vi',
      'y-nghia-chinh-tinh',
      'cach-xem-dai-van',
      'tieu-van-hang-nam',
      'sao-thai-tue',
      'phong-thuy-va-tu-vi',
      'ung-dung-tu-vi-cong-viec',
    ]) {
      expect(slugs.has(legacy)).toBe(true);
    }
    const thaiTue = KIEN_THUC_LESSONS.find((lesson) => lesson.slug === 'sao-thai-tue');
    expect(thaiTue).toMatchObject({ step: 5, order: 3 });
  });

  it('moves tam hợp between palaces to its own slug and keeps the tuổi query as a term', () => {
    const tamHop = KIEN_THUC_LESSONS.find((lesson) => lesson.slug === 'tam-hop-xung-chieu');
    expect(tamHop).toMatchObject({ step: 2, order: 3 });
    expect(plannedPage('thuat-ngu/tam-hop-luc-xung')?.kind).toBe(ContentKind.ThuatNgu);
    expect(plannedPage('bai/tam-hop-luc-xung')).toBeUndefined();
    expect(plannedPage('bai/chon-huong-ban-lam-viec')).toBeUndefined();
  });

  it('never gives a lesson a reserved segment', () => {
    for (const lesson of KIEN_THUC_LESSONS) {
      expect(isReservedLessonSlug(lesson.slug)).toBe(false);
    }
    for (const page of [...KIEN_THUC_LESSONS, ...KIEN_THUC_ENTRIES]) {
      expect(isContentSlug(page.slug)).toBe(true);
    }
  });

  it('plans the 14 chính tinh, the 4 hóa and the 13 phụ tinh of v1', () => {
    const byGroup = (group: EntryGroup): readonly string[] =>
      KIEN_THUC_ENTRIES.filter(
        (entry) => entry.kind === ContentKind.Sao && entry.group === group,
      ).map((entry) => (entry.kind === ContentKind.Sao ? entry.star : ''));

    expect(byGroup(EntryGroup.ChinhTinh)).toEqual([...CHINH_TINH_NAMES]);
    expect(byGroup(EntryGroup.TuHoa)).toEqual([...HOA_NAMES]);
    expect(byGroup(EntryGroup.PhuTinh)).toEqual([
      'Tả Phù',
      'Hữu Bật',
      'Văn Xương',
      'Văn Khúc',
      'Thiên Khôi',
      'Thiên Việt',
      'Lộc Tồn',
      'Kình Dương',
      'Đà La',
      'Địa Không',
      'Địa Kiếp',
      'Hỏa Tinh',
      'Linh Tinh',
    ]);
  });

  it('plans the twelve cung in board order', () => {
    const cungs = KIEN_THUC_ENTRIES.filter((entry) => entry.kind === ContentKind.Cung).map(
      (entry) => (entry.kind === ContentKind.Cung ? entry.cung : ''),
    );
    expect(cungs).toEqual([...CUNG_NAMES]);
  });

  it('plans the five hành first and fifteen terms in all', () => {
    const terms = KIEN_THUC_ENTRIES.filter((entry) => entry.kind === ContentKind.ThuatNgu);
    expect(terms).toHaveLength(15);
    const nguHanh = terms.filter(
      (entry) => entry.kind === ContentKind.ThuatNgu && entry.group === EntryGroup.NguHanh,
    );
    expect(
      nguHanh.map((entry) => (entry.kind === ContentKind.ThuatNgu ? entry.hanh : null)),
    ).toEqual(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']);
    expect(KIEN_THUC_ENTRIES).toHaveLength(58);
  });

  it('keeps slugs unique within each kind', () => {
    const refs = [...KIEN_THUC_LESSONS, ...KIEN_THUC_ENTRIES].map(plannedRefOf);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('points every entry at a planned lesson', () => {
    const lessonSlugs = new Set(KIEN_THUC_LESSONS.map((lesson) => lesson.slug));
    for (const entry of KIEN_THUC_ENTRIES) {
      expect(lessonSlugs.has(entry.learnInLesson)).toBe(true);
    }
  });

  it('makes no term entry for a concept a lesson owns', () => {
    const owned = new Set(
      KIEN_THUC_LESSONS.flatMap((lesson) => lesson.ownedConcepts).map(normalize),
    );
    for (const entry of KIEN_THUC_ENTRIES) {
      if (entry.kind !== ContentKind.ThuatNgu) {
        continue;
      }
      expect(owned.has(normalize(entry.title))).toBe(false);
      for (const alias of entry.aliases) {
        expect(owned.has(normalize(alias))).toBe(false);
      }
    }
  });

  it('resolves refs both ways', () => {
    for (const page of [...KIEN_THUC_LESSONS, ...KIEN_THUC_ENTRIES]) {
      expect(plannedPage(plannedRefOf(page))).toBe(page);
    }
    expect(plannedPage('sao/khong-co-sao-nay')).toBeUndefined();
  });
});
