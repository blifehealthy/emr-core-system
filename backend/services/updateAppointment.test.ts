import test from 'node:test';
import assert from 'node:assert/strict';

import { updateAppointment } from './updateAppointment.ts';

test('updateAppointment patches mutable appointment fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateAppointment({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'appointment-1', status: 'checked_in' }] as T[] };
    },
  });

  const result = await service({
    appointmentId: 'appointment-1',
    status: 'checked_in',
    notes: 'Patient arrived',
  });

  assert.match(calls[0].sql, /UPDATE appointments/);
  assert.deepEqual(calls[0].params, ['appointment-1', 'checked_in', 'Patient arrived']);
  assert.equal((result as { id: string }).id, 'appointment-1');
});
