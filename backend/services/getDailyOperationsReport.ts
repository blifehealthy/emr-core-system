export function getDailyOperationsReport(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { clinicId: string; startDate: string; endDate: string }) {
    const result = await db.query(
      `
        WITH visit_rows AS (
          SELECT *
          FROM clinic_visits
          WHERE clinic_id = $1
            AND checked_in_at >= $2::date
            AND checked_in_at < ($3::date + INTERVAL '1 day')
            AND deleted_at IS NULL
        ),
        diagnosis_rows AS (
          SELECT d.*
          FROM diagnoses d
          JOIN encounters e ON e.id = d.encounter_id
          WHERE e.patient_id IN (SELECT patient_id FROM visit_rows)
            AND d.diagnosed_at >= $2::date
            AND d.diagnosed_at < ($3::date + INTERVAL '1 day')
            AND d.deleted_at IS NULL
        ),
        prescription_rows AS (
          SELECT p.*
          FROM prescriptions p
          JOIN encounters e ON e.id = p.encounter_id
          WHERE e.patient_id IN (SELECT patient_id FROM visit_rows)
            AND p.created_at >= $2::date
            AND p.created_at < ($3::date + INTERVAL '1 day')
            AND p.deleted_at IS NULL
        )
        SELECT json_build_object(
          'start_date', $2,
          'end_date', $3,
          'visits_total', (SELECT COUNT(*) FROM visit_rows),
          'waiting', (SELECT COUNT(*) FROM visit_rows WHERE status = 'waiting'),
          'in_room', (SELECT COUNT(*) FROM visit_rows WHERE status = 'in_room'),
          'with_doctor', (SELECT COUNT(*) FROM visit_rows WHERE status = 'with_doctor'),
          'completed', (SELECT COUNT(*) FROM visit_rows WHERE status = 'completed'),
          'discharged', (SELECT COUNT(*) FROM visit_rows WHERE status = 'discharged'),
          'cancelled', (SELECT COUNT(*) FROM visit_rows WHERE status = 'cancelled'),
          'diagnoses_total', (SELECT COUNT(*) FROM diagnosis_rows),
          'prescriptions_total', (SELECT COUNT(*) FROM prescription_rows),
          'by_practitioner', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT practitioner_id, COUNT(*)::int AS visits
              FROM visit_rows
              GROUP BY practitioner_id
              ORDER BY visits DESC
            ) t
          ), '[]'::json),
          'by_room', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT room_name, COUNT(*)::int AS visits
              FROM visit_rows
              GROUP BY room_name
              ORDER BY visits DESC
            ) t
          ), '[]'::json),
          'top_diagnoses', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT diagnosis_name, COUNT(*)::int AS count
              FROM diagnosis_rows
              GROUP BY diagnosis_name
              ORDER BY count DESC, diagnosis_name ASC
              LIMIT 10
            ) t
          ), '[]'::json),
          'by_prescriber', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
              SELECT prescribed_by_practitioner_id, COUNT(*)::int AS prescriptions
              FROM prescription_rows
              GROUP BY prescribed_by_practitioner_id
              ORDER BY prescriptions DESC
            ) t
          ), '[]'::json)
        ) AS report
      `,
      [input.clinicId, input.startDate, input.endDate]
    );

    return (result.rows[0] as { report?: unknown } | undefined)?.report ?? null;
  };
}
