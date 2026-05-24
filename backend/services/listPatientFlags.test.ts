import test from 'node:test';
import assert from 'node:assert/strict';

import { listPatientFlags } from './listPatientFlags.ts';

test('listPatientFlags reads active flags with optional filters', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listPatientFlags({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'flag-1' }] as T[] };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    status: 'active',
    severity: 'critical',
  });

  assert.match(calls[0].sql, /FROM patient_flags/);
  assert.match(calls[0].sql, /status = \$2/);
  assert.match(calls[0].sql, /severity = \$3/);
  assert.deepEqual(calls[0].params, ['patient-1', 'active', 'critical']);
  assert.equal((result[0] as { id: string }).id, 'flag-1');
});
