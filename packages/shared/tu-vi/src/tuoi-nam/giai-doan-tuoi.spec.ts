import { giaiDoanTuoi, GiaiDoanTuoi } from './giai-doan-tuoi.js';

describe('giaiDoanTuoi', () => {
  it.each([
    [18, GiaiDoanTuoi.LapNghiep],
    [30, GiaiDoanTuoi.LapNghiep],
    [31, GiaiDoanTuoi.XayDung],
    [45, GiaiDoanTuoi.XayDung],
    [46, GiaiDoanTuoi.TrungNien],
    [60, GiaiDoanTuoi.TrungNien],
    [61, GiaiDoanTuoi.VeHuu],
    [75, GiaiDoanTuoi.VeHuu],
    [76, GiaiDoanTuoi.TuoiGia],
    [90, GiaiDoanTuoi.TuoiGia],
  ])('places tuổi %i in its life stage', (tuoi, stage) => {
    expect(giaiDoanTuoi(tuoi)).toBe(stage);
  });
});
