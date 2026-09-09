import { castNatal } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { TheMenhThan } from './bang/menh-than.js';
import { buildMucBriefs, MucKey, theMenhThan } from './build-muc-briefs.js';

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });

describe('buildMucBriefs', () => {
  it('mục thời điểm dẫn được mốc tuổi đại vận của chính cung an Thân', () => {
    const thoiDiem = buildMucBriefs(CHART).find((muc) => muc.muc === MucKey.ThoiDiem);
    const van = CHART.daiVan.find((moc) => moc.chiIndex === CHART.thanIndex);

    expect(thoiDiem?.duKien.join(' ')).toContain(`${van?.startAge}`);
    expect(thoiDiem?.luan.some((de) => de.tuKhoa.includes(String(van?.startAge)))).toBe(true);
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
