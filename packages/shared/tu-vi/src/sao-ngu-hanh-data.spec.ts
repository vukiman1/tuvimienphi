import { castChart } from './cast-chart.js';
import { Gender } from './van-han.js';
import { CHINH_TINH_NGU_HANH, PHU_TINH_NGU_HANH } from './sao-ngu-hanh-data.js';

/** Một lá số bất kỳ đã đủ: mọi phụ tinh đều được an trên mọi lá số. */
const CHART = castChart({
  solarDate: new Date(1990, 4, 15),
  hour: 10,
  gender: Gender.Nam,
  viewYear: 2026,
});

describe('bảng ngũ hành của sao', () => {
  it('phủ hết chính tinh engine an được', () => {
    const missing = CHART.cungs
      .flatMap((cung) => cung.chinhTinh.map((star) => star.name))
      .filter((name) => !CHINH_TINH_NGU_HANH[name]);

    expect(missing).toEqual([]);
  });

  it('phủ hết phụ tinh engine an được', () => {
    const missing = CHART.cungs
      .flatMap((cung) => cung.phuTinh.map((star) => star.name))
      .filter((name) => !PHU_TINH_NGU_HANH[name]);

    expect(missing).toEqual([]);
  });

  it('chỉ dùng năm hành, không có giá trị lạ', () => {
    const values = new Set([
      ...Object.values(CHINH_TINH_NGU_HANH),
      ...Object.values(PHU_TINH_NGU_HANH),
    ]);

    expect([...values].sort()).toEqual(['Hỏa', 'Kim', 'Mộc', 'Thổ', 'Thủy']);
  });
});
