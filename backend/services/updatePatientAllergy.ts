import type { AllergySeverity, AllergyStatus } from '../api/types.ts';

export function updatePatientAllergy(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    allergyId: string;
    allergenName?: string;
    allergenCategory?: string | null;
    reaction?: string | null;
    severity?: AllergySeverity;
    status?: AllergyStatus;
    criticality?: string | null;
    recordedAt?: string | null;
    lastOccurrenceAt?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.allergyId];

    if (Object.hasOwn(input, 'allergenName')) {
      params.push(input.allergenName ?? null);
      assignments.push(`allergen_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'allergenCategory')) {
      params.push(input.allergenCategory ?? null);
      assignments.push(`allergen_category = $${params.length}`);
    }

    if (Object.hasOwn(input, 'reaction')) {
      params.push(input.reaction ?? null);
      assignments.push(`reaction = $${params.length}`);
    }

    if (Object.hasOwn(input, 'severity')) {
      params.push(input.severity ?? null);
      assignments.push(`severity = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'criticality')) {
      params.push(input.criticality ?? null);
      assignments.push(`criticality = $${params.length}`);
    }

    if (Object.hasOwn(input, 'recordedAt')) {
      params.push(input.recordedAt ?? null);
      assignments.push(`recorded_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'lastOccurrenceAt')) {
      params.push(input.lastOccurrenceAt ?? null);
      assignments.push(`last_occurrence_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE patient_allergies
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
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
      params
    );

    return result.rows[0] ?? null;
  };
}
