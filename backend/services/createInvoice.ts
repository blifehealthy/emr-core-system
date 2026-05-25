import type { CreateInvoiceInput } from '../api/types.ts';

export function createInvoice(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CreateInvoiceInput) {
    const subtotal = sumLineItems(input.lineItems, (item) => Number(item.quantity) * Number(item.unitPriceAmount));
    const discount = sumLineItems(input.lineItems, (item) => Number(item.discountAmount ?? 0));
    const tax = sumLineItems(input.lineItems, (item) => Number(item.taxAmount ?? 0));
    const total = Math.max(0, subtotal - discount + tax);

    const invoiceResult = await db.query<{ id: string }>(
      `
        INSERT INTO invoices (
          clinic_id,
          patient_id,
          appointment_id,
          visit_id,
          encounter_id,
          invoice_number,
          status,
          currency,
          subtotal_amount,
          discount_amount,
          tax_amount,
          total_amount,
          paid_amount,
          balance_amount,
          issued_at,
          due_at,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0, $12, $13, $14, $15)
        RETURNING id
      `,
      [
        input.clinicId,
        input.patientId,
        input.appointmentId ?? null,
        input.visitId ?? null,
        input.encounterId ?? null,
        input.invoiceNumber,
        input.status ?? 'draft',
        input.currency ?? 'THB',
        subtotal,
        discount,
        tax,
        total,
        input.issuedAt ?? null,
        input.dueAt ?? null,
        input.notes ?? null,
      ]
    );

    const invoiceId = invoiceResult.rows[0].id;

    for (const item of input.lineItems) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPriceAmount);
      const itemDiscount = Number(item.discountAmount ?? 0);
      const itemTax = Number(item.taxAmount ?? 0);
      const lineTotal = Math.max(0, quantity * unitPrice - itemDiscount + itemTax);

      await db.query(
        `
          INSERT INTO invoice_line_items (
            invoice_id,
            item_type,
            description,
            reference_type,
            reference_id,
            quantity,
            unit_price_amount,
            discount_amount,
            tax_amount,
            line_total_amount
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          invoiceId,
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

    return getInvoiceById(db)({ invoiceId });
  };
}

export function getInvoiceById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { invoiceId: string }) {
    const invoice = await db.query(
      `
        SELECT *
        FROM invoices
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.invoiceId]
    );

    if (!invoice.rows[0]) {
      return null;
    }

    const lineItems = await db.query(
      `
        SELECT *
        FROM invoice_line_items
        WHERE invoice_id = $1
          AND deleted_at IS NULL
        ORDER BY created_at ASC
      `,
      [input.invoiceId]
    );
    const payments = await db.query(
      `
        SELECT *
        FROM invoice_payments
        WHERE invoice_id = $1
          AND deleted_at IS NULL
        ORDER BY paid_at DESC, created_at DESC
      `,
      [input.invoiceId]
    );

    return {
      ...(invoice.rows[0] as Record<string, unknown>),
      line_items: lineItems.rows,
      payments: payments.rows,
    };
  };
}

function sumLineItems(
  items: CreateInvoiceInput['lineItems'],
  getValue: (item: CreateInvoiceInput['lineItems'][number]) => number
) {
  return Number(items.reduce((sum, item) => sum + getValue(item), 0).toFixed(2));
}
