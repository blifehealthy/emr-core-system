import test from 'node:test';
import assert from 'node:assert/strict';

import { listConsentRecordsByPatient } from './listConsentRecordsByPatient.ts';

test('listConsentRecordsByPatient reads active consent records with optional status filter', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listConsentRecordsByPatient({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'consent-1' }] as T[] };
    },
  });

  const result = await service({ patientId: 'patient-1', status: 'granted' });

  assert.match(calls[0].sql, /FROM consent_records/);
  assert.deepEqual(calls[0].params, ['patient-1', 'granted']);
  assert.equal((result[0] as { id: string }).id, 'consent-1');
});
