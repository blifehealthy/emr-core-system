import test from 'node:test';
import assert from 'node:assert/strict';

import { listAppointments } from './listAppointments.ts';

test('listAppointments reads active appointments with optional filters', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listAppointments({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'appointment-1' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    practitionerId: 'practitioner-1',
    status: 'confirmed',
  });

  assert.match(calls[0].sql, /FROM appointments/);
  assert.match(calls[0].sql, /deleted_at IS NULL/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'patient-1', 'practitioner-1', 'confirmed']);
  assert.equal((result[0] as { id: string }).id, 'appointment-1');
});
