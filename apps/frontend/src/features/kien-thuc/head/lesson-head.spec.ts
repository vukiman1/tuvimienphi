import type { SeoHead } from '@/lib/seo';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import lessonTuVi from '../__fixtures__/bai-tu-vi-la-gi.json';
import { loadLessonPage } from '../route-data/lesson-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { lessonHead } from './lesson-head';

const SLUG = 'tu-vi-la-gi';
const JSON_LD_KEY = 'script:ld+json';

function jsonLdOfType(head: SeoHead, type: string): Record<string, unknown> | undefined {
  for (const entry of head.meta) {
    if (!(JSON_LD_KEY in entry)) continue;
    const data: unknown = entry[JSON_LD_KEY];
    if (typeof data === 'object' && data !== null && '@type' in data && data['@type'] === type) {
      return { ...data };
    }
  }
  return undefined;
}

function metaContent(head: SeoHead, key: string): string | undefined {
  for (const entry of head.meta) {
    if ('name' in entry && entry.name === key) return entry.content;
    if ('property' in entry && entry.property === key) return entry.content;
  }
  return undefined;
}

async function foundHead(): Promise<SeoHead> {
  return lessonHead(SLUG, await loadLessonPage(SLUG, FIXTURE_SOURCE));
}

describe('lessonHead', () => {
  it('titles the lesson by its own title and summary', async () => {
    const head = await foundHead();

    expect(head.meta).toContainEqual({ title: 'Tử vi là gì | Tử Vi Miễn Phí' });
    expect(metaContent(head, 'description')).toBe(lessonTuVi.summary);
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/kien-thuc/tu-vi-la-gi',
    });
    expect(metaContent(head, 'og:type')).toBe('article');
    expect(metaContent(head, 'og:image')).toMatch(/\/og\/kien-thuc\/bai\.jpg$/);
  });

  it('describes the lesson as an article by the site', async () => {
    const head = await foundHead();
    const article = jsonLdOfType(head, 'Article');
    const breadcrumb = jsonLdOfType(head, 'BreadcrumbList');

    expect(article).toEqual(
      expect.objectContaining({
        datePublished: lessonTuVi.reviewedAt,
        dateModified: lessonTuVi.reviewedAt,
        author: expect.objectContaining({ '@type': 'Organization', name: 'Tử Vi Miễn Phí' }),
      }),
    );
    expect(breadcrumb?.itemListElement).toEqual([
      expect.objectContaining({
        position: 1,
        name: 'Kiến thức',
        item: 'https://xemtuvimienphi.top/kien-thuc',
      }),
      expect.objectContaining({
        position: 2,
        name: 'Tử vi là gì',
        item: 'https://xemtuvimienphi.top/kien-thuc/tu-vi-la-gi',
      }),
    ]);
  });

  it('keeps a missing lesson out of the index', () => {
    const head = lessonHead('khong-co', { status: KienThucPageStatus.NotFound });

    expect(metaContent(head, 'robots')).toBe('noindex, nofollow');
    expect(head.meta).toContainEqual({ title: 'Không tìm thấy bài viết | Tử Vi Miễn Phí' });
  });
});
