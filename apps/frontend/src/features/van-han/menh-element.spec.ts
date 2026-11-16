import { elementOfMenh } from './menh-element';

describe('elementOfMenh', () => {
  it('reads the element from the last word of the mệnh', () => {
    expect(elementOfMenh('Hải Trung Kim')).toBe('Kim');
    expect(elementOfMenh('Thiên Hà Thủy')).toBe('Thủy');
    expect(elementOfMenh('Lư Trung Hỏa')).toBe('Hỏa');
  });

  it('falls back to Thổ for a mệnh it cannot read', () => {
    expect(elementOfMenh('')).toBe('Thổ');
    expect(elementOfMenh('Thiên Hà Thuỷ')).toBe('Thổ');
  });
});
