import test from 'node:test';
import assert from 'node:assert/strict';

import { listClinicalNoteTemplates } from './listClinicalNoteTemplates.ts';

test('listClinicalNoteTemplates filters by clinic and active status', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listClinicalNoteTemplates({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'template-1', title: 'URI' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', active: true });

  assert.match(calls[0].sql, /FROM clinical_note_templates/);
  assert.match(calls[0].sql, /is_active = \$2/);
  assert.deepEqual(calls[0].params, ['clinic-1', true]);
  assert.equal((result[0] as { id: string }).id, 'template-1');
});
