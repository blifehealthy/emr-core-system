import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Queryable = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export type PatientEncounterSOAPRow = {
  patient_id: string;
  patient_clinic_id: string;
  medical_record_number: string;
  national_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  sex_at_birth: string;
  phone_number: string | null;
  email: string | null;
  blood_type: string | null;
  patient_notes: string | null;
  patient_created_at: string;
  patient_updated_at: string;
  encounter_id: string | null;
  encounter_number: string | null;
  encounter_patient_id: string | null;
  encounter_status: string | null;
  encounter_class: string | null;
  appointment_id: string | null;
  attending_practitioner_id: string | null;
  chief_complaint: string | null;
  triage_summary: string | null;
  started_at: string | null;
  ended_at: string | null;
  encounter_created_at: string | null;
  encounter_updated_at: string | null;
  clinical_note_id: string | null;
  clinical_note_encounter_id: string | null;
  note_type: string | null;
  clinical_note_status: string | null;
  title: string | null;
  note_text: string | null;
  authored_by_practitioner_id: string | null;
  authored_at: string | null;
  finalized_at: string | null;
  signed_at: string | null;
  amendment_reason: string | null;
  clinical_note_created_at: string | null;
  clinical_note_updated_at: string | null;
  soap_note_clinical_note_id: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  soap_note_created_at: string | null;
  soap_note_updated_at: string | null;
};

export type PatientWithEncountersAndSOAP = {
  id: string;
  clinic_id: string;
  medical_record_number: string;
  national_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  sex_at_birth: string;
  phone_number: string | null;
  email: string | null;
  blood_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  encounters: Array<{
    id: string;
    encounter_number: string;
    patient_id: string;
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
    clinical_notes: Array<{
      id: string;
      encounter_id: string;
      note_type: string;
      status: string;
      title: string | null;
      note_text: string | null;
      authored_by_practitioner_id: string | null;
      authored_at: string | null;
      finalized_at: string | null;
      signed_at: string | null;
      amendment_reason: string | null;
      created_at: string;
      updated_at: string;
      soap_note: null | {
        clinical_note_id: string;
        subjective: string | null;
        objective: string | null;
        assessment: string | null;
        plan: string | null;
        created_at: string | null;
        updated_at: string | null;
      };
    }>;
  }>;
};

const queryText = readFileSync(
  join(process.cwd(), 'backend', 'queries', 'getPatientWithEncountersAndSOAP.sql'),
  'utf8'
);

export function mapPatientWithEncountersAndSOAP(
  rows: PatientEncounterSOAPRow[]
): PatientWithEncountersAndSOAP | null {
  if (rows.length === 0) {
    return null;
  }

  const firstRow = rows[0];
  const patient: PatientWithEncountersAndSOAP = {
    id: firstRow.patient_id,
    clinic_id: firstRow.patient_clinic_id,
    medical_record_number: firstRow.medical_record_number,
    national_id: firstRow.national_id,
    first_name: firstRow.first_name,
    middle_name: firstRow.middle_name,
    last_name: firstRow.last_name,
    preferred_name: firstRow.preferred_name,
    date_of_birth: firstRow.date_of_birth,
    sex_at_birth: firstRow.sex_at_birth,
    phone_number: firstRow.phone_number,
    email: firstRow.email,
    blood_type: firstRow.blood_type,
    notes: firstRow.patient_notes,
    created_at: firstRow.patient_created_at,
    updated_at: firstRow.patient_updated_at,
    encounters: [],
  };

  const encounters = new Map<string, PatientWithEncountersAndSOAP['encounters'][number]>();

  for (const row of rows) {
    if (!row.encounter_id) {
      continue;
    }

    let encounter = encounters.get(row.encounter_id);

    if (!encounter) {
      encounter = {
        id: row.encounter_id,
        encounter_number: row.encounter_number ?? '',
        patient_id: row.encounter_patient_id ?? patient.id,
        status: row.encounter_status ?? 'draft',
        encounter_class: row.encounter_class ?? 'outpatient',
        appointment_id: row.appointment_id,
        attending_practitioner_id: row.attending_practitioner_id,
        chief_complaint: row.chief_complaint,
        triage_summary: row.triage_summary,
        started_at: row.started_at,
        ended_at: row.ended_at,
        created_at: row.encounter_created_at ?? '',
        updated_at: row.encounter_updated_at ?? '',
        clinical_notes: [],
      };

      encounters.set(row.encounter_id, encounter);
      patient.encounters.push(encounter);
    }

    if (!row.clinical_note_id) {
      continue;
    }

    const existingClinicalNote = encounter.clinical_notes.find(
      (clinicalNote) => clinicalNote.id === row.clinical_note_id
    );

    if (existingClinicalNote) {
      continue;
    }

    encounter.clinical_notes.push({
      id: row.clinical_note_id,
      encounter_id: row.clinical_note_encounter_id ?? encounter.id,
      note_type: row.note_type ?? 'other',
      status: row.clinical_note_status ?? 'draft',
      title: row.title,
      note_text: row.note_text,
      authored_by_practitioner_id: row.authored_by_practitioner_id,
      authored_at: row.authored_at,
      finalized_at: row.finalized_at,
      signed_at: row.signed_at,
      amendment_reason: row.amendment_reason,
      created_at: row.clinical_note_created_at ?? '',
      updated_at: row.clinical_note_updated_at ?? '',
      soap_note: row.soap_note_clinical_note_id
        ? {
            clinical_note_id: row.soap_note_clinical_note_id,
            subjective: row.subjective,
            objective: row.objective,
            assessment: row.assessment,
            plan: row.plan,
            created_at: row.soap_note_created_at,
            updated_at: row.soap_note_updated_at,
          }
        : null,
    });
  }

  return patient;
}

export function getPatientWithEncountersAndSOAP(db: Queryable) {
  return async function getPatientWithEncountersAndSOAP(input: {
    clinicId: string;
    medicalRecordNumber: string;
  }) {
    const result = await db.query<PatientEncounterSOAPRow>(queryText, [
      input.clinicId,
      input.medicalRecordNumber,
    ]);

    return mapPatientWithEncountersAndSOAP(result.rows);
  };
}
