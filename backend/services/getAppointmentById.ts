export function getAppointmentById(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: { appointmentId: string }) {
    const result = await db.query(
      `
        SELECT
          id,
          clinic_id,
          patient_id,
          practitioner_id,
          appointment_number,
          status,
          scheduled_start_at,
          scheduled_end_at,
          reason,
          notes,
          created_at,
          updated_at,
          deleted_at
        FROM appointments
        WHERE id = $1
          AND deleted_at IS NULL
      `,
      [input.appointmentId]
    );

    return result.rows[0] ?? null;
  };
}
