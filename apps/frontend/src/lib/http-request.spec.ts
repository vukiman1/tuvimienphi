import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
  BACKGROUND_REQUEST,
  MissingApiEnvelopeError,
  httpRequest,
  infrastructureFailureMessage,
} from './http-request';
import { notify } from './toast';

jest.mock('./toast', () => ({ notify: { error: jest.fn() } }));

const UNREACHABLE_MESSAGE = 'Chưa kết nối được tới máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.';
const SERVER_FAILURE_MESSAGE = 'Máy chủ đang gặp sự cố. Bạn thử lại sau ít phút nhé.';

const SPA_FALLBACK_BODY = '<!doctype html><html></html>';
const OK_STATUS = 200;

function answerWith(body: unknown): (config: InternalAxiosRequestConfig) => Promise<AxiosResponse> {
  return (config) =>
    Promise.resolve({ data: body, status: OK_STATUS, statusText: 'OK', headers: {}, config });
}

function unreachableServer(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config));
}

describe('infrastructureFailureMessage', () => {
  it('speaks up when the server could not be reached at all', () => {
    expect(infrastructureFailureMessage(undefined)).toBe(UNREACHABLE_MESSAGE);
  });

  it('speaks up when the server broke on its own', () => {
    expect(infrastructureFailureMessage(500)).toBe(SERVER_FAILURE_MESSAGE);
    expect(infrastructureFailureMessage(503)).toBe(SERVER_FAILURE_MESSAGE);
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

describe('a response from the API', () => {
  it('hands back the data inside the success envelope', async () => {
    const envelope = { statusCode: OK_STATUS, success: true, data: { year: 2026 } };

    await expect(
      httpRequest.get('/van-han/current', { adapter: answerWith(envelope) }),
    ).resolves.toEqual({ year: 2026 });
  });

  it('hands back undefined when a successful envelope carries no data', async () => {
    const envelope = { statusCode: OK_STATUS, success: true };

    await expect(
      httpRequest.post('/auth/logout', undefined, { adapter: answerWith(envelope) }),
    ).resolves.toBeUndefined();
  });

  it('resolves a no-content PUT even though a 204 carries no envelope', async () => {
    await expect(
      httpRequest.putNoContent(
        '/learning/progress',
        { slugs: ['tu-vi-la-gi'] },
        {
          adapter: answerWith(''),
        },
      ),
    ).resolves.toBeUndefined();
  });

  it('pages a list from the envelope metadata', async () => {
    const metadata = { page: 2, limit: 1, totalItems: 3, totalPages: 3 };
    const envelope = { statusCode: OK_STATUS, success: true, data: ['Tý'], metadata };

    await expect(
      httpRequest.getPaginated('/admin/items', { adapter: answerWith(envelope) }),
    ).resolves.toEqual({ items: ['Tý'], metadata });
  });

  it('names the URL when a paged body is not an API envelope', async () => {
    const request = httpRequest.getPaginated('/admin/items', {
      adapter: answerWith(SPA_FALLBACK_BODY),
    });

    await expect(request).rejects.toBeInstanceOf(MissingApiEnvelopeError);
    await expect(request).rejects.toThrow('/admin/items');
  });

  it('names the URL when the body is not an API envelope', async () => {
    const request = httpRequest.get('/van-han/current', {
      adapter: answerWith(SPA_FALLBACK_BODY),
    });

    await expect(request).rejects.toBeInstanceOf(MissingApiEnvelopeError);
    await expect(request).rejects.toThrow('/van-han/current');
  });
});
