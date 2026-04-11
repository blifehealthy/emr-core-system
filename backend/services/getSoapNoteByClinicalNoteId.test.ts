import test from 'node:test';
import assert from 'node:assert/strict';

import { getSoapNoteByClinicalNoteId } from './getSoapNoteByClinicalNoteId.ts';

test('getSoapNoteByClinicalNoteId reads an active SOAP note by clinical note id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getSoapNoteByClinicalNoteId({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ clinical_note_id: 'clinical-note-1', plan: 'updated plan' }] as T[],
      };
    },
  });

  const result = await service({ clinicalNoteId: 'clinical-note-1' });

  assert.match(calls[0].sql, /SELECT/);
  assert.match(calls[0].sql, /FROM soap_notes/);
  assert.deepEqual(calls[0].params, ['clinical-note-1']);
  assert.equal((result as { clinical_note_id: string }).clinical_note_id, 'clinical-note-1');
});
