import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import { buildPhuTinhMucBriefs } from './build-cung-muc-briefs.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

describe('buildPhuTinhMucBriefs', () => {
  it('đặt tiêu đề mục theo lĩnh vực của chương', () => {
    const tieuDe = buildPhuTinhMucBriefs(THIEN_LUONG, BANG_TAI_BACH, 'tình duyên').map(
      (muc) => muc.tieuDe,
    );

    expect(tieuDe.sort()).toEqual(['Điểm cần giữ trong tình duyên', 'Điểm mạnh trong tình duyên']);
  });
});
