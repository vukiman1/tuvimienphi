import type { TypedDocumentString } from '@/gql/graphql';
import { apiClient } from './http-request';

const GRAPHQL_PATH = '/admin/graphql';
const REFRESH_PATH = '/admin/auth/refresh-token';
const EMPTY_RESPONSE = 'Máy chủ trả về một phản hồi GraphQL rỗng.';
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;
const UNEXPLAINED_BAD_REQUEST = 'Bad Request Exception';

interface GraphqlFailure {
  message: string;
  extensions?: {
    code?: number | string;
    detail?: unknown;
  };
}

interface GraphqlBody<TResult> {
  data?: TResult | null;
  errors?: GraphqlFailure[];
}

export class GraphqlError extends Error {
  readonly failures: GraphqlFailure[];

  constructor(failures: GraphqlFailure[]) {
    super(failures[0]?.message ?? EMPTY_RESPONSE);
    this.name = 'GraphqlError';
    this.failures = failures;
  }
}

let sessionRefresh: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  sessionRefresh ??= apiClient
    .post(REFRESH_PATH)
    .then(
      () => true,
      () => false,
    )
    .finally(() => {
      sessionRefresh = null;
    });
  return sessionRefresh;
}

function send<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
): Promise<GraphqlBody<TResult>> {
  return apiClient.post<unknown, GraphqlBody<TResult>>(GRAPHQL_PATH, {
    query: document.toString(),
    variables,
  });
}

function hasCode(failures: readonly GraphqlFailure[] | undefined, code: number): boolean {
  return failures?.some((failure) => failure.extensions?.code === code) ?? false;
}

export async function graphqlRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  let body = await send(document, variables);
  if (hasCode(body.errors, UNAUTHORIZED) && (await refreshSession())) {
    body = await send(document, variables);
  }

  if (body.errors?.length) {
    throw new GraphqlError(body.errors);
  }
  if (!body.data) {
    throw new GraphqlError([{ message: EMPTY_RESPONSE }]);
  }
  return body.data;
}

export function isSessionExpired(caught: unknown): boolean {
  return caught instanceof GraphqlError && hasCode(caught.failures, UNAUTHORIZED);
}

export function isForbidden(caught: unknown): boolean {
  return caught instanceof GraphqlError && hasCode(caught.failures, FORBIDDEN);
}

export function rejectionReason(caught: unknown): string | null {
  if (!(caught instanceof GraphqlError)) {
    return null;
  }
  const rejected = caught.failures.find((failure) => failure.extensions?.code === BAD_REQUEST);
  if (!rejected) {
    return null;
  }
  if (rejected.message !== UNEXPLAINED_BAD_REQUEST) {
    return rejected.message;
  }

  const detail = rejected.extensions?.detail;
  const reasons =
    typeof detail === 'object' && detail !== null
      ? Object.values(detail).filter((value): value is string => typeof value === 'string')
      : [];
  return reasons.length > 0 ? reasons.join(' · ') : null;
}
