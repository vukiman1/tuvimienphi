import { isDraftFile } from './draft-file';

const VALID = {
  summary: 'Tóm tắt.',
  sections: [{ heading: 'Mục', paragraphs: ['Đoạn.'] }],
  writtenBy: 'claude-code',
  writtenAt: '2026-11-15T00:00:00.000Z',
};

describe('isDraftFile', () => {
  it('accepts prose with writtenBy claude-code', () => {
    expect(isDraftFile(VALID)).toBe(true);
  });

  it('refuses a draft that carries a plan field', () => {
    expect(isDraftFile({ ...VALID, title: 'Sao Thiên Cơ' })).toBe(false);
  });

  it('refuses another author', () => {
    expect(isDraftFile({ ...VALID, writtenBy: 'someone' })).toBe(false);
  });
});
