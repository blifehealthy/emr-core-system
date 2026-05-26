import type {
  ApproveInventoryTransferInput,
  CancelInventoryTransferInput,
  CreateInventoryTransferInput,
  ReceiveInventoryTransferInput,
} from '../api/types.ts';
import { assertInventoryLotPickAllowed } from './inventoryLotPicking.ts';

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
    status?: 'pending' | 'in_transit' | 'completed' | 'cancelled' | 'all';
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
    if (input.status && input.status !== 'all') {
      params.push(input.status);
      conditions.push(`t.status = $${params.length}`);
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
          to_loc.location_code AS to_inventory_location_code,
          lot.lot_number AS inventory_lot_number,
          lot.expires_on AS inventory_lot_expires_on
        FROM inventory_transfers t
        JOIN inventory_items i ON i.id = t.inventory_item_id
        JOIN inventory_locations from_loc ON from_loc.id = t.from_inventory_location_id
        JOIN inventory_locations to_loc ON to_loc.id = t.to_inventory_location_id
        LEFT JOIN inventory_lots lot ON lot.id = t.inventory_lot_id
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

async function getInventoryTransferById(db: Db, transferId: string) {
  const result = await db.query(
    `
      SELECT
        t.*,
        i.display_name AS inventory_item_display_name,
        i.item_code AS inventory_item_code,
        i.quantity_on_hand AS inventory_item_quantity_on_hand,
        from_loc.display_name AS from_inventory_location_display_name,
        from_loc.location_code AS from_inventory_location_code,
        to_loc.display_name AS to_inventory_location_display_name,
        to_loc.location_code AS to_inventory_location_code,
        lot.lot_number AS inventory_lot_number,
        lot.expires_on AS inventory_lot_expires_on
      FROM inventory_transfers t
      JOIN inventory_items i ON i.id = t.inventory_item_id
      JOIN inventory_locations from_loc ON from_loc.id = t.from_inventory_location_id
      JOIN inventory_locations to_loc ON to_loc.id = t.to_inventory_location_id
      LEFT JOIN inventory_lots lot ON lot.id = t.inventory_lot_id
      WHERE t.id = $1
        AND t.deleted_at IS NULL
    `,
    [transferId]
  );

  return result.rows[0] ?? null;
}

async function assertTransferLotMatches(db: Db, input: CreateInventoryTransferInput) {
  if (!input.inventoryLotId) return;

  const lot = await db.query<{
    id: string;
    inventory_item_id: string;
    inventory_location_id: string | null;
    bin_label: string | null;
  }>(
    `
      SELECT id, inventory_item_id, inventory_location_id, bin_label
      FROM inventory_lots
      WHERE id = $1
        AND clinic_id = $2
        AND inventory_item_id = $3
        AND deleted_at IS NULL
    `,
    [input.inventoryLotId, input.clinicId, input.inventoryItemId]
  );
  const row = lot.rows[0];
  if (!row) throw new Error('Inventory lot not found');
  if (row.inventory_location_id && row.inventory_location_id !== input.fromInventoryLocationId) {
    throw new Error('Inventory lot is not in the source location');
  }
  if ((row.bin_label ?? '') !== (input.fromBinLabel ?? '')) {
    throw new Error('Inventory lot bin does not match the source bin');
  }
}

async function recordTransferStockMovements(
  db: Db,
  input: {
    clinicId: string;
    inventoryItemId: string;
    fromInventoryLocationId?: string | null;
    toInventoryLocationId?: string | null;
    fromBinLabel?: string | null;
    toBinLabel?: string | null;
    quantity: number;
    quantityBefore: number;
    reason: string;
    performedByUserId?: string | null;
    sourceMovementType?: 'adjustment_out' | 'adjustment_in';
    destinationMovementType?: 'adjustment_out' | 'adjustment_in';
  }
) {
  if (!input.toInventoryLocationId) {
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
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)
      `,
      [
        input.clinicId,
        input.inventoryItemId,
        input.fromInventoryLocationId ?? null,
        input.sourceMovementType ?? 'adjustment_out',
        input.quantity,
        input.quantityBefore,
        input.reason,
        input.fromBinLabel ?? null,
        input.performedByUserId ?? null,
      ]
    );
    return;
  }

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
        ($1, $2, $3, $4, $7, $8, $8, $9, $10, $11),
        ($1, $2, $5, $6, $7, $8, $8, $9, $12, $11)
    `,
    [
      input.clinicId,
      input.inventoryItemId,
      input.fromInventoryLocationId ?? null,
      input.sourceMovementType ?? 'adjustment_out',
      input.toInventoryLocationId ?? null,
      input.destinationMovementType ?? 'adjustment_in',
      input.quantity,
      input.quantityBefore,
      input.reason,
      input.fromBinLabel ?? null,
      input.performedByUserId ?? null,
      input.toBinLabel ?? null,
    ]
  );
}

async function moveTransferLot(
  db: Db,
  input: {
    inventoryLotId?: string | null;
    inventoryLocationId: string;
    binLabel?: string | null;
    quantity: number;
  }
) {
  if (!input.inventoryLotId) return;

  const lot = await db.query<{ quantity_on_hand: string | number }>(
    `
      SELECT quantity_on_hand
      FROM inventory_lots
      WHERE id = $1
        AND deleted_at IS NULL
    `,
    [input.inventoryLotId]
  );
  if (Number(lot.rows[0]?.quantity_on_hand ?? 0) !== input.quantity) return;

  await db.query(
    `
      UPDATE inventory_lots
      SET inventory_location_id = $2,
          bin_label = $3,
          updated_at = now()
      WHERE id = $1
        AND deleted_at IS NULL
    `,
    [input.inventoryLotId, input.inventoryLocationId, input.binLabel ?? null]
  );
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
    await assertTransferLotMatches(db, input);
    const pick = input.inventoryLotId
      ? await assertInventoryLotPickAllowed(db, {
          clinicId: input.clinicId,
          inventoryItemId: input.inventoryItemId,
          inventoryLotId: input.inventoryLotId,
          inventoryLocationId: input.fromInventoryLocationId,
          binLabel: input.fromBinLabel ?? null,
          quantity,
          expiryOverrideReason: input.expiryOverrideReason,
          fefoOverrideReason: input.fefoOverrideReason,
        })
      : null;
    const fefoRecommendedLotId = pick?.fefoRecommendedLotId ?? null;

    if (input.approvalRequired) {
      const transferResult = await db.query<{ id: string }>(
        `
          INSERT INTO inventory_transfers (
            clinic_id,
            inventory_item_id,
            inventory_lot_id,
            from_inventory_location_id,
            to_inventory_location_id,
            from_bin_label,
            to_bin_label,
            quantity,
            status,
            expiry_override_reason,
            fefo_override_reason,
            fefo_recommended_lot_id,
            requested_by_user_id,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, $12, $13)
          RETURNING id
        `,
        [
          input.clinicId,
          input.inventoryItemId,
          input.inventoryLotId ?? null,
          input.fromInventoryLocationId,
          input.toInventoryLocationId,
          input.fromBinLabel ?? null,
          input.toBinLabel ?? null,
          quantity,
          input.expiryOverrideReason ?? null,
          input.fefoOverrideReason ?? null,
          fefoRecommendedLotId,
          input.requestedByUserId ?? input.transferredByUserId ?? null,
          input.notes ?? null,
        ]
      );

      return getInventoryTransferById(db, transferResult.rows[0].id);
    }

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
          inventory_lot_id,
          from_inventory_location_id,
          to_inventory_location_id,
          from_bin_label,
          to_bin_label,
          quantity,
          expiry_override_reason,
          fefo_override_reason,
          fefo_recommended_lot_id,
          requested_by_user_id,
          transferred_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `,
      [
        input.clinicId,
        input.inventoryItemId,
        input.inventoryLotId ?? null,
        input.fromInventoryLocationId,
        input.toInventoryLocationId,
        input.fromBinLabel ?? null,
        input.toBinLabel ?? null,
        quantity,
        input.expiryOverrideReason ?? null,
        input.fefoOverrideReason ?? null,
        fefoRecommendedLotId,
        input.requestedByUserId ?? input.transferredByUserId ?? null,
        input.transferredByUserId ?? null,
        input.notes ?? null,
      ]
    );

    const transferId = transferResult.rows[0].id;
    const quantityBefore = Number(item.rows[0].quantity_on_hand);
    await recordTransferStockMovements(db, {
      clinicId: input.clinicId,
      inventoryItemId: input.inventoryItemId,
      fromInventoryLocationId: input.fromInventoryLocationId,
      toInventoryLocationId: input.toInventoryLocationId,
      fromBinLabel: input.fromBinLabel ?? null,
      toBinLabel: input.toBinLabel ?? null,
      quantity,
      quantityBefore,
      reason: input.notes ?? `Inventory transfer ${transferId}`,
      performedByUserId: input.transferredByUserId ?? null,
    });
    await moveTransferLot(db, {
      inventoryLotId: input.inventoryLotId,
      inventoryLocationId: input.toInventoryLocationId,
      binLabel: input.toBinLabel ?? null,
      quantity,
    });

    return getInventoryTransferById(db, transferId);
  };
}

type TransferWorkflowRow = {
  id: string;
  clinic_id: string;
  inventory_item_id: string;
  inventory_lot_id: string | null;
  from_inventory_location_id: string;
  to_inventory_location_id: string;
  from_bin_label: string | null;
  to_bin_label: string | null;
  quantity: string | number;
  status: string;
  notes: string | null;
  inventory_item_quantity_on_hand?: string | number;
};

async function getWorkflowTransfer(db: Db, transferId: string, status: string) {
  const row = (await getInventoryTransferById(db, transferId)) as TransferWorkflowRow | null;
  if (!row || row.status !== status) return null;
  return row;
}

export function approveInventoryTransfer(db: Db) {
  return async function run(input: ApproveInventoryTransferInput) {
    const transfer = await getWorkflowTransfer(db, input.transferId, 'pending');
    if (!transfer) return null;

    const quantity = Number(transfer.quantity);
    await applyInventoryLocationStockChange(db, {
      clinicId: transfer.clinic_id,
      inventoryItemId: transfer.inventory_item_id,
      inventoryLocationId: transfer.from_inventory_location_id,
      binLabel: transfer.from_bin_label,
      quantityDelta: -quantity,
    });
    await recordTransferStockMovements(db, {
      clinicId: transfer.clinic_id,
      inventoryItemId: transfer.inventory_item_id,
      fromInventoryLocationId: transfer.from_inventory_location_id,
      toInventoryLocationId: null,
      fromBinLabel: transfer.from_bin_label,
      toBinLabel: null,
      quantity,
      quantityBefore: Number(transfer.inventory_item_quantity_on_hand ?? 0),
      reason: transfer.notes ?? `Inventory transfer approved ${transfer.id}`,
      performedByUserId: input.approvedByUserId ?? null,
      sourceMovementType: 'adjustment_out',
      destinationMovementType: 'adjustment_out',
    });
    await db.query(
      `
        UPDATE inventory_transfers
        SET status = 'in_transit',
            approved_at = now(),
            approved_by_user_id = $2,
            updated_at = now()
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.transferId, input.approvedByUserId ?? null]
    );

    return getInventoryTransferById(db, input.transferId);
  };
}

export function receiveInventoryTransfer(db: Db) {
  return async function run(input: ReceiveInventoryTransferInput) {
    const transfer = await getWorkflowTransfer(db, input.transferId, 'in_transit');
    if (!transfer) return null;

    const quantity = Number(transfer.quantity);
    await applyInventoryLocationStockChange(db, {
      clinicId: transfer.clinic_id,
      inventoryItemId: transfer.inventory_item_id,
      inventoryLocationId: transfer.to_inventory_location_id,
      binLabel: transfer.to_bin_label,
      quantityDelta: quantity,
    });
    await recordTransferStockMovements(db, {
      clinicId: transfer.clinic_id,
      inventoryItemId: transfer.inventory_item_id,
      fromInventoryLocationId: transfer.to_inventory_location_id,
      toInventoryLocationId: null,
      fromBinLabel: transfer.to_bin_label,
      toBinLabel: null,
      quantity,
      quantityBefore: Number(transfer.inventory_item_quantity_on_hand ?? 0),
      reason: transfer.notes ?? `Inventory transfer received ${transfer.id}`,
      performedByUserId: input.receivedByUserId ?? null,
      sourceMovementType: 'adjustment_in',
      destinationMovementType: 'adjustment_in',
    });
    await moveTransferLot(db, {
      inventoryLotId: transfer.inventory_lot_id,
      inventoryLocationId: transfer.to_inventory_location_id,
      binLabel: transfer.to_bin_label,
      quantity,
    });
    await db.query(
      `
        UPDATE inventory_transfers
        SET status = 'completed',
            received_at = now(),
            received_by_user_id = $2,
            transferred_at = now(),
            updated_at = now()
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.transferId, input.receivedByUserId ?? null]
    );

    return getInventoryTransferById(db, input.transferId);
  };
}

export function cancelInventoryTransfer(db: Db) {
  return async function run(input: CancelInventoryTransferInput) {
    const transfer =
      (await getWorkflowTransfer(db, input.transferId, 'pending')) ??
      (await getWorkflowTransfer(db, input.transferId, 'in_transit'));
    if (!transfer) return null;

    const quantity = Number(transfer.quantity);
    if (transfer.status === 'in_transit') {
      await applyInventoryLocationStockChange(db, {
        clinicId: transfer.clinic_id,
        inventoryItemId: transfer.inventory_item_id,
        inventoryLocationId: transfer.from_inventory_location_id,
        binLabel: transfer.from_bin_label,
        quantityDelta: quantity,
      });
      await recordTransferStockMovements(db, {
        clinicId: transfer.clinic_id,
        inventoryItemId: transfer.inventory_item_id,
        fromInventoryLocationId: transfer.from_inventory_location_id,
        toInventoryLocationId: null,
        fromBinLabel: transfer.from_bin_label,
        toBinLabel: null,
        quantity,
        quantityBefore: Number(transfer.inventory_item_quantity_on_hand ?? 0),
        reason: input.cancellationReason ?? `Inventory transfer cancelled ${transfer.id}`,
        performedByUserId: input.cancelledByUserId ?? null,
        sourceMovementType: 'adjustment_in',
        destinationMovementType: 'adjustment_in',
      });
    }

    await db.query(
      `
        UPDATE inventory_transfers
        SET status = 'cancelled',
            cancelled_at = now(),
            cancelled_by_user_id = $2,
            cancellation_reason = $3,
            updated_at = now()
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.transferId, input.cancelledByUserId ?? null, input.cancellationReason ?? null]
    );

    return getInventoryTransferById(db, input.transferId);
  };
}
