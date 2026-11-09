import { TY_ENTRY, VAN_HAN_CURRENT } from './__fixtures__/van-han-current';
import { vanHanZodiacHead } from './van-han-zodiac-head';

const SNIPPET_MAX_LENGTH = 160;

type Head = ReturnType<typeof vanHanZodiacHead>;

function descriptionOf(head: Head): string {
  const entry = head.meta.find((tag) => 'name' in tag && tag.name === 'description');
  return entry && 'content' in entry ? entry.content : '';
}

describe('vanHanZodiacHead', () => {
  it('titles the page with the published reading’s own title', () => {
    const head = vanHanZodiacHead('Tý', VAN_HAN_CURRENT);

    expect(head.meta).toContainEqual({ title: `${TY_ENTRY.title} | Tử Vi Miễn Phí` });
  });

  it('describes the page with the opening of the reading, cut to fit a search snippet', () => {
    const description = descriptionOf(vanHanZodiacHead('Tý', VAN_HAN_CURRENT));

    expect(description.startsWith('Người tuổi Tý bước vào năm 2026 Bính Ngọ')).toBe(true);
    expect(description.length).toBeLessThanOrEqual(SNIPPET_MAX_LENGTH);
    expect(description.endsWith('…')).toBe(true);
  });

  it('is canonical to the con giáp page of the year it shows', () => {
    expect(vanHanZodiacHead('Tý', VAN_HAN_CURRENT).links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/van-han/2026/tuoi-ty',
    });
  });

  it('stays canonical to the con giáp page while no year is published', () => {
    expect(vanHanZodiacHead('Tý', null).links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/van-han/tuoi-ty',
    });
  });

  it('names the con giáp plainly while its reading is not published', () => {
    const head = vanHanZodiacHead('Sửu', VAN_HAN_CURRENT);

    expect(head.meta).toContainEqual({ title: 'Vận hạn tuổi Sửu | Tử Vi Miễn Phí' });
    expect(descriptionOf(head)).toContain('tuổi Sửu');
  });
});
