import { checkRequiredMentions } from './check-required-mentions';

describe('checkRequiredMentions', () => {
  it('lists each missing mention', () => {
    const body = { summary: 'x', sections: [{ heading: 'Mục', paragraphs: ['có Thiên Cơ'] }] };
    const violations = checkRequiredMentions(body, ['Thiên Cơ', 'chòm Tử Vi']);
    expect(violations.some((m) => m.includes('chòm Tử Vi'))).toBe(true);
    expect(violations.some((m) => m.includes('Thiên Cơ'))).toBe(false);
  });

  it('accepts a mention inside a link label', () => {
    const body = {
      summary: 'x',
      sections: [{ heading: 'Mục', paragraphs: ['[[sao/thien-co|Thiên Cơ]]'] }],
    };
    expect(checkRequiredMentions(body, ['Thiên Cơ'])).toEqual([]);
  });
});
