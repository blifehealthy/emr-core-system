import test from 'node:test';
import assert from 'node:assert/strict';
import { getClinicSettings } from './getClinicSettings.ts';

test('getClinicSettings reads active clinic branding settings', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getClinicSettings({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ clinic_id: 'clinic-1', display_name: 'Clinic' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1' });

  assert.match(calls[0].sql, /FROM clinic_settings/);
  assert.deepEqual(calls[0].params, ['clinic-1']);
  assert.equal((result as { display_name: string }).display_name, 'Clinic');
});
