import test from 'node:test';
import assert from 'node:assert/strict';

import { updateConsentRecord } from './updateConsentRecord.ts';

test('updateConsentRecord patches mutable consent fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateConsentRecord({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'consent-1', status: 'revoked' }] as T[] };
    },
  });

  const result = await service({
    consentId: 'consent-1',
    status: 'revoked',
    revokedAt: '2026-01-11T10:00:00.000Z',
  });

  assert.match(calls[0].sql, /UPDATE consent_records/);
  assert.deepEqual(calls[0].params, ['consent-1', 'revoked', '2026-01-11T10:00:00.000Z']);
  assert.equal((result as { id: string }).id, 'consent-1');
});
