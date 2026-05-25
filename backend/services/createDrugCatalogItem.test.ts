import test from 'node:test';
import assert from 'node:assert/strict';
import { createDrugCatalogItem } from './createDrugCatalogItem.ts';

test('createDrugCatalogItem inserts a catalog row with allergen tags', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const service = createDrugCatalogItem({
    async query<T>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'drug-1', medication_name: 'Amoxicillin' }] as T[] };
    },
  });

  const result = await service({
    clinicId: 'clinic-1',
    medicationName: 'Amoxicillin',
    rxnormCode: 'RX-1',
    genericName: 'amoxicillin',
    allergenTags: ['penicillin'],
  });

  assert.match(calls[0].sql, /INSERT INTO drug_catalog/);
  assert.deepEqual(calls[0].params, [
    'clinic-1',
    'Amoxicillin',
    'RX-1',
    'amoxicillin',
    null,
    null,
    null,
    ['penicillin'],
    true,
  ]);
  assert.equal((result as { id: string }).id, 'drug-1');
});
