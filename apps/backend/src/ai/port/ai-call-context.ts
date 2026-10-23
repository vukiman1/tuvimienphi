import { AsyncLocalStorage } from 'node:async_hooks';

export interface AiCallContext {
  readonly userId?: string | null;
  readonly label?: string | null;
}

const storage = new AsyncLocalStorage<AiCallContext>();

export function runWithAiCallContext<T>(
  context: AiCallContext,
  work: () => Promise<T>,
): Promise<T> {
  return storage.run(context, work);
}

export function currentAiCallContext(): AiCallContext {
  return storage.getStore() ?? {};
}
