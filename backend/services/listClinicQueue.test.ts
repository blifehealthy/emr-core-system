import test from 'node:test';
import assert from 'node:assert/strict';

import { listClinicQueue } from './listClinicQueue.ts';

test('listClinicQueue builds filtered queue query', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listClinicQueue({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'visit-1', patient_first_name: 'Jane' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    status: 'waiting',
    practitionerId: 'practitioner-1',
    roomName: 'Room 1',
    limit: 25,
  });

  assert.match(calls[0].sql, /FROM clinic_visits cv/);
  assert.match(calls[0].sql, /cv.status = \$2/);
  assert.match(calls[0].sql, /cv.practitioner_id = \$3/);
  assert.match(calls[0].sql, /LOWER\(cv.room_name\) = LOWER\(\$4\)/);
  assert.match(calls[0].sql, /ORDER BY cv.checked_in_at ASC/);
  assert.deepEqual(calls[0].params, ['clinic-1', 'waiting', 'practitioner-1', 'Room 1', 25]);
  assert.equal((result[0] as { id: string }).id, 'visit-1');
});
