import { createHmac, createSign, createVerify, timingSafeEqual } from 'node:crypto';

export type OidcAuthConfig = {
  issuer: string;
  audience: string;
  hs256Secret?: string;
  rs256PublicKeyPem?: string;
  rs256PublicKeysByKid?: Record<string, string>;
  subjectClaim?: string;
  requiredMfaClaim?: string;
  requiredMfaValues?: string[];
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

  if (header.typ !== 'JWT') {
    return { ok: false as const, error: 'Unsupported OIDC access token algorithm' };
  }

  if (header.alg === 'HS256') {
    if (!config.hs256Secret) {
      return { ok: false as const, error: 'OIDC HS256 secret is not configured' };
    }

    const expectedSignature = signHs256(`${encodedHeader}.${encodedPayload}`, config.hs256Secret);
    if (!constantTimeEqual(signature, expectedSignature)) {
      return { ok: false as const, error: 'Invalid OIDC access token signature' };
    }
  } else if (header.alg === 'RS256') {
    const rs256PublicKeyPem = resolveRs256PublicKey(header, config);
    if (!rs256PublicKeyPem) {
      return { ok: false as const, error: 'OIDC RS256 public key is not configured' };
    }

    const verifier = createVerify('RSA-SHA256');
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();

    if (!verifier.verify(rs256PublicKeyPem, Buffer.from(signature, 'base64url'))) {
      return { ok: false as const, error: 'Invalid OIDC access token signature' };
    }
  } else {
    return { ok: false as const, error: 'Unsupported OIDC access token algorithm' };
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

  const mfaResult = validateMfaClaim(payload, config);
  if (!mfaResult.ok) {
    return mfaResult;
  }

  return { ok: true as const, subject, payload };
}

export function createOidcTestToken(payload: OidcTokenPayload, secret: string) {
  const encodedHeader = encodeJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = encodeJson(payload);
  const signature = signHs256(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function createOidcRs256TestToken(
  payload: OidcTokenPayload,
  privateKeyPem: string,
  options: { kid?: string } = {}
) {
  const encodedHeader = encodeJson({ alg: 'RS256', typ: 'JWT', ...(options.kid ? { kid: options.kid } : {}) });
  const encodedPayload = encodeJson(payload);
  const signer = createSign('RSA-SHA256');
  signer.update(`${encodedHeader}.${encodedPayload}`);
  signer.end();
  const signature = signer.sign(privateKeyPem).toString('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function signHs256(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function resolveRs256PublicKey(header: Record<string, unknown>, config: OidcAuthConfig) {
  const kid = typeof header.kid === 'string' ? header.kid : null;
  if (kid && config.rs256PublicKeysByKid?.[kid]) {
    return config.rs256PublicKeysByKid[kid];
  }
  if (kid && config.rs256PublicKeysByKid && !config.rs256PublicKeysByKid[kid]) {
    return null;
  }
  return config.rs256PublicKeyPem ?? null;
}

function validateMfaClaim(payload: OidcTokenPayload, config: OidcAuthConfig) {
  if (!config.requiredMfaClaim) {
    return { ok: true as const };
  }

  const claim = payload[config.requiredMfaClaim];
  const allowedValues = config.requiredMfaValues ?? ['true', 'mfa', 'otp'];

  if (typeof claim === 'boolean') {
    return claim ? { ok: true as const } : { ok: false as const, error: 'OIDC MFA claim is required' };
  }

  const claimValues = Array.isArray(claim) ? claim : [claim];
  const matches = claimValues.some((value) => typeof value === 'string' && allowedValues.includes(value));
  return matches ? { ok: true as const } : { ok: false as const, error: 'OIDC MFA claim is required' };
}

function constantTimeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
}
