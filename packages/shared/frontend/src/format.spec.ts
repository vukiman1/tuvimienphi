import { initials, formatNumber, formatCompact, formatDate } from './format.js';

describe('initials', () => {
  it('takes first + last word initials, uppercased', () => {
    expect(initials('Nguyễn Xuân Anh')).toBe('NA');
    expect(initials('Quản Trị')).toBe('QT');
  });

  it('handles a single word and blanks', () => {
    expect(initials('Anh')).toBe('AA');
    expect(initials('')).toBe('QT');
    expect(initials(null)).toBe('QT');
    expect(initials(undefined)).toBe('QT');
  });
});

describe('formatNumber', () => {
  it('groups thousands with the vi-VN separator', () => {
    expect(formatNumber(12345)).toBe('12.345');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatCompact', () => {
  it('abbreviates thousands and millions in Vietnamese', () => {
    expect(formatCompact(12345)).toBe('12,3N');
    expect(formatCompact(2_100_000)).toBe('2,1Tr');
  });

  it('leaves small numbers untouched', () => {
    expect(formatCompact(999)).toBe('999');
  });
});

describe('formatDate', () => {
  it('renders dd/mm/yyyy for a Date and an ISO string', () => {
    expect(formatDate(new Date(2026, 8, 3))).toBe('03/09/2026');
    expect(formatDate('2026-09-03T00:00:00')).toBe('03/09/2026');
  });
});
