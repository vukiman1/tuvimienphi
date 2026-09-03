import { mod12 } from '@/lib/tu-vi/chi';
import type { PhuTinhName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';

/**
 * Những phụ tinh an được bằng phép tính chứ không phải tra bảng. Tách khỏi `phu-tinh-data.ts` vì
 * đó là dữ liệu chép nguyên, còn đây là luật — trộn chung thì không biết chỗ nào suy ra từ đâu.
 *
 * Mọi luật dưới đây đều đối chiếu khớp 33 lá số trong `tuvi-vn-charts.fixture.ts`.
 */

export interface DerivedParams {
  readonly yearChi: number;
  /** Tháng âm, 1–12. */
  readonly month: number;
  /** Ngày âm, 1–30. */
  readonly day: number;
  readonly hourChi: number;
  readonly menhIndex: number;
  readonly thanIndex: number;
  readonly locTonIndex: number;
  /** Dương Nam và Âm Nữ đi thuận. */
  readonly isForward: boolean;
}

/**
 * Vòng Bác Sĩ: mười hai sao khởi tại Lộc Tồn rồi đi theo chiều âm dương nam nữ, mỗi sao một bước.
 * Phi Liêm ở bước sáu nên hai chiều trùng nhau — đó là lý do nó nằm ở bảng tra theo can năm mà vẫn
 * không mâu thuẫn với vòng này.
 */
const VONG_BAC_SI = [
  'Bác Sỹ',
  'Lực Sỹ',
  'Thanh Long',
  'Tiểu Hao',
  'Tướng Quân',
  'Tấu Thư',
  'Phi Liêm',
  'Hỷ Thần',
  'Bệnh Phù',
  'Đại Hao',
  'Phục Binh',
  'Quan Phủ',
] as const satisfies readonly PhuTinhName[];

/** Hai sao luôn đóng cố định theo cung, không theo chi. */
const BY_PALACE = [
  { name: 'Thiên Thương', fromMenh: 5 }, // cung Nô Bộc
  { name: 'Thiên Sứ', fromMenh: 7 }, // cung Tật Ách
] as const satisfies ReadonlyArray<{ name: PhuTinhName; fromMenh: number }>;

export function anPhuTinhSuyDien(params: DerivedParams): readonly SaoPlacement<PhuTinhName>[] {
  const step = params.isForward ? 1 : -1;
  const { yearChi, month, day, hourChi, menhIndex, thanIndex, locTonIndex } = params;

  return [
    ...VONG_BAC_SI.map((name, index) => ({
      name,
      chiIndex: mod12(locTonIndex + index * step),
    })),
    ...BY_PALACE.map(({ name, fromMenh }) => ({ name, chiIndex: mod12(menhIndex + fromMenh) })),

    // Tam Thai và Bát Tọa soi gương nhau qua mốc đếm, cùng chạy theo tháng và ngày sinh.
    { name: 'Tam Thai', chiIndex: mod12(month + day + 2) },
    { name: 'Bát Tọa', chiIndex: mod12(-month - day) },

    // Ân Quang và Thiên Quý cũng là một cặp, đổi vai ngày với giờ.
    { name: 'Ân Quang', chiIndex: mod12(day - hourChi + 8) },
    { name: 'Thiên Quý', chiIndex: mod12(hourChi - day + 6) },

    // Thiên Tài đo từ cung Mệnh, Thiên Thọ đo từ cung Thân, cùng cộng thêm chi năm.
    { name: 'Thiên Tài', chiIndex: mod12(menhIndex + yearChi) },
    { name: 'Thiên Thọ', chiIndex: mod12(thanIndex + yearChi) },

    // Đẩu Quân: từ cung Thái Tuế đếm nghịch tới tháng sinh, rồi đếm thuận tới giờ sinh.
    { name: 'Đầu Quân', chiIndex: mod12(yearChi - month + 1 + hourChi) },
  ];
}
