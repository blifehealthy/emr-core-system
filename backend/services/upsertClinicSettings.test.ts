import test from 'node:test';
import assert from 'node:assert/strict';
import { upsertClinicSettings } from './upsertClinicSettings.ts';

test('upsertClinicSettings inserts or updates clinic branding settings', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = upsertClinicSettings({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ clinic_id: 'clinic-1', display_name: 'Clinic' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', displayName: 'Clinic', phoneNumber: '02' });

  assert.match(calls[0].sql, /ON CONFLICT \(clinic_id\)/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'Clinic', null, '02', null, null, null, null]);
  assert.equal((result as { clinic_id: string }).clinic_id, 'clinic-1');
});
