import { render, screen } from '@testing-library/react';
import {
  KIM_LAU_TRUYEN_THONG,
  TAM_TAI_TRUYEN_THONG,
  XONG_DAT_TRUYEN_THONG,
} from '@org/shared-tu-vi';
import { HowWeCount } from './HowWeCount';

const CHECKED_SOURCES = ['dienmayxanh.com', 'quantrimang.com', 'wiki.batdongsan.com.vn'] as const;

describe('HowWeCount', () => {
  it('names the folk tradition and the sources the tables were checked against', () => {
    render(<HowWeCount />);

    const sources = screen.getByText('Nguồn').nextElementSibling?.textContent ?? '';
    expect(sources).toContain('tuổi mụ');
    CHECKED_SOURCES.forEach((source) => expect(sources).toContain(source));
  });

  it.each([
    ['Kim lâu', KIM_LAU_TRUYEN_THONG],
    ['Tam tai', TAM_TAI_TRUYEN_THONG],
    ['Xông đất', XONG_DAT_TRUYEN_THONG],
  ])('explains the %s rule the pages compute', (label, rule) => {
    render(<HowWeCount />);

    expect(screen.getByText(label).nextElementSibling?.textContent).toBe(rule);
  });
});
