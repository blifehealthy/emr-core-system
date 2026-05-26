import test from 'node:test';
import assert from 'node:assert/strict';

import { listRolePermissions, upsertRolePermission } from './rolePermissions.ts';

test('listRolePermissions overlays clinic overrides on default matrix', async () => {
  const service = listRolePermissions({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /FROM role_permission_overrides/);
      assert.deepEqual(params, ['clinic-1']);
      return {
        rows: [
          {
            role: 'nurse',
            permission_key: 'prescription_write',
            is_allowed: true,
            updated_by_user_id: 'admin-1',
            updated_at: '2026-05-26T10:00:00.000Z',
            notes: 'UAT temporary grant',
          },
        ] as T[],
      };
    },
  });

  const rows = await service({ clinicId: 'clinic-1' });
  const override = rows.find(
    (row) => row.role === 'nurse' && row.permission_key === 'prescription_write'
  );
  const defaultAdmin = rows.find(
    (row) => row.role === 'admin' && row.permission_key === 'prescription_write'
  );

  assert.equal(override?.default_allowed, false);
  assert.equal(override?.is_allowed, true);
  assert.equal(override?.is_overridden, true);
  assert.equal(defaultAdmin?.default_allowed, true);
  assert.equal(defaultAdmin?.is_allowed, true);
});

test('upsertRolePermission validates permission keys and writes override', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = upsertRolePermission({
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'override-1', permission_key: params?.[2] }] as T[] };
    },
  });

  const row = await service({
    clinicId: 'clinic-1',
    role: 'nurse',
    permissionKey: 'prescription_write',
    isAllowed: true,
    updatedByUserId: 'admin-1',
    notes: 'Allow nurse prescriptions during UAT',
  });

  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'nurse',
    'prescription_write',
    true,
    'admin-1',
    'Allow nurse prescriptions during UAT',
  ]);
  assert.equal((row as { id: string }).id, 'override-1');

  await assert.rejects(
    () =>
      service({
        clinicId: 'clinic-1',
        role: 'nurse',
        permissionKey: 'not_real',
        isAllowed: true,
      }),
    /Unknown permission key/
  );
});
