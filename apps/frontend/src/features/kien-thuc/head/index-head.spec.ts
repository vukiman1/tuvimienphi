import { ContentKind } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';
import type { SeoHead } from '@/lib/seo';
import { FIXTURE_SOURCE } from '../__fixtures__/fixture-source';
import { loadIndexPage } from '../route-data/index-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { indexHead } from './index-head';

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

async function foundHead(kind: EntryKind): Promise<SeoHead> {
  return indexHead(kind, await loadIndexPage(kind, FIXTURE_SOURCE));
}

describe('indexHead', () => {
  it('titles each index by its kind', async () => {
    const cases: readonly (readonly [EntryKind, string, string, string, string])[] = [
      [
        ContentKind.Sao,
        'Các sao trong tử vi | Tử Vi Miễn Phí',
        'Tra cứu từng sao trong lá số tử vi: hành, nhóm sao và bậc ở từng địa chi theo bảng an sao.',
        '/kien-thuc/sao',
        '/og/kien-thuc/sao.jpg',
      ],
      [
        ContentKind.Cung,
        'Mười hai cung | Tử Vi Miễn Phí',
        'Mười hai cung trong lá số tử vi: cung đối, tam hợp và ý nghĩa của từng cung.',
        '/kien-thuc/cung',
        '/og/kien-thuc/cung.jpg',
      ],
      [
        ContentKind.ThuatNgu,
        'Thuật ngữ tử vi | Tử Vi Miễn Phí',
        'Ngũ hành và các thuật ngữ tử vi thường gặp, mỗi từ một trang giải thích ngắn.',
        '/kien-thuc/thuat-ngu',
        '/og/kien-thuc/thuat-ngu.jpg',
      ],
    ];

    for (const [kind, title, description, path, image] of cases) {
      const head = await foundHead(kind);

      expect(head.meta).toContainEqual({ title });
      expect(metaContent(head, 'description')).toBe(description);
      expect(head.links).toContainEqual({
        rel: 'canonical',
        href: `https://xemtuvimienphi.top${path}`,
      });
      expect(metaContent(head, 'og:image')).toBe(`https://xemtuvimienphi.top${image}`);
    }
  });

  it('breadcrumbs the index under the hub', async () => {
    const breadcrumb = jsonLdOfType(await foundHead(ContentKind.Sao), 'BreadcrumbList');

    expect(breadcrumb?.itemListElement).toEqual([
      expect.objectContaining({ name: 'Kiến thức', item: 'https://xemtuvimienphi.top/kien-thuc' }),
      expect.objectContaining({
        name: 'Các sao trong tử vi',
        item: 'https://xemtuvimienphi.top/kien-thuc/sao',
      }),
    ]);
  });

  it('publishes the glossary as a defined term set', async () => {
    const termSet = jsonLdOfType(await foundHead(ContentKind.ThuatNgu), 'DefinedTermSet');
    const starSet = jsonLdOfType(await foundHead(ContentKind.Sao), 'DefinedTermSet');

    expect(termSet?.hasDefinedTerm).toEqual([
      {
        '@type': 'DefinedTerm',
        name: 'Hành Kim',
        description: 'Tóm tắt mẫu của trang Hành Kim.',
        url: 'https://xemtuvimienphi.top/kien-thuc/thuat-ngu/hanh-kim',
      },
      {
        '@type': 'DefinedTerm',
        name: 'Thiên can',
        description: 'Tóm tắt mẫu của trang Thiên can.',
        url: 'https://xemtuvimienphi.top/kien-thuc/thuat-ngu/can',
      },
      {
        '@type': 'DefinedTerm',
        name: 'Cục',
        description: 'Tóm tắt mẫu của trang Cục.',
        url: 'https://xemtuvimienphi.top/kien-thuc/thuat-ngu/cuc',
      },
    ]);
    expect(starSet).toBeUndefined();
  });

  it('keeps an empty kind out of the index', () => {
    const head = indexHead(ContentKind.Cung, { status: KienThucPageStatus.NotFound });

    expect(metaContent(head, 'robots')).toBe('noindex, nofollow');
    expect(head.meta).toContainEqual({ title: 'Không tìm thấy bài viết | Tử Vi Miễn Phí' });
  });
});
