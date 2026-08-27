import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiSuccessEnvelope } from '@org/shared-contracts';
import { env } from '@/config/env';
import { ApiError, isApiErrorEnvelope } from './api-error';

const instance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  // Session cookies are set by the auth app; send them with every request.
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response.data,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (isApiErrorEnvelope(data)) {
        return Promise.reject(new ApiError(data));
      }
    }
    return Promise.reject(error);
  },
);

function unwrap<T>(envelope: ApiSuccessEnvelope<T>): T {
  return envelope.data;
}

export const httpRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<unknown, ApiSuccessEnvelope<T>>(url, config).then(unwrap<T>),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post<unknown, ApiSuccessEnvelope<T>>(url, data, config).then(unwrap<T>),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.put<unknown, ApiSuccessEnvelope<T>>(url, data, config).then(unwrap<T>),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.patch<unknown, ApiSuccessEnvelope<T>>(url, data, config).then(unwrap<T>),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<unknown, ApiSuccessEnvelope<T>>(url, config).then(unwrap<T>),
};

export default httpRequest;
