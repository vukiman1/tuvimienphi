import { type CuuDieu, isKimLau, isTamTai, saoChieuMenh } from './dan-gian.js';
import { Gender } from './van-han.js';

const TY = 0;
const DAN = 2;
const MAO = 3;
const THIN = 4;
const TI = 5;
const DAU = 9;
const HOI = 11;
const SUU = 1;

describe('saoChieuMenh', () => {
  it.each([
    [Gender.Nam, 55, 'La Hầu'],
    [Gender.Nam, 43, 'Kế Đô'],
    [Gender.Nam, 31, 'Thái Bạch'],
    [Gender.Nam, 19, 'La Hầu'],
    [Gender.Nam, 45, 'Mộc Đức'],
    [Gender.Nam, 11, 'Thổ Tú'],
    [Gender.Nu, 55, 'Kế Đô'],
    [Gender.Nu, 42, 'La Hầu'],
    [Gender.Nu, 53, 'Thái Bạch'],
    [Gender.Nu, 6, 'La Hầu'],
  ] as const)('gives %s aged %i the star %s', (gender, tuoi, expected) => {
    expect(saoChieuMenh(tuoi, gender)).toBe(expected);
  });

  const SEED_2026: readonly (readonly [Gender, number, CuuDieu])[] = [
    [Gender.Nam, 54, 'La Hầu'],
    [Gender.Nu, 54, 'Kế Đô'],
    [Gender.Nam, 42, 'Kế Đô'],
    [Gender.Nu, 42, 'Thái Dương'],
    [Gender.Nam, 30, 'Thái Bạch'],
    [Gender.Nu, 30, 'Thái Âm'],
    [Gender.Nam, 18, 'La Hầu'],
    [Gender.Nu, 18, 'Kế Đô'],
    [Gender.Nam, 6, 'Kế Đô'],
    [Gender.Nu, 6, 'Thái Dương'],
    [Gender.Nam, 53, 'Mộc Đức'],
    [Gender.Nu, 53, 'Thủy Diệu'],
    [Gender.Nam, 41, 'Vân Hớn'],
    [Gender.Nu, 41, 'La Hầu'],
    [Gender.Nam, 29, 'Thủy Diệu'],
    [Gender.Nu, 29, 'Mộc Đức'],
    [Gender.Nam, 17, 'Mộc Đức'],
    [Gender.Nu, 17, 'Thủy Diệu'],
    [Gender.Nam, 5, 'Vân Hớn'],
    [Gender.Nu, 5, 'La Hầu'],
    [Gender.Nam, 52, 'Thái Âm'],
    [Gender.Nu, 52, 'Thái Bạch'],
    [Gender.Nam, 40, 'Thái Dương'],
    [Gender.Nu, 40, 'Thổ Tú'],
    [Gender.Nam, 28, 'Thổ Tú'],
    [Gender.Nu, 28, 'Vân Hớn'],
    [Gender.Nam, 16, 'Thái Âm'],
    [Gender.Nu, 16, 'Thái Bạch'],
    [Gender.Nam, 4, 'Thái Dương'],
    [Gender.Nu, 4, 'Thổ Tú'],
    [Gender.Nam, 51, 'Kế Đô'],
    [Gender.Nu, 51, 'Thái Dương'],
    [Gender.Nam, 39, 'Thái Bạch'],
    [Gender.Nu, 39, 'Thái Âm'],
    [Gender.Nam, 27, 'La Hầu'],
    [Gender.Nu, 27, 'Kế Đô'],
    [Gender.Nam, 15, 'Kế Đô'],
    [Gender.Nu, 15, 'Thái Dương'],
    [Gender.Nam, 3, 'Thái Bạch'],
    [Gender.Nu, 3, 'Thái Âm'],
    [Gender.Nam, 50, 'Vân Hớn'],
    [Gender.Nu, 50, 'La Hầu'],
    [Gender.Nam, 38, 'Thủy Diệu'],
    [Gender.Nu, 38, 'Mộc Đức'],
    [Gender.Nam, 26, 'Mộc Đức'],
    [Gender.Nu, 26, 'Thủy Diệu'],
    [Gender.Nam, 14, 'Vân Hớn'],
    [Gender.Nu, 14, 'La Hầu'],
    [Gender.Nam, 2, 'Thủy Diệu'],
    [Gender.Nu, 2, 'Mộc Đức'],
    [Gender.Nam, 49, 'Thái Dương'],
    [Gender.Nu, 49, 'Thổ Tú'],
    [Gender.Nam, 37, 'Thổ Tú'],
    [Gender.Nu, 37, 'Vân Hớn'],
    [Gender.Nam, 25, 'Thái Âm'],
    [Gender.Nu, 25, 'Thái Bạch'],
    [Gender.Nam, 13, 'Thái Dương'],
    [Gender.Nu, 13, 'Thổ Tú'],
    [Gender.Nam, 1, 'Thổ Tú'],
    [Gender.Nu, 1, 'Vân Hớn'],
    [Gender.Nam, 59, 'Vân Hớn'],
    [Gender.Nu, 59, 'La Hầu'],
    [Gender.Nam, 47, 'Thủy Diệu'],
    [Gender.Nu, 47, 'Mộc Đức'],
    [Gender.Nam, 35, 'Mộc Đức'],
    [Gender.Nu, 35, 'Thủy Diệu'],
    [Gender.Nam, 23, 'Vân Hớn'],
    [Gender.Nu, 23, 'La Hầu'],
    [Gender.Nam, 11, 'Thủy Diệu'],
    [Gender.Nu, 11, 'Mộc Đức'],
    [Gender.Nam, 58, 'Thái Dương'],
    [Gender.Nu, 58, 'Thổ Tú'],
    [Gender.Nam, 46, 'Thổ Tú'],
    [Gender.Nu, 46, 'Vân Hớn'],
    [Gender.Nam, 34, 'Thái Âm'],
    [Gender.Nu, 34, 'Thái Bạch'],
    [Gender.Nam, 22, 'Thái Dương'],
    [Gender.Nu, 22, 'Thổ Tú'],
    [Gender.Nam, 10, 'Thổ Tú'],
    [Gender.Nu, 10, 'Vân Hớn'],
    [Gender.Nam, 57, 'Thái Bạch'],
    [Gender.Nu, 57, 'Thái Âm'],
    [Gender.Nam, 45, 'La Hầu'],
    [Gender.Nu, 45, 'Kế Đô'],
    [Gender.Nam, 33, 'Kế Đô'],
    [Gender.Nu, 33, 'Thái Dương'],
    [Gender.Nam, 21, 'Thái Bạch'],
    [Gender.Nu, 21, 'Thái Âm'],
    [Gender.Nam, 9, 'La Hầu'],
    [Gender.Nu, 9, 'Kế Đô'],
    [Gender.Nam, 56, 'Thủy Diệu'],
    [Gender.Nu, 56, 'Mộc Đức'],
    [Gender.Nam, 44, 'Mộc Đức'],
    [Gender.Nu, 44, 'Thủy Diệu'],
    [Gender.Nam, 32, 'Vân Hớn'],
    [Gender.Nu, 32, 'La Hầu'],
    [Gender.Nam, 20, 'Thủy Diệu'],
    [Gender.Nu, 20, 'Mộc Đức'],
    [Gender.Nam, 8, 'Mộc Đức'],
    [Gender.Nu, 8, 'Thủy Diệu'],
    [Gender.Nam, 55, 'Thổ Tú'],
    [Gender.Nu, 55, 'Vân Hớn'],
    [Gender.Nam, 43, 'Thái Âm'],
    [Gender.Nu, 43, 'Thái Bạch'],
    [Gender.Nam, 31, 'Thái Dương'],
    [Gender.Nu, 31, 'Thổ Tú'],
    [Gender.Nam, 19, 'Thổ Tú'],
    [Gender.Nu, 19, 'Vân Hớn'],
    [Gender.Nam, 7, 'Thái Âm'],
    [Gender.Nu, 7, 'Thái Bạch'],
  ];

  it.each(SEED_2026)(
    'matches the 2026 seed for %s aged %i (tuổi tây) with star %s',
    (gender, tuoiTay, star) => {
      expect(saoChieuMenh(tuoiTay + 1, gender)).toBe(star);
    },
  );
});

describe('isKimLau', () => {
  it.each([19, 21, 24, 26])('flags tuổi mụ %i', (tuoi) => {
    expect(isKimLau(tuoi)).toBe(true);
  });

  it.each([20, 27])('does not flag tuổi mụ %i', (tuoi) => {
    expect(isKimLau(tuoi)).toBe(false);
  });
});

describe('isTamTai', () => {
  it.each([DAN, MAO, THIN])('hits a Tý-born in view chi %i', (viewChi) => {
    expect(isTamTai(TY, viewChi)).toBe(true);
  });

  it('spares a Tý-born in a Tỵ year', () => {
    expect(isTamTai(TY, TI)).toBe(false);
  });

  it.each([HOI, TY, SUU])('hits a Dậu-born in view chi %i', (viewChi) => {
    expect(isTamTai(DAU, viewChi)).toBe(true);
  });
});
