import test from 'node:test';
import assert from 'node:assert/strict';

import { createPatientFlag } from './createPatientFlag.ts';

test('createPatientFlag inserts a new flag row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createPatientFlag({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'flag-1', label: 'Fall risk' }] as T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    flagType: 'fall_risk',
    label: 'Fall risk',
    severity: 'critical',
  });

  assert.match(calls[0].sql, /INSERT INTO patient_flags/);
  assert.deepEqual(calls[0].params, [
    'patient-1',
    'fall_risk',
    'Fall risk',
    null,
    'critical',
    'active',
    null,
    null,
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'flag-1');
});
