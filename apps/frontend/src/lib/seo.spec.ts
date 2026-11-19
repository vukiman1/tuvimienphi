import { breadcrumbJsonLd } from './seo';

describe('breadcrumbJsonLd', () => {
  it('numbers breadcrumb items from one with absolute urls', () => {
    const jsonLd = breadcrumbJsonLd([
      { name: 'Kiến thức', path: '/kien-thuc' },
      { name: 'Sao', path: '/kien-thuc/sao' },
    ]);

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd['itemListElement']).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Kiến thức',
        item: 'https://xemtuvimienphi.top/kien-thuc',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sao',
        item: 'https://xemtuvimienphi.top/kien-thuc/sao',
      },
    ]);
  });
});
