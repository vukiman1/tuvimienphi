import type { SeoHead } from '@/lib/seo';
import { hubHead } from './hub-head';

function metaContent(head: SeoHead, key: string): string | undefined {
  for (const entry of head.meta) {
    if ('name' in entry && entry.name === key) return entry.content;
    if ('property' in entry && entry.property === key) return entry.content;
  }
  return undefined;
}

describe('hubHead', () => {
  it('describes the path and the reference', () => {
    const head = hubHead();

    expect(head.meta).toContainEqual({
      title: 'Học tử vi từ đầu: lộ trình 6 bước và tra cứu sao, cung | Tử Vi Miễn Phí',
    });
    expect(metaContent(head, 'description')).toBe(
      'Học đọc lá số tử vi qua 6 bước ngắn, đọc theo thứ tự, rồi tra từng sao, từng cung và thuật ngữ. Miễn phí, không cần đăng nhập.',
    );
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/kien-thuc',
    });
    expect(metaContent(head, 'og:image')).toMatch(/\/og\/kien-thuc\/hub\.jpg$/);
  });
});
