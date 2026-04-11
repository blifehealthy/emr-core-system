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
    const result = await db.query<{
      id: string;
      diagnosis_name: string;
      diagnosis_type: string;
      status: string;
      updated_at: string;
    }>(
      `
        UPDATE diagnoses
        SET diagnosis_code = COALESCE($2, diagnosis_code),
            coding_system = COALESCE($3, coding_system),
            diagnosis_name = COALESCE($4, diagnosis_name),
            diagnosis_type = COALESCE($5, diagnosis_type),
            status = COALESCE($6, status),
            sequence_number = COALESCE($7, sequence_number),
            diagnosed_at = COALESCE($8, diagnosed_at),
            resolution_note = COALESCE($9, resolution_note),
            notes = COALESCE($10, notes)
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
      [
        input.diagnosisId,
        input.diagnosisCode ?? null,
        input.codingSystem ?? null,
        input.diagnosisName ?? null,
        input.diagnosisType ?? null,
        input.status ?? null,
        input.sequenceNumber ?? null,
        input.diagnosedAt ?? null,
        input.resolutionNote ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0] ?? null;
  };
}
