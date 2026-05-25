import { createHmac, timingSafeEqual } from 'node:crypto';

export type OidcAuthConfig = {
  issuer: string;
  audience: string;
  hs256Secret: string;
  subjectClaim?: string;
};

export type OidcTokenPayload = {
  iss: string;
  aud: string | string[];
  sub?: string;
  exp: number;
  iat?: number;
  [claim: string]: unknown;
};

export function verifyOidcAccessToken(token: string, config: OidcAuthConfig) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false as const, error: 'Invalid OIDC access token' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  let header: Record<string, unknown>;
  let payload: OidcTokenPayload;

  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return { ok: false as const, error: 'Invalid OIDC access token' };
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    return { ok: false as const, error: 'Unsupported OIDC access token algorithm' };
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, config.hs256Secret);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return { ok: false as const, error: 'Invalid OIDC access token signature' };
  }

  if (payload.iss !== config.issuer) {
    return { ok: false as const, error: 'Invalid OIDC issuer' };
  }

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(config.audience)) {
    return { ok: false as const, error: 'Invalid OIDC audience' };
  }

  if (!Number.isInteger(payload.exp) || payload.exp * 1000 <= Date.now()) {
    return { ok: false as const, error: 'OIDC access token expired' };
  }

  const subjectClaim = config.subjectClaim ?? 'sub';
  const subject = payload[subjectClaim];
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return { ok: false as const, error: 'OIDC subject claim is required' };
  }

  return { ok: true as const, subject, payload };
}

export function createOidcTestToken(payload: OidcTokenPayload, secret: string) {
  const encodedHeader = encodeJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = encodeJson(payload);
  const signature = sign(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function constantTimeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}
