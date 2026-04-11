import test from 'node:test';
import assert from 'node:assert/strict';

import { listVitalSignsByEncounter } from './listVitalSignsByEncounter.ts';

test('listVitalSignsByEncounter builds filtered paginated query and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listVitalSignsByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1' }, { id: 'vital-sign-2' }, { id: 'vital-sign-3' }] as T[],
      };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    clinicalNoteId: 'clinical-note-1',
    limit: 2,
    offset: 6,
  });

  assert.match(calls[0].sql, /FROM vital_signs/);
  assert.match(calls[0].sql, /clinical_note_id = \$2/);
  assert.match(calls[0].sql, /ORDER BY measured_at DESC, created_at DESC/);
  assert.match(calls[0].sql, /LIMIT \$3/);
  assert.match(calls[0].sql, /OFFSET \$4/);
  assert.deepEqual(calls[0].params, ['encounter-1', 'clinical-note-1', 3, 6]);
  assert.deepEqual(result, {
    rows: [{ id: 'vital-sign-1' }, { id: 'vital-sign-2' }],
    meta: { limit: 2, offset: 6, hasMore: true, nextOffset: 8 },
  });
});

test('listVitalSignsByEncounter uses default pagination when filters are omitted', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listVitalSignsByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'vital-sign-1' }] as T[] };
    },
  });

  const result = await service({ encounterId: 'encounter-1' });

  assert.deepEqual(calls[0].params, ['encounter-1', 51, 0]);
  assert.deepEqual(result.meta, {
    limit: 50,
    offset: 0,
    hasMore: false,
    nextOffset: null,
  });
});
