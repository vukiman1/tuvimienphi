import { Sac, type LuanDe } from '../luan-de.js';

/**
 * Quan hệ giữa cung Mệnh và cung Thân. Mệnh chủ tiền vận, Thân chủ hậu vận — thế đứng giữa hai cung
 * cho biết hai nửa cuộc đời nối nhau kiểu gì.
 *
 * Bản nháp chưa có người biết tử vi soát.
 */
export enum TheMenhThan {
  Trung = 'trùng',
  TamHop = 'tam hợp',
  XungChieu = 'xung chiếu',
  NhiHop = 'nhị hợp',
  Khac = 'không có thế rõ',
}

const de = (y: string, sac: Sac, ...tuKhoa: string[]): LuanDe => ({
  y,
  do: [],
  sac,
  trong: 84,
  tuKhoa,
});

export const MENH_THAN_LUAN: Readonly<Record<TheMenhThan, readonly LuanDe[]>> = {
  [TheMenhThan.Trung]: [
    de(
      'Thân trùng Mệnh nên hai nửa cuộc đời đi một mạch, không có khúc rẽ lớn',
      Sac.Thuan,
      'một mạch',
      'khúc rẽ',
    ),
    de(
      'không có cung nào kéo lệch nên cũng ít có ngoại lực đẩy mình đi xa hơn',
      Sac.Nghich,
      'ngoại lực',
      'đi xa hơn',
    ),
  ],
  [TheMenhThan.TamHop]: [
    de(
      'Mệnh và Thân đứng thế tam hợp nên hậu vận nối tiếp được cái tiền vận gây dựng',
      Sac.Thuan,
      'tam hợp',
      'nối tiếp',
    ),
    de(
      'hai phần đời cùng chiều nên thuận thì thuận cả, mà vấp thì cũng vấp cả',
      Sac.Nghich,
      'cùng chiều',
      'vấp',
    ),
  ],
  [TheMenhThan.XungChieu]: [
    de(
      'Mệnh và Thân xung chiếu nhau nên nửa sau cuộc đời thường rẽ khác nửa đầu',
      Sac.Nghich,
      'xung chiếu',
      'rẽ khác',
    ),
    de(
      'chính chỗ kéo ngược đó lại buộc mình phải chọn, và chọn xong thì đi nhanh hơn',
      Sac.Thuan,
      'kéo ngược',
      'phải chọn',
    ),
  ],
  [TheMenhThan.NhiHop]: [
    de(
      'Mệnh và Thân nhị hợp nên hai phần đời bổ cho nhau một cách kín đáo',
      Sac.Thuan,
      'nhị hợp',
      'kín đáo',
    ),
    de(
      'thế bổ trợ này nhẹ, muốn thấy rõ thì phải chủ động dùng tới',
      Sac.Nghich,
      'nhẹ',
      'chủ động',
    ),
  ],
  [TheMenhThan.Khac]: [
    de('Mệnh và Thân không đứng thế nào rõ rệt nên hai phần đời khá độc lập', Sac.Thuan, 'độc lập'),
    de(
      'ít liên hệ nên cái gây dựng ở nửa đầu không tự động chuyển sang nửa sau',
      Sac.Nghich,
      'không tự động',
    ),
  ],
};
