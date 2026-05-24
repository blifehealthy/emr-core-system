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
  patient_flags: PatientFlagRow[] | string | null;
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
  diagnosis_id: string | null;
  diagnosis_encounter_id: string | null;
  diagnosis_clinical_note_id: string | null;
  diagnosis_code: string | null;
  coding_system: string | null;
  diagnosis_name: string | null;
  diagnosis_type: string | null;
  diagnosis_status: string | null;
  sequence_number: number | null;
  diagnosed_at: string | null;
  resolution_note: string | null;
  diagnosis_notes: string | null;
  diagnosis_created_at: string | null;
  diagnosis_updated_at: string | null;
  vital_sign_id: string | null;
  vital_sign_encounter_id: string | null;
  vital_sign_clinical_note_id: string | null;
  measured_at: string | null;
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
  vital_sign_notes: string | null;
  vital_sign_created_at: string | null;
  vital_sign_updated_at: string | null;
  prescription_id: string | null;
  prescription_encounter_id: string | null;
  prescription_clinical_note_id: string | null;
  prescribed_by_practitioner_id: string | null;
  medication_name: string | null;
  rxnorm_code: string | null;
  dosage: string | null;
  route: string | null;
  frequency: string | null;
  duration_text: string | null;
  prescription_instructions: string | null;
  prescription_status: string | null;
  prescription_start_date: string | null;
  prescription_end_date: string | null;
  prescription_created_at: string | null;
  prescription_updated_at: string | null;
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
  flags: PatientFlagRow[];
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
    diagnoses: Array<{
      id: string;
      encounter_id: string;
      clinical_note_id: string | null;
      diagnosis_code: string | null;
      coding_system: string | null;
      diagnosis_name: string;
      diagnosis_type: string;
      status: string;
      sequence_number: number | null;
      diagnosed_at: string | null;
      resolution_note: string | null;
      notes: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
    vital_signs: Array<{
      id: string;
      encounter_id: string;
      clinical_note_id: string | null;
      measured_at: string | null;
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
      created_at: string | null;
      updated_at: string | null;
    }>;
    prescriptions: Array<{
      id: string;
      encounter_id: string;
      clinical_note_id: string | null;
      prescribed_by_practitioner_id: string | null;
      medication_name: string;
      rxnorm_code: string | null;
      dosage: string | null;
      route: string | null;
      frequency: string | null;
      duration_text: string | null;
      instructions: string | null;
      status: string;
      start_date: string | null;
      end_date: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
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

export type PatientFlagRow = {
  id: string;
  patient_id: string;
  flag_type: string;
  label: string;
  description: string | null;
  severity: string;
  status: string;
  source: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_by_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
    flags: parsePatientFlags(firstRow.patient_flags),
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
        diagnoses: [],
        vital_signs: [],
        prescriptions: [],
        clinical_notes: [],
      };

      encounters.set(row.encounter_id, encounter);
      patient.encounters.push(encounter);
    }

    if (
      row.diagnosis_id &&
      !encounter.diagnoses.find((diagnosis) => diagnosis.id === row.diagnosis_id)
    ) {
      encounter.diagnoses.push({
        id: row.diagnosis_id,
        encounter_id: row.diagnosis_encounter_id ?? encounter.id,
        clinical_note_id: row.diagnosis_clinical_note_id,
        diagnosis_code: row.diagnosis_code,
        coding_system: row.coding_system,
        diagnosis_name: row.diagnosis_name ?? '',
        diagnosis_type: row.diagnosis_type ?? 'working',
        status: row.diagnosis_status ?? 'active',
        sequence_number: row.sequence_number,
        diagnosed_at: row.diagnosed_at,
        resolution_note: row.resolution_note,
        notes: row.diagnosis_notes,
        created_at: row.diagnosis_created_at,
        updated_at: row.diagnosis_updated_at,
      });
    }

    if (
      row.vital_sign_id &&
      !encounter.vital_signs.find((vitalSign) => vitalSign.id === row.vital_sign_id)
    ) {
      encounter.vital_signs.push({
        id: row.vital_sign_id,
        encounter_id: row.vital_sign_encounter_id ?? encounter.id,
        clinical_note_id: row.vital_sign_clinical_note_id,
        measured_at: row.measured_at,
        measured_by_practitioner_id: row.measured_by_practitioner_id,
        body_temperature_c: row.body_temperature_c,
        heart_rate_bpm: row.heart_rate_bpm,
        respiratory_rate_bpm: row.respiratory_rate_bpm,
        systolic_bp_mmhg: row.systolic_bp_mmhg,
        diastolic_bp_mmhg: row.diastolic_bp_mmhg,
        oxygen_saturation_pct: row.oxygen_saturation_pct,
        weight_kg: row.weight_kg,
        height_cm: row.height_cm,
        bmi: row.bmi,
        pain_score: row.pain_score,
        notes: row.vital_sign_notes,
        created_at: row.vital_sign_created_at,
        updated_at: row.vital_sign_updated_at,
      });
    }

    if (
      row.prescription_id &&
      !encounter.prescriptions.find((prescription) => prescription.id === row.prescription_id)
    ) {
      encounter.prescriptions.push({
        id: row.prescription_id,
        encounter_id: row.prescription_encounter_id ?? encounter.id,
        clinical_note_id: row.prescription_clinical_note_id,
        prescribed_by_practitioner_id: row.prescribed_by_practitioner_id,
        medication_name: row.medication_name ?? '',
        rxnorm_code: row.rxnorm_code,
        dosage: row.dosage,
        route: row.route,
        frequency: row.frequency,
        duration_text: row.duration_text,
        instructions: row.prescription_instructions,
        status: row.prescription_status ?? 'active',
        start_date: row.prescription_start_date,
        end_date: row.prescription_end_date,
        created_at: row.prescription_created_at,
        updated_at: row.prescription_updated_at,
      });
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

function parsePatientFlags(flags: PatientEncounterSOAPRow['patient_flags']): PatientFlagRow[] {
  if (!flags) {
    return [];
  }

  if (Array.isArray(flags)) {
    return flags;
  }

  const parsed = JSON.parse(flags) as PatientFlagRow[];
  return Array.isArray(parsed) ? parsed : [];
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
