import type { CreateInvoiceInput, UpdateInvoiceInput } from '../api/types.ts';
import { getInvoiceById } from './createInvoice.ts';

export function updateInvoice(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: UpdateInvoiceInput) {
    const current = await db.query<{ id: string; status: string; payment_count: string; refund_count: string }>(
      `
        SELECT
          i.id,
          i.status,
          COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) AS payment_count,
          COUNT(DISTINCT r.id) FILTER (WHERE r.deleted_at IS NULL) AS refund_count
        FROM invoices i
        LEFT JOIN invoice_payments p ON p.invoice_id = i.id
        LEFT JOIN invoice_refunds r ON r.invoice_id = i.id
        WHERE i.id = $1
          AND i.deleted_at IS NULL
        GROUP BY i.id
      `,
      [input.invoiceId]
    );
    if (!current.rows[0]) return null;
    if (current.rows[0].status === 'voided') return null;
    if (input.lineItems && (Number(current.rows[0].payment_count) > 0 || Number(current.rows[0].refund_count) > 0)) {
      throw new Error('Invoice line items cannot be changed after payments or refunds');
    }

    let subtotal: number | null = null;
    let discount: number | null = null;
    let tax: number | null = null;
    let total: number | null = null;
    if (input.lineItems) {
      subtotal = sumLineItems(input.lineItems, (item) => Number(item.quantity) * Number(item.unitPriceAmount));
      discount = sumLineItems(input.lineItems, (item) => Number(item.discountAmount ?? 0));
      tax = sumLineItems(input.lineItems, (item) => Number(item.taxAmount ?? 0));
      total = Math.max(0, subtotal - discount + tax);
      await db.query(
        `
          UPDATE invoice_line_items
          SET deleted_at = now()
          WHERE invoice_id = $1
            AND deleted_at IS NULL
        `,
        [input.invoiceId]
      );
      for (const item of input.lineItems) {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPriceAmount);
        const itemDiscount = Number(item.discountAmount ?? 0);
        const itemTax = Number(item.taxAmount ?? 0);
        const lineTotal = Math.max(0, quantity * unitPrice - itemDiscount + itemTax);
        await db.query(
          `
            INSERT INTO invoice_line_items (
              invoice_id, item_type, description, reference_type, reference_id,
              quantity, unit_price_amount, discount_amount, tax_amount, line_total_amount
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `,
          [
            input.invoiceId,
            item.itemType ?? 'other',
            item.description,
            item.referenceType ?? null,
            item.referenceId ?? null,
            quantity,
            unitPrice,
            itemDiscount,
            itemTax,
            lineTotal,
          ]
        );
      }
    }

    await db.query(
      `
        UPDATE invoices
        SET status = COALESCE($2::invoice_status, status),
            receipt_number = COALESCE($3, receipt_number),
            tax_invoice_number = COALESCE($4, tax_invoice_number),
            receipt_issued_at = COALESCE($5, receipt_issued_at),
            notes = COALESCE($6, notes),
            subtotal_amount = COALESCE($7, subtotal_amount),
            discount_amount = COALESCE($8, discount_amount),
            tax_amount = COALESCE($9, tax_amount),
            total_amount = COALESCE($10, total_amount),
            balance_amount = CASE
              WHEN $10::numeric IS NULL THEN balance_amount
              ELSE GREATEST(0, $10::numeric - paid_amount)
            END
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [
        input.invoiceId,
        input.status ?? null,
        input.receiptNumber ?? null,
        input.taxInvoiceNumber ?? null,
        input.receiptIssuedAt ?? null,
        input.notes ?? null,
        subtotal,
        discount,
        tax,
        total,
      ]
    );

    return getInvoiceById(db)({ invoiceId: input.invoiceId });
  };
}

function sumLineItems(
  items: CreateInvoiceInput['lineItems'],
  getValue: (item: CreateInvoiceInput['lineItems'][number]) => number
) {
  return Number(items.reduce((sum, item) => sum + getValue(item), 0).toFixed(2));
}
