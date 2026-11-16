import { AI_GATEWAY_HALF_SET_MESSAGE, aiGatewaySchema } from './ai-gateway-config';

const BASE_URL = 'https://gateway.ai.cloudflare.com/v1/account/tuvimienphi/google-ai-studio';

describe('aiGatewaySchema', () => {
  it('turns the gateway off when neither variable is set', () => {
    expect(aiGatewaySchema.parse({ baseUrl: '', token: '' })).toBeUndefined();
    expect(aiGatewaySchema.parse({})).toBeUndefined();
  });

  it('turns the gateway on when both variables are set', () => {
    expect(aiGatewaySchema.parse({ baseUrl: BASE_URL, token: 'gateway-token' })).toEqual({
      baseUrl: BASE_URL,
      token: 'gateway-token',
    });
  });

  it('refuses to boot with only the base URL', () => {
    expect(() => aiGatewaySchema.parse({ baseUrl: BASE_URL, token: '' })).toThrow(
      AI_GATEWAY_HALF_SET_MESSAGE,
    );
  });

  it('refuses to boot with only the token', () => {
    expect(() => aiGatewaySchema.parse({ baseUrl: '', token: 'gateway-token' })).toThrow(
      AI_GATEWAY_HALF_SET_MESSAGE,
    );
  });

  it('refuses a base URL that is not https', () => {
    expect(() =>
      aiGatewaySchema.parse({ baseUrl: BASE_URL.replace('https', 'http'), token: 'gateway-token' }),
    ).toThrow();
  });
});
