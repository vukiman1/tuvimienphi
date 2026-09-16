import { castNatal, type NatalChart } from '../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../chi.js';
import { Gender } from '../van-han.js';
import { buildMenhBrief } from './build-menh-brief.js';
import { Sac } from './luan-de.js';
import { TheChieu } from './the-cung.js';

/** Mệnh tại Mùi: Thiên Tướng toạ thủ, Tử Vi và Phá Quân xung chiếu, Thiên Phủ tam hợp, Triệt án ngữ. */
const THIEN_TUONG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

/** Mệnh yếu: chính tinh chỉ chiếu tới và đều hãm, nên mệnh đề của Đà La toạ thủ thắng. */
const MENH_YEU: NatalChart = castNatal({
  solarDate: new Date(1992, 0, 1),
  hour: 7,
  gender: Gender.Nu,
});

describe('buildMenhBrief', () => {
  it('gom chính tinh của cả tam phương tứ chính, kèm thế chiếu của từng sao', () => {
    const brief = buildMenhBrief(THIEN_TUONG);

    expect(brief?.chinhTinh).toEqual([
      { ten: 'Thiên Tướng', bac: 'Đ', the: TheChieu.ToaThu },
      { ten: 'Tử Vi', bac: 'Đ', the: TheChieu.XungChieu },
      { ten: 'Phá Quân', bac: 'V', the: TheChieu.XungChieu },
      { ten: 'Thiên Phủ', bac: 'B', the: TheChieu.TamHop },
    ]);
  });

  it('xếp mệnh đề của sao toạ thủ trên mệnh đề của sao chiếu tới', () => {
    const brief = buildMenhBrief(THIEN_TUONG);
    const thuan = brief?.luan.filter((de) => de.sac === Sac.Thuan) ?? [];

    expect(thuan[0]?.do).toContain('Thiên Tướng');
  });

  it('đưa mệnh đề của phụ tinh vào cùng một lượt xếp hạng với chính tinh', () => {
    const brief = buildMenhBrief(MENH_YEU);

    expect(brief?.luan.some((de) => de.do.includes('Đà La'))).toBe(true);
  });

  it('hạ đều trọng số và báo tên án ngữ khi cung Mệnh bị Tuần hay Triệt', () => {
    const brief = buildMenhBrief(THIEN_TUONG);
    const thuanDau = brief?.luan.find((de) => de.sac === Sac.Thuan);

    expect(brief?.anNgu).toBe('Triệt');
    expect(thuanDau?.trong).toBe(64);
  });

  it('mang theo dữ kiện lá số mà bộ kiểm cần để đối chiếu bài', () => {
    const brief = buildMenhBrief(THIEN_TUONG);

    expect(brief).toMatchObject({
      cung: 'Mệnh',
      chi: 'Mùi',
      gioiTinh: Gender.Nam,
      chiNamSinh: 'Tý',
      laVoChinhDieu: false,
    });
  });

  it('chỉ liệt kê phụ tinh thực sự đứng sau mệnh đề được giữ', () => {
    const brief = buildMenhBrief(MENH_YEU);
    const dungToi = new Set(brief?.luan.flatMap((de) => de.do));
    const moiSao = [...(brief?.hungTinh ?? []), ...(brief?.catTinh ?? [])];

    expect(moiSao.length).toBeGreaterThan(0);
    for (const sao of moiSao) expect(dungToi.has(sao.ten)).toBe(true);
  });

  it('trả null khi tam phương tứ chính không còn sao nào bảng luận biết tới', () => {
    const tron = structuredClone(THIEN_TUONG) as unknown as {
      menhIndex: number;
      cungs: { chinhTinh: unknown[]; chinhTinhMuon: unknown[]; phuTinh: unknown[] }[];
    };
    const [tamHopA, tamHopB] = tamHopIndexes(tron.menhIndex);
    for (const index of [tron.menhIndex, xungChieuIndex(tron.menhIndex), tamHopA, tamHopB]) {
      tron.cungs[index].chinhTinh = [];
      tron.cungs[index].chinhTinhMuon = [];
      tron.cungs[index].phuTinh = [];
    }

    expect(buildMenhBrief(tron as unknown as NatalChart)).toBeNull();
  });
});
