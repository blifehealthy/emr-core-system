import type { ClinicVisitStatus } from '../api/types.ts';

export function createClinicVisit(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    patientId: string;
    appointmentId?: string | null;
    practitionerId?: string | null;
    visitNumber: string;
    status?: ClinicVisitStatus;
    queueLabel?: string | null;
    roomName?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO clinic_visits (
          clinic_id,
          patient_id,
          appointment_id,
          practitioner_id,
          visit_number,
          status,
          queue_label,
          room_name,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.clinicId,
        input.patientId,
        input.appointmentId ?? null,
        input.practitionerId ?? null,
        input.visitNumber,
        input.status ?? 'waiting',
        input.queueLabel ?? null,
        input.roomName ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}
