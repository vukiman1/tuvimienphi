import { CHINH_TINH_NAMES, PHU_TINH_NAMES } from '../../../sao-names.js';
import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_TAT_ACH } from './phu-tinh-tat-ach.js';

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

describe('PHU_TINH_TAT_ACH', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_TAT_ACH).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('giữ nguyên sắc thái và trọng số của bảng phụ tinh chung — chỉ đổi lời cho đúng chủ đề sức khoẻ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_LUAN)) {
      expect(PHU_TINH_TAT_ACH[sao as keyof typeof PHU_TINH_TAT_ACH]).toMatchObject({
        sac: claim.sac,
        trong: claim.trong,
      });
    }
  });

  it('không có mệnh đề nào lạc sang tình cảm, sự nghiệp, tiền bạc hay người nhà', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAT_ACH)) {
      for (const tu of TU_CAM) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('không gọi tên bệnh nặng, không doạ và không phán chắc về sức khoẻ', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAT_ACH)) {
      for (const tu of TU_DOA) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, false]);
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAT_ACH)) {
      for (const tu of claim?.tuKhoa ?? []) {
        expect([sao, tu, claim?.y.includes(tu)]).toEqual([sao, tu, true]);
      }
    }
  });

  it('không từ khoá nào chứa tên sao, vì bài chỉ cần gọi tên sao là đã khớp từ khoá', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_TAT_ACH)) {
      for (const tu of claim?.tuKhoa ?? []) {
        const trung = TEN_SAO.filter((ten) => tu.toLowerCase().includes(ten));
        expect([sao, tu, trung]).toEqual([sao, tu, []]);
      }
    }
  });
});
