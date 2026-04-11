import test from 'node:test';
import assert from 'node:assert/strict';

import { createConsentRecord } from './createConsentRecord.ts';

test('createConsentRecord inserts a new consent record row', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createConsentRecord({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'consent-1', consent_type: 'telemedicine' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    consentType: 'telemedicine',
    status: 'granted',
    grantedAt: '2026-01-10T09:00:00.000Z',
    documentReference: 'doc://consent-1',
  });

  assert.match(calls[0].sql, /INSERT INTO consent_records/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'patient-1',
    'telemedicine',
    'granted',
    '2026-01-10T09:00:00.000Z',
    null,
    null,
    null,
    'doc://consent-1',
    null,
  ]);
  assert.equal((result as { id: string }).id, 'consent-1');
});
