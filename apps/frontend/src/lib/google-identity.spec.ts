import {
  ensureGoogleIdentity,
  promptGoogleOneTap,
  resetGoogleIdentityForTests,
} from './google-identity';

const initialize = jest.fn();
const prompt = jest.fn();

describe('google-identity', () => {
  beforeEach(() => {
    initialize.mockReset();
    prompt.mockReset();
    resetGoogleIdentityForTests();
    window.google = {
      accounts: { id: { initialize, prompt, renderButton: jest.fn(), cancel: jest.fn() } },
    };
  });

  it('initializes GIS exactly once even across repeated calls', async () => {
    const callback = jest.fn();
    await ensureGoogleIdentity({ clientId: 'client-1', callback });
    await ensureGoogleIdentity({ clientId: 'client-1', callback });

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-1', use_fedcm_for_prompt: true }),
    );
  });

  it('forwards the credential string to the caller callback', async () => {
    const callback = jest.fn();
    await ensureGoogleIdentity({ clientId: 'client-1', callback });
    const gisCallback = initialize.mock.calls[0][0].callback;

    gisCallback({ credential: 'abc' });

    expect(callback).toHaveBeenCalledWith('abc');
  });

  it('prompts through the initialized api', async () => {
    await ensureGoogleIdentity({ clientId: 'client-1', callback: jest.fn() });
    promptGoogleOneTap();

    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it('delivers a credential to the One Tap callback when the modal button registered first', async () => {
    const oneTapCallback = jest.fn();
    await ensureGoogleIdentity({ clientId: 'client-1' });
    await ensureGoogleIdentity({ clientId: 'client-1', callback: oneTapCallback });

    initialize.mock.calls[0][0].callback({ credential: 'abc' });

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(oneTapCallback).toHaveBeenCalledWith('abc');
  });

  it('delivers a credential to the One Tap callback when the modal button registered after', async () => {
    const oneTapCallback = jest.fn();
    await ensureGoogleIdentity({ clientId: 'client-1', callback: oneTapCallback });
    await ensureGoogleIdentity({ clientId: 'client-1' });

    initialize.mock.calls[0][0].callback({ credential: 'abc' });

    expect(oneTapCallback).toHaveBeenCalledWith('abc');
  });

  it('warns instead of dropping silently a credential that arrives before any callback', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await ensureGoogleIdentity({ clientId: 'client-1' });

    initialize.mock.calls[0][0].callback({ credential: 'abc' });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no credential callback'));
    warn.mockRestore();
  });
});
