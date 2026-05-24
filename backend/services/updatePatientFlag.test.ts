import test from 'node:test';
import assert from 'node:assert/strict';

import { updatePatientFlag } from './updatePatientFlag.ts';

test('updatePatientFlag updates only provided fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updatePatientFlag({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'flag-1', status: 'resolved' }] as T[] };
    },
  });

  const result = await service({
    flagId: 'flag-1',
    status: 'resolved',
    notes: 'Risk reviewed',
  });

  assert.match(calls[0].sql, /UPDATE patient_flags/);
  assert.match(calls[0].sql, /status = \$2/);
  assert.match(calls[0].sql, /notes = \$3/);
  assert.deepEqual(calls[0].params, ['flag-1', 'resolved', 'Risk reviewed']);
  assert.equal((result as { id: string }).id, 'flag-1');
});
