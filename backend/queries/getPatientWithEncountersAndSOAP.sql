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
    pf.patient_flags,

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
    sn.updated_at AS soap_note_updated_at,

    d.id AS diagnosis_id,
    d.encounter_id AS diagnosis_encounter_id,
    d.clinical_note_id AS diagnosis_clinical_note_id,
    d.diagnosis_code,
    d.coding_system,
    d.diagnosis_name,
    d.diagnosis_type,
    d.status AS diagnosis_status,
    d.sequence_number,
    d.diagnosed_at,
    d.resolution_note,
    d.notes AS diagnosis_notes,
    d.created_at AS diagnosis_created_at,
    d.updated_at AS diagnosis_updated_at,

    vs.id AS vital_sign_id,
    vs.encounter_id AS vital_sign_encounter_id,
    vs.clinical_note_id AS vital_sign_clinical_note_id,
    vs.measured_at,
    vs.measured_by_practitioner_id,
    vs.body_temperature_c,
    vs.heart_rate_bpm,
    vs.respiratory_rate_bpm,
    vs.systolic_bp_mmhg,
    vs.diastolic_bp_mmhg,
    vs.oxygen_saturation_pct,
    vs.weight_kg,
    vs.height_cm,
    vs.bmi,
    vs.pain_score,
    vs.notes AS vital_sign_notes,
    vs.created_at AS vital_sign_created_at,
    vs.updated_at AS vital_sign_updated_at,

    pr.id AS prescription_id,
    pr.encounter_id AS prescription_encounter_id,
    pr.clinical_note_id AS prescription_clinical_note_id,
    pr.prescribed_by_practitioner_id,
    pr.medication_name,
    pr.rxnorm_code,
    pr.dosage,
    pr.route,
    pr.frequency,
    pr.duration_text,
    pr.instructions AS prescription_instructions,
    pr.status AS prescription_status,
    pr.start_date AS prescription_start_date,
    pr.end_date AS prescription_end_date,
    pr.created_at AS prescription_created_at,
    pr.updated_at AS prescription_updated_at
FROM patients p
LEFT JOIN LATERAL (
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', patient_flags.id,
                'patient_id', patient_flags.patient_id,
                'flag_type', patient_flags.flag_type,
                'label', patient_flags.label,
                'description', patient_flags.description,
                'severity', patient_flags.severity,
                'status', patient_flags.status,
                'source', patient_flags.source,
                'starts_at', patient_flags.starts_at,
                'ends_at', patient_flags.ends_at,
                'created_by_user_id', patient_flags.created_by_user_id,
                'notes', patient_flags.notes,
                'created_at', patient_flags.created_at,
                'updated_at', patient_flags.updated_at,
                'deleted_at', patient_flags.deleted_at
            )
            ORDER BY
                CASE patient_flags.severity
                    WHEN 'critical' THEN 0
                    WHEN 'caution' THEN 1
                    ELSE 2
                END,
                patient_flags.created_at DESC
        ),
        '[]'::jsonb
    ) AS patient_flags
    FROM patient_flags
    WHERE patient_flags.patient_id = p.id
      AND patient_flags.deleted_at IS NULL
      AND patient_flags.status = 'active'
) pf ON TRUE
LEFT JOIN encounters e
    ON e.patient_id = p.id
   AND e.deleted_at IS NULL
LEFT JOIN clinical_notes cn
    ON cn.encounter_id = e.id
   AND cn.deleted_at IS NULL
LEFT JOIN soap_notes sn
    ON sn.clinical_note_id = cn.id
   AND sn.deleted_at IS NULL
LEFT JOIN diagnoses d
    ON d.encounter_id = e.id
   AND d.deleted_at IS NULL
LEFT JOIN vital_signs vs
    ON vs.encounter_id = e.id
   AND vs.deleted_at IS NULL
LEFT JOIN prescriptions pr
    ON pr.encounter_id = e.id
   AND pr.deleted_at IS NULL
WHERE p.clinic_id = $1
  AND p.medical_record_number = $2
  AND p.deleted_at IS NULL
ORDER BY e.created_at DESC NULLS LAST,
         cn.created_at DESC NULLS LAST,
         d.sequence_number ASC NULLS LAST,
         d.created_at DESC NULLS LAST,
         vs.measured_at DESC NULLS LAST,
         pr.created_at DESC NULLS LAST;
