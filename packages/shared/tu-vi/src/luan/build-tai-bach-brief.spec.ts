import { castNatal, type NatalChart } from '../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../chi.js';
import { Gender } from '../van-han.js';
import { buildTaiBachBrief, taiBachIndexOf } from './build-tai-bach-brief.js';
import { Sac } from './luan-de.js';
import { TheChieu } from './the-cung.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const TAI_BACH_YEU: NatalChart = castNatal({
  solarDate: new Date(1950, 0, 1),
  hour: 21,
  gender: Gender.Nu,
});

const VO_CHINH_DIEU: NatalChart = castNatal({
  solarDate: new Date(1990, 5, 15),
  hour: 10,
  gender: Gender.Nam,
});

describe('buildTaiBachBrief', () => {
  it('gom chính tinh của cả tam phương tứ chính quanh cung Tài Bạch, kèm thế chiếu của từng sao', () => {
    const brief = buildTaiBachBrief(THIEN_LUONG);

    expect(brief?.chinhTinh).toEqual([
      { ten: 'Thiên Đồng', bac: 'H', the: TheChieu.ToaThu },
      { ten: 'Cự Môn', bac: 'H', the: TheChieu.XungChieu },
      { ten: 'Thiên Cơ', bac: 'H', the: TheChieu.TamHop },
      { ten: 'Thái Âm', bac: 'H', the: TheChieu.TamHop },
      { ten: 'Thiên Lương', bac: 'M', the: TheChieu.TamHop },
    ]);
  });

  it('xếp mệnh đề do chính tinh sinh ra trước mệnh đề cách cục cùng sắc thái', () => {
    const brief = buildTaiBachBrief(THIEN_LUONG);
    const thuan = brief?.luan.filter((de) => de.sac === Sac.Thuan) ?? [];

    expect(thuan[0]?.do.length).toBeGreaterThan(0);
    expect(thuan[1]?.do.length).toBe(0);
  });

  it('hạ đều trọng số và báo tên án ngữ khi cung Tài Bạch bị Tuần hay Triệt', () => {
    const brief = buildTaiBachBrief(TAI_BACH_YEU);
    const thuanDau = brief?.luan.find((de) => de.sac === Sac.Thuan);

    expect(brief?.anNgu).toBe('Triệt');
    expect(thuanDau?.trong).toBe(58);
  });

  it('mang theo dữ kiện lá số mà bộ kiểm cần để đối chiếu bài', () => {
    const brief = buildTaiBachBrief(THIEN_LUONG);

    expect(brief).toMatchObject({
      cung: 'Tài Bạch',
      chi: 'Tuất',
      gioiTinh: Gender.Nam,
      chiNamSinh: 'Thìn',
      laVoChinhDieu: false,
    });
  });

  it('đưa mệnh đề của phụ tinh vào cùng một lượt xếp hạng với chính tinh khi Tài Bạch vô chính diệu', () => {
    const brief = buildTaiBachBrief(VO_CHINH_DIEU);

    expect(brief?.laVoChinhDieu).toBe(true);
    expect(brief?.luan.some((de) => de.do.includes('Thiên Đức'))).toBe(true);
  });

  it('chỉ liệt kê phụ tinh thực sự đứng sau mệnh đề được giữ', () => {
    const brief = buildTaiBachBrief(VO_CHINH_DIEU);
    const dungToi = new Set(brief?.luan.flatMap((de) => de.do));
    const moiSao = [...(brief?.hungTinh ?? []), ...(brief?.catTinh ?? [])];

    expect(moiSao.length).toBeGreaterThan(0);
    for (const sao of moiSao) expect(dungToi.has(sao.ten)).toBe(true);
  });

  it('trả null khi tam phương tứ chính quanh Tài Bạch không còn sao nào bảng luận biết tới', () => {
    const tron = structuredClone(THIEN_LUONG) as unknown as {
      menhIndex: number;
      cungs: { chinhTinh: unknown[]; chinhTinhMuon: unknown[]; phuTinh: unknown[] }[];
    };
    const taiBachIndex = taiBachIndexOf(tron as unknown as NatalChart);
    const [tamHopA, tamHopB] = tamHopIndexes(taiBachIndex);
    for (const index of [taiBachIndex, xungChieuIndex(taiBachIndex), tamHopA, tamHopB]) {
      tron.cungs[index].chinhTinh = [];
      tron.cungs[index].chinhTinhMuon = [];
      tron.cungs[index].phuTinh = [];
    }

    expect(buildTaiBachBrief(tron as unknown as NatalChart)).toBeNull();
  });
});
