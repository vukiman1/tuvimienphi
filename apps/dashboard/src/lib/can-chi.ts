/**
 * Can-Chi (Thiên Can / Địa Chi) helpers — the sexagenary cycle used in tử vi. Day pillar is derived
 * from the Julian Day Number, which is the standard, calendar-accurate way to get the day's stem &
 * branch. Year pillar is derived from the Gregorian year.
 */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** Julian Day Number for a Gregorian date (at noon). */
function julianDayNumber(year: number, month: number, day: number): number {
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

export function dayCanChi(date: Date): string {
  const jdn = julianDayNumber(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const can = CAN[(jdn + 9) % 10];
  const chi = CHI[(jdn + 1) % 12];
  return `${can} ${chi}`;
}

export function yearCanChi(year: number): string {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return `${can} ${chi}`;
}
