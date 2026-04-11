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
    diagnoses?: Array<{
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
    }>;
    vitalSigns?: Array<{
      clinicalNoteId?: string | null;
      measuredAt?: string | null;
      measuredByPractitionerId?: string | null;
      bodyTemperatureC?: number | string | null;
      heartRateBpm?: number | null;
      respiratoryRateBpm?: number | null;
      systolicBpMmhg?: number | null;
      diastolicBpMmhg?: number | null;
      oxygenSaturationPct?: number | string | null;
      weightKg?: number | string | null;
      heightCm?: number | string | null;
      bmi?: number | string | null;
      painScore?: number | null;
      notes?: string | null;
    }>;
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

      const diagnoses = [];

      for (const diagnosisInput of input.diagnoses ?? []) {
        const diagnosisResult = await db.query<{
          id: string;
          encounter_id: string;
          clinical_note_id: string | null;
          diagnosis_code: string | null;
          coding_system: string | null;
          diagnosis_name: string;
          diagnosis_type: string;
          status: string;
          sequence_number: number | null;
          diagnosed_at: string;
          resolution_note: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        }>(
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
            RETURNING *
          `,
          [
            encounter.id,
            diagnosisInput.clinicalNoteId ?? clinicalNote.id,
            diagnosisInput.diagnosisCode ?? null,
            diagnosisInput.codingSystem ?? null,
            diagnosisInput.diagnosisName,
            diagnosisInput.diagnosisType ?? 'working',
            diagnosisInput.status ?? 'active',
            diagnosisInput.sequenceNumber ?? null,
            diagnosisInput.diagnosedAt ?? null,
            diagnosisInput.resolutionNote ?? null,
            diagnosisInput.notes ?? null,
          ]
        );

        diagnoses.push(diagnosisResult.rows[0]);
      }

      const vitalSigns = [];

      for (const vitalSignInput of input.vitalSigns ?? []) {
        const vitalSignResult = await db.query<{
          id: string;
          encounter_id: string;
          clinical_note_id: string | null;
          measured_at: string;
          measured_by_practitioner_id: string | null;
          body_temperature_c: string | number | null;
          heart_rate_bpm: number | null;
          respiratory_rate_bpm: number | null;
          systolic_bp_mmhg: number | null;
          diastolic_bp_mmhg: number | null;
          oxygen_saturation_pct: string | number | null;
          weight_kg: string | number | null;
          height_cm: string | number | null;
          bmi: string | number | null;
          pain_score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        }>(
          `
            INSERT INTO vital_signs (
              encounter_id,
              clinical_note_id,
              measured_at,
              measured_by_practitioner_id,
              body_temperature_c,
              heart_rate_bpm,
              respiratory_rate_bpm,
              systolic_bp_mmhg,
              diastolic_bp_mmhg,
              oxygen_saturation_pct,
              weight_kg,
              height_cm,
              bmi,
              pain_score,
              notes
            )
            VALUES ($1, $2, COALESCE($3, NOW()), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
          `,
          [
            encounter.id,
            vitalSignInput.clinicalNoteId ?? clinicalNote.id,
            vitalSignInput.measuredAt ?? null,
            vitalSignInput.measuredByPractitionerId ?? null,
            vitalSignInput.bodyTemperatureC ?? null,
            vitalSignInput.heartRateBpm ?? null,
            vitalSignInput.respiratoryRateBpm ?? null,
            vitalSignInput.systolicBpMmhg ?? null,
            vitalSignInput.diastolicBpMmhg ?? null,
            vitalSignInput.oxygenSaturationPct ?? null,
            vitalSignInput.weightKg ?? null,
            vitalSignInput.heightCm ?? null,
            vitalSignInput.bmi ?? null,
            vitalSignInput.painScore ?? null,
            vitalSignInput.notes ?? null,
          ]
        );

        vitalSigns.push(vitalSignResult.rows[0]);
      }

      await db.query('COMMIT');

      return {
        encounter,
        clinical_note: clinicalNote,
        soap_note: soapNote,
        diagnoses,
        vital_signs: vitalSigns,
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  };
}
