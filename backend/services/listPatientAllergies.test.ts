import test from 'node:test';
import assert from 'node:assert/strict';

import { listPatientAllergies } from './listPatientAllergies.ts';

test('listPatientAllergies reads active allergies with optional status filter', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPatientAllergies({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'allergy-1' }] as T[] };
    },
  });

  const result = await service({ patientId: 'patient-1', status: 'active' });

  assert.match(calls[0].sql, /FROM patient_allergies/);
  assert.deepEqual(calls[0].params, ['patient-1', 'active']);
  assert.equal((result[0] as { id: string }).id, 'allergy-1');
});
