import test from 'node:test';
import assert from 'node:assert/strict';

import { assertInventoryLotPickAllowed } from './inventoryLotPicking.ts';

test('assertInventoryLotPickAllowed blocks expired lots without override reason', async () => {
  const db = {
    async query<T = unknown>(sql: string) {
      if (sql.includes('WHERE id = $1')) {
        return {
          rows: [
            {
              id: 'lot-expired',
              lot_number: 'OLD',
              expires_on: '2026-01-01',
              inventory_location_id: 'loc-1',
              bin_label: 'A1',
              quantity_on_hand: '5',
              expired: true,
            },
          ] as T[],
        };
      }
      return { rows: [] as T[] };
    },
  };

  await assert.rejects(
    () =>
      assertInventoryLotPickAllowed(db, {
        clinicId: 'clinic-1',
        inventoryItemId: 'item-1',
        inventoryLotId: 'lot-expired',
        quantity: 1,
      }),
    /expiryOverrideReason is required/
  );
});

test('assertInventoryLotPickAllowed requires FEFO override when earlier lot has stock', async () => {
  const db = {
    async query<T = unknown>(sql: string) {
      if (sql.includes('WHERE id = $1')) {
        return {
          rows: [
            {
              id: 'lot-late',
              lot_number: 'LATE',
              expires_on: '2027-12-31',
              inventory_location_id: 'loc-1',
              bin_label: 'A1',
              quantity_on_hand: '5',
              expired: false,
            },
          ] as T[],
        };
      }
      if (sql.includes('FROM inventory_lots l')) {
        return { rows: [{ id: 'lot-early', lot_number: 'EARLY' }] as T[] };
      }
      return { rows: [] as T[] };
    },
  };

  await assert.rejects(
    () =>
      assertInventoryLotPickAllowed(db, {
        clinicId: 'clinic-1',
        inventoryItemId: 'item-1',
        inventoryLotId: 'lot-late',
        quantity: 1,
        inventoryLocationId: 'loc-1',
        binLabel: 'A1',
      }),
    /FEFO recommended lot is EARLY/
  );

  const allowed = await assertInventoryLotPickAllowed(db, {
    clinicId: 'clinic-1',
    inventoryItemId: 'item-1',
    inventoryLotId: 'lot-late',
    quantity: 1,
    inventoryLocationId: 'loc-1',
    binLabel: 'A1',
    fefoOverrideReason: 'Clinical exception',
  });
  assert.equal(allowed?.fefoRecommendedLotId, 'lot-early');
});
