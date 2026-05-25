import type { CreateBillingNumberSequenceInput, IssueBillingNumberInput } from '../api/types.ts';

export function listBillingNumberSequences(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string }) {
    const result = await db.query(
      `
        SELECT *
        FROM billing_number_sequences
        WHERE clinic_id = $1
          AND deleted_at IS NULL
        ORDER BY document_type ASC, created_at DESC
      `,
      [input.clinicId]
    );

    return result.rows;
  };
}

export function createBillingNumberSequence(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: CreateBillingNumberSequenceInput) {
    const result = await db.query(
      `
        INSERT INTO billing_number_sequences (
          clinic_id,
          document_type,
          prefix,
          next_number,
          padding,
          is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        input.clinicId,
        input.documentType,
        input.prefix,
        input.nextNumber ?? 1,
        input.padding ?? 6,
        input.isActive ?? true,
      ]
    );

    return result.rows[0];
  };
}

export function issueBillingNumber(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: IssueBillingNumberInput) {
    const sequence = await db.query<{
      id: string;
      prefix: string;
      next_number: number;
      padding: number;
    }>(
      `
        SELECT id, prefix, next_number, padding
        FROM billing_number_sequences
        WHERE clinic_id = $1
          AND document_type = $2
          AND is_active = TRUE
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [input.clinicId, input.documentType]
    );

    const row = sequence.rows[0];
    if (!row) return null;

    const documentNumber = `${row.prefix}${String(row.next_number).padStart(row.padding, '0')}`;
    await db.query(
      `
        UPDATE billing_number_sequences
        SET next_number = next_number + 1
        WHERE id = $1
      `,
      [row.id]
    );

    return { documentNumber };
  };
}
