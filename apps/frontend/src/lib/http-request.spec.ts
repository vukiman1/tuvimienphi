import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { BACKGROUND_REQUEST, httpRequest, infrastructureFailureMessage } from './http-request';
import { notify } from './toast';

jest.mock('./toast', () => ({ notify: { error: jest.fn() } }));

const UNREACHABLE_MESSAGE = 'Could not reach the server. Check your connection and try again.';

function unreachableServer(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config));
}

describe('infrastructureFailureMessage', () => {
  it('speaks up when the server could not be reached at all', () => {
    expect(infrastructureFailureMessage(undefined)).toBe(UNREACHABLE_MESSAGE);
  });

  it('speaks up when the server broke on its own', () => {
    expect(infrastructureFailureMessage(500)).toBeTruthy();
    expect(infrastructureFailureMessage(503)).toBeTruthy();
  });

  it('stays quiet for errors a screen shows inline', () => {
    expect(infrastructureFailureMessage(400)).toBeNull();
    expect(infrastructureFailureMessage(401)).toBeNull();
    expect(infrastructureFailureMessage(403)).toBeNull();
    expect(infrastructureFailureMessage(409)).toBeNull();
    expect(infrastructureFailureMessage(422)).toBeNull();
  });
});

describe('a request that cannot reach the server', () => {
  beforeEach(() => jest.mocked(notify.error).mockClear());

  it('tells the person when they asked for it', async () => {
    await expect(
      httpRequest.get('/auth/me', { adapter: unreachableServer }),
    ).rejects.toBeInstanceOf(AxiosError);

    expect(notify.error).toHaveBeenCalledWith(UNREACHABLE_MESSAGE);
  });

  it('stays quiet when it ran in the background and leaves the failure to its caller', async () => {
    await expect(
      httpRequest.get('/auth/session', { ...BACKGROUND_REQUEST, adapter: unreachableServer }),
    ).rejects.toBeInstanceOf(AxiosError);

    expect(notify.error).not.toHaveBeenCalled();
  });
});
