import { CHINH_TINH_NAMES } from '@org/shared-tu-vi';
import { findNames } from './find-names';

describe('findNames', () => {
  it('matches star names case-sensitively', () => {
    const clause = 'lá số tử vi có sao Tử Vi';

    const hits = findNames(clause, CHINH_TINH_NAMES);

    expect(hits).toEqual([{ name: 'Tử Vi', index: clause.indexOf('Tử Vi') }]);
  });

  it('prefers the longer name at the same place', () => {
    const clause = 'Hóa Lộc gặp Lộc Tồn';

    const hits = findNames(clause, ['Hóa Lộc', 'Lộc Tồn']);

    expect(hits).toEqual([
      { name: 'Hóa Lộc', index: 0 },
      { name: 'Lộc Tồn', index: clause.indexOf('Lộc Tồn') },
    ]);
  });
});
