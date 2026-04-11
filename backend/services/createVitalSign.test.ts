import test from 'node:test';
import assert from 'node:assert/strict';

import { createVitalSign } from './createVitalSign.ts';

test('createVitalSign inserts a vital sign with expected params', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createVitalSign({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1', heart_rate_bpm: 88 }] as T[],
      };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    clinicalNoteId: 'clinical-note-1',
    measuredByPractitionerId: 'practitioner-1',
    heartRateBpm: 88,
    oxygenSaturationPct: 99,
    notes: 'Stable',
  });

  assert.match(calls[0].sql, /INSERT INTO vital_signs/);
  assert.deepEqual(calls[0].params, [
    'encounter-1',
    'clinical-note-1',
    null,
    'practitioner-1',
    null,
    88,
    null,
    null,
    null,
    99,
    null,
    null,
    null,
    null,
    'Stable',
  ]);
  assert.equal((result as { id: string }).id, 'vital-sign-1');
});
