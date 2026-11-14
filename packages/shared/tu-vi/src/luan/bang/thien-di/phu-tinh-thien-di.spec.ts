import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_THIEN_DI } from './phu-tinh-thien-di.js';

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
  'con cái',
  'cha mẹ',
  'gia đạo',
  'trong nhà',
];

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

describe('PHU_TINH_THIEN_DI', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_THIEN_DI).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề ra ngoài', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_THIEN_DI[sao as keyof typeof PHU_TINH_THIEN_DI]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('không có mệnh đề nào lạc sang người bạn đời, sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_THIEN_DI)) {
      for (const tu of TU_CAM) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_THIEN_DI)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không mệnh đề hay từ khoá nào chứa tên sao, vì tên sao đã nằm ở phần do', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_THIEN_DI)) {
      for (const loi of [claim?.y ?? '', ...(claim?.tuKhoa ?? [])]) {
        const trung = TEN_SAO.filter((ten) => loi.toLowerCase().includes(ten));
        expect([sao, loi, trung]).toEqual([sao, loi, []]);
      }
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_THIEN_DI)) {
      expect([sao, claim?.y, VO_CHONG.test(claim?.y ?? '')]).toEqual([sao, claim?.y, false]);
    }
  });
});
