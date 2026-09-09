import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildThanCuBrief } from './build-than-cu-brief.js';
import { Sac } from './luan-de.js';
import { TheChieu } from './the-cung.js';

/** Thân cư Phu Thê, Liêm Trinh (H) đi cùng Tham Lang (H), cung có Tuần án ngữ. */
const LIEM_THAM: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

/** Thân cư Phu Thê, Tham Lang (Đ) đứng một mình, không Tuần không Triệt. */
const THAM_LANG: NatalChart = castNatal({
  solarDate: new Date(1985, 1, 21),
  hour: 21,
  gender: Gender.Nam,
});

describe('buildThanCuBrief', () => {
  it('đọc đúng thế cung an Thân', () => {
    const brief = buildThanCuBrief(LIEM_THAM);
    expect(brief).not.toBeNull();
    expect(brief?.cungThan).toBe('Phu Thê');
    expect(brief?.chi).toBe('Tị');
    expect(brief?.chinhTinh).toEqual([
      { ten: 'Liêm Trinh', bac: 'H' },
      { ten: 'Tham Lang', bac: 'H' },
    ]);
  });

  it('báo Tuần án ngữ khi cung bị Tuần', () => {
    expect(buildThanCuBrief(LIEM_THAM)?.anNgu).toBe('Tuần');
    expect(buildThanCuBrief(THAM_LANG)?.anNgu).toBeNull();
  });

  it('chỉ liệt kê sao thực sự đứng sau mệnh đề được giữ', () => {
    for (const chart of [LIEM_THAM, THAM_LANG]) {
      const brief = buildThanCuBrief(chart);
      const dungToi = new Set(brief?.luan.flatMap((de) => de.do));
      for (const sao of [...(brief?.hungTinh ?? []), ...(brief?.catTinh ?? [])]) {
        expect(dungToi.has(sao.ten)).toBe(true);
      }
    }
  });

  it('ghi kèm thế chiếu của từng sao để bài gọi đúng vị trí', () => {
    const brief = buildThanCuBrief(LIEM_THAM);
    const moiSao = [...(brief?.hungTinh ?? []), ...(brief?.catTinh ?? [])];

    expect(moiSao.length).toBeGreaterThan(0);
    for (const sao of moiSao) {
      expect(Object.values(TheChieu)).toContain(sao.the);
    }
  });

  it('không đưa quá hai mệnh đề thuận, hai nghịch và một hoá giải', () => {
    const luan = buildThanCuBrief(LIEM_THAM)?.luan ?? [];
    const dem = (sac: Sac) => luan.filter((de) => de.sac === sac).length;
    expect(dem(Sac.Thuan)).toBeLessThanOrEqual(2);
    expect(dem(Sac.Nghich)).toBeLessThanOrEqual(2);
    expect(dem(Sac.HoaGiai)).toBeLessThanOrEqual(1);
  });

  it('mọi mệnh đề đều mang từ khoá để bộ kiểm nội dung đối chiếu', () => {
    for (const de of buildThanCuBrief(LIEM_THAM)?.luan ?? []) {
      expect(de.tuKhoa.length).toBeGreaterThan(0);
      expect(de.do.length).toBeGreaterThan(0);
    }
  });

  it('trả null khi cung an Thân vô chính diệu, vì không có sao nào để dựng mệnh đề nền', () => {
    const voChinhDieu = castNatal({
      solarDate: new Date(1985, 0, 3),
      hour: 21,
      gender: Gender.Nam,
    });
    expect(voChinhDieu.cungs[voChinhDieu.thanIndex].isVoChinhDieu).toBe(true);
    expect(buildThanCuBrief(voChinhDieu)).toBeNull();
  });
});
