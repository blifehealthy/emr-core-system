import type { VoidInvoiceInput } from '../api/types.ts';
import { getInvoiceById } from './createInvoice.ts';

export function voidInvoice(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: VoidInvoiceInput) {
    const result = await db.query<{ id: string }>(
      `
        UPDATE invoices
        SET status = 'voided',
            void_reason = $2,
            balance_amount = 0
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING id
      `,
      [input.invoiceId, input.voidReason]
    );

    if (!result.rows[0]) {
      return null;
    }

    return getInvoiceById(db)({ invoiceId: input.invoiceId });
  };
}
