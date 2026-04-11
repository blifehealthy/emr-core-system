export function getPatientTimeline(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    patientId: string;
    limit?: number;
  }) {
    const result = await db.query<{
      id: string;
      entity_type: string;
      entity_id: string;
      action: string;
      actor_user_id: string | null;
      actor_practitioner_id: string | null;
      metadata: Record<string, unknown>;
      created_at: string;
    }>(
      `
        SELECT DISTINCT al.*
        FROM audit_logs al
        LEFT JOIN encounters e
          ON al.entity_type = 'encounter'
         AND al.entity_id = e.id
        LEFT JOIN clinical_notes cn
          ON (
               (al.entity_type = 'clinical_note' AND al.entity_id = cn.id)
            OR (al.entity_type = 'soap_note' AND al.entity_id = cn.id)
          )
        LEFT JOIN diagnoses d
          ON al.entity_type = 'diagnosis'
         AND al.entity_id = d.id
        LEFT JOIN vital_signs vs
          ON al.entity_type = 'vital_sign'
         AND al.entity_id = vs.id
        WHERE e.patient_id = $1
           OR cn.encounter_id IN (
                SELECT id FROM encounters WHERE patient_id = $1
           )
           OR d.encounter_id IN (
                SELECT id FROM encounters WHERE patient_id = $1
           )
           OR vs.encounter_id IN (
                SELECT id FROM encounters WHERE patient_id = $1
           )
        ORDER BY al.created_at DESC
        LIMIT $2
      `,
      [input.patientId, input.limit ?? 100]
    );

    return result.rows;
  };
}
