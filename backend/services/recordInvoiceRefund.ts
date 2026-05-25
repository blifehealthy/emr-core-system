import type { RecordInvoiceRefundInput } from '../api/types.ts';
import { getInvoiceById } from './createInvoice.ts';

export function recordInvoiceRefund(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: RecordInvoiceRefundInput) {
    await db.query(
      `
        INSERT INTO invoice_refunds (
          invoice_id,
          refund_number,
          method,
          amount,
          refunded_at,
          refunded_by_user_id,
          reference_number,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        input.invoiceId,
        input.refundNumber,
        input.method,
        input.amount,
        input.refundedAt ?? new Date().toISOString(),
        input.refundedByUserId ?? null,
        input.referenceNumber ?? null,
        input.notes ?? null,
      ]
    );

    const totals = await db.query<{
      total_amount: string;
      paid_amount: string;
      refunded_amount: string;
    }>(
      `
        SELECT
          i.total_amount,
          COALESCE(payments.paid_amount, 0) AS paid_amount,
          COALESCE(refunds.refunded_amount, 0) AS refunded_amount
        FROM invoices i
        LEFT JOIN (
          SELECT invoice_id, SUM(amount) AS paid_amount
          FROM invoice_payments
          WHERE deleted_at IS NULL
          GROUP BY invoice_id
        ) payments ON payments.invoice_id = i.id
        LEFT JOIN (
          SELECT invoice_id, SUM(amount) AS refunded_amount
          FROM invoice_refunds
          WHERE deleted_at IS NULL
          GROUP BY invoice_id
        ) refunds ON refunds.invoice_id = i.id
        WHERE i.id = $1
          AND i.deleted_at IS NULL
      `,
      [input.invoiceId]
    );

    if (!totals.rows[0]) {
      return null;
    }

    const totalAmount = Number(totals.rows[0].total_amount);
    const paidAmount = Number(totals.rows[0].paid_amount);
    const refundedAmount = Number(totals.rows[0].refunded_amount);
    const netPaidAmount = Math.max(0, paidAmount - refundedAmount);
    const balanceAmount = Math.max(0, totalAmount - netPaidAmount);
    const status = balanceAmount <= 0 ? 'paid' : 'partially_paid';

    await db.query(
      `
        UPDATE invoices
        SET paid_amount = $2,
            refunded_amount = $3,
            balance_amount = $4,
            status = CASE WHEN status = 'voided' THEN status ELSE $5::invoice_status END
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.invoiceId, netPaidAmount, refundedAmount, balanceAmount, status]
    );

    return getInvoiceById(db)({ invoiceId: input.invoiceId });
  };
}
