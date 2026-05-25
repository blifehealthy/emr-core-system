export function getBillingSummaryReport(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; startDate: string; endDate: string }) {
    const result = await db.query(
      `
        WITH invoice_rows AS (
          SELECT *
          FROM invoices
          WHERE clinic_id = $1
            AND COALESCE(issued_at, created_at) >= $2::date
            AND COALESCE(issued_at, created_at) < ($3::date + INTERVAL '1 day')
            AND deleted_at IS NULL
        ),
        payment_rows AS (
          SELECT p.*
          FROM invoice_payments p
          JOIN invoices i ON i.id = p.invoice_id
          WHERE i.clinic_id = $1
            AND p.paid_at >= $2::date
            AND p.paid_at < ($3::date + INTERVAL '1 day')
            AND p.deleted_at IS NULL
            AND i.deleted_at IS NULL
        ),
        refund_rows AS (
          SELECT r.*
          FROM invoice_refunds r
          JOIN invoices i ON i.id = r.invoice_id
          WHERE i.clinic_id = $1
            AND r.refunded_at >= $2::date
            AND r.refunded_at < ($3::date + INTERVAL '1 day')
            AND r.deleted_at IS NULL
            AND i.deleted_at IS NULL
        ),
        claim_rows AS (
          SELECT *
          FROM insurance_claims
          WHERE clinic_id = $1
            AND COALESCE(submitted_at, created_at) >= $2::date
            AND COALESCE(submitted_at, created_at) < ($3::date + INTERVAL '1 day')
            AND deleted_at IS NULL
        )
        SELECT json_build_object(
          'start_date', $2,
          'end_date', $3,
          'invoice_count', (SELECT COUNT(*) FROM invoice_rows),
          'gross_total', (SELECT COALESCE(SUM(subtotal_amount), 0) FROM invoice_rows),
          'discount_total', (SELECT COALESCE(SUM(discount_amount), 0) FROM invoice_rows),
          'tax_total', (SELECT COALESCE(SUM(tax_amount), 0) FROM invoice_rows),
          'net_total', (SELECT COALESCE(SUM(total_amount), 0) FROM invoice_rows),
          'paid_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows),
          'refunded_total', (SELECT COALESCE(SUM(amount), 0) FROM refund_rows),
          'outstanding_total', (SELECT COALESCE(SUM(balance_amount), 0) FROM invoice_rows),
          'cash_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows WHERE method = 'cash'),
          'card_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows WHERE method = 'card'),
          'bank_transfer_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows WHERE method = 'bank_transfer'),
          'qr_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows WHERE method = 'qr'),
          'insurance_payment_total', (SELECT COALESCE(SUM(amount), 0) FROM payment_rows WHERE method = 'insurance'),
          'claim_count', (SELECT COUNT(*) FROM claim_rows),
          'claims_submitted', (SELECT COUNT(*) FROM claim_rows WHERE status = 'submitted'),
          'claims_paid', (SELECT COUNT(*) FROM claim_rows WHERE status = 'paid'),
          'claims_rejected', (SELECT COUNT(*) FROM claim_rows WHERE status = 'rejected'),
          'by_status', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total_amount), 0) AS total_amount
              FROM invoice_rows
              GROUP BY status
              ORDER BY status ASC
            ) t
          ), '[]'::json),
          'by_payment_method', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT method, COUNT(*)::int AS count, COALESCE(SUM(amount), 0) AS total_amount
              FROM payment_rows
              GROUP BY method
              ORDER BY method ASC
            ) t
          ), '[]'::json)
        ) AS report
      `,
      [input.clinicId, input.startDate, input.endDate]
    );

    return (result.rows[0] as { report?: unknown } | undefined)?.report ?? null;
  };
}
