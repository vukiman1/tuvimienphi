import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { THAN_CU_CUNGS } from './build-than-cu-brief.js';

describe('vị trí cung an Thân', () => {
  it('chỉ rơi vào sáu cung Mệnh, Phúc Đức, Quan Lộc, Thiên Di, Tài Bạch, Phu Thê', () => {
    const gapDuoc = new Set<string>();
    for (let thang = 1; thang <= 12; thang += 1) {
      for (let ngay = 1; ngay <= 28; ngay += 1) {
        for (let gio = 1; gio < 24; gio += 2) {
          const chart = castNatal({
            solarDate: new Date(1990, thang - 1, ngay),
            hour: gio,
            gender: Gender.Nam,
          });
          gapDuoc.add(chart.cungs[chart.thanIndex].name);
        }
      }
    }
    expect([...gapDuoc].sort()).toEqual([...THAN_CU_CUNGS].sort());
  });
});
