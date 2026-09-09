import { Sac, type LuanDe } from '../luan-de.js';

const TRONG = 82;
const de = (y: string, sac: Sac, ...tuKhoa: string[]): LuanDe => ({
  y,
  do: [],
  sac,
  trong: TRONG,
  tuKhoa,
});

/**
 * Mười hai trạng thái của vòng Tràng Sinh, nói về THẾ THỊNH SUY của cung — cung đang ở đoạn lên,
 * đoạn đỉnh, hay đoạn thu lại. Đây là chiều thời gian, khác hẳn chiều tính chất mà sao nói.
 *
 * Bản nháp chưa có người biết tử vi soát, như mọi bảng khác.
 */
export const TRANG_SINH_LUAN: Readonly<Record<string, LuanDe>> = {
  'Tràng Sinh': de(
    'cung đang ở đoạn khởi, việc gì bắt đầu ở đây cũng có sức bật',
    Sac.Thuan,
    'đoạn khởi',
    'sức bật',
  ),
  'Mộc Dục': de(
    'cung còn non, dễ dao động và chưa định hình rõ',
    Sac.Nghich,
    'còn non',
    'dao động',
  ),
  'Quan Đới': de(
    'cung đã có hình có dạng, đang chuẩn bị vào việc thật',
    Sac.Thuan,
    'có hình có dạng',
    'vào việc',
  ),
  'Lâm Quan': de('cung vào chính vị, đủ sức làm được việc lớn', Sac.Thuan, 'chính vị', 'việc lớn'),
  'Đế Vượng': de('cung ở đỉnh, mạnh nhất trong cả vòng', Sac.Thuan, 'ở đỉnh', 'mạnh nhất'),
  Suy: de('cung đã qua đỉnh, đà bắt đầu chậm lại', Sac.Nghich, 'qua đỉnh', 'chậm lại'),
  Bệnh: de(
    'cung có trục trặc, phần này cần giữ gìn hơn phần khác',
    Sac.Nghich,
    'trục trặc',
    'giữ gìn',
  ),
  Tử: de('cung hết đà, muốn tiến phải mượn sức từ chỗ khác', Sac.Nghich, 'hết đà', 'mượn sức'),
  Mộ: de('cung thu vào, hợp tích luỹ và cất giữ hơn là bung ra', Sac.Thuan, 'thu vào', 'tích luỹ'),
  Tuyệt: de(
    'cung trống trải, dễ đứt đoạn rồi phải làm lại từ đầu',
    Sac.Nghich,
    'trống trải',
    'làm lại',
  ),
  Thai: de('cung mới manh nha, có mầm nhưng chưa rõ hình', Sac.Nghich, 'manh nha', 'chưa rõ'),
  Dưỡng: de('cung đang được nuôi, chờ đủ thì mới phát', Sac.Thuan, 'được nuôi', 'chờ đủ'),
};
