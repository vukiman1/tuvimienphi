import axios, { type AxiosResponse } from 'axios';

const UNAUTHORIZED = 401;
const SOME_USER_ID = '2f4c1a52-6a59-4d7e-9a0e-0d3c5b8f7a11';

function graphql(query: string): Promise<AxiosResponse> {
  return axios.post('/api/admin/graphql', { query }, { validateStatus: () => true });
}

describe('Users console API, without a console session', () => {
  it('refuses to change a role', async () => {
    const res = await graphql(
      `mutation { setUserRole(userId: "${SOME_USER_ID}", role: ADMIN) { id role } }`,
    );

    expect(res.data.data).toBeNull();
    expect(res.data.errors[0].extensions.code).toBe(UNAUTHORIZED);
  });
});
