jest.mock('@org/shared-tu-vi', () => {
  const actual = jest.requireActual<typeof import('@org/shared-tu-vi')>('@org/shared-tu-vi');
  return { ...actual, buildVanHanMucBriefs: jest.fn(actual.buildVanHanMucBriefs) };
});

import {
  buildVanHanMucBriefs,
  castNatal,
  Gender,
  LINH_VUC,
  VanHanMucKey,
  vanHanYearOf,
} from '@org/shared-tu-vi';
import { type ChapterContext, MucKind } from '../../generation/chapter-definition';
import { VAN_HAN_CHAPTER } from './van-han.chapter';
import { vanHanMucSystemPrompt } from './van-han.prompt';

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });
const CONTEXT: ChapterContext = { viewYear: 2027, currentYear: 2026 };

const mucBriefs = buildVanHanMucBriefs as jest.MockedFunction<typeof buildVanHanMucBriefs>;

function slugsOf(context: ChapterContext): string[] {
  return VAN_HAN_CHAPTER.buildMucs(CHART, context).map((muc) =>
    muc.kind === MucKind.Rendered ? muc.section.slug : muc.brief.muc,
  );
}

describe('VAN_HAN_CHAPTER', () => {
  afterEach(() => {
    mucBriefs.mockClear();
  });

  it('is unavailable without a view year', () => {
    expect(VAN_HAN_CHAPTER.buildBrief(CHART, { ...CONTEXT, viewYear: null })).toBeNull();
  });

  it('is unavailable for a view year before the chart was born', () => {
    expect(VAN_HAN_CHAPTER.buildBrief(CHART, { ...CONTEXT, viewYear: 1950 })).toBeNull();
  });

  it('is unavailable when a required year mục cannot be built', () => {
    const real = jest.requireActual<typeof import('@org/shared-tu-vi')>('@org/shared-tu-vi');
    mucBriefs.mockImplementationOnce((chart, year) =>
      real
        .buildVanHanMucBriefs(chart, year)
        .filter((brief) => brief.muc !== VanHanMucKey.DieuCanGiu),
    );

    expect(VAN_HAN_CHAPTER.buildBrief(CHART, CONTEXT)).toBeNull();
  });

  it('reads the đại vận cung in the main article', () => {
    const year = vanHanYearOf(CHART, 2027, 2026);

    expect(VAN_HAN_CHAPTER.buildBrief(CHART, CONTEXT)?.cung).toBe(year?.cungDaiVan);
  });

  it('writes the two year mục, then renders the life area, next vận and folk mục', () => {
    expect(slugsOf(CONTEXT)).toEqual([
      VanHanMucKey.DiemSang,
      VanHanMucKey.DieuCanGiu,
      VanHanMucKey.LinhVuc,
      VanHanMucKey.VanKeTiep,
      VanHanMucKey.DanGian,
    ]);
  });

  it('requires both year mục and writes them with the vận hạn prompt', () => {
    const generated = VAN_HAN_CHAPTER.buildMucs(CHART, CONTEXT).filter(
      (muc) => muc.kind === MucKind.PhuTinh,
    );

    for (const muc of generated) {
      expect(muc).toMatchObject({
        isRequired: true,
        systemPrompt: vanHanMucSystemPrompt(muc.brief.cung),
      });
    }
    expect(generated).toHaveLength(2);
  });

  it('leaves out the next vận inside the twelfth đại vận', () => {
    const lastSpan = CHART.daiVan.reduce((latest, span) =>
      span.startAge > latest.startAge ? span : latest,
    );
    const viewYear = CHART.lunar.year + lastSpan.startAge - 1;

    expect(slugsOf({ ...CONTEXT, viewYear })).not.toContain(VanHanMucKey.VanKeTiep);
  });

  it('titles the article with the can chi of the view year', () => {
    const brief = VAN_HAN_CHAPTER.buildBrief(CHART, CONTEXT);
    if (!brief) throw new Error('expected a vận hạn brief for 2027');
    const khung = VAN_HAN_CHAPTER.khung(brief, CHART, CONTEXT);
    const year = vanHanYearOf(CHART, 2027, 2026);

    expect(khung.title).toBe('Vận hạn năm Đinh Mùi 2027');
    expect(khung.quote).toBe(year && LINH_VUC[year.cungTieuHan].chuDeNam);
  });
});
