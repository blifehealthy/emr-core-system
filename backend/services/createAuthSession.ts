import { createSessionToken } from './sessionToken.ts';

export type CreateAuthSessionInput = {
  clinicId: string;
  username: string;
  loginCode: string;
};

export type AuthSessionResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: {
    id: string;
    clinic_id: string;
    username: string;
    display_name: string;
    role: 'doctor' | 'nurse' | 'admin';
    practitioner_id: string | null;
  };
};

export class AuthSessionConfigError extends Error {}

export function createAuthSession(
  db: { query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }> },
  config: {
    loginCode?: string;
    sessionSecret?: string;
    ttlMinutes?: number;
    now?: () => Date;
  }
) {
  return async function run(input: CreateAuthSessionInput): Promise<AuthSessionResult | null> {
    const expectedLoginCode = config.loginCode?.trim();
    const sessionSecret = config.sessionSecret?.trim();
    if (!expectedLoginCode || !sessionSecret) {
      throw new AuthSessionConfigError('AUTH_LOGIN_CODE and AUTH_SESSION_SECRET are required');
    }

    if (input.loginCode !== expectedLoginCode) {
      return null;
    }

    const result = await db.query<{
      id: string;
      clinic_id: string;
      username: string;
      display_name: string;
      role: 'doctor' | 'nurse' | 'admin';
      practitioner_id: string | null;
    }>(
      `
        SELECT
          u.id,
          u.clinic_id,
          u.username,
          u.display_name,
          u.role,
          p.id AS practitioner_id
        FROM users u
        LEFT JOIN practitioners p
          ON p.user_id = u.id
         AND p.deleted_at IS NULL
         AND p.is_active = TRUE
        WHERE u.clinic_id = $1
          AND u.username = $2
          AND u.deleted_at IS NULL
          AND u.is_active = TRUE
      `,
      [input.clinicId, input.username]
    );

    const user = result.rows[0];
    if (!user) {
      return null;
    }

    const now = config.now?.() ?? new Date();
    const ttlMinutes = config.ttlMinutes ?? 480;
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();
    const accessToken = createSessionToken(
      {
        userId: user.id,
        issuedAt: now.toISOString(),
        expiresAt,
      },
      sessionSecret
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresAt,
      user,
    };
  };
}
