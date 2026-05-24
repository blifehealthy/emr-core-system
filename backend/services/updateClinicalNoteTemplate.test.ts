import test from 'node:test';
import assert from 'node:assert/strict';

import { updateClinicalNoteTemplate } from './updateClinicalNoteTemplate.ts';

test('updateClinicalNoteTemplate patches selected fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateClinicalNoteTemplate({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'template-1', is_active: false }] as T[] };
    },
  });

  const result = await service({
    templateId: 'template-1',
    title: 'URI follow up',
    isActive: false,
  });

  assert.match(calls[0].sql, /UPDATE clinical_note_templates/);
  assert.match(calls[0].sql, /title = \$2/);
  assert.match(calls[0].sql, /is_active = \$3/);
  assert.deepEqual(calls[0].params, ['template-1', 'URI follow up', false]);
  assert.equal((result as { id: string }).id, 'template-1');
});
