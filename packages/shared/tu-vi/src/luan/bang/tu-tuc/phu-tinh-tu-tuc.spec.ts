import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_TU_TUC } from './phu-tinh-tu-tuc.js';

const TU_CAM = [
  'người bạn đời',
  'hôn nhân',
  'hôn sự',
  'đa tình',
  'ngoài luồng',
  'sự nghiệp',
  'kiếm tiền',
  'tiền bạc',
  'tài lộc',
  'cha mẹ',
];

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

describe('PHU_TINH_TU_TUC', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_TU_TUC).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề con cái', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_TU_TUC[sao as keyof typeof PHU_TINH_TU_TUC]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('không có mệnh đề nào lạc sang người bạn đời, sự nghiệp, tiền bạc hay cha mẹ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TU_TUC)) {
      for (const tu of TU_CAM) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TU_TUC)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không từ khoá nào chứa tên sao, vì bài chỉ cần gọi tên sao là đã khớp từ khoá', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TU_TUC)) {
      for (const tu of claim?.tuKhoa ?? []) {
        const trung = TEN_SAO.filter((ten) => tu.toLowerCase().includes(ten));
        expect([sao, tu, trung]).toEqual([sao, tu, []]);
      }
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TU_TUC)) {
      expect([sao, claim?.y, VO_CHONG.test(claim?.y ?? '')]).toEqual([sao, claim?.y, false]);
    }
  });
});
