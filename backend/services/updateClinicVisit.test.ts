import test from 'node:test';
import assert from 'node:assert/strict';

import { updateClinicVisit } from './updateClinicVisit.ts';

test('updateClinicVisit sets lifecycle status timestamps', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateClinicVisit({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'visit-1', status: 'with_doctor' }] as T[] };
    },
  });

  const result = await service({
    visitId: 'visit-1',
    status: 'with_doctor',
    roomName: 'Room 2',
  });

  assert.match(calls[0].sql, /status = \$2/);
  assert.match(calls[0].sql, /started_at = COALESCE\(started_at, NOW\(\)\)/);
  assert.match(calls[0].sql, /room_name = \$3/);
  assert.deepEqual(calls[0].params, ['visit-1', 'with_doctor', 'Room 2']);
  assert.equal((result as { status: string }).status, 'with_doctor');
});
