import { tuoiXongDat } from './xong-dat.js';

const DAN = 2;
const MUI = 7;

describe('tuoiXongDat', () => {
  it('picks first-footers for a Dần house in a Mùi year', () => {
    expect(tuoiXongDat(DAN, MUI)).toEqual({ hop: [6, 11], tranh: [5, 8] });
  });
});
