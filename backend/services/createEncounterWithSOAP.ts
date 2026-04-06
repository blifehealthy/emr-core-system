export function createEncounterWithSOAP(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function createEncounterWithSOAP(input: {
    patientId: string;
    encounterNumber: string;
    status?: 'draft' | 'in_progress' | 'completed' | 'signed' | 'cancelled';
    encounterClass?: 'outpatient' | 'inpatient' | 'emergency' | 'other';
    appointmentId?: string | null;
    attendingPractitionerId?: string | null;
    chiefComplaint?: string | null;
    triageSummary?: string | null;
    startedAt?: string | null;
    endedAt?: string | null;
    title?: string | null;
    noteText?: string | null;
    authoredByPractitionerId?: string | null;
    authoredAt?: string | null;
    subjective?: string | null;
    objective?: string | null;
    assessment?: string | null;
    plan?: string | null;
  }) {
    await db.query('BEGIN');

    try {
      const encounterResult = await db.query<{
        id: string;
        patient_id: string;
        encounter_number: string;
        status: string;
        encounter_class: string;
        appointment_id: string | null;
        attending_practitioner_id: string | null;
        chief_complaint: string | null;
        triage_summary: string | null;
        started_at: string | null;
        ended_at: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `
          INSERT INTO encounters (
            patient_id,
            encounter_number,
            status,
            encounter_class,
            appointment_id,
            attending_practitioner_id,
            chief_complaint,
            triage_summary,
            started_at,
            ended_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `,
        [
          input.patientId,
          input.encounterNumber,
          input.status ?? 'draft',
          input.encounterClass ?? 'outpatient',
          input.appointmentId ?? null,
          input.attendingPractitionerId ?? null,
          input.chiefComplaint ?? null,
          input.triageSummary ?? null,
          input.startedAt ?? null,
          input.endedAt ?? null,
        ]
      );

      const encounter = encounterResult.rows[0];

      const clinicalNoteResult = await db.query<{
        id: string;
        encounter_id: string;
        note_type: string;
        status: string;
        title: string | null;
        note_text: string | null;
        authored_by_practitioner_id: string | null;
        authored_at: string;
        finalized_at: string | null;
        signed_at: string | null;
        amendment_reason: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `
          INSERT INTO clinical_notes (
            encounter_id,
            note_type,
            status,
            title,
            note_text,
            authored_by_practitioner_id,
            authored_at
          )
          VALUES ($1, 'soap', 'draft', $2, $3, $4, COALESCE($5, NOW()))
          RETURNING *
        `,
        [
          encounter.id,
          input.title ?? null,
          input.noteText ?? null,
          input.authoredByPractitionerId ?? null,
          input.authoredAt ?? null,
        ]
      );

      const clinicalNote = clinicalNoteResult.rows[0];

      const soapNoteResult = await db.query<{
        clinical_note_id: string;
        subjective: string | null;
        objective: string | null;
        assessment: string | null;
        plan: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `
          INSERT INTO soap_notes (
            clinical_note_id,
            subjective,
            objective,
            assessment,
            plan
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
        [
          clinicalNote.id,
          input.subjective ?? null,
          input.objective ?? null,
          input.assessment ?? null,
          input.plan ?? null,
        ]
      );

      const soapNote = soapNoteResult.rows[0];

      await db.query('COMMIT');

      return {
        encounter,
        clinical_note: clinicalNote,
        soap_note: soapNote,
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  };
}
