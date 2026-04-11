INSERT INTO organizations (id, code, name)
VALUES ('10000000-0000-0000-0000-000000000001', 'ORG-SMOKE', 'Smoke Org');

INSERT INTO clinics (id, organization_id, code, name)
VALUES (
    '10000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    'CLINIC-SMOKE',
    'Smoke Clinic'
);

INSERT INTO users (
    id,
    clinic_id,
    username,
    display_name,
    role
)
VALUES (
    '10000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000101',
    'doctor.smoke',
    'Dr Smoke',
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
    '10000000-0000-0000-0000-000000000301',
    '10000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000201',
    'PR-SMOKE',
    'Smoke',
    'Doctor',
    'LIC-SMOKE'
);

INSERT INTO patients (
    id,
    clinic_id,
    medical_record_number,
    first_name,
    last_name
)
VALUES (
    '10000000-0000-0000-0000-000000001001',
    '10000000-0000-0000-0000-000000000101',
    'MRN-SMOKE-001',
    'Jane',
    'Smoke'
);

INSERT INTO encounters (
    id,
    encounter_number,
    patient_id,
    status,
    encounter_class,
    started_at
)
VALUES (
    '10000000-0000-0000-0000-000000002001',
    'ENC-SMOKE-001',
    '10000000-0000-0000-0000-000000001001',
    'in_progress',
    'outpatient',
    TIMESTAMPTZ '2026-01-02 08:00:00+00'
);

INSERT INTO clinical_notes (
    id,
    encounter_id,
    note_type,
    status,
    title,
    authored_by_practitioner_id,
    authored_at
)
VALUES
(
    '10000000-0000-0000-0000-000000003001',
    '10000000-0000-0000-0000-000000002001',
    'soap',
    'draft',
    'Initial SOAP',
    '10000000-0000-0000-0000-000000000301',
    TIMESTAMPTZ '2026-01-02 08:05:00+00'
),
(
    '10000000-0000-0000-0000-000000003002',
    '10000000-0000-0000-0000-000000002001',
    'progress',
    'draft',
    'Follow Up',
    '10000000-0000-0000-0000-000000000301',
    TIMESTAMPTZ '2026-01-03 09:00:00+00'
);

INSERT INTO soap_notes (
    clinical_note_id,
    subjective,
    objective,
    assessment,
    plan
)
VALUES (
    '10000000-0000-0000-0000-000000003001',
    'Fever and cough',
    'Temp 38.2 C',
    'Influenza',
    'Supportive care'
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
    created_at,
    updated_at
)
VALUES
(
    '10000000-0000-0000-0000-000000004001',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    'Influenza',
    'final',
    'active',
    1,
    TIMESTAMPTZ '2026-01-02 08:10:00+00',
    TIMESTAMPTZ '2026-01-02 08:10:00+00',
    TIMESTAMPTZ '2026-01-02 08:10:00+00'
),
(
    '10000000-0000-0000-0000-000000004002',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003002',
    'Resolved fever',
    'working',
    'resolved',
    2,
    TIMESTAMPTZ '2026-01-03 09:05:00+00',
    TIMESTAMPTZ '2026-01-03 09:05:00+00',
    TIMESTAMPTZ '2026-01-03 09:05:00+00'
),
(
    '10000000-0000-0000-0000-000000004003',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    'Cough',
    'working',
    'active',
    3,
    TIMESTAMPTZ '2026-01-03 09:10:00+00',
    TIMESTAMPTZ '2026-01-03 09:10:00+00',
    TIMESTAMPTZ '2026-01-03 09:10:00+00'
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
    notes,
    created_at,
    updated_at
)
VALUES
(
    '10000000-0000-0000-0000-000000005001',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    TIMESTAMPTZ '2026-01-02 08:00:00+00',
    38.2,
    92,
    98.0,
    2,
    'Initial vitals',
    TIMESTAMPTZ '2026-01-02 08:00:00+00',
    TIMESTAMPTZ '2026-01-02 08:00:00+00'
),
(
    '10000000-0000-0000-0000-000000005002',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003002',
    TIMESTAMPTZ '2026-01-03 08:00:00+00',
    37.4,
    84,
    99.0,
    1,
    'Improving',
    TIMESTAMPTZ '2026-01-03 08:00:00+00',
    TIMESTAMPTZ '2026-01-03 08:00:00+00'
),
(
    '10000000-0000-0000-0000-000000005003',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    TIMESTAMPTZ '2026-01-03 10:00:00+00',
    38.0,
    90,
    97.0,
    3,
    'Recheck',
    TIMESTAMPTZ '2026-01-03 10:00:00+00',
    TIMESTAMPTZ '2026-01-03 10:00:00+00'
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
    '10000000-0000-0000-0000-000000006001',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    '10000000-0000-0000-0000-000000000301',
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
),
(
    '10000000-0000-0000-0000-000000006002',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003002',
    '10000000-0000-0000-0000-000000000301',
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
    '10000000-0000-0000-0000-000000006003',
    '10000000-0000-0000-0000-000000002001',
    '10000000-0000-0000-0000-000000003001',
    '10000000-0000-0000-0000-000000000301',
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
