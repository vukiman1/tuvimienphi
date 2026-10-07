import axios from 'axios';

const UNAUTHORIZED = 401;

function graphql(query: string) {
  return axios.post('/api/admin/graphql', { query }, { validateStatus: () => true });
}

describe('Vận hạn, as a visitor', () => {
  it('has no year to show until one is published', async () => {
    const res = await axios.get('/api/van-han/current');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ statusCode: 200, success: true, data: null });
  });

  it('answers a year nobody published with an empty list', async () => {
    const res = await axios.get('/api/van-han', { params: { year: 2026 } });

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
