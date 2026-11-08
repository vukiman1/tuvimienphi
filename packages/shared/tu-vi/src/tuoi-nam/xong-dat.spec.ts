import { tuoiXongDat, XONG_DAT_TRUYEN_THONG } from './xong-dat.js';

const DAN = 2;
const MUI = 7;

describe('tuoiXongDat', () => {
  it('picks first-footers for a Dần house in a Mùi year', () => {
    expect(tuoiXongDat(DAN, MUI)).toEqual({ hop: [6, 11], tranh: [5, 8] });
  });
});

describe('XONG_DAT_TRUYEN_THONG', () => {
  it('names the harmonies a first-footer needs and the clashes that rule one out', () => {
    expect(XONG_DAT_TRUYEN_THONG).toContain('tam hợp hoặc lục hợp với tuổi chủ nhà');
    expect(XONG_DAT_TRUYEN_THONG).toContain('xung, hình hoặc hại');
  });
});
