import test from 'node:test';
import assert from 'node:assert/strict';

import { getConsentRecordById } from './getConsentRecordById.ts';

test('getConsentRecordById reads an active consent record by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getConsentRecordById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'consent-1', consent_type: 'privacy' }] as T[] };
    },
  });

  const result = await service({ consentId: 'consent-1' });

  assert.match(calls[0].sql, /FROM consent_records/);
  assert.deepEqual(calls[0].params, ['consent-1']);
  assert.equal((result as { id: string }).id, 'consent-1');
});
