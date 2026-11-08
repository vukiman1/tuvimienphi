import { render, screen } from '@testing-library/react';
import {
  KIM_LAU_TRUYEN_THONG,
  TAM_TAI_TRUYEN_THONG,
  XONG_DAT_TRUYEN_THONG,
} from '@org/shared-tu-vi';
import { HowWeCount } from './HowWeCount';

const DOMAIN_NAME = /\b[a-z0-9-]+\.(com|vn|net|org)\b/i;

describe('HowWeCount', () => {
  it('names the folk tradition the tables follow without naming another site', () => {
    render(<HowWeCount />);

    const sources = screen.getByText('Nguồn').nextElementSibling?.textContent ?? '';
    expect(sources).toContain('tuổi mụ');
    expect(sources).not.toMatch(DOMAIN_NAME);
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
