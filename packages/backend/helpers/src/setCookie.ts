import { CookieOptions, Response } from 'express';

export const CookieName = {
  ACCESS_TOKEN: 'access_token',
  SESSION: 'sub',
  ADMIN_ACCESS_TOKEN: 'admin_access_token',
  ADMIN_SESSION: 'admin_sub',
} as const;

export type CookieName = (typeof CookieName)[keyof typeof CookieName];

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ADMIN_COOKIE_PATH = '/api/admin';

const BASE_COOKIE: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: IS_PRODUCTION,
  path: '/',
};

const COOKIE_DEFAULTS: Record<CookieName, CookieOptions> = {
  [CookieName.ACCESS_TOKEN]: BASE_COOKIE,
  [CookieName.SESSION]: BASE_COOKIE,
  [CookieName.ADMIN_ACCESS_TOKEN]: { ...BASE_COOKIE, path: ADMIN_COOKIE_PATH },
  [CookieName.ADMIN_SESSION]: { ...BASE_COOKIE, path: ADMIN_COOKIE_PATH },
};

export function setCookie(
  response: Response,
  name: CookieName,
  value: string,
  overrides?: CookieOptions,
) {
  response.cookie(name, value, { ...COOKIE_DEFAULTS[name], ...overrides });
}

export function clearCookie(response: Response, name: CookieName) {
  response.clearCookie(name, COOKIE_DEFAULTS[name]);
}
