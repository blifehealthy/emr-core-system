import test from 'node:test';
import assert from 'node:assert/strict';
import { listDrugInteractionRules } from './listDrugInteractionRules.ts';

test('listDrugInteractionRules builds filtered paginated query and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listDrugInteractionRules({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'rule-1' }, { id: 'rule-2' }] as T[] };
    },
  });

  const result = await service({ clinicId: 'clinic-1', active: 'active', limit: 1, offset: 3 });

  assert.match(calls[0].sql, /FROM drug_interaction_rules/);
  assert.match(calls[0].sql, /is_active IS TRUE/);
  assert.deepEqual(calls[0].params, ['clinic-1', 2, 3]);
  assert.deepEqual(result, {
    rows: [{ id: 'rule-1' }],
    meta: { limit: 1, offset: 3, hasMore: true, nextOffset: 4 },
  });
});
