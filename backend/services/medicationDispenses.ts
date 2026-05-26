import type { DispensePrescriptionInput } from '../api/types.ts';

export function listMedicationDispenses(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId?: string;
    prescriptionId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [];
    const conditions = ['d.deleted_at IS NULL'];

    if (input.clinicId) {
      params.push(input.clinicId);
      conditions.push(`d.clinic_id = $${params.length}`);
    }

    if (input.prescriptionId) {
      params.push(input.prescriptionId);
      conditions.push(`d.prescription_id = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          d.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          l.lot_number AS inventory_lot_number,
          l.expires_on AS inventory_lot_expires_on,
          loc.location_code AS inventory_location_code,
          loc.display_name AS inventory_location_display_name
        FROM medication_dispenses d
        JOIN inventory_items i ON i.id = d.inventory_item_id
        LEFT JOIN inventory_lots l ON l.id = d.inventory_lot_id
        LEFT JOIN inventory_locations loc ON loc.id = d.inventory_location_id
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY d.dispensed_at DESC, d.created_at DESC
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

export function dispensePrescription(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: DispensePrescriptionInput) {
    const prescriptionResult = await db.query<{
      id: string;
      encounter_id: string;
    }>(
      `
        SELECT id, encounter_id
        FROM prescriptions
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.prescriptionId]
    );
    const prescription = prescriptionResult.rows[0];
    if (!prescription) return null;

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
    const scannedBarcode = input.scannedBarcode ?? null;
    let barcodeVerified = Boolean(scannedBarcode && item.barcode && scannedBarcode === item.barcode);
    let inventoryLocationId = input.inventoryLocationId ?? null;
    const quantityBefore = Number(item.quantity_on_hand);
    const quantityAfter = Number((quantityBefore - quantity).toFixed(2));
    if (quantityAfter < 0) {
      throw new Error('Inventory quantity cannot go below zero');
    }

    if (input.inventoryLotId) {
      const lotResult = await db.query<{
        id: string;
        barcode: string | null;
        inventory_location_id: string | null;
        quantity_on_hand: string;
      }>(
        `
          SELECT id, barcode, inventory_location_id, quantity_on_hand
          FROM inventory_lots
          WHERE id = $1
            AND inventory_item_id = $2
            AND deleted_at IS NULL
        `,
        [input.inventoryLotId, input.inventoryItemId]
      );
      const lot = lotResult.rows[0];
      if (!lot) return null;
      inventoryLocationId = inventoryLocationId ?? lot.inventory_location_id;
      barcodeVerified = Boolean(
        scannedBarcode &&
          ((lot.barcode && scannedBarcode === lot.barcode) ||
            (item.barcode && scannedBarcode === item.barcode))
      );
      if ((input.requireBarcodeVerification || item.barcode_required) && !barcodeVerified) {
        throw new Error('Barcode verification failed for prescription dispensing');
      }

      const lotQuantityBefore = Number(lot.quantity_on_hand);
      const lotQuantityAfter = Number((lotQuantityBefore - quantity).toFixed(2));
      if (lotQuantityAfter < 0) {
        throw new Error('Inventory lot quantity cannot go below zero');
      }

      await db.query(
        `
          UPDATE inventory_lots
          SET quantity_on_hand = $2
          WHERE id = $1
        `,
        [input.inventoryLotId, lotQuantityAfter]
      );
    } else if (input.requireBarcodeVerification || item.barcode_required) {
      const barcodeVerified = Boolean(scannedBarcode && item.barcode && scannedBarcode === item.barcode);
      if (!barcodeVerified) {
        throw new Error('Barcode verification failed for prescription dispensing');
      }
    }

    await db.query(
      `
        UPDATE inventory_items
        SET quantity_on_hand = $2
        WHERE id = $1
      `,
      [input.inventoryItemId, quantityAfter]
    );

    const dispenseResult = await db.query<{ id: string }>(
      `
        INSERT INTO medication_dispenses (
          clinic_id,
          prescription_id,
          inventory_item_id,
          inventory_lot_id,
          inventory_location_id,
          quantity,
          scanned_barcode,
          barcode_verified,
          barcode_verified_at,
          dispensed_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8 THEN now() ELSE NULL END, $9, $10)
        RETURNING id
      `,
      [
        item.clinic_id,
        input.prescriptionId,
        input.inventoryItemId,
        input.inventoryLotId ?? null,
        inventoryLocationId,
        quantity,
        scannedBarcode,
        barcodeVerified,
        input.dispensedByUserId ?? null,
        input.notes ?? null,
      ]
    );
    const dispenseId = dispenseResult.rows[0].id;

    await db.query(
      `
        INSERT INTO stock_movements (
          clinic_id,
          inventory_item_id,
          inventory_lot_id,
          inventory_location_id,
          prescription_id,
          medication_dispense_id,
          movement_type,
          quantity,
          quantity_before,
          quantity_after,
          reason,
          scanned_barcode,
          barcode_verified,
          performed_by_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'dispense', $7, $8, $9, $10, $11, $12, $13)
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        input.inventoryLotId ?? null,
        inventoryLocationId,
        input.prescriptionId,
        dispenseId,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? 'Prescription dispense',
        scannedBarcode,
        barcodeVerified,
        input.dispensedByUserId ?? null,
      ]
    );

    const dispense = await db.query(
      `
        SELECT
          d.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code,
          l.lot_number AS inventory_lot_number,
          l.expires_on AS inventory_lot_expires_on,
          loc.location_code AS inventory_location_code,
          loc.display_name AS inventory_location_display_name
        FROM medication_dispenses d
        JOIN inventory_items i ON i.id = d.inventory_item_id
        LEFT JOIN inventory_lots l ON l.id = d.inventory_lot_id
        LEFT JOIN inventory_locations loc ON loc.id = d.inventory_location_id
        WHERE d.id = $1
      `,
      [dispenseId]
    );

    return dispense.rows[0] ?? null;
  };
}
