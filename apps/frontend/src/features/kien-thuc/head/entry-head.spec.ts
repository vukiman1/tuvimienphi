import { ContentKind } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';
import type { SeoHead } from '@/lib/seo';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import starThienCo from '../__fixtures__/sao-thien-co.json';
import { loadEntryPage } from '../route-data/entry-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { entryHead } from './entry-head';

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

async function foundHead(kind: EntryKind, slug: string): Promise<SeoHead> {
  return entryHead(kind, slug, await loadEntryPage(kind, slug, FIXTURE_SOURCE));
}

describe('entryHead', () => {
  it('titles the entry and dates it by its review', async () => {
    const head = await foundHead(ContentKind.Sao, 'thien-co');
    const article = jsonLdOfType(head, 'Article');

    expect(head.meta).toContainEqual({ title: 'Sao Thiên Cơ | Tử Vi Miễn Phí' });
    expect(metaContent(head, 'description')).toBe(starThienCo.summary);
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/kien-thuc/sao/thien-co',
    });
    expect(metaContent(head, 'og:image')).toMatch(/\/og\/kien-thuc\/sao\.jpg$/);
    expect(article).toEqual(
      expect.objectContaining({
        headline: 'Sao Thiên Cơ',
        datePublished: starThienCo.reviewedAt,
        dateModified: starThienCo.reviewedAt,
      }),
    );
  });

  it('breadcrumbs the entry through its group', async () => {
    const head = await foundHead(ContentKind.Sao, 'thien-co');
    const breadcrumb = jsonLdOfType(head, 'BreadcrumbList');

    expect(breadcrumb?.itemListElement).toEqual([
      expect.objectContaining({
        position: 1,
        name: 'Kiến thức',
        item: 'https://xemtuvimienphi.top/kien-thuc',
      }),
      expect.objectContaining({
        position: 2,
        name: 'Chính tinh',
        item: 'https://xemtuvimienphi.top/kien-thuc/sao',
      }),
      expect.objectContaining({
        position: 3,
        name: 'Sao Thiên Cơ',
        item: 'https://xemtuvimienphi.top/kien-thuc/sao/thien-co',
      }),
    ]);
  });

  it('defines a term inside the glossary set', async () => {
    const term = jsonLdOfType(await foundHead(ContentKind.ThuatNgu, 'can'), 'DefinedTerm');
    const star = jsonLdOfType(await foundHead(ContentKind.Sao, 'thien-co'), 'DefinedTerm');

    expect(term).toEqual(
      expect.objectContaining({
        name: 'Thiên can',
        url: 'https://xemtuvimienphi.top/kien-thuc/thuat-ngu/can',
        inDefinedTermSet: expect.stringMatching(/\/kien-thuc\/thuat-ngu$/),
      }),
    );
    expect(star).toBeUndefined();
  });

  it('shares the image of its kind', async () => {
    const palace = await foundHead(ContentKind.Cung, 'menh');
    const term = await foundHead(ContentKind.ThuatNgu, 'can');

    expect(metaContent(palace, 'og:image')).toMatch(/\/og\/kien-thuc\/cung\.jpg$/);
    expect(metaContent(term, 'og:image')).toMatch(/\/og\/kien-thuc\/thuat-ngu\.jpg$/);
  });

  it('keeps a missing entry out of the index', () => {
    const head = entryHead(ContentKind.Sao, 'khong-co', { status: KienThucPageStatus.NotFound });

    expect(metaContent(head, 'robots')).toBe('noindex, nofollow');
    expect(head.meta).toContainEqual({ title: 'Không tìm thấy bài viết | Tử Vi Miễn Phí' });
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/kien-thuc/sao/khong-co',
    });
  });
});
