import type { CreateInsuranceClaimInput, UpdateInsuranceClaimInput } from '../api/types.ts';

type Db = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function listInsuranceClaims(db: Db) {
  return async function run(input: {
    clinicId: string;
    invoiceId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
    const offset = Math.max(input.offset ?? 0, 0);
    const params: unknown[] = [input.clinicId];
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];
    if (input.invoiceId) {
      params.push(input.invoiceId);
      conditions.push(`invoice_id = $${params.length}`);
    }
    if (input.status) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }
    params.push(limit + 1, offset);
    const result = await db.query(
      `
        SELECT *
        FROM insurance_claims
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY created_at DESC
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

export function createInsuranceClaim(db: Db) {
  return async function run(input: CreateInsuranceClaimInput) {
    const result = await db.query(
      `
        INSERT INTO insurance_claims (
          clinic_id, patient_id, invoice_id, claim_number, status, insurer_name,
          policy_number, approved_amount, paid_amount, submitted_at,
          adjudicated_at, rejection_reason, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
      [
        input.clinicId,
        input.patientId,
        input.invoiceId,
        input.claimNumber,
        input.status ?? 'draft',
        input.insurerName,
        input.policyNumber ?? null,
        input.approvedAmount ?? 0,
        input.paidAmount ?? 0,
        input.submittedAt ?? null,
        input.adjudicatedAt ?? null,
        input.rejectionReason ?? null,
        input.notes ?? null,
      ]
    );
    return result.rows[0];
  };
}

export function updateInsuranceClaim(db: Db) {
  return async function run(input: UpdateInsuranceClaimInput) {
    const result = await db.query(
      `
        UPDATE insurance_claims
        SET status = COALESCE($2::insurance_claim_status, status),
            insurer_name = COALESCE($3, insurer_name),
            policy_number = COALESCE($4, policy_number),
            approved_amount = COALESCE($5, approved_amount),
            paid_amount = COALESCE($6, paid_amount),
            submitted_at = COALESCE($7, submitted_at),
            adjudicated_at = COALESCE($8, adjudicated_at),
            rejection_reason = COALESCE($9, rejection_reason),
            notes = COALESCE($10, notes)
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING *
      `,
      [
        input.insuranceClaimId,
        input.status ?? null,
        input.insurerName ?? null,
        input.policyNumber ?? null,
        input.approvedAmount ?? null,
        input.paidAmount ?? null,
        input.submittedAt ?? null,
        input.adjudicatedAt ?? null,
        input.rejectionReason ?? null,
        input.notes ?? null,
      ]
    );
    return result.rows[0] ?? null;
  };
}
