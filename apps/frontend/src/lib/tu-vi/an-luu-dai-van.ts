import type { CanChiIndex } from '@/lib/lunar-calendar';
import { anSaoTheoTru } from '@/lib/tu-vi/an-sao-theo-tru';
import type { PhuTinhName, SaoName } from '@/lib/tu-vi/sao-names';
import type { SaoPlacement } from '@/lib/tu-vi/sao-placement';
import { anTuHoa, type TuHoa } from '@/lib/tu-vi/tu-hoa';

/**
 * Tầng `ĐV.*`: mười hai sao an lại theo trụ can chi của **cung đại vận**, không theo năm xem. Vì
 * vậy chúng đứng yên suốt một vận mười năm rồi nhảy một lần khi lá số sang vận mới.
 *
 * Dò và kiểm trên hai mươi tám lá số tuvi.vn phủ đủ mười can và mười một trong mười hai chi: 322 ô,
 * không ô nào lệch.
 */

/** Sáu sao dùng lại đúng bảng natal — năm sao theo can cung đại vận, riêng Thiên Mã theo chi. */
const REUSED_NAMES: ReadonlySet<PhuTinhName> = new Set<PhuTinhName>([
  'Lộc Tồn',
  'Kình Dương',
  'Đà La',
  'Thiên Khôi',
  'Thiên Việt',
  'Thiên Mã',
]);

/**
 * Văn Xương và Văn Khúc phải chép bảng riêng vì tầng natal an chúng theo giờ sinh. Bỏ trống ở Đinh
 * và Mậu, giống tầng lưu niên: tuvi.vn không an hai sao này ở hai can đó.
 *
 * Bảng lệch tầng lưu niên đúng **một ô**: tại can Canh, tầng đại vận đưa Văn Khúc về Hợi thay vì
 * Mão. Bốn lá số can Canh đều thế, mà tầng lưu niên của chính chúng vẫn để Văn Khúc ở Mão — nên đây
 * là hai bảng khác nhau thật, không phải một bảng chép sai.
 */
const VAN_XUONG_BY_CAN: readonly (number | null)[] = [5, 6, 8, null, null, 9, 11, 0, 2, 3];
const VAN_KHUC_BY_CAN: readonly (number | null)[] = [9, 8, 6, null, null, 5, 11, 2, 0, 11];

/** Can Nhâm — can duy nhất tầng này hoá khác tầng sinh niên. */
const CAN_NHAM = 8;

function xuongKhucAt(can: number): readonly SaoPlacement<PhuTinhName>[] {
  const pairs = [
    ['Văn Xương', VAN_XUONG_BY_CAN[can]],
    ['Văn Khúc', VAN_KHUC_BY_CAN[can]],
  ] as const;
  return pairs.flatMap(([name, chiIndex]) => (chiIndex === null ? [] : [{ name, chiIndex }]));
}

/**
 * Tứ hoá của tầng đại vận trùng bảng sinh niên ở chín can. Riêng Nhâm, hoá Khoa vào Thiên Phủ chứ
 * không vào Tả Phù như tầng sinh niên của chính trang — ba lá số can Nhâm đều thế.
 */
function anTuHoaDaiVan(can: number): readonly TuHoa[] {
  const tuHoa = anTuHoa(can);
  if (can !== CAN_NHAM) {
    return tuHoa;
  }
  return tuHoa.map((entry) =>
    entry.hoa === 'Hóa Khoa' ? { hoa: entry.hoa, star: 'Thiên Phủ' } : entry,
  );
}

/**
 * `tru` là can chi của cung đại vận đang hiệu lực; `starPlaces` là vị trí natal của mọi sao, để bốn
 * hoá khí đóng đúng vào cung của sao nhận hoá.
 */
export function anLuuDaiVanTinh(
  tru: CanChiIndex,
  starPlaces: ReadonlyMap<SaoName, number>,
): readonly SaoPlacement<PhuTinhName>[] {
  const hoaKhi = anTuHoaDaiVan(tru.can).flatMap(({ hoa, star }) => {
    const chiIndex = starPlaces.get(star);
    // Tả Phù và Hữu Bật không phải lúc nào cũng có mặt; nhánh rỗng bỏ qua hoá không có chỗ đóng.
    return chiIndex === undefined ? [] : [{ name: hoa, chiIndex }];
  });

  return [...anSaoTheoTru(REUSED_NAMES, tru), ...xuongKhucAt(tru.can), ...hoaKhi];
}
