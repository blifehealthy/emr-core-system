import { DEFAULT_ROLE_PERMISSIONS, type PermissionKey } from '../api/auth.ts';
import type { RolePermissionOverrideInput, UserRole } from '../api/types.ts';

type Queryable = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

const ROLES: UserRole[] = ['doctor', 'nurse', 'admin'];
const PERMISSION_KEYS = Object.keys(DEFAULT_ROLE_PERMISSIONS) as PermissionKey[];

export function listRolePermissions(db: Queryable) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query<{
      role: UserRole;
      permission_key: PermissionKey;
      is_allowed: boolean;
      updated_by_user_id: string | null;
      updated_at: string;
      notes: string | null;
    }>(
      `
        SELECT role, permission_key, is_allowed, updated_by_user_id, updated_at, notes
        FROM role_permission_overrides
        WHERE clinic_id = $1
          AND deleted_at IS NULL
      `,
      [input.clinicId]
    );

    const overrides = new Map(
      result.rows.map((row) => [`${row.role}:${row.permission_key}`, row])
    );

    return ROLES.flatMap((role) =>
      PERMISSION_KEYS.map((permissionKey) => {
        const override = overrides.get(`${role}:${permissionKey}`);
        const defaultAllowed = (DEFAULT_ROLE_PERMISSIONS[permissionKey] as readonly UserRole[]).includes(role);
        return {
          clinic_id: input.clinicId,
          role,
          permission_key: permissionKey,
          default_allowed: defaultAllowed,
          is_allowed: override?.is_allowed ?? defaultAllowed,
          is_overridden: Boolean(override),
          updated_by_user_id: override?.updated_by_user_id ?? null,
          updated_at: override?.updated_at ?? null,
          notes: override?.notes ?? null,
        };
      })
    );
  };
}

export function upsertRolePermission(db: Queryable) {
  return async function run(input: RolePermissionOverrideInput) {
    validatePermissionKey(input.permissionKey);
    const result = await db.query(
      `
        INSERT INTO role_permission_overrides (
          clinic_id,
          role,
          permission_key,
          is_allowed,
          updated_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (clinic_id, role, permission_key)
        DO UPDATE SET
          is_allowed = EXCLUDED.is_allowed,
          updated_by_user_id = EXCLUDED.updated_by_user_id,
          notes = EXCLUDED.notes,
          deleted_at = NULL,
          updated_at = now()
        RETURNING *
      `,
      [
        input.clinicId,
        input.role,
        input.permissionKey,
        input.isAllowed,
        input.updatedByUserId ?? null,
        input.notes ?? null,
      ]
    );
    return result.rows[0];
  };
}

export function validatePermissionKey(permissionKey: string): asserts permissionKey is PermissionKey {
  if (!PERMISSION_KEYS.includes(permissionKey as PermissionKey)) {
    throw new Error(`Unknown permission key: ${permissionKey}`);
  }
}

export function buildPermissionOverrides(
  rows: Array<{ permission_key: string; is_allowed: boolean }>
) {
  return Object.fromEntries(
    rows
      .filter((row) => PERMISSION_KEYS.includes(row.permission_key as PermissionKey))
      .map((row) => [row.permission_key, row.is_allowed])
  );
}
