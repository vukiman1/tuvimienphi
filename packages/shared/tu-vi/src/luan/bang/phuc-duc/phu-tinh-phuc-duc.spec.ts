import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_PHUC_DUC } from './phu-tinh-phuc-duc.js';

const TU_CAM = [
  'người bạn đời',
  'hôn nhân',
  'hôn sự',
  'đa tình',
  'ngoài luồng',
  'người khác giới',
  'tình cảm',
  'sự nghiệp',
  'công việc',
  'kiếm tiền',
  'tiền bạc',
  'tài lộc',
  'tài chính',
  'con cái',
  'cha mẹ',
];

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

describe('PHU_TINH_PHUC_DUC', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_PHUC_DUC).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề phúc phần', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_PHUC_DUC[sao as keyof typeof PHU_TINH_PHUC_DUC]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('không có mệnh đề nào lạc sang hôn nhân, sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHUC_DUC)) {
      for (const tu of TU_CAM) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHUC_DUC)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không từ khoá nào chứa tên sao, vì bài chỉ cần gọi tên sao là đã khớp từ khoá', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHUC_DUC)) {
      for (const tu of claim?.tuKhoa ?? []) {
        const trung = TEN_SAO.filter((ten) => tu.toLowerCase().includes(ten));
        expect([sao, tu, trung]).toEqual([sao, tu, []]);
      }
    }
  });

  it('không mệnh đề nào gọi tên sao, vì tên sao đã nằm ở nguồn của mệnh đề', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHUC_DUC)) {
      const trung = TEN_SAO.filter((ten) => claim?.y.toLowerCase().includes(ten));
      expect([sao, claim?.y, trung]).toEqual([sao, claim?.y, []]);
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHUC_DUC)) {
      expect([sao, claim?.y, VO_CHONG.test(claim?.y ?? '')]).toEqual([sao, claim?.y, false]);
    }
  });
});
