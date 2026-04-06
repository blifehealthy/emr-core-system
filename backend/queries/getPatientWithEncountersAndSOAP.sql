SELECT
    p.id AS patient_id,
    p.clinic_id AS patient_clinic_id,
    p.medical_record_number,
    p.national_id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.preferred_name,
    p.date_of_birth,
    p.sex_at_birth,
    p.phone_number,
    p.email,
    p.blood_type,
    p.notes AS patient_notes,
    p.created_at AS patient_created_at,
    p.updated_at AS patient_updated_at,

    e.id AS encounter_id,
    e.encounter_number,
    e.patient_id AS encounter_patient_id,
    e.status AS encounter_status,
    e.encounter_class,
    e.appointment_id,
    e.attending_practitioner_id,
    e.chief_complaint,
    e.triage_summary,
    e.started_at,
    e.ended_at,
    e.created_at AS encounter_created_at,
    e.updated_at AS encounter_updated_at,

    cn.id AS clinical_note_id,
    cn.encounter_id AS clinical_note_encounter_id,
    cn.note_type,
    cn.status AS clinical_note_status,
    cn.title,
    cn.note_text,
    cn.authored_by_practitioner_id,
    cn.authored_at,
    cn.finalized_at,
    cn.signed_at,
    cn.amendment_reason,
    cn.created_at AS clinical_note_created_at,
    cn.updated_at AS clinical_note_updated_at,

    sn.clinical_note_id AS soap_note_clinical_note_id,
    sn.subjective,
    sn.objective,
    sn.assessment,
    sn.plan,
    sn.created_at AS soap_note_created_at,
    sn.updated_at AS soap_note_updated_at
FROM patients p
LEFT JOIN encounters e
    ON e.patient_id = p.id
   AND e.deleted_at IS NULL
LEFT JOIN clinical_notes cn
    ON cn.encounter_id = e.id
   AND cn.deleted_at IS NULL
LEFT JOIN soap_notes sn
    ON sn.clinical_note_id = cn.id
   AND sn.deleted_at IS NULL
WHERE p.clinic_id = $1
  AND p.medical_record_number = $2
  AND p.deleted_at IS NULL
ORDER BY e.created_at DESC NULLS LAST,
         cn.created_at DESC NULLS LAST;
