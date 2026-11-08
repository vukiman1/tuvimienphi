import { TET_HUB_VIEW_YEAR, tuoiNamFacts } from '@org/shared-tu-vi';
import type { TuoiNamArticle } from '@org/shared-contracts';
import fixture from './__fixtures__/tuoi-binh-dan-1986.json';
import { tuoiNamHead } from './tuoi-nam-head';

const ARTICLE: TuoiNamArticle = fixture;
const FACTS = tuoiNamFacts(ARTICLE.birthYear, TET_HUB_VIEW_YEAR);
const JSON_LD_KEY = 'script:ld+json';

type Head = ReturnType<typeof tuoiNamHead>;

function jsonLdOfType(head: Head, type: string): Record<string, unknown> | undefined {
  for (const entry of head.meta) {
    if (!(JSON_LD_KEY in entry)) continue;
    const data: unknown = entry[JSON_LD_KEY];
    if (typeof data === 'object' && data !== null && '@type' in data && data['@type'] === type) {
      return { ...data };
    }
  }
  return undefined;
}

describe('tuoiNamHead', () => {
  it('titles the page with the can chi, the birth year and both genders', () => {
    const head = tuoiNamHead(FACTS, ARTICLE);

    expect(head.meta).toContainEqual({
      title:
        'Tử vi tuổi Bính Dần 1986 năm 2027: sao chiếu mệnh, hạn, Tam tai (nam & nữ) | Tử Vi Miễn Phí',
    });
  });

  it('is canonical to its own path under the hub', () => {
    const head = tuoiNamHead(FACTS, ARTICLE);

    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: 'https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-binh-dan-1986',
    });
  });

  it('describes the sao of both nam mạng and nữ mạng', () => {
    const head = tuoiNamHead(FACTS, ARTICLE);
    const description = head.meta.find((entry) => 'name' in entry && entry.name === 'description');

    expect(description).toEqual(
      expect.objectContaining({
        content: expect.stringMatching(/Vân Hớn[\s\S]*La Hầu/),
      }),
    );
  });

  it('emits one FAQPage question per FAQ item', () => {
    const faqPage = jsonLdOfType(tuoiNamHead(FACTS, ARTICLE), 'FAQPage');

    expect(faqPage?.mainEntity).toEqual(
      ARTICLE.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    );
  });

  it('emits Article and BreadcrumbList JSON-LD', () => {
    const head = tuoiNamHead(FACTS, ARTICLE);
    const breadcrumb = jsonLdOfType(head, 'BreadcrumbList');

    expect(jsonLdOfType(head, 'Article')).toBeDefined();
    expect(breadcrumb?.itemListElement).toEqual([
      expect.objectContaining({ position: 1, name: 'Kiến thức' }),
      expect.objectContaining({ position: 2, name: 'Tử vi 2027' }),
      expect.objectContaining({
        position: 3,
        name: 'Tuổi Dần',
        item: 'https://xemtuvimienphi.top/kien-thuc/tu-vi-2027/tuoi-dan',
      }),
      expect.objectContaining({ position: 4, name: 'Bính Dần 1986' }),
    ]);
  });
});
