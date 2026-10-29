import { castNatal } from '../cast-chart.js';
import { CHI_COUNT, nhiHopIndex } from '../chi.js';
import type { TuHoa } from '../tu-hoa.js';
import { Gender } from '../van-han.js';
import { TheChieu, theCuaChi, theCungAt, tuHoaTacDongTai } from './the-cung.js';

const TY = 0;
const MAO = 3;
const THIN = 4;
const NGO = 6;
const THAN = 8;

const CHART = castNatal({ solarDate: new Date(1960, 4, 26), hour: 21, gender: Gender.Nam });
const ANCHORS = Array.from({ length: CHI_COUNT }, (_, chiIndex) => chiIndex);

describe('theCuaChi', () => {
  it('calls the anchor itself toạ thủ', () => {
    expect(theCuaChi(TY, TY)).toBe(TheChieu.ToaThu);
  });

  it('calls the opposite chi xung chiếu', () => {
    expect(theCuaChi(TY, NGO)).toBe(TheChieu.XungChieu);
  });

  it('calls both trine chi tam hợp', () => {
    expect([theCuaChi(TY, THIN), theCuaChi(TY, THAN)]).toEqual([TheChieu.TamHop, TheChieu.TamHop]);
  });

  it('calls the paired chi nhị hợp', () => {
    expect(theCuaChi(TY, nhiHopIndex(TY))).toBe(TheChieu.NhiHop);
  });

  it('gives no thế to a chi outside the four', () => {
    expect(theCuaChi(TY, MAO)).toBeNull();
  });
});

describe('tuHoaTacDongTai', () => {
  it.each(ANCHORS)('agrees with theCungAt for the natal Tứ hoá at anchor %i', (anchorIndex) => {
    expect(tuHoaTacDongTai(CHART, anchorIndex, CHART.tuHoa)).toEqual(
      theCungAt(CHART, anchorIndex).tuHoaTacDong,
    );
  });

  it('drops a hoá whose star sits at a chi with no thế toward the anchor', () => {
    const starAt = (chiIndex: number) => CHART.cungs[chiIndex].phuTinh[0].name;
    const tuHoa: readonly TuHoa[] = [
      { hoa: 'Hóa Khoa', star: starAt(TY) },
      { hoa: 'Hóa Kỵ', star: starAt(MAO) },
    ];

    expect(tuHoaTacDongTai(CHART, TY, tuHoa)).toEqual([tuHoa[0]]);
  });
});
