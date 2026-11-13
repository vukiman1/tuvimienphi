import { render, screen } from '@testing-library/react';
import { getNhiThapBatTu } from '@/lib/nhi-thap-bat-tu';
import { NhiThapBatTuPanel } from './nhi-thap-bat-tu-panel';

const RESULT = getNhiThapBatTu(new Date(2026, 7, 11), 15);
const PILLAR_COUNT = 4;
const GRADIENT_CLASS = /^bg-(gradient|linear)/;

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

describe('NhiThapBatTuPanel', () => {
  it('titles the panel with a serif h2', () => {
    render(<NhiThapBatTuPanel {...RESULT} />);

    expect(
      classTokens(screen.getByRole('heading', { level: 2, name: 'Nhị Thập Bát Tú' })),
    ).toContain('font-emphasis');
  });

  it("names each pillar's sao on a gold pill", () => {
    render(<NhiThapBatTuPanel {...RESULT} />);
    const pills = RESULT.pillars.map((pillar) => screen.getByText(`Sao ${pillar.tu.name}`));

    expect(pills).toHaveLength(PILLAR_COUNT);
    for (const pill of pills) {
      expect(classTokens(pill)).toEqual(expect.arrayContaining(['bg-gold', 'text-ink']));
    }
  });

  it('sets every verse line in the preloaded Playfair italic', () => {
    render(<NhiThapBatTuPanel {...RESULT} />);
    const lines = RESULT.verses.flatMap((verse) => verse.tu.verse);

    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      for (const element of screen.getAllByText(line)) {
        expect(classTokens(element)).toEqual(
          expect.arrayContaining(['font-emphasis', 'italic', 'font-semibold']),
        );
      }
    }
  });

  it('draws no gradients', () => {
    const { container } = render(<NhiThapBatTuPanel {...RESULT} />);

    const gradients = [...container.querySelectorAll('*')].filter((element) =>
      classTokens(element).some((token) => GRADIENT_CLASS.test(token)),
    );
    expect(gradients).toEqual([]);
  });
});
