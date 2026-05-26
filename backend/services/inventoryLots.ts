import type { ReceiveInventoryLotInput } from '../api/types.ts';
import { applyInventoryLocationStockChange } from './inventoryLocationStocks.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInventoryLots(db: Db) {
  return async function run(input: {
    clinicId: string;
    inventoryItemId?: string;
    inventoryLocationId?: string;
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

    if (input.inventoryLocationId) {
      params.push(input.inventoryLocationId);
      conditions.push(`l.inventory_location_id = $${params.length}`);
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
          loc.location_code AS inventory_location_code,
          loc.display_name AS inventory_location_display_name,
          (l.expires_on IS NOT NULL AND l.expires_on < CURRENT_DATE) AS expired,
          (
            l.expires_on IS NOT NULL
            AND l.expires_on <= CURRENT_DATE + INTERVAL '30 days'
          ) AS expiring_soon
        FROM inventory_lots l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        LEFT JOIN inventory_locations loc ON loc.id = l.inventory_location_id
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
      barcode: string | null;
      barcode_required: boolean;
      quantity_on_hand: string;
    }>(
      `
        SELECT id, clinic_id, barcode, barcode_required, quantity_on_hand
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
    const scannedBarcode = input.scannedBarcode ?? null;
    const lotBarcode = input.lotBarcode ?? null;
    const expectedBarcode = item.barcode ?? lotBarcode;
    const barcodeVerified = Boolean(scannedBarcode && expectedBarcode && scannedBarcode === expectedBarcode);
    if ((input.requireBarcodeVerification || item.barcode_required) && !barcodeVerified) {
      throw new Error('Barcode verification failed for inventory receiving');
    }

    const lotResult = await db.query<{ id: string }>(
      `
        INSERT INTO inventory_lots (
          clinic_id,
          inventory_item_id,
          inventory_location_id,
          supplier_id,
          lot_number,
          bin_label,
          barcode,
          received_barcode,
          barcode_verified,
          barcode_verified_at,
          barcode_verified_by_user_id,
          expires_on,
          received_quantity,
          quantity_on_hand,
          supplier_name,
          reference_number,
          received_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $9 THEN now() ELSE NULL END, $10, $11, $12, $12, $13, $14, $15, $16)
        RETURNING id
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        input.inventoryLocationId ?? null,
        input.supplierId ?? null,
        input.lotNumber,
        input.binLabel ?? null,
        lotBarcode ?? scannedBarcode,
        scannedBarcode,
        barcodeVerified,
        barcodeVerified ? input.receivedByUserId ?? null : null,
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
          inventory_location_id,
          movement_type,
          quantity,
          quantity_before,
          quantity_after,
          reason,
          bin_label,
          scanned_barcode,
          barcode_verified,
          performed_by_user_id
        )
        VALUES ($1, $2, $3, $4, 'adjustment_in', $5, $6, $7, $8, $9, $10, $11, $12)
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        lotId,
        input.inventoryLocationId ?? null,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? `Inventory receiving ${input.lotNumber}`,
        input.binLabel ?? null,
        scannedBarcode,
        barcodeVerified,
        input.receivedByUserId ?? null,
      ]
    );

    await applyInventoryLocationStockChange(db, {
      clinicId: item.clinic_id,
      inventoryItemId: input.inventoryItemId,
      inventoryLocationId: input.inventoryLocationId ?? null,
      binLabel: input.binLabel ?? null,
      quantityDelta: quantity,
    });

    const lot = await db.query(
      `
        SELECT
          l.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          loc.location_code AS inventory_location_code,
          loc.display_name AS inventory_location_display_name,
          (l.expires_on IS NOT NULL AND l.expires_on < CURRENT_DATE) AS expired,
          (
            l.expires_on IS NOT NULL
            AND l.expires_on <= CURRENT_DATE + INTERVAL '30 days'
          ) AS expiring_soon
        FROM inventory_lots l
        JOIN inventory_items i ON i.id = l.inventory_item_id
        LEFT JOIN inventory_locations loc ON loc.id = l.inventory_location_id
        WHERE l.id = $1
      `,
      [lotId]
    );

    return lot.rows[0] ?? null;
  };
}
