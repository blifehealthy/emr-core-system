import test from 'node:test';
import assert from 'node:assert/strict';

import { getPrescriptionById } from './getPrescriptionById.ts';

test('getPrescriptionById reads an active prescription by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = getPrescriptionById({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'prescription-1', medication_name: 'Amoxicillin' }] as T[],
      };
    },
  });

  const result = await service({ prescriptionId: 'prescription-1' });

  assert.match(calls[0].sql, /SELECT/);
  assert.match(calls[0].sql, /FROM prescriptions/);
  assert.deepEqual(calls[0].params, ['prescription-1']);
  assert.equal((result as { id: string }).id, 'prescription-1');
});
