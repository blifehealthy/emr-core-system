import test from 'node:test';
import assert from 'node:assert/strict';

import { softDeleteSoapNote } from './softDeleteSoapNote.ts';

test('softDeleteSoapNote marks a SOAP note deleted by clinical note id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = softDeleteSoapNote({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            clinical_note_id: 'clinical-note-1',
            deleted_at: '2026-01-01T00:00:00.000Z',
          },
        ] as T[],
      };
    },
  });

  const result = await service({ clinicalNoteId: 'clinical-note-1' });

  assert.match(calls[0].sql, /UPDATE soap_notes/);
  assert.match(calls[0].sql, /SET deleted_at = COALESCE\(deleted_at, NOW\(\)\)/);
  assert.deepEqual(calls[0].params, ['clinical-note-1']);
  assert.equal((result as { clinical_note_id: string }).clinical_note_id, 'clinical-note-1');
});
