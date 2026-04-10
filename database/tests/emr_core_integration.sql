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
    UPDATE soap_notes
    SET deleted_at = NOW()
    WHERE clinical_note_id = '00000000-0000-0000-0000-000000003001';

    SELECT *
    INTO patient_row
    FROM (
        SELECT sn.clinical_note_id AS soap_note_clinical_note_id
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
        WHERE p.clinic_id = '00000000-0000-0000-0000-000000000101'
          AND p.medical_record_number = 'MRN-001'
          AND p.deleted_at IS NULL
    ) q;

    IF patient_row.soap_note_clinical_note_id IS NOT NULL THEN
        RAISE EXCEPTION 'expected soft-deleted soap note to be excluded from patient read query';
    END IF;
END $$;

ROLLBACK;
