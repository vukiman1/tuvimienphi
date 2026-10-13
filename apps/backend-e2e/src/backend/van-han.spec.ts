import axios from 'axios';

const UNAUTHORIZED = 401;
const SEEDED_YEAR = 2026;
const ZODIAC_COUNT = 12;
const ASPECT_COUNT = 4;

function graphql(query: string) {
  return axios.post('/api/admin/graphql', { query }, { validateStatus: () => true });
}

describe('Vận hạn, as a visitor', () => {
  it('shows the seeded year, with a complete reading for each of the twelve zodiacs', async () => {
    const res = await axios.get('/api/van-han/current');

    expect(res.status).toBe(200);
    expect(res.data.data.year).toBe(SEEDED_YEAR);
    expect(
      res.data.data.entries.map((entry: { zodiacOrder: number }) => entry.zodiacOrder),
    ).toEqual(Array.from({ length: ZODIAC_COUNT }, (_, index) => index + 1));
    for (const entry of res.data.data.entries) {
      expect(entry.luuNien).not.toBe('');
      expect(entry.luanGiai).toHaveLength(ASPECT_COUNT);
      expect(entry.tungTuoi.length).toBeGreaterThan(0);
    }
  });

  it('answers a year nobody published with an empty list', async () => {
    const res = await axios.get('/api/van-han', { params: { year: SEEDED_YEAR - 1 } });

    expect(res.status).toBe(200);
    expect(res.data.data).toEqual([]);
  });

  it('no longer routes the REST write that any signed-in user could call', async () => {
    const res = await axios.post('/api/van-han', {}, { validateStatus: () => true });

    expect(res.status).toBe(404);
  });
});

describe('Vận hạn console API, without a console session', () => {
  it.each([
    [
      'saving an entry',
      'mutation { saveVanHanEntry(input: { year: 2026, zodiacOrder: 7, luuNien: "", luanGiai: [], tungTuoi: [] }) { year } }',
    ],
    ['publishing a year', 'mutation { publishVanHanYear(year: 2026) { year } }'],
    ['unpublishing a year', 'mutation { unpublishVanHanYear(year: 2026) { year } }'],
    ['reading a draft year', '{ vanHanYear(year: 2026) { year } }'],
  ])('refuses %s', async (_action, query) => {
    const res = await graphql(query);

    expect(res.data.data).toBeNull();
    expect(res.data.errors[0].extensions.code).toBe(UNAUTHORIZED);
  });

  it('blocks a mutation sent the way a cross-site form could send it', async () => {
    const res = await axios.post(
      '/api/admin/graphql',
      JSON.stringify({ query: 'mutation { publishVanHanYear(year: 2026) { year } }' }),
      { headers: { 'Content-Type': 'text/plain' }, validateStatus: () => true },
    );

    expect(res.status).toBe(400);
    expect(res.data.errors[0].message).toMatch(/Cross-Site Request Forgery/);
  });
});
