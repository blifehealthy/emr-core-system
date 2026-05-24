export function getEncounterById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { encounterId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          patient_id,
          encounter_number,
          status,
          encounter_class,
          appointment_id,
          attending_practitioner_id,
          chief_complaint,
          triage_summary,
          started_at,
          ended_at,
          created_at,
          updated_at,
          deleted_at
        FROM encounters
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.encounterId]
    );

    return result.rows[0] ?? null;
  };
}
