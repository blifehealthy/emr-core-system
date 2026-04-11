import type { AppointmentStatus } from '../api/types.ts';

export function updateAppointment(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    appointmentId: string;
    practitionerId?: string | null;
    status?: AppointmentStatus;
    scheduledStartAt?: string;
    scheduledEndAt?: string | null;
    reason?: string | null;
    notes?: string | null;
  }) {
    const assignments: string[] = [];
    const params: unknown[] = [input.appointmentId];

    if (Object.hasOwn(input, 'practitionerId')) {
      params.push(input.practitionerId ?? null);
      assignments.push(`practitioner_id = $${params.length}`);
    }

    if (Object.hasOwn(input, 'status')) {
      params.push(input.status ?? null);
      assignments.push(`status = $${params.length}`);
    }

    if (Object.hasOwn(input, 'scheduledStartAt')) {
      params.push(input.scheduledStartAt ?? null);
      assignments.push(`scheduled_start_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'scheduledEndAt')) {
      params.push(input.scheduledEndAt ?? null);
      assignments.push(`scheduled_end_at = $${params.length}`);
    }

    if (Object.hasOwn(input, 'reason')) {
      params.push(input.reason ?? null);
      assignments.push(`reason = $${params.length}`);
    }

    if (Object.hasOwn(input, 'notes')) {
      params.push(input.notes ?? null);
      assignments.push(`notes = $${params.length}`);
    }

    const result = await db.query(
      `
        UPDATE appointments
        SET ${assignments.join(',\n            ')}
        WHERE id = $1
          AND deleted_at IS NULL
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
      params
    );

    return result.rows[0] ?? null;
  };
}
