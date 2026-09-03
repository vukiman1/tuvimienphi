import { render, screen } from '@testing-library/react';
import { ViewYearPicker } from './view-year-picker';

const noop = () => undefined;

function renderPicker(birthYear: number, value: number) {
  render(<ViewYearPicker birthYear={birthYear} onChange={noop} value={value} />);
  return screen.getByRole('combobox', { name: 'Năm xem' }) as HTMLSelectElement;
}

describe('ViewYearPicker', () => {
  it('shows the year being viewed when it falls past the twelve đại vận', () => {
    expect(renderPicker(1900, 2026).value).toBe('2026');
  });

  it('shows the year being viewed when it falls before the birth year', () => {
    expect(renderPicker(2000, 1950).value).toBe('1950');
  });

  it('still starts the range at the birth year', () => {
    expect(renderPicker(1994, 2026).options[0].value).toBe('1994');
  });
});
