import { createPublicKey } from 'node:crypto';

export type OidcJwksKeySet = {
  publicKeysByKid: Record<string, string>;
  fetchedAt: Date;
  expiresAt: Date;
};

export type OidcJwksCacheOptions = {
  jwksUrl: string;
  cacheTtlMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => Date;
};

type JwksDocument = {
  keys?: Array<Record<string, unknown>>;
};

export function createOidcJwksCache(options: OidcJwksCacheOptions) {
  const cacheTtlMs = options.cacheTtlMs ?? 60 * 60 * 1000;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date());
  let cached: OidcJwksKeySet | null = null;

  return {
    async getPublicKeys() {
      const currentTime = now();
      if (cached && cached.expiresAt > currentTime) {
        return cached;
      }

      const response = await fetchImpl(options.jwksUrl);
      if (!response.ok) {
        throw new Error(`OIDC JWKS request failed with ${response.status}`);
      }

      const body = (await response.json()) as JwksDocument;
      const publicKeysByKid = convertJwksToPublicKeyMap(body);
      if (Object.keys(publicKeysByKid).length === 0) {
        throw new Error('OIDC JWKS does not contain usable RS256 keys');
      }

      cached = {
        publicKeysByKid,
        fetchedAt: currentTime,
        expiresAt: new Date(currentTime.getTime() + cacheTtlMs),
      };
      return cached;
    },
  };
}

export function convertJwksToPublicKeyMap(jwks: JwksDocument) {
  const keys: Record<string, string> = {};

  for (const jwk of jwks.keys ?? []) {
    if (jwk.kty !== 'RSA') {
      continue;
    }
    if (jwk.use && jwk.use !== 'sig') {
      continue;
    }
    if (jwk.alg && jwk.alg !== 'RS256') {
      continue;
    }
    if (typeof jwk.kid !== 'string' || !jwk.kid.trim()) {
      continue;
    }

    try {
      keys[jwk.kid] = createPublicKey({ key: jwk, format: 'jwk' }).export({
        type: 'spki',
        format: 'pem',
      }) as string;
    } catch {
      continue;
    }
  }

  return keys;
}
