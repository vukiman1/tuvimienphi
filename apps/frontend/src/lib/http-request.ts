import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { appConfig } from '@/config/app-config';
import type {
  ApiSuccessEnvelope,
  PaginatedResult,
  PaginationMetadata,
} from '@org/shared-contracts';
import { endSession } from '@/features/auth/session';
import { ApiError, isApiErrorEnvelope } from './api-error';
import { notify } from './toast';

const REFRESH_PATH = '/auth/refresh-token';
const LOGIN_PATH = '/auth/login';
const REGISTER_PATH = '/auth/register';
export const UNREACHABLE_SERVER_MESSAGE =
  'Chưa kết nối được tới máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.';
const SERVER_FAILURE_MESSAGE = 'Máy chủ đang gặp sự cố. Bạn thử lại sau ít phút nhé.';

declare module 'axios' {
  interface AxiosRequestConfig {
    isBackgroundRequest?: boolean;
  }
}

export const BACKGROUND_REQUEST = {
  isBackgroundRequest: true,
} as const satisfies AxiosRequestConfig;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const instance: AxiosInstance = axios.create({
  baseURL: appConfig.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  await instance.post(REFRESH_PATH);
}

instance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';

    const isAuthEndpoint =
      url.startsWith(LOGIN_PATH) || url.startsWith(REGISTER_PATH) || url.startsWith(REFRESH_PATH);

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        await refreshPromise;
        return instance(originalRequest);
      } catch (refreshError) {
        endSession();
        return Promise.reject(toApiError(refreshError));
      } finally {
        refreshPromise = null;
      }
    }

    if (!originalRequest?.isBackgroundRequest) {
      reportInfrastructureFailure(error);
    }
    return Promise.reject(toApiError(error));
  },
);

export function infrastructureFailureMessage(status: number | undefined): string | null {
  if (status === undefined) {
    return UNREACHABLE_SERVER_MESSAGE;
  }
  if (status >= 500) {
    return SERVER_FAILURE_MESSAGE;
  }
  return null;
}

function reportInfrastructureFailure(error: AxiosError): void {
  const message = infrastructureFailureMessage(error.response?.status);
  if (message) {
    notify.error(message);
  }
}

function toApiError(error: unknown): unknown {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (isApiErrorEnvelope(data)) {
      return new ApiError(data);
    }
  }
  return error;
}

export class MissingApiEnvelopeError extends Error {
  constructor(readonly url: string) {
    super(`${url} answered without the API success envelope`);
    this.name = 'MissingApiEnvelopeError';
  }
}

function isSuccessEnvelope(body: unknown): body is ApiSuccessEnvelope<unknown> {
  return typeof body === 'object' && body !== null && 'success' in body && body.success === true;
}

function envelopeOf<T>(url: string, body: unknown): ApiSuccessEnvelope<T> {
  if (!isSuccessEnvelope(body)) {
    throw new MissingApiEnvelopeError(url);
  }
  return body as ApiSuccessEnvelope<T>;
}

function unwrap<T>(url: string): (body: unknown) => T {
  return (body: unknown): T => envelopeOf<T>(url, body).data;
}

function unwrapPaginated<T>(url: string): (body: unknown) => PaginatedResult<T> {
  return (body: unknown): PaginatedResult<T> => {
    const envelope = envelopeOf<T[]>(url, body);
    const metadata: PaginationMetadata = envelope.metadata ?? {
      page: 1,
      limit: envelope.data.length,
      totalItems: envelope.data.length,
      totalPages: 1,
    };
    return { items: envelope.data, metadata };
  };
}

export const httpRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<unknown, unknown>(url, config).then(unwrap<T>(url)),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post<unknown, unknown>(url, data, config).then(unwrap<T>(url)),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.put<unknown, unknown>(url, data, config).then(unwrap<T>(url)),
  putNoContent: (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<void> =>
    instance.put<unknown, unknown>(url, data, config).then(() => undefined),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.patch<unknown, unknown>(url, data, config).then(unwrap<T>(url)),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<unknown, unknown>(url, config).then(unwrap<T>(url)),
  getPaginated: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<unknown, unknown>(url, config).then(unwrapPaginated<T>(url)),
};

export default httpRequest;
