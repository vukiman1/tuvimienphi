import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { CHINH_TINH_PHUC_DUC } from './chinh-tinh-phuc-duc.js';

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

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const MENH_DE = Object.entries(CHINH_TINH_PHUC_DUC).flatMap(([sao, cell]) =>
  [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()].map((de) => ({
    sao,
    de,
  })),
);

describe('CHINH_TINH_PHUC_DUC', () => {
  it('có đúng một mệnh đề thuận và một mệnh đề nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const chieu = CHINH_TINH_PHUC_DUC[sao]?.chung.map((de) => de.sac);
      expect([sao, chieu]).toEqual([sao, [Sac.Thuan, Sac.Nghich]]);
    }
  });

  it('không có mệnh đề nào lạc sang hôn nhân, sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
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

  it('không mệnh đề nào gọi tên sao, vì tên sao đã nằm ở nguồn của mệnh đề', () => {
    for (const { sao, de } of MENH_DE) {
      const trung = TEN_SAO.filter((ten) => de.y.toLowerCase().includes(ten));
      expect([sao, de.y, trung]).toEqual([sao, de.y, []]);
    }
  });

  it('không nhắc tới vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const { sao, de } of MENH_DE) {
      expect([sao, de.y, VO_CHONG.test(de.y)]).toEqual([sao, de.y, false]);
    }
  });
});
