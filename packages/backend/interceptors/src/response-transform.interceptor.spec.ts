import { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

function contextOfType(type: 'http' | 'graphql'): ExecutionContext {
  return {
    getType: () => type,
    switchToHttp: () => ({
      getResponse: () => (type === 'http' ? { statusCode: 200 } : undefined),
      getRequest: () => (type === 'http' ? { query: {} } : undefined),
    }),
  } as unknown as ExecutionContext;
}

function handlerReturning(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('ResponseTransformInterceptor', () => {
  const interceptor = new ResponseTransformInterceptor();

  it('wraps an HTTP result in the standard envelope', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(contextOfType('http'), handlerReturning({ id: 'user-1' })),
    );

    expect(result).toEqual({ statusCode: 200, success: true, data: { id: 'user-1' } });
  });

  it('leaves a GraphQL result untouched, since GraphQL brings its own envelope', async () => {
    const payload = { users: [], total: 0 };

    const result = await firstValueFrom(
      interceptor.intercept(contextOfType('graphql'), handlerReturning(payload)),
    );

    expect(result).toBe(payload);
  });
});
