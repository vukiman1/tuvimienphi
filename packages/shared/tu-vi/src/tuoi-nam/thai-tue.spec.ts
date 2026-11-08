import { phamThaiTue, ThaiTueRelation } from './thai-tue.js';

const MUI = 7;
const THIN = 4;
const TY = 0;
const MAO = 3;

describe('phamThaiTue', () => {
  it.each([
    [7, [ThaiTueRelation.Truc]],
    [1, [ThaiTueRelation.Xung, ThaiTueRelation.Hinh]],
    [10, [ThaiTueRelation.Hinh, ThaiTueRelation.Pha]],
    [0, [ThaiTueRelation.Hai]],
    [2, []],
  ])('birth chi %i against Mùi 2027', (birthChi, expected) => {
    expect(phamThaiTue(birthChi, MUI)).toEqual(expected);
  });

  it('a self-punishing chi in its own year is both trực and hình', () => {
    expect(phamThaiTue(THIN, THIN)).toEqual([ThaiTueRelation.Truc, ThaiTueRelation.Hinh]);
  });

  it('Tý and Mão punish each other without breaking', () => {
    expect(phamThaiTue(MAO, TY)).toEqual([ThaiTueRelation.Hinh]);
  });
});
