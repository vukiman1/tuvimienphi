import { ProseNodeKind, parseProse } from './parse-prose';

describe('parseProse', () => {
  it('splits text and links in order', () => {
    expect(parseProse('Có [[thuat-ngu/can|can]] và [[bai/tuan-va-triet|Tuần, Triệt]].')).toEqual([
      { kind: ProseNodeKind.Text, text: 'Có ' },
      { kind: ProseNodeKind.Link, ref: 'thuat-ngu/can', label: 'can' },
      { kind: ProseNodeKind.Text, text: ' và ' },
      { kind: ProseNodeKind.Link, ref: 'bai/tuan-va-triet', label: 'Tuần, Triệt' },
      { kind: ProseNodeKind.Text, text: '.' },
    ]);
  });

  it('keeps markup that is not a whole link as text', () => {
    expect(parseProse('[[ghi-chu/x|y]]')).toEqual([
      { kind: ProseNodeKind.Text, text: '[[ghi-chu/x|y]]' },
    ]);
    expect(parseProse('Mở [[ rồi thôi')).toEqual([
      { kind: ProseNodeKind.Text, text: 'Mở [[ rồi thôi' },
    ]);
  });
});
