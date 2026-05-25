import type { CloseCashierReconciliationInput, CreateCashierReconciliationInput } from '../api/types.ts';

export function listCashierReconciliations(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
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
        FROM cashier_reconciliations
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

export function createCashierReconciliation(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CreateCashierReconciliationInput) {
    const result = await db.query(
      `
        INSERT INTO cashier_reconciliations (
          clinic_id,
          reconciliation_date,
          opening_cash_amount,
          expected_cash_amount,
          opened_by_user_id,
          notes
        )
        VALUES ($1, $2, $3, $3, $4, $5)
        RETURNING *
      `,
      [
        input.clinicId,
        input.reconciliationDate,
        Number(input.openingCashAmount ?? 0),
        input.openedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}

export function closeCashierReconciliation(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CloseCashierReconciliationInput) {
    const reconciliation = await db.query<{
      id: string;
      clinic_id: string;
      reconciliation_date: string;
      opening_cash_amount: string;
    }>(
      `
        SELECT id, clinic_id, reconciliation_date, opening_cash_amount
        FROM cashier_reconciliations
        WHERE id = $1
          AND status = 'open'
          AND deleted_at IS NULL
      `,
      [input.reconciliationId]
    );
    const row = reconciliation.rows[0];
    if (!row) return null;

    const cash = await db.query<{ cash_total: string }>(
      `
        SELECT COALESCE(SUM(p.amount), 0)::text AS cash_total
        FROM invoice_payments p
        JOIN invoices i ON i.id = p.invoice_id
        WHERE i.clinic_id = $1
          AND p.method = 'cash'
          AND p.paid_at >= $2::date
          AND p.paid_at < ($2::date + INTERVAL '1 day')
          AND p.deleted_at IS NULL
          AND i.deleted_at IS NULL
      `,
      [row.clinic_id, row.reconciliation_date]
    );

    const expected = Number(row.opening_cash_amount) + Number(cash.rows[0]?.cash_total ?? 0);
    const counted = Number(input.countedCashAmount);
    const variance = Number((counted - expected).toFixed(2));
    const result = await db.query(
      `
        UPDATE cashier_reconciliations
        SET status = 'closed',
            expected_cash_amount = $2,
            counted_cash_amount = $3,
            variance_amount = $4,
            closed_by_user_id = $5,
            closed_at = now(),
            notes = COALESCE($6, notes)
        WHERE id = $1
        RETURNING *
      `,
      [
        input.reconciliationId,
        Number(expected.toFixed(2)),
        counted,
        variance,
        input.closedByUserId ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}
