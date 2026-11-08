import { Logger } from '@nestjs/common';
import { AiClient } from '../ai/port/ai.client';
import type { AiRequest, AiResult } from '../ai/port/ai.types';
import { generateHubIntro } from './hub-intro';

const MODEL = 'test-model';
const SHORT_INTRO = { intro: ['Chỉ một đoạn.'] };
const VALID_INTRO = { intro: ['Đoạn một.', 'Đoạn hai.'] };

class ScriptedAiClient extends AiClient {
  readonly requests: AiRequest[] = [];

  constructor(private readonly replies: readonly unknown[]) {
    super();
  }

  async generate(request: AiRequest): Promise<AiResult> {
    const reply = this.replies[this.requests.length];
    this.requests.push(request);
    return {
      text: JSON.stringify(reply),
      model: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    };
  }
}

async function noPause(): Promise<void> {
  return undefined;
}

describe('generateHubIntro', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('sends a rejected intro back with its violations on the next attempt', async () => {
    const ai = new ScriptedAiClient([SHORT_INTRO, VALID_INTRO]);

    const intro = await generateHubIntro(ai, noPause);

    expect(intro).toEqual(VALID_INTRO);
    const retry = ai.requests[1].messages;
    expect(retry).toHaveLength(3);
    expect(retry[1]).toEqual({ role: 'model', text: JSON.stringify(SHORT_INTRO) });
    expect(retry[2].role).toBe('user');
    expect(retry[2].text).toContain('intro');
    expect(retry[2].text).toContain('có 1 đoạn');
  });

  it('logs each rejected intro attempt with its violations', async () => {
    const ai = new ScriptedAiClient([SHORT_INTRO, VALID_INTRO]);

    await generateHubIntro(ai, noPause);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /^hub-intro attempt 1 \(test-model\) rejected: .*có 1 đoạn/,
    );
  });
});
