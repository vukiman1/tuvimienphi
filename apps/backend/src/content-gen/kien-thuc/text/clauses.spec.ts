import { splitClauses } from './clauses';

describe('splitClauses', () => {
  it('splits sentences and semicolons but not commas', () => {
    expect(splitClauses('Thiên Cơ miếu ở Thìn, Tuất; hãm ở Dần. Hết.')).toEqual([
      'Thiên Cơ miếu ở Thìn, Tuất',
      'hãm ở Dần.',
      'Hết.',
    ]);
  });
});
