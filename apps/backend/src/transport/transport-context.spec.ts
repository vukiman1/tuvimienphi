import { ExecutionContext } from '@nestjs/common';
import { requestFromContext, responseFromContext } from './transport-context';

function httpContext(request: unknown, response: unknown): ExecutionContext {
  return {
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext;
}

function graphqlContext(request: unknown, response: unknown): ExecutionContext {
  const args = [undefined, {}, { req: request, res: response }, {}];
  return {
    getType: () => 'graphql',
    getArgs: () => args,
    getArgByIndex: (index: number) => args[index],
    getClass: () => class Resolver {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => undefined, getResponse: () => undefined }),
  } as unknown as ExecutionContext;
}

describe('transport context', () => {
  const request = { cookies: {} };
  const response = { statusCode: 200 };

  it('reads the request straight off an HTTP context', () => {
    expect(requestFromContext(httpContext(request, response))).toBe(request);
  });

  it('reads the request out of a GraphQL context, where switchToHttp finds nothing', () => {
    expect(requestFromContext(graphqlContext(request, response))).toBe(request);
  });

  it('reads the response straight off an HTTP context', () => {
    expect(responseFromContext(httpContext(request, response))).toBe(response);
  });

  it('reads the response out of a GraphQL context, where switchToHttp hands back the query args', () => {
    expect(responseFromContext(graphqlContext(request, response))).toBe(response);
  });
});
