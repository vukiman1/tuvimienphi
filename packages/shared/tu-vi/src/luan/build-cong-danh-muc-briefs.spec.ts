import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildCongDanhMucBriefs, CongDanhMucKey } from './build-cong-danh-muc-briefs.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

const DIEM_MANH_MONG: NatalChart = castNatal({
  solarDate: new Date(1950, 0, 5),
  hour: 13,
  gender: Gender.Nam,
});

describe('buildCongDanhMucBriefs', () => {
  it('mỗi mục mang theo dữ kiện lá số để bộ kiểm chạy y nguyên trên mục con', () => {
    for (const muc of buildCongDanhMucBriefs(THIEN_LUONG)) {
      expect(muc.cung).toBe('Quan Lộc');
      expect(muc.sourceCung).toBe('Quan Lộc · Ngọ');
    }
  });

  it('dựng đủ hai mục khi cả điểm mạnh và điểm cần giữ đều có ít nhất hai mệnh đề', () => {
    const mucs = buildCongDanhMucBriefs(THIEN_LUONG);

    expect(mucs.map((muc) => muc.muc).sort()).toEqual(
      [CongDanhMucKey.DiemManh, CongDanhMucKey.DiemCanGiu].sort(),
    );
  });

  it('bỏ hẳn mục không đủ hai mệnh đề thay vì trả một mục cụt', () => {
    const mucs = buildCongDanhMucBriefs(DIEM_MANH_MONG);

    expect(mucs.map((muc) => muc.muc)).toEqual([CongDanhMucKey.DiemCanGiu]);
  });

  it('liệt kê sao đứng sau mệnh đề của chính mục đó, không phải sao của bài chính', () => {
    for (const muc of buildCongDanhMucBriefs(THIEN_LUONG)) {
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

describe('buildCongDanhMucBriefs — không còn lẫn nội dung tình duyên', () => {
  it('Đại Hao ở "Điểm cần giữ" đọc về công việc, không phải chuyện tình cảm', () => {
    const chart = castNatal({ solarDate: new Date(1990, 5, 15), hour: 10, gender: Gender.Nam });

    const mucBriefs = buildCongDanhMucBriefs(chart);
    const diemCanGiu = mucBriefs.find((muc) => muc.muc === 'diem-can-giu');

    expect(
      diemCanGiu?.luan.some((de) =>
        de.y.includes('hao tổn nhiều công sức và tiền bạc cho công việc'),
      ),
    ).toBe(true);
    expect(diemCanGiu?.luan.some((de) => de.y.includes('vì chuyện tình cảm'))).toBe(false);
  });
});
