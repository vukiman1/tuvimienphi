import { checkWording } from './check-wording';
import type { PageDraftBody } from './check-shape';

function bodyWith(...paragraphs: readonly string[]): PageDraftBody {
  return {
    summary: 'Tóm tắt trung tính cho kiểm thử.',
    sections: [{ heading: 'Mục', paragraphs }],
  };
}

describe('checkWording', () => {
  it('rejects the phrases the luận giải and Tết checks forbid', () => {
    const v = checkWording(bodyWith('Năm nay gặp tai họa và đại họa, phải cúng theo dữ kiện.'));
    for (const phrase of ['tai họa', 'đại họa', 'phải cúng', 'dữ kiện']) {
      expect(v.some((m) => m.includes(phrase))).toBe(true);
    }
  });

  it('rejects đại hạn, chết and khó tránh', () => {
    const v = checkWording(bodyWith('Vào đại hạn này dễ chết và khó tránh.'));
    for (const phrase of ['đại hạn', 'chết', 'khó tránh']) {
      expect(v.some((m) => m.includes(phrase))).toBe(true);
    }
  });

  it('rejects old-style tone marks', () => {
    for (const bad of ['Hoá Lộc', 'hành Hoả', 'Thuỷ', 'hoà hợp']) {
      expect(checkWording(bodyWith(bad)).length).toBeGreaterThan(0);
    }
  });

  it('keeps new-style words and closed syllables', () => {
    const v = checkWording(bodyWith('Hóa Lộc hoàn toàn, toán Huỳnh Quý khoảng.'));
    expect(v).toEqual([]);
  });

  it('rejects Tỵ and keeps Tị', () => {
    expect(checkWording(bodyWith('Người tuổi Tỵ.')).length).toBeGreaterThan(0);
    expect(checkWording(bodyWith('Người tuổi Tị.'))).toEqual([]);
  });

  it('rejects Tử Vi capitalised for the art but keeps the star and its circle', () => {
    expect(checkWording(bodyWith('Khi xem Tử Vi theo Tử Vi Đẩu Số.')).length).toBeGreaterThan(0);
    expect(checkWording(bodyWith('Có sao Tử Vi trong chòm Tử Vi, học môn tử vi.'))).toEqual([]);
  });
});
