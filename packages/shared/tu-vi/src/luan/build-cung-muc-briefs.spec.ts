import { castNatal, type NatalChart } from '../cast-chart.js';
import { Gender } from '../van-han.js';
import { CHI } from '../lich/lunar-calendar.js';
import { BANG_PHU_MAU } from './bang/phu-mau/bang-phu-mau.js';
import { BANG_TAI_BACH } from './bang/tai-bach/bang-tai-bach.js';
import { BANG_TU_TUC } from './bang/tu-tuc/bang-tu-tuc.js';
import { buildCungBrief, cungIndexOf } from './build-cung-brief.js';
import { buildCungMucBrief, buildPhuTinhMucBriefs } from './build-cung-muc-briefs.js';

const GIO_QUET = [1, 7, 13, 19];

function quetLaSo(): NatalChart[] {
  const charts: NatalChart[] = [];
  for (const year of [1968, 1985, 1994, 2001]) {
    for (let month = 0; month < 12; month += 1) {
      for (const day of [3, 11, 19, 27]) {
        for (const hour of GIO_QUET) {
          for (const gender of [Gender.Nam, Gender.Nu]) {
            charts.push(castNatal({ solarDate: new Date(year, month, day), hour, gender }));
          }
        }
      }
    }
  }
  return charts;
}

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

describe('buildCungMucBrief', () => {
  it('mục đọc từ cung khác mang chi và tên cung của chính cung đó', () => {
    const muc = buildCungMucBrief(THIEN_LUONG, BANG_TU_TUC, 'con-cai', 'Con cái');
    const chi = CHI[cungIndexOf(THIEN_LUONG, 'Tử Tức')];

    expect([muc?.cung, muc?.chi, muc?.sourceCung]).toEqual(['Tử Tức', chi, `Tử Tức · ${chi}`]);
  });

  it('giữ nguyên mệnh đề của brief cung đó', () => {
    expect(buildCungMucBrief(THIEN_LUONG, BANG_TU_TUC, 'con-cai', 'Con cái')?.luan).toEqual(
      buildCungBrief(THIEN_LUONG, BANG_TU_TUC)?.luan,
    );
  });

  it('mọi sao đứng sau mệnh đề đều có trong danh sách sao của chính mục', () => {
    const lac = quetLaSo().flatMap((chart) =>
      [
        buildCungMucBrief(chart, BANG_TU_TUC, 'con-cai', 'Con cái'),
        buildCungMucBrief(chart, BANG_PHU_MAU, 'cha-me', 'Cha mẹ'),
      ].filter((muc) => {
        if (!muc) return false;
        const coMat = new Set<string>([
          ...muc.chinhTinh.map((sao) => sao.ten),
          ...muc.hungTinh.map((sao) => sao.ten),
          ...muc.catTinh.map((sao) => sao.ten),
        ]);
        return muc.luan.some((de) => de.do.some((sao) => !coMat.has(sao)));
      }),
    );

    expect(lac).toHaveLength(0);
  });

  it('trả null khi cung đó không dựng nổi brief', () => {
    expect(
      buildCungMucBrief(THIEN_LUONG, { ...BANG_TU_TUC, chinhTinh: {} }, 'con-cai', 'Con cái'),
    ).toBeNull();
  });
});
