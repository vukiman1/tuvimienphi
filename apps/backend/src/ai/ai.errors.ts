export interface ModelAttempt {
  readonly model: string;
  readonly reason: string;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super('GEMINI_API_KEY is empty, so no chapter can be generated');
    this.name = 'AiNotConfiguredError';
  }
}

export class AiUnavailableError extends Error {
  constructor(readonly attempts: readonly ModelAttempt[]) {
    super(
      `no model accepted the request — ${attempts
        .map((attempt) => `${attempt.model}: ${attempt.reason}`)
        .join('; ')}`,
    );
    this.name = 'AiUnavailableError';
  }
}
