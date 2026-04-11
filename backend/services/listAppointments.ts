import type { AppointmentStatus } from '../api/types.ts';

export function listAppointments(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    patientId?: string;
    practitionerId?: string;
    status?: AppointmentStatus;
  }) {
    const conditions = ['clinic_id = $1', 'deleted_at IS NULL'];
    const params: unknown[] = [input.clinicId];

    if (input.patientId) {
      params.push(input.patientId);
      conditions.push(`patient_id = $${params.length}`);
    }

    if (input.practitionerId) {
      params.push(input.practitionerId);
      conditions.push(`practitioner_id = $${params.length}`);
    }

    if (input.status) {
      params.push(input.status);
      conditions.push(`status = $${params.length}`);
    }

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
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY scheduled_start_at DESC, created_at DESC
      `,
      params
    );

    return result.rows;
  };
}
