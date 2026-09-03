import { CAN, CHI } from '@/lib/lunar-calendar';
import { getNapAm, type NguHanh } from '@/lib/nap-am';
import { CHI_COUNT, mod12 } from '@/lib/tu-vi/chi';

/** Mười hai cung đếm thuận theo chi kể từ cung Mệnh — thứ tự này là quy ước cố định của lá số. */
export const CUNG_NAMES = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
] as const;

export type CungName = (typeof CUNG_NAMES)[number];

/**
 * Cung Dần là mốc đếm của mọi phép an cung: tháng Giêng ứng với Dần, nên bảng dưới quy về chỉ số
 * chi (0 = Tý). Cộng 2 chính là dịch từ Tý sang Dần.
 */
const DAN_OFFSET = 2;

/**
 * An cung Mệnh: khởi từ Dần đếm thuận tới tháng sinh, rồi từ đó đếm nghịch tới giờ sinh.
 * An cung Thân dùng cùng mốc nhưng đếm thuận, nên Mệnh và Thân trùng nhau khi sinh giờ Tý hoặc Ngọ.
 */
export function anCungMenh(lunarMonth: number, hourChi: number): number {
  return mod12(DAN_OFFSET + (lunarMonth - 1) - hourChi);
}

export function anCungThan(lunarMonth: number, hourChi: number): number {
  return mod12(DAN_OFFSET + (lunarMonth - 1) + hourChi);
}

/** Tên cung tại một chi, biết cung Mệnh nằm ở đâu. */
export function cungNameAt(chiIndex: number, menhIndex: number): CungName {
  return CUNG_NAMES[mod12(chiIndex - menhIndex)];
}

/**
 * Ngũ hổ độn: can của cung Dần suy từ can năm theo chu kỳ 5, các cung sau đếm thuận.
 * Giáp/Kỷ khởi Bính Dần, Ất/Canh khởi Mậu Dần, Bính/Tân khởi Canh Dần, Đinh/Nhâm khởi Nhâm Dần,
 * Mậu/Quý khởi Giáp Dần.
 */
export function canOfCung(chiIndex: number, yearCan: number): number {
  const danCan = ((yearCan % 5) * 2 + 2) % 10;
  // Khoảng cách tính vòng: từ Dần đi thuận tới Hợi rồi mới sang Tý, nên Tý cách Dần 10 bước
  // chứ không phải −2. Trừ thẳng rồi mod 10 sẽ lệch can ở Tý và Sửu.
  return (danCan + mod12(chiIndex - DAN_OFFSET)) % 10;
}

/**
 * Lai nhân cung: cung mang thiên can trùng can năm sinh.
 *
 * Ngũ hổ độn rải mười can lên mười hai cung nên vòng đếm quay lại hai can đầu: Tý luôn trùng can với
 * Dần, Sửu luôn trùng với Mão. Tuổi Nhâm vì thế khớp cả Tý lẫn Dần, tuổi Tân khớp cả Sửu lẫn Mão;
 * tám can còn lại chỉ khớp đúng một cung.
 *
 * Trùng thì lấy Tý/Sửu, đối chiếu theo tuvi.vn. Đếm xuôi từ Tý rồi lấy cung khớp đầu tiên là đủ, vì
 * hai cung ấy đứng ngay đầu vòng chi.
 */
export function anLaiNhanCung(yearCan: number): number {
  for (let chiIndex = 0; chiIndex < CHI_COUNT; chiIndex += 1) {
    if (canOfCung(chiIndex, yearCan) === yearCan) {
      return chiIndex;
    }
  }
  throw new Error(`Không cung nào mang can năm sinh: can ${yearCan}`);
}

export function cungCanChi(chiIndex: number, yearCan: number): string {
  return `${CAN[canOfCung(chiIndex, yearCan)]} ${CHI[chiIndex]}`;
}

export interface Cuc {
  readonly name: string;
  readonly element: NguHanh;
  /** Số cục, cũng là bước nhảy khi an Tử Vi và tuổi khởi đại vận. */
  readonly value: number;
}

const CUC_BY_ELEMENT: Readonly<Record<NguHanh, Cuc>> = {
  Thủy: { name: 'Thủy Nhị Cục', element: 'Thủy', value: 2 },
  Mộc: { name: 'Mộc Tam Cục', element: 'Mộc', value: 3 },
  Kim: { name: 'Kim Tứ Cục', element: 'Kim', value: 4 },
  Thổ: { name: 'Thổ Ngũ Cục', element: 'Thổ', value: 5 },
  Hỏa: { name: 'Hỏa Lục Cục', element: 'Hỏa', value: 6 },
};

/** Cục lấy từ nạp âm của chính cặp can chi đóng tại cung Mệnh, không phải nạp âm trụ năm. */
export function anCuc(menhIndex: number, yearCan: number): Cuc {
  const element = getNapAm({ can: canOfCung(menhIndex, yearCan), chi: menhIndex }).element;
  return CUC_BY_ELEMENT[element];
}
