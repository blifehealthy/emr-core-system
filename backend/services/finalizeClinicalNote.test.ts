import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeClinicalNote } from './finalizeClinicalNote.ts';

test('finalizeClinicalNote updates note status to final', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = finalizeClinicalNote({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'clinical-note-1', status: 'final' }] as T[] };
    },
  });

  const result = await service({ clinicalNoteId: 'clinical-note-1' });

  assert.match(calls[0].sql, /UPDATE clinical_notes/);
  assert.equal((result as { id: string }).id, 'clinical-note-1');
});
