import type { AiGatewayConfig, AiGatewayProviderSegment } from '@org/backend-config';
import { AiProvider } from '../port/ai-provider.enum';

export interface AiGatewayRoute {
  readonly baseUrl: string;
  readonly headers: Readonly<Record<string, string>>;
}

const GATEWAY_AUTHORIZATION_HEADER = 'cf-aig-authorization';

const GATEWAY_SEGMENT_BY_PROVIDER = {
  [AiProvider.GEMINI]: 'google-ai-studio',
  [AiProvider.OPENAI]: 'openai',
  [AiProvider.ANTHROPIC]: 'anthropic',
} as const satisfies Readonly<Record<AiProvider, AiGatewayProviderSegment>>;

export function aiGatewayRoute(
  gateway: AiGatewayConfig | undefined,
  provider: AiProvider,
): AiGatewayRoute | undefined {
  if (!gateway) {
    return undefined;
  }
  return {
    baseUrl: `${gateway.baseUrl}/${GATEWAY_SEGMENT_BY_PROVIDER[provider]}`,
    headers: { [GATEWAY_AUTHORIZATION_HEADER]: `Bearer ${gateway.token}` },
  };
}
