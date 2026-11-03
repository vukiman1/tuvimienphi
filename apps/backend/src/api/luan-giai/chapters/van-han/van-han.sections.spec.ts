import {
  castNatal,
  CUU_DIEU_LOI,
  Gender,
  KIM_LAU_LOI,
  LINH_VUC,
  saoChieuMenh,
  TAM_TAI_LOI,
  VanHanTone,
  vanHanYearOf,
  type VanHanYear,
} from '@org/shared-tu-vi';
import { KHUNG_TAI_BACH } from '../tai-bach/tai-bach.khung';
import {
  DAN_GIAN_OPENING,
  DAN_GIAN_TITLE,
  renderDanGianSection,
  renderLinhVucSection,
  renderVanKeTiepSection,
} from './van-han.sections';

const CURRENT_YEAR = 2026;
const TAM_TAI_YEAR = 2022;
const KIM_LAU_YEAR = 2025;
const CLEAR_YEAR = 2027;

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });

function yearOf(viewYear: number): VanHanYear {
  const year = vanHanYearOf(CHART, viewYear, CURRENT_YEAR);
  if (!year) throw new Error(`no vận hạn year for ${viewYear}`);
  return year;
}

describe('renderLinhVucSection', () => {
  const year = yearOf(CLEAR_YEAR);

  it('gives advice for a coming year', () => {
    const section = renderLinhVucSection({ ...year, tone: VanHanTone.Advice });

    expect(section.paragraphs).toContain(LINH_VUC[year.cungTieuHan].loiKhuyen);
    expect(section.paragraphs).not.toContain(LINH_VUC[year.cungTieuHan].nhinLai);
  });

  it('looks back on a past year instead of advising', () => {
    const section = renderLinhVucSection({ ...year, tone: VanHanTone.LookBack });

    expect(section.paragraphs).toContain(LINH_VUC[year.cungTieuHan].nhinLai);
    expect(section.paragraphs).not.toContain(LINH_VUC[year.cungTieuHan].loiKhuyen);
  });

  it('points to the chapter that reads the same life area', () => {
    const section = renderLinhVucSection({ ...year, cungTieuHan: 'Tài Bạch' });

    expect(section.paragraphs.join(' ')).toContain(`“${KHUNG_TAI_BACH.title}”`);
  });

  it('points to no chapter when no chapter reads that life area', () => {
    const section = renderLinhVucSection({ ...year, cungTieuHan: 'Huynh Đệ' });

    expect(section.paragraphs.join(' ')).not.toContain('xem thêm chương');
  });
});

describe('renderVanKeTiepSection', () => {
  it('names the year, age and cung the next đại vận starts at', () => {
    const year = yearOf(CLEAR_YEAR);
    const text = renderVanKeTiepSection(year)?.paragraphs.join(' ') ?? '';

    expect(text).toContain(`Từ năm ${year.namBatDauVanKeTiep}`);
    expect(text).toContain(`${year.daiVanKeTiep?.startAge} tuổi`);
    expect(text).toContain(`cung ${year.cungDaiVanKeTiep}`);
  });

  it('is left out when there is no next đại vận', () => {
    const year = yearOf(CLEAR_YEAR);

    expect(
      renderVanKeTiepSection({
        ...year,
        daiVanKeTiep: null,
        cungDaiVanKeTiep: null,
        namBatDauVanKeTiep: null,
      }),
    ).toBeNull();
  });
});

describe('renderDanGianSection', () => {
  it('labels itself as the folk way of reading', () => {
    const section = renderDanGianSection(CHART, yearOf(CLEAR_YEAR));

    expect(section.title).toBe(DAN_GIAN_TITLE);
    expect(section.paragraphs[0].startsWith(DAN_GIAN_OPENING)).toBe(true);
  });

  it('reads the sao chiếu mệnh for the age and gender', () => {
    const year = yearOf(CLEAR_YEAR);
    const section = renderDanGianSection(CHART, year);

    expect(section.paragraphs).toContain(CUU_DIEU_LOI[saoChieuMenh(year.tuoi, CHART.gender)]);
  });

  it('adds Tam Tai only in a Tam Tai year', () => {
    const tamTai = renderDanGianSection(CHART, yearOf(TAM_TAI_YEAR)).paragraphs.join(' ');
    const clear = renderDanGianSection(CHART, yearOf(CLEAR_YEAR)).paragraphs.join(' ');

    expect(tamTai).toContain(TAM_TAI_LOI);
    expect(clear).not.toContain(TAM_TAI_LOI);
  });

  it('adds Kim Lâu only at a Kim Lâu age', () => {
    const kimLau = renderDanGianSection(CHART, yearOf(KIM_LAU_YEAR)).paragraphs.join(' ');
    const clear = renderDanGianSection(CHART, yearOf(CLEAR_YEAR)).paragraphs.join(' ');

    expect(kimLau).toContain(KIM_LAU_LOI);
    expect(clear).not.toContain(KIM_LAU_LOI);
  });

  it('says plainly when the year has neither Tam Tai nor Kim Lâu', () => {
    const clear = renderDanGianSection(CHART, yearOf(CLEAR_YEAR)).paragraphs.join(' ');

    expect(clear).toContain('không phạm Tam Tai hay Kim Lâu');
  });
});
