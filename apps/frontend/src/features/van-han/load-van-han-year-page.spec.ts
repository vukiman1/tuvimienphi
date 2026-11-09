import { QueryClient } from '@tanstack/react-query';
import { isNotFound } from '@tanstack/react-router';
import { vanHanService } from '@/services/van-han-service';
import { TY_ENTRY } from './__fixtures__/van-han-current';
import { publishedYearOf } from './van-han-view';
import { loadVanHanYearPage } from './load-van-han-year-page';

const PUBLISHED_YEARS = [2027, 2026];

async function loadingFails(params: { year: string; slug: string }): Promise<unknown> {
  try {
    await loadVanHanYearPage(new QueryClient(), params);
  } catch (error) {
    return error;
  }
  return undefined;
}

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(vanHanService, 'publishedYears').mockResolvedValue(PUBLISHED_YEARS);
  jest
    .spyOn(vanHanService, 'publishedYear')
    .mockImplementation(async (year) =>
      publishedYearOf(year, year === TY_ENTRY.year ? [TY_ENTRY] : []),
    );
});

describe('loadVanHanYearPage', () => {
  it('loads the reading of the year in the address and every published year', async () => {
    const page = await loadVanHanYearPage(new QueryClient(), { year: '2026', slug: 'tuoi-ty' });

    expect(page).toEqual({
      chi: 'Tý',
      year: 2026,
      published: { year: 2026, entries: [TY_ENTRY] },
      publishedYears: PUBLISHED_YEARS,
    });
  });

  it('is not found for a year nobody published', async () => {
    expect(isNotFound(await loadingFails({ year: '2031', slug: 'tuoi-ty' }))).toBe(true);
  });

  it.each([
    { year: 'abc', slug: 'tuoi-ty' },
    { year: '2026', slug: 'tuoi-meo' },
  ])('is not found for an address that names no year and con giáp: %j', async (params) => {
    expect(isNotFound(await loadingFails(params))).toBe(true);
    expect(vanHanService.publishedYear).not.toHaveBeenCalled();
    expect(vanHanService.publishedYears).not.toHaveBeenCalled();
  });
});
