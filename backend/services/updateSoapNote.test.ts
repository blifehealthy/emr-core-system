import test from 'node:test';
import assert from 'node:assert/strict';
import { updateSoapNote } from './updateSoapNote.ts';

test('updateSoapNote updates a SOAP note by clinical note id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateSoapNote({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ clinical_note_id: 'clinical-note-1', plan: 'updated plan' }] as T[],
      };
    },
  });

  const result = await service({ clinicalNoteId: 'clinical-note-1', plan: 'updated plan' });

  assert.match(calls[0].sql, /UPDATE soap_notes/);
  assert.match(calls[0].sql, /plan = \$2/);
  assert.deepEqual(calls[0].params, ['clinical-note-1', 'updated plan']);
  assert.equal((result as { clinical_note_id: string }).clinical_note_id, 'clinical-note-1');
});

test('updateSoapNote can clear a nullable field with null', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateSoapNote({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ clinical_note_id: 'clinical-note-1', plan: null }] as T[],
      };
    },
  });

  await service({ clinicalNoteId: 'clinical-note-1', plan: null });

  assert.match(calls[0].sql, /plan = \$2/);
  assert.deepEqual(calls[0].params, ['clinical-note-1', null]);
});
