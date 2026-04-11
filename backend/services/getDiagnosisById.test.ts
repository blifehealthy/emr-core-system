import test from 'node:test';
import assert from 'node:assert/strict';

import { getDiagnosisById } from './getDiagnosisById.ts';

test('getDiagnosisById reads an active diagnosis by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getDiagnosisById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1', diagnosis_name: 'Hypertension' }] as T[],
      };
    },
  });

  const result = await service({ diagnosisId: 'diagnosis-1' });

  assert.match(calls[0].sql, /SELECT/);
  assert.match(calls[0].sql, /FROM diagnoses/);
  assert.deepEqual(calls[0].params, ['diagnosis-1']);
  assert.equal((result as { id: string }).id, 'diagnosis-1');
});
