import type { TypedDocumentString } from '@/gql/graphql';
import { apiClient } from './http-request';

const GRAPHQL_PATH = '/admin/graphql';
const EMPTY_RESPONSE = 'Máy chủ trả về một phản hồi GraphQL rỗng.';

interface GraphqlFailure {
  message: string;
}

interface GraphqlBody<TResult> {
  data?: TResult;
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

export async function graphqlRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  const body = await apiClient.post<unknown, GraphqlBody<TResult>>(GRAPHQL_PATH, {
    query: document.toString(),
    variables,
  });

  if (body.errors?.length) {
    throw new GraphqlError(body.errors);
  }
  if (!body.data) {
    throw new GraphqlError([{ message: EMPTY_RESPONSE }]);
  }
  return body.data;
}
