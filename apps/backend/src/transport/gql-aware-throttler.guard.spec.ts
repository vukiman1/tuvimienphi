import { ExecutionContext } from '@nestjs/common';
import { GqlAwareThrottlerGuard } from './gql-aware-throttler.guard';

class ExposedGuard extends GqlAwareThrottlerGuard {
  requestResponse(context: ExecutionContext) {
    return this.getRequestResponse(context);
  }
}

function makeGuard(): ExposedGuard {
  return new ExposedGuard(
    { throttlers: [] } as never,
    { increment: jest.fn() } as never,
    { getAllAndOverride: jest.fn() } as never,
  );
}

describe('GqlAwareThrottlerGuard', () => {
  it('tracks an HTTP request the way the stock guard does', () => {
    const req = { ip: '10.0.0.1' };
    const res = {};
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as unknown as ExecutionContext;

    expect(makeGuard().requestResponse(context)).toEqual({ req, res });
  });

  it('finds the request of a resolver call, which switchToHttp cannot reach', () => {
    const req = { ip: '10.0.0.1' };
    const res = {};
    const args = [undefined, {}, { req, res }, {}];
    const context = {
      getType: () => 'graphql',
      getArgs: () => args,
      getArgByIndex: (index: number) => args[index],
      getClass: () => class Resolver {},
      getHandler: () => () => undefined,
      switchToHttp: () => ({ getRequest: () => undefined, getResponse: () => undefined }),
    } as unknown as ExecutionContext;

    expect(makeGuard().requestResponse(context)).toEqual({ req, res });
  });
});
