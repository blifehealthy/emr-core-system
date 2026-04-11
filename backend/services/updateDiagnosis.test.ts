import test from 'node:test';
import assert from 'node:assert/strict';
import { updateDiagnosis } from './updateDiagnosis.ts';

test('updateDiagnosis updates a diagnosis by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateDiagnosis({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1', diagnosis_name: 'Updated diagnosis' }] as T[],
      };
    },
  });

  const result = await service({ diagnosisId: 'diagnosis-1', diagnosisName: 'Updated diagnosis' });

  assert.match(calls[0].sql, /UPDATE diagnoses/);
  assert.match(calls[0].sql, /diagnosis_name = \$2/);
  assert.deepEqual(calls[0].params, ['diagnosis-1', 'Updated diagnosis']);
  assert.equal((result as { id: string }).id, 'diagnosis-1');
});

test('updateDiagnosis can clear nullable fields with null', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateDiagnosis({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'diagnosis-1', notes: null }] as T[],
      };
    },
  });

  await service({ diagnosisId: 'diagnosis-1', notes: null });

  assert.match(calls[0].sql, /notes = \$2/);
  assert.deepEqual(calls[0].params, ['diagnosis-1', null]);
});
