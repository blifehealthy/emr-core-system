import type { ReceiveInventoryLotInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInventoryLots(db: Db) {
  return async function run(input: {
    clinicId: string;
    inventoryItemId?: string;
    expiringBefore?: string;
    includeEmpty?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['l.clinic_id = $1', 'l.deleted_at IS NULL'];

    if (input.inventoryItemId) {
      params.push(input.inventoryItemId);
      conditions.push(`l.inventory_item_id = $${params.length}`);
    }

    if (input.expiringBefore) {
      params.push(input.expiringBefore);
      conditions.push(`l.expires_on IS NOT NULL AND l.expires_on <= $${params.length}`);
    }

    if (!input.includeEmpty) {
      conditions.push('l.quantity_on_hand > 0');
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          l.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          (l.expires_on IS NOT NULL AND l.expires_on < CURRENT_DATE) AS expired,
          (
            l.expires_on IS NOT NULL
            AND l.expires_on <= CURRENT_DATE + INTERVAL '30 days'
          ) AS expiring_soon
        FROM inventory_lots l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY l.expires_on NULLS LAST, l.received_at DESC, l.created_at DESC
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

export function receiveInventoryLot(db: Db) {
  return async function run(input: ReceiveInventoryLotInput) {
    const itemResult = await db.query<{
      id: string;
      clinic_id: string;
      quantity_on_hand: string;
    }>(
      `
        SELECT id, clinic_id, quantity_on_hand
        FROM inventory_items
        WHERE id = $1
          AND is_active IS TRUE
          AND deleted_at IS NULL
      `,
      [input.inventoryItemId]
    );
    const item = itemResult.rows[0];
    if (!item) return null;

    const quantity = Number(input.quantity);
    const quantityBefore = Number(item.quantity_on_hand);
    const quantityAfter = Number((quantityBefore + quantity).toFixed(2));

    const lotResult = await db.query<{ id: string }>(
      `
        INSERT INTO inventory_lots (
          clinic_id,
          inventory_item_id,
          supplier_id,
          lot_number,
          expires_on,
          received_quantity,
          quantity_on_hand,
          supplier_name,
          reference_number,
          received_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        input.supplierId ?? null,
        input.lotNumber,
        input.expiresOn ?? null,
        quantity,
        input.supplierName ?? null,
        input.referenceNumber ?? null,
        input.receivedByUserId ?? null,
        input.notes ?? null,
      ]
    );
    const lotId = lotResult.rows[0].id;

    await db.query(
      `
        UPDATE inventory_items
        SET quantity_on_hand = $2
        WHERE id = $1
      `,
      [input.inventoryItemId, quantityAfter]
    );

    await db.query(
      `
        INSERT INTO stock_movements (
          clinic_id,
          inventory_item_id,
          inventory_lot_id,
          movement_type,
          quantity,
          quantity_before,
          quantity_after,
          reason,
          performed_by_user_id
        )
        VALUES ($1, $2, $3, 'adjustment_in', $4, $5, $6, $7, $8)
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        lotId,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? `Inventory receiving ${input.lotNumber}`,
        input.receivedByUserId ?? null,
      ]
    );

    const lot = await db.query(
      `
        SELECT
          l.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          (l.expires_on IS NOT NULL AND l.expires_on < CURRENT_DATE) AS expired,
          (
            l.expires_on IS NOT NULL
            AND l.expires_on <= CURRENT_DATE + INTERVAL '30 days'
          ) AS expiring_soon
        FROM inventory_lots l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        WHERE l.id = $1
      `,
      [lotId]
    );

    return lot.rows[0] ?? null;
  };
}
