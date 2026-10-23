import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { buildCongDanhBrief } from './build-cong-danh-brief.js';
import { buildCongDanhMucBriefs } from './build-cong-danh-muc-briefs.js';
import { buildMenhBrief } from './build-menh-brief.js';
import { buildMenhMucBriefs } from './build-menh-muc-briefs.js';
import { buildMucBriefs } from './build-muc-briefs.js';
import { buildTaiBachBrief } from './build-tai-bach-brief.js';
import { buildTaiBachMucBriefs } from './build-tai-bach-muc-briefs.js';
import { buildThanCuBrief } from './build-than-cu-brief.js';
import { buildTinhDuyenBrief } from './build-tinh-duyen-brief.js';
import { buildGiaDaoMucBriefs, buildTinhDuyenMucBriefs } from './build-tinh-duyen-muc-briefs.js';

interface LaSoMau {
  readonly ten: string;
  readonly chart: NatalChart;
}

const LA_SO_MAU: readonly LaSoMau[] = [
  {
    ten: '1960-05-26 21h Nam',
    chart: castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam }),
  },
  {
    ten: '1956-03-03 1h Nam',
    chart: castNatal({ solarDate: new Date(1956, 2, 3), hour: 1, gender: Gender.Nam }),
  },
  {
    ten: '1955-06-26 21h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 5, 26), hour: 21, gender: Gender.Nu }),
  },
  {
    ten: '1955-12-09 7h Nữ',
    chart: castNatal({ solarDate: new Date(1955, 11, 9), hour: 7, gender: Gender.Nu }),
  },
];

describe.each(LA_SO_MAU)('brief của lá số $ten', ({ chart }) => {
  it('Thân cư', () => {
    expect({ chinh: buildThanCuBrief(chart), muc: buildMucBriefs(chart) }).toMatchSnapshot();
  });

  it('Mệnh', () => {
    expect({ chinh: buildMenhBrief(chart), muc: buildMenhMucBriefs(chart) }).toMatchSnapshot();
  });

  it('Công danh', () => {
    expect({
      chinh: buildCongDanhBrief(chart),
      muc: buildCongDanhMucBriefs(chart),
    }).toMatchSnapshot();
  });

  it('Tài bạch', () => {
    expect({
      chinh: buildTaiBachBrief(chart),
      muc: buildTaiBachMucBriefs(chart),
    }).toMatchSnapshot();
  });

  it('Tình duyên', () => {
    expect({
      chinh: buildTinhDuyenBrief(chart),
      muc: buildTinhDuyenMucBriefs(chart),
      giaDao: buildGiaDaoMucBriefs(chart),
    }).toMatchSnapshot();
  });
});
