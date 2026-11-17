import type { PageRef } from '@org/shared-contracts';
import { plannedPage, type PlannedPage } from '@org/shared-kien-thuc';
import { ClaimStatus } from './facts/fact-subject';
import type { PageDraftBody } from './check-shape';
import { validatePage } from './validate-page';

const FILLER = [
  'người',
  'mới',
  'đọc',
  'trang',
  'giúp',
  'hiểu',
  'thêm',
  'phần',
  'ghi',
  'lại',
  'từng',
  'bước',
  'ràng',
  'dễ',
  'nhớ',
  'khi',
  'nhìn',
  'vào',
  'đây',
  'nên',
];

function filler(count: number): string {
  return Array.from({ length: count }, (_, i) => FILLER[i % FILLER.length]).join(' ');
}

function requirePage(ref: PageRef): PlannedPage {
  const page = plannedPage(ref);
  if (page === undefined) throw new Error(`no planned page ${ref}`);
  return page;
}

function cleanThienCoBody(): PageDraftBody {
  return {
    summary:
      'Thiên Cơ là một chính tinh thường gặp, bài viết giúp người mới đọc hiểu nét chính của sao.',
    sections: [
      {
        heading: 'Tổng quan',
        paragraphs: [
          `Thiên Cơ thuộc hành Mộc. ${filler(160)} Xem thêm [[bai/y-nghia-chinh-tinh|bài chính tinh]].`,
        ],
      },
      {
        heading: 'Vị trí',
        paragraphs: [
          `Thiên Cơ đứng trong chòm Tử Vi. ${filler(160)} Đối chiếu [[cung/menh|cung Mệnh]].`,
        ],
      },
      { heading: 'Ghi nhớ', paragraphs: [`Người mới nên đọc Thiên Cơ nhiều lần. ${filler(160)}`] },
    ],
  };
}

const THIEN_CO_MENTIONS = ['Thiên Cơ', 'hành Mộc', 'chòm Tử Vi'];

describe('validatePage', () => {
  it('passes a clean entry for Thiên Cơ', () => {
    const result = validatePage(cleanThienCoBody(), {
      page: requirePage('sao/thien-co'),
      requiredMentions: THIEN_CO_MENTIONS,
      corpus: [],
    });
    expect(result.violations).toEqual([]);
  });

  it('lists every claim clause as checked or skipped', () => {
    const result = validatePage(cleanThienCoBody(), {
      page: requirePage('sao/thien-co'),
      requiredMentions: THIEN_CO_MENTIONS,
      corpus: [],
    });
    expect(result.claims.length).toBeGreaterThan(0);
    expect(
      result.claims.every(
        (claim) => claim.status === ClaimStatus.Checked || claim.status === ClaimStatus.Skipped,
      ),
    ).toBe(true);
  });

  it('collects violations from every check in one pass', () => {
    const bad: PageDraftBody = {
      summary: 'Ngắn.',
      sections: [
        {
          heading: 'A',
          paragraphs: ['Thiên Cơ miếu ở Dần. Hoá Lộc đi kèm. Xem [[bai/khong-co-trang|x]].'],
        },
      ],
    };
    const { violations } = validatePage(bad, {
      page: requirePage('sao/thien-co'),
      requiredMentions: [],
      corpus: [],
    });
    expect(violations.some((v) => v.includes('âm tiết'))).toBe(true);
    expect(violations.some((v) => v.includes('Hoá'))).toBe(true);
    expect(violations.some((v) => v.includes('danh mục'))).toBe(true);
    expect(violations.some((v) => v.includes('Dần'))).toBe(true);
  });

  it('runs the sample-chart check only on the last lesson', () => {
    const body: PageDraftBody = {
      summary: 'x',
      sections: [{ heading: 'A', paragraphs: ['Cung Mệnh có Phá Quân.'] }],
    };
    const onLesson63 = validatePage(body, {
      page: requirePage('bai/doc-la-so-cua-chinh-ban'),
      requiredMentions: [],
      corpus: [],
    });
    const onLesson11 = validatePage(body, {
      page: requirePage('bai/tu-vi-la-gi'),
      requiredMentions: [],
      corpus: [],
    });
    expect(onLesson63.violations.some((v) => v.includes('lá số mẫu'))).toBe(true);
    expect(onLesson11.violations.some((v) => v.includes('lá số mẫu'))).toBe(false);
  });
});
