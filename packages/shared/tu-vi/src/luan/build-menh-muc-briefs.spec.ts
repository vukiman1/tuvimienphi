import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildMenhMucBriefs, MenhMucKey } from './build-menh-muc-briefs.js';

/** Mệnh tại Mùi, Mộc Tam Cục, bản mệnh Bích Thượng Thổ. */
const THIEN_TUONG: NatalChart = castNatal({
  solarDate: new Date(1960, 4, 26),
  hour: 21,
  gender: Gender.Nam,
});

/** Mệnh tại Tị, nhiều cát tinh hội chiếu nên mục Điểm mạnh có mệnh đề của riêng nó. */
const NHIEU_CAT_TINH: NatalChart = castNatal({
  solarDate: new Date(1994, 8, 16),
  hour: 7,
  gender: Gender.Nu,
});

/** Mệnh vô chính diệu: không chính tinh nào toạ thủ nên mục ngũ hành không đủ mệnh đề. */
const MENH_TRONG: NatalChart = castNatal({
  solarDate: new Date(1968, 0, 2),
  hour: 17,
  gender: Gender.Nam,
});

describe('buildMenhMucBriefs', () => {
  it('mục ngũ hành dẫn tên cục và bản mệnh để bài nói đúng con số của lá số', () => {
    const nguHanh = buildMenhMucBriefs(THIEN_TUONG).find((muc) => muc.muc === 'ngu-hanh');

    expect(nguHanh?.tieuDe).toBe('Ngũ hành bản mệnh');
    expect(nguHanh?.duKien).toEqual(
      expect.arrayContaining(['Mộc Tam Cục', 'bản mệnh Bích Thượng Thổ']),
    );
  });

  it('mỗi mục mang theo dữ kiện lá số để bộ kiểm chạy y nguyên trên mục con', () => {
    for (const muc of buildMenhMucBriefs(THIEN_TUONG)) {
      expect(muc.cung).toBe('Mệnh');
      expect(muc.chinhTinh.length).toBeGreaterThan(0);
      expect(muc.sourceCung).toBe('Mệnh · Mùi');
    }
  });

  it('bỏ hẳn mục không đủ hai mệnh đề thay vì trả một mục cụt', () => {
    const mucs = buildMenhMucBriefs(MENH_TRONG);

    expect(mucs.map((muc) => muc.muc)).not.toContain(MenhMucKey.NguHanh);
    expect(mucs.length).toBeGreaterThan(0);
  });

  it('liệt kê sao đứng sau mệnh đề của chính mục đó, không phải sao của bài chính', () => {
    for (const muc of buildMenhMucBriefs(NHIEU_CAT_TINH)) {
      const coTenTrongBrief = new Set<string>([
        ...muc.chinhTinh.map((sao) => sao.ten),
        ...muc.hungTinh.map((sao) => sao.ten),
        ...muc.catTinh.map((sao) => sao.ten),
      ]);

      for (const de of muc.luan) {
        for (const sao of de.do)
          expect([muc.tieuDe, sao, coTenTrongBrief.has(sao)]).toEqual([muc.tieuDe, sao, true]);
      }
    }
  });
});
