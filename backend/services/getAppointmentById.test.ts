import test from 'node:test';
import assert from 'node:assert/strict';

import { getAppointmentById } from './getAppointmentById.ts';

test('getAppointmentById reads an active appointment by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getAppointmentById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'appointment-1', status: 'pending' }] as T[] };
    },
  });

  const result = await service({ appointmentId: 'appointment-1' });

  assert.match(calls[0].sql, /SELECT/);
  assert.match(calls[0].sql, /FROM appointments/);
  assert.deepEqual(calls[0].params, ['appointment-1']);
  assert.equal((result as { id: string }).id, 'appointment-1');
});
