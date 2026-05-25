import test from 'node:test';
import assert from 'node:assert/strict';
import { assessPrescriptionSafety } from './assessPrescriptionSafety.ts';

test('assessPrescriptionSafety returns allergy warnings from catalog tags', async () => {
  const service = assessPrescriptionSafety({
    async query<T>(sql: string) {
      if (sql.includes('FROM patient_allergies')) {
        return {
          rows: [
            {
              id: 'allergy-1',
              allergen_name: 'Penicillin',
              reaction: 'rash',
              severity: 'severe',
              criticality: 'high',
            },
          ] as T[],
        };
      }

      return {
        rows: [
          {
            id: 'drug-1',
            medication_name: 'Amoxicillin',
            generic_name: 'amoxicillin',
            rxnorm_code: 'RX-1',
            allergen_tags: ['penicillin'],
          },
        ] as T[],
      };
    },
  });

  const result = await service({
    patientId: 'patient-1',
    medicationName: 'Amoxicillin',
    rxnormCode: 'RX-1',
  });

  assert.equal(result.drugCatalogId, 'drug-1');
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].severity, 'critical');
  assert.equal(result.warnings[0].allergenName, 'Penicillin');
});
