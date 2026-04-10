import {
  getPatientWithEncountersAndSOAP as createPatientReadRepository,
  type PatientWithEncountersAndSOAP,
} from '../repositories/getPatientWithEncountersAndSOAP.ts';

type Queryable = {
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function createGetPatientWithEncountersAndSOAPService(db: Queryable) {
  const repository = createPatientReadRepository(db);

  return async function getPatientWithEncountersAndSOAP(input: {
    clinicId: string;
    medicalRecordNumber: string;
  }): Promise<PatientWithEncountersAndSOAP | null> {
    return repository(input);
  };
}
