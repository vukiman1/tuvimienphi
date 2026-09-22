export interface JwtPayload {
  id: string;
  jti: string;
  aud?: string;
  iat?: number;
  exp?: number;
}
