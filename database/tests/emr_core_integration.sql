BEGIN;

INSERT INTO organizations (id, code, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'ORG-1', 'Org One');

INSERT INTO clinics (id, organization_id, code, name)
VALUES (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'CLINIC-1',
    'Clinic One'
);

INSERT INTO users (
    id,
    clinic_id,
    username,
    display_name,
    role
)
VALUES (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'doctor.jane',
    'Dr Jane Doe',
    'doctor'
);

INSERT INTO practitioners (
    id,
    clinic_id,
    user_id,
    practitioner_code,
    first_name,
    last_name,
    license_number
)
VALUES (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    'PR-001',
    'Jane',
    'Doe',
    'LIC-001'
);

INSERT INTO patients (
    id,
    clinic_id,
    medical_record_number,
    first_name,
    last_name
)
VALUES (
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000101',
    'MRN-001',
    'Jane',
    'Doe'
);

INSERT INTO encounters (
    id,
    encounter_number,
    patient_id,
    status,
    encounter_class
)
VALUES (
    '00000000-0000-0000-0000-000000002001',
    'ENC-001',
    '00000000-0000-0000-0000-000000001001',
    'draft',
    'outpatient'
);

INSERT INTO clinical_notes (
    id,
    encounter_id,
    note_type,
    status,
    title
)
VALUES (
    '00000000-0000-0000-0000-000000003001',
    '00000000-0000-0000-0000-000000002001',
    'soap',
    'draft',
    'Initial SOAP'
);

INSERT INTO soap_notes (
    clinical_note_id,
    subjective,
    plan
)
VALUES (
    '00000000-0000-0000-0000-000000003001',
    'subjective',
    'plan'
);

INSERT INTO diagnoses (
    id,
    encounter_id,
    clinical_note_id,
    diagnosis_code,
    coding_system,
    diagnosis_name,
    diagnosis_type,
    status,
    sequence_number,
    notes
)
VALUES (
    '00000000-0000-0000-0000-000000004001',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    'J11',
    'ICD-10',
    'Influenza',
    'final',
    'active',
    1,
    'Primary diagnosis'
);

INSERT INTO vital_signs (
    id,
    encounter_id,
    clinical_note_id,
    measured_at,
    body_temperature_c,
    heart_rate_bpm,
    respiratory_rate_bpm,
    systolic_bp_mmhg,
    diastolic_bp_mmhg,
    oxygen_saturation_pct,
    pain_score,
    notes
)
VALUES (
    '00000000-0000-0000-0000-000000005001',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    TIMESTAMPTZ '2026-01-02 08:00:00+00',
    38.2,
    92,
    18,
    118,
    76,
    98.0,
    2,
    'Stable'
);

INSERT INTO prescriptions (
    id,
    encounter_id,
    clinical_note_id,
    prescribed_by_practitioner_id,
    medication_name,
    dosage,
    route,
    frequency,
    duration_text,
    instructions,
    status,
    start_date,
    end_date,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000006001',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    '00000000-0000-0000-0000-000000000301',
    'Paracetamol',
    '500 mg',
    'oral',
    'q6h',
    '5 days',
    'after meals',
    'active',
    DATE '2026-01-02',
    DATE '2026-01-07',
    TIMESTAMPTZ '2026-01-02 09:00:00+00',
    TIMESTAMPTZ '2026-01-02 09:00:00+00'
);

INSERT INTO clinical_notes (
    id,
    encounter_id,
    note_type,
    status,
    title,
    authored_at
)
VALUES (
    '00000000-0000-0000-0000-000000003003',
    '00000000-0000-0000-0000-000000002001',
    'progress',
    'draft',
    'Follow Up',
    TIMESTAMPTZ '2026-01-03 09:00:00+00'
);

INSERT INTO diagnoses (
    id,
    encounter_id,
    clinical_note_id,
    diagnosis_name,
    diagnosis_type,
    status,
    sequence_number,
    diagnosed_at,
    notes
)
VALUES
(
    '00000000-0000-0000-0000-000000004002',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003003',
    'Follow-up diagnosis',
    'working',
    'resolved',
    2,
    TIMESTAMPTZ '2026-01-03 09:05:00+00',
    'Resolved diagnosis'
),
(
    '00000000-0000-0000-0000-000000004003',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    'Additional active diagnosis',
    'working',
    'active',
    3,
    TIMESTAMPTZ '2026-01-03 09:10:00+00',
    'Additional diagnosis'
);

INSERT INTO vital_signs (
    id,
    encounter_id,
    clinical_note_id,
    measured_at,
    body_temperature_c,
    heart_rate_bpm,
    oxygen_saturation_pct,
    pain_score,
    notes
)
VALUES
(
    '00000000-0000-0000-0000-000000005002',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003003',
    TIMESTAMPTZ '2026-01-03 08:00:00+00',
    37.4,
    84,
    99.0,
    1,
    'Improving'
),
(
    '00000000-0000-0000-0000-000000005003',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    TIMESTAMPTZ '2026-01-03 10:00:00+00',
    38.0,
    90,
    97.0,
    3,
    'Recheck'
);

INSERT INTO prescriptions (
    id,
    encounter_id,
    clinical_note_id,
    prescribed_by_practitioner_id,
    medication_name,
    dosage,
    route,
    frequency,
    duration_text,
    instructions,
    status,
    start_date,
    end_date,
    created_at,
    updated_at
)
VALUES
(
    '00000000-0000-0000-0000-000000006002',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003003',
    '00000000-0000-0000-0000-000000000301',
    'Ibuprofen',
    '200 mg',
    'oral',
    'bid',
    '3 days',
    'with food',
    'completed',
    DATE '2026-01-03',
    DATE '2026-01-05',
    TIMESTAMPTZ '2026-01-03 09:30:00+00',
    TIMESTAMPTZ '2026-01-03 09:30:00+00'
),
(
    '00000000-0000-0000-0000-000000006003',
    '00000000-0000-0000-0000-000000002001',
    '00000000-0000-0000-0000-000000003001',
    '00000000-0000-0000-0000-000000000301',
    'Oseltamivir',
    '75 mg',
    'oral',
    'bid',
    '5 days',
    'finish course',
    'active',
    DATE '2026-01-03',
    DATE '2026-01-08',
    TIMESTAMPTZ '2026-01-03 11:00:00+00',
    TIMESTAMPTZ '2026-01-03 11:00:00+00'
);

DO $$
DECLARE
    diagnosis_ids UUID[];
    diagnosis_page_ids UUID[];
    filtered_diagnosis_ids UUID[];
    vital_sign_ids UUID[];
    vital_sign_page_ids UUID[];
    filtered_vital_sign_ids UUID[];
    prescription_ids UUID[];
    prescription_page_ids UUID[];
    filtered_prescription_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id ORDER BY sequence_number ASC NULLS LAST, created_at DESC)
    INTO diagnosis_ids
    FROM diagnoses
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
      AND deleted_at IS NULL;

    IF diagnosis_ids <> ARRAY[
        '00000000-0000-0000-0000-000000004001'::UUID,
        '00000000-0000-0000-0000-000000004002'::UUID,
        '00000000-0000-0000-0000-000000004003'::UUID
    ] THEN
        RAISE EXCEPTION 'expected diagnoses to be ordered by sequence_number then created_at';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY sequence_number ASC NULLS LAST, created_at DESC)
    INTO filtered_diagnosis_ids
    FROM (
        SELECT *
        FROM diagnoses
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
          AND clinical_note_id = '00000000-0000-0000-0000-000000003001'
          AND status = 'active'
        ORDER BY sequence_number ASC NULLS LAST, created_at DESC
    ) q;

    IF filtered_diagnosis_ids <> ARRAY[
        '00000000-0000-0000-0000-000000004001'::UUID,
        '00000000-0000-0000-0000-000000004003'::UUID
    ] THEN
        RAISE EXCEPTION 'expected diagnosis filter by clinical_note_id and status to work';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY sequence_number ASC NULLS LAST, created_at DESC)
    INTO diagnosis_page_ids
    FROM (
        SELECT *
        FROM diagnoses
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
        ORDER BY sequence_number ASC NULLS LAST, created_at DESC
        LIMIT 2 OFFSET 1
    ) q;

    IF diagnosis_page_ids <> ARRAY[
        '00000000-0000-0000-0000-000000004002'::UUID,
        '00000000-0000-0000-0000-000000004003'::UUID
    ] THEN
        RAISE EXCEPTION 'expected diagnosis pagination to respect limit and offset';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY measured_at DESC, created_at DESC)
    INTO vital_sign_ids
    FROM vital_signs
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
      AND deleted_at IS NULL;

    IF vital_sign_ids <> ARRAY[
        '00000000-0000-0000-0000-000000005003'::UUID,
        '00000000-0000-0000-0000-000000005002'::UUID,
        '00000000-0000-0000-0000-000000005001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected vital signs to be ordered by measured_at desc then created_at';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY measured_at DESC, created_at DESC)
    INTO filtered_vital_sign_ids
    FROM (
        SELECT *
        FROM vital_signs
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
          AND clinical_note_id = '00000000-0000-0000-0000-000000003001'
        ORDER BY measured_at DESC, created_at DESC
    ) q;

    IF filtered_vital_sign_ids <> ARRAY[
        '00000000-0000-0000-0000-000000005003'::UUID,
        '00000000-0000-0000-0000-000000005001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected vital sign filter by clinical_note_id to work';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY measured_at DESC, created_at DESC)
    INTO vital_sign_page_ids
    FROM (
        SELECT *
        FROM vital_signs
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
        ORDER BY measured_at DESC, created_at DESC
        LIMIT 2 OFFSET 1
    ) q;

    IF vital_sign_page_ids <> ARRAY[
        '00000000-0000-0000-0000-000000005002'::UUID,
        '00000000-0000-0000-0000-000000005001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected vital sign pagination to respect limit and offset';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY created_at DESC)
    INTO prescription_ids
    FROM prescriptions
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
      AND deleted_at IS NULL;

    IF prescription_ids <> ARRAY[
        '00000000-0000-0000-0000-000000006003'::UUID,
        '00000000-0000-0000-0000-000000006002'::UUID,
        '00000000-0000-0000-0000-000000006001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected prescriptions to be ordered by created_at desc';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY created_at DESC)
    INTO filtered_prescription_ids
    FROM (
        SELECT *
        FROM prescriptions
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
          AND clinical_note_id = '00000000-0000-0000-0000-000000003001'
          AND status = 'active'
        ORDER BY created_at DESC
    ) q;

    IF filtered_prescription_ids <> ARRAY[
        '00000000-0000-0000-0000-000000006003'::UUID,
        '00000000-0000-0000-0000-000000006001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected prescription filter by clinical_note_id and status to work';
    END IF;

    SELECT ARRAY_AGG(id ORDER BY created_at DESC)
    INTO prescription_page_ids
    FROM (
        SELECT *
        FROM prescriptions
        WHERE encounter_id = '00000000-0000-0000-0000-000000002001'
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 2 OFFSET 1
    ) q;

    IF prescription_page_ids <> ARRAY[
        '00000000-0000-0000-0000-000000006002'::UUID,
        '00000000-0000-0000-0000-000000006001'::UUID
    ] THEN
        RAISE EXCEPTION 'expected prescription pagination to respect limit and offset';
    END IF;
END $$;

DO $$
BEGIN
    BEGIN
        INSERT INTO clinical_notes (
            id,
            encounter_id,
            note_type,
            status,
            title
        )
        VALUES (
            '00000000-0000-0000-0000-000000003002',
            '00000000-0000-0000-0000-000000002001',
            'progress',
            'draft',
            'Progress Note'
        );

        INSERT INTO soap_notes (
            clinical_note_id,
            subjective
        )
        VALUES (
            '00000000-0000-0000-0000-000000003002',
            'should fail'
        );

        RAISE EXCEPTION 'expected soap note type enforcement to reject non-soap note';
    EXCEPTION
        WHEN OTHERS THEN
            IF POSITION('note_type = soap' IN SQLERRM) = 0 THEN
                RAISE;
            END IF;
    END;
END $$;

DO $$
BEGIN
    BEGIN
        INSERT INTO soap_notes (clinical_note_id)
        VALUES ('00000000-0000-0000-0000-000000003001');

        RAISE EXCEPTION 'expected soap note content check to reject empty content';
    EXCEPTION
        WHEN unique_violation THEN
            NULL;
        WHEN check_violation THEN
            NULL;
    END;
END $$;

DO $$
DECLARE
    patient_row RECORD;
BEGIN
    UPDATE diagnoses
    SET deleted_at = NOW()
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001';

    UPDATE vital_signs
    SET deleted_at = NOW()
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001';

    UPDATE soap_notes
    SET deleted_at = NOW()
    WHERE clinical_note_id = '00000000-0000-0000-0000-000000003001';

    UPDATE prescriptions
    SET deleted_at = NOW()
    WHERE encounter_id = '00000000-0000-0000-0000-000000002001';

    SELECT *
    INTO patient_row
    FROM (
        SELECT sn.clinical_note_id AS soap_note_clinical_note_id
             , d.id AS diagnosis_id
             , vs.id AS vital_sign_id
             , pr.id AS prescription_id
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
        LEFT JOIN diagnoses d
            ON d.encounter_id = e.id
           AND d.deleted_at IS NULL
        LEFT JOIN vital_signs vs
            ON vs.encounter_id = e.id
           AND vs.deleted_at IS NULL
        LEFT JOIN prescriptions pr
            ON pr.encounter_id = e.id
           AND pr.deleted_at IS NULL
        WHERE p.clinic_id = '00000000-0000-0000-0000-000000000101'
          AND p.medical_record_number = 'MRN-001'
          AND p.deleted_at IS NULL
    ) q;

    IF patient_row.soap_note_clinical_note_id IS NOT NULL THEN
        RAISE EXCEPTION 'expected soft-deleted soap note to be excluded from patient read query';
    END IF;

    IF patient_row.diagnosis_id IS NOT NULL THEN
        RAISE EXCEPTION 'expected soft-deleted diagnosis to be excluded from patient read query';
    END IF;

    IF patient_row.vital_sign_id IS NOT NULL THEN
        RAISE EXCEPTION 'expected soft-deleted vital sign to be excluded from patient read query';
    END IF;

    IF patient_row.prescription_id IS NOT NULL THEN
        RAISE EXCEPTION 'expected soft-deleted prescription to be excluded from patient read query';
    END IF;
END $$;

DO $$
DECLARE
    actor_row RECORD;
BEGIN
    SELECT
        u.id AS user_id,
        u.role,
        p.id AS practitioner_id
    INTO actor_row
    FROM users u
    LEFT JOIN practitioners p
        ON p.user_id = u.id
       AND p.deleted_at IS NULL
       AND p.is_active = TRUE
    WHERE u.id = '00000000-0000-0000-0000-000000000201'
      AND u.deleted_at IS NULL
      AND u.is_active = TRUE;

    IF actor_row.user_id IS NULL THEN
        RAISE EXCEPTION 'expected active user to be readable for actor resolution';
    END IF;

    IF actor_row.role <> 'doctor' THEN
        RAISE EXCEPTION 'expected resolved actor role to be doctor';
    END IF;

    IF actor_row.practitioner_id <> '00000000-0000-0000-0000-000000000301' THEN
        RAISE EXCEPTION 'expected linked practitioner to be returned for actor resolution';
    END IF;
END $$;

ROLLBACK;
