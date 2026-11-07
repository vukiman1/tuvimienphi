import { AiClient } from '../../../ai/port/ai.client';
import type { AiRequest, AiResult } from '../../../ai/port/ai.types';
import { type CachSinh, sinhVoiKiem } from './sinh-voi-kiem';

const BUDGET_MS = 60_000;
const MODEL = 'fake-model';

class ScriptedAiClient extends AiClient {
  readonly requests: AiRequest[] = [];

  constructor(private readonly replies: readonly string[]) {
    super();
  }

  async generate(request: AiRequest): Promise<AiResult> {
    this.requests.push(request);
    return {
      text: this.replies[this.requests.length - 1],
      model: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      failedAttempts: [],
      latencyMs: 0,
    };
  }
}

describe('sinhVoiKiem', () => {
  it('retries with the violations the check reports, then returns the first clean value', async () => {
    const ai = new ScriptedAiClient(['bad', 'good']);
    const cach: CachSinh<string> = {
      system: 'system',
      schema: { type: 'string' },
      messages: (daThu) => [
        { role: 'user', text: 'brief' },
        ...daThu.map((lanThu) => ({ role: 'model' as const, text: lanThu.loi.join('; ') })),
      ],
      parse: (text) => text,
      check: (value) => (value === 'bad' ? ['xấu'] : []),
    };

    const ket = await sinhVoiKiem(ai, cach, BUDGET_MS);

    expect(ket).toEqual({ value: 'good', model: MODEL, attempts: 2 });
    const secondRequest = ai.requests[1];
    expect(secondRequest.messages[secondRequest.messages.length - 1].text).toContain('xấu');
  });
});
