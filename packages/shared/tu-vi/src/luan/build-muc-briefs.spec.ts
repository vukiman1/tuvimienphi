import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { TheMenhThan } from './bang/menh-than.js';
import { buildMucBriefs, MucKey, theMenhThan } from './build-muc-briefs.js';

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });

describe('buildMucBriefs', () => {
  it('luôn nói quãng hậu vận, dù lá số nào', () => {
    for (let thang = 1; thang <= 12; thang += 1) {
      const chart = castNatal({
        solarDate: new Date(1990, thang - 1, 12),
        hour: 9,
        gender: Gender.Nam,
      });
      const thoiDiem = buildMucBriefs(chart).find((muc) => muc.muc === MucKey.ThoiDiem);

      expect(thoiDiem?.duKien.join(' ')).toContain('hậu vận');
    }
  });

  it('chỉ nêu mốc đại vận khi nó còn nằm trong tuổi người ta sống tới', () => {
    let coMoc = 0;
    let boMoc = 0;

    for (let thang = 1; thang <= 12; thang += 1) {
      const chart = castNatal({
        solarDate: new Date(1990, thang - 1, 12),
        hour: 9,
        gender: Gender.Nam,
      });
      const thoiDiem = buildMucBriefs(chart).find((muc) => muc.muc === MucKey.ThoiDiem);
      const van = chart.daiVan.find((moc) => moc.chiIndex === chart.thanIndex);
      const neuMoc = thoiDiem?.duKien.some((mot) => mot.includes('đại vận')) ?? false;

      if (neuMoc) {
        coMoc += 1;
        expect(van?.startAge).toBeLessThanOrEqual(80);
        expect(thoiDiem?.duKien.join(' ')).toContain(String(van?.startAge));
      } else {
        boMoc += 1;
        expect(van?.startAge).toBeGreaterThan(80);
      }
    }

    // Mười hai đại vận trải trọn một trăm hai mươi năm nên cả hai nhánh đều phải gặp trong tập thử.
    expect(coMoc).toBeGreaterThan(0);
    expect(boMoc).toBeGreaterThan(0);
  });

  it('bỏ hẳn mục không đủ mệnh đề thay vì trả về một mục cụt', () => {
    for (const muc of buildMucBriefs(CHART)) {
      expect(muc.luan.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('mục nào cũng mang theo phần lá số để bộ kiểm chạy được y nguyên', () => {
    for (const muc of buildMucBriefs(CHART)) {
      expect(muc.cungThan).toBe('Phu Thê');
      expect(muc.chinhTinh.length).toBeGreaterThan(0);
      expect(muc.sourceCung).toContain('Phu Thê');
    }
  });
});

describe('theMenhThan', () => {
  it('đọc đúng bốn thế giữa cung Mệnh và cung Thân', () => {
    expect(theMenhThan(0, 0)).toBe(TheMenhThan.Trung);
    expect(theMenhThan(0, 4)).toBe(TheMenhThan.TamHop);
    expect(theMenhThan(0, 6)).toBe(TheMenhThan.XungChieu);
    expect(theMenhThan(0, 1)).toBe(TheMenhThan.NhiHop);
  });
});
