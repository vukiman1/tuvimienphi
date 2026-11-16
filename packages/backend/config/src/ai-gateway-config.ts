import { z } from 'zod';

export interface AiGatewayConfig {
  readonly baseUrl: string;
  readonly token: string;
}

export const AI_GATEWAY_PROVIDER_SEGMENTS = ['google-ai-studio', 'openai', 'anthropic'] as const;

export type AiGatewayProviderSegment = (typeof AI_GATEWAY_PROVIDER_SEGMENTS)[number];

const HTTPS_PROTOCOL = /^https$/;
const NOT_SET = '';
const PATH_SEPARATOR = '/';
const GATEWAY_ROOT_EXAMPLE = 'https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_id>';

export const AI_GATEWAY_HALF_SET_MESSAGE =
  'Set both AI_GATEWAY_BASE_URL and AI_GATEWAY_TOKEN to route AI calls through Cloudflare AI Gateway, or neither to call the providers directly';

export const AI_GATEWAY_TRAILING_SLASH_MESSAGE = `AI_GATEWAY_BASE_URL must not end with a slash: set it to the gateway root, e.g. ${GATEWAY_ROOT_EXAMPLE}`;

export const AI_GATEWAY_PROVIDER_SUFFIX_MESSAGE = `AI_GATEWAY_BASE_URL must be the gateway root (${GATEWAY_ROOT_EXAMPLE}) without a provider segment (${AI_GATEWAY_PROVIDER_SEGMENTS.join(', ')}): each provider appends its own`;

function endsWithProviderSegment(baseUrl: string): boolean {
  return AI_GATEWAY_PROVIDER_SEGMENTS.some((segment) =>
    baseUrl.endsWith(`${PATH_SEPARATOR}${segment}`),
  );
}

export const aiGatewaySchema = z
  .object({
    baseUrl: z.union([z.literal(NOT_SET), z.url({ protocol: HTTPS_PROTOCOL })]).default(NOT_SET),
    token: z.string().default(NOT_SET),
  })
  .refine(({ baseUrl, token }) => (baseUrl === NOT_SET) === (token === NOT_SET), {
    message: AI_GATEWAY_HALF_SET_MESSAGE,
  })
  .refine(({ baseUrl }) => !baseUrl.endsWith(PATH_SEPARATOR), {
    message: AI_GATEWAY_TRAILING_SLASH_MESSAGE,
    path: ['baseUrl'],
  })
  .refine(({ baseUrl }) => !endsWithProviderSegment(baseUrl), {
    message: AI_GATEWAY_PROVIDER_SUFFIX_MESSAGE,
    path: ['baseUrl'],
  })
  .transform(({ baseUrl, token }): AiGatewayConfig | undefined =>
    baseUrl === NOT_SET ? undefined : { baseUrl, token },
  );
