import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { CHINH_TINH_THIEN_DI } from './chinh-tinh-thien-di.js';

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

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const MENH_DE = Object.entries(CHINH_TINH_THIEN_DI).flatMap(([sao, cell]) =>
  [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()].map((de) => ({
    sao,
    de,
  })),
);

describe('CHINH_TINH_THIEN_DI', () => {
  it('có đúng một mệnh đề thuận và một mệnh đề nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const chieu = CHINH_TINH_THIEN_DI[sao]?.chung.map((de) => de.sac);
      expect([sao, chieu]).toEqual([sao, [Sac.Thuan, Sac.Nghich]]);
    }
  });

  it('không có mệnh đề nào lạc sang người bạn đời, sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
    for (const { sao, de } of MENH_DE) {
      for (const tu of TU_CAM) {
        expect([sao, tu, de.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const { sao, de } of MENH_DE) {
      for (const tu of de.tuKhoa) {
        expect([sao, tu, de.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không mệnh đề hay từ khoá nào chứa tên sao, vì tên sao đã nằm ở phần do', () => {
    for (const { sao, de } of MENH_DE) {
      for (const loi of [de.y, ...de.tuKhoa]) {
        const trung = TEN_SAO.filter((ten) => loi.toLowerCase().includes(ten));
        expect([sao, loi, trung]).toEqual([sao, loi, []]);
      }
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const { sao, de } of MENH_DE) {
      expect([sao, de.y, VO_CHONG.test(de.y)]).toEqual([sao, de.y, false]);
    }
  });
});
