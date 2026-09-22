import { isHttpContext, type TransportContext } from './isHttpContext';

function contextOfType(type: string): TransportContext {
  return { getType: () => type };
}

describe('isHttpContext', () => {
  it('coi mọi transport không phải HTTP là không phải HTTP, kể cả ws và rpc', () => {
    expect(isHttpContext(contextOfType('http'))).toBe(true);
    expect(isHttpContext(contextOfType('graphql'))).toBe(false);
    expect(isHttpContext(contextOfType('ws'))).toBe(false);
    expect(isHttpContext(contextOfType('rpc'))).toBe(false);
  });
});
