import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_PHU_THE } from './phu-tinh-phu-the.js';

const TU_CAM = [
  'sự nghiệp',
  'công việc',
  'kiếm tiền',
  'nguồn thu',
  'tiền bạc',
  'tài lộc',
  'con cái',
  'cha mẹ',
];

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

describe('PHU_TINH_PHU_THE', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_PHU_THE).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề người bạn đời', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_PHU_THE[sao as keyof typeof PHU_TINH_PHU_THE]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('không có mệnh đề nào lạc sang sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHU_THE)) {
      for (const tu of TU_CAM) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHU_THE)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không từ khoá nào chứa tên sao, vì bài chỉ cần gọi tên sao là đã khớp từ khoá', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHU_THE)) {
      for (const tu of claim?.tuKhoa ?? []) {
        const trung = TEN_SAO.filter((ten) => tu.toLowerCase().includes(ten));
        expect([sao, tu, trung]).toEqual([sao, tu, []]);
      }
    }
  });

  it('không gọi người bạn đời là vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_PHU_THE)) {
      expect([sao, claim?.y, VO_CHONG.test(claim?.y ?? '')]).toEqual([sao, claim?.y, false]);
    }
  });
});
