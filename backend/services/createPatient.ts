import type { PatientSexAtBirth } from '../api/types.ts';

export function createPatient(db: {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
}) {
  return async function run(input: {
    clinicId: string;
    medicalRecordNumber: string;
    nationalId?: string | null;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    preferredName?: string | null;
    dateOfBirth?: string | null;
    sexAtBirth?: PatientSexAtBirth;
    phoneNumber?: string | null;
    email?: string | null;
    bloodType?: string | null;
    notes?: string | null;
  }) {
    const result = await db.query(
      `
        INSERT INTO patients (
          clinic_id,
          medical_record_number,
          national_id,
          first_name,
          middle_name,
          last_name,
          preferred_name,
          date_of_birth,
          sex_at_birth,
          phone_number,
          email,
          blood_type,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING
          id,
          clinic_id,
          medical_record_number,
          national_id,
          first_name,
          middle_name,
          last_name,
          preferred_name,
          date_of_birth,
          sex_at_birth,
          phone_number,
          email,
          blood_type,
          notes,
          created_at,
          updated_at,
          deleted_at
      `,
      [
        input.clinicId,
        input.medicalRecordNumber,
        input.nationalId ?? null,
        input.firstName,
        input.middleName ?? null,
        input.lastName,
        input.preferredName ?? null,
        input.dateOfBirth ?? null,
        input.sexAtBirth ?? 'unknown',
        input.phoneNumber ?? null,
        input.email ?? null,
        input.bloodType ?? null,
        input.notes ?? null,
      ]
    );

    return result.rows[0];
  };
}
