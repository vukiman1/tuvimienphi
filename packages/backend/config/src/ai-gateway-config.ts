import { z } from 'zod';

export interface AiGatewayConfig {
  readonly baseUrl: string;
  readonly token: string;
}

const HTTPS_PROTOCOL = /^https$/;
const NOT_SET = '';

export const AI_GATEWAY_HALF_SET_MESSAGE =
  'Set both AI_GATEWAY_BASE_URL and AI_GATEWAY_TOKEN to route Gemini through Cloudflare AI Gateway, or neither to call Google directly';

export const aiGatewaySchema = z
  .object({
    baseUrl: z.union([z.literal(NOT_SET), z.url({ protocol: HTTPS_PROTOCOL })]).default(NOT_SET),
    token: z.string().default(NOT_SET),
  })
  .refine(({ baseUrl, token }) => (baseUrl === NOT_SET) === (token === NOT_SET), {
    message: AI_GATEWAY_HALF_SET_MESSAGE,
  })
  .transform(({ baseUrl, token }): AiGatewayConfig | undefined =>
    baseUrl === NOT_SET ? undefined : { baseUrl, token },
  );
