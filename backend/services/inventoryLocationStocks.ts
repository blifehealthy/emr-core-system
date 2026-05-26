import type { CreateInventoryTransferInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export async function applyInventoryLocationStockChange(
  db: Db,
  input: {
    clinicId: string;
    inventoryItemId: string;
    inventoryLocationId?: string | null;
    binLabel?: string | null;
    quantityDelta: number;
  }
) {
  if (!input.inventoryLocationId || input.quantityDelta === 0) return null;

  const existing = await db.query<{ quantity_on_hand: string }>(
    `
      SELECT quantity_on_hand
      FROM inventory_location_stocks
      WHERE inventory_item_id = $1
        AND inventory_location_id = $2
        AND COALESCE(bin_label, '') = COALESCE($3, '')
        AND deleted_at IS NULL
    `,
    [input.inventoryItemId, input.inventoryLocationId, input.binLabel ?? null]
  );
  const quantityBefore = Number(existing.rows[0]?.quantity_on_hand ?? 0);
  const quantityAfter = Number((quantityBefore + input.quantityDelta).toFixed(2));
  if (quantityAfter < 0) {
    throw new Error('Inventory location quantity cannot go below zero');
  }

  const result = await db.query(
    `
      INSERT INTO inventory_location_stocks (
        clinic_id,
        inventory_item_id,
        inventory_location_id,
        bin_label,
        quantity_on_hand
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (
        inventory_item_id,
        inventory_location_id,
        COALESCE(bin_label, '')
      )
      WHERE deleted_at IS NULL
      DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand
      RETURNING *
    `,
    [
      input.clinicId,
      input.inventoryItemId,
      input.inventoryLocationId,
      input.binLabel ?? null,
      quantityAfter,
    ]
  );

  return result.rows[0] ?? null;
}

export function listInventoryLocationStocks(db: Db) {
  return async function run(input: {
    clinicId: string;
    inventoryItemId?: string;
    inventoryLocationId?: string;
    includeEmpty?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['s.clinic_id = $1', 's.deleted_at IS NULL'];

    if (input.inventoryItemId) {
      params.push(input.inventoryItemId);
      conditions.push(`s.inventory_item_id = $${params.length}`);
    }
    if (input.inventoryLocationId) {
      params.push(input.inventoryLocationId);
      conditions.push(`s.inventory_location_id = $${params.length}`);
    }
    if (!input.includeEmpty) {
      conditions.push('s.quantity_on_hand > 0');
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          s.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          loc.location_code AS inventory_location_code,
          loc.display_name AS inventory_location_display_name,
          (s.quantity_on_hand <= s.reorder_level) AS low_stock
        FROM inventory_location_stocks s
        JOIN inventory_items i ON i.id = s.inventory_item_id
        JOIN inventory_locations loc ON loc.id = s.inventory_location_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY loc.display_name ASC, i.display_name ASC, s.bin_label ASC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `,
      params
    );
    const rows = result.rows.slice(0, limit);

    return {
      rows,
      meta: {
        limit,
        offset,
        hasMore: result.rows.length > limit,
        nextOffset: result.rows.length > limit ? offset + limit : null,
      },
    };
  };
}

export function listInventoryTransfers(db: Db) {
  return async function run(input: {
    clinicId: string;
    inventoryItemId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['t.clinic_id = $1', 't.deleted_at IS NULL'];

    if (input.inventoryItemId) {
      params.push(input.inventoryItemId);
      conditions.push(`t.inventory_item_id = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          t.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          from_loc.display_name AS from_inventory_location_display_name,
          from_loc.location_code AS from_inventory_location_code,
          to_loc.display_name AS to_inventory_location_display_name,
          to_loc.location_code AS to_inventory_location_code
        FROM inventory_transfers t
        JOIN inventory_items i ON i.id = t.inventory_item_id
        JOIN inventory_locations from_loc ON from_loc.id = t.from_inventory_location_id
        JOIN inventory_locations to_loc ON to_loc.id = t.to_inventory_location_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY t.transferred_at DESC, t.created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `,
      params
    );
    const rows = result.rows.slice(0, limit);

    return {
      rows,
      meta: {
        limit,
        offset,
        hasMore: result.rows.length > limit,
        nextOffset: result.rows.length > limit ? offset + limit : null,
      },
    };
  };
}

export function createInventoryTransfer(db: Db) {
  return async function run(input: CreateInventoryTransferInput) {
    if (input.fromInventoryLocationId === input.toInventoryLocationId) {
      throw new Error('Transfer locations must be different');
    }

    const item = await db.query<{ id: string; clinic_id: string; quantity_on_hand: string }>(
      `
        SELECT id, clinic_id, quantity_on_hand
        FROM inventory_items
        WHERE id = $1
          AND clinic_id = $2
          AND deleted_at IS NULL
      `,
      [input.inventoryItemId, input.clinicId]
    );
    if (!item.rows[0]) return null;

    const quantity = Number(input.quantity);
    await applyInventoryLocationStockChange(db, {
      clinicId: input.clinicId,
      inventoryItemId: input.inventoryItemId,
      inventoryLocationId: input.fromInventoryLocationId,
      binLabel: input.fromBinLabel ?? null,
      quantityDelta: -quantity,
    });
    await applyInventoryLocationStockChange(db, {
      clinicId: input.clinicId,
      inventoryItemId: input.inventoryItemId,
      inventoryLocationId: input.toInventoryLocationId,
      binLabel: input.toBinLabel ?? null,
      quantityDelta: quantity,
    });

    const transferResult = await db.query<{ id: string }>(
      `
        INSERT INTO inventory_transfers (
          clinic_id,
          inventory_item_id,
          from_inventory_location_id,
          to_inventory_location_id,
          from_bin_label,
          to_bin_label,
          quantity,
          transferred_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
      [
        input.clinicId,
        input.inventoryItemId,
        input.fromInventoryLocationId,
        input.toInventoryLocationId,
        input.fromBinLabel ?? null,
        input.toBinLabel ?? null,
        quantity,
        input.transferredByUserId ?? null,
        input.notes ?? null,
      ]
    );

    const transferId = transferResult.rows[0].id;
    const quantityBefore = Number(item.rows[0].quantity_on_hand);
    await db.query(
      `
        INSERT INTO stock_movements (
          clinic_id,
          inventory_item_id,
          inventory_location_id,
          movement_type,
          quantity,
          quantity_before,
          quantity_after,
          reason,
          bin_label,
          performed_by_user_id
        )
        VALUES
          ($1, $2, $3, 'adjustment_out', $5, $6, $6, $7, $8, $9),
          ($1, $2, $4, 'adjustment_in', $5, $6, $6, $7, $10, $9)
      `,
      [
        input.clinicId,
        input.inventoryItemId,
        input.fromInventoryLocationId,
        input.toInventoryLocationId,
        quantity,
        quantityBefore,
        input.notes ?? `Inventory transfer ${transferId}`,
        input.fromBinLabel ?? null,
        input.transferredByUserId ?? null,
        input.toBinLabel ?? null,
      ]
    );

    const transfer = await listInventoryTransfers(db)({
      clinicId: input.clinicId,
      inventoryItemId: input.inventoryItemId,
      limit: 1,
      offset: 0,
    });

    return transfer.rows.find((row) => (row as { id?: string }).id === transferId) ?? null;
  };
}
