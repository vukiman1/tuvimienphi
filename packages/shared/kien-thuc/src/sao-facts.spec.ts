import { ratingAt, saoFacts, SaoKind } from './sao-facts.js';

describe('sao facts', () => {
  it('gives a chính tinh its hành, its chòm and all twelve ratings', () => {
    const facts = saoFacts('Thiên Cơ');
    expect(facts.kind).toBe(SaoKind.ChinhTinh);
    expect(facts.hanh).toBe('Mộc');
    if (facts.kind === SaoKind.ChinhTinh) {
      expect(facts.chom).toBe('Tử Vi');
    }
    expect(facts.ratings).toHaveLength(12);
    expect(facts.ratings.find((cell) => cell.chi === 2)?.rating).toBe('H');
  });

  it('keeps only the rated cells of a partial phụ tinh row', () => {
    expect(saoFacts('Địa Kiếp').ratings).toEqual([{ chi: 2, rating: 'Đ' }]);

    const vanXuong = saoFacts('Văn Xương').ratings;
    expect(vanXuong).toHaveLength(10);
    expect(vanXuong.some((cell) => cell.chi === 3)).toBe(false);
    expect(vanXuong.some((cell) => cell.chi === 9)).toBe(false);

    const kinhDuong = saoFacts('Kình Dương').ratings;
    for (const chi of [2, 5, 8, 11]) {
      expect(kinhDuong.some((cell) => cell.chi === chi)).toBe(false);
    }
  });

  it('gives no ratings to stars the tables leave out', () => {
    for (const name of ['Tả Phù', 'Hữu Bật', 'Thiên Khôi', 'Thiên Việt'] as const) {
      expect(saoFacts(name).ratings).toHaveLength(0);
    }
    for (const name of ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'] as const) {
      expect(saoFacts(name).ratings).toHaveLength(0);
    }
  });

  it('marks hung phụ tinh from the engine list', () => {
    for (const name of ['Kình Dương', 'Địa Không'] as const) {
      const facts = saoFacts(name);
      expect(facts.kind).toBe(SaoKind.PhuTinh);
      if (facts.kind === SaoKind.PhuTinh) {
        expect(facts.isHung).toBe(true);
      }
    }
    for (const name of ['Lộc Tồn', 'Tả Phù', 'Văn Khúc'] as const) {
      const facts = saoFacts(name);
      if (facts.kind === SaoKind.PhuTinh) {
        expect(facts.isHung).toBe(false);
      }
    }
  });

  it('groups the four hóa apart and lists their star for every can', () => {
    const hoaKy = saoFacts('Hóa Kỵ');
    expect(hoaKy.kind).toBe(SaoKind.TuHoa);
    if (hoaKy.kind === SaoKind.TuHoa) {
      expect(hoaKy.isHung).toBe(true);
      expect(hoaKy.byCan).toHaveLength(10);
      expect(hoaKy.byCan[0]).toEqual({ can: 0, star: 'Thái Dương' });
    }

    const hoaLoc = saoFacts('Hóa Lộc');
    if (hoaLoc.kind === SaoKind.TuHoa) {
      expect(hoaLoc.byCan[0].star).toBe('Liêm Trinh');
    }
  });

  it('reads ratings by chi and returns null where the engine has none', () => {
    expect(ratingAt('Thái Dương', 5)).toBe('M');
    expect(ratingAt('Địa Kiếp', 0)).toBeNull();
    expect(ratingAt('Tả Phù', 2)).toBeNull();
  });
});
