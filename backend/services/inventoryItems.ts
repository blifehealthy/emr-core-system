import type {
  AdjustInventoryStockInput,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from '../api/types.ts';

export function listInventoryItems(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    search?: string;
    active?: 'active' | 'inactive' | 'all';
    lowStock?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['i.clinic_id = $1', 'i.deleted_at IS NULL'];

    if (input.active === 'active') {
      conditions.push('i.is_active IS TRUE');
    } else if (input.active === 'inactive') {
      conditions.push('i.is_active IS FALSE');
    }

    if (input.lowStock) {
      conditions.push('i.quantity_on_hand <= i.reorder_level');
    }

    if (input.search) {
      params.push(`%${input.search}%`);
      conditions.push(`(
        i.item_code ILIKE $${params.length}
        OR i.barcode ILIKE $${params.length}
        OR i.display_name ILIKE $${params.length}
        OR dc.medication_name ILIKE $${params.length}
        OR dc.generic_name ILIKE $${params.length}
      )`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          i.*,
          dc.medication_name AS drug_catalog_medication_name,
          dc.rxnorm_code AS drug_catalog_rxnorm_code,
          (i.quantity_on_hand <= i.reorder_level) AS low_stock
        FROM inventory_items i
        LEFT JOIN drug_catalog dc ON dc.id = i.drug_catalog_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY i.display_name ASC, i.created_at DESC
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

export function createInventoryItem(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CreateInventoryItemInput) {
    const result = await db.query(
      `
        INSERT INTO inventory_items (
          clinic_id,
          drug_catalog_id,
          item_code,
          display_name,
          barcode,
          barcode_required,
          unit,
          quantity_on_hand,
          reorder_level,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        input.clinicId,
        input.drugCatalogId ?? null,
        input.itemCode,
        input.displayName,
        input.barcode ?? null,
        input.barcodeRequired ?? false,
        input.unit ?? 'unit',
        Number(input.quantityOnHand ?? 0),
        Number(input.reorderLevel ?? 0),
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updateInventoryItem(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: UpdateInventoryItemInput) {
    const assignments: string[] = [];
    const params: unknown[] = [input.inventoryItemId];
    const fieldMap: Array<[keyof UpdateInventoryItemInput, string]> = [
      ['drugCatalogId', 'drug_catalog_id'],
      ['itemCode', 'item_code'],
      ['displayName', 'display_name'],
      ['barcode', 'barcode'],
      ['barcodeRequired', 'barcode_required'],
      ['unit', 'unit'],
      ['reorderLevel', 'reorder_level'],
      ['isActive', 'is_active'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      const value = input[inputKey] ?? null;
      params.push(inputKey === 'reorderLevel' ? Number(value ?? 0) : value);
      assignments.push(`${column} = $${params.length}`);
    }

    if (assignments.length === 0) {
      const existing = await db.query(
        `
          SELECT *
          FROM inventory_items
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.inventoryItemId]
      );
      return existing.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE inventory_items
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      params
    );

    return result.rows[0] ?? null;
  };
}

export function adjustInventoryStock(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: AdjustInventoryStockInput) {
    const itemResult = await db.query<{
      id: string;
      clinic_id: string;
      quantity_on_hand: string;
    }>(
      `
        SELECT id, clinic_id, quantity_on_hand
        FROM inventory_items
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.inventoryItemId]
    );
    const item = itemResult.rows[0];
    if (!item) return null;

    const quantityBefore = Number(item.quantity_on_hand);
    const quantity = Number(input.quantity);
    const signedQuantity = input.movementType === 'adjustment_out' ? -quantity : quantity;
    const quantityAfter = Number((quantityBefore + signedQuantity).toFixed(2));
    if (quantityAfter < 0) {
      throw new Error('Inventory quantity cannot go below zero');
    }

    const updated = await db.query(
      `
        UPDATE inventory_items
        SET quantity_on_hand = $2
        WHERE id = $1
        RETURNING *
      `,
      [input.inventoryItemId, quantityAfter]
    );

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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        input.inventoryLocationId ?? null,
        input.movementType,
        quantity,
        quantityBefore,
        quantityAfter,
        input.reason ?? null,
        input.binLabel ?? null,
        input.performedByUserId ?? null,
      ]
    );

    return updated.rows[0] ?? null;
  };
}
