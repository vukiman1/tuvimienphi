import {
  CAN,
  type CanChiIndex,
  chartFromBirthInput,
  CHI,
  CHINH_TINH_NGU_HANH,
  CHINH_TINH_POLARITY,
  type ChinhTinhName,
  cungNameAt,
  isHungTinh,
  PHU_TINH_NGU_HANH,
  type PhuTinhName,
  type SaoView as EngineSao,
  type TuViChart,
} from '@org/shared-tu-vi';
import type { BirthInput } from '@/features/la-so/birth-input';
import type { ChartView, ChinhTinhView, CungView, SaoView } from '@/features/la-so/chart-types';

/** Bắc cầu từ kết quả engine sang hình dạng giao diện đang vẽ. */

/** Ngũ hành của mười hai chi, để in dòng "+Thổ" dưới can chi của cung. */
const CHI_ELEMENTS = [
  '+Thuỷ',
  '-Thổ',
  '+Mộc',
  '-Mộc',
  '+Thổ',
  '-Hoả',
  '+Hoả',
  '-Thổ',
  '+Kim',
  '-Kim',
  '+Thổ',
  '-Thuỷ',
] as const;

/**
 * Sao xấu đọc theo cột riêng bên phải trong ô cung. Danh sách này chỉ quyết định chỗ đứng và màu
 * chữ, không mang ý nghĩa luận giải.
 */

function toSaoView(star: EngineSao<PhuTinhName>): SaoView {
  return {
    name: star.name,
    rating: star.rating,
    element: PHU_TINH_NGU_HANH[star.name],
  };
}

function canChiOf(pillar: CanChiIndex): string {
  return `${CAN[pillar.can]} ${CHI[pillar.chi]}`;
}

/** Can viết tắt kèm chi, đúng kiểu "C.Thìn" mà ô cung đang in. */
function shortCanChi(can: number, chi: number): string {
  return `${CAN[can].charAt(0)}.${CHI[chi]}`;
}

/** Sao của hai tầng phủ không mang bậc miếu vượng — trang gốc chỉ in tên. */
function toLuuSaoView(name: PhuTinhName): SaoView {
  return { name, rating: null, element: PHU_TINH_NGU_HANH[name] };
}

function toChinhTinhView(star: EngineSao<ChinhTinhName>): ChinhTinhView {
  return {
    name: star.name.toUpperCase(),
    polarity: CHINH_TINH_POLARITY[star.name],
    rating: star.rating,
    element: CHINH_TINH_NGU_HANH[star.name],
  };
}

function toCungViews(chart: TuViChart): readonly CungView[] {
  return chart.cungs.map((cung) => {
    const phuTinh = [...cung.phuTinh];
    return {
      index: cung.chiIndex,
      chi: CHI[cung.chiIndex],
      canChi: shortCanChi(cung.can, cung.chiIndex),
      name: cung.name.toUpperCase(),
      element: CHI_ELEMENTS[cung.chiIndex],
      daiVanStartAge: cung.daiVanStartAge,
      monthOrder: cung.cungThang === 0 ? '' : `Th.${cung.cungThang}`,
      isMenh: cung.isMenh,
      isThan: cung.isThan,
      hasTuan: cung.hasTuan,
      hasTriet: cung.hasTriet,
      daiVan: cung.daiVanLabel,
      trangSinh: cung.trangSinh,
      luuNien: cung.luuNienLabel,
      luuTinh: cung.luuTinh.map(toLuuSaoView),
      daiVanTinh: cung.daiVanTinh.map(toLuuSaoView),
      chinhTinh: cung.chinhTinh.map(toChinhTinhView),
      isVoChinhDieu: cung.isVoChinhDieu,
      chinhTinhMuon: cung.chinhTinhMuon.map(toChinhTinhView),
      catTinh: phuTinh.filter((star) => !isHungTinh(star.name)).map(toSaoView),
      hungTinh: phuTinh.filter((star) => isHungTinh(star.name)).map(toSaoView),
    };
  });
}

export interface ChartViewInput extends BirthInput {
  readonly viewYear: number;
}

/** Dựng lá số cho giao diện. Việc đổi lịch và an sao nằm ở `chartFromBirthInput` để backend đi
 * đúng một đường với chỗ này — hai bên ra lá số khác nhau là đầu độc cache luận giải. */
export function toChartView(input: ChartViewInput): ChartView {
  const { chart, solarDate, birthHour } = chartFromBirthInput(input, input.viewYear);

  return {
    meta: {
      fullName: input.fullName ?? '',
      solarYear: String(solarDate.getFullYear()),
      lunarYear: canChiOf(chart.pillars.year),
      solarMonth: `${solarDate.getMonth() + 1} (${chart.lunar.month})`,
      lunarMonth: canChiOf(chart.pillars.month),
      solarDay: `${solarDate.getDate()} (${chart.lunar.day})`,
      lunarDay: canChiOf(chart.pillars.day),
      solarHour: `${input.hour} (${birthHour.range})`,
      lunarHour: canChiOf(chart.pillars.hour),
      viewYear: String(input.viewYear),
      amDuong: chart.amDuong.label,
      banMenh: `${chart.banMenh} - ${chart.cuc.name}`,
      canLuong: chart.canLuong,
      chuMenh: chart.chuMenh,
      chuThan: chart.chuThan,
      laiNhanCung: cungNameAt(chart.laiNhanCung, chart.menhIndex),
    },
    cungs: toCungViews(chart),
  };
}
