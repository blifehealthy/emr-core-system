import test from 'node:test';
import assert from 'node:assert/strict';

import { listDiagnosesByEncounter } from './listDiagnosesByEncounter.ts';

test('listDiagnosesByEncounter builds filtered paginated query and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listDiagnosesByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1' }, { id: 'diagnosis-2' }, { id: 'diagnosis-3' }] as T[],
      };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    clinicalNoteId: 'clinical-note-1',
    status: 'active',
    limit: 2,
    offset: 10,
  });

  assert.match(calls[0].sql, /FROM diagnoses/);
  assert.match(calls[0].sql, /clinical_note_id = \$2/);
  assert.match(calls[0].sql, /status = \$3/);
  assert.match(calls[0].sql, /ORDER BY sequence_number ASC NULLS LAST, created_at DESC/);
  assert.match(calls[0].sql, /LIMIT \$4/);
  assert.match(calls[0].sql, /OFFSET \$5/);
  assert.deepEqual(calls[0].params, ['encounter-1', 'clinical-note-1', 'active', 3, 10]);
  assert.deepEqual(result, {
    rows: [{ id: 'diagnosis-1' }, { id: 'diagnosis-2' }],
    meta: { limit: 2, offset: 10, hasMore: true, nextOffset: 12 },
  });
});

test('listDiagnosesByEncounter uses default pagination when filters are omitted', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listDiagnosesByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'diagnosis-1' }] as T[] };
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
