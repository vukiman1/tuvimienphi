import { HttpException } from '@nestjs/common';
import type { GraphQLFormattedError } from 'graphql';

const INTERNAL_MESSAGE = 'Internal server error';
const INTERNAL_CODE = 500;

interface MaybeWrapped {
  originalError?: unknown;
}

function raisedException(error: unknown): HttpException | null {
  if (error instanceof HttpException) {
    return error;
  }
  const wrapped = (error as MaybeWrapped)?.originalError;
  return wrapped instanceof HttpException ? wrapped : null;
}

const CLIENT_FAULT_CODES = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_USER_INPUT',
  'BAD_REQUEST',
  'OPERATION_RESOLUTION_FAILURE',
  'PERSISTED_QUERY_NOT_FOUND',
]);

function describesTheQuery(formatted: GraphQLFormattedError): boolean {
  const code = formatted.extensions?.['code'];
  return typeof code === 'string' && CLIENT_FAULT_CODES.has(code);
}

function detailOf(exception: HttpException): string | Record<string, unknown> {
  const payload = exception.getResponse();
  return typeof payload === 'string' ? payload : (payload as Record<string, unknown>);
}

export function formatGraphqlError(
  formatted: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const exception = raisedException(error);
  if (!exception) {
    return describesTheQuery(formatted)
      ? {
          message: formatted.message,
          path: formatted.path,
          extensions: { code: formatted.extensions?.['code'] ?? INTERNAL_CODE },
        }
      : { message: INTERNAL_MESSAGE, path: formatted.path, extensions: { code: INTERNAL_CODE } };
  }

  return {
    message: exception.message,
    path: formatted.path,
    extensions: { code: exception.getStatus(), detail: detailOf(exception) },
  };
}
