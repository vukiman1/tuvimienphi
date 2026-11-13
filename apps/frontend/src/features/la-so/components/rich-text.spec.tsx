import { render, screen } from '@testing-library/react';
import { RichText } from './rich-text';

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

describe('RichText', () => {
  it('marks keywords in ink bold', () => {
    const { container } = render(<RichText text="Sao **Tử Vi** thủ mệnh." />);
    const keyword = container.querySelector('strong');

    expect(keyword?.textContent).toBe('Tử Vi');
    expect(classTokens(keyword)).toEqual(expect.arrayContaining(['font-bold', 'text-ink']));
  });

  it('marks key phrases on a dawn wash', () => {
    const { container } = render(<RichText text="Nói gọn: ==ý chính== là thế." />);
    const phrase = container.querySelector('mark');

    expect(phrase?.textContent).toBe('ý chính');
    expect(classTokens(phrase)).toEqual(expect.arrayContaining(['bg-dawn/60', 'text-ink']));
  });

  it('never renders markup from the text', () => {
    const { container } = render(<RichText text="<b>x</b>" />);

    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText('<b>x</b>')).toBeTruthy();
  });
});
