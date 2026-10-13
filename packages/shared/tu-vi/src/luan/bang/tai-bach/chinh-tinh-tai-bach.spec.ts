import { CHINH_TINH_NAMES } from '../../../sao-names.js';
import { CHINH_TINH_TAI_BACH } from './chinh-tinh-tai-bach.js';

const TU_CAM = ['tình cảm', 'hôn sự', 'hôn nhân', 'người khác giới', 'gia đạo'];

describe('CHINH_TINH_TAI_BACH', () => {
  it('có đủ mệnh đề thuận/nghịch cho cả mười bốn chính tinh', () => {
    for (const sao of CHINH_TINH_NAMES) {
      const cell = CHINH_TINH_TAI_BACH[sao];
      expect([sao, cell?.chung.length]).toEqual([sao, 2]);
    }
  });

  it('không còn mệnh đề nào nói về tình cảm, hôn nhân hay gia đạo', () => {
    for (const [sao, cell] of Object.entries(CHINH_TINH_TAI_BACH)) {
      for (const de of cell?.chung ?? []) {
        for (const tu of TU_CAM) {
          expect([sao, de.y.includes(tu)]).toEqual([sao, false]);
        }
      }
    }
  });

  it('mỗi từ khoá bắt buộc đều xuất hiện nguyên văn trong mệnh đề của chính nó', () => {
    for (const [sao, cell] of Object.entries(CHINH_TINH_TAI_BACH)) {
      for (const de of cell?.chung ?? []) {
        for (const tu of de.tuKhoa) {
          expect([sao, tu, de.y.includes(tu)]).toEqual([sao, tu, true]);
        }
      }
    }
  });
});
