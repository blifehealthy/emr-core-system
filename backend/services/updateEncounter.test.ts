import test from 'node:test';
import assert from 'node:assert/strict';

import { updateEncounter } from './updateEncounter.ts';

test('updateEncounter patches mutable encounter fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'encounter-1', status: 'completed' }] as T[] };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    status: 'completed',
    attendingPractitionerId: 'practitioner-1',
    endedAt: '2026-01-10T10:00:00.000Z',
  });

  assert.match(calls[0].sql, /UPDATE encounters/);
  assert.deepEqual(calls[0].params, [
    'encounter-1',
    'completed',
    'practitioner-1',
    '2026-01-10T10:00:00.000Z',
  ]);
  assert.equal((result as { id: string }).id, 'encounter-1');
});
