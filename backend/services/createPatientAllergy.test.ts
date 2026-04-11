import test from 'node:test';
import assert from 'node:assert/strict';

import { createPatientAllergy } from './createPatientAllergy.ts';

test('createPatientAllergy inserts a new allergy row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createPatientAllergy({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'allergy-1', allergen_name: 'Peanuts' }] as T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    allergenName: 'Peanuts',
    severity: 'severe',
    status: 'active',
  });

  assert.match(calls[0].sql, /INSERT INTO patient_allergies/);
  assert.deepEqual(calls[0].params, [
    'patient-1',
    'Peanuts',
    null,
    null,
    'severe',
    'active',
    null,
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'allergy-1');
});
