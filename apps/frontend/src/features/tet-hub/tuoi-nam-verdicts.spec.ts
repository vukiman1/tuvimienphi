import { TET_HUB_VIEW_YEAR, tuoiNamFacts } from '@org/shared-tu-vi';
import { tamTaiVerdict, thaiTueVerdict, xongDatVerdict } from './tuoi-nam-verdicts';

const BINH_DAN = tuoiNamFacts(1986, TET_HUB_VIEW_YEAR);
const DINH_MAO = tuoiNamFacts(1987, TET_HUB_VIEW_YEAR);
const AT_SUU = tuoiNamFacts(1985, TET_HUB_VIEW_YEAR);
const TAN_MUI = tuoiNamFacts(1991, TET_HUB_VIEW_YEAR);

describe('tamTaiVerdict', () => {
  it('says a chi outside the Tam tai group is clear', () => {
    expect(tamTaiVerdict(BINH_DAN)).toBe('Tuổi Dần không phạm Tam tai trong năm 2027.');
  });

  it('names which of the three Tam tai years the view year is', () => {
    expect(tamTaiVerdict(DINH_MAO)).toMatch(
      /^Năm 2027 là năm thứ ba trong ba năm Tam tai liên tiếp của tuổi Mão\./,
    );
  });
});

describe('thaiTueVerdict', () => {
  it('says a chi with no relation to the year is clear', () => {
    expect(thaiTueVerdict(BINH_DAN)).toBe('Tuổi Dần không phạm Thái tuế năm Đinh Mùi 2027.');
  });

  it('lists every relation the chi has with the year', () => {
    expect(thaiTueVerdict(AT_SUU)).toMatch(
      /^Tuổi Sửu phạm Thái tuế năm Đinh Mùi 2027 theo thế xung và hình\./,
    );
  });

  it('calls the chi of the year itself its năm tuổi', () => {
    expect(thaiTueVerdict(TAN_MUI)).toMatch(/theo thế trực \(năm tuổi\)\./);
  });
});

describe('xongDatVerdict', () => {
  it('names the chi that suit the house and the chi to avoid', () => {
    expect(xongDatVerdict(BINH_DAN)).toBe(
      'Tết Đinh Mùi 2027, gia chủ tuổi Dần hợp người tuổi Ngọ và Hợi xông đất, nên tránh người tuổi Tị và Thân.',
    );
  });

  it('says no chi suits both house and year when every hợp chi clashes with the year', () => {
    const facts = { ...BINH_DAN, xongDat: { hop: [], tranh: BINH_DAN.xongDat.tranh } };

    expect(xongDatVerdict(facts)).toBe(
      'Tết Đinh Mùi 2027, không có tuổi tam hợp hay lục hợp nào vừa hợp gia chủ tuổi Dần vừa hợp năm mới; nên tránh người tuổi Tị và Thân xông đất.',
    );
  });
});
