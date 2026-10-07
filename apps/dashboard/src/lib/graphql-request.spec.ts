import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TypedDocumentString } from '../gql/graphql';
import { GraphqlError, graphqlRequest, isSessionExpired, rejectionReason } from './graphql-request';

const post = vi.hoisted(() => vi.fn());

vi.mock('./http-request', () => ({ apiClient: { post } }));

interface Probe {
  probe: string;
}

const GRAPHQL_PATH = '/admin/graphql';
const REFRESH_PATH = '/admin/auth/refresh-token';
const DOCUMENT = {
  toString: () => 'query Probe { probe }',
} as unknown as TypedDocumentString<Probe, { id: number }>;

const ANSWER = { data: { probe: 'ok' } };
const UNAUTHORIZED = {
  data: null,
  errors: [{ message: 'Unauthorized', extensions: { code: 401 } }],
};

function answering(byPath: Record<string, () => Promise<unknown>>) {
  post.mockImplementation((path: string) => byPath[path]());
}

function callsTo(path: string): number {
  return post.mock.calls.filter(([called]) => called === path).length;
}

beforeEach(() => {
  post.mockReset();
});

describe('graphqlRequest', () => {
  it('sends the document and its variables, and hands back the data', async () => {
    post.mockResolvedValue(ANSWER);

    await expect(graphqlRequest(DOCUMENT, { id: 7 })).resolves.toEqual({ probe: 'ok' });
    expect(post).toHaveBeenCalledWith(GRAPHQL_PATH, {
      query: 'query Probe { probe }',
      variables: { id: 7 },
    });
  });

  it('renews an expired session and repeats the request, so the caller never notices', async () => {
    const graphql = vi.fn().mockResolvedValueOnce(UNAUTHORIZED).mockResolvedValueOnce(ANSWER);
    answering({ [GRAPHQL_PATH]: graphql, [REFRESH_PATH]: () => Promise.resolve({}) });

    await expect(graphqlRequest(DOCUMENT, { id: 7 })).resolves.toEqual({ probe: 'ok' });
    expect(callsTo(REFRESH_PATH)).toBe(1);
    expect(callsTo(GRAPHQL_PATH)).toBe(2);
  });

  it('reports the session as expired when it cannot be renewed', async () => {
    answering({
      [GRAPHQL_PATH]: () => Promise.resolve(UNAUTHORIZED),
      [REFRESH_PATH]: () => Promise.reject(new Error('refresh refused')),
    });

    const failure = await graphqlRequest(DOCUMENT, { id: 7 }).catch((caught: unknown) => caught);

    expect(isSessionExpired(failure)).toBe(true);
    expect(callsTo(GRAPHQL_PATH)).toBe(1);
  });

  it('gives up after one renewal instead of looping on a session that stays rejected', async () => {
    answering({
      [GRAPHQL_PATH]: () => Promise.resolve(UNAUTHORIZED),
      [REFRESH_PATH]: () => Promise.resolve({}),
    });

    const failure = await graphqlRequest(DOCUMENT, { id: 7 }).catch((caught: unknown) => caught);

    expect(isSessionExpired(failure)).toBe(true);
    expect(callsTo(REFRESH_PATH)).toBe(1);
    expect(callsTo(GRAPHQL_PATH)).toBe(2);
  });

  it('renews once for requests that expire together', async () => {
    const graphql = vi
      .fn()
      .mockResolvedValueOnce(UNAUTHORIZED)
      .mockResolvedValueOnce(UNAUTHORIZED)
      .mockResolvedValue(ANSWER);
    answering({ [GRAPHQL_PATH]: graphql, [REFRESH_PATH]: () => Promise.resolve({}) });

    await Promise.all([graphqlRequest(DOCUMENT, { id: 1 }), graphqlRequest(DOCUMENT, { id: 2 })]);

    expect(callsTo(REFRESH_PATH)).toBe(1);
  });

  it('raises what the server refused', async () => {
    post.mockResolvedValue({
      data: null,
      errors: [{ message: 'Forbidden', extensions: { code: 403 } }],
    });

    const failure = await graphqlRequest(DOCUMENT, { id: 7 }).catch((caught: unknown) => caught);

    expect(failure).toBeInstanceOf(GraphqlError);
    expect(isSessionExpired(failure)).toBe(false);
    expect(callsTo(REFRESH_PATH)).toBe(0);
  });
});

describe('rejectionReason', () => {
  it('passes on the sentence the server wrote', () => {
    const failure = new GraphqlError([
      {
        message: 'year 2027 cannot be published: 3 of 12 zodiac entries are incomplete',
        extensions: { code: 400, detail: { statusCode: 400 } },
      },
    ]);

    expect(rejectionReason(failure)).toBe(
      'year 2027 cannot be published: 3 of 12 zodiac entries are incomplete',
    );
  });

  it('digs the field messages out when the headline says nothing', () => {
    const failure = new GraphqlError([
      {
        message: 'Bad Request Exception',
        extensions: { code: 400, detail: { rating: 'rating must not be greater than 5' } },
      },
    ]);

    expect(rejectionReason(failure)).toBe('rating must not be greater than 5');
  });

  it('has nothing to add for a failure that is not about the request', () => {
    const crashed = new GraphqlError([
      { message: 'Internal server error', extensions: { code: 500 } },
    ]);

    expect(rejectionReason(crashed)).toBeNull();
    expect(rejectionReason(new Error('network down'))).toBeNull();
  });
});
