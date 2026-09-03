import { CAN, CHI, convertLunarToSolar, type CanChiIndex } from '@/lib/lunar-calendar';
import { castChart, type SaoView as EngineSao, type TuViChart } from '@/lib/tu-vi/cast-chart';
import { cungNameAt } from '@/lib/tu-vi/dia-ban';
import {
  CHINH_TINH_NGU_HANH,
  CHINH_TINH_POLARITY,
  PHU_TINH_NGU_HANH,
} from '@/lib/tu-vi/sao-ngu-hanh-data';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import { Gender as EngineGender } from '@/lib/tu-vi/van-han';
import { BIRTH_HOURS, CalendarType, Gender, type BirthInput } from '@/features/la-so/birth-input';
import type { ChartView, CungView, SaoView } from '@/features/la-so/chart-types';

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
const HUNG_TINH_NAMES = [
  'Kình Dương',
  'Đà La',
  'Hỏa Tinh',
  'Linh Tinh',
  'Địa Không',
  'Địa Kiếp',
  'Thiên Hình',
  'Thiên Diêu',
  'Thiên Khốc',
  'Thiên Hư',
  'Đại Hao',
  'Tiểu Hao',
  'Bạch Hổ',
  'Tang Môn',
  'Điếu Khách',
  'Tuế Phá',
  'Kiếp Sát',
  'Cô Thần',
  'Quả Tú',
  'Phá Toái',
  'Thiên Thương',
  'Thiên Sứ',
  'Thiên Không',
  'Hóa Kỵ',
  'Bệnh Phù',
  'Quan Phù',
  'Phục Binh',
] as const satisfies readonly PhuTinhName[];

const HUNG_TINH: ReadonlySet<PhuTinhName> = new Set(HUNG_TINH_NAMES);

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
      luuTinh: cung.luuTinh.map((name) => ({
        name,
        rating: null,
        element: PHU_TINH_NGU_HANH[name],
      })),
      chinhTinh: cung.chinhTinh.map((star) => ({
        name: star.name.toUpperCase(),
        polarity: CHINH_TINH_POLARITY[star.name],
        rating: star.rating,
        element: CHINH_TINH_NGU_HANH[star.name],
      })),
      catTinh: phuTinh.filter((star) => !HUNG_TINH.has(star.name)).map(toSaoView),
      hungTinh: phuTinh.filter((star) => HUNG_TINH.has(star.name)).map(toSaoView),
    };
  });
}

export interface ChartViewInput extends BirthInput {
  readonly viewYear: number;
}

/**
 * Dựng lá số cho giao diện từ thông tin sinh người dùng nhập.
 *
 * Nhập lịch âm thì đổi sang dương trước: can chi NGÀY suy từ số ngày Julian của lịch dương, không
 * suy thẳng từ ngày âm được. Form chưa hỏi tháng nhuận nên hiểu là tháng thường.
 */
export function toChartView(input: ChartViewInput): ChartView {
  const solarDate =
    input.calendar === CalendarType.Lunar
      ? convertLunarToSolar({
          day: input.day,
          month: input.month,
          year: input.year,
          isLeapMonth: false,
        })
      : new Date(input.year, input.month - 1, input.day);
  const birthHour = BIRTH_HOURS.find((entry) => entry.key === input.hour);
  if (!birthHour) {
    throw new Error(`Giờ sinh không có trong bảng: ${input.hour}`);
  }

  const chart = castChart({
    solarDate,
    hour: birthHour.hour,
    gender: input.gender === Gender.Male ? EngineGender.Nam : EngineGender.Nu,
    viewYear: input.viewYear,
  });

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
