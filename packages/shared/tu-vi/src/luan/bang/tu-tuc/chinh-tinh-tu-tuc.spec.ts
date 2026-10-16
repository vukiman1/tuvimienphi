import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { CHINH_TINH_TU_TUC } from './chinh-tinh-tu-tuc.js';

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

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const MENH_DE = Object.entries(CHINH_TINH_TU_TUC).flatMap(([sao, cell]) =>
  [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()].map((de) => ({
    sao,
    de,
  })),
);

describe('CHINH_TINH_TU_TUC', () => {
  it('có đúng một mệnh đề thuận và một mệnh đề nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const chieu = CHINH_TINH_TU_TUC[sao]?.chung.map((de) => de.sac);
      expect([sao, chieu]).toEqual([sao, [Sac.Thuan, Sac.Nghich]]);
    }
  });

  it('không có mệnh đề nào lạc sang người bạn đời, sự nghiệp, tiền bạc hay cha mẹ', () => {
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

  it('không từ khoá nào chứa tên sao, vì bài chỉ cần gọi tên sao là đã khớp từ khoá', () => {
    for (const { sao, de } of MENH_DE) {
      for (const tu of de.tuKhoa) {
        const trung = TEN_SAO.filter((ten) => tu.toLowerCase().includes(ten));
        expect([sao, tu, trung]).toEqual([sao, tu, []]);
      }
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const { sao, de } of MENH_DE) {
      expect([sao, de.y, VO_CHONG.test(de.y)]).toEqual([sao, de.y, false]);
    }
  });
});
