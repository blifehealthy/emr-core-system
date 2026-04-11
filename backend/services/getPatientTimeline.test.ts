import test from 'node:test';
import assert from 'node:assert/strict';
import { getPatientTimeline } from './getPatientTimeline.ts';

test('getPatientTimeline returns timeline events linked to patient records', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPatientTimeline({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'audit-1', entity_type: 'diagnosis' }] as T[] };
    },
  });

  const result = await service({ patientId: 'patient-1' });

  assert.match(calls[0].sql, /FROM audit_logs al/);
  assert.deepEqual(calls[0].params, ['patient-1', 100]);
  assert.equal((result[0] as { id: string }).id, 'audit-1');
});
