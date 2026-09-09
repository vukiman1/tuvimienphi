import { CHI_NGU_HANH, theSinhKhac, TheSinhKhac } from './chi-ngu-hanh.js';

describe('theSinhKhac', () => {
  it('đọc đúng năm thế giữa hành của sao và hành của cung', () => {
    expect(theSinhKhac('Mộc', 'Mộc')).toBe(TheSinhKhac.TiHoa);
    expect(theSinhKhac('Mộc', 'Hỏa')).toBe(TheSinhKhac.SaoSinhCung);
    expect(theSinhKhac('Hỏa', 'Mộc')).toBe(TheSinhKhac.CungSinhSao);
    expect(theSinhKhac('Mộc', 'Thổ')).toBe(TheSinhKhac.SaoKhacCung);
    expect(theSinhKhac('Thổ', 'Mộc')).toBe(TheSinhKhac.CungKhacSao);
  });
});

describe('CHI_NGU_HANH', () => {
  it('phủ đủ mười hai chi và khớp bốn mốc quen thuộc', () => {
    expect(CHI_NGU_HANH).toHaveLength(12);
    expect(CHI_NGU_HANH[0]).toBe('Thủy'); // Tý
    expect(CHI_NGU_HANH[2]).toBe('Mộc'); // Dần
    expect(CHI_NGU_HANH[6]).toBe('Hỏa'); // Ngọ
    expect(CHI_NGU_HANH[8]).toBe('Kim'); // Thân
  });
});
