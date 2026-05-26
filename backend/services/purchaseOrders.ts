import type {
  CreatePurchaseOrderInput,
  ApprovePurchaseOrderInput,
  CreatePurchaseOrderApprovalPolicyInput,
  RejectPurchaseOrderInput,
  ReceivePurchaseOrderInput,
  SubmitPurchaseOrderInput,
  UpdatePurchaseOrderApprovalPolicyInput,
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
        ,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', step.id,
                'purchase_order_id', step.purchase_order_id,
                'policy_id', step.policy_id,
                'approval_sequence', step.approval_sequence,
                'required_role', step.required_role,
                'status', step.status,
                'approved_at', step.approved_at,
                'approved_by_user_id', step.approved_by_user_id,
                'rejected_at', step.rejected_at,
                'rejected_by_user_id', step.rejected_by_user_id,
                'rejection_reason', step.rejection_reason,
                'notes', step.notes,
                'created_at', step.created_at,
                'updated_at', step.updated_at,
                'deleted_at', step.deleted_at
              )
              ORDER BY step.approval_sequence ASC, step.created_at ASC
            )
            FROM purchase_order_approval_steps step
            WHERE step.purchase_order_id = po.id
              AND step.deleted_at IS NULL
          ),
          '[]'::json
        ) AS approval_steps
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
    approvalStatus?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'all';
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

    if (input.approvalStatus && input.approvalStatus !== 'all') {
      params.push(input.approvalStatus);
      conditions.push(`po.approval_status = $${params.length}`);
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
          ,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', step.id,
                  'purchase_order_id', step.purchase_order_id,
                  'policy_id', step.policy_id,
                  'approval_sequence', step.approval_sequence,
                  'required_role', step.required_role,
                  'status', step.status,
                  'approved_at', step.approved_at,
                  'approved_by_user_id', step.approved_by_user_id,
                  'rejected_at', step.rejected_at,
                  'rejected_by_user_id', step.rejected_by_user_id,
                  'rejection_reason', step.rejection_reason,
                  'notes', step.notes,
                  'created_at', step.created_at,
                  'updated_at', step.updated_at,
                  'deleted_at', step.deleted_at
                )
                ORDER BY step.approval_sequence ASC, step.created_at ASC
              )
              FROM purchase_order_approval_steps step
              WHERE step.purchase_order_id = po.id
                AND step.deleted_at IS NULL
            ),
            '[]'::json
          ) AS approval_steps
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

async function calculatePurchaseOrderTotal(db: Db, purchaseOrderId: string) {
  const result = await db.query<{ total_amount: string }>(
    `
      SELECT COALESCE(SUM(ordered_quantity * unit_price_amount), 0) AS total_amount
      FROM purchase_order_lines
      WHERE purchase_order_id = $1
        AND deleted_at IS NULL
    `,
    [purchaseOrderId]
  );
  return Number(result.rows[0]?.total_amount ?? 0);
}

async function getApprovalPoliciesForOrder(db: Db, purchaseOrderId: string, totalAmount: number) {
  const order = await db.query<{ clinic_id: string }>(
    `
      SELECT clinic_id
      FROM purchase_orders
      WHERE id = $1
        AND deleted_at IS NULL
    `,
    [purchaseOrderId]
  );
  const clinicId = order.rows[0]?.clinic_id;
  if (!clinicId) return [];

  const policies = await db.query<{
    id: string;
    approval_sequence: number;
    required_role: 'doctor' | 'nurse' | 'admin';
  }>(
    `
      SELECT id, approval_sequence, required_role
      FROM purchase_order_approval_policies
      WHERE clinic_id = $1
        AND is_active IS TRUE
        AND deleted_at IS NULL
        AND min_total_amount <= $2
        AND (max_total_amount IS NULL OR max_total_amount >= $2)
      ORDER BY approval_sequence ASC, created_at ASC
    `,
    [clinicId, totalAmount]
  );

  return policies.rows.length > 0
    ? policies.rows
    : [{ id: null, approval_sequence: 1, required_role: 'admin' as const }];
}

export function submitPurchaseOrder(db: Db) {
  return async function run(input: SubmitPurchaseOrderInput) {
    const result = await db.query<{ id: string }>(
      `
        UPDATE purchase_orders
        SET approval_status = 'pending_approval',
            submitted_at = now(),
            submitted_by_user_id = $2,
            approved_at = NULL,
            approved_by_user_id = NULL,
            rejected_at = NULL,
            rejected_by_user_id = NULL,
            rejection_reason = NULL
        WHERE id = $1
          AND approval_status IN ('draft', 'rejected')
          AND status NOT IN ('received', 'cancelled')
          AND deleted_at IS NULL
        RETURNING id
      `,
      [input.purchaseOrderId, input.submittedByUserId ?? null]
    );

    if (!result.rows[0]) return null;

    await db.query(
      `
        UPDATE purchase_order_approval_steps
        SET deleted_at = now()
        WHERE purchase_order_id = $1
          AND deleted_at IS NULL
      `,
      [input.purchaseOrderId]
    );

    const totalAmount = await calculatePurchaseOrderTotal(db, input.purchaseOrderId);
    const policies = await getApprovalPoliciesForOrder(db, input.purchaseOrderId, totalAmount);
    for (const policy of policies) {
      await db.query(
        `
          INSERT INTO purchase_order_approval_steps (
            purchase_order_id,
            policy_id,
            approval_sequence,
            required_role
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          input.purchaseOrderId,
          policy.id,
          policy.approval_sequence,
          policy.required_role,
        ]
      );
    }

    return getPurchaseOrderById(db, input.purchaseOrderId);
  };
}

export function approvePurchaseOrder(db: Db) {
  return async function run(input: ApprovePurchaseOrderInput) {
    const stepResult = await db.query<{
      id: string;
      required_role: string;
    }>(
      `
        SELECT step.id, step.required_role
        FROM purchase_order_approval_steps step
        JOIN purchase_orders po ON po.id = step.purchase_order_id
        WHERE step.purchase_order_id = $1
          AND step.status = 'pending'
          AND step.deleted_at IS NULL
          AND po.approval_status = 'pending_approval'
          AND po.status NOT IN ('received', 'cancelled')
          AND po.deleted_at IS NULL
          ${input.approvalStepId ? 'AND step.id = $2' : ''}
        ORDER BY step.approval_sequence ASC, step.created_at ASC
        LIMIT 1
      `,
      input.approvalStepId ? [input.purchaseOrderId, input.approvalStepId] : [input.purchaseOrderId]
    );
    const step = stepResult.rows[0];
    if (!step) return null;
    if (input.approverRole && input.approverRole !== 'admin' && input.approverRole !== step.required_role) {
      throw new Error('Approver role does not match required approval step role');
    }

    await db.query(
      `
        UPDATE purchase_order_approval_steps
        SET status = 'approved',
            approved_at = now(),
            approved_by_user_id = $2
        WHERE id = $1
      `,
      [step.id, input.approvedByUserId ?? null]
    );

    const remaining = await db.query<{ id: string }>(
      `
        SELECT id
        FROM purchase_order_approval_steps
        WHERE purchase_order_id = $1
          AND status = 'pending'
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [input.purchaseOrderId]
    );

    if (!remaining.rows[0]) {
      await db.query(
        `
          UPDATE purchase_orders
          SET approval_status = 'approved',
              status = CASE WHEN status = 'draft' THEN 'ordered' ELSE status END,
              approved_at = now(),
              approved_by_user_id = $2,
              rejected_at = NULL,
              rejected_by_user_id = NULL,
              rejection_reason = NULL
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.purchaseOrderId, input.approvedByUserId ?? null]
      );
    }

    return getPurchaseOrderById(db, input.purchaseOrderId);
  };
}

export function rejectPurchaseOrder(db: Db) {
  return async function run(input: RejectPurchaseOrderInput) {
    const stepResult = await db.query<{
      id: string;
      required_role: string;
    }>(
      `
        SELECT step.id, step.required_role
        FROM purchase_order_approval_steps step
        JOIN purchase_orders po ON po.id = step.purchase_order_id
        WHERE step.purchase_order_id = $1
          AND step.status = 'pending'
          AND step.deleted_at IS NULL
          AND po.approval_status = 'pending_approval'
          AND po.status NOT IN ('received', 'cancelled')
          AND po.deleted_at IS NULL
          ${input.approvalStepId ? 'AND step.id = $2' : ''}
        ORDER BY step.approval_sequence ASC, step.created_at ASC
        LIMIT 1
      `,
      input.approvalStepId ? [input.purchaseOrderId, input.approvalStepId] : [input.purchaseOrderId]
    );
    const step = stepResult.rows[0];
    if (!step) return null;
    if (input.approverRole && input.approverRole !== 'admin' && input.approverRole !== step.required_role) {
      throw new Error('Approver role does not match required approval step role');
    }

    await db.query(
      `
        UPDATE purchase_order_approval_steps
        SET status = 'rejected',
            rejected_at = now(),
            rejected_by_user_id = $2,
            rejection_reason = $3
        WHERE id = $1
      `,
      [step.id, input.rejectedByUserId ?? null, input.rejectionReason]
    );

    await db.query(
      `
        UPDATE purchase_orders
        SET approval_status = 'rejected',
            rejected_at = now(),
            rejected_by_user_id = $2,
            rejection_reason = $3
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.purchaseOrderId, input.rejectedByUserId ?? null, input.rejectionReason]
    );

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
      approval_status: string;
      inventory_item_id: string;
      inventory_item_barcode: string | null;
      inventory_item_barcode_required: boolean;
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
          po.approval_status,
          pol.inventory_item_id,
          i.barcode AS inventory_item_barcode,
          i.barcode_required AS inventory_item_barcode_required,
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
    if (line.approval_status !== 'approved') {
      throw new Error('Purchase order must be approved before receiving');
    }

    const quantity = Number(input.quantity);
    const orderedQuantity = Number(line.ordered_quantity);
    const receivedQuantityBefore = Number(line.received_quantity);
    const receivedQuantityAfter = Number((receivedQuantityBefore + quantity).toFixed(2));
    if (receivedQuantityAfter > orderedQuantity) {
      throw new Error('Received quantity cannot exceed ordered quantity');
    }

    const quantityBefore = Number(line.quantity_on_hand);
    const quantityAfter = Number((quantityBefore + quantity).toFixed(2));
    const scannedBarcode = input.scannedBarcode ?? null;
    const lotBarcode = input.lotBarcode ?? null;
    const expectedBarcode = line.inventory_item_barcode ?? lotBarcode;
    const barcodeVerified = Boolean(scannedBarcode && expectedBarcode && scannedBarcode === expectedBarcode);
    if ((input.requireBarcodeVerification || line.inventory_item_barcode_required) && !barcodeVerified) {
      throw new Error('Barcode verification failed for purchase order receiving');
    }

    const lotResult = await db.query<{ id: string }>(
      `
        INSERT INTO inventory_lots (
          clinic_id,
          inventory_item_id,
          inventory_location_id,
          supplier_id,
          purchase_order_id,
          purchase_order_line_id,
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CASE WHEN $11 THEN now() ELSE NULL END, $12, $13, $14, $14, $15, $16, $17, $18)
        RETURNING id
      `,
      [
        line.clinic_id,
        line.inventory_item_id,
        input.inventoryLocationId ?? null,
        line.supplier_id,
        input.purchaseOrderId,
        input.purchaseOrderLineId,
        input.lotNumber,
        input.binLabel ?? null,
        lotBarcode ?? scannedBarcode,
        scannedBarcode,
        barcodeVerified,
        barcodeVerified ? input.receivedByUserId ?? null : null,
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
        line.clinic_id,
        line.inventory_item_id,
        lotId,
        input.inventoryLocationId ?? null,
        quantity,
        quantityBefore,
        quantityAfter,
        input.notes ?? `Purchase order receiving ${line.purchase_order_number}`,
        input.binLabel ?? null,
        scannedBarcode,
        barcodeVerified,
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

export function listPurchaseOrderApprovalPolicies(db: Db) {
  return async function run(input: {
    clinicId: string;
    active?: 'active' | 'inactive' | 'all';
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.active === 'active') {
      conditions.push('is_active IS TRUE');
    } else if (input.active === 'inactive') {
      conditions.push('is_active IS FALSE');
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM purchase_order_approval_policies
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY min_total_amount ASC, approval_sequence ASC, created_at DESC
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

export function createPurchaseOrderApprovalPolicy(db: Db) {
  return async function run(input: CreatePurchaseOrderApprovalPolicyInput) {
    const result = await db.query(
      `
        INSERT INTO purchase_order_approval_policies (
          clinic_id,
          policy_name,
          min_total_amount,
          max_total_amount,
          approval_sequence,
          required_role,
          is_active,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        input.clinicId,
        input.policyName,
        Number(input.minTotalAmount ?? 0),
        input.maxTotalAmount === undefined || input.maxTotalAmount === null
          ? null
          : Number(input.maxTotalAmount),
        input.approvalSequence,
        input.requiredRole ?? 'admin',
        input.isActive ?? true,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function updatePurchaseOrderApprovalPolicy(db: Db) {
  return async function run(input: UpdatePurchaseOrderApprovalPolicyInput) {
    const assignments: string[] = [];
    const params: unknown[] = [input.policyId];
    const fieldMap: Array<[keyof UpdatePurchaseOrderApprovalPolicyInput, string]> = [
      ['policyName', 'policy_name'],
      ['minTotalAmount', 'min_total_amount'],
      ['maxTotalAmount', 'max_total_amount'],
      ['approvalSequence', 'approval_sequence'],
      ['requiredRole', 'required_role'],
      ['isActive', 'is_active'],
      ['notes', 'notes'],
    ];

    for (const [inputKey, column] of fieldMap) {
      if (!Object.hasOwn(input, inputKey)) continue;
      const rawValue = input[inputKey];
      const value =
        inputKey === 'minTotalAmount' || inputKey === 'maxTotalAmount'
          ? rawValue === undefined || rawValue === null
            ? null
            : Number(rawValue)
          : rawValue ?? null;
      params.push(value);
      assignments.push(`${column} = $${params.length}`);
    }

    if (assignments.length === 0) {
      const existing = await db.query(
        `
          SELECT *
          FROM purchase_order_approval_policies
          WHERE id = $1
            AND deleted_at IS NULL
        `,
        [input.policyId]
      );
      return existing.rows[0] ?? null;
    }

    const result = await db.query(
      `
        UPDATE purchase_order_approval_policies
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
