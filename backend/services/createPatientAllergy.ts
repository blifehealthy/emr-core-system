import type { AllergySeverity, AllergyStatus } from '../api/types.ts';

export function createPatientAllergy(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    allergenName: string;
    allergenCategory?: string | null;
    reaction?: string | null;
    severity?: AllergySeverity;
    status?: AllergyStatus;
    criticality?: string | null;
    recordedAt?: string | null;
    lastOccurrenceAt?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO patient_allergies (
          patient_id,
          allergen_name,
          allergen_category,
          reaction,
          severity,
          status,
          criticality,
          recorded_at,
          last_occurrence_at,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()), $9, $10)
        RETURNING
          id,
          patient_id,
          allergen_name,
          allergen_category,
          reaction,
          severity,
          status,
          criticality,
          recorded_at,
          last_occurrence_at,
          notes,
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.patientId,
        input.allergenName,
        input.allergenCategory ?? null,
        input.reaction ?? null,
        input.severity ?? 'unknown',
        input.status ?? 'active',
        input.criticality ?? null,
        input.recordedAt ?? null,
        input.lastOccurrenceAt ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}
