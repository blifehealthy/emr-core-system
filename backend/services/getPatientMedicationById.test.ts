import test from 'node:test';
import assert from 'node:assert/strict';

import { getPatientMedicationById } from './getPatientMedicationById.ts';

test('getPatientMedicationById reads an active medication by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPatientMedicationById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'medication-1', medication_name: 'Metformin' }] as T[] };
    },
  });

  const result = await service({ medicationId: 'medication-1' });

  assert.match(calls[0].sql, /FROM patient_medications/);
  assert.deepEqual(calls[0].params, ['medication-1']);
  assert.equal((result as { id: string }).id, 'medication-1');
});
