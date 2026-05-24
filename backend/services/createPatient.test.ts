import test from 'node:test';
import assert from 'node:assert/strict';

import { createPatient } from './createPatient.ts';

test('createPatient inserts a new patient row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createPatient({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'patient-1', medical_record_number: 'MRN-001' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    medicalRecordNumber: 'MRN-001',
    firstName: 'Jane',
    lastName: 'Doe',
    sexAtBirth: 'female',
  });

  assert.match(calls[0].sql, /INSERT INTO patients/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'MRN-001',
    null,
    'Jane',
    null,
    'Doe',
    null,
    null,
    'female',
    null,
    null,
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'patient-1');
});
