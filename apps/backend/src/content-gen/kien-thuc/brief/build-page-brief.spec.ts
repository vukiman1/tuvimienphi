import type { PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { buildPageBrief } from './build-page-brief';

function page(ref: PageRef): PlannedPage {
  const found = plannedPage(ref);
  if (found === undefined) throw new Error(`no page ${ref}`);
  return found;
}

describe('buildPageBrief', () => {
  it('briefs Thiên Cơ with its engine facts', () => {
    const brief = buildPageBrief(page('sao/thien-co'));
    const facts = brief.factLines.join(' ');
    expect(facts).toContain('Mộc');
    expect(facts).toContain('chòm Tử Vi');
    expect(facts).toContain('hãm');
    expect(brief.requiredMentions).toEqual(
      expect.arrayContaining(['Thiên Cơ', 'hành Mộc', 'chòm Tử Vi']),
    );
  });

  it('tells a star without bậc not to claim one', () => {
    const brief = buildPageBrief(page('sao/ta-phu'));
    expect(brief.factLines.some((line) => /miếu ở|hãm ở/.test(line))).toBe(false);
    expect(brief.factLines.some((line) => line.includes('không có bảng bậc'))).toBe(true);
  });

  it('tells a star with a partial row which cells it has', () => {
    const facts = buildPageBrief(page('sao/dia-kiep')).factLines.join(' ');
    expect(facts).toContain('Dần');
    expect(facts).toContain('không suy từ sao cặp');
  });

  it('briefs Phu Thê with its partners', () => {
    const brief = buildPageBrief(page('cung/phu-the'));
    expect(brief.requiredMentions).toEqual(
      expect.arrayContaining(['Quan Lộc', 'Phúc Đức', 'Thiên Di']),
    );
  });

  it('offers every planned page but itself as a link target', () => {
    expect(buildPageBrief(page('sao/thien-co')).linkTargets).toHaveLength(75);
  });

  it('links a lesson to its neighbours in the path', () => {
    const middle = buildPageBrief(page('bai/tam-hop-xung-chieu'));
    expect(middle.previous?.ref).toBe('bai/cung-menh-va-cung-than');
    expect(middle.next?.ref).toBe('bai/y-nghia-chinh-tinh');
    expect(buildPageBrief(page('bai/tu-vi-la-gi')).previous).toBeNull();
    expect(buildPageBrief(page('bai/doc-la-so-cua-chinh-ban')).next).toBeNull();
  });

  it('points an entry at the lesson that teaches it', () => {
    expect(buildPageBrief(page('sao/thien-co')).teachingLesson?.ref).toBe('bai/y-nghia-chinh-tinh');
  });
});
