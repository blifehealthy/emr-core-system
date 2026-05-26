import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInventoryPrinterProfile,
  listInventoryPrinterProfiles,
  updateInventoryPrinterProfile,
} from './inventoryPrinterProfiles.ts';

test('listInventoryPrinterProfiles filters by clinic and active state', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return { rows: [{ id: 'profile-1' }, { id: 'profile-2' }] as T[] };
    },
  };

  const result = await listInventoryPrinterProfiles(db)({
    clinicId: 'clinic-1',
    active: 'active',
    limit: 1,
    offset: 2,
  });

  assert.equal(result.rows.length, 1);
  assert.equal(result.meta.hasMore, true);
  assert.match(calls[0].sql, /is_active IS TRUE/);
  assert.deepEqual(calls[0].params, ['clinic-1', 2, 2]);
});

test('createInventoryPrinterProfile clears existing default when requested', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('INSERT INTO inventory_printer_profiles')) {
        return { rows: [{ id: 'profile-1', is_default: params?.[6] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const profile = await createInventoryPrinterProfile(db)({
    clinicId: 'clinic-1',
    profileName: 'Pharmacy ZPL',
    isDefault: true,
  });

  assert.match(calls[0].sql, /UPDATE inventory_printer_profiles/);
  assert.equal((profile as { is_default: boolean }).is_default, true);
});

test('updateInventoryPrinterProfile clears other defaults before updating', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      if (sql.includes('SELECT clinic_id')) {
        return { rows: [{ clinic_id: 'clinic-1' }] as T[] };
      }
      if (sql.includes('UPDATE inventory_printer_profiles') && sql.includes('RETURNING *')) {
        return { rows: [{ id: 'profile-1', is_default: params?.[1] }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  const profile = await updateInventoryPrinterProfile(db)({
    profileId: 'profile-1',
    isDefault: true,
  });

  assert.match(calls[1].sql, /id <> \$2/);
  assert.equal((profile as { is_default: boolean }).is_default, true);
});
