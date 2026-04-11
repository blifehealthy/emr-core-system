import test from 'node:test';
import assert from 'node:assert/strict';

import { createAppointment } from './createAppointment.ts';

test('createAppointment inserts a new appointment row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createAppointment({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'appointment-1', appointment_number: 'APT-001' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    practitionerId: 'practitioner-1',
    appointmentNumber: 'APT-001',
    status: 'confirmed',
    scheduledStartAt: '2026-01-10T09:00:00.000Z',
    scheduledEndAt: '2026-01-10T09:30:00.000Z',
    reason: 'Follow-up',
    notes: 'Morning slot',
  });

  assert.match(calls[0].sql, /INSERT INTO appointments/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'patient-1',
    'practitioner-1',
    'APT-001',
    'confirmed',
    '2026-01-10T09:00:00.000Z',
    '2026-01-10T09:30:00.000Z',
    'Follow-up',
    'Morning slot',
  ]);
  assert.equal((result as { id: string }).id, 'appointment-1');
});
