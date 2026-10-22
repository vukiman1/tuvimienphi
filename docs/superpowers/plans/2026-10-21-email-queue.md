# Email Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send the four auth emails (welcome, email verification, password reset, 2FA recovery) through a BullMQ `email` queue run by the `worker` container instead of calling Resend inside the HTTP request.

**Architecture:** `EmailQueueService` (every role) adds an `EmailJob` to a dedicated `email` queue whose connection fails fast when Redis is down. `EmailProcessor` (consumer role only) switches on `job.data.kind`, calls the matching `EmailService` method with an idempotency key, and turns non-retryable Resend errors into `UnrecoverableError`. Auth services enqueue instead of sending.

**Tech Stack:** NestJS 11, `@nestjs/bullmq` 12, `bullmq` 6, `ioredis` 5, `resend` 6.26, Jest 30.

**Spec:** Design agreed in chat on 2026-10-21 (no separate spec file). Every decision from it is copied into Global Constraints below.

## Global Constraints

- No code comments anywhere (project `CLAUDE.md`).
- Work on a new branch `feat/email-queue` cut from `dev`. If you work in a worktree, prefix every nx command with `NX_WORKSPACE_ROOT_PATH=<worktree>`.
- Do not commit. Kim An commits through `/commit`. Each task ends with its tests green and its files left unstaged.
- Never kill dev servers (`pkill -f vite` and similar). Kim An keeps `pnpm dev` running.
- Queue name `email`. It is **not** registered with bull-board: do not call `queueBoardFeatureImports` for it.
- Producer connection: `enableOfflineQueue: false`. Worker connection: `maxRetriesPerRequest: null`, offline queue left at the default.
- Job options: `jobId: randomUUID()`, `attempts: 5`, `backoff: { type: 'exponential', delay: 5_000 }`, `removeOnComplete: true`, `removeOnFail: true`.
- Worker options: `concurrency: 2`, `limiter: { max: 2, duration: 1_000 }`.
- Idempotency key sent to Resend: `` `${job.data.kind}/${job.id}` ``.
- Retryable Resend failure: `statusCode` is `null`, `429`, or `>= 500`. Every other status throws `UnrecoverableError`.
- Logs from the email path contain only `kind`, `jobId`, attempt number and the Resend status/message. Never the code, never the recipient address. `EmailSendError` messages must not contain the recipient either.
- Welcome enqueue failure: log and swallow (the account is already verified). OTP enqueue failure (verification, password reset, 2FA recovery): let it propagate.
- Run tests with: `pnpm nx test @org/backend -- --testPathPatterns=<pattern>`.

### Deviation from the chat design

The chat agreed `removeOnFail` with a 15-minute age cap. BullMQ applies `{ age }` lazily, only when another job completes or fails on that queue, so a failed job could keep a live OTP in Redis well beyond 15 minutes on a quiet queue. The plan uses `removeOnFail: true`: the failed job is deleted immediately and the `onFailed` log (kind, jobId, status) is the record. Nothing is lost in practice because the queue is not on bull-board anyway.

## Review Focus

1. **Redis drops while the backend is running** → `queue.add()` rejects at once instead of hanging. The endpoint itself still waits ~10–40 s, because `emailCodeService.issue()` goes through `RedisModule`'s client (offline queue on, `maxRetriesPerRequest: 20`) before `enqueue`; making the whole endpoint fail fast needs a separate change to `RedisModule`. Pinned by the connection-builder test (Task 1); the manual check in Task 6 measures the real latency.
2. **The same user asks for two password resets a second apart** → two jobs with different `jobId`s, so Resend sees two different idempotency keys and sends both (no 409). Pinned in Task 3.
3. **Resend rate-limits the worker (429)** → the job is retried, not marked unrecoverable. Pinned in Task 4.
4. **`RESEND_API_KEY` is empty (local dev)** → the job completes with the existing "skipped" warning and is not retried. Pinned in Task 2.
5. **A job fails** → the `failed` log contains neither the code nor the email address. Pinned in Task 4.

Known and accepted, not tested: if Redis is already down when the process **starts**, the first `enqueue` can still wait for BullMQ's initial connection. A late retry can also deliver a code that `issue()` has since replaced; the retry window is about 75 seconds.

---

### Task 1: Separate producer and worker Redis connections

**Files:**

- Create: `apps/backend/src/app/redis-connection.ts`
- Create: `apps/backend/src/app/redis-connection.spec.ts`
- Modify: `apps/backend/src/app/bull-root.ts`

**Interfaces:**

- Produces:
  - `type RedisSettings = ReturnType<typeof configuration>['redis']` (import `configuration` default from `@org/backend-config`).
  - `producerConnection(redis: RedisSettings): ConnectionOptions`
  - `workerConnection(redis: RedisSettings): ConnectionOptions`
  - `ConnectionOptions` comes from `bullmq`.

- [ ] **Step 1: Write the failing tests** in `redis-connection.spec.ts`

```ts
const REDIS = {
  cluster: false,
  host: 'redis',
  port: '6379',
  db: '0',
  password: 'secret',
  tls: false,
};

describe('producerConnection', () => {
  it('fails fast instead of queueing commands while Redis is unreachable', () => {
    expect(producerConnection(REDIS)).toMatchObject({ enableOfflineQueue: false });
  });
});

describe('workerConnection', () => {
  it('lets blocking worker commands wait out a reconnect', () => {
    const connection = workerConnection(REDIS);
    expect(connection).toMatchObject({ maxRetriesPerRequest: null });
    expect(connection).not.toHaveProperty('enableOfflineQueue', false);
  });
});

describe('both connections', () => {
  it('point at the configured Redis with a numeric port and db', () => {
    expect(producerConnection(REDIS)).toMatchObject({
      host: 'redis',
      port: 6379,
      db: 0,
      password: 'secret',
    });
  });

  it('turn TLS on only when the config asks for it', () => {
    expect(workerConnection({ ...REDIS, tls: true })).toMatchObject({ tls: {} });
    expect(workerConnection(REDIS)).not.toHaveProperty('tls');
  });
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `pnpm nx test @org/backend -- --testPathPatterns=redis-connection`
Expected: FAIL, module `./redis-connection` not found.

- [ ] **Step 3: Implement both builders** in `redis-connection.ts`

Both builders share one private base builder: `host`, `Number(port)`, `Number(db)`, `password || undefined`, and `tls: {}` only when `redis.tls` is true (same shape as today's `bull-root.ts`). Each builder then adds its own single option.

- [ ] **Step 4: Point `bullRootImport` at `workerConnection`**

In `bull-root.ts`, replace the inline `connection` object with `workerConnection(config.get<RedisSettings>('redis'))`. The `jobs` queue and its `QueueProcessor` keep exactly today's behaviour.

- [ ] **Step 5: Run the tests and the existing queue specs**

Run: `pnpm nx test @org/backend -- --testPathPatterns="redis-connection|api/queue"`
Expected: PASS.

---

### Task 2: Idempotent Resend sends with a typed failure

**Files:**

- Modify: `apps/backend/src/email/email.errors.ts`
- Modify: `apps/backend/src/email/email.service.ts`
- Create: `apps/backend/src/email/email.service.spec.ts`

**Interfaces:**

- Produces:
  - `class EmailSendError extends Error { readonly statusCode: number | null }`, built with `new EmailSendError(statusCode: number | null, cause: string)`. Message: `` `Resend rejected the email (${statusCode ?? 'no status'}): ${cause}` ``. The `recipient` field is removed.
  - Each of `sendWelcomeEmail`, `sendVerificationCode`, `sendPasswordResetCode`, `sendTwoFactorRecoveryCode` gains a trailing `idempotencyKey: string` parameter, forwarded to `this.resend.emails.send(payload, { idempotencyKey })`.

- [ ] **Step 1: Write the failing tests** in `email.service.spec.ts`

Mock the `resend` module with `jest.mock('resend', …)` so `new Resend()` returns `{ emails: { send } }`. Build `EmailService` with a `ConfigService` stub returning an API key, `from`, and `app.url`.

```ts
it('forwards the idempotency key so a retried job cannot send twice', async () => {
  send.mockResolvedValue({ data: { id: 'e1' }, error: null });
  await service.sendPasswordResetCode('a@b.c', '123456', 15, 'password-reset/uuid-1');
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@b.c' }), {
    idempotencyKey: 'password-reset/uuid-1',
  });
});

it('surfaces the Resend status code without leaking the recipient', async () => {
  send.mockResolvedValue({
    data: null,
    error: { name: 'validation_error', message: 'Invalid `to` field', statusCode: 422 },
  });
  const failure = service.sendWelcomeEmail('a@b.c', 'welcome/uuid-1');
  await expect(failure).rejects.toMatchObject({ name: 'EmailSendError', statusCode: 422 });
  await expect(failure).rejects.not.toThrow(/a@b\.c/);
});

it('skips sending when no API key is configured', async () => {
  const unconfigured = serviceWithApiKey(undefined);
  await expect(unconfigured.sendWelcomeEmail('a@b.c', 'welcome/uuid-1')).resolves.toBeUndefined();
  expect(send).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `pnpm nx test @org/backend -- --testPathPatterns=email.service`
Expected: FAIL on the idempotency and status-code cases.

- [ ] **Step 3: Implement** the new `EmailSendError` signature and thread `idempotencyKey` through the four public methods into the private `send`. `send` throws `new EmailSendError(error.statusCode, error.message)`. The existing "skipped (no API key)" warning must stop logging the address: log only the subject.

- [ ] **Step 4: Run and confirm it passes**

Run: `pnpm nx test @org/backend -- --testPathPatterns=email.service`
Expected: PASS. (The auth specs will fail to compile until Task 5. That is expected, so do not run the full suite yet.)

---

### Task 3: Email job contract and producer

**Files:**

- Create: `apps/backend/src/email/email-job.ts`
- Create: `apps/backend/src/email/email-queue.service.ts`
- Create: `apps/backend/src/email/email-queue.service.spec.ts`

**Interfaces:**

- Produces (`email-job.ts`):

```ts
export const EMAIL_QUEUE = 'email';

export enum EmailKind {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
  TWO_FACTOR_RECOVERY = 'two-factor-recovery',
}

export interface WelcomeEmailJob {
  readonly kind: EmailKind.WELCOME;
  readonly to: string;
}

export interface CodeEmailJob {
  readonly kind:
    EmailKind.EMAIL_VERIFICATION | EmailKind.PASSWORD_RESET | EmailKind.TWO_FACTOR_RECOVERY;
  readonly to: string;
  readonly code: string;
  readonly expiryMinutes: number;
}

export type EmailJob = WelcomeEmailJob | CodeEmailJob;
```

- Produces (`email-queue.service.ts`): `@Injectable() class EmailQueueService`, built with `@InjectQueue(EMAIL_QUEUE) queue: Queue<EmailJob>`, exposing `enqueue(job: EmailJob): Promise<void>`. It calls `queue.add(job.kind, job, options)` with the job options from Global Constraints, kept as module-level `SCREAMING_SNAKE_CASE` constants.

- [ ] **Step 1: Write the failing tests** in `email-queue.service.spec.ts`

Follow the style of `api/queue/queue.service.spec.ts`: build the service directly with `{ add } as unknown as Queue`.

```ts
const RESET: EmailJob = {
  kind: EmailKind.PASSWORD_RESET,
  to: 'a@b.c',
  code: '123456',
  expiryMinutes: 15,
};

it('names the job after its kind and retries long enough to ride out a short Resend outage', async () => {
  await service.enqueue(RESET);
  expect(add).toHaveBeenCalledWith(
    EmailKind.PASSWORD_RESET,
    RESET,
    expect.objectContaining({
      attempts: 5,
      backoff: { type: 'exponential', delay: 5_000 },
    }),
  );
});

it('keeps no finished or failed job around holding a live code', async () => {
  await service.enqueue(RESET);
  expect(add.mock.calls[0][2]).toMatchObject({ removeOnComplete: true, removeOnFail: true });
});

it('gives back-to-back requests distinct UUID job ids so Resend never sees a reused key', async () => {
  await service.enqueue(RESET);
  await service.enqueue(RESET);
  const [first, second] = add.mock.calls.map(([, , options]) => options.jobId);
  expect(first).toMatch(/^[0-9a-f-]{36}$/);
  expect(first).not.toBe(second);
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `pnpm nx test @org/backend -- --testPathPatterns=email-queue.service`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement** `email-job.ts` and `EmailQueueService` as specified. Use `randomUUID` from `node:crypto`.

- [ ] **Step 4: Run and confirm it passes**

Run: `pnpm nx test @org/backend -- --testPathPatterns=email-queue.service`
Expected: PASS.

---

### Task 4: Email processor and module wiring

**Files:**

- Create: `apps/backend/src/email/email.processor.ts`
- Create: `apps/backend/src/email/email.processor.spec.ts`
- Modify: `apps/backend/src/email/email.module.ts`

**Interfaces:**

- Consumes: `EmailService` methods (Task 2), `EmailSendError.statusCode` (Task 2), `EMAIL_QUEUE` / `EmailJob` / `EmailKind` (Task 3), `producerConnection` / `workerConnection` (Task 1), `shouldConsumeJobs` from `~/api/queue/queue-role` (existing).
- Produces:
  - `@Processor(EMAIL_QUEUE, { connection: workerConnection(configuration().redis), concurrency: 2, limiter: { max: 2, duration: 1_000 } }) class EmailProcessor extends WorkerHost`, built with `EmailService`.
  - `process(job: Job<EmailJob>): Promise<void>`
  - `@OnWorkerEvent('failed') onFailed(job: Job<EmailJob>, error: Error): void`
  - `EmailModule` exports `EmailService` and `EmailQueueService`.

`connection` has to be set on `@Processor` itself. `@nestjs/bullmq` builds the Worker from the queue's own options (`bull.explorer.js`, `handleProcessor`), so without it the worker would inherit the producer's `enableOfflineQueue: false`.

- [ ] **Step 1: Write the failing tests** in `email.processor.spec.ts`

Build `new EmailProcessor(emailService)` with every `EmailService` method as a `jest.fn()`. Build jobs as `{ id: 'job-1', data, attemptsMade: 0 } as unknown as Job<EmailJob>`.

```ts
it.each([
  [{ kind: EmailKind.WELCOME, to: 'a@b.c' }, 'sendWelcomeEmail', ['a@b.c', 'welcome/job-1']],
  [
    { kind: EmailKind.EMAIL_VERIFICATION, to: 'a@b.c', code: '111111', expiryMinutes: 15 },
    'sendVerificationCode',
    ['a@b.c', '111111', 15, 'email-verification/job-1'],
  ],
  [
    { kind: EmailKind.PASSWORD_RESET, to: 'a@b.c', code: '222222', expiryMinutes: 15 },
    'sendPasswordResetCode',
    ['a@b.c', '222222', 15, 'password-reset/job-1'],
  ],
  [
    { kind: EmailKind.TWO_FACTOR_RECOVERY, to: 'a@b.c', code: '333333', expiryMinutes: 15 },
    'sendTwoFactorRecoveryCode',
    ['a@b.c', '333333', 15, 'two-factor-recovery/job-1'],
  ],
])('sends %o through %s with a kind/jobId idempotency key', async (data, method, args) => {
  await processor.process(jobWith(data));
  expect(emailService[method]).toHaveBeenCalledWith(...args);
});

it('stops retrying when Resend rejects the email itself', async () => {
  emailService.sendWelcomeEmail.mockRejectedValue(new EmailSendError(422, 'Invalid `to` field'));
  await expect(processor.process(jobWith(WELCOME))).rejects.toBeInstanceOf(UnrecoverableError);
});

it.each([429, 500, 503, null])(
  'keeps retrying a transient Resend failure (%p)',
  async (statusCode) => {
    const failure = new EmailSendError(statusCode, 'try later');
    emailService.sendWelcomeEmail.mockRejectedValue(failure);
    await expect(processor.process(jobWith(WELCOME))).rejects.toBe(failure);
  },
);

it('refuses a job whose kind it does not know', async () => {
  await expect(processor.process(jobWith({ kind: 'newsletter', to: 'a@b.c' }))).rejects.toThrow(
    /newsletter/,
  );
});

it('logs a failed job without the code or the recipient', () => {
  const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  processor.onFailed(jobWith(RESET), new EmailSendError(500, 'down'));
  const logged = JSON.stringify(warn.mock.calls);
  expect(logged).toContain('password-reset');
  expect(logged).toContain('job-1');
  expect(logged).not.toContain('a@b.c');
  expect(logged).not.toContain('222222');
});
```

- [ ] **Step 2: Run and confirm it fails**

Run: `pnpm nx test @org/backend -- --testPathPatterns=email.processor`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `EmailProcessor`**

`process` does an exhaustive `switch (job.data.kind)`. Its `default` branch throws an `UnknownEmailKindError` (new class in `email.errors.ts`) naming the kind. A `catch` around the send rethrows `new UnrecoverableError(error.message)` when the error is an `EmailSendError` whose status is not retryable (rule in Global Constraints). Every other error is rethrown unchanged. `onFailed` logs `kind`, `job.id`, `attemptsMade` and `error.message`, nothing else.

- [ ] **Step 4: Wire `EmailModule`**

- Import `BullModule.registerQueueAsync({ name: EMAIL_QUEUE, imports: [ConfigModule], inject: [ConfigService], useFactory: (config) => ({ connection: producerConnection(config.get<RedisSettings>('redis')) }) })`.
- Providers: `EmailService`, `EmailQueueService`, plus `EmailProcessor` only when `shouldConsumeJobs(configuration().queue.role)`. Mirror `jobRunners()` in `api/queue/queue.module.ts`.
- Exports: `EmailService`, `EmailQueueService`.
- Do not add `queueBoardFeatureImports`.

- [ ] **Step 5: Run and confirm it passes**

Run: `pnpm nx test @org/backend -- --testPathPatterns="email\."`
Expected: PASS.

---

### Task 5: Auth flows enqueue instead of sending

**Files:**

- Modify: `apps/backend/src/api/auth/services/auth.service.ts` (constructor, `verifyEmail` ~L241, `forgotPassword` ~L270, `sendVerification` ~L415, `trySend` ~L421)
- Modify: `apps/backend/src/api/auth/services/two-factor-account.service.ts` (~L93)
- Modify: `apps/backend/src/api/auth/services/auth.service.spec.ts`
- Modify: `apps/backend/src/api/auth/services/two-factor-account.service.spec.ts`

**Interfaces:**

- Consumes: `EmailQueueService.enqueue(job: EmailJob)` and `EmailKind` (Task 3).

Both services inject `EmailQueueService` in place of `EmailService`. Each call site maps one-to-one onto a job: `{ kind, to, code, expiryMinutes }` with the same values passed today. `trySend` stays and now wraps only the welcome enqueue. Password reset and verification call `enqueue` directly, without `trySend`, so their failures propagate.

- [ ] **Step 1: Update the specs first**

Replace the four-method `email` mock with `emailQueue = { enqueue: jest.fn().mockResolvedValue(undefined) }`. Rewrite each existing assertion as an `enqueue` expectation. For example, register:

```ts
expect(emailQueue.enqueue).toHaveBeenCalledWith({
  kind: EmailKind.EMAIL_VERIFICATION,
  to: 'a@b.c',
  code: '123456',
  expiryMinutes: 15,
});
expect(emailQueue.enqueue).not.toHaveBeenCalledWith(
  expect.objectContaining({ kind: EmailKind.WELCOME }),
);
```

Add two new cases to `auth.service.spec.ts`:

```ts
it('still verifies the account when the welcome email cannot be queued', async () => {
  emailQueue.enqueue.mockRejectedValue(new Error("Stream isn't writeable"));
  await expect(service.verifyEmail(dto, request)).resolves.toEqual({
    message: 'Email verified successfully',
  });
  expect(userService.update).toHaveBeenCalledWith(expect.anything(), { isEmailVerified: true });
});

it('fails the reset request when its code cannot be queued, so the user is not told a code is on its way', async () => {
  emailQueue.enqueue.mockRejectedValue(new Error("Stream isn't writeable"));
  await expect(service.forgotPassword('a@b.c', request)).rejects.toThrow();
});
```

In `two-factor-account.service.spec.ts`, the L104 assertion becomes:

```ts
expect(emailQueue.enqueue).toHaveBeenCalledWith({
  kind: EmailKind.TWO_FACTOR_RECOVERY,
  to: 'a@b.c',
  code: '123456',
  expiryMinutes: 15,
});
```

- [ ] **Step 2: Run and confirm they fail**

Run: `pnpm nx test @org/backend -- --testPathPatterns="auth.service|two-factor-account.service"`
Expected: FAIL (constructor type mismatch or `enqueue` not called).

- [ ] **Step 3: Switch both services to `EmailQueueService`** as described above.

- [ ] **Step 4: Run and confirm they pass**

Run: `pnpm nx test @org/backend -- --testPathPatterns="auth.service|two-factor-account.service"`
Expected: PASS.

---

### Task 6: Docs and full verification

**Files:**

- Modify: `docs/roadmap/11-worker-and-cron.md`: add a short section "Email đi qua queue `email`" covering why it is kept off bull-board (OTP in the payload), the producer fail-fast connection, the retry window of about 75 seconds, and `removeOnFail: true` (with the lazy-`age` reason). Write it in Vietnamese, matching the file.
- Modify: `docs/setup-roadmap.md`: tick `[x] BullMQ + background jobs`.

- [ ] **Step 1: Update both docs** as listed.

- [ ] **Step 2: Full backend checks**

Run: `pnpm nx run-many -t lint typecheck test build -p @org/backend`
Expected: all targets succeed. If `typecheck` reports TS6305, delete the stale `tsbuildinfo` (never `dist`) and rerun.

- [ ] **Step 3: Manual check, local, `QUEUE_ROLE` unset (`both`)**

Ask Kim An to restart their own `pnpm dev`. Do not kill it yourself. Then:

1. `POST /<GLOBAL_PREFIX>/auth/forgot-password` for a registered user. Expect the backend log to show the email job completing, or the "skipped (no API key)" warning, with no address in either.
2. `docker compose stop redis`, repeat the request, and record how long it takes to return 500 (expected ~10–40 s, bounded by `RedisModule`'s client, not by the email queue).
3. `docker compose start redis`.

Report what was observed.
