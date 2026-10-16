import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildGiaDaoMucBriefs, buildTinhDuyenMucBriefs } from './build-tinh-duyen-muc-briefs.js';

const THIEN_LUONG: NatalChart = castNatal({
  solarDate: new Date(1953, 0, 25),
  hour: 21,
  gender: Gender.Nam,
});

describe('buildGiaDaoMucBriefs', () => {
  it('dựng mục con cái rồi mục cha mẹ, mỗi mục đọc từ cung của mình', () => {
    const mucs = buildGiaDaoMucBriefs(THIEN_LUONG);

    expect(mucs.map((muc) => muc.muc)).toEqual(['con-cai', 'cha-me']);
    expect(mucs[0]?.sourceCung.startsWith('Tử Tức · ')).toBe(true);
    expect(mucs[1]?.sourceCung.startsWith('Phụ Mẫu · ')).toBe(true);
  });
});

describe('buildTinhDuyenMucBriefs', () => {
  it('mọi mục đều đọc từ cung Phu Thê', () => {
    const mucs = buildTinhDuyenMucBriefs(THIEN_LUONG);

    expect(mucs.length).toBeGreaterThan(0);
    expect(mucs.every((muc) => muc.cung === 'Phu Thê')).toBe(true);
  });
});
