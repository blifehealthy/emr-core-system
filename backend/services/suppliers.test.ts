import test from 'node:test';
import assert from 'node:assert/strict';
import { createSupplier, updateSupplier } from './suppliers.ts';

test('createSupplier inserts supplier master data', async () => {
  const calls: Array<{ sql: string; params?: unknown[] }> = [];
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      calls.push({ sql, params });
      return {
        rows: [
          {
            id: 'supplier-1',
            clinic_id: params?.[0],
            supplier_code: params?.[1],
            display_name: params?.[2],
            status: params?.[7],
          },
        ] as T[],
      };
    },
  };

  const supplier = await createSupplier(db)({
    clinicId: 'clinic-1',
    supplierCode: 'SUP-1',
    displayName: 'Main Supplier',
  });

  assert.equal((supplier as { supplier_code: string }).supplier_code, 'SUP-1');
  assert.match(calls[0].sql, /INSERT INTO suppliers/);
  assert.equal(calls[0].params?.[7], 'active');
});

test('updateSupplier updates only provided fields', async () => {
  const db = {
    async query<T = unknown>(sql: string, params?: unknown[]) {
      assert.match(sql, /UPDATE suppliers/);
      assert.deepEqual(params, ['supplier-1', 'Renamed Supplier', 'inactive']);
      return { rows: [{ id: 'supplier-1', display_name: 'Renamed Supplier', status: 'inactive' }] as T[] };
    },
  };

  const supplier = await updateSupplier(db)({
    supplierId: 'supplier-1',
    displayName: 'Renamed Supplier',
    status: 'inactive',
  });

  assert.equal((supplier as { status: string }).status, 'inactive');
});
