import { castNatal, type NatalChart } from '../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../chi.js';
import { Gender } from '../van-han.js';
import { buildCongDanhBrief, quanLocIndexOf } from './build-cong-danh-brief.js';
import { Sac } from './luan-de.js';
import { TheChieu } from './the-cung.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const CONG_DANH_YEU: NatalChart = castNatal({
  solarDate: new Date(1950, 0, 1),
  hour: 21,
  gender: Gender.Nu,
});

describe('buildCongDanhBrief', () => {
  it('gom chính tinh của cả tam phương tứ chính quanh cung Quan Lộc, kèm thế chiếu của từng sao', () => {
    const brief = buildCongDanhBrief(THIEN_LUONG);

    expect(brief?.chinhTinh).toEqual([
      { ten: 'Thiên Lương', bac: 'M', the: TheChieu.ToaThu },
      { ten: 'Thái Dương', bac: 'H', the: TheChieu.XungChieu },
      { ten: 'Thiên Đồng', bac: 'H', the: TheChieu.TamHop },
      { ten: 'Thiên Cơ', bac: 'H', the: TheChieu.TamHop },
      { ten: 'Thái Âm', bac: 'H', the: TheChieu.TamHop },
    ]);
  });

  it('xếp mệnh đề của sao toạ thủ trên mệnh đề của sao chiếu tới', () => {
    const brief = buildCongDanhBrief(THIEN_LUONG);
    const thuan = brief?.luan.filter((de) => de.sac === Sac.Thuan) ?? [];

    expect(thuan[0]?.do).toContain('Thiên Lương');
  });

  it('hạ đều trọng số và báo tên án ngữ khi cung Quan Lộc bị Tuần hay Triệt', () => {
    const brief = buildCongDanhBrief(THIEN_LUONG);
    const thuanDau = brief?.luan.find((de) => de.sac === Sac.Thuan);

    expect(brief?.anNgu).toBe('Tuần');
    expect(thuanDau?.trong).toBe(84);
  });

  it('mang theo dữ kiện lá số mà bộ kiểm cần để đối chiếu bài', () => {
    const brief = buildCongDanhBrief(THIEN_LUONG);

    expect(brief).toMatchObject({
      cung: 'Quan Lộc',
      chi: 'Ngọ',
      gioiTinh: Gender.Nam,
      chiNamSinh: 'Thìn',
      laVoChinhDieu: false,
    });
  });

  it('đưa mệnh đề của phụ tinh vào cùng một lượt xếp hạng với chính tinh khi Quan Lộc vô chính diệu', () => {
    const brief = buildCongDanhBrief(CONG_DANH_YEU);

    expect(brief?.luan.some((de) => de.do.includes('Đà La'))).toBe(true);
  });

  it('chỉ liệt kê phụ tinh thực sự đứng sau mệnh đề được giữ', () => {
    const brief = buildCongDanhBrief(CONG_DANH_YEU);
    const dungToi = new Set(brief?.luan.flatMap((de) => de.do));
    const moiSao = [...(brief?.hungTinh ?? []), ...(brief?.catTinh ?? [])];

    expect(moiSao.length).toBeGreaterThan(0);
    for (const sao of moiSao) expect(dungToi.has(sao.ten)).toBe(true);
  });

  it('trả null khi tam phương tứ chính quanh Quan Lộc không còn sao nào bảng luận biết tới', () => {
    const tron = structuredClone(THIEN_LUONG) as unknown as {
      menhIndex: number;
      cungs: { chinhTinh: unknown[]; chinhTinhMuon: unknown[]; phuTinh: unknown[] }[];
    };
    const quanLocIndex = quanLocIndexOf(tron as unknown as NatalChart);
    const [tamHopA, tamHopB] = tamHopIndexes(quanLocIndex);
    for (const index of [quanLocIndex, xungChieuIndex(quanLocIndex), tamHopA, tamHopB]) {
      tron.cungs[index].chinhTinh = [];
      tron.cungs[index].chinhTinhMuon = [];
      tron.cungs[index].phuTinh = [];
    }

    expect(buildCongDanhBrief(tron as unknown as NatalChart)).toBeNull();
  });
});
