import test from 'node:test';
import assert from 'node:assert/strict';

import { createClinicVisit } from './createClinicVisit.ts';

test('createClinicVisit inserts a waiting queue record', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createClinicVisit({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'visit-1', status: 'waiting' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    appointmentId: 'appointment-1',
    practitionerId: 'practitioner-1',
    visitNumber: 'VIS-001',
    queueLabel: 'Q1',
  });

  assert.match(calls[0].sql, /INSERT INTO clinic_visits/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'patient-1',
    'appointment-1',
    'practitioner-1',
    'VIS-001',
    'waiting',
    'Q1',
    null,
    null,
  ]);
  assert.equal((result as { id: string }).id, 'visit-1');
});
