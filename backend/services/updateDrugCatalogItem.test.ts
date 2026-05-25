import test from 'node:test';
import assert from 'node:assert/strict';
import { updateDrugCatalogItem } from './updateDrugCatalogItem.ts';

test('updateDrugCatalogItem patches mutable catalog fields', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = updateDrugCatalogItem({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'drug-1', is_active: false }] as T[] };
    },
  });

  const result = await service({
    drugCatalogId: 'drug-1',
    allergenTags: ['nsaid'],
    isActive: false,
  });

  assert.match(calls[0].sql, /UPDATE drug_catalog/);
  assert.match(calls[0].sql, /allergen_tags = \$2/);
  assert.match(calls[0].sql, /is_active = \$3/);
  assert.deepEqual(calls[0].params, ['drug-1', ['nsaid'], false]);
  assert.equal((result as { id: string }).id, 'drug-1');
});
