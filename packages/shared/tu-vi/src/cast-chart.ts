import {
  convertSolarToLunar,
  getDayPillar,
  getHourPillar,
  getMonthPillar,
  getYearPillar,
  type CanChiIndex,
  type LunarDate,
} from './lich/lunar-calendar.js';
import { getNapAm } from './lich/nap-am.js';
import { anChinhTinh } from './an-chinh-tinh.js';
import { anLuuDaiVanTinh } from './an-luu-dai-van.js';
import { anLuuTinh } from './an-luu-tinh.js';
import { anHoaLinhTinh } from './an-hoa-linh-tinh.js';
import { anPhuTinh } from './an-phu-tinh.js';
import { anPhuTinhSuyDien } from './an-phu-tinh-suy-dien.js';
import {
  anVongTrangSinh,
  chuMenhOf,
  chuThanOf,
  phuTinhRatingOf,
  ratingOf,
} from './an-vong-trang-sinh.js';
import {
  anCuc,
  anCungMenh,
  anCungThan,
  anLaiNhanCung,
  canOfCung,
  cungNameAt,
  type Cuc,
} from './dia-ban.js';
import { CHI_COUNT, xungChieuIndex } from './chi.js';
import { anLuuNienLabels } from './luu-nien.js';
import type { ChinhTinhName, PhuTinhName, SaoName } from './sao-names.js';
import type { SaoPlacement } from './sao-placement.js';
import type { Rating } from './sao-rating.js';
import { anCungThang, anCungThangGieng, anTieuHan } from './tieu-han.js';
import { anCanLuong, formatCanLuong } from './can-luong.js';
import { anTuHoa, type TuHoa } from './tu-hoa.js';
import { anTriet, anTuan, type BlockedPair } from './tuan-triet.js';
import {
  Gender,
  ageInYear,
  anAmDuong,
  anDaiVan,
  anDaiVanLabels,
  daiVanAt,
  type AmDuong,
  type DaiVan,
} from './van-han.js';

export interface NatalInput {
  /** Ngày dương lịch. Phần giờ trong `Date` bị bỏ qua — giờ sinh lấy từ `hour`. */
  readonly solarDate: Date;
  /** Giờ đồng hồ 0–23. Nhận giờ chứ không nhận chi: xem ghi chú về giờ Tý bên dưới. */
  readonly hour: number;
  readonly gender: Gender;
}

export interface BirthInput extends NatalInput {
  /** Năm đang xem, quyết định nhãn `ĐV.*`. Bỏ trống thì không có nhãn nào. */
  readonly viewYear?: number;
}

const EARLY_TY_HOUR = 23;

/** Giờ Tý trải qua nửa đêm nên nằm ở hai đầu bảng: 23h và 0h đều là Tý. */
function hourChiOf(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

/**
 * Giờ Tý sớm (23:00–23:59) đã thuộc về ngày âm HÔM SAU, dù đồng hồ dương lịch vẫn là hôm nay.
 * Bỏ qua chỗ này thì ngày âm lệch một, kéo theo Tử Vi lệch và cả mười bốn chính tinh sai theo.
 *
 * Cộng theo ngày chứ không cộng mili-giây: hôm Việt Nam đổi múi giờ 13/6/1975, ngày 12/6 dài hai
 * mươi lăm tiếng nên cộng trọn một ngày mili-giây vào nó vẫn rơi lại chính nó.
 */
function effectiveDate(solarDate: Date, hour: number): Date {
  if (hour !== EARLY_TY_HOUR) {
    return solarDate;
  }
  return new Date(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate() + 1);
}

export interface SaoView<N extends SaoName = SaoName> {
  readonly name: N;
  /** `null` là câu trả lời hợp lệ: phần lớn phụ tinh không mang bậc nào. */
  readonly rating: Rating | null;
}

export interface NatalCungView {
  readonly chiIndex: number;
  readonly name: string;
  readonly can: number;
  readonly isMenh: boolean;
  readonly isThan: boolean;
  readonly hasTuan: boolean;
  readonly hasTriet: boolean;
  readonly chinhTinh: readonly SaoView<ChinhTinhName>[];
  /** Cung không có chính tinh nào toạ thủ. */
  readonly isVoChinhDieu: boolean;
  /**
   * Chính tinh mượn từ cung xung chiếu khi cung này vô chính diệu, giữ nguyên bậc miếu vượng ở cung
   * gốc của chúng. Rỗng khi cung đã có chính tinh của chính nó.
   */
  readonly chinhTinhMuon: readonly SaoView<ChinhTinhName>[];
  readonly phuTinh: readonly SaoView<PhuTinhName>[];
  readonly trangSinh: string;
  readonly daiVanStartAge: number;
}

export interface CungView extends NatalCungView {
  /** Sao của tầng lưu niên, rỗng khi không truyền năm xem. In kèm tiền tố `L.` trên lá số. */
  readonly luuTinh: readonly PhuTinhName[];
  /** Sao của tầng lưu đại vận; đổi theo vận chứ không theo năm. In kèm tiền tố `ĐV.`. */
  readonly daiVanTinh: readonly PhuTinhName[];
  readonly daiVanLabel: string;
  /** Nhãn `LN.*`; rỗng khi không truyền năm xem. */
  readonly luuNienLabel: string;
  /** Cung tháng 1–12 của năm đang xem; 0 khi không truyền năm xem. */
  readonly cungThang: number;
}

export interface NatalChart {
  /** Ngày âm lá số thực sự được lập từ — đã dời sang hôm sau nếu sinh giờ Tý sớm. */
  readonly lunar: LunarDate;
  readonly pillars: {
    readonly year: CanChiIndex;
    readonly month: CanChiIndex;
    readonly day: CanChiIndex;
    readonly hour: CanChiIndex;
  };
  readonly banMenh: string;
  /** Cân lượng đã đọc thành chữ, ví dụ "4 lượng 2 chỉ". */
  readonly canLuong: string;
  readonly chuMenh: string;
  readonly chuThan: string;
  readonly cuc: Cuc;
  readonly amDuong: AmDuong;
  readonly menhIndex: number;
  readonly thanIndex: number;
  /** Chi của lai nhân cung — cung mang can trùng can năm sinh. */
  readonly laiNhanCung: number;
  readonly tuan: BlockedPair;
  readonly triet: BlockedPair;
  readonly tuHoa: readonly TuHoa[];
  readonly daiVan: readonly DaiVan[];
  /** Chi của giờ sinh (0–11), khác với giờ đồng hồ ở `NatalInput.hour`. */
  readonly hourChi: number;
  readonly gender: Gender;
  readonly cungs: readonly NatalCungView[];
}

export interface TuViChart extends NatalChart {
  /** Cung tiểu hạn của năm đang xem; `null` khi không truyền năm xem. */
  readonly tieuHan: number | null;
  readonly cungs: readonly CungView[];
}

function starsAt(placements: readonly SaoPlacement<ChinhTinhName>[], chiIndex: number) {
  return placements
    .filter((star) => star.chiIndex === chiIndex)
    .map((star) => ({ name: star.name, rating: ratingOf(star.name, chiIndex) }));
}

const NO_LABELS: readonly string[] = new Array<string>(CHI_COUNT).fill('');
const NO_MONTHS: readonly number[] = new Array<number>(CHI_COUNT).fill(0);

/**
 * Phần lá số cố định theo ngày sinh: địa bàn, mười bốn chính tinh, tám mươi ba phụ tinh, miếu vượng
 * của cả hai nhóm, Tuần, Triệt, tứ hoá sinh niên, vòng Tràng Sinh, đại vận và cân lượng.
 *
 * Không có tầng nào ở đây đổi theo năm xem, nên một lá số gốc dùng lại được cho mọi năm.
 */
export function castNatal(input: NatalInput): NatalChart {
  const hourChi = hourChiOf(input.hour);
  const date = effectiveDate(input.solarDate, input.hour);
  const lunar = convertSolarToLunar(date);
  const year = getYearPillar(lunar.year);
  const day = getDayPillar(date);

  const menhIndex = anCungMenh(lunar.month, hourChi);
  const thanIndex = anCungThan(lunar.month, hourChi);
  const cuc = anCuc(menhIndex, year.can);
  const amDuong = anAmDuong(year.can, input.gender);

  const chinhTinh = anChinhTinh(lunar.day, cuc.value);
  const tuHoa = anTuHoa(year.can);
  const tabled = anPhuTinh({
    yearCan: year.can,
    yearChi: year.chi,
    month: lunar.month,
    hourChi,
  });
  const locTon = tabled.find((star) => star.name === 'Lộc Tồn');
  // Vòng Bác Sĩ khởi tại Lộc Tồn, nên phần suy diễn phải chạy sau phần tra bảng.
  const derived = anPhuTinhSuyDien({
    yearChi: year.chi,
    month: lunar.month,
    day: lunar.day,
    hourChi,
    menhIndex,
    thanIndex,
    locTonIndex: locTon?.chiIndex ?? menhIndex,
    isForward: amDuong.isForward,
  });
  const hoaLinh = anHoaLinhTinh({
    yearChi: year.chi,
    hourChi,
    isForward: amDuong.isForward,
  });
  // Bác Sỹ và Phi Liêm có ở cả hai nguồn; giữ bản tra bảng, bỏ bản trùng.
  const seen = new Set(tabled.map((star) => star.name));
  const natal = [...tabled, ...derived.filter((star) => !seen.has(star.name)), ...hoaLinh];

  // Bốn hoá khí không có cung riêng: chúng đóng ngay tại cung của sao nhận hoá.
  const starPlaces = new Map<SaoName, number>(
    [...chinhTinh, ...natal].map((star) => [star.name, star.chiIndex]),
  );
  const hoaKhi = tuHoa.flatMap(({ hoa, star }) => {
    const chiIndex = starPlaces.get(star);
    // Mọi sao nhận hoá đều đã được an ở trên; nhánh rỗng chỉ để thoả kiểu trả về của `Map.get`.
    return chiIndex === undefined ? [] : [{ name: hoa, chiIndex }];
  });

  const phuTinh = [...natal, ...hoaKhi];
  const tuan = anTuan(year);
  const triet = anTriet(year.can);
  const daiVan = anDaiVan(menhIndex, cuc.value, amDuong.isForward);
  const trangSinh = anVongTrangSinh(cuc.value, amDuong.isForward);
  const startAgeByChi = new Map(daiVan.map((span) => [span.chiIndex, span.startAge]));

  const placed = Array.from({ length: CHI_COUNT }, (_, chiIndex) => ({
    chiIndex,
    name: cungNameAt(chiIndex, menhIndex),
    can: canOfCung(chiIndex, year.can),
    isMenh: chiIndex === menhIndex,
    isThan: chiIndex === thanIndex,
    hasTuan: tuan.includes(chiIndex),
    hasTriet: triet.includes(chiIndex),
    chinhTinh: starsAt(chinhTinh, chiIndex),
    trangSinh: trangSinh[chiIndex],
    phuTinh: phuTinh
      .filter((star) => star.chiIndex === chiIndex)
      .map((star) => ({ name: star.name, rating: phuTinhRatingOf(star.name, chiIndex) })),
    daiVanStartAge: startAgeByChi.get(chiIndex) ?? 0,
  }));

  // Mượn sao phải chạy sau khi cả mười hai cung đã an xong, vì nó đọc sang cung xung chiếu.
  const cungs = placed.map((cung) => {
    const isVoChinhDieu = cung.chinhTinh.length === 0;
    return {
      ...cung,
      isVoChinhDieu,
      chinhTinhMuon: isVoChinhDieu ? placed[xungChieuIndex(cung.chiIndex)].chinhTinh : [],
    };
  });

  return {
    lunar,
    pillars: {
      year,
      month: getMonthPillar(lunar),
      day,
      hour: getHourPillar(day.can, hourChi),
    },
    banMenh: getNapAm(year).name,
    canLuong: formatCanLuong(
      anCanLuong({ yearPillar: year, lunarMonth: lunar.month, lunarDay: lunar.day, hourChi }),
    ),
    chuMenh: chuMenhOf(year.chi),
    chuThan: chuThanOf(year.chi),
    cuc,
    amDuong,
    menhIndex,
    thanIndex,
    laiNhanCung: anLaiNhanCung(year.can),
    tuan,
    triet,
    tuHoa,
    daiVan,
    hourChi,
    gender: input.gender,
    cungs,
  };
}

/** Vị trí natal của mọi sao, để hoá khí của tầng đại vận đóng đúng vào cung của sao nhận hoá. */
function starPlacesOf(natal: NatalChart): ReadonlyMap<SaoName, number> {
  return new Map(
    natal.cungs.flatMap((cung) =>
      [...cung.chinhTinh, ...cung.phuTinh].map((star): [SaoName, number] => [
        star.name,
        cung.chiIndex,
      ]),
    ),
  );
}

/**
 * Sáu tầng đổi theo năm xem: nhãn `ĐV.*`, nhãn `LN.*`, cung tiểu hạn, cung tháng, lưu tinh và lưu
 * tinh theo đại vận. Bỏ trống năm xem thì cả sáu về rỗng.
 *
 * Nhận lá số gốc đã dựng sẵn, nên đổi năm không phải an lại sao natal nào.
 */
export function applyViewYear(natal: NatalChart, viewYear: number | undefined): TuViChart {
  const age = viewYear === undefined ? null : ageInYear(natal.lunar.year, viewYear);
  const tieuHan = age === null ? null : anTieuHan(natal.pillars.year.chi, natal.gender, age);
  const daiVanLabels = age === null ? NO_LABELS : anDaiVanLabels(natal.daiVan, age);
  const luuNienLabels =
    age === null
      ? NO_LABELS
      : anLuuNienLabels({ spans: natal.daiVan, age, isForward: natal.amDuong.isForward });
  const cungThang =
    tieuHan === null
      ? NO_MONTHS
      : anCungThang(anCungThangGieng(tieuHan, natal.lunar.month, natal.hourChi));
  const luuTinh =
    viewYear === undefined
      ? []
      : anLuuTinh(getYearPillar(convertSolarToLunar(new Date(viewYear, 6, 1)).year));

  const currentDaiVan = age === null ? undefined : daiVanAt(natal.daiVan, age);
  const daiVanTinh =
    currentDaiVan === undefined
      ? []
      : anLuuDaiVanTinh(
          {
            can: canOfCung(currentDaiVan.chiIndex, natal.pillars.year.can),
            chi: currentDaiVan.chiIndex,
          },
          starPlacesOf(natal),
        );

  return {
    ...natal,
    tieuHan,
    cungs: natal.cungs.map((cung) => ({
      ...cung,
      luuTinh: luuTinh.filter((star) => star.chiIndex === cung.chiIndex).map((star) => star.name),
      daiVanTinh: daiVanTinh
        .filter((star) => star.chiIndex === cung.chiIndex)
        .map((star) => star.name),
      daiVanLabel: daiVanLabels[cung.chiIndex],
      luuNienLabel: luuNienLabels[cung.chiIndex],
      cungThang: cungThang[cung.chiIndex],
    })),
  };
}

/** Dựng lá số hoàn chỉnh từ ngày sinh dương lịch. */
export function castChart(input: BirthInput): TuViChart {
  return applyViewYear(castNatal(input), input.viewYear);
}
