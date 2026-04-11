import test from 'node:test';
import assert from 'node:assert/strict';

import { listAttachmentsByTarget } from './listAttachmentsByTarget.ts';

test('listAttachmentsByTarget joins attachment links with active file assets', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listAttachmentsByTarget({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'attachment-1', file_asset_id: 'file-1' }] as T[] };
    },
  });

  const result = await service({ targetType: 'consent_record', targetId: 'consent-1' });

  assert.match(calls[0].sql, /FROM attachment_links al/);
  assert.match(calls[0].sql, /INNER JOIN file_assets fa/);
  assert.deepEqual(calls[0].params, ['consent_record', 'consent-1']);
  assert.equal((result[0] as { id: string }).id, 'attachment-1');
});
