import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GraphQLError, type GraphQLFormattedError } from 'graphql';
import { formatGraphqlError } from './format-graphql-error';

function thrownFromResolver(cause: Error): GraphQLError {
  return new GraphQLError(cause.message, { originalError: cause });
}

function rejectedByValidation(message: string): GraphQLError {
  const original = new GraphQLError(message);
  return new GraphQLError(message, { originalError: original });
}

function formattedOf(error: GraphQLError): GraphQLFormattedError {
  return {
    message: error.message,
    path: ['users'],
    extensions: { code: 'INTERNAL_SERVER_ERROR', stacktrace: ['Error: ...', '  at resolver'] },
  };
}

describe('formatGraphqlError', () => {
  it('keeps the message and status of an exception the app raised on purpose', () => {
    const error = thrownFromResolver(new ForbiddenException('This account cannot sign in'));

    const result = formatGraphqlError(formattedOf(error), error);

    expect(result.message).toBe('This account cannot sign in');
    expect(result.extensions?.['code']).toBe(403);
  });

  it('keeps validation detail, which the client needs to fix its request', () => {
    const error = thrownFromResolver(
      new BadRequestException({ limit: 'limit must not exceed 100' }),
    );

    const result = formatGraphqlError(formattedOf(error), error);

    expect(result.extensions?.['code']).toBe(400);
    expect(JSON.stringify(result)).toContain('limit must not exceed 100');
  });

  it('replaces anything else with a generic message, so internals never reach the client', () => {
    const leaky = new Error('duplicate key value violates unique constraint "users_email_key"');
    const error = thrownFromResolver(leaky);

    const result = formatGraphqlError(formattedOf(error), error);

    expect(result.message).toBe('Internal server error');
    expect(JSON.stringify(result)).not.toContain('users_email_key');
  });

  it('keeps a validation error, which describes the query rather than the server', () => {
    const rejected = rejectedByValidation('A query may request at most 5 top-level fields.');

    const result = formatGraphqlError(
      { message: rejected.message, extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } },
      rejected,
    );

    expect(result.message).toBe('A query may request at most 5 top-level fields.');
    expect(result.extensions?.['code']).toBe('GRAPHQL_VALIDATION_FAILED');
  });

  it('strips the stack trace from a validation error too, not just from thrown ones', () => {
    const rejected = rejectedByValidation('A query may not nest deeper than 8 levels.');

    const result = formatGraphqlError(
      {
        message: rejected.message,
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED', stacktrace: ['at validate'] },
      },
      rejected,
    );

    expect(result.extensions?.['stacktrace']).toBeUndefined();
  });

  it('never passes the stack trace through', () => {
    const error = thrownFromResolver(new ForbiddenException('Nope'));

    const result = formatGraphqlError(formattedOf(error), error);

    expect(result.extensions?.['stacktrace']).toBeUndefined();
  });

  it('keeps the path so the client knows which field failed', () => {
    const error = thrownFromResolver(new ForbiddenException('Nope'));

    const result = formatGraphqlError(formattedOf(error), error);

    expect(result.path).toEqual(['users']);
  });
});
