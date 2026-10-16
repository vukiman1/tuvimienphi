import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { THAN_CU_PHU_THE } from '../than-cu/phu-the.js';
import { CHINH_TINH_PHU_THE } from './chinh-tinh-phu-the.js';

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

const VO_CHONG = /(?<!\p{L})(vợ|chồng)(?!\p{L}|\s(?:chất|chéo))/u;

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const MENH_DE = Object.entries(CHINH_TINH_PHU_THE).flatMap(([sao, cell]) =>
  [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()].map((de) => ({
    sao,
    de,
  })),
);

describe('CHINH_TINH_PHU_THE', () => {
  it('có đúng một mệnh đề thuận và một mệnh đề nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const chieu = CHINH_TINH_PHU_THE[sao]?.chung.map((de) => de.sac);
      expect([sao, chieu]).toEqual([sao, [Sac.Thuan, Sac.Nghich]]);
    }
  });

  it('không có mệnh đề nào lạc sang sự nghiệp, tiền bạc, con cái hay cha mẹ', () => {
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

  it('không gọi người bạn đời là vợ hay chồng vì bảng dùng chung cho lá số nam và nữ', () => {
    for (const { sao, de } of MENH_DE) {
      expect([sao, de.y, VO_CHONG.test(de.y)]).toEqual([sao, de.y, false]);
    }
  });

  it('không lặp nguyên văn mệnh đề nào của bảng Thân cư Phu Thê ở chương một', () => {
    const daDungOChuongMot = new Set(
      Object.values(THAN_CU_PHU_THE)
        .flatMap((cell) => [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()])
        .map((de) => de.y),
    );

    for (const { sao, de } of MENH_DE) {
      expect([sao, de.y, daDungOChuongMot.has(de.y)]).toEqual([sao, de.y, false]);
    }
  });
});
