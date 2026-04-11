export function updateDiagnosis(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    diagnosisId: string;
    diagnosisCode?: string | null;
    codingSystem?: string | null;
    diagnosisName?: string;
    diagnosisType?: 'working' | 'final' | 'differential' | 'ruled_out';
    status?: 'active' | 'resolved' | 'entered_in_error';
    sequenceNumber?: number | null;
    diagnosedAt?: string | null;
    resolutionNote?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.diagnosisId];

    if (Object.hasOwn(input, 'diagnosisCode')) {
      params.push(input.diagnosisCode ?? null);
      assignments.push(`diagnosis_code = $${params.length}`);
    }

    if (Object.hasOwn(input, 'codingSystem')) {
      params.push(input.codingSystem ?? null);
      assignments.push(`coding_system = $${params.length}`);
    }

    if (Object.hasOwn(input, 'diagnosisName')) {
      params.push(input.diagnosisName ?? null);
      assignments.push(`diagnosis_name = $${params.length}`);
    }

    if (Object.hasOwn(input, 'diagnosisType')) {
      params.push(input.diagnosisType ?? null);
      assignments.push(`diagnosis_type = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'sequenceNumber')) {
      params.push(input.sequenceNumber ?? null);
      assignments.push(`sequence_number = $${params.length}`);
    }

    if (Object.hasOwn(input, 'diagnosedAt')) {
      params.push(input.diagnosedAt ?? null);
      assignments.push(`diagnosed_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'resolutionNote')) {
      params.push(input.resolutionNote ?? null);
      assignments.push(`resolution_note = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query<{
      id: string;
      diagnosis_name: string;
      diagnosis_type: string;
      status: string;
      updated_at: string;
    }>(
      `
        UPDATE diagnoses
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING
          id,
          encounter_id,
          clinical_note_id,
          diagnosis_code,
          coding_system,
          diagnosis_name,
          diagnosis_type,
          status,
          sequence_number,
          diagnosed_at,
          resolution_note,
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
