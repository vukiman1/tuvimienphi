import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_TAI_BACH } from './phu-tinh-tai-bach.js';

const TU_CAM = [
  'tình cảm',
  'hôn sự',
  'hôn nhân',
  'người khác giới',
  'trong nhà',
  'trong quan hệ',
  'trong mối quan hệ',
  'của hai người',
];

describe('PHU_TINH_TAI_BACH', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_TAI_BACH).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('không còn mệnh đề nào nói về tình cảm, hôn nhân hay gia đạo', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAI_BACH)) {
      for (const tu of TU_CAM) {
        expect([sao, claim?.y.includes(tu)]).toEqual([sao, false]);
      }
    }
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề tiền tài', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_TAI_BACH[sao as keyof typeof PHU_TINH_TAI_BACH]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAI_BACH)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });
});
