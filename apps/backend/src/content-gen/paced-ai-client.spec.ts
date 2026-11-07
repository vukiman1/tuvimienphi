import type { AiClient } from '../ai/port/ai.client';
import type { AiRequest, AiResult } from '../ai/port/ai.types';
import { PacedAiClient } from './paced-ai-client';

const DELAY_MS = 30_000;
const REQUEST: AiRequest = { system: 's', messages: [], schema: { type: 'object' } };

describe('PacedAiClient', () => {
  function setup(): { client: PacedAiClient; events: string[] } {
    const events: string[] = [];
    const inner: AiClient = {
      generate: async (): Promise<AiResult> => {
        events.push('generate');
        return {
          text: '{}',
          model: 'test-model',
          inputTokens: 0,
          outputTokens: 0,
          failedAttempts: [],
          latencyMs: 0,
        };
      },
    };
    const sleep = async (ms: number): Promise<void> => {
      events.push(`sleep ${ms}`);
    };
    return { client: new PacedAiClient(inner, DELAY_MS, sleep), events };
  }

  it('calls straight away the first time', async () => {
    const { client, events } = setup();

    await client.generate(REQUEST);

    expect(events).toEqual(['generate']);
  });

  it('pauses before every later call, retries included', async () => {
    const { client, events } = setup();

    await client.generate(REQUEST);
    await client.generate(REQUEST);
    await client.generate(REQUEST);

    expect(events).toEqual([
      'generate',
      `sleep ${DELAY_MS}`,
      'generate',
      `sleep ${DELAY_MS}`,
      'generate',
    ]);
  });
});
