import type { RecordInvoicePaymentInput } from '../api/types.ts';
import { getInvoiceById } from './createInvoice.ts';

export function recordInvoicePayment(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: RecordInvoicePaymentInput) {
    await db.query(
      `
        INSERT INTO invoice_payments (
          invoice_id,
          payment_number,
          method,
          amount,
          paid_at,
          received_by_user_id,
          reference_number,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        input.invoiceId,
        input.paymentNumber,
        input.method,
        input.amount,
        input.paidAt ?? new Date().toISOString(),
        input.receivedByUserId ?? null,
        input.referenceNumber ?? null,
        input.notes ?? null,
      ]
    );

    const totals = await db.query<{ total_amount: string; paid_amount: string }>(
      `
        SELECT
          i.total_amount,
          COALESCE(SUM(p.amount) FILTER (WHERE p.deleted_at IS NULL), 0) AS paid_amount
        FROM invoices i
        LEFT JOIN invoice_payments p ON p.invoice_id = i.id
        WHERE i.id = $1
          AND i.deleted_at IS NULL
        GROUP BY i.id
      `,
      [input.invoiceId]
    );

    if (!totals.rows[0]) {
      return null;
    }

    const totalAmount = Number(totals.rows[0].total_amount);
    const paidAmount = Number(totals.rows[0].paid_amount);
    const balanceAmount = Math.max(0, totalAmount - paidAmount);
    const status = balanceAmount <= 0 ? 'paid' : 'partially_paid';

    await db.query(
      `
        UPDATE invoices
        SET paid_amount = $2,
            balance_amount = $3,
            status = $4
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.invoiceId, paidAmount, balanceAmount, status]
    );

    return getInvoiceById(db)({ invoiceId: input.invoiceId });
  };
}
