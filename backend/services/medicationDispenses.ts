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
          i.item_code AS inventory_item_code
        FROM medication_dispenses d
        JOIN inventory_items i ON i.id = d.inventory_item_id
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
    const quantityAfter = Number((quantityBefore - quantity).toFixed(2));
    if (quantityAfter < 0) {
      throw new Error('Inventory quantity cannot go below zero');
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
          quantity,
          dispensed_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        item.clinic_id,
        input.prescriptionId,
        input.inventoryItemId,
        quantity,
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
          prescription_id,
          medication_dispense_id,
          movement_type,
          quantity,
          quantity_before,
          quantity_after,
          reason,
          performed_by_user_id
        )
        VALUES ($1, $2, $3, $4, 'dispense', $5, $6, $7, $8, $9)
      `,
      [
        item.clinic_id,
        input.inventoryItemId,
        input.prescriptionId,
        dispenseId,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? 'Prescription dispense',
        input.dispensedByUserId ?? null,
      ]
    );

    const dispense = await db.query(
      `
        SELECT
          d.*,
          i.display_name AS inventory_item_display_name,
          i.item_code AS inventory_item_code
        FROM medication_dispenses d
        JOIN inventory_items i ON i.id = d.inventory_item_id
        WHERE d.id = $1
      `,
      [dispenseId]
    );

    return dispense.rows[0] ?? null;
  };
}
