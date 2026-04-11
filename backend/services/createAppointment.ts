import type { AppointmentStatus } from '../api/types.ts';

export function createAppointment(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    patientId: string;
    practitionerId?: string | null;
    appointmentNumber: string;
    status?: AppointmentStatus;
    scheduledStartAt: string;
    scheduledEndAt?: string | null;
    reason?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO appointments (
          clinic_id,
          patient_id,
          practitioner_id,
          appointment_number,
          status,
          scheduled_start_at,
          scheduled_end_at,
          reason,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
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
      `,
      [
        input.clinicId,
        input.patientId,
        input.practitionerId ?? null,
        input.appointmentNumber,
        input.status ?? 'pending',
        input.scheduledStartAt,
        input.scheduledEndAt ?? null,
        input.reason ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}
