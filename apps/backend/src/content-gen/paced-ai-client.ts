import { setTimeout as sleepMs } from 'node:timers/promises';
import type { AiClient } from '../ai/port/ai.client';
import type { AiRequest, AiResult } from '../ai/port/ai.types';

export type Sleep = (ms: number) => Promise<unknown>;

export class PacedAiClient implements AiClient {
  private hasCalled = false;

  constructor(
    private readonly inner: AiClient,
    private readonly delayMs: number,
    private readonly sleep: Sleep = sleepMs,
  ) {}

  async generate(request: AiRequest): Promise<AiResult> {
    if (this.hasCalled) await this.sleep(this.delayMs);
    this.hasCalled = true;
    return this.inner.generate(request);
  }
}
