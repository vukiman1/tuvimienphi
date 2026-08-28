import { describe, it, expect } from 'vitest';
import { dayCanChi, yearCanChi } from './can-chi';

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

describe('yearCanChi', () => {
  it('maps well-known years to their sexagenary pillar', () => {
    expect(yearCanChi(2026)).toBe('Bính Ngọ');
    expect(yearCanChi(2024)).toBe('Giáp Thìn');
    expect(yearCanChi(2020)).toBe('Canh Tý');
  });
});

describe('dayCanChi', () => {
  it('is deterministic for a given date', () => {
    const d = new Date('2026-08-27T00:00:00Z');
    expect(dayCanChi(d)).toBe(dayCanChi(new Date('2026-08-27T00:00:00Z')));
  });

  it('returns a valid Can + Chi pair', () => {
    const [can, chi] = dayCanChi(new Date('2026-08-27T00:00:00Z')).split(' ');
    expect(CAN).toContain(can);
    expect(CHI).toContain(chi);
  });

  it('advances the stem and branch by one each day', () => {
    const d1 = new Date('2026-08-27T00:00:00Z');
    const d2 = new Date('2026-08-28T00:00:00Z');
    const [c1, b1] = dayCanChi(d1).split(' ');
    const [c2, b2] = dayCanChi(d2).split(' ');
    expect(CAN.indexOf(c2)).toBe((CAN.indexOf(c1) + 1) % 10);
    expect(CHI.indexOf(b2)).toBe((CHI.indexOf(b1) + 1) % 12);
  });
});
