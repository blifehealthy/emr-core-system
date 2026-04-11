import test from 'node:test';
import assert from 'node:assert/strict';

import { createAttachmentLink } from './createAttachmentLink.ts';

test('createAttachmentLink inserts a new attachment link row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createAttachmentLink({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'attachment-1', target_type: 'patient' }] as T[] };
    },
  });

  const result = await service({
    fileAssetId: 'file-1',
    targetType: 'patient',
    targetId: 'patient-1',
    label: 'ID scan',
  });

  assert.match(calls[0].sql, /INSERT INTO attachment_links/);
  assert.deepEqual(calls[0].params, ['file-1', 'patient', 'patient-1', 'ID scan']);
  assert.equal((result as { id: string }).id, 'attachment-1');
});
