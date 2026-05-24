import test from 'node:test';
import assert from 'node:assert/strict';

import { createClinicalNoteTemplate } from './createClinicalNoteTemplate.ts';

test('createClinicalNoteTemplate inserts clinic-managed template', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createClinicalNoteTemplate({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'template-1', template_key: 'uri' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    templateKey: 'uri',
    title: 'URI',
    subjective: 'Cough',
  });

  assert.match(calls[0].sql, /INSERT INTO clinical_note_templates/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'uri',
    'URI',
    null,
    'Cough',
    null,
    null,
    null,
    true,
  ]);
  assert.equal((result as { id: string }).id, 'template-1');
});
