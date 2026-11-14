import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { Sac } from '../../luan-de.js';
import { CHINH_TINH_TAT_ACH } from './chinh-tinh-tat-ach.js';

const TU_CAM = [
  'tình cảm',
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
  'anh em',
];

const TU_DOA = [
  'ung thư',
  'tiểu đường',
  'đột quỵ',
  'nan y',
  'hiểm nghèo',
  'tử vong',
  'qua đời',
  'chết',
  'tai hoạ',
  'tai họa',
  'chắc chắn',
];

const TEN_SAO = [...CHINH_TINH_NAMES, ...PHU_TINH_NAMES].map((ten) => ten.toLowerCase());

const MENH_DE = Object.entries(CHINH_TINH_TAT_ACH).flatMap(([sao, cell]) =>
  [...(cell?.chung ?? []), ...Object.values(cell?.theoBac ?? {}).flat()].map((de) => ({
    sao,
    de,
  })),
);

describe('CHINH_TINH_TAT_ACH', () => {
  it('có đúng một mệnh đề thuận và một mệnh đề nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const chieu = CHINH_TINH_TAT_ACH[sao]?.chung.map((de) => de.sac);
      expect([sao, chieu]).toEqual([sao, [Sac.Thuan, Sac.Nghich]]);
    }
  });

  it('không có mệnh đề nào lạc sang tình cảm, sự nghiệp, tiền bạc hay người nhà', () => {
    for (const { sao, de } of MENH_DE) {
      for (const tu of TU_CAM) {
        expect([sao, tu, de.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('không gọi tên bệnh nặng, không doạ và không phán chắc về sức khoẻ', () => {
    for (const { sao, de } of MENH_DE) {
      for (const tu of TU_DOA) {
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
});
