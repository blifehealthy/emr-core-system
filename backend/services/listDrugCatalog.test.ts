import test from 'node:test';
import assert from 'node:assert/strict';
import { listDrugCatalog } from './listDrugCatalog.ts';

test('listDrugCatalog builds filtered paginated query and meta', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = listDrugCatalog({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'drug-1' }, { id: 'drug-2' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    search: 'amox',
    active: 'active',
    limit: 1,
    offset: 2,
  });

  assert.match(calls[0].sql, /FROM drug_catalog/);
  assert.match(calls[0].sql, /is_active IS TRUE/);
  assert.match(calls[0].sql, /medication_name ILIKE/);
  assert.deepEqual(calls[0].params, ['clinic-1', '%amox%', 2, 2]);
  assert.deepEqual(result, {
    rows: [{ id: 'drug-1' }],
    meta: { limit: 1, offset: 2, hasMore: true, nextOffset: 3 },
  });
});
