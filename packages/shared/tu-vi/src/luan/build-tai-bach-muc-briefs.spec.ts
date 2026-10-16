import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { PhuTinhMucKey } from './build-cung-muc-briefs.js';
import { buildTaiBachMucBriefs } from './build-tai-bach-muc-briefs.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const DIEM_MANH_MONG: NatalChart = castNatal({
  solarDate: new Date(1950, 0, 1),
  hour: 21,
  gender: Gender.Nu,
});

describe('buildTaiBachMucBriefs', () => {
  it('mỗi mục mang theo dữ kiện lá số để bộ kiểm chạy y nguyên trên mục con', () => {
    for (const muc of buildTaiBachMucBriefs(THIEN_LUONG)) {
      expect(muc.cung).toBe('Tài Bạch');
      expect(muc.sourceCung).toBe('Tài Bạch · Tuất');
    }
  });

  it('dựng đủ hai mục khi cả điểm mạnh và điểm cần giữ đều có ít nhất hai mệnh đề', () => {
    const mucs = buildTaiBachMucBriefs(THIEN_LUONG);

    expect(mucs.map((muc) => muc.muc).sort()).toEqual(
      [PhuTinhMucKey.DiemManh, PhuTinhMucKey.DiemCanGiu].sort(),
    );
  });

  it('bỏ hẳn mục không đủ hai mệnh đề thay vì trả một mục cụt', () => {
    const mucs = buildTaiBachMucBriefs(DIEM_MANH_MONG);

    expect(mucs.map((muc) => muc.muc)).toEqual([PhuTinhMucKey.DiemCanGiu]);
  });

  it('liệt kê sao đứng sau mệnh đề của chính mục đó, không phải sao của bài chính', () => {
    for (const muc of buildTaiBachMucBriefs(THIEN_LUONG)) {
      const coTenTrongBrief = new Set<string>([
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
