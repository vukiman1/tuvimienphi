import { CalendarType, Gender } from './birth-input';
import type { ChartView } from './chart-types';
import { toChartView } from './to-chart-view';

/** Canh Tuất 1910, sinh 1/1/1911 dương, giờ Ngọ, nam — lá số đã đối chiếu với tuvi.vn. */
const CANH_TUAT = {
  day: 1,
  month: 1,
  year: 1911,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: 2026,
} as const;

const chinhTinhOf = (chart: ChartView) =>
  chart.cungs.map((cung) => cung.chinhTinh.map((star) => star.name));

describe('toChartView', () => {
  it('casts the chart from the birth details, not from a fixture', () => {
    const chart = toChartView(CANH_TUAT);

    expect(chart.meta.amDuong).toBe('Dương Nam');
    expect(chart.meta.banMenh).toBe('Thoa Xuyến Kim - Mộc Tam Cục');
    expect(chart.meta.lunarYear).toBe('Canh Tuất');
    expect(chart.meta.lunarDay).toBe('Tân Mùi');
    expect(chart.meta.lunarHour).toBe('Giáp Ngọ');
  });

  it('puts Mệnh and Thân on Mùi with the major stars around them', () => {
    const chart = toChartView(CANH_TUAT);
    const mui = chart.cungs[7];

    expect([mui.name, mui.canChi, mui.isMenh, mui.isThan]).toEqual(['MỆNH', 'Q.Mùi', true, true]);
    expect(mui.chinhTinh.map((star) => star.name)).toEqual(['THIÊN TƯỚNG']);
    expect(mui.chinhTinh[0].polarity).toBe('+');
    expect(mui.daiVanStartAge).toBe(3);
    expect(mui.hasTriet).toBe(true);
  });

  it('splits the phụ tinh into the two columns the cell draws', () => {
    const mui = toChartView(CANH_TUAT).cungs[7];

    // Đà La và Quả Tú vào cột hung, Thiên Đức và Phúc Đức vào cột cát.
    expect(mui.hungTinh.map((star) => star.name)).toEqual(
      expect.arrayContaining(['Đà La', 'Quả Tú']),
    );
    expect(mui.catTinh.map((star) => star.name)).toEqual(
      expect.arrayContaining(['Thiên Đức', 'Phúc Đức']),
    );
  });

  it('puts Thiên Diêu in the hung column', () => {
    const ty = toChartView(CANH_TUAT).cungs[0];

    expect(ty.hungTinh.map((star) => star.name)).toContain('Thiên Diêu');
    expect(ty.catTinh.map((star) => star.name)).not.toContain('Thiên Diêu');
  });

  it('colours a sao by its ngũ hành, not by whether it is cát or hung', () => {
    const mui = toChartView(CANH_TUAT).cungs[7];
    const elementOf = (name: string) =>
      [...mui.catTinh, ...mui.hungTinh].find((star) => star.name === name)?.element;

    // Đà La đứng cột hung nhưng hành Kim, còn Quả Tú cũng cột hung lại hành Thổ — nếu màu chạy theo
    // cát/hung thì hai sao này đã cùng màu.
    expect(elementOf('Đà La')).toBe('Kim');
    expect(elementOf('Quả Tú')).toBe('Thổ');
    expect(mui.chinhTinh[0].element).toBe('Thủy');
  });

  it('gives a different birth date a different chart', () => {
    const other = toChartView({
      day: 20,
      month: 8,
      year: 1991,
      calendar: CalendarType.Solar,
      hour: 'Dần',
      gender: Gender.Female,
      viewYear: 2026,
    });

    expect(other.meta.amDuong).toBe('Âm Nữ');
    expect(other.meta.banMenh).toBe('Lộ Bàng Thổ - Kim Tứ Cục');
    expect(other.cungs.find((cung) => cung.isMenh)?.chi).toBe('Ngọ');
  });

  it('casts giờ Tý sớm as the next lunar day', () => {
    // 23:00 đã sang ngày âm hôm sau, nên lá số phải trùng lá số giờ Tý của ngày kế tiếp.
    const tySom = toChartView({ ...CANH_TUAT, hour: 'Tý sớm' });
    const tyHomSau = toChartView({ ...CANH_TUAT, day: 2, hour: 'Tý' });
    const tyCungNgay = toChartView({ ...CANH_TUAT, hour: 'Tý' });

    expect(chinhTinhOf(tySom)).toEqual(chinhTinhOf(tyHomSau));
    expect(chinhTinhOf(tySom)).not.toEqual(chinhTinhOf(tyCungNgay));
  });

  it('prints the lunar day the giờ Tý sớm chart was actually cast from', () => {
    const tySom = toChartView({ ...CANH_TUAT, hour: 'Tý sớm' }).meta;
    const tyHomSau = toChartView({ ...CANH_TUAT, day: 2, hour: 'Tý' }).meta;

    expect(tySom.lunarDay).toBe(tyHomSau.lunarDay);
    // Vẫn sinh ngày dương 1, nhưng đã thuộc ngày âm mùng 3.
    expect(tySom.solarDay).toBe('1 (3)');
  });

  it('casts the same chart whether the date is given as solar or lunar', () => {
    // 1/1/1911 dương chính là mùng 2 tháng 12 năm Canh Tuất; hai lối vào phải ra cùng một lá số.
    const viaLunar = toChartView({
      ...CANH_TUAT,
      day: 2,
      month: 12,
      year: 1910,
      calendar: CalendarType.Lunar,
    });
    const viaSolar = toChartView(CANH_TUAT);

    expect(viaLunar.meta.lunarDay).toBe(viaSolar.meta.lunarDay);
    expect(viaLunar.cungs.map((cung) => cung.chinhTinh.map((star) => star.name))).toEqual(
      viaSolar.cungs.map((cung) => cung.chinhTinh.map((star) => star.name)),
    );
  });

  it('prints the solar date, not the lunar one, for a birth given as lunar', () => {
    // Mùng 2 tháng 12 năm Canh Tuất chính là 1/1/1911 dương.
    const viaLunar = toChartView({
      ...CANH_TUAT,
      day: 2,
      month: 12,
      year: 1910,
      calendar: CalendarType.Lunar,
    });

    expect(viaLunar.meta.solarYear).toBe('1911');
    expect(viaLunar.meta.solarMonth).toBe('1 (12)');
    expect(viaLunar.meta.solarDay).toBe('1 (2)');
  });

  it('fills chủ mệnh, chủ thân, Tràng Sinh and the star ratings', () => {
    const chart = toChartView(CANH_TUAT);
    const mui = chart.cungs[7];

    expect(chart.meta.chuMenh).toBe('Lộc Tồn');
    expect(chart.meta.chuThan).toBe('Văn Xương');
    expect(mui.trangSinh).toBe('Mộ');
    expect(mui.chinhTinh[0].rating).toBe('Đ');
    // Năm xem 2026, người sinh 1910 đã 117 tuổi nên đại vận đang ở cung Huynh Đệ.
    expect(chart.cungs[6].daiVan).toBe('ĐV.MỆNH');
  });

  it('numbers every palace with its month of the viewed year', () => {
    const chart = toChartView(CANH_TUAT);
    const months = chart.cungs.map((cung) => cung.monthOrder);

    expect(new Set(months).size).toBe(12);
    expect(months).toContain('Th.1');
    expect(months).toContain('Th.12');
  });

  it('weighs the chart with xưng cốt ca', () => {
    expect(toChartView(CANH_TUAT).meta.canLuong).toBe('3 lượng 4 chỉ');
  });

  it('labels every palace with its lưu niên position', () => {
    const luuNien = toChartView(CANH_TUAT).cungs.map((cung) => cung.luuNien);

    expect(new Set(luuNien).size).toBe(12);
    expect(luuNien).toContain('LN.MỆNH');
  });

  it('places the lưu tinh of the viewed year', () => {
    const chart = toChartView({ ...CANH_TUAT, viewYear: 2020 });
    const luuTinhAt = (chiIndex: number) => chart.cungs[chiIndex].luuTinh.map((star) => star.name);

    // Năm xem 2020 là Canh Tý, nên lưu Thái Tuế đóng tại Tý.
    expect(luuTinhAt(0)).toContain('Thái Tuế');
    expect(luuTinhAt(8)).toContain('Lộc Tồn');
  });

  it('moves the lưu tinh when the viewed year changes, leaving the natal stars alone', () => {
    const at2020 = toChartView({ ...CANH_TUAT, viewYear: 2020 });
    const at2021 = toChartView({ ...CANH_TUAT, viewYear: 2021 });
    const luuOf = (chart: ChartView) => chart.cungs.map((cung) => cung.luuTinh.map((s) => s.name));
    const phuOf = (chart: ChartView) => chart.cungs.map((cung) => cung.catTinh.map((s) => s.name));

    expect(luuOf(at2020)).not.toEqual(luuOf(at2021));
    expect(phuOf(at2020)).toEqual(phuOf(at2021));
  });

  it('names the lai nhân cung palace', () => {
    // Canh Tuất: cung Thìn mang can Canh, và Thìn cách Mệnh ở Mùi ba cung nên là cung Tử Tức.
    expect(toChartView(CANH_TUAT).meta.laiNhanCung).toBe('Tử Tức');
  });
});
