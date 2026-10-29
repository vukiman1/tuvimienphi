import { anTuHoa } from './tu-hoa.js';
import { anTuHoaLuuNien, viewYearPillar } from './view-year.js';

const DINH = 3;
const MUI = 7;
const BINH = 2;
const NGO = 6;

describe('viewYearPillar', () => {
  it('gives 2027 the pillar Đinh Mùi', () => {
    expect(viewYearPillar(2027)).toEqual({ can: DINH, chi: MUI });
  });

  it('gives 2026 the pillar Bính Ngọ', () => {
    expect(viewYearPillar(2026)).toEqual({ can: BINH, chi: NGO });
  });
});

describe('anTuHoaLuuNien', () => {
  it('follows the Tứ hoá row of the view year can', () => {
    expect(anTuHoaLuuNien(2027)).toEqual(anTuHoa(DINH));
  });

  it('turns Thái Âm into Hóa Lộc and Cự Môn into Hóa Kỵ in an Đinh year', () => {
    expect(anTuHoaLuuNien(2027)).toEqual([
      { hoa: 'Hóa Lộc', star: 'Thái Âm' },
      { hoa: 'Hóa Quyền', star: 'Thiên Đồng' },
      { hoa: 'Hóa Khoa', star: 'Thiên Cơ' },
      { hoa: 'Hóa Kỵ', star: 'Cự Môn' },
    ]);
  });
});
