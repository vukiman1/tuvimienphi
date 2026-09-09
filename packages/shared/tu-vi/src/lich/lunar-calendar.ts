const VN_TIMEZONE_OFFSET_HOURS = 7;
const SYNODIC_MONTH_DAYS = 29.530588853;
const NEW_MOON_EPOCH_JD = 2415021.076998695;

export const CAN = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;
export const CHI = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tị',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

export interface LunarDate {
  readonly day: number;
  readonly month: number;
  readonly year: number;
  readonly isLeapMonth: boolean;
}

function jdFromDate(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Math.floor(Jd1 + C1 - deltat + 0.5 + timeZone / 24);
}

function getSunLongitudeDegrees(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return (L / Math.PI) * 180;
}

function getSunLongitudeSextant(jdn: number, timeZone: number): number {
  return Math.floor(getSunLongitudeDegrees(jdn, timeZone) / 30);
}

function getLunarMonth11(year: number, timeZone: number): number {
  const off = jdFromDate(31, 12, year) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH_DAYS);
  let newMoon = getNewMoonDay(k, timeZone);
  if (getSunLongitudeSextant(newMoon, timeZone) >= 9) {
    newMoon = getNewMoonDay(k - 1, timeZone);
  }
  return newMoon;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - NEW_MOON_EPOCH_JD) / SYNODIC_MONTH_DAYS + 0.5);
  let i = 1;
  let last: number;
  let arc = getSunLongitudeSextant(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitudeSextant(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function convertSolarToLunar(date: Date): LunarDate {
  const timeZone = VN_TIMEZONE_OFFSET_HOURS;
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yy = date.getFullYear();

  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - NEW_MOON_EPOCH_JD) / SYNODIC_MONTH_DAYS);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let isLeapMonth = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeapMonth = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

/** Ngược của `jdFromDate`, theo đúng thuật toán lịch Gregory. */
function dateFromJd(jd: number): { day: number; month: number; year: number } {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((b * 146097) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

/**
 * Đổi ngày âm sang ngày dương — chiều ngược của `convertSolarToLunar`, dùng chung mọi mốc trăng
 * mới và tháng nhuận của nó nên hai chiều luôn khớp nhau.
 *
 * Cần cho lá số: can chi NGÀY suy từ số ngày Julian của lịch dương, không suy thẳng từ ngày âm được.
 */
export function convertLunarToSolar(lunar: LunarDate): Date {
  const timeZone = VN_TIMEZONE_OFFSET_HOURS;

  // Tháng 11 âm là mốc neo của cả năm. Tháng 11 và 12 neo vào chính năm âm đó; các tháng từ 1 đến
  // 10 rơi vào nửa sau của chu kỳ nên neo vào năm trước.
  const anchorYear = lunar.month < 11 ? lunar.year - 1 : lunar.year;
  const a11 = getLunarMonth11(anchorYear, timeZone);
  const b11 = getLunarMonth11(anchorYear + 1, timeZone);

  let offset = lunar.month - 11;
  if (offset < 0) {
    offset += 12;
  }

  // Năm nhuận có mười ba tuần trăng, nên mọi tháng kể từ tháng nhuận bị đẩy lùi một bậc — và bản
  // thân tháng nhuận cũng nằm sau tháng thường cùng số.
  if (b11 - a11 > 365) {
    const leapOffset = getLeapMonthOffset(a11, timeZone);
    if (lunar.isLeapMonth || offset >= leapOffset) {
      offset += 1;
    }
  }

  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH_JD) / SYNODIC_MONTH_DAYS);
  const monthStart = getNewMoonDay(k + offset, timeZone);
  const { day, month, year } = dateFromJd(monthStart + lunar.day - 1);

  return new Date(year, month - 1, day);
}

export interface CanChiIndex {
  readonly can: number;
  readonly chi: number;
}

export function getYearPillar(lunarYear: number): CanChiIndex {
  return { can: (lunarYear + 6) % 10, chi: (lunarYear + 8) % 12 };
}

export function getYearCanChi(lunarYear: number): string {
  const { can, chi } = getYearPillar(lunarYear);
  return `${CAN[can]} ${CHI[chi]}`;
}

export function getMonthPillar(lunar: LunarDate): CanChiIndex {
  return { can: (lunar.year * 12 + lunar.month + 3) % 10, chi: (lunar.month + 1) % 12 };
}

export function getMonthCanChi(lunar: LunarDate): string {
  const { can, chi } = getMonthPillar(lunar);
  return `${CAN[can]} ${CHI[chi]}`;
}

export function getDayPillar(date: Date): CanChiIndex {
  const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  return { can: (jd + 9) % 10, chi: (jd + 1) % 12 };
}

export function getDayCanChi(date: Date): string {
  const { can, chi } = getDayPillar(date);
  return `${CAN[can]} ${CHI[chi]}`;
}

/**
 * Ngũ thử độn: can của giờ Tý bằng `(can ngày mod 5) × 2`, các giờ sau đếm thuận theo chi.
 * Ba chỗ cần luật này — giờ hoàng đạo, nhị thập bát tú và lá số — nên nó ở đây thay vì chép lại.
 */
export function getHourPillar(dayCan: number, hourChi: number): CanChiIndex {
  return { can: ((((dayCan % 5) * 2 + hourChi) % 10) + 10) % 10, chi: hourChi };
}

export function getHourCanChi(dayCan: number, hourChi: number): string {
  const { can, chi } = getHourPillar(dayCan, hourChi);
  return `${CAN[can]} ${CHI[chi]}`;
}

// Solar-term boundaries matched to lichdungsu: day-granular, from the same
// TIET24 minute-offset table over the tropical year rather than an instant
// longitude, so a date belongs to whichever term has begun by that calendar day.
const TROPICAL_YEAR_MS = 31556925974.7;
const TIET_EPOCH_MS = Date.UTC(1900, 0, 6, 2, 5);
const TIET24_OFFSETS = [
  0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343,
  285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758,
];
const TIET24_NAMES = [
  'Tiểu Hàn',
  'Đại Hàn',
  'Lập Xuân',
  'Vũ Thủy',
  'Kinh Trập',
  'Xuân Phân',
  'Thanh Minh',
  'Cốc Vũ',
  'Lập Hạ',
  'Tiểu Mãn',
  'Mang Chủng',
  'Hạ Chí',
  'Tiểu Thử',
  'Đại Thử',
  'Lập Thu',
  'Xử Thử',
  'Bạch Lộ',
  'Thu Phân',
  'Hàn Lộ',
  'Sương Giáng',
  'Lập Đông',
  'Tiểu Tuyết',
  'Đại Tuyết',
  'Đông Chí',
] as const;

function tietStartDay(year: number, termIndex: number): number {
  const ms = TROPICAL_YEAR_MS * (year - 1900) + TIET24_OFFSETS[termIndex] * 60000 + TIET_EPOCH_MS;
  return new Date(ms).getUTCDate();
}

export function getSolarTerm(date: Date): string {
  const dd = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const tiet = tietStartDay(year, monthIndex * 2);
  const khi = tietStartDay(year, monthIndex * 2 + 1);

  if (dd >= tiet && dd < khi) return TIET24_NAMES[monthIndex * 2];
  if (dd >= khi) return TIET24_NAMES[monthIndex * 2 + 1];
  return TIET24_NAMES[(((monthIndex * 2 - 1) % 24) + 24) % 24];
}
