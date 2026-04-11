export function createDiagnosis(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    encounterId: string;
    clinicalNoteId?: string | null;
    diagnosisCode?: string | null;
    codingSystem?: string | null;
    diagnosisName: string;
    diagnosisType?: 'working' | 'final' | 'differential' | 'ruled_out';
    status?: 'active' | 'resolved' | 'entered_in_error';
    sequenceNumber?: number | null;
    diagnosedAt?: string | null;
    resolutionNote?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO diagnoses (
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
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), $10, $11)
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
        input.encounterId,
        input.clinicalNoteId ?? null,
        input.diagnosisCode ?? null,
        input.codingSystem ?? null,
        input.diagnosisName,
        input.diagnosisType ?? 'working',
        input.status ?? 'active',
        input.sequenceNumber ?? null,
        input.diagnosedAt ?? null,
        input.resolutionNote ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}
