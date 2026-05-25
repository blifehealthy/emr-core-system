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
    maxFailedAttempts?: number;
    lockoutMinutes?: number;
    now?: () => Date;
  }
) {
  return async function run(input: CreateAuthSessionInput): Promise<AuthSessionResult | null> {
    const expectedLoginCode = config.loginCode?.trim();
    const sessionSecret = config.sessionSecret?.trim();
    if (!expectedLoginCode || !sessionSecret) {
      throw new AuthSessionConfigError('AUTH_LOGIN_CODE and AUTH_SESSION_SECRET are required');
    }

    const result = await db.query<{
      id: string;
      clinic_id: string;
      username: string;
      display_name: string;
      role: 'doctor' | 'nurse' | 'admin';
      practitioner_id: string | null;
      failed_login_count: number;
      locked_until: string | null;
    }>(
      `
        SELECT
          u.id,
          u.clinic_id,
          u.username,
          u.display_name,
          u.role,
          p.id AS practitioner_id,
          u.failed_login_count,
          u.locked_until
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
    if (user.locked_until && Date.parse(user.locked_until) > now.getTime()) {
      return null;
    }

    if (input.loginCode !== expectedLoginCode) {
      const failedLoginCount = user.failed_login_count + 1;
      const maxFailedAttempts = config.maxFailedAttempts ?? 5;
      const lockoutMinutes = config.lockoutMinutes ?? 15;
      const lockedUntil =
        failedLoginCount >= maxFailedAttempts
          ? new Date(now.getTime() + lockoutMinutes * 60 * 1000).toISOString()
          : null;

      await db.query(
        `
          UPDATE users
          SET failed_login_count = $2,
              locked_until = $3
          WHERE id = $1
        `,
        [user.id, failedLoginCount, lockedUntil]
      );

      return null;
    }

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

    await db.query(
      `
        UPDATE users
        SET last_login_at = $2,
            failed_login_count = 0,
            locked_until = NULL
        WHERE id = $1
      `,
      [user.id, now.toISOString()]
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresAt,
      user,
    };
  };
}
