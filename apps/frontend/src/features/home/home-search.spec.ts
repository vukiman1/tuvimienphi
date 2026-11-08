import { Gender } from '@/features/la-so/birth-input';
import { validateHomeSearch } from './home-search';

describe('validateHomeSearch', () => {
  it('keeps a known gender and an in-range view year', () => {
    expect(validateHomeSearch({ gender: 'nu', viewYear: 2027 })).toEqual({
      gender: Gender.Female,
      viewYear: 2027,
    });
  });

  it('returns nothing when there are no search params', () => {
    expect(validateHomeSearch({})).toEqual({});
  });

  it('drops an unknown gender and keeps the valid view year', () => {
    expect(validateHomeSearch({ gender: 'khac', viewYear: 2027 })).toEqual({ viewYear: 2027 });
  });

  it.each([1899, 2101, 2027.5, '2027', null])('drops the view year %p', (viewYear) => {
    expect(validateHomeSearch({ gender: 'nam', viewYear })).toEqual({ gender: Gender.Male });
  });

  it('drops a view year at either bound of the range only when it falls outside', () => {
    expect(validateHomeSearch({ viewYear: 1900 })).toEqual({ viewYear: 1900 });
    expect(validateHomeSearch({ viewYear: 2100 })).toEqual({ viewYear: 2100 });
  });
});
