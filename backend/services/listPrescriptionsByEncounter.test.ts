import test from 'node:test';
import assert from 'node:assert/strict';

import { listPrescriptionsByEncounter } from './listPrescriptionsByEncounter.ts';

test('listPrescriptionsByEncounter builds filtered paginated query and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPrescriptionsByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'prescription-1' }, { id: 'prescription-2' }, { id: 'prescription-3' }] as T[],
      };
    },
  });

  const result = await service({
    encounterId: 'encounter-1',
    clinicalNoteId: 'clinical-note-1',
    status: 'active',
    limit: 2,
    offset: 4,
  });

  assert.match(calls[0].sql, /FROM prescriptions/);
  assert.match(calls[0].sql, /clinical_note_id = \$2/);
  assert.match(calls[0].sql, /status = \$3/);
  assert.match(calls[0].sql, /LIMIT \$4/);
  assert.match(calls[0].sql, /OFFSET \$5/);
  assert.deepEqual(calls[0].params, ['encounter-1', 'clinical-note-1', 'active', 3, 4]);
  assert.deepEqual(result, {
    rows: [{ id: 'prescription-1' }, { id: 'prescription-2' }],
    meta: { limit: 2, offset: 4, hasMore: true, nextOffset: 6 },
  });
});

test('listPrescriptionsByEncounter uses default pagination when limit and offset are omitted', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPrescriptionsByEncounter({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'prescription-1' }] as T[] };
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
