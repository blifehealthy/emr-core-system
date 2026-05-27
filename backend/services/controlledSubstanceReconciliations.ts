import type {
  ApproveControlledSubstanceReconciliationInput,
  CloseControlledSubstanceReconciliationInput,
  CreateControlledSubstanceReconciliationInput,
} from '../api/types.ts';

type Queryable = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export class ControlledSubstanceReconciliationApprovalError extends Error {}

export function listControlledSubstanceReconciliations(db: Queryable) {
  return async function run(input: {
    clinicId: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];

    if (input.status) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM controlled_substance_reconciliations
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY reconciliation_date DESC, created_at DESC
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

export function createControlledSubstanceReconciliation(db: Queryable) {
  return async function run(input: CreateControlledSubstanceReconciliationInput) {
    const expected = await db.query<{
      controlled_item_count: string;
      expected_quantity: string;
    }>(
      `
        SELECT
          COUNT(*)::text AS controlled_item_count,
          COALESCE(SUM(quantity_on_hand), 0)::text AS expected_quantity
        FROM inventory_items
        WHERE clinic_id = $1
          AND is_controlled_substance IS TRUE
          AND deleted_at IS NULL
          AND is_active IS TRUE
      `,
      [input.clinicId]
    );
    const snapshot = expected.rows[0] ?? { controlled_item_count: '0', expected_quantity: '0' };

    const result = await db.query(
      `
        INSERT INTO controlled_substance_reconciliations (
          clinic_id,
          reconciliation_date,
          controlled_item_count,
          expected_quantity,
          opened_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        input.clinicId,
        input.reconciliationDate,
        Number(snapshot.controlled_item_count),
        Number(snapshot.expected_quantity),
        input.openedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function closeControlledSubstanceReconciliation(db: Queryable) {
  return async function run(input: CloseControlledSubstanceReconciliationInput) {
    const reconciliation = await db.query<{
      id: string;
      expected_quantity: string;
    }>(
      `
        SELECT id, expected_quantity
        FROM controlled_substance_reconciliations
        WHERE id = $1
          AND status = 'open'
          AND deleted_at IS NULL
      `,
      [input.reconciliationId]
    );
    const row = reconciliation.rows[0];
    if (!row) return null;

    const counted = Number(input.countedQuantity);
    const expected = Number(row.expected_quantity);
    const variance = Number((counted - expected).toFixed(2));
    const status = variance === 0 ? 'closed' : 'pending_approval';
    const result = await db.query(
      `
        UPDATE controlled_substance_reconciliations
        SET status = $7,
            counted_quantity = $2,
            variance_quantity = $3,
            variance_reason = $4,
            closed_by_user_id = $5,
            closed_at = now(),
            notes = COALESCE($6, notes)
        WHERE id = $1
        RETURNING *
      `,
      [
        input.reconciliationId,
        counted,
        variance,
        input.varianceReason ?? null,
        input.closedByUserId ?? null,
        input.notes ?? null,
        status,
      ]
    );

    return result.rows[0] ?? null;
  };
}

export function approveControlledSubstanceReconciliation(db: Queryable) {
  return async function run(input: ApproveControlledSubstanceReconciliationInput) {
    const pending = await db.query<{
      id: string;
      closed_by_user_id: string | null;
    }>(
      `
        SELECT id, closed_by_user_id
        FROM controlled_substance_reconciliations
        WHERE id = $1
          AND status = 'pending_approval'
          AND deleted_at IS NULL
      `,
      [input.reconciliationId]
    );
    const row = pending.rows[0];
    if (!row) return null;

    if (input.approvedByUserId && row.closed_by_user_id === input.approvedByUserId) {
      throw new ControlledSubstanceReconciliationApprovalError(
        'Controlled substance reconciliation approver must be different from closer'
      );
    }

    const result = await db.query(
      `
        UPDATE controlled_substance_reconciliations
        SET status = 'closed',
            approved_by_user_id = $2,
            approved_at = now(),
            approval_note = $3,
            updated_at = now()
        WHERE id = $1
          AND status = 'pending_approval'
          AND deleted_at IS NULL
        RETURNING *
      `,
      [input.reconciliationId, input.approvedByUserId ?? null, input.approvalNote ?? null]
    );

    return result.rows[0] ?? null;
  };
}
