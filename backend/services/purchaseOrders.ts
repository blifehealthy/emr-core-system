import type {
  CreatePurchaseOrderInput,
  ReceivePurchaseOrderInput,
  UpdatePurchaseOrderInput,
} from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

async function getPurchaseOrderById(db: Db, purchaseOrderId: string) {
  const result = await db.query(
    `
      SELECT
        po.*,
        s.display_name AS supplier_display_name,
        s.supplier_code,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pol.id,
              'purchase_order_id', pol.purchase_order_id,
              'inventory_item_id', pol.inventory_item_id,
              'description', pol.description,
              'ordered_quantity', pol.ordered_quantity,
              'received_quantity', pol.received_quantity,
              'unit_price_amount', pol.unit_price_amount,
              'notes', pol.notes,
              'inventory_item_display_name', i.display_name,
              'inventory_item_code', i.item_code,
              'created_at', pol.created_at,
              'updated_at', pol.updated_at,
              'deleted_at', pol.deleted_at
            )
            ORDER BY pol.created_at ASC
          ) FILTER (WHERE pol.id IS NOT NULL),
          '[]'::json
        ) AS lines
      FROM purchase_orders po
      LEFT JOIN suppliers s ON s.id = po.supplier_id
      LEFT JOIN purchase_order_lines pol
        ON pol.purchase_order_id = po.id
       AND pol.deleted_at IS NULL
      LEFT JOIN inventory_items i ON i.id = pol.inventory_item_id
      WHERE po.id = $1
        AND po.deleted_at IS NULL
      GROUP BY po.id, s.display_name, s.supplier_code
    `,
    [purchaseOrderId]
  );
  return result.rows[0] ?? null;
}

export function listPurchaseOrders(db: Db) {
  return async function run(input: {
    clinicId: string;
    supplierId?: string;
    status?: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['po.clinic_id = $1', 'po.deleted_at IS NULL'];

    if (input.supplierId) {
      params.push(input.supplierId);
      conditions.push(`po.supplier_id = $${params.length}`);
    }

    if (input.status && input.status !== 'all') {
      params.push(input.status);
      conditions.push(`po.status = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT
          po.*,
          s.display_name AS supplier_display_name,
          s.supplier_code,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pol.id,
                'purchase_order_id', pol.purchase_order_id,
                'inventory_item_id', pol.inventory_item_id,
                'description', pol.description,
                'ordered_quantity', pol.ordered_quantity,
                'received_quantity', pol.received_quantity,
                'unit_price_amount', pol.unit_price_amount,
                'notes', pol.notes,
                'inventory_item_display_name', i.display_name,
                'inventory_item_code', i.item_code,
                'created_at', pol.created_at,
                'updated_at', pol.updated_at,
                'deleted_at', pol.deleted_at
              )
              ORDER BY pol.created_at ASC
            ) FILTER (WHERE pol.id IS NOT NULL),
            '[]'::json
          ) AS lines
        FROM purchase_orders po
        LEFT JOIN suppliers s ON s.id = po.supplier_id
        LEFT JOIN purchase_order_lines pol
          ON pol.purchase_order_id = po.id
         AND pol.deleted_at IS NULL
        LEFT JOIN inventory_items i ON i.id = pol.inventory_item_id
        WHERE ${conditions.join('\n          AND ')}
        GROUP BY po.id, s.display_name, s.supplier_code
        ORDER BY po.created_at DESC
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

export function createPurchaseOrder(db: Db) {
  return async function run(input: CreatePurchaseOrderInput) {
    const orderResult = await db.query<{ id: string }>(
      `
        INSERT INTO purchase_orders (
          clinic_id,
          supplier_id,
          purchase_order_number,
          status,
          ordered_at,
          expected_at,
          created_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [
        input.clinicId,
        input.supplierId ?? null,
        input.purchaseOrderNumber,
        input.status ?? 'draft',
        input.orderedAt ?? null,
        input.expectedAt ?? null,
        input.createdByUserId ?? null,
        input.notes ?? null,
      ]
    );
    const purchaseOrderId = orderResult.rows[0].id;

    for (const line of input.lines) {
      await db.query(
        `
          INSERT INTO purchase_order_lines (
            purchase_order_id,
            inventory_item_id,
            description,
            ordered_quantity,
            unit_price_amount,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          purchaseOrderId,
          line.inventoryItemId,
          line.description,
          Number(line.orderedQuantity),
          Number(line.unitPriceAmount ?? 0),
          line.notes ?? null,
        ]
      );
    }

    return getPurchaseOrderById(db, purchaseOrderId);
  };
}

export function updatePurchaseOrder(db: Db) {
  return async function run(input: UpdatePurchaseOrderInput) {
    const assignments: string[] = [];
    const params: unknown[] = [input.purchaseOrderId];
    const fieldMap: Array<[keyof UpdatePurchaseOrderInput, string]> = [
      ['supplierId', 'supplier_id'],
      ['status', 'status'],
      ['orderedAt', 'ordered_at'],
      ['expectedAt', 'expected_at'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      params.push(input[inputKey] ?? null);
      assignments.push(`${column} = $${params.length}`);
    }

    if (assignments.length === 0) {
      return getPurchaseOrderById(db, input.purchaseOrderId);
    }

    const result = await db.query<{ id: string }>(
      `
        UPDATE purchase_orders
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING id
      `,
      params
    );

    if (!result.rows[0]) return null;
    return getPurchaseOrderById(db, input.purchaseOrderId);
  };
}

export function receivePurchaseOrder(db: Db) {
  return async function run(input: ReceivePurchaseOrderInput) {
    const lineResult = await db.query<{
      purchase_order_id: string;
      clinic_id: string;
      supplier_id: string | null;
      supplier_display_name: string | null;
      purchase_order_number: string;
      inventory_item_id: string;
      ordered_quantity: string;
      received_quantity: string;
      quantity_on_hand: string;
    }>(
      `
        SELECT
          pol.purchase_order_id,
          po.clinic_id,
          po.supplier_id,
          s.display_name AS supplier_display_name,
          po.purchase_order_number,
          pol.inventory_item_id,
          pol.ordered_quantity,
          pol.received_quantity,
          i.quantity_on_hand
        FROM purchase_order_lines pol
        JOIN purchase_orders po ON po.id = pol.purchase_order_id
        JOIN inventory_items i ON i.id = pol.inventory_item_id
        LEFT JOIN suppliers s ON s.id = po.supplier_id
        WHERE pol.id = $1
          AND pol.purchase_order_id = $2
          AND pol.deleted_at IS NULL
          AND po.deleted_at IS NULL
          AND i.deleted_at IS NULL
      `,
      [input.purchaseOrderLineId, input.purchaseOrderId]
    );
    const line = lineResult.rows[0];
    if (!line) return null;

    const quantity = Number(input.quantity);
    const orderedQuantity = Number(line.ordered_quantity);
    const receivedQuantityBefore = Number(line.received_quantity);
    const receivedQuantityAfter = Number((receivedQuantityBefore + quantity).toFixed(2));
    if (receivedQuantityAfter > orderedQuantity) {
      throw new Error('Received quantity cannot exceed ordered quantity');
    }

    const quantityBefore = Number(line.quantity_on_hand);
    const quantityAfter = Number((quantityBefore + quantity).toFixed(2));

    const lotResult = await db.query<{ id: string }>(
      `
        INSERT INTO inventory_lots (
          clinic_id,
          inventory_item_id,
          supplier_id,
          purchase_order_id,
          purchase_order_line_id,
          lot_number,
          expires_on,
          received_quantity,
          quantity_on_hand,
          supplier_name,
          reference_number,
          received_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12)
        RETURNING id
      `,
      [
        line.clinic_id,
        line.inventory_item_id,
        line.supplier_id,
        input.purchaseOrderId,
        input.purchaseOrderLineId,
        input.lotNumber,
        input.expiresOn ?? null,
        quantity,
        line.supplier_display_name,
        line.purchase_order_number,
        input.receivedByUserId ?? null,
        input.notes ?? null,
      ]
    );
    const lotId = lotResult.rows[0].id;

    await db.query(
      `
        UPDATE purchase_order_lines
        SET received_quantity = $2
        WHERE id = $1
      `,
      [input.purchaseOrderLineId, receivedQuantityAfter]
    );

    await db.query(
      `
        UPDATE inventory_items
        SET quantity_on_hand = $2
        WHERE id = $1
      `,
      [line.inventory_item_id, quantityAfter]
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
        line.clinic_id,
        line.inventory_item_id,
        lotId,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? `Purchase order receiving ${line.purchase_order_number}`,
        input.receivedByUserId ?? null,
      ]
    );

    await db.query(
      `
        UPDATE purchase_orders po
        SET status = CASE
              WHEN NOT EXISTS (
                SELECT 1
                FROM purchase_order_lines pol
                WHERE pol.purchase_order_id = po.id
                  AND pol.deleted_at IS NULL
                  AND pol.received_quantity < pol.ordered_quantity
              ) THEN 'received'::purchase_order_status
              WHEN EXISTS (
                SELECT 1
                FROM purchase_order_lines pol
                WHERE pol.purchase_order_id = po.id
                  AND pol.deleted_at IS NULL
                  AND pol.received_quantity > 0
              ) THEN 'partially_received'::purchase_order_status
              ELSE po.status
            END,
            received_at = CASE
              WHEN NOT EXISTS (
                SELECT 1
                FROM purchase_order_lines pol
                WHERE pol.purchase_order_id = po.id
                  AND pol.deleted_at IS NULL
                  AND pol.received_quantity < pol.ordered_quantity
              ) THEN now()
              ELSE received_at
            END
        WHERE po.id = $1
      `,
      [input.purchaseOrderId]
    );

    return getPurchaseOrderById(db, input.purchaseOrderId);
  };
}
