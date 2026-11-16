import type { AiGatewayConfig } from '@org/backend-config';
import { AiProvider } from '../port/ai-provider.enum';
import { aiGatewayRoute } from './ai-gateway-route';

const GATEWAY: AiGatewayConfig = {
  baseUrl: 'https://gateway.ai.cloudflare.com/v1/account/tuvimienphi',
  token: 'gateway-token',
};

describe('aiGatewayRoute', () => {
  it('sends calls straight to the provider when no gateway is configured', () => {
    expect(aiGatewayRoute(undefined, AiProvider.OPENAI)).toBeUndefined();
  });

  it.each([
    [AiProvider.GEMINI, `${GATEWAY.baseUrl}/google-ai-studio`],
    [AiProvider.OPENAI, `${GATEWAY.baseUrl}/openai`],
    [AiProvider.ANTHROPIC, `${GATEWAY.baseUrl}/anthropic`],
  ])('routes %s to its own Cloudflare endpoint', (provider, baseUrl) => {
    expect(aiGatewayRoute(GATEWAY, provider)?.baseUrl).toBe(baseUrl);
  });

  it('authenticates to the gateway with the gateway token', () => {
    expect(aiGatewayRoute(GATEWAY, AiProvider.ANTHROPIC)?.headers).toEqual({
      'cf-aig-authorization': 'Bearer gateway-token',
    });
  });
});
