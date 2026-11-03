import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { httpRequest } from '@/lib/http-request';
import { luanGiaiQueries, requestChapter } from './luan-giai-queries';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(), post: jest.fn() },
}));

const BIRTH: BirthInput = {
  day: 26,
  month: 5,
  year: 1960,
  calendar: CalendarType.Solar,
  hour: 'Hợi',
  gender: Gender.Male,
};

const YEAR_DEPENDENT_ORDER = '06';
const YEARLESS_ORDER = '03';

describe('luanGiaiQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps one cached article for a yearless chapter whatever the view year', () => {
    expect(luanGiaiQueries.chapter(BIRTH, YEARLESS_ORDER, 2026).queryKey).toEqual(
      luanGiaiQueries.chapter(BIRTH, YEARLESS_ORDER, 2027).queryKey,
    );
  });

  it('caches the vận hạn chapter per view year', () => {
    expect(luanGiaiQueries.chapter(BIRTH, YEAR_DEPENDENT_ORDER, 2026).queryKey).not.toEqual(
      luanGiaiQueries.chapter(BIRTH, YEAR_DEPENDENT_ORDER, 2027).queryKey,
    );
  });

  it('asks for the status of the picked view year', async () => {
    const options = luanGiaiQueries.statusMap(BIRTH, 2027);
    await options.queryFn?.({} as never);

    expect(httpRequest.get).toHaveBeenCalledWith(
      '/luan-giai/1960-05-26-duong-h11-nam?viewYear=2027',
    );
  });

  it('reads the vận hạn chapter for the picked view year', async () => {
    await luanGiaiQueries.chapter(BIRTH, YEAR_DEPENDENT_ORDER, 2027).queryFn?.({} as never);

    expect(httpRequest.get).toHaveBeenCalledWith(
      '/luan-giai/1960-05-26-duong-h11-nam/06?viewYear=2027',
    );
  });

  it('reads a yearless chapter without a view year', async () => {
    await luanGiaiQueries.chapter(BIRTH, YEARLESS_ORDER, 2027).queryFn?.({} as never);

    expect(httpRequest.get).toHaveBeenCalledWith('/luan-giai/1960-05-26-duong-h11-nam/03');
  });
});

describe('requestChapter', () => {
  it('sends the view year with the vận hạn chapter', async () => {
    await requestChapter(BIRTH, YEAR_DEPENDENT_ORDER, 2027);

    expect(httpRequest.post).toHaveBeenCalledWith('/luan-giai/06', { ...BIRTH, viewYear: 2027 });
  });

  it('sends only the birth for a yearless chapter', async () => {
    await requestChapter(BIRTH, YEARLESS_ORDER, 2027);

    expect(httpRequest.post).toHaveBeenCalledWith('/luan-giai/03', BIRTH);
  });
});
