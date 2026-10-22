import type { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

const send = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send } })),
}));

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html></html>'),
}));

function serviceWithApiKey(apiKey: string | undefined): EmailService {
  const settings: Record<string, string | undefined> = {
    'email.resendApiKey': apiKey,
    'email.from': 'noreply@tuvimienphi.test',
    'app.url': 'https://tuvimienphi.test',
  };
  const config = { get: (key: string) => settings[key] } as unknown as ConfigService;
  return new EmailService(config);
}

describe('EmailService', () => {
  const service = serviceWithApiKey('re_test');

  beforeEach(() => send.mockReset());

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

    await expect(failure).rejects.toMatchObject({
      name: 'EmailSendError',
      statusCode: 422,
      code: 'validation_error',
    });
    await expect(failure).rejects.not.toThrow(/a@b\.c/);
  });

  it('treats an error body without a status code as transient rather than final', async () => {
    send.mockResolvedValue({
      data: null,
      error: { name: 'application_error', message: 'upstream unavailable' },
    });

    await expect(service.sendWelcomeEmail('a@b.c', 'welcome/uuid-1')).rejects.toMatchObject({
      statusCode: null,
    });
  });

  it('skips sending when no API key is configured', async () => {
    const unconfigured = serviceWithApiKey(undefined);

    await expect(unconfigured.sendWelcomeEmail('a@b.c', 'welcome/uuid-1')).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });
});
