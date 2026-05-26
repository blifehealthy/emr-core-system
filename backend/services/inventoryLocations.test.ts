import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInventoryLocation,
  listInventoryLocations,
  updateInventoryLocation,
} from './inventoryLocations.ts';

test('listInventoryLocations filters active locations and paginates', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'loc-1' }, { id: 'loc-2' }] as T[] };
    },
  };

  const result = await listInventoryLocations(db)({
    clinicId: 'clinic-1',
    active: 'active',
    limit: 1,
    offset: 3,
  });

  assert.equal(result.rows.length, 1);
  assert.equal(result.meta.hasMore, true);
  assert.match(calls[0].sql, /is_active IS TRUE/);
  assert.deepEqual(calls[0].params, ['clinic-1', 2, 3]);
});

test('createInventoryLocation clears clinic default before inserting default', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO inventory_locations')) {
        return { rows: [{ id: 'loc-1', is_default: params?.[4] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const location = await createInventoryLocation(db)({
    clinicId: 'clinic-1',
    locationCode: 'PHARM',
    displayName: 'Main Pharmacy',
    isDefault: true,
  });

  assert.match(calls[0].sql, /UPDATE inventory_locations/);
  assert.equal((location as { is_default: boolean }).is_default, true);
});

test('updateInventoryLocation clears other defaults before updating', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT clinic_id')) {
        return { rows: [{ clinic_id: 'clinic-1' }] as T[] };
      }
      if (sql.includes('UPDATE inventory_locations') && sql.includes('RETURNING *')) {
        return { rows: [{ id: 'loc-1', is_default: params?.[1] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const location = await updateInventoryLocation(db)({
    locationId: 'loc-1',
    isDefault: true,
  });

  assert.match(calls[1].sql, /id <> \$2/);
  assert.equal((location as { is_default: boolean }).is_default, true);
});
