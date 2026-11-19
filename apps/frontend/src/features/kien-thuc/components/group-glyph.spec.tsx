import { render } from '@testing-library/react';
import { EntryGroup } from '@org/shared-contracts';
import { GroupGlyph } from './group-glyph';

describe('GroupGlyph', () => {
  it('draws one point per glyph count and hides from assistive tech', () => {
    const { container, rerender } = render(<GroupGlyph group={EntryGroup.ChinhTinh} />);
    expect(container.querySelectorAll('circle')).toHaveLength(14);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');

    rerender(<GroupGlyph group={EntryGroup.Cung} />);
    expect(container.querySelectorAll('circle')).toHaveLength(12);
  });

  it('draws three ruled lines for the glossary', () => {
    const { container } = render(<GroupGlyph group={EntryGroup.ThuatNgu} />);

    expect(container.querySelectorAll('line')).toHaveLength(3);
    expect(container.querySelectorAll('circle')).toHaveLength(0);
  });
});
