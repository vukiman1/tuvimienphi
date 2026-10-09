import { PHU_TINH_LUAN } from '../phu-tinh.js';
import { PHU_TINH_QUAN_LOC } from './phu-tinh-quan-loc.js';

const TU_CAM = [
  'tình cảm',
  'hôn sự',
  'hôn nhân',
  'người khác giới',
  'trong nhà',
  'trong quan hệ',
  'trong mối quan hệ',
  'của hai người',
];

describe('PHU_TINH_QUAN_LOC', () => {
  it('phủ đúng tập sao mà bảng phụ tinh chung đang phủ', () => {
    expect(Object.keys(PHU_TINH_QUAN_LOC).sort()).toEqual(Object.keys(PHU_TINH_LUAN).sort());
  });

  it('không còn mệnh đề nào nói về tình cảm, hôn nhân hay gia đạo', () => {
    for (const [sao, claim] of Object.entries(PHU_TINH_QUAN_LOC)) {
      for (const tu of TU_CAM) {
        expect([sao, claim?.y.includes(tu)]).toEqual([sao, false]);
      }
    }
  });
});
