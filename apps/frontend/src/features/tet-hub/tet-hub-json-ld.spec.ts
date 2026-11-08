import { TET_HUB_PUBLISHED_AT, articleJsonLd } from './tet-hub-json-ld';

const PAGE = {
  headline: 'Tử vi tuổi Bính Dần 1986 năm 2027',
  description: 'Sao chiếu mệnh và hạn của tuổi Bính Dần 1986',
  path: '/kien-thuc/tu-vi-2027/tuoi-binh-dan-1986',
};
const REGENERATED_AT = '2026-12-02T09:30:00.000Z';

describe('articleJsonLd', () => {
  it('keeps the hub launch date as the published date when a page is regenerated', () => {
    const article = articleJsonLd({ ...PAGE, generatedAt: REGENERATED_AT });

    expect(article).toEqual(
      expect.objectContaining({
        datePublished: TET_HUB_PUBLISHED_AT,
        dateModified: REGENERATED_AT,
      }),
    );
  });

  it('dates a page without a generation time at the hub launch', () => {
    const article = articleJsonLd(PAGE);

    expect(article).toEqual(
      expect.objectContaining({
        datePublished: TET_HUB_PUBLISHED_AT,
        dateModified: TET_HUB_PUBLISHED_AT,
      }),
    );
  });
});
