import test from 'node:test';
import assert from 'node:assert/strict';
import { updateVitalSign } from './updateVitalSign.ts';

test('updateVitalSign updates a vital sign by id', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateVitalSign({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1', heart_rate_bpm: 88 }] as T[],
      };
    },
  });

  const result = await service({ vitalSignId: 'vital-sign-1', heartRateBpm: 88 });

  assert.match(calls[0].sql, /UPDATE vital_signs/);
  assert.match(calls[0].sql, /heart_rate_bpm = \$2/);
  assert.deepEqual(calls[0].params, ['vital-sign-1', 88]);
  assert.equal((result as { id: string }).id, 'vital-sign-1');
});

test('updateVitalSign can clear nullable fields with null', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateVitalSign({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [{ id: 'vital-sign-1', notes: null }] as T[],
      };
    },
  });

  await service({ vitalSignId: 'vital-sign-1', notes: null });

  assert.match(calls[0].sql, /notes = \$2/);
  assert.deepEqual(calls[0].params, ['vital-sign-1', null]);
});
